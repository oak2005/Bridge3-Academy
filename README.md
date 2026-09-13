# Bridge3 Academy

A structured Web3 education platform for Africa. This is one single Next.js app —
the marketing site, the learning platform, and the docs all live here as
different sections of the same project.

## External services this phase needs

Two, both free at your scale — there's no way to build a real waitlist +
email system without some external service, but neither costs money right
now:

1. **Supabase** — your database and file storage. Required starting Phase 2.
2. **Resend** — sends the confirmation email. Added in Phase 2.

**Phase 4 (Google sign-in) needs no new paid service** — just a free Google
Cloud OAuth app, configured entirely inside Supabase's dashboard. No new
Vercel environment variables either.

Full setup for all of this is below.

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

**Phase 3 — Marketing site content**
- How It Works (4-step path), Curriculum Overview (General / Ecosystem
  Support / Skill Set tracks), Specialization Tracks (Growth / Creative /
  Operations), Social Proof, FAQ accordion, and About are all filled in with
  real copy instead of placeholder headers.
- The Builder Track is intentionally marked "planned partnership" — it's not
  fully live yet, and the copy says so honestly instead of overstating it.

**Phase 4 — Google sign-in and onboarding**
- Real authentication: **Google sign-in only** (no email/password, no other
  providers, by deliberate choice).
- A `profiles` row is created automatically the moment someone signs in with
  Google for the first time (via a database trigger — no app code has to
  "remember" to do this).
