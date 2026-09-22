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
- Cache version: `gym-app-cache-v50` — **bump this every time `index.html`
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
  than native dialogs. The shared confirm modal (`openConfirm()`) takes an
  optional button label and a `danger` flag — `danger: true` gives a red
  destructive button (delete, end program, replace, leave without saving),
  `danger: false` gives an accent/primary button (restore, finish workout)
  for reversible or positive actions.
- **Custom dd/mm/yyyy text fields instead of native `<input type="date">`**
  — native date pickers display in whatever format the phone's OS/browser
  locale uses (often mm/dd/yyyy), and there's no way to force that. Any
  future date input should follow the same pattern (see "Date Handling"
  below) rather than reaching for `type="date"`.

## New/changed this session: Timer Reset Automatically Restarts
**Why**: pressing Reset on the rest timer used to just zero the clock and
stop — you then had to tap Resume/Start separately to actually begin
resting again. That's an extra tap every time you want to restart a
timer (e.g. you moved too soon and want to redo the rest period).

**What changed** — all in `index.html`'s `resetRestTimer()`:
- Reset now immediately begins a fresh countdown instead of leaving the
  timer stopped: it re-arms the timestamp-based interval
  (`runRestTimerInterval()`) the same way `startRestTimer()` does,
  rather than only resetting `remaining` and setting `running = false`.
- The duration Reset restarts at is `restTimer.duration` — this already
  held the duration of whichever exercise's timer was **most recently
  started** (it's set once inside `startRestTimer(ex)` and nothing else
  touches it afterward), so no new state was needed to "remember" the
  last-used duration. Starting a different exercise's timer replaces
  `restTimer` entirely, which naturally updates what Reset uses next.
- A 0-second duration still resets to the immediate "Rest complete"
  state rather than starting a countdown, matching `startRestTimer()`'s
  existing handling of that edge case.

**Architecture note**: no new data structure or persistent state was
needed — `restTimer.duration` was already exactly "the last-started
timer's duration" by construction, since the whole `restTimer` object is
replaced on every `startRestTimer()` call. The existing timestamp-based
countdown (`endAt` computed from `Date.now()`) is untouched; Reset just
calls the same re-arming path Start already uses. Pause and completion
behavior are unchanged — only Reset's own behavior changed.

**Testing performed**: started a 90s timer → Reset → restarted counting
from 90s immediately; started a 120s timer on a second exercise → Reset
→ restarted from 120s; reset while running; reset after completion
(rest complete → Reset → fresh countdown); paused then reset (goes
straight to a running countdown, not paused); backgrounded/foregrounded
mid-restarted-timer and confirmed the remaining time still recalculates
correctly via the existing `visibilitychange` handler.

**Limitations**: none identified — this was a small, isolated change to
one function.

## New/changed this session: Condensed History (Past Workout) View
**Why**: opening a completed workout from History reused the same
card-based layout as Today/Queue — editable-looking input boxes, one tall
card per exercise, lots of scrolling for anything but the shortest
workout. Reviewing a finished workout, or screenshotting it to share, was
awkward because the layout was built for editing, not for reading at a
glance.

**What it is**: a dedicated, read-only, condensed table presentation
shown automatically whenever a completed workout is opened from History
and **not** being edited. It replaces the exercise cards with a compact
grid (Exercise / Sets × Reps / Wt (kg) / RPE / Rest (min)), aiming to fit
a typical workout on one screen for a clean screenshot.

**Design process**: three initial layout concepts were mocked up
(compact list, table, condensed cards) with realistic sample data; the
table was selected, then refined over several rounds of feedback —
header wording/layout, unit labels moved into the column headers,
missing-value handling, column alignment, and — after two earlier
attempts (a bordered box, then a padding-based side line that broke
column alignment) — the current superset indicator, which is a
zero-layout-impact overlay rather than anything that affects row width.

**What changed** — all in `index.html`:
- **`isCondensedHistoryView()`** (new helper): true only when
  `viewSource === "history" && !editMode`. This is the single switch
  everything below branches on.
