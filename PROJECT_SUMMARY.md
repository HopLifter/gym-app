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
- Cache version: `gym-app-cache-v47` — **bump this every time `index.html`
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

## New feature (this session): Backup All Data / Restore from Backup
**Why**: this app has no accounts/cloud sync — all data lives only in
this one browser/PWA's localStorage. Moving to a new phone had no
code-free path: the PWA (installed via "Add to Home Screen") runs in a
separate storage context from a regular Safari tab, so browser
console/bookmarklet tricks run against the PWA can't see or write its
actual data. A real in-app feature was the only way to reach it.
**What was added** — Settings → Data:
- **"Backup All Data"** — bundles all four localStorage keys (Program,
  Queue, History, Exercise List) into one JSON file and downloads it
  as `gym-data-yyyy-mm-dd.json` (date-stamped so old backups are easy
  to tell apart).
- **"Restore from Backup"** — opens a file picker, reads the chosen
  JSON file, validates it looks like a real backup (checks it has at
  least one of the expected keys and that each value is well-formed),
  then — after a confirm modal (custom, not native, per this app's
  usual pattern) warning it's a full, irreversible replace — overwrites
  all four keys and reloads the app.
- Import is a **full replace only** (whatever's in the file wins,
  wholesale) — no merge option. A merge mode (combine instead of
  overwrite) is listed in Backlog below as a possible future addition.
- Deliberately kept as one flat JSON object keyed by the same
  localStorage key names used internally — if cloud sync or another
  storage backend is ever added later, the same shape can be POSTed
  somewhere instead of downloaded as a file, without reworking this
  logic. This feature is meant as a foundation for that, not just a
  one-off fix for a single phone swap.
- This is separate from **"Export Gym Log"**, which only exports
  completed History as paste-ready text for an external spreadsheet —
  Backup/Restore is the full app state, in the app's own JSON format.

## Bug fix (this session)
- **"New Exercise" option was unresponsive on a brand-new exercise.** A
  freshly added exercise has `name: ""`, and the name dropdown always
  lists "New Exercise" as its first `<option>` — so with nothing else
  selected, the browser auto-selects it by default. Tapping "New
  Exercise" again therefore didn't change the `<select>`'s value, which
  means it never fired a `change` event, so the code that opens the
  free-text input (`customNameEditingIds`) never ran. Net effect: right
  after adding an exercise, choosing "New Exercise" silently did
  nothing, with no way to type a custom name.
  **Fix**: `nameFieldHTML()` now gives a nameless exercise a hidden,
  disabled placeholder `<option value="">` as its true starting
  selection (instead of "New Exercise" itself). Picking an existing
  exercise from the list still works exactly as before; picking "New
  Exercise" is now always a real value change from `""` → `__custom__`,
  so it reliably opens the text input. Only affects the moment right
  after adding an exercise — everything else about the name field is
  unchanged.

## Data model
No data model changes this session — only a dropdown-selection bugfix,
a rest timer/undo banner repositioning, and a cosmetic label tweak.
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
  All date values in the data model are stored as ISO `yyyy-mm-dd` strings
  regardless of how they're displayed (see "Date Handling" below).

## Date Handling
Every date the app displays now reads **dd/mm/yyyy** consistently,
regardless of the phone's OS/browser locale:
- **Read-only display**: `isoToDMY(iso)` → `dd/mm/yyyy`, used by
  `formatDateBadge()` (Today's Workout date badge). `formatDateDisplay()`
  (History list, Recent Performance rows) uses the same day-first
  convention but spells out the weekday/month (`Weekday, D Mon YYYY`).
- **Editable date fields**: native `<input type="date">` was replaced
  everywhere with a plain text field (`inputmode="numeric"`,
  `placeholder="dd/mm/yyyy"`), since native date pickers render in
  whatever format the phone's locale dictates and that can't be
  overridden. Affects three fields: the Past Workout date editor
  (`#dateInput`), and Export Gym Log's From/To range
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
- **Known limitation removed**: previously the native date inputs were
  documented as an unfixable locale limitation. They're now fully custom,
  so that limitation no longer applies anywhere in the app.

## Export Gym Log — decimal bugfix
**Bug**: weights like `22.5` were coming out as garbage numbers (e.g.
`46159`) after pasting into the user's external Excel sheet.
**Root cause**: `ex.weight`, `ex.rpe`, and the rest-in-minutes value were
exported using JS's default period-decimal formatting (`"22.5"`). Under
many European Excel regional settings, `.` is the *date* separator, not
decimal — so a bare `22.5` gets silently parsed as "22 May" and stored as
a date serial number instead of the number 22.5. This only happens inside
Excel's own paste-parsing, which is why it couldn't be reproduced by
inspecting the app's data directly.
**Fix**: `formatDecimalForExport(value)` now formats every decimal export
value (Weight, RPE, Rest-in-minutes) with a comma separator (`"22,5"`)
instead of a period, matching the target sheet's regional format. Whole
numbers are unaffected (no separator to misinterpret either way). Applied
in `buildGymLogExportRows()`.
**Assumption to flag**: this assumes the target Excel's regional settings
use comma decimals, which is consistent with the bug report but hasn't
been independently confirmed — worth a follow-up if the user's Excel
turns out to expect periods after all.

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
  var(--bottom-nav-gap))`) rather than an external offset — an earlier
  version used an external gap, which left a strip below the bar where
  scrolled content was visible; fixed this session.
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

**Sticky headers** (new this session) — the top part of Workout, Queue,
and History stays fixed in place while the content below it scrolls.
- Shared `.sticky-header` class (`position: sticky; top: 0`) used by all
  three. **Important CSS detail**: it also cancels out the body's own
  20px top padding via `margin-top: -20px; padding-top: 20px`, moving
  that space *inside* the sticky box. Without this, the top padding sits
  *before* the sticky element in the scroll flow and has to scroll away
  first, causing a visible "jump" the instant you start scrolling before
  the header actually locks — this was a real bug found and fixed this
  session. Any new sticky header should reuse this class rather than
  rolling its own `position: sticky` rule.
- **Workout screen**: sticky zone = eyebrow row (label + ⋮ menu) + title
  row + date badge/input, wrapped in `#workoutStickyHeader`.
- **Queue screen**: sticky zone = `<h1>Queue</h1>` + the program-info
  bar, wrapped in `#queueStickyHeader`. The "Add Workout" button and the
  queue list scroll normally below it.
- **History screen**: sticky zone = just `<h1>History</h1>`, wrapped in
  `#historyStickyHeader` with the `.sticky-header--gap` modifier (adds
  16px bottom padding, since History has no trailing element like a
  date badge to create that gap naturally — matches the Workout screen's
  spacing before its exercise list).

**Workout screen header — no back button anymore.** Previously a
contextual "Back to Queue" / "Back to History" button lived at the top
of this screen; it's been removed entirely since the bottom tab bar's
Queue/History tabs already do the same job. This changed the header
layout for the two "peek" states (a non-next Queued Workout, or a Past
Workout):
- **Today's Workout / empty state** (`backNavTarget === null`): unchanged
  two-row layout — eyebrow label + ⋮ menu on one row (`#eyebrowRow`),
  editable title below it on its own row.
