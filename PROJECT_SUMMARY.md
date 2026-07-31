# Gym Workout App — Project Summary

## What this is
A free, offline-first workout tracker for personal phone use. Built as a
single-page web app (not a native app) so there's no App Store, no fees,
no subscriptions.

## Live setup
- Hosted on GitHub Pages: https://hoplifter.github.io/gym-app/
- Repo: github.com/HopLifter/gym-app
- Files: `index.html` (the whole app) + `sw.js` (offline caching)
- No backend/server — all data lives in the browser's localStorage on the phone
- Cache version: `gym-app-cache-v13` — **bump this every time `index.html`
  changes**, or the phone will keep serving the old cached copy. This is
  the single most common thing to forget when wrapping up a session.

## Why these tech choices
- **Plain HTML/CSS/JavaScript**, no frameworks — simplest possible setup for a
  first project, no build tools needed
- **GitHub Pages** instead of local file storage — the phone is a corporate
  device with MDM restrictions that blocked local file access (Files app,
  Shortcuts, Safari were all locked down). Hosting online sidesteps that.
- **Service worker** (`sw.js`) caches the page so it loads with zero signal
  after the first visit — this is what makes it usable at the gym.
- **localStorage** for notes/data — persists between sessions on the same
  phone, no login or database needed.
- **Custom modals instead of `window.confirm()`/`alert()`** — native browser
  dialogs are unreliable (often silently no-op) on iOS when the app is
  launched from the home screen, which is how this app is used. Any future
  confirmation prompts should follow the same custom-modal pattern rather
  than native dialogs.

## Data model
localStorage keys:
- `gymapp_program_v1` — the currently active imported program, if any:
  `{ id, name, importedAt }`. `null`/absent if no program is active.
- `gymapp_queue_v1` — array of planned workouts, each:
  `{ id, programId, label, date, status: "queued", order, exercises }`.
  `order` determines queue position (ascending); the lowest `order` is the
  "Next Up" / active workout. `date` is `null` until the workout is
  completed. `programId` is `null` for ad-hoc workouts.
- `gymapp_history_v1` — array of completed workouts, each:
  `{ id, programId, label, date, status: "completed", note, exercises }`
  (no `order` field — history is sorted by `date`, newest first).
- Each exercise: `{ id, name, sets, reps, weight, rpe, rest, notes, supersetId }`.
  `rest` is stored **in seconds** internally (see Rest Timer note below).

## Current features (as of this version)
**Program & Queue**
- Import a program from JSON (header ⋮ menu → Import Program) — paste or
  choose a file. Ask Claude to convert a spreadsheet/plan into the expected
  `{ program: { name }, workouts: [...] }` format.
- Export the active program's queued + completed workouts back to JSON.
- "End Program" clears its remaining queued workouts (completed ones stay
  in history) and annotates the last completed workout.
- Queue screen lists all planned workouts in order; reorder (Move Up/Down),
  remove from queue, or add a one-off ad-hoc workout.
- The active workout screen always shows the workout at the front of the
  queue ("Next Up") unless you've navigated into another queued or past
  workout to view/edit it ahead of time.

**Exercise editing**
- Editable exercise fields: name, sets, reps, weight, RPE, rest time
- Rest time is displayed and edited **in minutes** (e.g. 1.5), stored
  internally in seconds — see Rest Timer note below for why.
- Auto-calculated Volume (sets × reps × weight)
- Notes field per exercise
- Add / delete exercises, with 6-second undo after delete
- Reorder exercises (Move Up / Move Down)
- Superset pairing: link two exercises, shown grouped with a visual badge

**Rest timer**
- Each editable exercise has a ⏱ button that starts a rest timer using
  that exercise's configured rest duration.
- A single persistent floating timer bar is visible across all screens
  (workout/queue/history) without blocking interaction — you can keep
  logging sets while it counts down.
- Controls: Pause / Resume / Reset (back to the original duration) /
  Dismiss.
- Only one timer can run at a time; starting a new one replaces the
  current one.
- At zero: shows "Rest complete" with a pulse animation. No sound/vibration
  (not supported reliably as a home-screen web app).

**Active workout date**
- The active ("Next Up") workout shows today's date as a read-only badge —
  informational only, not stored, since queued workouts don't get a real
  date until they're completed.
- Other queued/future workouts don't show a date badge (avoids implying
  they're scheduled for "today").

**Workout history**
- Editable workout name and date on the current workout
- "Mark Workout Complete" (header ⋮ menu) saves a full copy of the current
  workout into Past Workouts, then advances to the next queued workout
- "Past Workouts" list (header ⋮ menu → View History), sorted newest first
- Tapping a past workout opens it in the same workout view used for today
- Past workouts open **read-only** by default; an "Edit" button (top nav)
  toggles edit mode on — it becomes "Save" while active, and tapping it
  saves and returns to read-only.
- "Delete Workout" (header ⋮ menu, past workouts only) permanently removes
  a workout after confirming in a custom in-app modal
- "Restore to Queue" — available both from the Workout History list
  (⋮ menu on each entry) and from the header ⋮ menu while viewing a past
  workout. Moves a completed workout back into the active queue as a
  planned workout (status reset, date cleared), preserving all exercise
  data. Confirmed via the standard in-app modal.
- Persistent "Today" button (top nav) appears whenever viewing a past or
  other queued workout, returns to the active workout instantly

**General**
- Installable as a home screen shortcut via browser (Add to Home Screen)
- Works fully offline after first load, including all history/queue features

## Known limitations / things to know
- No login/accounts — data is local to one phone only, not backed up anywhere.
- Superset pairing reorders the exercise list (paired exercises are moved
  next to each other automatically).
- The rest timer doesn't survive the app being fully closed/killed (only
  brief backgrounding); no background notifications.

## Backlog / ideas not yet built
- Search past workouts
- Filter by exercise
- Show personal records
- Compare previous workouts
- Bulk export of all workout history (not tied to a single program)
- Automatic timer start after completing a set
- Audio/vibration alert when the rest timer finishes

## How to resume work in a new chat
1. Upload the current `index.html` and `sw.js`
2. Upload this summary file
3. Say what you want to change or add next

## Working preferences (apply every session)
- This is my first project — explain new technical concepts at a first-year
  university student level as they come up.
- If anything is ambiguous, ask clarifying questions before proceeding.
- Prefer custom in-app modals/banners over native `window.confirm()` /
  `alert()` / `prompt()` for any new confirmation UI (see note above).
- **When wrapping up a session, all hand-over docs must be updated before
  ending, without being asked:**
  1. Provide a git commit message for the session's changes.
  2. Update this file (`PROJECT_SUMMARY.md`) to reflect the current state
     of the app — new features, data model changes, updated limitations/
     backlog — and provide it as a file to save back into the project.
     Since Claude has no memory between chats, this file (re-uploaded each
     time) is the only thing that carries context forward — it must stay
     accurate or the next session starts from stale information.
