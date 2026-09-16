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
- Cache version: `gym-app-cache-v39` — **bump this every time `index.html`
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

## Data model
Unchanged this session — no data model or application logic changes, only
navigation/UI reorganization and cosmetic fixes. localStorage keys:
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

## Navigation & screen structure (reworked again this session — bottom tab bar)
The previous session introduced a `navStack`-based back-button system with
per-screen ⋮ menus offering "Today's Workout" / "View Queue" / "View
History" / "Settings" everywhere. This session replaced all of that with a
single, always-visible **bottom tab bar** and stripped out everything the
tab bar made redundant. `navStack`, `navigateBack()`, `peekBack()`,
`screenLabel()`, and `SCREEN_LABELS` are all gone — there's no navigation
history to track anymore, since the tab bar means you're never more than
one tap from any of the four top-level screens.

**Bottom tab bar** (`#bottomNav`) — History / Today / Queue / Settings, in
that order, fixed to the bottom of the screen.
- Visible on all four top-level screens (Workout, Queue, History,
  Settings). Hidden only on the Exercise List sub-page
  (`updateBottomNav()`, called at the end of every `showScreen()`).
- Each button gets a top/left/right border (rounded top corners, 14px
  radius — matching the radius used on exercise cards) that turns
  accent-green when that tab is the active one; no border on the bottom
  edge, since it sits flush against the bar.
- "Today" always calls `goHome()` (resets to the front-of-queue workout).
  Queue/History/Settings call `navigateTo(view)`, now a thin wrapper
  around `showScreen(view)` with no stack bookkeeping.
- **Active-tab logic reflects where the content actually lives, not just
  which screen is showing** — see `updateBottomNav()`. While on the
  Workout screen: peeking a **non-next** Queued Workout keeps **Queue**
  highlighted (not Today); viewing a Past Workout keeps **History**
  highlighted; only the actual next-queued workout (or the empty state)
  highlights **Today**.
- Tapping a tab while mid-edit on a Past Workout is intercepted — see
  "Edit-mode guard" below.

**⋮ menus were removed from Queue, History, and Settings entirely** — they
only ever held the four tab-bar destinations, so once those were always
one tap away at the bottom, the menus had nothing left in them. All three
screens now have **no back button and no ⋮ menu** — just their `<h1>` and
content. (Settings already had no ⋮ menu; it lost its back button too.)

**Workout screen** keeps its own ⋮ menu (`#headerMenuBtn` /
`#headerMenuDropdown`, built by `renderHeaderMenu()`), now trimmed to only
screen-specific actions since Today's Workout / View Queue / History /
Settings are gone from it:
- Today's Workout (no back button, empty state): **no items** → the ⋮
  button hides itself (`headerMenuBtn` gets `.hidden` when
  `items.length === 0`).
- Today's Workout (front of queue): Finish Workout, Delete from Queue.
- Peeked Queued Workout (not next): Delete from Queue.
- Past Workout, not editing: Edit, Restore to Queue, Delete from History.
- Past Workout, editing: Restore to Queue, Delete from History only —
  **"Edit" is hidden while already editing, and there's no "Save" item
  anymore** (Save moved to the back button — see below).
- **⋮ menu position**: the same `#navRight` node (menu button + dropdown)
  is reparented by `positionHeaderMenu()` depending on whether a back
  button is showing — inline with the eyebrow label (`#eyebrowRow`) when
  there's no back button (Today's Workout / empty state), or up in the
  top-nav row next to the back button (`#topNav`) otherwise (peeked
  Queued Workout / Past Workout). One menu, one set of listeners, just
  moved between two containers — not two separate menus.

**Contextual back button** (`#backNavBtn`, driven by `backNavTarget`) —
unchanged in concept from before: shown only when viewing something other
than today's active workout. `"queue"` for a peeked Queued Workout
("Back to Queue", always navigates), `"history"` for a Past Workout,
`null` (hidden) for Today's Workout / empty state.
- **On a Past Workout, this button now doubles as Save.** While
  `editMode` is true it reads **"Save"**; clicking it saves and returns
  to read-only view *on the same screen* rather than navigating away.
  Only once you're back in read-only mode does it revert to
  **"Back to History"** and actually navigate on click.

**Edit-mode guard** — editing a Past Workout is meant to be a bounded,
deliberate action now that Save lives on the back button. The only way to
leave the Workout screen while `viewSource === "history" && editMode` is
the bottom tab bar (the ⋮ menu's Edit item is hidden while editing, and
the back button *is* Save, not a nav action), so `guardLeavingEdit()`
wraps all four bottom-nav click handlers: if you're mid-edit, it opens a
confirm modal ("Leave without saving?") before proceeding; confirming
exits edit mode and continues the navigation, cancelling leaves you where
you were. Note: this does **not** guard the ⋮ menu's own Restore/Delete
actions while mid-edit — those already have their own destructive-action
confirm dialogs, so leaving via one of them isn't separately intercepted.