- **`render()`**: now calls `renderCondensedExercises()` (populates the
  new `#condensedTable`) when condensed, or the existing
  `renderExercises()` (populates `#workout`, unchanged) otherwise.
  `toggleCondensedVisibility()` shows/hides whichever container applies.
  `#addBtn` was already hidden whenever `!isEditable()`, which is exactly
  the condensed case, so no extra logic was needed there.
- **Header**: no structural change needed — the title-inline-with-
  Edit/⋮-menu layout for a Past Workout already existed from a previous
  session. The date row now branches: editing shows the existing
  editable dd/mm/yyyy field; the condensed view shows a new plain-text
  date (`#dateText`, using `formatDateDisplay()`) with no input-box
  styling, since it's not editable here.
- **`renderCondensedExercises()` / `condensedRowHTML()`** (new): build
  the table as a CSS grid (`.condensed-cols` etc.), one row per
  exercise. Notes render directly under their own exercise's row (not a
  separate footnote block). Missing Sets/Reps/Weight/RPE/Rest show as
  "–" (`fmtOrDash()`) instead of a blank cell. Weight is bold; every
  other stat column (including a "–") shares one consistent
  size/weight/color so the row doesn't look inconsistently styled.
  Column headers ("Sets × / Reps", "Wt / (kg)", "Rest / (min)") wrap to
  two lines deliberately, sized for that. A long exercise name wraps to
  a second line with plain text wrapping only — no indent/hanging-tab —
  so row separation always comes from the border under each row, not
  from indentation, regardless of how long a name gets.
- **Superset indicator**: a thin gray line (`--hist-superset` token) in
  the page's own right-hand padding gutter, drawn via an absolutely-
  positioned `::after` overlay on `.condensed-superset-wrap` rather than
  border/padding on the row. This was a deliberate fix: an earlier
  version added right-padding to make room for the line, which shrank
  that row's grid width relative to every other row and threw the
  columns out of alignment. The overlay approach adds no layout width at
  all, so the superset rows are always pixel-identical in width to
  every other row.
- Empty workout (no exercises logged): condensed view shows a plain "No
  exercises logged." message instead of an empty table.

**Editing**: pressing the existing **Edit** button sets `editMode = true`,
which makes `isCondensedHistoryView()` false and `render()` falls
through to the regular, already-editable exercise cards — no new editing
UI was built. **Save** reverses it exactly as before. This was the
explicit design goal: History → Condensed View → Edit → the same
Regular Workout Edit View that Queue/Today already use.

**Bug fix (same session)**: a note was rendering as a separate sibling
row at the table level, positioned after its own exercise's stat row in
markup but with no structural link tying it there — combined with a
`:last-of-type` border rule that matches by tag name (`<div>`), not
class, this was fragile enough that a note could read as attached to
the wrong row. Fixed by nesting each note **inside** its own exercise's
`.condensed-entry` container (stat row, then note, both inside one
block) instead of as a table-level sibling, and switching the
"last row, no border" logic from `:last-of-type` to `:last-child`
(which checks actual DOM position, not tag name) — both in
`condensedRowHTML()`/`.condensed-entry` CSS.

**Styling tweak (same session)**: all column headers and stat values
(Sets × Reps, Wt, RPE, Rest) are left-justified instead of centered, to
match the exercise name column. The exercise name itself has no
left padding/indent — it sits flush with the other columns' left edge.

**Data model**: no changes. This is purely a new presentation layer over
the existing `exercises` array — the empty-string states for
sets/reps/weight/rpe/rest that the data model already supported are just
formatted differently (as "–") for display now, nothing new was added to
support it.

## Feature added (previous session): Superset State Consistency and Group Behavior
**Why**: supersets had three related problems — removing a superset left
the *other* exercise's `supersetId` stale (so it kept showing "Remove
Superset" even though it was no longer paired), the two exercises'
rest times were fully independent even though they rest together in
practice, and reordering only moved one exercise at a time, which could
separate a pair or interleave it with another pair.

**Architecture note**: no data-model change was needed. Supersets are
still just a shared `supersetId` string on each exercise, with adjacency
in the `exercises` array being what makes them render as a paired group.
Only pairs are supported (matches existing scope — nothing creates
groups of 3+).