- After first sign-in, a short follow-up screen asks for University and
  Role interest (Google doesn't provide these).
- Then a personalization screen asks for Level and Track, and marks
  onboarding complete.
- `/dashboard` is a minimal authenticated landing page for now — it proves
  the whole login → profile → onboarding loop works, shows your name, role,
  track, and level, and has a Sign Out button for repeat testing. The real
  dashboard (courses, progress) is built in Phase 5.
- Every profile row is locked down with Row Level Security — you can only
  ever see and edit your own profile, never anyone else's.
- Three roles exist on every profile (`student`, `mentor`, `admin`), all
  defaulting to `student`. Nothing uses `mentor`/`admin` yet — that's Phase
  10 and Phase 11.

**Phase 5 — Real dashboard shell + course catalog**
- `/dashboard` is now a real, permanent layout: a left sidebar (Dashboard,
  My Courses, Workshops, Assessments, Portfolio, Certification, Community,
  Settings — all with a working mobile menu too) and a top bar (avatar,
  notifications, settings), shared across every dashboard page.
- A real course catalog exists in the database: General Track (Level 1 +
  Level 2), Ecosystem Support Track, and four Skill Set specializations
  (Designer, Creator, Community & Growth, and Builder — Builder is marked
  "coming soon," matching the honest framing on the marketing site).
- The main dashboard's "Today's Lesson" card and progress bar pull **real**
  data from that catalog — not fake numbers. Progress correctly shows 0%
  right now, because there's genuinely no way to complete a lesson yet
  (that's Phase 6) — it'll start moving on its own once that's built,
  with no changes needed here.
- The leaderboard and upcoming deadlines are clearly-labeled **placeholder**
  data — those need Phase 9 (XP/portfolio) and Phase 7/8 (assignments) to
  become real, and the UI says so honestly rather than pretending.
- Every sidebar link goes somewhere real — the six not built yet (My
  Courses, Workshops, Assessments, Portfolio, Certification, Community,
  Settings) show a short placeholder naming which phase builds them, instead
  of a broken link.

**Phase 6 — Classroom (lesson pages) + real progress tracking**
- **My Courses** is now real: every track, module, and lesson from the
  catalog, with a checkmark/circle showing what's completed.
- Clicking any lesson opens a real **classroom page**: a generic video
  player (handles YouTube, Vimeo, or a direct video file — no video is
  seeded yet, so you'll see an honest "no video attached" state until one's
  added), lesson notes, instructor name, downloadable resources, and a
  right-rail list of the other lessons in that module.
- **"Mark as completed" is now real and saved per-student** — it writes to
  a `student_progress` table, locked down so you can only ever mark your
  *own* progress, never anyone else's.
- The main dashboard's progress bar and "Today's Lesson" card now use this
  real data — the percentage will actually move as you complete lessons,
  and "Today's Lesson" correctly advances to your next incomplete one.
- Resources use secure, temporary signed download links (60 seconds) rather
  than permanent public URLs — nothing in the resources bucket is
  publicly accessible by default.

**Phase 7 — Workshops (assignments, submissions, peer discussion)**
- **Workshops** is now real: every assignment across the curriculum, with
  your current status (Not submitted / Submitted / Under Review / Needs
  Revision / Approved) shown at a glance.
- Each assignment has its own page: description, submission format
  instructions, a submission form (text and/or file upload), and your full
  submission history — every past attempt is kept, not overwritten, so
  nothing you've submitted before is ever lost.
- **Submissions are private** — locked down so you can only ever see your
  own, never another student's. **Peer discussion comments are public** —
  every signed-in student can read and post in the discussion thread under
  each assignment, which is the intended "peer" part of peer discussion.
- Submission files live in per-student folders in Storage, enforced at the
  database level — you genuinely cannot read another student's uploaded
  file, even by guessing a URL.
- No grading or review tool exists yet on purpose — that's the Mentor phase
  (Phase 10). Every submission you make will just sit at "Submitted" until
  then, which is correct, not a bug.

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

## One-time setup for Phase 2 (Supabase + Resend)

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

Supabase recently changed how this page looks, so here's how to find these
regardless of which version you see. You already created your project, so
start here:

1. Look for a button labeled **Connect** near the top of your project
   dashboard (sometimes it's in the top bar, sometimes under the project
   name). Click it.
2. This opens a panel with your **Project URL** and a key ready to copy,
   often with a framework dropdown — if it asks, pick **Next.js**. Copy the
   **Project URL** first — this is your `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy the key shown here too — this is your public key (either called
   **anon** or **publishable**, depending on your project) — this is your
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Either name works fine for this project;
   they do the same job.
4. Now you need the **secret** key, which the Connect panel deliberately
   doesn't show (it's too sensitive to put in a quick-copy panel). Instead:
   - In the left sidebar, click the gear icon (**Project Settings**).
   - Click **API Keys** in the settings menu.
   - If you see two tabs, **Legacy API Keys** and **API Keys**: click
     whichever tab shows a key that's already there (don't create a new one
     unless neither tab has anything yet). Copy the key called either
     **service_role** (legacy tab) or **secret** (new tab) — either works
     the same way. This is your `SUPABASE_SERVICE_ROLE_KEY`.
   - This key is hidden behind a "Reveal" click since it's sensitive —
     **never share it, never paste it anywhere except your `.env.local`
     file and Vercel's settings.**

If none of this matches what you're actually seeing on screen, tell me
exactly what buttons/tabs you see and I'll help you find the right one
rather than guessing.

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
4. For permission, choose **Sending access** (not "Full access") — this
   key only needs to send emails, so giving it the smaller permission is
   safer if it were ever leaked.
5. If it asks you to restrict to a specific domain, leave that blank for
   now (you haven't verified a domain yet — see Step 3 below).
6. Click **Add**.
7. **Copy the key immediately** — Resend only shows it to you once. Paste it
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

## Phase 4 — Google Sign-In: complete walkthrough, start to finish

Follow these in order — each step depends on the one before it.

**Step 1 — Get the Phase 4 files onto GitHub first**
1. Unzip the Phase 4 files.
2. Open GitHub Desktop — new/changed files show under "Changes" (`app/login/`,
   `app/onboarding/`, `lib/auth/`, `supabase/schema_phase4_auth.sql`, etc.).
3. Commit message: `Phase 4: Google sign-in`. Click **Commit to main**, then
   **Push origin**.
4. In Vercel → **Deployments**, wait for the new build to say **Ready**
   before continuing.

**Step 2 — Run the new database script**
1. Supabase → **SQL Editor** → **New Query**.
2. Paste the full contents of `supabase/schema_phase4_auth.sql`, click **Run**.
3. Confirm a green "Success" message. This creates the `profiles` table and
   the trigger that auto-creates a profile the moment someone signs in.

**Step 3 — Open Supabase's Google provider screen (just to grab one URL)**
1. Supabase → **Authentication → Providers** → find **Google**, click to
   expand it. Don't toggle it on yet.
2. Copy the **Callback URL (for OAuth)** shown there — you'll need it in the
   next step. Leave this tab open.

**Step 4 — Create the Google OAuth app** (free, ~5 minutes)
1. Go to [console.cloud.google.com](https://console.cloud.google.com).
2. Project dropdown → **New Project** → name it `bridge3-academy` → **Create**.
3. Search bar → **OAuth consent screen** → choose **External** → **Create**.
4. Fill in App name (`Bridge3 Academy`) and your email for the two contact
   fields → **Save and Continue** through the remaining steps with defaults.
   "Testing" mode is fine.
5. Search bar → **Credentials** → **Create Credentials → OAuth client ID**.
6. Application type: **Web application**. Name it anything.
7. Under **Authorized redirect URIs**, paste the callback URL from Step 3.
8. Click **Create**. Copy the **Client ID** and **Client Secret** shown —
   these go into Supabase next, never into your code or `.env` file.

**Step 5 — Connect Google to Supabase**
1. Back on the Supabase Google provider screen from Step 3, toggle it **on**.
2. Paste in the Client ID and Client Secret.
3. **Save**.

**Step 6 — Allow your app's URLs to receive the login redirect**
1. Supabase → **Authentication → URL Configuration**.
2. **Site URL**: your real deployed URL (e.g. `https://bridge3-academy.vercel.app`).
3. **Redirect URLs**, add both:
   ```
   http://localhost:3000/auth/callback
   https://bridge3-academy.vercel.app/auth/callback
   ```
4. Save.

**Step 7 — No new environment variables needed**
Unlike Phase 2, there's nothing to add in Vercel. Google's credentials live
entirely in Supabase's settings from Step 5. If Step 1's deploy already
finished, you're ready to test — no further redeploy required.

**Step 8 — Test it end to end**
1. `/login` → **Continue with Google** → pick an account, approve consent.
2. "A couple more details" screen → fill University + Role interest → **Continue**.
3. "Personalize your learning path" → pick Level + Track → submit.
4. Land on `/dashboard`: "Welcome, [name]," role, track, level all shown.
5. Click **Sign out**, sign in again with the *same* Google account — this
   time it should skip straight to `/dashboard`, no repeated onboarding.
6. Supabase → **Table Editor** → `profiles` → confirm your row saved
   correctly.
7. Try visiting `/dashboard` directly in a private/incognito window while
   NOT signed in — it should redirect you to `/login` instead of showing
   anything.

## Phase 5 — Setup and Testing

**Setup — one database script, nothing else**

1. Supabase → **SQL Editor → New Query**.
2. Paste the full contents of `supabase/schema_phase5_courses.sql`, click
   **Run**.
3. Confirm a green "Success" message. This creates the `tracks`, `modules`,
   and `lessons` tables, and seeds them with the real curriculum (General
   Track, Ecosystem Support Track, and the four Skill Set specializations).
4. No new environment variables, no Vercel changes, no new external
   accounts — this phase is pure database + code.

**Verifying the seed data**

1. Supabase → **Table Editor** → open `tracks`. You should see 6 rows:
   General Track, Ecosystem Support Track, Designer Track, Creator Track,
   Community & Growth Track, and Builder Track (with `coming_soon` set to
   `true` on Builder Track only).
2. Open `modules` — General Track should have 2 rows ("Level 1 —
   Foundations" and "Level 2 — Practical Usage"), Ecosystem Support Track 1
   row, and each Skill Set track 1 row.
3. Open `lessons` — General Track's two modules should have 3 and 2 lessons
   respectively; the rest have 1 each.

**Verifying the dashboard**

1. Sign in (or if already signed in, just visit `/dashboard`).
2. Confirm the sidebar shows all 8 links, and the current page is
   highlighted.
3. On a narrow browser window or your phone, confirm the sidebar disappears
   and a hamburger menu appears in its place, with all the same links.
4. On the main dashboard, confirm:
   - **"Today's lesson"** shows "What is Blockchain?" (the real first
     lesson of General Track's first module) with a duration and a
     "Start lesson" button.
   - The **progress bar** shows "General Track — 0% completed" with the
     correct total lesson count (should be 5 — 3 from Level 1, 2 from Level
     2).
   - **Leaderboard** and **upcoming deadlines** show sample data, each with
     a small note underneath honestly saying it's a placeholder.
5. Click each of the other 7 sidebar links — each should show a short page
   naming which phase actually builds it, not a 404.

## Phase 6 — Setup and Testing

**Setup — one database script, nothing else**

1. Supabase → **SQL Editor → New Query**.
2. Paste the full contents of `supabase/schema_phase6_classroom.sql`, click
   **Run**.
3. Confirm a green "Success" message. This adds lesson notes/instructor
   fields, creates the resources and progress tables, and adds sample notes
   to two lessons so there's real content to test against.
4. No new environment variables, no Vercel changes.

**Verifying it works**

1. Go to **My Courses** — confirm every track/module/lesson from Phase 5
   shows up, each lesson marked with an empty circle (○) since nothing's
   completed yet.
2. Click **"What is Blockchain?"** — confirm you land on a real classroom
   page showing: an empty-state video player ("No video attached to this
   lesson yet" — this is correct, not a bug), the seeded lesson notes,
   "Instructor: Oyetundun Taiwo," and "No resources attached to this lesson
   yet" (also correct).
3. Click **Mark as completed**. Confirm the button changes to "Mark as
   incomplete," and the circle next to this lesson in the right rail turns
   into a checkmark.
4. Go back to the main **Dashboard** — confirm the progress bar now shows a
   real percentage above 0%, and "Today's Lesson" has advanced to the next
   lesson ("Bitcoin Basics").
5. Go to **Supabase → Table Editor → student_progress** — confirm there's a
   real row: your user ID, the lesson ID for "What is Blockchain?", and a
   timestamp.
6. Click **Mark as incomplete** on that same lesson, confirm the row
   disappears from `student_progress` and the dashboard's progress/today's
   lesson revert accordingly.
7. Complete all 5 General Track lessons one by one, then check the
   dashboard shows "You've completed every lesson in the General Track. 🎉"
   instead of a broken "no lesson found" state.

## Phase 7 — Setup and Testing

**Setup — one database script, nothing else**

1. Supabase → **SQL Editor → New Query**.
2. Paste the full contents of `supabase/schema_phase7_workshops.sql`, click
   **Run**.
3. Confirm a green "Success" message. This creates the assignments,
   submissions, and comments tables, sets up a private per-student storage
   folder system, and seeds two sample assignments.
4. No new environment variables, no Vercel changes.

**Verifying it works**

1. Go to **Workshops** — confirm you see two assignments ("Reflect on What
   You Learned" and "Set Up Your Wallet"), both showing "Not submitted."
2. Click into "Reflect on What You Learned." Type a short reflection,
   attach any file as a test, click **Submit assignment**.
3. Confirm it appears immediately under "Your submissions" with status
   "Submitted," and clicking **View attached file** actually opens it.
4. Go back to **Workshops** — confirm this assignment now shows "Submitted"
   instead of "Not submitted."
5. Submit the same assignment a second time with different text. Confirm
   **both** submissions now show in your history (most recent first) — this
   confirms resubmission keeps history instead of overwriting it.
6. Post a comment in the peer discussion section. Confirm it appears
   immediately, labeled "You."
7. **The real privacy test:** sign in with a *second* Google account (or an
   incognito window). Go to the same assignment. Confirm:
   - You do NOT see the first account's submission or attached file
     anywhere — the submission history should be empty for this new
     account.
   - You DO see the comment the first account posted in the peer
     discussion — but it should show their real name, not "You" (since
     you're not that user).
8. In Supabase → **Table Editor** → `assignment_submissions`, confirm both
   submissions exist with the correct `student_id` for each.

## On the "fourth subdomain" question

I recommend a route (`/waitlist`) instead of a real `waitlist.bridge3academy.com`
subdomain for now. A visitor can't tell the difference — it works exactly the
same either way — but a route needs zero extra DNS or Vercel configuration.
If you want a real subdomain later, it's a small Vercel settings change at
that point, not a rebuild.

## Getting this onto GitHub

**Current state, as of Phase 5:** your GitHub repo (`oak2005/Bridge3-Academy`)
has the real, active project sitting at its root — `package.json`, `app/`,
`components/`, etc. are all directly inside the repo, not nested in a
subfolder. There are also four older folders (`bridge3-academy-phase1`
through `-phase4`) — those are just historical snapshots from earlier in the
build and are safe to ignore forever. Never edit or delete them; they don't
affect anything.

You should also already have a **local folder on your computer** (e.g.
`Documents/bridge3-academy`) that's a real clone of this repo, connected to
GitHub Desktop. If you don't have that set up yet, or aren't sure, stop and
tell me before continuing — don't create a second one.

**From here on, every future phase is exactly this, every time:**
1. Unzip the new phase's files.
2. Copy everything from inside the unzipped folder **directly into your
   existing local `bridge3-academy` folder** — the one already connected to
   GitHub Desktop — overwriting any files with the same name. Do NOT create
   a new folder, and do NOT re-clone the repo.
3. Open GitHub Desktop — it shows what changed under "Changes."
4. Write a short summary (e.g. `Phase 6: classroom`).
5. Click **Commit to main**, then **Push origin**.

That's it — permanently, from now on. No more folder-per-phase, no more
Root Directory changes in Vercel. Nothing about this process ever deletes or
replaces earlier *committed* work — each push only adds what changed in that
phase on top of everything before it.

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

## How to test Phase 2 (waitlist)

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
