# Bridge3 Academy

A structured Web3 education platform for Africa. This is one single Next.js app —
the marketing site, the learning platform, and the docs all live here as
different sections of the same project (see "How this is organized" below).

## What's built so far (Phase 1)

- The site shell: sticky header (logo, nav, Login, Join Waitlist button) and
  footer, shared across every page.
- The homepage with placeholder sections for Hero, How It Works, Curriculum,
  Tracks, Social Proof, FAQ, and About — structure only, real content comes in
  Phase 3.
- Placeholder pages at `/dashboard` (LMS, built from Phase 4), `/docs`
  (documentation, built in Phase 15), and `/login`.
- The full design system (colors, fonts, spacing) that every later phase will
  reuse, so the whole platform stays visually consistent.

Nothing here talks to a database yet — there's no waitlist logic, no sign-up,
no real content. That's intentional; this phase is just the foundation.

## How this is organized

```
app/
  page.tsx              → homepage (marketing site)
  dashboard/page.tsx     → LMS placeholder (real LMS built in later phases)
  docs/page.tsx           → documentation placeholder (built in Phase 15)
  login/page.tsx          → login placeholder (real auth built in Phase 4)
  legal/                  → terms & privacy placeholders
  layout.tsx              → wraps every page in the shared header + footer
  globals.css             → base styles
components/ui/            → shared, reusable pieces (Header, Footer, Section)
tailwind.config.ts        → the design system: colors, fonts, spacing
```

## Running it on your own computer (optional — not required to deploy)

You don't have to run this locally to get it live on Vercel (see below), but if
you want to preview it yourself first:

1. Install [Node.js](https://nodejs.org) (choose the LTS version) if you don't
   have it already.
2. Open a terminal in this project folder and run:
   ```
   npm install
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## Getting this onto GitHub (do this once per phase)

1. Open **GitHub Desktop** with this folder added as a local repository (if
   this is the very first phase, you'll add this folder as a new repository
   the first time).
2. You'll see every file listed under "Changes."
3. Write a short summary, e.g. `Phase 1: project scaffold + marketing site shell`.
4. Click **Commit to main**, then click **Push origin**.

That's it — nothing here deletes or replaces anything from before, since this
is the very first phase.

## Deploying to Vercel

1. If you haven't already, go to [vercel.com](https://vercel.com) and sign up
   with "Continue with GitHub."
2. Click **Add New Project**, select the `bridge3-academy` repository.
3. Vercel will auto-detect this as a Next.js project — you shouldn't need to
   change any settings. Click **Deploy**.
4. No environment variables are needed for this phase (see `.env.example` —
   it's currently just a placeholder for future phases).
5. From now on, every time you push new commits to GitHub, Vercel
   automatically rebuilds and redeploys the live site — you never need to
   manually "send" anything to Vercel again after this first connection.

## What to check once it's deployed

- The header is sticky (stays at the top when you scroll).
- The nav links (How It Works, Curriculum, Tracks, FAQs, About) jump to the
  right placeholder section on the homepage.
- "Join Waitlist" is a solid green button; "Login" is a plain text link.
- The mobile menu (small screen / narrow browser window) opens and closes with
  the icon in the top right.
- `/dashboard`, `/docs`, and `/login` all load a placeholder page instead of a
  404 error.
