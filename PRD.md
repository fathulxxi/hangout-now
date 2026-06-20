# PRD — Hangout Now

A spontaneous hangout coordinator for small friend groups.

## 1. Problem

"Let's hang out sometime" plans rarely happen because nobody wants to be the one
to propose a specific time, and checking who's actually free right now means
pinging a group chat and waiting for replies. The friction isn't lack of desire
to hang out — it's the coordination overhead of figuring out *when*.

## 2. Who it's for, and the one job it has to do

A small group of friends (3–10 people) who already hang out semi-regularly.
The one job: let anyone in the group instantly see who else is free right now
or later today, with zero setup per use.

## 3. Why this problem, and how I know it's worth solving

This is a recurring friction in my own friend group — plans get proposed in
chat, get buried, and die. The cost of checking availability is higher than
the value of the hangout it would unlock, so people stop proposing. Lowering
that cost should directly increase how often low-stakes hangouts happen.

## 4. What's already out there, and why build this anyway

Group chats, When2meet, and shared calendars all solve *scheduling future
plans*, not *checking who's free right now*. They require someone to initiate
a conversation and wait for responses. This tool flips that: marking yourself
free is a single tap, and matches surface automatically without anyone having
to ask.

## 5. In scope (MVP)

- Create a group → get a shareable link (no signup).
- Open the link → join with just a name, stored locally on that device.
- Mark yourself "free now" or "free until [time today]."
- See a live list of who in the group is currently free.
- When two or more members' free windows overlap, highlight the match.

## 6. Out of scope, and why

- **Real push notifications** — needs a service worker + permission flow
  that isn't worth a day of budget. v1 relies on polling while the tab is
  open.
- **Calendar integration / recurring plans** — this is for spontaneous,
  same-day hangouts, not scheduled ones.
- **Time zones** — assumes everyone in a group is local to each other.
- **Accounts / passwords** — adds friction the core use case doesn't need;
  identity is just a name tied to a browser.
- **In-app chat** — group chat already exists; this tool's only job is the
  availability signal.

## 7. Data model

- `groups`: id, slug (used in the shareable URL), created_at
- `members`: id, group_id, name, created_at (identified via a token stored
  in the browser, not a password)
- `availability`: id, member_id, free_until (timestamp), created_at

A "match" isn't a stored entity — it's computed on read: any two members in
the same group whose `free_until` is in the future right now.

## 8. Where I don't have answers yet — assumptions made

- Assuming a group size of 3–10 is the right range; haven't validated.
- Assuming "free until a specific time today" covers most cases, vs. needing
  arbitrary date/time windows.
- Assuming people will keep the tab open or check back manually for v1,
  since there's no push notification yet.

## 9. Three questions for a real user before building more

1. When you see a match, what do you actually do next — message them
   separately, or would you expect this tool to also help you decide *what*
   to do together?
2. Would you use this for your closest 3–4 friends, or would it only be
   useful with a bigger, looser group?
3. How often would you realistically open this without a notification
   nudging you to check?

## 10. How I'd know it's working, and what I'd do next

Working = at least one real match happens between real friends within the
first few days of use, without anyone needing an explanation of how it
works. Next steps if it sticks: real push notifications, "free this
weekend" windows beyond just today, and letting a match auto-suggest a
default meeting spot based on past hangouts.

## AI usage notes (fill in as you build)

- Where AI helped:
- One place it got something wrong that I caught: