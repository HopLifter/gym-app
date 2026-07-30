# Gym Workout App — Project Summary

## What this is
A free, offline-first workout tracker for personal phone use. Built as a
single-page web app (not a native app) so there's no App Store, no fees,
no subscriptions. Supports importing full multi-week training programs
(converted from a spreadsheet by Claude) as well as one-off ad-hoc workouts.

## Live setup
- Hosted on GitHub Pages: https://hoplifter.github.io/gym-app/
- Repo: github.com/HopLifter/gym-app
- Files: `index.html` (the whole app) + `sw.js` (offline caching)
- No backend/server — all data lives in the browser's localStorage on the phone
- Cache version: `gym-app-cache-v8` (bump this in `sw.js` every time
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
Three localStorage keys:

- `gymapp_program_v1` — a single object (or `null`) describing the one
  active program: `{ id, name, importedAt }`
- `gymapp_queue_v1` — array of workouts not yet done, ordered by `order`:
  `{ id, programId, label, date, status: "queued", order, exercises }`.
  `date` is `null` until completed. `programId` is `null` for ad-hoc workouts.
- `gymapp_history_v1` — array of completed workouts, sorted by `date` at
  render time (so ad-hoc and program workouts interleave naturally by the
  date they were actually performed): `{ id, programId, label, date,
  status: "completed", exercises, note }`. `note` is optional — e.g. set
  automatically when a program is ended.

Only one program can be active at a time. Ending a program discards its
remaining queued workouts (completed ones stay in history) and stamps a
note on the last completed workout from that program. Starting a new import
while a program is active prompts to end the old one first.

Each exercise: `{ id, name, sets, reps, weight, rpe, rest, notes, supersetId }`.

## Import / Export format
One JSON schema, used for both:
```json
{
  "program": { "name": "..." },
  "workouts": [
    { "label": "...", "exercises": [
      { "name": "...", "sets": 3, "reps": 5, "weight": 100, "rpe": 8,
        "rest": 180, "notes": "..." }
    ] }
  ]
}
```
Claude converts spreadsheets to/from this format on request — the app
itself only ever reads/writes this one JSON shape (no in-app CSV parsing).
Import is available via the header ⋮ menu or the Queue screen; supports
pasting JSON or choosing a file. Export downloads the active program's
remaining queue + its completed history as one JSON file.

## Current features (as of this version)
**Program & queue**
- Import a program (JSON paste or file) — becomes the active program,
  its workouts populate the queue in order
- Queue screen: ordered list of upcoming workouts (program + ad-hoc mixed),
  each with Move Up / Move Down / Remove from Queue
- "Next Up" workout is always the first item in the queue; tapping any
  other queued workout jumps to it without changing the order
- "+ Add Ad-hoc Workout" — inserts a blank workout at the front of the
  queue for one-off sessions (e.g. traveling, deviating from the plan)
- Export active program (remaining queue + its completed history) as JSON
- End Program — discards its remaining queued workouts, keeps completed
  ones in history, and leaves a note on the last one completed

**Exercise editing** (queue items always editable; history read-only by default)
- Editable exercise fields: name, sets, reps, weight, RPE, rest time
- Auto-calculated Volume (sets × reps × weight)
- Notes field per exercise
- Add / delete exercises, with 6-second undo after delete
- Reorder exercises (Move Up / Move Down)
- Superset pairing: link two exercises, shown grouped with a visual badge

**Workout history**
- "Mark Workout Complete" (header ⋮ menu, queue items only) sets the date
  to today (editable afterward), moves the workout into history, and
  removes it from the queue
- "Past Workouts" list, sorted newest first
- Past workouts open **read-only** by default; "Edit" toggles edit mode
  (becomes "Save" while active). Read-only is restored every time a past
  workout is reopened.
- "Delete Workout" (history only) permanently removes a workout after
  confirming in a custom in-app modal
- Editing a past workout's date automatically re-sorts its position

**General**
- Installable as a home screen shortcut via browser (Add to Home Screen)
- Works fully offline after first load, including import/export and all
  history features

## Known limitations / things to know
- One active program at a time — starting a new import ends the current
  one (with confirmation). Ad-hoc workouts are unaffected.
- No login/accounts — data is local to one phone only, not backed up
  anywhere except via manual Export.
- Superset pairing reorders the exercise list (paired exercises are moved
  next to each other automatically).

## Backlog / ideas not yet built
- Search past workouts
- Filter by exercise
- Show personal records
- Compare previous workouts
- Auto-progression (e.g. bump weight based on last session's RPE)

## How to resume work in a new chat
1. Upload the current `index.html` and `sw.js`
2. Upload this summary file
3. Say what you want to change or add next

## Converting a spreadsheet program to the import format
When asked to convert a spreadsheet (e.g. a % 1RM-based training block) into
`program_import.json`:
- Read cell values with openpyxl (`data_only=True`) rather than trusting a
  flattened text preview — merged headers and side-by-side day blocks don't
  survive a naive text dump.
- The app's numeric fields (sets/reps/RPE/rest) take a single number; when
  the source gives a range, **use the upper limit** as the numeric value and
  put the exact original range in `notes` (e.g. `"Target: reps 4-5, RPE
  6–7, rest 3–4 min. ..."`) so nothing is lost.
- Round `rest` to the nearest 0.5 min (30s) when converting from minutes.
- A dash/em-dash for sets (meaning "work up, not fixed") defaults to `1`.
- A non-numeric weight cell (e.g. "by feel") should NOT default silently to
  `0` — flag it and ask the user for a real number per exercise before
  finalizing the file.
- Always sanity-check any day-swap notes or irregular weeks called out in
  the source (e.g. "Day C & D swapped this week") against the user's
  intent — don't assume the label should follow the swap.

## Working preferences (apply every session)
- This is my first project — explain new technical concepts at a first-year
  university student level as they come up.
- When wrapping up a session, provide a git commit message for the latest changes.
- If anything is ambiguous, ask clarifying questions before proceeding.
- Prefer custom in-app modals/banners over native `window.confirm()` /
  `alert()` / `prompt()` for any new confirmation UI (see note above).