- **Peeked Queued Workout / Past Workout** (`backNavTarget` set): the
  eyebrow row is hidden entirely (no more "Queued Workout" / "History ·
  Read Only" / "History · Editing" label text), and the title moves up
  into a single row alongside the ⋮ menu: `[title (flex, fills space)]
  [Edit/Save button, History only] [⋮ menu]`. `backNavTarget` is kept
  internally purely to decide this layout and where the ⋮ menu node
  lives — it no longer drives any visible button.
- **`#navRight`** (the ⋮ menu button + dropdown) is a single DOM node
  reparented by `positionHeaderMenu()` between `#eyebrowRow` (Today) and
  `#titleRow` (peek views) — one menu, one set of listeners, just moved.

**Edit/Save toggle button** (`#editToggleBtn`, History only) — replaces
both the old ⋮ menu "Edit" item and the old back-button-doubling-as-Save
behavior, now that there's no back button to double up. Styled via the
`.header-action-btn` class (same pill look the old back button used,
class renamed since its role changed). Sits in `#titleRow` immediately
to the left of the ⋮ menu. Reads "Edit" when not editing (click enters
edit mode); reads "Save" while editing (click saves, exits edit mode,
stays on the same screen — same underlying behavior as before, just
triggered from this button instead of the back button). Hidden entirely
for Queue workouts, which have no read-only/edit-mode concept (always
fully editable).

**Edit-mode guard** — unchanged in concept: editing a Past Workout is a
bounded, deliberate action. The only way to leave the Workout screen
while `viewSource === "history" && editMode` is the bottom tab bar (the
⋮ menu has no Edit item to interfere, and the Edit/Save button doesn't
navigate), so `guardLeavingEdit()` wraps all four bottom-nav click
handlers: mid-edit, it opens a "Leave without saving?" confirm before
proceeding. Doesn't separately guard the ⋮ menu's own Restore/Delete
actions while mid-edit — those already have their own confirm dialogs.

**Queue screen wording** — "Add Ad-hoc Workout" renamed to **"Add
Workout"** in both places it appears (Queue screen's button and the
Workout screen's empty-state button), for brevity/consistency.

**Settings screen** — added spacing between the `<h1>Settings</h1>`
title and the first section box below it (`.settings-title { margin-
bottom: 18px }`); previously they sat flush together.

**Exercise List** — unchanged: still a Settings sub-page
(`#exerciseListScreen`), reached only via Settings, with its own
hardcoded "Back to Settings" button. Does **not** get the bottom tab bar
or a sticky header — deliberate single-parent dead end.

## Screen-by-screen summary
**Workout screen** (Today's Workout / peeked Queued Workout / Past
Workout / empty state) — see "Navigation & screen structure" above for
the full header behavior. Sticky header; exercises scroll beneath it.

**Queue screen** — plan future workouts.
- Sticky: `<h1>Queue</h1>` + "Current Program" info bar.
- Scrolls: "Add Workout" button + the queue list.
- Queue item ⋮ menu: Move Up, Move Down, Delete from Queue.
- No back button, no screen-level ⋮ menu — use the bottom tab bar.

**History screen** — review completed workouts.
- Sticky: `<h1>History</h1>` only, with a small gap before the list.
- Tapping an item opens it as a read-only Past Workout.
- List item ⋮ menu: Restore to Queue, Delete from History.
- No back button, no screen-level ⋮ menu — use the bottom tab bar.

**Settings screen** — infrequent admin actions, reached via the bottom
tab bar's "Settings" button from anywhere:
- **About** — app name, `APP_VERSION`, short description
- **Program Management** — current program (or "No active program"),
  "Start New Program", "End Current Program" (only when active)
- **Data** — "Export Gym Log" button
- **Exercise List** — count of standardized exercises + "Manage
  Exercise List" button (plain styling, not accented)
- No back button, no ⋮ menu — use the bottom tab bar. Extra spacing now
  separates the title from the first section (see above).

**Delete action naming and styling** — unchanged: "Delete from Queue" /
"Delete from History" everywhere, both entry points per destination
sharing one confirm helper and one `data-action` name each. Every
destructive button's red styling is still listed by hand per screen in
CSS — any new delete-style button needs to be added there too.

## Current features (as of this version)
**Program & Queue**
- Import a program from JSON — Settings → Program Management → "Start
  New Program", or the Workout empty-state's "Start New Program" button
  (same flow/modal, `openImportModal()`).
- "End Current Program" clears remaining queued workouts (completed ones
  stay in history) and annotates the last completed workout.
- Queue screen lists all planned workouts in order; reorder, delete, or
  add a one-off "Add Workout" ad-hoc entry.
- The active workout screen always shows the front-of-queue workout
  unless you've navigated into another queued or past workout to peek
  at it.

**Exercise editing**
- Editable fields: name, sets, reps, weight, RPE, rest time (displayed/
  edited in minutes, stored in seconds).
- Decimal fields (Weight, RPE, Rest) accept both `.` and `,` as the
  decimal separator on input (`parseDecimalInput()`), independent of the
  export-formatting fix above (which only affects the Export Gym Log
  output, not data entry).
- Auto-calculated Volume (sets × reps × weight), Notes field, add/delete
  (6s undo), reorder, superset pairing.
- New exercises start directly in the name **dropdown** (first option
  "New Exercise"), not the free-text input — you can pick immediately
  without tapping away first.

**Backup All Data / Restore from Backup**
- Settings → "Backup All Data" downloads a single date-stamped JSON file
  containing everything (Program, Queue, History, Exercise List).
- Settings → "Restore from Backup" picks that file back up on any
  device/browser and fully replaces current data with it, after a
  confirm modal. Full replace only — see note above.
- Intended primarily for moving to a new phone, but also works as a
  periodic manual backup.

**Export Gym Log**
- Settings → "Export Gym Log" opens a modal generating tab-separated
  text of completed workouts, formatted to paste directly into the
  user's external Excel gym log.
- Column order: Day, Lift, Sets, Reps, Weight, *(blank — Volume formula
  column)*, Comments, Rest Time (min), RPE.
- **Weight/RPE/Rest values now export with a comma decimal separator**
  (see bugfix above) to prevent Excel misreading them as dates.
- From/To range fields are now custom dd/mm/yyyy text fields (see "Date
  Handling" above), not native date pickers.
- Superset pairs get a `(Superset A/B/…)` tag on the Rest Time cell.
- Read-only; tries to auto-copy to clipboard, textarea shown as fallback.

**Recent Performance** — 📊 button on each exercise card, expands last 3
logged instances of that exercise name (date, sets×reps@weight, RPE,
rest, notes). Matches by trimmed/lowercased name only, no stable ID.

**Exercise Name Standardization** — dropdown of the standardized list
(`exerciseList`, persisted) with "New Exercise" pinned first; picking it
switches to a free-text input + "Add to Exercise List" button.
Read-only views stay a plain disabled text field.

**Exercise List Management** — Settings → Exercise List sub-page: full
CRUD over the standardized list, exact-duplicate detection (not fuzzy).

**Rest Timer** — per-exercise ⏱ button, single persistent floating timer
bar above the bottom tab bar, timestamp-based so it survives
backgrounding. Doesn't survive the app being fully closed.

**Active workout date** — Today's Workout shows a read-only `dd/mm/yyyy`
date badge (informational only, not stored until the workout completes).

**Workout history** — editable workout name/date; "Finish Workout" (⋮
menu) moves today's workout into History; Past Workouts open read-only
by default, "Edit" (now a dedicated button, see above) enters edit mode,
same button becomes "Save" to exit; "Delete from History" / "Restore to
Queue" available from both the History list and the Workout screen's ⋮
menu, sharing the same underlying actions.

**Last-tapped exercise highlighting** — tapping an exercise gives it a
green border (or highlights the shared box for a superset pair, not the
individual members) via direct DOM class toggle, not a full re-render,
so it doesn't steal focus from a field you just tapped into.

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
  conversion. The comma-decimal export fix assumes the target sheet's
  regional settings use comma decimals — flagged to the user as an
  assumption pending their confirmation.
- `APP_VERSION` (shown on Settings → About) is a separate constant from
  `CACHE_NAME` in `sw.js` — both must be bumped together by hand.
- The edit-mode "leave without saving?" guard only covers the bottom tab
  bar. The ⋮ menu's Restore to Queue / Delete from History actions while
  mid-edit on a Past Workout aren't separately intercepted (they have
  their own confirm dialogs already).
- Queue workouts have no Edit/read-only concept (always fully editable),
  so the Edit/Save button pattern used on Past Workouts doesn't apply
  there — confirmed as intentional this session.

## Minor tweak (this session)
- "+ Add to Exercise List" button (shown when typing a custom exercise
  name) renamed to **"Add to Exercise List"** — dropped the leading "+"
  for a cleaner look. Purely cosmetic; behavior, disabled state, and
  "Already on list" wording unchanged.

## Rest timer / undo banner repositioning (this session)
**Problem**: the rest timer bar floated well above the bottom nav
(`bottom: nav-h + gap + 88px`), covering content lower on the page — the
"Add Exercise" button on the Workout screen, the last item in the Queue
list, and (by the same logic) the bottom of the History list.
**Fix, chosen to make an overlap between the timer and the undo banner
structurally impossible rather than just unlikely**:
- **Rest timer bar** now sits just above the bottom nav
  (`bottom: nav-h + gap + 16px`, same clearance the undo banner used to
  use). Body bottom padding bumped slightly (100px → 110px, on top of
  nav-h + gap) so scrolled content on every screen — Workout, Queue, and
  History all share the same `body` as their scroll container — clears
  it fully instead of being covered.
- **Undo banner** moved from the bottom (where it used to sit right next
  to the timer's old position) to the *top* of the screen, just under
  whichever sticky header is currently showing. New `positionUndoBanner()`
  reads that header's rendered `offsetHeight` and sets the banner's `top`
  inline via JS each time it's shown (`STICKY_HEADER_ID_BY_SCREEN` maps
  `workout`/`queue`/`history` to their sticky header element IDs; also
  repositions on window resize while visible). This relies on the sticky
  header's existing margin/padding trick (see "Sticky headers" below)
  that keeps it pinned at the true top of the viewport from the start —
  so the header's height alone is enough to place the banner correctly,
  no scroll-position tracking needed.
- The undo banner is currently only ever triggered from the Workout
  screen (deleting an exercise), but the screen→header mapping already
  covers Queue and History too, so no further work is needed if an
  undo-able action is ever added there.
- Net effect: the timer lives at the bottom, the undo banner lives at
  the top — they can never occupy the same space, regardless of when
  each happens to be visible.

## Backlog / ideas not yet built
- Restore from Backup: add a "merge" mode (combine with existing data)
  as an alternative to the current full-replace-only behavior
- Cloud backup/sync (e.g. auto-upload the same Backup JSON shape to a
  cloud storage endpoint) — the Backup/Restore feature this session was
  deliberately built with this in mind (same flat JSON shape, keyed by
  the existing localStorage key names)
- Rename an existing standardized exercise (currently: remove + re-add)
- Merge two standardized exercises into one
- Aliases/synonyms for a standardized exercise
- Search/filter within the Exercise List page or the name dropdown
- Import/export the exercise list
- Usage stats (how often each standardized exercise is used)
- Search past workouts / filter by exercise
- Show personal records / estimated 1RM / volume trends (natural next
  steps on top of Recent Performance)
- Match recent performance by a stable exercise ID instead of name
- Bulk export of all workout history (not tied to a single program)
- Automatic timer start after completing a set
- Audio/vibration alert when the rest timer finishes
- Extend the "leave without saving?" edit-mode guard to the ⋮ menu's
  Restore/Delete actions, if that gap ever causes confusion in practice
- Confirm with the user whether the Export Gym Log's target sheet
  actually expects comma decimals (see Known limitations above) and
  adjust `formatDecimalForExport()` if not

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
- Prefer custom dd/mm/yyyy text fields over native `<input type="date">`
  for any new date input (see "Date Handling" above).
- **When wrapping up a session, all hand-over docs must be updated before
  ending, without being asked:**
  1. Provide a git commit message for the session's changes.
  2. Update this file (`PROJECT_SUMMARY.md`) to reflect the current state
     of the app — new features, data model changes, updated limitations/
     backlog — and provide it as a file to save back into the project.
     Since Claude has no memory between chats, this file (re-uploaded each
     time) is the only thing that carries context forward — it must stay
     accurate or the next session starts from stale information.
