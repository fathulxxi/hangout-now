# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server
- `npm run build` — production build (also serves as the type-check; no separate tsc script)
- `npm run lint` — ESLint (flat config, core-web-vitals + typescript)

No test framework is configured yet.

## Architecture

Hangout Now is a spontaneous hangout coordinator for small friend groups. Users create a group (gets a shareable link), join with just a name (no auth), mark themselves as "free now" or "free until [time]", and see live who else is free.

**Stack:** Next.js 16 (App Router), React 19, Supabase (database + client), Tailwind CSS 4.

**Data flow:**
- Server actions (`src/app/actions/`) handle mutations (e.g., group creation) using the server Supabase client.
- Client components use `@supabase/ssr` browser client for real-time reads.
- No auth — members are identified by a `token` stored in the browser.

**Supabase clients:**
- `src/lib/supabase/server.ts` — server-side client (uses cookies); used in server actions and server components.
- `src/lib/supabase/client.ts` — browser-side client; used in client components.
- Both are typed with the generated `Database` type from `src/lib/types/database.ts`.

**Data model (3 tables):**
- `groups` — id, slug (used in URL), created_at
- `members` — id, group_id, name, token (browser identity), created_at
- `availability` — id, member_id, free_until (timestamp), created_at
- "Matches" are computed on read (overlapping free windows), not stored.

**Routing:**
- `/` — landing page
- `/create-group` — group creation form (client component with `useActionState`)
- `/group/[slug]` — group page (dynamic route by slug)

## Environment

Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. See `.env.local.example`.

## Path alias

`@/*` maps to `./src/*`.