**Delete/Restore action wiring is now unified** — previously the header
⋮ menu and the matching list-item ⋮ menu used *different*
`data-action` values for the same action (e.g. `delete-workout` vs.
`delete-from-history`), so CSS and click-handler logic had to be
duplicated per entry point. Both entry points now share one name each:
`delete-queue-workout`, `delete-from-history`, `restore-to-queue`. Same
underlying `confirmDeleteFromQueue()` / `confirmDeleteFromHistory()`
helpers as before; just one wiring to maintain instead of two.

**Exercise List** — unchanged: still a Settings sub-page
(`#exerciseListScreen`), reached only via Settings, with its own
hardcoded "Back to Settings" button. Does **not** get the bottom tab bar
(`updateBottomNav()` hides it specifically on this screen) — it's a
deliberate single-parent dead end, not a top-level destination.

**Terminology** — "History" is now used consistently everywhere it's
referred to: the screen title (`<h1>History</h1>`), the bottom-nav label,
the ⋮ menu item, and the Past Workout eyebrow ("History · Read Only" /
"History · Editing"). Previously this varied between "History", "View
History", "Past Workouts", and "Past Workout".

**Program import button wording** — the Workout screen's empty-state
button now says **"Start New Program"** (was "Import Program"), matching
the wording of the identical button in Settings. Both call the same
`openImportModal()`.

## Current UI polish (this session)
- **Dates are always day-first**, explicitly formatted rather than via
  `toLocaleDateString()` (which follows the phone's region settings and
  could silently render mm/dd/yyyy): the workout date badge now reads
  `dd/mm/yyyy` (`formatDateBadge()`), and History list / Recent
  Performance rows read `Weekday, D Mon YYYY` (`formatDateDisplay()`).
  **Known limitation**: the native `<input type="date">` fields (editing
  a Past Workout's date, Export Gym Log's From/To range) still render in
  whatever format the phone's OS/browser locale uses — there's no way to
  force those short of replacing them with a custom-built date picker,
  which hasn't been done.
- **"+" prefixes removed** from "Add Ad-hoc Workout" and "Add Exercise"
  button labels (both instances of the former — Queue screen and the
  Workout empty-state). "+ Add to Exercise List" is unchanged (not part
  of this request).
- **"Manage Exercise List" button** in Settings no longer uses accent
  (green) styling — it's a plain `pill-btn` now, same as the other
  Settings action buttons.
- **Adding a new exercise now shows its name dropdown immediately** —
  previously a newly-added exercise started in the free-text "custom
  name" input, and you had to tap away from it once before the dropdown
  of standardized exercise names became available. New exercises now
  start directly in the dropdown state, focused, with the pinned first
  option renamed from "+ New / Custom Name" to **"New Exercise"**.

## Last-tapped exercise highlighting (new this session)
Tapping any part of an exercise card gives it a green border, so it's
easy to spot which exercise you're currently working on at a glance.
- `lastActiveExerciseId` tracks the id; `setLastActiveExercise()` (called
  from the exercise-container click handler, before any action
  branching) updates it via a **direct DOM class toggle**, not a full
  `renderExercises()` — re-rendering would rebuild the DOM including
  whatever input/select the user just tapped into to focus it, stealing
  focus back out immediately. `highlightTargetFor(id)` resolves which
  actual DOM element to toggle the class on (see next point).
- **Standalone exercise**: its own `.exercise` card gets `.last-active`
  (`border-color: var(--accent)`).
- **Superset pair**: only the shared `.superset-group` box gets
  `.last-active` — the two individual `.exercise` cards inside it are
  *not* separately highlighted. The group wrapper carries
  `data-superset-id` so `highlightTargetFor()` can find it; on a full
  `renderExercises()` (delete/move/pair/unpair, etc.) the group's
  `last-active` class is recomputed from scratch based on whether either
  member is `lastActiveExerciseId`, so it stays in sync. The group's
  border is **neutral by default** (`var(--line)`, same weight as a
  regular exercise card) and only turns accent when it's actually the
  last-tapped group — it is *not* permanently accent-colored (an earlier
  version of this feature had a bug where the superset border was always
  on regardless of tap state; fixed).
- `cardHTML()` only adds `.last-active` to an individual `.exercise` card
  when `!ex.supersetId` — a superset member's own highlighting is always
  suppressed in favor of the group-level highlight.

