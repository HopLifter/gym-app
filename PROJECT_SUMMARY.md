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
- Workout plan is currently edited directly in the app (not yet synced from Excel)
- Cache version: `gym-app-cache-v7` (bump this in `sw.js` every time
  `index.html` changes, or the phone will keep serving the old cached copy)

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
- `gymapp_current_v1` (localStorage key) — today's/current in-progress
  workout: `{ name, date, exercises }`
- `gymapp_history_v1` (localStorage key) — array of completed past
  workouts, each: `{ id, name, date, exercises }`
- Old single-workout data (`gymapp_state_v3`) auto-migrates into
  `gymapp_current_v1` on first load for existing users.

## Current features (as of this version)
**Exercise editing**
- Editable exercise fields: name, sets, reps, weight, RPE, rest time
- Auto-calculated Volume (sets × reps × weight)
- Notes field per exercise
- Add / delete exercises, with 6-second undo after delete
- Reorder exercises (Move Up / Move Down)
- Superset pairing: link two exercises, shown grouped with a visual badge

**Workout history (new this session)**
- Editable workout name and date on the current workout
- "Mark Workout Complete" (header ⋮ menu) saves a full copy of the current
  workout into Past Workouts, then resets the current workout to the
  default template
- "Past Workouts" list (header ⋮ menu → View History), sorted newest first
- Tapping a past workout opens it in the same workout view used for today
- Past workouts open **read-only** by default; an "Edit" button (top nav)
  toggles edit mode on — it becomes "Save" while active, and tapping it
  saves and returns to read-only. Read-only mode is restored automatically
  every time a past workout is reopened.
- "Delete Workout" (header ⋮ menu, past workouts only) permanently removes
  a workout after confirming in a custom in-app modal (not
  `window.confirm()` — see note above)
- Persistent "Today" button (top nav) appears whenever viewing a past
  workout, returns to the current workout instantly with all in-progress
  data intact
- Editing a past workout's date automatically re-sorts its position in
  the Past Workouts list
- Editing a past workout never affects the current/today workout, and
  vice versa

**General**
- Installable as a home screen shortcut via browser (Add to Home Screen)
- Works fully offline after first load, including all history features

## Known limitations / things to know
- No Excel sync yet — workout data is edited by hand in the app.
- No login/accounts — data is local to one phone only, not backed up anywhere.
- Superset pairing reorders the exercise list (paired exercises are moved
  next to each other automatically).
- No way to plan multiple future workout days yet — only one "current"
  workout slot exists; completing it resets to a single default template.

## Backlog / ideas not yet built
- Sync workout plan from an Excel export (CSV import)
- Multiple workout days / a weekly schedule view (e.g. pre-loading 40–50
  planned workouts and stepping through them)
- Search past workouts
- Filter by exercise
- Show personal records
- Compare previous workouts
- Export workout history

## How to resume work in a new chat
1. Upload the current `index.html` and `sw.js`
2. Upload this summary file
3. Say what you want to change or add next

## Working preferences (apply every session)
- This is my first project — explain new technical concepts at a first-year
  university student level as they come up.
- When wrapping up a session, provide a git commit message for the latest changes.
- If anything is ambiguous, ask clarifying questions before proceeding.
- Prefer custom in-app modals/banners over native `window.confirm()` /
  `alert()` / `prompt()` for any new confirmation UI (see note above).
