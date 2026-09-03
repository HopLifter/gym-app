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
- Cache version: `gym-app-cache-v28` — **bump this every time `index.html`
  changes**, or the phone will keep serving the old cached copy. This is
  the single most common thing to forget when wrapping up a session.
  There's also an `APP_VERSION` constant near the top of `index.html`'s
  script (shown on the Settings → About screen) — **keep it in sync with
  `CACHE_NAME` in `sw.js`, both need bumping together.**

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
  than native dialogs. The shared confirm modal (`openConfirm()`) now takes
  an optional button label and a `danger` flag — `danger: true` gives a red
  destructive button (delete, end program, replace), `danger: false` gives
  an accent/primary button (restore, finish workout) for reversible or
  positive actions.

## Data model
Unchanged this session — no data model or application logic changes, only
navigation/UI reorganization. localStorage keys:
- `gymapp_program_v1` — the currently active imported program, if any:
  `{ id, name, importedAt }`. `null`/absent if no program is active.
- `gymapp_queue_v1` — array of planned workouts, each:
  `{ id, programId, label, date, status: "queued", order, exercises }`.
  `order` determines queue position (ascending); the lowest `order` is the
  "Today's Workout" / active workout. `date` is `null` until the workout is
  completed. `programId` is `null` for ad-hoc workouts.
- `gymapp_history_v1` — array of completed workouts, each:
  `{ id, programId, label, date, status: "completed", note, exercises }`
  (no `order` field — history is sorted by `date`, newest first).
- `gymapp_exercise_list_v1` — flat array of strings, the standardized
  exercise list (formerly the hardcoded `CANONICAL_EXERCISES`). Always
  kept sorted alphabetically by the code that writes it. See "Exercise
  List Management" below.
- Each exercise: `{ id, name, sets, reps, weight, rpe, rest, notes, supersetId }`.
  `rest` is stored **in seconds** internally (see Rest Timer note below).

## Navigation & screen structure (reorganized this session)
The app is now organized around four workflows, each screen showing only
what's relevant to it:

**Workout screen** — perform today's workout. Three sub-states depending on
what's being viewed:
- **Today's Workout** (the actual front-of-queue workout) — the default
  landing view. No back button (it's home). Header ⋮ menu: View Queue,
  View History, Finish Workout, Settings.
- **Queued Workout** (peeked ahead at a future queue item, opened from the
  Queue screen) — shows a "← Back to Queue" button. Finish Workout is
  **not** offered here (you can't finish a workout out of order). Header ⋮
  menu: View Queue, View History, Settings.
- **Past Workout** (opened from History) — shows a "← Back to History"
  button instead of the old ambiguous "Queue" button (which actually
  jumped to today's workout, not the Queue screen — that mislabeled button
  has been removed). Header ⋮ menu: View Queue, View History, Restore to
  Queue, Delete Workout, Settings.

The contextual back button is a single element (`#backNavBtn`) whose label
and destination change based on `backNavTarget` (`"queue"`, `"history"`,
or hidden), set in `renderWorkoutHeader()`.

**Queue screen** — plan future workouts.
- Back button: "← Back to Today's Workout"
- "Current Program" name shown at top (display-only now)
- "+ Add Ad-hoc Workout" directly below the program info, above the list
- Queue item ⋮ menu: Move Up, Move Down, **Delete Workout** (renamed from
  "Remove from Queue" — wording now matches the rest of the app)
- Header ⋮ menu (new): Settings only
- Program management (Start New Program / End Current Program) moved out
  to Settings — no longer editable from here

**History screen** — review completed workouts.
- Back button: "← Back to Today's Workout"
- Tapping an item opens it as a read-only Past Workout (Edit toggles
  edit mode)
- List item ⋮ menu: Restore to Queue
- Header ⋮ menu (new): Settings only

**Settings screen** (new) — infrequent admin actions, reached via
"Settings" at the bottom of every screen's ⋮ menu:
- **About** — app name, `APP_VERSION`, short description
- **Program Management** — shows current program (or "No active program"),
  "Start New Program" (reuses the existing JSON import flow/modal),
  "End Current Program" (only shown when a program is active)
- **Data** — "Export Gym Log" button (opens the existing export modal)
- **Exercise List** — count of standardized exercises + "Manage Exercise
  List" button, opening the dedicated Exercise List sub-page
  (`#exerciseListScreen`, back button returns to Settings). See
  "Exercise List Management" below.

## Current features (as of this version)
**Program & Queue**
- Import a program from JSON — now reached via Settings → Program
  Management → "Start New Program" (same underlying flow/modal as before,
  `openImportModal()`; paste JSON or choose a file). Ask Claude to convert
  a spreadsheet/plan into the expected `{ program: { name }, workouts:
  [...] }` format.
- Export the active program's queued + completed workouts back to JSON.
  (The `exportProgram()` function still exists but has no UI entry point
  — see "Export Gym Log" below, which replaced it as the workflow
  actually used. Kept in code in case it's useful again later.)
- "End Current Program" (Settings) clears its remaining queued workouts
  (completed ones stay in history) and annotates the last completed
  workout.
- Queue screen lists all planned workouts in order; reorder (Move Up/Down),
  Delete Workout, or add a one-off ad-hoc workout.
- The active workout screen always shows the workout at the front of the
  queue ("Today's Workout") unless you've navigated into another queued or
  past workout to view/edit it ahead of time.

**Exercise editing**
- Editable exercise fields: name, sets, reps, weight, RPE, rest time
- Rest time is displayed and edited **in minutes** (e.g. 1.5), stored
  internally in seconds — see Rest Timer note below for why.
- **Decimal fields (Weight, RPE, Rest) accept both `.` and `,` as the
  decimal separator** — some phones only offer a comma on the numeric
  keyboard even in English layouts. These three fields are `type="text"`
  (not `type="number"`, which silently blocks a typed comma on most
  browsers) with `inputmode="decimal"` to still bring up a numeric
  keyboard. All parsing routes through a single `parseDecimalInput()`
  helper that swaps `,` → `.` before converting to a number, so both
  `2.5` and `2,5` store identically. Sets/Reps stay integer-only
  (`type="number"`, `inputmode="numeric"`) and are unaffected. Any new
  decimal field should reuse `parseDecimalInput()` rather than parsing
  `input.value` directly, to keep comma support automatic.
- Auto-calculated Volume (sets × reps × weight)
- Notes field per exercise
- Add / delete exercises, with 6-second undo after delete
- Reorder exercises (Move Up / Move Down)
- Superset pairing: link two exercises, shown grouped with a visual badge

**Export Gym Log**
- Settings → "Export Gym Log" opens a modal that generates tab-separated
  text of completed workouts, formatted to paste directly into the user's
  external Excel gym log with no reformatting.
- Column order (matches the target sheet exactly, paste starting at
  column C): Day, Lift, Sets, Reps, Weight, *(blank — Volume is a formula
  column in the target sheet, intentionally left empty)*, Comments, Rest
  Time (min), RPE.
- One row per exercise (not per set) — sets/reps/weight changes mid-lift
  are handled by the user logging them as separate exercise entries in
  the app, so exercise order in a workout already matches row order
  needed in the log. No per-set data model was needed for this.
- Weight is exported as-is; assumes the user always logs in kg (matches
  their external sheet).
- Rows are sorted chronologically (oldest first) across ALL completed
  workouts by default. Optional From/To date inputs in the modal narrow
  the export to a specific range — both blank exports full history.
- Superset pairs get a `(Superset A)`, `(Superset B)`... tag appended to
  the Rest Time cell (letters assigned per workout, not globally).
- Read-only: pulls from `history` only, never modifies stored data.
- Tries to auto-copy to clipboard on open (and on the explicit "Copy to
  Clipboard" button); the textarea itself is always shown as a manual
  fallback since clipboard permissions can be unreliable in the
  home-screen web app context.

**Recent Performance (Workout Context)**
- Each exercise card has a 📊 "Recent" button (next to the timer button,
  visible in edit and read-only modes alike) that expands an inline panel
  showing the last 3 times an exercise with that name was logged in
  history: date, sets×reps @ weight, RPE, rest time (in minutes), and
  notes/comments (newest first). Notes are only shown if present for that
  session.
- Matches purely by exercise **name** (trimmed, case-insensitive) — there's
  no shared ID linking the same exercise across different workouts/imports,
  so renaming an exercise breaks the match to its own prior history. Worth
  keeping in mind if this becomes confusing in practice.
- No history for that name → panel shows "No history yet for this
  exercise" instead of hiding the button.
- Read-only and inline — no navigation away from the workout, no new
  screen. Toggling is per-exercise (`expandedHistoryIds`, a Set of
  exercise IDs), so multiple panels can be open at once.
- Implemented via `getRecentPerformance(name, limit)`, a standalone
  read-only lookup over `history` — reuse this helper for any future
  "Workout Context" additions (PRs, 1RM trend, notes) rather than writing
  a new history scan.

**Exercise Name Standardization**
- Every editable exercise's name field shows exactly **one** control at
  a time — never both a dropdown and a text box together:
  - Normally, a `<select>` (`nameFieldHTML()`) listing the standardized
    exercise list (`exerciseList`, persisted — see "Exercise List
    Management" below) in alphabetical order, with **"+ New / Custom
    Name"** pinned at the top of the list. The dropdown's own visible
    text is whatever the exercise is currently named — a list entry, or
    (via a synthetic `<option>` inserted just for this) a custom name
    the user already typed. "+ New / Custom Name" is only ever an
    option *inside* the list, never the persistently displayed value.
  - While actively entering a custom name, a plain free-text input plus
    an inline **"+ Add to Exercise List"** button (no dropdown visible).
    Entered by picking "+ New / Custom Name" from the dropdown (clears
    the name, focuses the input) or by tapping "+ Add Exercise" (new
    exercises start blank, straight into this text-entry state).
    Leaving the field (blur) or pressing Enter exits back to the
    dropdown view, now showing whatever was typed; tapping "+ Add to
    Exercise List" instead adds it to the standardized list (see below)
    and also exits back to the dropdown view, now showing it selected.
  - Which state an exercise is in is tracked in `customNameEditingIds`
    (a `Set` of exercise ids), cleared on delete/undo-safe cleanup.
- If an exercise's current name exactly matches a list entry
  (case/punctuation/whitespace-insensitive), the dropdown pre-selects
  that entry.
- Read-only views (viewing a past workout without Edit active) are
  unaffected — still a plain disabled text field, no dropdown.
- `findCanonicalMatch()` (exact-match lookup) is a small, reusable
  helper decoupled from the list itself.
- Note: an earlier version of this feature tried fuzzy "did you mean"
  suggestions instead of a dropdown; that approach was replaced with
  the simpler, unambiguous picker above. A later revision removed the
  earlier design where the dropdown and a text box were shown together
  at the same time.

**Exercise List Management**
- The standardized exercise list is no longer hardcoded — it's
  persisted in localStorage (`gymapp_exercise_list_v1`, a flat array of
  strings) and fully user-editable. Managed via `exerciseList` (a
  module-level array, always kept sorted alphabetically by every
  function that mutates it — nothing downstream needs a separate
  "_SORTED" copy).
- **Migration**: on first load with no saved list yet, `exerciseList`
  is seeded from `MIGRATION_SEED_EXERCISES` (the old hardcoded 57-entry
  list), sorted, and saved. That seed constant is only ever read once,
  on that first migration — editing it after a user already has a
  saved list has no effect. Existing queue/history/program data is
  untouched by this migration.
- **Settings → Exercise List** (`#exerciseListScreen`): lists every
  standardized exercise alphabetically, each with a "Remove" button (a
  confirm modal warns that it won't affect past workouts using that
  name), plus a text input + "Add" button at the top (also submits on
  Enter). Inline error text covers empty/duplicate input.
- **Add from today's workout**: while entering a custom exercise name
  during a workout (see above), a "+ Add to Exercise List" button
  promotes that name straight into the standardized list without
  leaving the workout — it becomes available in the dropdown
  immediately (same in-memory `exerciseList` array, no reload needed).
- `addExerciseToList(rawName)` — trims whitespace, rejects empty input
  and exact case-insensitive duplicates (`isDuplicateExerciseName()`),
  otherwise pushes + re-sorts + persists. Returns
  `{ ok: true }` or `{ ok: false, reason: "empty" | "duplicate" }` so
  both the Settings page and the in-workout button can show the same
  error handling.
- `removeExerciseFromList(name)` — filters the name out of
  `exerciseList` and persists; never touches `queue` or `history`, so
  workouts (past or planned) that already used a removed name keep
  their data exactly as-is. They just won't offer that name as a
  dropdown suggestion going forward.
- Deliberately **not fuzzy**: duplicate detection here is exact
  (case/whitespace-insensitive only). The separate name-suggestion
  dropdown (above) is what handles near-matches; list management stays
  simple on purpose, per this feature's scope.
- Fixed a bug where "+ Add to Exercise List" silently did nothing:
  clicking it blurs the name input first, which fired the field's
  `focusout` handler and collapsed it back to the dropdown *before*
  the button's own click could register — removing the button out from
  under the pending click. A first attempt just deferred that collapse
  with `setTimeout(0)`, which wasn't reliable enough in practice. Fixed
  properly by calling `preventDefault()` on the button's `mousedown`,
  which stops the browser from shifting focus off the input at all —
  so the blur/`focusout` never fires in the first place; the click
  still fires normally afterward. The `setTimeout(0)` deferral is kept
  as a backstop for non-mouse focus changes (e.g. keyboard Tab). Worth
  keeping in mind for any future button placed inside a field that
  also reacts to blur.

**Rest Timer**
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
- **Timestamp-based, so it stays accurate through backgrounding** — the
  countdown is calculated from a fixed start time + duration vs. the
  current time (not a per-tick decrement), so it self-corrects if you
  switch apps, lock your phone, or take a call, and displays the correct
  remaining time the moment you come back. A `visibilitychange` listener
  forces an immediate recheck on return, so a timer that already expired
  in the background shows "Rest complete" right away instead of waiting
  for the next tick. It still doesn't survive the app being fully closed/
  killed (in-memory state only, no persistence to localStorage) — that
  remains a known limitation, not background notifications/vibration
  either.

**Active workout date**
- Today's Workout shows today's date as a read-only badge — informational
  only, not stored, since queued workouts don't get a real date until
  they're completed.
- Other queued/future workouts don't show a date badge (avoids implying
  they're scheduled for "today").

**Workout history**
- Editable workout name and date on the current workout
- "Finish Workout" (header ⋮ menu, only available when viewing today's
  actual active workout) now asks for confirmation first — "Finish
  Workout?" / "This will move today's workout into your history and make
  the next queued workout active." — before saving a full copy into Past
  Workouts and advancing to the next queued workout.
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
- "← Back to History" button (top nav) appears whenever viewing a past
  workout, returns to the History list.

**General**
- Installable as a home screen shortcut via browser (Add to Home Screen)
- Works fully offline after first load, including all history/queue features

## Known limitations / things to know
- No login/accounts — data is local to one phone only, not backed up anywhere.
- Superset pairing reorders the exercise list (paired exercises are moved
  next to each other automatically).
- The rest timer doesn't survive the app being fully closed/killed (only
  brief backgrounding); no background notifications.
- Export Gym Log assumes weight is always entered in kg — no unit
  conversion. If the target sheet's column order/layout ever changes,
  update the column list inside `buildGymLogExportRows()` to match.
- `APP_VERSION` (shown on Settings → About) is a separate constant from
  `CACHE_NAME` in `sw.js` — both must be bumped together by hand, there's
  no single source of truth for the version string yet.

## Backlog / ideas not yet built
- Rename an existing standardized exercise (currently: remove + re-add)
- Merge two standardized exercises into one
- Aliases/synonyms for a standardized exercise
- Search/filter within the Exercise List page or the name dropdown
  (both currently just a plain alphabetical list)
- Import/export the exercise list
- Usage stats (how often each standardized exercise is used)
- Search past workouts
- Filter by exercise
- Show personal records (natural next step on top of Recent Performance)
- Estimated 1RM / volume trends (natural next step on top of Recent Performance)
- Match recent performance by a stable exercise ID instead of name, so
  renaming an exercise doesn't break its history match
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
