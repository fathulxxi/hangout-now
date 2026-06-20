'use client'

import {
  useActionState,
  useState,
  useEffect,
  useTransition,
  useSyncExternalStore,
  useCallback,
  useRef,
} from 'react'
import { joinGroup } from '@/app/actions/member'
import { setAvailability, clearAvailability } from '@/app/actions/availability'
import { createClient } from '@/lib/supabase/client'

interface MemberData {
  token: string
  memberId: string
  name: string
}

const noopSubscribe = () => () => {}

export default function GroupPage({
  group,
  members,
}: {
  group: { id: string; slug: string }
  members: Array<{
    id: string
    name: string
    availability: Array<{ id: string; free_until: string; created_at: string }>
  }>
}) {
  const [copied, setCopied] = useState(false)
  const storageKey = `hangout-member-${group.id}`
  const origin = useSyncExternalStore(
    noopSubscribe,
    () => globalThis.location.origin,
    () => '',
  )

  const cache = useRef<{ raw: string | null | undefined; parsed: MemberData | null }>({
    raw: undefined,
    parsed: null,
  })

  const storedMember = useSyncExternalStore(
    noopSubscribe,
    useCallback(() => {
      const raw = localStorage.getItem(storageKey)
      if (raw === cache.current.raw) return cache.current.parsed
      cache.current.raw = raw
      if (!raw) {
        cache.current.parsed = null
        return null
      }
      try {
        cache.current.parsed = JSON.parse(raw)
        return cache.current.parsed
      } catch {
        cache.current.parsed = null
        return null
      }
    }, [storageKey]),
    () => null,
  )

  const [joinedMember, setJoinedMember] = useState<MemberData | null>(null)
  const member = joinedMember ?? storedMember

  const handleJoin = async (prevState: unknown, formData: FormData) => {
    const result = await joinGroup(prevState, formData)
    if ('token' in result) {
      const newMember = {
        token: result.token,
        memberId: result.memberId,
        name: result.name,
      }
      localStorage.setItem(storageKey, JSON.stringify(newMember))
      setJoinedMember(newMember)
    }
    return result
  }

  const [actionState, formAction, pending] = useActionState(handleJoin, null)

  const handleCopyLink = async () => {
    const url = `${origin}/group/${group.slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- Availability UI state ---
  // realtimeAvailability holds live updates keyed by member ID; null means
  // "use the server-provided data from the members prop".
  const [realtimeAvailability, setRealtimeAvailability] = useState<
    Record<string, Array<{ id: string; free_until: string; created_at: string }>> | null
  >(null)
  const [isPending, startTransition] = useTransition()

  // Merge server-provided members with any real-time overrides
  const liveMembers = realtimeAvailability
    ? members.map((m) => ({
        ...m,
        availability: realtimeAvailability[m.id] ?? [],
      }))
    : members

  const fetchAvailability = useCallback(async () => {
    const memberIds = members.map((m) => m.id)
    const supabase = createClient()
    const { data } = await supabase
      .from('availability')
      .select('id, member_id, free_until, created_at')
      .in('member_id', memberIds)

    if (data) {
      const grouped: Record<
        string,
        Array<{ id: string; free_until: string; created_at: string }>
      > = {}
      for (const mid of memberIds) {
        grouped[mid] = []
      }
      for (const a of data) {
        if (grouped[a.member_id]) {
          grouped[a.member_id].push({
            id: a.id,
            free_until: a.free_until,
            created_at: a.created_at,
          })
        }
      }
      setRealtimeAvailability(grouped)
    }
    setNow(new Date())
  }, [members])

  // Real-time subscription to availability changes
  useEffect(() => {
    if (!member) return

    const memberIds = members.map((m) => m.id)
    const supabase = createClient()

    const channel = supabase
      .channel('availability-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'availability' },
        async (payload) => {
          const changedMemberId =
            (payload.new && typeof payload.new === 'object' && 'member_id' in payload.new
              ? (payload.new as { member_id: string }).member_id
              : null) ??
            (payload.old && typeof payload.old === 'object' && 'member_id' in payload.old
              ? (payload.old as { member_id: string }).member_id
              : null)

          if (changedMemberId && !memberIds.includes(changedMemberId)) return

          await fetchAvailability()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [member, members, fetchAvailability])

  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!member) return
    const interval = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [member])

  if (member) {
    const currentUser = liveMembers.find((m) => m.id === member.memberId)
    const currentAvailability = currentUser?.availability?.find(
      (a) => new Date(a.free_until) > now,
    )

    // Free members: anyone with a future free_until
    const freeMembers = liveMembers.filter((m) =>
      m.availability?.some((a) => new Date(a.free_until) > now),
    )

    // Match detection: 2+ members free at the same time
    const hasMatch = freeMembers.length >= 2

    // Build time slot options
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 0)

    const relativeSlots: Array<{ label: string; time: Date }> = []
    for (const hours of [1, 2, 3]) {
      const t = new Date(now.getTime() + hours * 60 * 60 * 1000)
      if (t < endOfToday) {
        relativeSlots.push({ label: `In ${hours} hour${hours > 1 ? 's' : ''}`, time: t })
      }
    }

    const specificHours = [17, 20, 22] // 5 PM, 8 PM, 10 PM
    const specificSlots: Array<{ label: string; time: Date }> = []
    for (const h of specificHours) {
      const t = new Date()
      t.setHours(h, 0, 0, 0)
      if (t > now) {
        const label = `Until ${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`
        specificSlots.push({ label, time: t })
      }
    }

    const handleSetAvailability = (freeUntil: Date) => {
      startTransition(async () => {
        await setAvailability(member.memberId, member.token, freeUntil.toISOString())
        await fetchAvailability()
      })
    }

    const handleClearAvailability = () => {
      startTransition(async () => {
        await clearAvailability(member.memberId, member.token)
        await fetchAvailability()
      })
    }

    const formatFreeUntil = (freeUntilStr: string) => {
      const freeUntil = new Date(freeUntilStr)
      const diffMs = freeUntil.getTime() - now.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

      if (diffHours >= 1) {
        const hourLabel = diffHours > 1 ? 'hours' : 'hour'
        const minSuffix = diffMins > 0 ? ` ${diffMins}m` : ''
        return `free for ${diffHours} more ${hourLabel}${minSuffix}`
      }
      return `free for ${diffMins} more min${diffMins === 1 ? '' : 's'}`
    }

    const formatTime = (dateStr: string) => {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })
    }

    return (
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Hey, {member.name}!
          </h1>
          <p className="mt-1 text-lg text-zinc-600 dark:text-zinc-400">
            {currentAvailability
              ? `You’re free until ${formatTime(currentAvailability.free_until)}`
              : "Let your friends know you’re free"}
          </p>
        </div>

        {/* Match banner */}
        {hasMatch && (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 dark:bg-emerald-900/20 dark:border-emerald-800">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Match! {freeMembers.length} people are free right now
            </p>
          </div>
        )}

        {/* Availability controls */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Set your availability
          </h2>

          {/* Free Now button */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSetAvailability(endOfToday)}
            className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-950"
          >
            {isPending ? 'Updating...' : 'Free Now (rest of today)'}
          </button>

          {/* Time slots */}
          {(relativeSlots.length > 0 || specificSlots.length > 0) && (
            <div className="grid grid-cols-2 gap-2">
              {relativeSlots.map((slot) => (
                <button
                  key={slot.label}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSetAvailability(slot.time)}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  {slot.label}
                </button>
              ))}
              {specificSlots.map((slot) => (
                <button
                  key={slot.label}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleSetAvailability(slot.time)}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}

          {/* Clear availability */}
          {currentAvailability && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleClearAvailability}
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              I&apos;m Not Free
            </button>
          )}
        </div>

        {/* Free members list */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Who&apos;s free
          </h2>

          {freeMembers.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nobody is free right now. Be the first!
            </p>
          ) : (
            <ul className="space-y-2">
              {freeMembers.map((m) => {
                const avail = m.availability.find(
                  (a) => new Date(a.free_until) > now,
                )
                if (!avail) return null
                const isCurrentUser = m.id === member.memberId
                return (
                  <li
                    key={m.id}
                    className={`flex items-center justify-between rounded-md border px-4 py-3 ${
                      hasMatch
                        ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20'
                        : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {m.name}
                        {isCurrentUser && (
                          <span className="ml-1 text-zinc-400 dark:text-zinc-500">
                            (you)
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatFreeUntil(avail.free_until)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    )
  }

  const groupUrl = `${origin}/group/${group.slug}`

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Share Group</h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Share this link with your friends so they can join this group.
          </p>
        </div>

        <div className="space-y-3">
          <div className="rounded-md bg-zinc-100 px-4 py-3 text-sm font-mono text-zinc-800 break-all dark:bg-zinc-800 dark:text-zinc-200">
            {groupUrl}
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Join Group</h2>

        <form action={formAction} className="space-y-6">
          {actionState && 'error' in actionState && (
            <div
              className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400"
              role="alert"
              aria-live="polite"
            >
              {actionState.error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Your Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Alex"
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:ring-offset-0"
            />
          </div>

          <input type="hidden" name="groupId" value={group.id} />

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-950"
          >
            {pending ? 'Joining...' : 'Join Group'}
          </button>
        </form>
      </div>
    </div>
  )
}
