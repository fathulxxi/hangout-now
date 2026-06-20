'use client'

import {
  useActionState,
  useState,
  useSyncExternalStore,
  useCallback,
  useRef,
} from 'react'
import { joinGroup } from '@/app/actions/member'

interface MemberData {
  token: string
  memberId: string
  name: string
}

const noopSubscribe = () => () => {}

export default function GroupPage({
  group,
}: {
  group: { id: string; slug: string }
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

  if (member) {
    return (
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back, {member.name}!
        </h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          You&apos;re in this group.
        </p>
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