**What changed** — all in `index.html`'s exercise-card click/input
handlers:
- **Removing a superset** (⋮ menu → "Remove Superset") now looks up the
  partner exercise (`findSupersetPartner()`, matches by `supersetId`,
  excludes self) and clears `supersetId` on both, in one save.
- **Shared rest time**: pairing two exercises (`pairSuperset()`) now
  copies the first exercise's rest onto the second immediately. After
  that, editing rest on either exercise's input finds the partner and
  mirrors the new value onto both the partner's data *and* its
  on-screen input (direct DOM update, not a re-render, so it doesn't
  steal focus). Works through the existing `parseDecimalInput()`/
  comma-decimal path unchanged.
- **Group reordering**: Move Up / Move Down on a superset member now
  moves both exercises together as one 2-item block
  (`moveSupersetGroup()`), preserving their internal order, and hops
  over the correct number of items whether the adjacent slot is a lone
  exercise or another superset pair.
- Since Today's Workout, a peeked Queued Workout, and an editing Past
  Workout all render through the same `cardHTML()`/`renderExercises()`
  and share one set of container-level event listeners, all three fixes
  apply everywhere superset editing is possible.

## Bug fix (2 sessions ago)
- **"New Exercise" option was unresponsive on a brand-new exercise.** A
  freshly added exercise has `name: ""`, and the name dropdown always
  lists "New Exercise" as its first `<option>` — so with nothing else
  selected, the browser auto-selects it by default. Tapping "New
  Exercise" again therefore didn't change the `<select>`'s value, so the
  code that opens the free-text input (`customNameEditingIds`) never
  ran. **Fix**: `nameFieldHTML()` now gives a nameless exercise a
  hidden, disabled placeholder `<option value="">` as its true starting
  selection (instead of "New Exercise" itself), so picking "New
  Exercise" is always a real value change from `""` → `__custom__`.

## Data model
No data model changes this session — the condensed History view is
purely a new read-only presentation over the existing `exercises` array.
localStorage keys:
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
  exercise list. Always kept sorted alphabetically by the code that writes it.
- Each exercise: `{ id, name, sets, reps, weight, rpe, rest, notes, supersetId }`.
  `rest` is stored **in seconds** internally (see Rest Timer note below).
  `sets`/`reps`/`weight`/`rpe`/`rest` can individually be `""` (an empty
  field the user cleared) — the condensed History view now renders any
  of these as "–" rather than leaving a blank cell; this state already
  existed in the data model before this session, just wasn't specially
  formatted anywhere.
  For superset pairs, both exercises' `rest` values are kept equal by
  the app's code whenever either is edited or the pair is first created
  — but this isn't structurally enforced (no schema-level shared field),
  so anything that writes to `rest` outside the normal UI flow (e.g. a
  hand-edited import file) could still leave them mismatched until one
  is edited again.
  All date values in the data model are stored as ISO `yyyy-mm-dd` strings
  regardless of how they're displayed (see "Date Handling" below).
- Weight is assumed to always be entered/stored in **kg** — see Backlog
  for a floated (not yet built) unit-conversion idea.

