# Bridge3 Academy

A structured Web3 education platform for Africa. This is one single Next.js app —
the marketing site, the learning platform, and the docs all live here as
different sections of the same project.

## External services this phase needs

Two, both free at your scale — there's no way to build a real waitlist +
email system without some external service, but neither costs money right
now:

1. **Supabase** — your database and file storage. Required starting this
   phase (Phase 1 needed none).
2. **Resend** — sends the confirmation email. The one new "third-party API"
   in this phase.

Full setup for both is below.

## What's built so far

**Phase 1 — Foundation**
- Site shell: sticky header, footer, shared design system (colors, fonts).
- Placeholder pages at `/dashboard` (LMS), `/docs` (documentation), `/login`.

**Phase 2 — Waitlist + manual verification**
- Real Hero section with email capture on the homepage.
- Signing up creates a row in Supabase, sends a confirmation email (via
  Resend), and shows a success modal with the verification checklist.
- A Verification Tasks Dashboard at `/waitlist` where visitors:
  - Confirm their email automatically (click the link in the email).
  - Submit a Telegram username + optional screenshot — goes to **Pending
    Review**, never auto-completes.
  - Submit an X (Twitter) username + optional screenshot — same, **Pending
    Review** only.
  - Copy a referral link — the "share with 3 friends" task tracks itself
    automatically by counting real, confirmed signups that used their link.
    No submission, no manual review, no external API — just counting rows
    in your own database, which costs nothing.
  - See a running verification score (0–100%) based on how many of the 4
    tasks are completed or pending review.
- No task auto-verifies except email confirmation. Everything else waits for
  a human to review it — that review tool itself comes in a later phase
  (Admin Panel), but the data is already being captured correctly now.

## How this is organized

```
app/
  page.tsx                          → homepage (Hero + placeholder sections)
  waitlist/page.tsx                 → Verification Tasks Dashboard
  api/waitlist/
    signup/route.ts                 → creates/reuses a waitlist entry, sends confirmation email
    confirm-email/route.ts          → the link the confirmation email points to
    status/route.ts                 → dashboard reads current status from here
    submit-task/route.ts            → records a Telegram/X/share submission as Pending Review
    resend-confirmation/route.ts    → "Resend email" button on the dashboard
  dashboard/, docs/, login/         → placeholders for later phases
components/
  ui/                               → Header, Footer, shared Section wrapper
  waitlist/WaitlistHero.tsx         → the real Hero + email form + success modal
lib/
  supabase/client.ts                → browser Supabase client (public anon key only)
  supabase/admin.ts                 → SERVER-ONLY Supabase client (secret service role key)
  email/resend.ts                   → SERVER-ONLY email sending helper
supabase/schema.sql                 → run this once in Supabase's SQL Editor
```

## One-time setup for this phase

### Part A — Supabase (your database + file storage)