## Screen-by-screen summary
**Queue screen** — plan future workouts.
- "Current Program" name shown at top (display-only)
- "Add Ad-hoc Workout" directly below the program info, above the list
- Queue item ⋮ menu: Move Up, Move Down, **Delete from Queue**
- Program management (Start New Program / End Current Program) lives in
  Settings — no longer editable from here
- No back button, no screen-level ⋮ menu — use the bottom tab bar

**History screen** — review completed workouts.
- Tapping an item opens it as a read-only Past Workout (Edit toggles
  edit mode via the ⋮ menu, see above)
- List item ⋮ menu: Restore to Queue, **Delete from History**
- No back button, no screen-level ⋮ menu — use the bottom tab bar

**Settings screen** — infrequent admin actions, reached via the bottom
tab bar's "Settings" button from anywhere:
- **About** — app name, `APP_VERSION`, short description
- **Program Management** — shows current program (or "No active program"),
  "Start New Program" (reuses the existing JSON import flow/modal),
  "End Current Program" (only shown when a program is active)
- **Data** — "Export Gym Log" button (opens the existing export modal)
- **Exercise List** — count of standardized exercises + "Manage Exercise
  List" button (plain styling, not accented), opening the dedicated
  Exercise List sub-page (`#exerciseListScreen`, back button returns to
  Settings). See "Exercise List Management" below.
- No back button — use the bottom tab bar

**Delete action naming and styling**
- "Delete Workout" was ambiguous when it appeared in both Queue and
  History contexts (different consequences — one just drops an unstarted
  plan, the other permanently erases logged data). Renamed everywhere:
  **"Delete from Queue"** vs. **"Delete from History"**. Confirm-modal
  titles match ("Delete from queue?" / "Delete from history?").
- Both entry points per destination share one confirm helper AND (as of
  this session) one `data-action` name each — see "Delete/Restore action
  wiring is now unified" above.
- All destructive "Delete"-style buttons across the app are styled red
  (`var(--danger)`). There's no single shared class for this — each
  screen's CSS explicitly lists every `data-action` value that should be
  red (e.g. `.header-menu-dropdown button[data-action="delete-from-history"],
  [data-action="delete-queue-workout"], [data-action="end-program"]`).
  **Any new delete-style button must be added to its screen's matching
  CSS rule by hand, or it won't pick up the red styling automatically.**

## Current features (as of this version)
**Program & Queue**
- Import a program from JSON — reached via Settings → Program Management
  → "Start New Program", or the Workout empty-state's "Start New Program"
  button (same underlying flow/modal, `openImportModal()`; paste JSON or
  choose a file). Ask Claude to convert a spreadsheet/plan into the
  expected `{ program: { name }, workouts: [...] }` format.
- "End Current Program" (Settings) clears its remaining queued workouts
  (completed ones stay in history) and annotates the last completed
  workout.