## Date Handling
Every date the app displays now reads **dd/mm/yyyy** consistently,
regardless of the phone's OS/browser locale:
- **Read-only display**: `isoToDMY(iso)` → `dd/mm/yyyy`, used by
  `formatDateBadge()` (Today's Workout date badge). `formatDateDisplay()`
  (History list, Recent Performance rows, and now the condensed History
  view's date line) uses the same day-first convention but spells out
  the weekday/month (`Weekday, D Mon YYYY`).
- **Editable date fields**: native `<input type="date">` was replaced
  everywhere with a plain text field (`inputmode="numeric"`,
  `placeholder="dd/mm/yyyy"`), since native date pickers render in
  whatever format the phone's locale dictates and that can't be
  overridden. Affects three fields: the Past Workout date editor
  (`#dateInput`, shown only while a Past Workout is in edit mode — see
  Navigation section), and Export Gym Log's From/To range
  (`#exportGymLogFrom` / `#exportGymLogTo`).
- **Supporting helpers** (all reusable for any future date field):
  - `isoToDMY(iso)` — ISO → `dd/mm/yyyy` display string.
  - `parseDMYToISO(str)` — parses `dd/mm/yyyy` text back to ISO, with
    real validation (month range, day-of-month range including leap
    years); returns `null` if invalid/incomplete.
  - `applyDateMask(el)` — live-formats a text field as the user types or
    pastes: strips non-digits, caps at 8 digits, re-inserts the two `/`
    separators. Wired to each field's `input` event.
  - Each field also has a `blur` handler: empty → defaults sensibly
    (e.g. today's date for the workout editor); valid `dd/mm/yyyy` →
    parses and saves; invalid/incomplete → silently reverts the display
    back to the last valid stored value, so bad input can't get saved.

## Navigation & screen structure
**Bottom tab bar** (`#bottomNav`) — History / Today / Queue / Settings,
fixed to the bottom of the screen, the only way to switch between the
four top-level screens (no back buttons or ⋮-menu shortcuts to them
exist anymore anywhere in the app).
- Visible on all four top-level screens (Workout, Queue, History,
  Settings). Hidden only on the Exercise List sub-page.
- **Buttons sit flush to the true bottom edge** (`bottom: 0`, no gap
  below the bar) so the button background/border always reach the
  screen edge and nothing scrolled ever shows through underneath. The
  label itself is lifted up for thumb reach via the button's own
  generous **bottom padding** (`calc(env(safe-area-inset-bottom) +
  var(--bottom-nav-gap))`) rather than an external offset.
- **Buttons touch edge-to-edge with no gap between them** and have a
  flat, unrounded bottom edge (`border-radius: 14px 14px 0 0;
  border-bottom: none`) — only the top corners round.
- Active tab turns accent-green (border + text). Active-tab logic
  reflects where the content actually lives, not just which screen is
  showing: while on the Workout screen, peeking a **non-next** Queued
  Workout keeps **Queue** highlighted (not Today), and viewing a Past
  Workout keeps **History** highlighted.
- "Today" always calls `goHome()` (resets to the front-of-queue
  workout). Queue/History/Settings call `navigateTo(view)`, a thin
  wrapper around `showScreen(view)`.

**Sticky headers** — the top part of Workout, Queue, and History stays
fixed in place while the content below it scrolls.
- Shared `.sticky-header` class (`position: sticky; top: 0`) used by all
  three. **Important CSS detail**: it also cancels out the body's own
  20px top padding via `margin-top: -20px; padding-top: 20px`, moving
  that space *inside* the sticky box.
- **Workout screen**: sticky zone = eyebrow row (label + ⋮ menu) + title
  row + date badge/input/text, wrapped in `#workoutStickyHeader`.
- **Queue screen**: sticky zone = `<h1>Queue</h1>` + the program-info
  bar, wrapped in `#queueStickyHeader`.
- **History screen**: sticky zone = just `<h1>History</h1>`, wrapped in
  `#historyStickyHeader` with the `.sticky-header--gap` modifier.

**Workout screen header — no back button.** The bottom tab bar's
Queue/History tabs handle returning to those screens. Header layout for
the two "peek" states (a non-next Queued Workout, or a Past Workout):
- **Today's Workout / empty state** (`backNavTarget === null`):
  two-row layout — eyebrow label + ⋮ menu on one row (`#eyebrowRow`),
  editable title below it on its own row.
- **Peeked Queued Workout / Past Workout** (`backNavTarget` set): the
  eyebrow row is hidden entirely, and the title moves up into a single
  row alongside the ⋮ menu: `[title (flex, fills space)]
  [Edit/Save button, History only] [⋮ menu]`. This same row layout is
  what the condensed History view uses too — no separate "History ·
  Completed" label, just the title inline with Edit and ⋮.
- Below the title row: while editing a Past Workout, the existing
  editable dd/mm/yyyy date field shows; while viewing the condensed
  (non-edit) History presentation, a new plain-text date line
  (`#dateText`, weekday + full date, no box styling) shows instead —
  see "Condensed History (Past Workout) View" above.
- **`#navRight`** (the ⋮ menu button + dropdown) is a single DOM node
  reparented by `positionHeaderMenu()` between `#eyebrowRow` (Today) and
  `#titleRow` (peek views/condensed History) — one menu, one set of
  listeners, just moved.

**Edit/Save toggle button** (`#editToggleBtn`, History only) — sits in
`#titleRow` immediately to the left of the ⋮ menu. Reads "Edit" when
showing the condensed presentation (click enters edit mode, switching to
the regular editable cards); reads "Save" while editing (click saves,
exits edit mode, returns to the condensed presentation). Hidden entirely
for Queue workouts, which have no read-only/edit-mode concept.

**Edit-mode guard** — editing a Past Workout is a bounded, deliberate
action. The only way to leave the Workout screen while
`viewSource === "history" && editMode` is the bottom tab bar, so
`guardLeavingEdit()` wraps all four bottom-nav click handlers: mid-edit,
it opens a "Leave without saving?" confirm before proceeding.

**Queue screen wording** — "Add Workout" (both the Queue screen's button
and the Workout screen's empty-state button).

**Settings screen** — spacing added between the `<h1>Settings</h1>`
title and the first section box below it.

**Exercise List** — a Settings sub-page (`#exerciseListScreen`), reached
only via Settings, with its own hardcoded "Back to Settings" button.
Does **not** get the bottom tab bar or a sticky header.

## Screen-by-screen summary
**Workout screen** (Today's Workout / peeked Queued Workout / Past
Workout / empty state) — see "Navigation & screen structure" above for
header behavior. Sticky header; content scrolls beneath it.
- **Today's Workout / Queue / editing a Past Workout**: the regular,
  editable exercise cards (`renderExercises()` → `#workout`). Superset ⋮
  menu items ("Superset" / "Remove Superset", Move Up/Down) operate on
  the pair as a unit where relevant.
- **Viewing a Past Workout (not editing)**: the new condensed table
  presentation (`renderCondensedExercises()` → `#condensedTable`) — see
  "Condensed History (Past Workout) View" above. Read-only; "Edit"
  switches to the regular cards above.

**Queue screen** — plan future workouts.
- Sticky: `<h1>Queue</h1>` + "Current Program" info bar.
- Scrolls: "Add Workout" button + the queue list.
- Queue item ⋮ menu: Move Up, Move Down, Delete from Queue.
- No back button, no screen-level ⋮ menu — use the bottom tab bar.

**History screen** — review completed workouts.
- Sticky: `<h1>History</h1>` only, with a small gap before the list.
- Tapping an item opens it as a read-only Past Workout, now shown in the
  condensed table presentation by default.
- List item ⋮ menu: Restore to Queue, Delete from History.
- No back button, no screen-level ⋮ menu — use the bottom tab bar.

**Settings screen** — infrequent admin actions, reached via the bottom
tab bar's "Settings" button from anywhere:
- **About** — app name, `APP_VERSION`, short description
- **Program Management** — current program (or "No active program"),
  "Start New Program", "End Current Program" (only when active)
- **Data** — "Export Gym Log", "Backup All Data", "Restore from Backup"
- **Exercise List** — count of standardized exercises + "Manage
  Exercise List" button
- No back button, no ⋮ menu — use the bottom tab bar.

**Delete action naming and styling** — "Delete from Queue" / "Delete
from History" everywhere, both entry points per destination sharing one
confirm helper and one `data-action` name each.

## Current features (as of this version)
**Program & Queue**
- Import a program from JSON — Settings → Program Management → "Start
  New Program", or the Workout empty-state's "Start New Program" button.
- "End Current Program" clears remaining queued workouts (completed ones
  stay in history) and annotates the last completed workout.
- Queue screen lists all planned workouts in order; reorder, delete, or
  add a one-off "Add Workout" ad-hoc entry.
- The active workout screen always shows the front-of-queue workout
  unless you've navigated into another queued or past workout to peek
  at it.

**Exercise editing** (Today/Queue, or a Past Workout in edit mode)
- Editable fields: name, sets, reps, weight, RPE, rest time (displayed/
  edited in minutes, stored in seconds).
- Decimal fields (Weight, RPE, Rest) accept both `.` and `,` as the
  decimal separator on input (`parseDecimalInput()`).
- Auto-calculated Volume (sets × reps × weight), Notes field, add/delete
  (6s undo), reorder, superset pairing.
- New exercises start directly in the name **dropdown** (first option
  "New Exercise"), not the free-text input.

**Supersets**
- Pair two exercises via the ⋮ menu's "Superset" action, then tap the
  exercise to pair with; they render in a shared bordered group (in the
  editable card view) or with a thin right-edge gray line (in the
  condensed History view — see below).
- Removing a superset clears the pairing on **both** exercises.
- The two exercises in a pair **share one rest time**: set on either
  one, it updates on both immediately.
- Move Up / Move Down on a superset member moves **both** exercises
  together as one block.
- Still pairs only (no 3+ groupings) — matches existing scope.

**Condensed History (Past Workout) View** (new this session)
- Opening a completed workout from History shows a compact, read-only
  table instead of the regular exercise cards — title inline with Edit
  and the ⋮ menu, plain-text date below, then a table of Exercise /
  Sets × Reps / Wt (kg) / RPE / Rest (min).
- Missing values show as "–"; notes appear directly under their
  exercise; superset pairs are marked with a thin gray line along the
  table's right edge.
- Optimized to fit a typical workout on one screen for screenshotting,
  without scrolling to read a longer workout.
- "Edit" switches to the regular, already-editable card layout; "Save"
  returns to the condensed view. No separate editing UI was built.

**Backup All Data / Restore from Backup**
- Settings → "Backup All Data" downloads a single date-stamped JSON file
  containing everything (Program, Queue, History, Exercise List).
- Settings → "Restore from Backup" picks that file back up on any
  device/browser and fully replaces current data with it, after a
  confirm modal. Full replace only.

**Export Gym Log**
- Settings → "Export Gym Log" opens a modal generating tab-separated
  text of completed workouts, formatted to paste directly into the
  user's external Excel gym log.
- Column order: Day, Lift, Sets, Reps, Weight, *(blank — Volume formula
  column)*, Comments, Rest Time (min), RPE.
- Weight/RPE/Rest values export with a comma decimal separator to
  prevent Excel misreading them as dates.
- From/To range fields are custom dd/mm/yyyy text fields, not native
  date pickers.
- Superset pairs get a `(Superset A/B/…)` tag on the Rest Time cell.
- Read-only; tries to auto-copy to clipboard, textarea shown as fallback.

**Recent Performance** — 📊 button on each exercise card, expands last 3
logged instances of that exercise name (date, sets×reps@weight, RPE,
rest, notes). Matches by trimmed/lowercased name only, no stable ID.

**Exercise Name Standardization** — dropdown of the standardized list
(`exerciseList`, persisted) with "New Exercise" pinned first; picking it
switches to a free-text input + "Add to Exercise List" button.

**Exercise List Management** — Settings → Exercise List sub-page: full
CRUD over the standardized list, exact-duplicate detection (not fuzzy).

**Rest Timer** — per-exercise ⏱ button, single persistent floating timer
bar above the bottom tab bar, timestamp-based so it survives
backgrounding. Doesn't survive the app being fully closed.

**Active workout date** — Today's Workout shows a read-only `dd/mm/yyyy`
date badge (informational only, not stored until the workout completes).

**Workout history** — editable workout name/date (in edit mode);
"Finish Workout" (⋮ menu) moves today's workout into History; Past
Workouts open in the condensed presentation by default, "Edit" enters
edit mode, same button becomes "Save" to exit; "Delete from History" /
"Restore to Queue" available from both the History list and the Workout
screen's ⋮ menu.

**Last-tapped exercise highlighting** — tapping an exercise gives it a
green border via direct DOM class toggle (editable card view only).

**General**
- Installable as a home screen shortcut via browser (Add to Home Screen)
- Works fully offline after first load, including all history/queue features

## Known limitations / things to know
- No login/accounts — data is local to one phone only, not backed up
  anywhere unless you use Backup All Data.
- Superset pairing still supports pairs only (no 3+ groupings) — by
  design, matches current scope.
- Shared superset rest time is enforced by app code on every edit/pair
  action, not by the storage schema.
- The rest timer doesn't survive the app being fully closed/killed.
- Export Gym Log assumes weight is always entered in kg — no unit
  conversion (see Backlog). The comma-decimal export fix assumes the
  target sheet's regional settings use comma decimals.
- `APP_VERSION` (shown on Settings → About) is a separate constant from
  `CACHE_NAME` in `sw.js` — both must be bumped together by hand.
- The edit-mode "leave without saving?" guard only covers the bottom tab
  bar, not the ⋮ menu's Restore/Delete actions (those have their own
  confirm dialogs already).
- Queue workouts have no Edit/read-only concept (always fully editable),
  so the Edit/Save button pattern used on Past Workouts doesn't apply
  there — intentional.
- The condensed History view's superset line sits 9px into the page's
  own right-hand padding (a 16px gutter) — if that body padding is ever
  reduced significantly, the offset would need revisiting so the line
  doesn't get clipped or collide with the page edge.

## Backlog / ideas not yet built
- **Unit conversion (kg ⇄ lb) toggle in Settings** — all weight data is
  currently assumed/stored in kg with no stored unit; a Settings-level
  toggle to display (and enter) everything in lb was floated as a
  future idea during this session's work, not built.
- Superset groups of more than two exercises
- Dedicated superset-level editing controls (e.g. editing rest once at
  the group level instead of via either member's field)
- Restore from Backup: add a "merge" mode as an alternative to the
  current full-replace-only behavior
- Cloud backup/sync (e.g. auto-upload the same Backup JSON shape to a
  cloud storage endpoint)
- Rename an existing standardized exercise (currently: remove + re-add)
- Merge two standardized exercises into one
- Aliases/synonyms for a standardized exercise
- Search/filter within the Exercise List page or the name dropdown
- Import/export the exercise list
- Usage stats (how often each standardized exercise is used)
- Search past workouts / filter by exercise
- Show personal records / estimated 1RM / volume trends
- Match recent performance by a stable exercise ID instead of name
- Bulk export of all workout history (not tied to a single program)
- Automatic timer start after completing a set
- Audio/vibration alert when the rest timer finishes
- Extend the "leave without saving?" edit-mode guard to the ⋮ menu's
  Restore/Delete actions, if that gap ever causes confusion in practice
- Confirm with the user whether the Export Gym Log's target sheet
  actually expects comma decimals and adjust `formatDecimalForExport()`
  if not
- Dedicated workout-sharing/export image, custom screenshot themes, or
  GymLog branding on top of the new condensed History view (explicitly
  out of scope for this session, may be revisited later)

## How to resume work in a new chat
1. Upload the current `index.html` and `sw.js`
2. Upload this summary file
3. Say what you want to change or add next

## Working preferences (apply every session)
- This is my first project — explain new technical concepts at a first-year
  university student level as they come up.
- If anything is ambiguous, ask clarifying questions before proceeding.
- Prefer custom in-app modals/banners over native `window.confirm()` /
  `alert()` / `prompt()` for any new confirmation UI.
- Prefer custom dd/mm/yyyy text fields over native `<input type="date">`
  for any new date input (see "Date Handling" above).
- For any layout/visual design decision of real substance, propose
  multiple concrete mockup options with realistic sample data before
  implementing, and iterate on feedback before writing it into the app.
- **When wrapping up a session, all hand-over docs must be updated before
  ending, without being asked:**
  1. Provide a git commit message for the session's changes.
  2. Update this file (`PROJECT_SUMMARY.md`) to reflect the current state
     of the app — new features, data model changes, updated limitations/
     backlog — and provide it as a file to save back into the project.
     Since Claude has no memory between chats, this file (re-uploaded each
     time) is the only thing that carries context forward — it must stay
     accurate or the next session starts from stale information.
