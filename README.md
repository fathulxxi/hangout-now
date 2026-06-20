# Hangout Now

**Live:** https://hangout-now-psi.vercel.app/

A real-time spontaneous hangout coordinator for small friend groups. One person creates a group, shares the link, and everyone marks when they're free. When two or more people overlap, the app lights up with a match.

## Running it

```bash
npm install
npm run dev
```

Requires Node.js 20+ and a Supabase project. Copy `.env.local.example` to `.env` and fill in your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Other commands:

```bash
npm run build   # production build + type check
npm run lint    # eslint
```

## Who it's for

Small friend groups (3-10 people) who want to hang out more but don't because nobody wants to be the one to ask. The one job: make saying "I'm free right now" as low-friction as possible so spontaneous hangouts actually happen.

## Why this problem

Most hangouts don't fail because people are busy. They fail because coordinating is awkward. Someone has to propose a time, wait for replies, negotiate, and by then the moment has passed. Group chats bury availability signals in noise. Calendar tools are overkill for "anyone free tonight?"

The signal that this matters: people already do this manually. They text "anyone free?" and wait. Hangout Now replaces the wait with a live dashboard.

## What already exists

- **Group chats (WhatsApp, iMessage)** — availability gets lost in conversation. No structure, no matching.
- **Calendar sharing (Google Calendar, Calendly)** — designed for scheduled meetings, not spontaneous plans. Too formal, too much setup.
- **When2meet / Doodle** — good for finding a future time slot. Wrong tool for "right now."

None of these solve the "I'm free now, who else is?" problem without friction. Hangout Now is purpose-built for exactly that moment.

## What's in scope

- Create a group and get a shareable link
- Join with just a name (no signup, no login)
- Mark yourself as free now or until a specific time today
- See who else is free in real time
- Get a visual match when 2+ people are free simultaneously
- Works on any device with a browser

## What's out of scope (and why)

- **User accounts and authentication** — adds friction to the one thing that needs to be frictionless. Identity is a browser token tied to a name.
- **Multi-day scheduling** — that's a different product (When2meet already does it). This is about right now.
- **Push notifications** — would be valuable but adds complexity (service workers, permissions). Real-time subscriptions handle the "I'm already looking at it" case first.
- **Chat or messaging** — the app signals availability, not conversation. Once you match, you already have a group chat to coordinate details.
- **Location or activity suggestions** — out of scope for the MVP. The group already knows where they hang out.

## Assumptions

- Groups are small enough that a flat member list works (no pagination, no search).
- People checking availability are already motivated to hang out — the app just removes coordination friction, not motivation.
- Same-day availability is sufficient. If you're planning for tomorrow, you'll use a different tool.
- Browser tokens are good enough for identity. The threat model is casual misuse, not targeted attacks.
- Users are in roughly the same timezone. No timezone conversion is built in.

## Three questions I'd ask real users before building more

1. **When you see a match, what happens next?** Do you just text the group, or would an in-app nudge ("3 people are free — make a plan?") actually change behavior?
2. **How often do you check the app vs. forget it exists?** Would push notifications bring you back, or would they just get muted like everything else?
3. **Do you care about recurring availability?** ("I'm always free Friday evenings") — or is the spontaneous, one-off nature the whole point?

## How I'd know it's working

- **Groups with 3+ active members** — the app is only useful with a critical mass.
- **Repeat availability signals** — people come back and mark themselves free more than once.
- **Match-to-hangout conversion** — the hardest to measure, but the only metric that actually matters. Would need a "did you hang out?" prompt or similar signal.
- **Time between group creation and first match** — if it takes days, the group is dead.

## What I'd do next

- **Push notifications** when a match happens — the biggest gap right now. You shouldn't have to be staring at the app.
- **"Nudge" feature** — let someone ping the group ("anyone free tonight?") without leaving the app.
- **Recurring availability** — "I'm usually free Friday evenings" as a soft signal.
- **Activity/hangout history** — see past matches and whether they led to actual plans, to build the habit loop.

## Tech stack

Next.js 16 (App Router), React 19, Supabase (Postgres + real-time subscriptions), Tailwind CSS 4. No auth layer — members are identified by a UUID token stored in the browser.