**Step 1 — Create your account and project**
1. Go to [supabase.com](https://supabase.com) and click **Start your
   project**.
2. Sign up (with GitHub or email — either is fine).
3. Once logged in, click **New Project**.
4. If asked to pick an organization, use the default one that was already
   created for you.
5. Fill in the project form:
   - **Name:** `bridge3-academy`
   - **Database Password:** click "Generate a password" and then **save it
     somewhere safe** (a notes app, a password manager) — you likely won't
     need it day-to-day, but don't lose it.
   - **Region:** pick whichever is physically closest to most of your
     students (there's no Africa region yet, so somewhere in Europe is
     usually the closest available option).
6. Click **Create new project**. This takes 1–2 minutes to set up — you'll
   see a loading screen, then land on your project's dashboard.

**Step 2 — Copy your three Supabase keys**
1. In the left sidebar, click the gear icon (**Project Settings**).
2. Click **API** in the settings menu.
3. You'll see three things you need — copy each one somewhere temporary
   (like a notes file) so you can paste them into `.env.local` in Step 4
   below:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key (under "Project API keys") → this is your
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (further down, marked "secret") → this is your
     `SUPABASE_SERVICE_ROLE_KEY`. Supabase hides this behind a "reveal"
     click since it's sensitive — treat it like a password, never share it.

**Step 3 — Run the database setup script**
1. In the left sidebar, click the **SQL Editor** icon (looks like `</>`).
2. Click **New query** (top left of that page).
3. Open the `supabase/schema.sql` file from this project (in the folder you
   unzipped), select all of it, and copy it.
4. Paste the whole thing into the empty query box in Supabase.
5. Click **Run** (bottom right), or press Ctrl+Enter (Cmd+Enter on Mac).
6. You should see a green "Success. No rows returned" message. If you see a
   red error instead, stop and paste the exact error message back to me
   before continuing — don't guess at fixing it yourself.

**Step 4 — Confirm the storage bucket was created**
1. In the left sidebar, click the **Storage** icon.
2. You should see a bucket named `waitlist-verification` already listed —
   the SQL script created this automatically. If it's not there, re-check
   Step 3 ran without errors.

### Part B — Resend (sends the confirmation email)

**Why this instead of Supabase's own email:** Supabase's built-in email is
built for its own login system (magic links, password resets) tied to real
accounts. Waitlist signups aren't full accounts yet — that's Phase 4 — so a
separate, simple email tool avoids extra complexity now. Resend is free at
this scale (3,000 emails/month, 100/day) and you'll reuse it later for
mentor notifications and certificate emails too.

**Step 1 — Create your account**
1. Go to [resend.com](https://resend.com) and click **Sign Up**.
2. Sign up with email or GitHub.
3. Verify your email address if Resend asks you to (check your inbox).

**Step 2 — Create your API key**
1. Once logged in, click **API Keys** in the left sidebar.
2. Click **Create API Key**.
3. Give it a name like `bridge3-academy`.
4. Leave permissions on the default (full access is fine for now).
5. Click **Add**.
6. **Copy the key immediately** — Resend only shows it to you once. Paste it
   into the same temporary notes file from Part A. This is your
   `RESEND_API_KEY`.

**Step 3 — (Not needed yet) Verifying your own domain**
For now, confirmation emails send from Resend's shared test address
(`onboarding@resend.dev`), which is fine for testing. Before a real public
launch, come back to Resend's **Domains** tab, add `bridge3academy.com`, and
follow their instructions to add a couple of DNS records at wherever you
bought your domain — this makes emails send from your own address and land
in inboxes more reliably. Skip this for now.

### Part C — Actually connecting both to your app

**On your own computer (for local testing):**
1. In your unzipped project folder, find the file called `.env.example`.
2. Make a copy of it in the same folder, and rename the copy to exactly
   `.env.local` (note: it starts with a dot, and has no file extension after
   "local").
3. Open `.env.local` in any text editor and paste in the real values you
   collected above, so it looks like this (with your real values instead of
   the placeholders):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   RESEND_API_KEY=your-actual-resend-key
   WAITLIST_EMAIL_FROM=
   ```
4. Save the file. (It's already excluded from GitHub by `.gitignore`, so
   this never accidentally gets pushed or shared.)

**In Vercel (for the live site):**
1. Go to your project in Vercel, then **Settings → Environment Variables**.
2. Add each of the five variables above one at a time: paste the name (e.g.
   `NEXT_PUBLIC_SUPABASE_URL`) into the "Key" field, the real value into
   "Value," and leave it checked for all environments (Production, Preview,
   Development).
3. The only value that should be different from your local file is
   `NEXT_PUBLIC_SITE_URL` — set this to your real live URL instead of
   `localhost:3000` (e.g. `https://bridge3-academy.vercel.app`, or your
   custom domain once it's connected).
4. Click **Save** after each one.
5. If you added these *after* your first deploy, go to the **Deployments**
   tab, click the **⋯** menu on the most recent deployment, and click
   **Redeploy** so the new variables actually take effect.

## On the "fourth subdomain" question

I recommend a route (`/waitlist`) instead of a real `waitlist.bridge3academy.com`
subdomain for now. A visitor can't tell the difference — it works exactly the
same either way — but a route needs zero extra DNS or Vercel configuration.
If you want a real subdomain later, it's a small Vercel settings change at
that point, not a rebuild.

## Getting this onto GitHub

If you haven't done this yet for this project, here's the full walkthrough —
this only needs to happen once, ever, for the whole project.

**Step 1 — Create a GitHub account** (skip if you already have one)
Go to [github.com](https://github.com) and sign up. It's free.

**Step 2 — Install GitHub Desktop**
Go to [desktop.github.com](https://desktop.github.com), download it, and sign
in with the GitHub account from Step 1. This gives you a simple window
interface — no command line typing required for any of this.

**Step 3 — Create the repository**
1. Unzip this project folder somewhere on your computer if you haven't
   already (e.g. Documents/bridge3-academy).
2. In GitHub Desktop, go to **File → Add Local Repository**, and select that
   unzipped folder.
3. GitHub Desktop will notice it isn't a Git repository yet and offer to
   **"create a repository"** — click that.
4. You'll see every file in the project listed under "Changes" on the left.
5. At the bottom, write a summary like `Initial commit: Phase 1 + Phase 2`,
   then click **Commit to main**.
6. Click **Publish repository** at the top. Name it `bridge3-academy`. Leave
   "Keep this code private" checked unless you specifically want it public.
7. Click **Publish**. Your code is now on GitHub.

**From here on, every future phase is just:**
1. Add the new/changed files from this chat into the same local folder.
2. Open GitHub Desktop — it shows what changed under "Changes."
3. Write a short summary (e.g. `Phase 3: marketing site content`).
4. Click **Commit to main**, then **Push origin**.

Nothing about this process ever deletes or replaces earlier work — each
commit only adds what changed in that phase on top of everything before it.

## Connecting Vercel (do this once, right after your first GitHub push)

1. Go to [vercel.com](https://vercel.com) and sign up using **"Continue with
   GitHub"**, so the two are linked from the start.
2. Click **Add New Project**, and select the `bridge3-academy` repository.
3. Add the environment variables listed above under **Environment
   Variables** before clicking Deploy (or add them after and redeploy — both
   work).
4. Click **Deploy**.

From this point on, every time you push a new commit to GitHub, Vercel
automatically rebuilds and redeploys the live site on its own — you never
manually "send" anything to Vercel again after this one-time connection.

## How to test this phase

1. Go to your homepage and enter an email in the Hero form, click **Join
   Early Access**.
2. You should see the "You're on the list" success modal. Click **Go to
   Verification Tasks Dashboard**.
3. Check the inbox for that email — you should get a confirmation email
   within a few seconds. Click the link in it; you should land back on the
   dashboard with "Confirm email" now showing **Completed**.
4. On the dashboard, fill in a fake Telegram username, attach any image file
   as a "screenshot," and click **Submit for review**.
5. **Confirm it shows "Pending Review" and stays there** — it should NOT
   flip to Completed on its own. That's the entire point of this phase: no
   task except email confirmation ever auto-verifies. (The tool to actually
   approve or reject these submissions is the Admin Panel, built in a later
   phase — for now, the goal is just confirming the data is being captured
   correctly and nothing silently auto-approves.)
6. Try the referral flow: copy your referral link from the dashboard, then
   open it in a private/incognito browser window and sign up with a
   *different* email. Confirm that second email too. Back on your original
   dashboard, refresh — you should see "1 of 3 friends have joined." No
   button to click, no review needed — it updates itself from real data.
7. Check your verification score updates correctly (each Pending Review or
   Completed task should count toward it, out of 4 total).

## Known limitation to be aware of (not a bug — a deliberate early-stage tradeoff)

The link to your personal dashboard (the `id` in the URL) works like an
unguessable pass — nobody can access someone else's status without their
exact id, but there's no full login system protecting it yet (real accounts
arrive in Phase 4). This is a reasonable tradeoff for a pre-launch waitlist
tool, worth revisiting only if it ever becomes a real security concern.
