'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createGroup } from '@/app/actions/group'

const initialState = {
  error: '',
}

export default function CreateGroupPage() {
  const [state, formAction, pending] = useActionState(
    createGroup,
    initialState
  )

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Create a Group</h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Start a new hangout group and share the link with friends.
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div
              className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400"
              role="alert"
              aria-live="polite"
            >
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Group Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Weekend Crew"
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:ring-offset-0"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-950"
          >
            {pending ? 'Creating...' : 'Create Group'}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