- Queue screen lists all planned workouts in order; reorder (Move Up/Down),
  Delete from Queue, or add a one-off ad-hoc workout.
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
- Add / delete exercises, with 6-second undo after delete. New exercises
  start with their name field showing the dropdown (see "Current UI
  polish" above), not the free-text input.
- Reorder exercises (Move Up / Move Down)
- Superset pairing: link two exercises, shown grouped with a visual badge
  and a shared border, highlighted green as a group when it's the
  last-tapped one (see "Last-tapped exercise highlighting" above)

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
  the export to a specific range — both blank exports full history. These
  two date inputs are native `<input type="date">` and follow the phone's
  locale for their own display (see "Current UI polish" limitation above).
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
  history: date (`Weekday, D Mon YYYY`), sets×reps @ weight, RPE, rest
  time (in minutes), and notes/comments (newest first). Notes are only
  shown if present for that session.
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
    Management" below) in alphabetical order, with **"New Exercise"**
    pinned at the top of the list. The dropdown's own visible text is
    whatever the exercise is currently named — a list entry, or (via a
    synthetic `<option>` inserted just for this) a custom name the user
    already typed. "New Exercise" is only ever an option *inside* the
    list, never the persistently displayed value.
  - While actively entering a custom name, a plain free-text input plus
    an inline **"+ Add to Exercise List"** button (no dropdown visible).
    Entered by picking "New Exercise" from the dropdown (clears the
    name, focuses the input), or automatically for a brand-new exercise
    added via "Add Exercise" (see "Current UI polish" above — this
    changed this session: new exercises now start in the *dropdown*
    state, not this custom-text state, so this path is only reached by
    explicitly picking "New Exercise").
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

**Exercise List Management**
- The standardized exercise list is persisted in localStorage
  (`gymapp_exercise_list_v1`, a flat array of strings) and fully
  user-editable. Managed via `exerciseList` (a module-level array, always
  kept sorted alphabetically by every function that mutates it — nothing
  downstream needs a separate "_SORTED" copy).
- **Migration**: on first load with no saved list yet, `exerciseList` is
  seeded from `MIGRATION_SEED_EXERCISES` (the old hardcoded 57-entry
  list), sorted, and saved. That seed constant is only ever read once, on
  that first migration. Existing queue/history/program data is untouched.
- **Settings → Exercise List** (`#exerciseListScreen`): lists every
  standardized exercise alphabetically, each with a "Remove" button (a
  confirm modal warns that it won't affect past workouts using that
  name), plus a text input + "Add" button at the top (also submits on
  Enter). Inline error text covers empty/duplicate input.
- **Add from today's workout**: while entering a custom exercise name
  during a workout, a "+ Add to Exercise List" button promotes that name
  straight into the standardized list without leaving the workout.
- `addExerciseToList(rawName)` — trims whitespace, rejects empty input
  and exact case-insensitive duplicates (`isDuplicateExerciseName()`),
  otherwise pushes + re-sorts + persists. Returns `{ ok: true }` or
  `{ ok: false, reason: "empty" | "duplicate" }`.
- `removeExerciseFromList(name)` — filters the name out of `exerciseList`
  and persists; never touches `queue` or `history`.
- Deliberately **not fuzzy**: duplicate detection here is exact
  (case/whitespace-insensitive only).

**Rest Timer**
- Each editable exercise has a ⏱ button that starts a rest timer using
  that exercise's configured rest duration.
- A single persistent floating timer bar is visible across all screens
  without blocking interaction, positioned just above the bottom tab bar.
- Controls: Pause / Resume / Reset (back to the original duration) /
  Dismiss.
- Only one timer can run at a time; starting a new one replaces the
  current one.
- At zero: shows "Rest complete" with a pulse animation. No sound/vibration.
- **Timestamp-based, so it stays accurate through backgrounding** — the
  countdown is calculated from a fixed start time + duration vs. the
  current time, so it self-corrects if you switch apps, lock your phone,
  or take a call. A `visibilitychange` listener forces an immediate
  recheck on return. Doesn't survive the app being fully closed/killed
  (in-memory only) — known limitation, no background notifications
  either.

**Active workout date**
- Today's Workout shows today's date as a read-only badge, formatted
  `dd/mm/yyyy` — informational only, not stored, since queued workouts
  don't get a real date until they're completed.
- Other queued/future workouts don't show a date badge.

**Workout history**
- Editable workout name and date on the current workout
- "Finish Workout" (⋮ menu, only when viewing today's actual active
  workout) asks for confirmation first before saving a full copy into
  History and advancing to the next queued workout.
- Tapping a past workout opens it in the same workout view used for today
- Past workouts open **read-only** by default; "Edit" (⋮ menu, only shown
  when not already editing) enters edit mode. **Saving now happens via
  the back button, which becomes "Save" while editing** (see "Navigation
  & screen structure" above) — there is no separate Save item in the ⋮
  menu anymore, and navigating away via the bottom tab bar while mid-edit
  triggers a "Leave without saving?" confirmation.
- "Delete from History" (⋮ menu on a Past Workout, and the History list's
  own per-item ⋮ menu) permanently removes a workout after confirming.
  Both entry points share `confirmDeleteFromHistory()` and the same
  `data-action="delete-from-history"`.
- "Restore to Queue" — available from both the History list and the ⋮
  menu while viewing a past workout, sharing `data-action="restore-to-queue"`.
  Moves a completed workout back into the active queue (status reset,
  date cleared), preserving all exercise data.
- "Back to History" / "Save" button (top-left) appears whenever viewing
  a past workout.

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
- Native `<input type="date">` fields (editing a Past Workout's date,
  Export Gym Log's From/To range) display in whatever format the phone's
  OS/browser locale uses — can't be forced to dd/mm/yyyy without
  replacing them with a custom date picker (not done).
- The edit-mode "leave without saving?" guard only covers the bottom tab
  bar. The ⋮ menu's Restore to Queue / Delete from History actions while
  mid-edit on a Past Workout aren't separately intercepted by this guard
  (they have their own confirm dialogs already).

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
- Custom-built date picker for the two native date inputs, if
  dd/mm/yyyy consistency there ever becomes worth the extra complexity
- Extend the "leave without saving?" edit-mode guard to the ⋮ menu's
  Restore/Delete actions, if that gap ever causes confusion in practice

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
