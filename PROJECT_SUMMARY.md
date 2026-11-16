# GymLog — Project Summary

## UI/UX overhaul, stop 3 feedback: Today screen changes (v66, 16 November 2026)
Changes from the user's test of v65 (v65 was not committed or published).
`CACHE_NAME` and `APP_VERSION` are `gym-app-cache-v66`. No data model change.
Where this section and the v65 section below disagree, this section is correct.

- **Reps before Weight** in the open row (Reps left, Weight right).
- **History button:** the "Last time" line is gone. A clock button to the
  left of the ⋮ menu shows or hides the "Last 3 Sessions" panel
  (`toggle-history`, `expandedHistoryIds`); the button is green while the
  panel shows. `lastTimeText()` is removed.
- **Superset pair:** both rows open and close as one, and both can be
  edited (`cardHTML(ex, { open, timerBtn })`, set in `renderExercises()`).
  One "Start Rest Timer" button is below the second row. It uses the rest
  time and sets of the second exercise; if that exercise has no rest time,
  it uses the first. The timer bar shows the names in workout order
  (`pairNames()`).
- **Timer bar tap:** a tap on the rest timer bar (not on its buttons) goes
  back to the timer's exercise (`goToTimerExercise()`): the workout shows,
  the row opens and scrolls to just below the header. The timer now stores
  `exerciseId` and `workoutId` (in memory only). If the timer belongs to a
  past workout, its read-only view opens.
- **"Replace set timer?" dialog:** the user confirmed it stays as it is. In
  stop 4, "Start This Exercise" uses this same dialog; the wording planned
  earlier ("Squats is not finished…") is dropped.
- **Tested** in the desktop browser at 375 px with the restored baseline and
  a temporary superset. Not run on a phone.

## UI/UX overhaul, stop 3: New workout screen (v65, 16 November 2026)
Stop 2 was the mockups (`docs/mockups/GymLog UI Overhaul - Workout Screen
Options.html`; option A was chosen). Stop 3 rebuilds the Workout screen to
that mockup. `CACHE_NAME` and `APP_VERSION` are `gym-app-cache-v65`. No data
model change. Sections further down that describe exercise cards, the date
badge, the 📊/⏱ buttons, Volume and "last-tapped highlighting" describe the
old screen.

- **Design tokens** at the top of the CSS (`:root`): 8 colours (`--bg`,
  `--raised`, `--line`, `--control`, `--text`, `--text-2`, `--accent`,
  `--danger`), 5 font sizes, a spacing scale, 2 radii. Rules: flat screens,
  divider lines, no boxes, one accent action per screen, controls at least
  44 px high (48 px where there is room), 16 px text in fields. New work
  uses these tokens only. The old names (`--surface`, `--surface-2`,
  `--text-dim`, `--accent-dim`, `--done`) remain for Queue, History,
  Settings, the dialogs and the condensed table until stop 5.
- **Icons:** one inline SVG sprite at the top of `<body>`; use
  `<svg class="icon"><use href="#i-name"/></svg>`. No emoji icons.
- **Exercise rows** (`cardHTML()`): each exercise is a flat row. One row is
  open at a time (`openExerciseId`; a workout opens with its first row
  open). A closed row shows the name and a one-line summary
  (`exerciseSummary()`). A tap opens a row; a tap on the name of the open
  row closes it. The open row has a "Last time" line (a tap shows the last
  3 sessions), Weight and Reps with − and + buttons (2.5 kg and 1 rep), Sets,
  RPE, Rest, Notes and a "Start Rest Timer" button. A tap on a number field
  selects its value. Sets and Reps are now text fields with a numeric
  keyboard (parsed with `parseInt`).
- **Exercise menu:** Change Exercise, Move Up, Move Down, Superset, Delete
  (last). The name is plain text; the name picker shows only for an exercise
  with no name or after "Change Exercise" (`renamingIds`). Stop 6 replaces
  the picker.
- **Click handling** reads the action with `e.target.closest("[data-action]")`,
  because buttons now hold icons and spans.
- **Header:** label "Today · 16 Nov" (only the date while a workout timer
  exists), the workout clock and Start/Hold to Pause button, and the ⋮ menu
  in one row. The title is a one-line `<textarea>` that grows, so long
  titles wrap. The date badge is gone.
- **Finish Workout** is a button at the end of the exercise list (Today's
  Workout only), with the same confirm dialog. It is no longer in the ⋮ menu.
- **Removed from the screen:** Volume, the 📊 and ⏱ icon buttons, the
  last-tapped highlight. `calcVolume()` and `formatDateBadge()` are now
  unused (clean-up in stop 9).
- **Tab bar:** solid background, full width, icon plus label, 56 px plus the
  bottom safe area. The rest timer bar is attached above it (same content as
  before; stop 4 replaces it with the "Set Done" bar).
- **Viewport:** `viewport-fit=cover` with `env(safe-area-inset-*)` padding;
  `user-scalable=no` removed (`maximum-scale=1` stays, to stop the zoom on
  focus on iOS); `touch-action: manipulation` on the body.
- **Decisions for stop 4 (agreed):** small data model ("set 3 of 5 done"
  for today's workout only, room left for set-by-set logging later); one
  bottom bar with one button ("Set 3 Done"), no Pause and no ✕; a tap on a
  closed row opens it but does not change the active exercise; "Start This
  Exercise" makes it active, with a confirm dialog if the active exercise
  still has sets that are not done; Finish Workout is always active and its
  dialog names exercises that are not complete.
- **Testing limits:** desktop browser at 375, 360 and 768 px with the
  restored baseline: open/close rows, steppers, typed values with a comma,
  Recent sessions, menu actions, Change Exercise, delete and undo, Add
  Exercise, rest timer, Finish dialog, peeked queue workout, Past Workout
  view and edit mode, Queue, History and Settings screens. Not run on a
  phone; safe-area padding can only be checked there.

## UI/UX overhaul, stop 1: Protect the data (v64, 16 November 2026)
First stop of a 9-stop overhaul (assessment of UX, visual design, code and
data safety done in the same session). Nothing looks different in this stop.
`CACHE_NAME` and `APP_VERSION` are `gym-app-cache-v64`. No data model change;
old backups and saved data load unchanged (tested with the baseline backup).

- **Safe storage helpers.** All reads and writes of localStorage go through
  `readKey()`, `writeKey()` and `loadArray()`. New code must use them and
  never call `localStorage` directly (the only exceptions are the rescue
  copy and `doImportAllData()`).
- **A failed save shows a message.** `writeKey()` returns `true`/`false` and
  shows "Could not save" once per failure streak. `saveQueue()` and
  `saveHistory()` return the same value and flash the save icon only on
  success.
- **Unreadable data is never overwritten.** If a key holds text that is not a
  JSON array, `loadArray()` copies the raw text to
  `<key>_rescue_<timestamp>` and the app continues with empty data for that
  key (the Exercise List falls back to the seed list). A notice names the
  unreadable keys and points to Restore from Backup. If the rescue copy
  cannot be saved, `storageLocked` blocks every write. An unreadable queue no
  longer triggers the first-run "Push Day" seed. Rescue keys are not part of
  Backup All Data.
- **`cleanWorkouts()`** drops entries that are not objects and gives every
  workout an `exercises` array at load time.
- **Save order.** Finish Workout saves history first, then the queue; Restore
  to Queue saves the queue first, then history. If the first save fails the
  action is cancelled, so a workout can never be in neither place.
- **Restore from Backup rolls back** if a write fails part-way.
- **Escaping.** `escapeHtml()` now escapes `& < > " '` and accepts any value
  (numbers included); `escapeAttr` is the same function. Sets, reps, weight,
  RPE, ids and Recent Performance values are now escaped (an import file with
  HTML in a number field could run code before).
- **Ids.** `newId()` is the time in ms plus a 4-digit counter (was a random
  number below 1000, which gave equal ids inside one import). Existing equal
  ids in old data are harmless (lookups are per workout) and are left as-is.
- **Dates.** `todayISO()` uses the local calendar date, not UTC.
- **Testing limits:** desktop browser with the restored baseline: migration,
  import of 40 exercises with HTML in every field (no code ran, ids unique),
  Finish and Restore to Queue with a simulated failed save, Restore from
  Backup rollback, unreadable queue and history (rescue keys, notice, no
  seed). Not run on a phone. The service worker does not register in the
  local test browser.
- **Still planned (stop 7):** full backup file check, restore without
  deleting missing keys, "before restore" undo copy, backup metadata and
  reminder, `navigator.storage.persist()`, `storage` event reload.

## Docs-only build 20261108: Program Builder Phase 2 steps 1 to 4 built (Roadmap 2.1)
`index.html` and `sw.js` (GymLog) are unchanged, so the cache version stays
`gym-app-cache-v63`. The Program Builder (`builder/`) gained a browser library,
templates, athlete profiles, Generate-for-an-athlete and Export for GymLog (the
phone import file). See `builder/PROJECT_SUMMARY.md` ("Current status") for the
full state, and `ROADMAP.md` (Epic 2.1, Phase 2). GymLog's import format is
unchanged: the builder's Export for GymLog writes it.

## What this is
A free, offline-first workout tracker for personal phone use. Built as a
single-page web app (not a native app) so there's no App Store, no fees,
no subscriptions.

## Live setup
- Hosted on GitHub Pages: https://hoplifter.github.io/gym-app/
- Repo: github.com/HopLifter/gym-app (local clone `C:\Projects\gym-app`).
  It holds both GymLog and the Program Builder. Git history and the repo
  files are the source of truth; the dated folders in OneDrive are only a
  read-only archive. Read `docs/WORKFLOW.md` for the working rules.
- Repo layout: `index.html` (the whole app) + `sw.js` (offline caching);
  `builder/` (Program Builder, own `PROJECT_SUMMARY.md`); `ROADMAP.md`;
  `PROJECT_SUMMARY.md` (this file); `CLAUDE.md`; `docs/` (`WORKFLOW.md`,
  `Program Import Format.md`, `specs/`, `reference/`, `mockups/`).
- Section headings below that say "session" were written at different
  times. Use `git log` for the real dates.
- No backend/server — all data lives in the browser's localStorage on the phone
- Cache version: `gym-app-cache-v66` — **bump this every time `index.html`
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

## Name
The app is called **GymLog** everywhere (page title and Settings → About changed from "Today's Lift" in v63; the home-screen label of an already installed shortcut keeps its old name until it is re-added).

## Offline fix (v63, 5 November 2026) — still to be tested on the iPhone
`sw.js` cached `index.html` but not the folder address `https://hoplifter.github.io/gym-app/`
(which ends in `/`, not `index.html`). The service worker looks up cached
files by exact address, so opening the folder address with no signal could
fail while `/gym-app/index.html` worked. Reproduced as: a cache holding
`index.html` and `sw.js` answers a lookup for `/index.html` but not for `/`;
adding `./` to the cache makes `/` match too (checked with the Cache API in a
desktop Chromium-based browser; a full airplane-mode run was done only on
desktop). Fix: `FILES_TO_CACHE` in `sw.js` now also lists `"./"`, and
`CACHE_NAME` and `APP_VERSION` are both `gym-app-cache-v63`. No other
behaviour changed.

**Still needs testing on the iPhone:** open the app once with signal (so the
new version installs, Settings → About shows v63), turn on airplane mode, close
the app fully and reopen it from the home-screen shortcut. It should load.

## Docs-only build 20261105: Program Builder Phase 1 built (Roadmap 2.1)
`index.html` and `sw.js` are unchanged from 20261104, so the cache version
stays `gym-app-cache-v62`. `ROADMAP.md` is updated (Phase 1 implemented,
builder decisions refreshed, order updated).

The Program Builder is a **separate desktop page**, not part of the GymLog
app (a different `index.html`, no shared code). It was built in its own repo
(`HopLifter/gym-program-builder`) and then moved into this repo, with its
history, as the `builder/` folder:
- Live: https://hoplifter.github.io/gym-app/builder/ (after the move is
  pushed; the old address `hoplifter.github.io/gym-program-builder/` is the
  previous home). Plain HTML/CSS/JS in one `index.html`, no service worker.
  `builder/PROJECT_SUMMARY.md` (data model, behaviour, testing limits) and
  `docs/specs/Feature Spec 2.1 Program Builder Phase 1.md` are the hand-over
  documents for it.
- GymLog's service worker covers the whole `/gym-app/` path, but it only
  caches `index.html` and `sw.js`; any other request, including the builder,
  goes to the network as normal.
- **Storage:** it shares the origin `hoplifter.github.io` with GymLog, so it
  must never touch GymLog's `gymapp_` keys, and does not. Its own keys all
  start with `builder_` (`builder_draft_v1`, `builder_exercise_list_v1`,
  `builder_detail_height_v1`). The only thing it reads from GymLog is a
  Backup All Data file the user picks: just `gymapp_exercise_list_v1`, kept as
  `builder_exercise_list_v1` and used for the exercise name dropdown.
- **What it hands to GymLog:** the builder copies an AI prompt. The AI
  returns an import file in the existing Program Import Format (including the
  `superset` field from 1.7) plus a copy of the program with kg values for the
  builder. Nothing new is needed in GymLog.
- **Things worth knowing when reading its import files:** each set group is
  its own exercise entry, in order. A superset pairs one set group with one
  set group of another exercise (equal set counts), so one exercise name can
  appear in several entries and several pairs in a workout, with the pair
  next to each other. Rest is per entry. Load types can differ between set
  groups of one exercise; the file only holds kg weights. This matches the
  note in `ROADMAP.md` that until 1.8 each different weight and rep
  combination is a separate entry.
- **Status:** all built steps and the scripted acceptance tests pass. A real
  block going through the AI prompt, into GymLog, and back into the builder
  (spec tests 23, 39-41, 45 (Open file warning), 46-47 and 51-54) was being
  tried when this was written.

## Superset Import (Roadmap 1.7, v62, build 20261104)
Source: Feature Spec 1.7. All in `index.html`; `sw.js` only has the version
bump to `gym-app-cache-v62` (`APP_VERSION` matches).

- **Import field:** an exercise may carry an optional `superset` text value.
  Within one workout, a value (trimmed) shared by exactly two *adjacent*
  exercises makes a pair: both get one new `supersetId` (`newId("grp")`) and
  the second exercise's `rest` is set to the first's (same as
  `pairSuperset()`). A value used once, by 3+ exercises, by non-adjacent
  exercises, or blank/whitespace/non-text imports unpaired, silently. The
  value only matters within its workout; the same letter in another workout
  is a separate pair.
- **Code:** `doImport()` now builds exercises via `buildImportedExercises()`,
  which maps the defs as before and then calls `applyImportedSupersets()`.
  The `superset` field itself is not saved; only `supersetId`. No new
  storage key, no migration. Everything after import (group rendering,
  Move Up/Down, Remove Superset, shared rest, Rest Timer, Export tag,
  Backup) already works from `supersetId` and adjacency, unchanged.
- **`Program Import Format.md`:** `superset` added to the Exercise table;
  "Supersets" removed from "What can't be imported".
- **Testing limits:** run in a desktop browser against a local server with
  the restored real backup: helper scenarios (pair, two pairs, trimmed
  value, three, one, non-adjacent, blank/whitespace/non-text, no field, field
  not saved, distinct group ids), a real `doImport()` with the same letter
  in two workouts, group box and shared rest on the Workout screen (375px
  screenshot), `(Superset A)` Export Gym Log tag, and `supersetId`
  persisting in storage. Not re-run by hand this session (existing
  behaviour, unchanged code): Move Up/Down, Remove Superset, Rest Timer
  naming, condensed History line, backup/restore round trip. Not run on a
  phone.

## Docs update, 4 November 2026
`ROADMAP.md` updated: added 1.7 Superset Import, 1.8 Set-by-Set Logging,
1.9 Planned vs. Actual Tracking and 1.10 Missed Reps Logging, recorded the
Program Builder Epic decisions and phases, and refreshed the development
order. Specs for 1.7 Superset Import and Program Builder Phase 1 were
written. `index.html` and `sw.js` are unchanged, so the cache version stays
`gym-app-cache-v61`.

## Docs-only build 20261103_V9
`ROADMAP.md` updated (1.1, 1.2, 1.4 and 1.5 marked implemented, 1.6 Past
Programs Screen added, order refreshed). `index.html` and `sw.js` are
unchanged from V8, so the cache version stays `gym-app-cache-v61`.

## Tweak after testing (v61): comment box wording
On editable workout pages the "Workout comment" label above the box was
removed (it keeps an `aria-label`) and the placeholder is now "Leave a
comment about this workout…" (was "How did today go?"). The read-only Past
Workout view still shows the "Workout comment" label, so the text is
identified there. Supersedes the label/placeholder wording in the 1.5
section below. Cache version is `gym-app-cache-v61`.

## Workout Description and Comment (Roadmap 1.5, v60)
Source: Feature Spec 1.5 (Option B, comment at top of page). All in
`index.html`; `sw.js` only has the version bump. Builds on v59 (Program
Queue, unpublished at the time of this build).

- **Data model:** two optional text fields on queue and history workouts,
  `description` and `comment`. No new key, no migration; missing = empty.
  `comment` is deliberately separate from `note` (`endProgram()`
  overwrites `note`, `restoreWorkoutToQueue()` deletes it). Both fields ride
  along in Backup/Restore with no code change; Export Gym Log and Recent
  Performance are unchanged.
- **Description:** optional `description` string per workout in the import
  file; `doImport()` saves it trimmed, and only when it is a non-empty
  string. Shown read-only (13px, `--text-dim`) in `#workoutDesc` directly
  under the title inside the sticky header, on Today's, peeked queued and
  Past Workouts (also in History edit mode); hidden when empty so header
  height is unchanged (`positionUndoBanner()` measures the real height).
  Queue list second line shows it, falling back to `Program workout` /
  `Ad-hoc`. History list unchanged.
- **Comment (editable views):** static `#commentBox` (label "Workout
  comment", textarea, placeholder "How did today go?") in `#workoutBody`
  above `#workout`, so it scrolls away with the page and is not rebuilt by
  `renderExercises()`. `renderCommentBox()` only writes the value when it
  lacks focus (dayTitle pattern). The input handler writes
  `getActiveWorkout().comment` and calls `saveActiveWorkout()` (History
  edit goes through `historyEditDraft`; Save keeps, Leave discards); it
  never calls `render()`. `autoSizeComment()` sets the height from
  `scrollHeight` (reset first so it shrinks), on input, on render and on
  window resize; `resize: none`.
- **Comment (Past Workout, viewing):** `#commentBox` is hidden in
  `isCondensedHistoryView()`; `renderCondensedExercises()` fills
  `#condensedComment` below the table (also in the "No exercises logged."
  case), `pre-wrap`, via `escapeHtml()`; whitespace-only = hidden. It is a
  separate element so the table's `:last-child` border rule is unaffected.
- **Testing limits:** scenarios run in a desktop browser against a local
  server with a restored copy of a real backup, and 375px layout checked
  by screenshot: import (trim/blank/non-text/missing), queue second line,
  peek header, typing/persist/focus/grow/shrink, finish → Past view
  comment, History edit draft isolation, restore keeps comment. Not run
  on a phone: the iOS keyboard with the comment box, History Save/Leave
  buttons by tap, full-reload persistence and backup round trip of the new
  fields on-device.

## Program Queue (Roadmap 1.4, v59)
Add a new program without replacing the current one. Source: Feature Spec
1.4. All code in `index.html`; `sw.js` only has the version bump.

- **Data model:** new key `gymapp_programs_v1`, an array of
  `{ id, name, importedAt, status: "current"|"next"|"ended", endedAt? }`.
  Replaces the old single `gymapp_program_v1`. Queue/history workouts are
  unchanged; `programId` still links a workout to its program. Helpers:
  `currentProgram()`, `nextProgram()`, `queuedCountFor(id)`,
  `savePrograms()`.
- **Migration (startup):** if `gymapp_programs_v1` is missing, the old
  program becomes `current` (or the list is empty), `gymapp_program_v1` is
  removed, then `syncProgramState()` runs. Programs ended before v59 were
  never saved and cannot be recovered; workouts with an unknown
  `programId` display normally.
- **Import:** an empty `workouts` array shows "This file has no workouts."
  Otherwise: no current → import is Current; current has no queued
  workouts → it is marked ended and the import is Current; current has
  queued workouts and no next → import is Next; a Next already exists →
  `openNotice()` (Settings hides the button, so normally unreachable).
  The old "Replace current program?" confirm is **removed** (superseded).
  Workouts append to the end of the queue; `doImport(data, status)`.
- **`syncProgramState()`:** runs at startup and after Finish Workout
  (`completeActiveWorkout()`) and Delete from Queue
  (`confirmDeleteFromQueue()`). Next with no queued workouts → ended if it
  has history, else dropped from the list; Current with no queued
  workouts → ended; if no Current, Next is promoted. No pop-up, no note on
  the last workout. Ad-hoc workouts never count. Reordering never changes
  which program is Current. Restore from History never changes a
  program's status.
- **Remove Next Program** (Settings, red button): blocked by
  `blockIfTimerRunning()` if Today's Workout belongs to it; confirm
  "Remove next program?" then deletes its queued workouts and syncs.
- **End Current Program:** now marks the program ended (kept in the list)
  and promotes Next; confirm text gets `"Next" becomes your current
  program.` when one exists. Timer guard and `Program "X" ended here.`
  note unchanged.
- **Screens:** Settings shows Current/Next with `Start New Program` /
  `Add Next Program` / `Remove Next Program` / `End Current Program` per
  state. Queue program bar shows Next below Current; names wrap
  (`overflow-wrap: anywhere`).
- **Backup:** `ALL_DATA_KEYS` now includes `gymapp_programs_v1` and keeps
  `gymapp_program_v1`, so a pre-v59 backup restores (programs key absent
  → removed) and migrates on reload; new backups hold null for the old key.
- **Testing limits:** logic scenarios (migration, import → next, finish
  last workout switch, delete-all-next, remove next, end with next,
  reorder, ad-hoc) were run in a desktop browser against a local server,
  and the Queue bar was checked at 375px. Not run on a phone/iOS home-screen
  install; confirm dialog flows by tap, the undo-banner position under the
  taller Queue header, and restoring a real v58 backup file on-device.

## Set Progress Tracking (Roadmap 1.2, v58)
Shows which set you are on while the rest timer bar is open. All in
`index.html`; nothing is saved (in-memory only, lost on full app close).

- Tapping ⏱ reads `ex.sets` and adds `totalSets`, `currentSet`,
  `allSetsComplete` to the in-memory `restTimer`. A row of numbered 30×30
  squares (done / current / upcoming) sits above the existing bar content
  (the bar is now a column: `.rest-timer-sets` + `.rest-timer-main`).
  Squares are display only and wrap to a second row (10 sets fit 2 rows at
  375px).
- **Reset** (any state: running, paused, Rest Complete, overtime) moves to
  the next set and restarts the countdown. On the final set it enters **All
  Sets Complete**: all squares done, text "All sets complete", interval
  stopped (no overtime), Pause and Reset hidden, accent border, no pulse.
- **Warnings** (`openConfirm`, red Confirm): ✕ on an *active set timer*
  (has squares, not All Sets Complete) → "Close set timer?"; ⏱ on any
  exercise during an active set timer → "Replace set timer?". Helpers:
  `hasActiveSetTimer()`, `requestDismissRestTimer()`,
  `requestStartRestTimer(ex)`. No warning in All Sets Complete or when the
  exercise has blank/0 sets (timer behaves exactly as before, no squares).
- **Supersets**: one timer per round; square count comes from the tapped
  exercise; label is "Tapped + Partner" (ellipsis if long).
- The total is fixed when the timer starts (editing Sets mid-timer doesn't
  change the open bar).
- Body bottom padding raised (+190px) so a taller bar never covers Add
  Exercise / the last item.
- Cache/`APP_VERSION`: `gym-app-cache-v58`.
- **Testing limits**: verified by scripted browser-pane tests (acceptance
  tests 1–19, 21 and the 375px layout). Not tested on a real phone:
  backgrounding/lock-screen behaviour (test 20) — logic is timestamp-based
  as before and All Sets Complete has no running interval. Test 22 was
  checked only by not touching those areas.

## Workout Timer Resets When Its Workout Stops Being Today's
**Why**: a paused timer used to stay attached to its workout after another
workout was put in front of it (reorder, or restoring from History). When
that workout became Today's again it still showed the old elapsed time.
That is no longer wanted: the timer now belongs to Today's Workout only.

**Behavior**: any queued workout that is not first has its `timer`
discarded, so it starts from idle ("Start Workout", 0) the next time it is
Today's. Implemented as `clearStaleWorkoutTimers()`, called at the top of
`saveQueue()` (so every path that reorders the queue is covered: Move
Up/Down, Restore to Queue, etc.) and once at startup (cleans up timers
saved by v54–v56, e.g. on the phone). It is a no-op for Today's own timer.
The running-timer guard is unchanged: it still blocks changing Today's
Workout while *running*, so in practice only a *paused* timer is discarded.
Deleting a workout still deletes its timer with it.

**Supersedes** the earlier note that a paused timer "stays attached... and
reappears if that workout becomes Today's again" (Restore section below,
and the original 1.1 spec's "Paused timer" paragraph): it no longer does.
The restore confirm adds "Its paused workout timer will be reset." when
the current Today's Workout has a timer. Moving items in the Queue has no
confirm, so a paused timer is discarded silently there.

**Tested** (browser, copy of the real backup): pause A, restore a History
workout in front, finish it, come back to A: A shows Start Workout and no
clock; same after moving Today's down then back up while paused; a running
Today's timer is untouched by saves; a stale timer planted on a
non-first workout is removed on reload (memory and localStorage).

## Restore to Queue Now Becomes Today's Workout
**Behavior change**: "Restore to Queue" (History list ⋮ menu and the Past
Workout header ⋮ menu) used to append the workout to the *end* of the queue.
It now makes the restored workout **Today's Workout** (front of the queue);
the previous Today's Workout moves to second. `restoreWorkoutToQueue()`
inserts at the front and renumbers `order` 0..n-1 (same renumbering
approach as Add Workout). If the queue is empty it simply becomes Today's.

**Guard**: because this changes Today's Workout, both entry points now call
`blockIfTimerRunning()` first. While the workout timer is *running* the user
gets the same one-button "Pause the timer first" notice and nothing is
restored. While *paused* it is allowed. (Superseded in v57: the previous
Today's paused timer is now reset. In v56 it stayed attached to its workout,
hidden, and reappeared if that workout became Today's again.) Restore was
previously listed as "not blocked" because it appended to the end; that is
no longer true.

**Other details**
- The restore confirm now reads `"X" will become Today's Workout. "Y"
  moves to second in the queue.` (`restoreConfirmText()`).
- Restored workouts still start with no timer and no `durationSec`.
- From the Past Workout header menu, confirming lands on the restored
  workout as Today's; from the History list you stay on the History list.

**Tested** (browser, against a copy of the real backup): blocked from both
entry points while running; allowed while paused; order/renumbering; the
restored workout carries no timer or duration; the previous Today's paused
timer is preserved (superseded in v57: it is now reset); History list path
with no timer.

## Workout Timer Reset + Hold-to-Pause (follow-up to 1.1)
**Why**: found while using v54 on the phone. Starting the timer by accident
(e.g. checking the day's program in the morning, gym in the afternoon) had
no undo, and an accidental Pause silently stops the clock mid-workout.

**Changes** (all in `index.html`; no data model change)
- **Reset Workout Timer**: a red item in the header ⋮ menu, shown only on
  Today's Workout while a timer exists (running *or* paused). Opens a
  confirm ("The elapsed time (M:SS) will be discarded...") and, on
  confirm, deletes `workout.timer` so it goes back to idle ("Start
  Workout"). The workout's exercises are untouched. Not blocked by the
  running-timer guard, since it doesn't change Today's Workout. Chosen
  over an always-visible button so it can't be hit by accident at the gym.
- **Hold-to-Pause**: while running, the button reads "Hold to Pause" and
  needs a ~0.7s press (`HOLD_TO_PAUSE_MS`) with a fill animation. A quick
  tap does nothing; releasing early, sliding off the button or a
  scroll/cancel aborts it. Start and Resume stay single-tap. After a
  completed hold, the trailing `click` is ignored for 500ms
  (`holdFiredAt`) so it can't be read as an instant Resume. The button
  disables long-press callout/selection (`-webkit-touch-callout`,
  `user-select`, `contextmenu`).
- Start Workout is deliberately unprotected (Reset covers a wrong start).

**Limitations**: hold-to-pause is pointer/touch only (the keyboard can't
pause); it was tested with synthetic pointer events in the browser pane,
not yet with a real finger on the phone (gloves/sweaty hands untested).

## Global Workout Timer (Roadmap 1.1)
**What**: tracks total time spent on Today's Workout, separate from the
rest timer. Explicit Start / Pause / Resume on Today's Workout only; the
elapsed clock sits in the sticky header on the same row as the date badge
(badge left, clock + pill button right). Finish Workout stops it and
stores the duration on the history entry.

**Behavior**
- Elapsed = `accumulatedMs` + (running ? `now - startedAt` : 0), always
  derived from timestamps (never counted from ticks), so it is right after
  backgrounding, phone lock or a full app close. State is saved with the
  workout via `saveQueue()` on Start/Pause/Resume/Finish only.
- Format `M:SS`, or `H:MM:SS` from one hour; paused clock is dimmed.
- Shown only on Today's Workout (front of queue): hidden on peeked queued
  workouts, Past Workouts, the empty state and the Queue list. Navigating
  to other screens never pauses it. The 1s refresh interval only runs
  while it is running and Today's Workout is on screen
  (`syncWorkoutTimerInterval()`); a `visibilitychange` handler refreshes
  immediately on return.
- **Guard**: while the timer is *running*, anything that would change
  Today's Workout shows a one-button notice ("Pause the timer first")
  and changes nothing: moving the first Queue item down or the second up,
  deleting Today's Workout (Queue list or header ⋮ menu), and End Current
  Program when Today's Workout belongs to that program. Paused is treated
  as stopped, so none of this applies while paused. Notice is
  `openNotice()` (confirm modal with the Cancel button hidden); the guard
  helper is `blockIfTimerRunning()`.
- **Finish Workout** now lands on the finished workout's Past Workout
  view (`viewSource = "history"`, History tab highlighted) instead of the
  next queued workout; the Today tab then shows the next one. The confirm
  text appends "Duration: H:MM:SS" when a timer exists. Pause then Finish
  records only the time up to the pause.
- **Condensed History**: "Total Workout Time: 1h 12m" line directly under
  the date (`<1m` under a minute); omitted if the timer was never started.
- **History edit mode**: "Duration (min)" field beside the date field,
  editing `historyEditDraft.durationSec` in whole minutes (empty clears
  it). Save commits; "Leave" discards, like every other field.
- **Add Workout behavior change**: the new ad-hoc workout now inserts
  directly *after* Today's Workout (second position), always; if the
  queue is empty it becomes Today's Workout. Queue `order` values are
  renumbered 0..n-1 on insert. It opens as a peeked workout with the
  Queue tab highlighted (title focused).
- Restore to Queue deletes `durationSec` and never creates a timer. (As of
  v56 it also puts the workout at the front of the queue and is blocked
  while the timer is running — see the "Restore to Queue" section.)
- Not in Export Gym Log; no auto-start, notification or sound.

**Header height**: `.date-row` has `min-height: 34px` so the header is the
same height in idle/running/paused (measured 147px at 375px wide), keeping
`positionUndoBanner()` correct.

**Tested** (browser, scripted against the spec's acceptance list): start/
pause/resume, reload while running, blocked actions while running and
allowed while paused, Finish while paused, History view/edit/Save/Leave/
clear, Restore, End Program guard, Add Workout position and empty queue,
header height. Not tested on a real phone: lock screen / app-kill timing.

## Rest Timer Overtime Display
**Why**: a PWA can't notify the user when the timer ends while another app
is in the foreground, so the timer now shows how long ago it finished when
the user comes back to GymLog.

**Behavior** (after the countdown reaches zero; all derived from
`Date.now() - restTimer.endAt`, where `endAt` is the completion timestamp):
- 0-15s: `Rest Complete` (existing pulse animation, accent border).
- 15s to <5:00: red `+MM:SS`, the *total* time since completion (not since
  the 15s mark), red border, pulse stops.
- 5:00 and later: red `Over 5:00`, counter stops. Stays until Reset, a new
  timer, or dismissing the bar.
- Correct immediately after backgrounding/locking, since nothing depends on
  interval ticks having run.

**What changed** - all in `index.html`'s rest timer code:
- New constants `REST_COMPLETE_GRACE_MS` (15000) and
  `REST_OVERTIME_LIMIT_MS` (300000).
- `tickRestTimer()` no longer clears the interval at zero. It keeps `endAt`
  as the completion time and only stops the interval at the 5:00 cap.
- `renderRestTimer()` picks the text/state from elapsed time since `endAt`
  and toggles a new `.overtime` CSS class (red border and time text, pulse
  off).
- `visibilitychange` handler now also ticks while `finished`, not only while
  `running`.
- New `finishRestTimerNow()`: a 0-second timer (from Start or Reset) counts
  as completed "now" and starts the overtime flow like any other.
- Start/Reset needed no overtime-specific code: both rebuild or reset the
  timer state, so previous overtime never carries over.
- "Rest complete" text is now "Rest Complete".

**Architecture note**: no new state fields; `endAt` already held the
completion time once the countdown ended.

**Limitations**: no background notification, sound, or vibration (still in
the backlog). Overtime is not persisted, so it's lost if the app is fully
closed (same as the rest of the timer).

## Removed Automatic-Save Notice, Added Animated Save Indicator
**Why**: the permanent "Changes save automatically on this phone" line at
the bottom of the Workout screen was no longer needed and just added
visual clutter. But its replacement — a brief "Saved just now" text flash
— was easy to miss, since it appeared at the bottom of the screen, far
from where most edits happen (the exercise cards / header area).

**What changed** — all in `index.html`:
- **Removed the default autosave text.** The `#status` div now starts
  empty and `hidden` instead of showing "Changes save automatically on
  this phone". Since `.hidden` is `display: none`, the div's own
  `margin-top: 24px` collapses to nothing when empty — no leftover gap
  at the bottom of the page.
- **`flashSaved()` no longer writes text at all.** Every save
  (`saveQueue()`/`saveHistory()`) now triggers a small animated
  **save indicator icon** instead — a floppy-disk icon, in the accent
  green color, that flashes (fades in/out) three times over 1.2 seconds
  via a CSS `@keyframes` animation (`saveIndicatorFlash`), then returns
  to fully transparent. Rapid saves restart the flash cleanly (remove
  the animation class, force a reflow, re-add it — the standard way to
  restart a CSS animation).
- **Icon placement**: the icon (`#saveIndicator`, an inline `<svg>`)
  lives in the header controls, always at a fixed 16px width in the flex
  row (only its opacity changes), so it never shifts the ⋮ menu or Edit
  button when it flashes — nothing has to be pushed out of the way.
  - **Today's Workout / a peeked Queued Workout**: sits immediately to
    the left of the ⋮ menu button, inside `#navRight`.
  - **A History subpage** (viewing or editing a Past Workout): sits
    immediately to the left of the **Edit/Save** button instead — a
    deliberate swap from the default position, since the Edit/Save
    button is the more relevant thing to have the indicator's attention
    land near there. The ⋮ menu still follows after Edit/Save, same as
    before.
  - New **`positionSaveIndicator()`** helper decides which slot the icon
    belongs in (based on `viewSource === "history"`) and moves the
    existing DOM node there — mirrors the existing `positionHeaderMenu()`
    pattern used to relocate `#navRight` itself. Called right after
    `positionHeaderMenu()` in both `renderWorkoutHeader()` and
    `renderEmptyHeader()`.
- **The "Editing — press Save to keep changes" status message is
  unaffected** — it still uses the same `#status` div as before, still
  shows while a History edit is in progress, still hides once editing
  ends. Only the *default idle* text and the *save confirmation* text
  were removed/replaced; this message was never part of either.

**Architecture note**: no new state was introduced — this is a
presentation-only change. The icon's visibility is driven purely by a
CSS class (`.flashing`) toggled by `flashSaved()`, the same function
every save path already called. `.status.saved` (the old CSS class used
to color the "Saved just now" text) is now dead/unused CSS — left in
place since removing it has no functional effect and isn't worth the
risk of touching adjacent styles.

**Testing performed**: edited a field on Today's Workout → icon flashes
three times next to the ⋮ menu, ⋮ menu position unchanged before/during/
after. Edited a field while editing a Past Workout → icon flashes next
to the Edit/Save button (not the ⋮ menu), button positions unchanged.
Rapid consecutive edits → flash restarts cleanly each time, no stuck
half-flashed state. Left History edit mode (Leave without saving) →
"Editing…" text disappears as before, unaffected by the icon change.
Confirmed no residual "Changes save automatically" text anywhere and no
blank gap at the bottom of the Workout screen when idle.

**Limitations**: the save indicator (like the old status line) only
exists inside `#workoutScreen` — a save triggered while viewing Queue/
History/Settings still fires the flash, but it's invisible until the
user returns to the Workout screen (same limitation the old text status
had; not a regression).

## Bug fix: Unsaved History Edits Persisted After "Leave"
**Why**: editing a completed (History) workout and then choosing "Leave
without saving" on the unsaved-changes prompt didn't actually discard
anything — the workout kept whatever changes had been made.

**Root cause**: every field-input handler called `saveActiveWorkout()`
on every keystroke, which wrote straight through to the real `history`
array and `localStorage`, regardless of `editMode`. `editMode` only
controlled which UI was shown (editable cards vs. condensed table) — it
never isolated the data itself. So by the time "Leave" was pressed, the
edits were already saved; "Leave" only reset `editMode` back to `false`,
with nothing left to discard.

**What changed** — all in `index.html`:
- New `historyEditDraft` variable: a deep copy of the workout, created
  only when entering edit mode on a Past Workout.
- `getActiveWorkout()` now returns `historyEditDraft` instead of the
  real `history` entry whenever `viewSource === "history" && editMode`.
  Every existing read/write path (name/sets/reps/weight/rpe/rest/notes
  inputs, add/delete/reorder, superset pairing, title, date) already
  goes through `getActiveWorkout()`/`findExercise()`, so this one change
  isolates all of them automatically — no per-field changes needed.
- `saveActiveWorkout()` now no-ops for History while `editMode` is true
  (the draft is already mutated in place by reference; nothing to
  persist yet).
- New `commitHistoryEditDraft()`: writes the draft back into the real
  `history` array by id and calls `saveHistory()`. Only called from the
  Save path.
- **Edit** button: now snapshots `history.find(...)` into
  `historyEditDraft` (deep copy via `JSON.parse(JSON.stringify(...))`)
  before setting `editMode = true`.
- **Save** button: calls `commitHistoryEditDraft()` (persists the draft)
  before setting `editMode = false`.
- **Leave** (in the existing `guardLeavingEdit()` "Leave without
  saving?" confirm): now also clears `historyEditDraft = null` — so the
  draft, and everything typed into it, is simply thrown away. The real
  `history` entry was never touched, so it's already back to its
  pre-edit state with no extra work.
- Status line — at the time this was written, showed "Changes save
  automatically on this phone" by default; now shows nothing by default
  (see "Removed Automatic-Save Notice" above) — still shows "Editing —
  press Save to keep changes" while a History edit is in progress,
  since autosave genuinely isn't happening until Save is pressed —
  reverts automatically once editing ends.

**Architecture note**: no new data model or storage key — this is
purely an in-memory isolation layer between the UI and `history`/
localStorage during History edit mode. Today's Workout and Queue
editing are untouched (they still autosave on every change, as
intended — only History edit mode ever needed "discardable" edits, per
the Edit/Save toggle design already in place).

**Testing performed**: edited weight on a past workout, chose Leave,
reopened — original weight intact. Edited notes, chose Leave — original
notes intact. Made several edits across multiple fields (name, sets,
rest, added/deleted an exercise, paired a superset) in one edit
session, chose Leave — all discarded, workout identical to before
editing. Chose Stay after the warning — edits still present, still
editable. Edited then chose Save — change persisted after navigating
away and reopening. Edited nothing, then navigated away via bottom nav
— no warning shown (unchanged from before). Confirmed Today's Workout
and Queue editing still autosave exactly as before (unaffected by this
change, since they don't go through `historyEditDraft`).

**Limitations**: unchanged pre-existing gap — the edit-mode guard still
only covers the bottom tab bar, not the header ⋮ menu's Restore
to Queue / Delete from History actions while mid-edit (these have their
own separate confirms already, but won't offer to discard/keep the
in-progress draft). Not addressed here — same scope boundary as before.

## Timer Reset Automatically Restarts
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

## Condensed History (Past Workout) View
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

**Data model**: no changes were needed for the condensed History view —
it's purely a new read-only presentation layer over the existing
`exercises` array. The empty-string states for sets/reps/weight/rpe/rest
that the data model already supported are just formatted differently
(as "–") for display, nothing new was added to support it.

## Feature added: Superset State Consistency and Group Behavior
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

## Bug fix (earlier)
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
localStorage keys. Optional fields (`timer`, `durationSec`, `description`,
`comment`) need no migration: absent means idle / no duration / empty, so old
data and old backups load unchanged.
- `gymapp_programs_v1` — array of every imported program:
  `{ id, name, importedAt, status: "current"|"next"|"ended", endedAt? }`
  (see "Program Queue"). It replaced the old single `gymapp_program_v1`,
  which is migrated and removed at startup; restoring a pre-v59 backup
  still works.
- `gymapp_queue_v1` — array of planned workouts, each:
  `{ id, programId, label, description?, comment?, date, status: "queued",
  order, exercises, timer? }` where `timer` is
  `{ status: "running" | "paused", startedAt: <ms epoch> | null,
  accumulatedMs }` (absent = idle).
  `order` determines queue position (ascending); the lowest `order` is the
  "Today's Workout" / active workout. `date` is `null` until the workout is
  completed. `programId` is `null` for ad-hoc workouts.
- `gymapp_history_v1` — array of completed workouts, each:
  `{ id, programId, label, description?, comment?, date, status:
  "completed", note, exercises, durationSec? }` (no `order` field — history is sorted by `date`, newest
  first). `durationSec` is the workout timer's total, absent if never started.
- `gymapp_exercise_list_v1` — flat array of strings, the standardized
  exercise list. Always kept sorted alphabetically by the code that writes it.
- Each exercise: `{ id, name, sets, reps, weight, rpe, rest, notes, supersetId }`.
  `rest` is stored **in seconds** internally (see Rest Timer note below).
  `sets`/`reps`/`weight`/`rpe`/`rest` can individually be `""` (an empty
  field the user cleared) — the condensed History view renders any of
  these as "–" rather than leaving a blank cell.
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
  (History list, Recent Performance rows, and the condensed History
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
  [save indicator, History only] [Edit/Save button, History only]
  [save indicator, non-History peek] [⋮ menu]`. This same row layout is
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
- **`#saveIndicator`** (the small animated save icon, see "Removed
  Automatic-Save Notice" above) is a separate single DOM node reparented
  by `positionSaveIndicator()` — sits just before the ⋮ menu button
  normally (Today's Workout, a peeked Queued Workout), or just before
  the Edit/Save button on any History subpage. Called right after
  `positionHeaderMenu()` in both `renderWorkoutHeader()` and
  `renderEmptyHeader()`, so it always resolves to the correct slot
  whenever the header re-renders.

**Edit/Save toggle button** (`#editToggleBtn`, History only) — sits in
`#titleRow`, with the save indicator immediately to its left and the ⋮
menu immediately after it. Reads "Edit" when showing the condensed
presentation (click enters edit mode, switching to the regular editable
cards); reads "Save" while editing (click saves, exits edit mode,
returns to the condensed presentation). Hidden entirely for Queue
workouts, which have no read-only/edit-mode concept.

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
- **Program Management** — current and next program names, with "Start
  New Program" (none), "Add Next Program" (current only), "Remove Next
  Program" (next exists) and "End Current Program" (current exists)
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
  New Program" / "Add Next Program", or the Workout empty-state's "Start
  New Program" button. A second program waits as Next and takes over
  automatically (see "Program Queue").
- "End Current Program" clears remaining queued workouts (completed ones
  stay in history), annotates the last completed workout and promotes the
  Next Program.
- Queue screen lists all planned workouts in order; reorder, delete, or
  add a one-off "Add Workout" ad-hoc entry (inserted right after Today's
  Workout).
- Each workout can carry a read-only `description` (from the import file,
  shown under the title and on the Queue list) and an auto-saving
  `comment` box written by the user (read-only on Past Workouts). See
  "Workout Description and Comment".
- Set squares: a row of numbered set squares in the rest timer bar shows
  which set you are on (see "Set Progress Tracking").
- Global workout timer on Today's Workout (Start, hold-to-Pause, Resume,
  Reset from the ⋮ menu; duration saved on Finish, shown in Past Workouts
  and editable there) — see the "Global Workout Timer" sections.
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

**Condensed History (Past Workout) View**
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

**Save Indicator**
- Replaces the old permanent "Changes save automatically on this phone"
  text and its "Saved just now" flash. A small floppy-disk icon in the
  accent green color flashes three times over 1.2 seconds next to the
  header controls whenever a change is saved.
- Sits next to the ⋮ menu on Today's Workout / a peeked Queued Workout;
  sits next to the Edit/Save button instead on any History subpage.
  Reserves a fixed slot so nothing shifts when it appears.

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
backgrounding. Doesn't survive the app being fully closed. Reset
immediately restarts the countdown at the last-used duration. After
  it hits zero: `Rest Complete` for 15s, then a red `+MM:SS` overtime
  counter, then `Over 5:00` at the 5-minute cap.

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
- The rest timer doesn't survive the app being fully closed/killed. (The
  global workout timer does.)
- Workout timer: no cap or warning if you forget to finish (it keeps
  running overnight; fix the total in History edit). It uses `Date.now()`,
  so changing the phone clock mid-workout distorts the time.
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
- The save indicator (like the old status text before it) only exists
  inside the Workout screen's DOM — a save triggered while on Queue/
  History/Settings still fires, but isn't visible until returning to
  the Workout screen.
- `.status.saved` (CSS) is now dead/unused, left in place from before
  the save-indicator rework — harmless, but a candidate for cleanup if
  the stylesheet is ever tidied up.

## Backlog / ideas not yet built
The backlog now lives in `ROADMAP.md` (section 6, "Smaller ideas"), together
with the features and epics, so there is one list. Add new ideas there.

## How to resume work
1. Open Claude Code in `C:\Projects\gym-app` and say which project the
   session is for: GymLog, Program Builder, or planning.
2. Claude reads `CLAUDE.md`, `docs/WORKFLOW.md` and this file (and
   `builder/PROJECT_SUMMARY.md` for builder work). Nothing needs uploading.
3. Say what you want to change or add next.

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
     of the app — new features, data model changes, updated limitations —
     and update `ROADMAP.md` (and `builder/PROJECT_SUMMARY.md` for builder
     work). Claude has no memory between sessions, so these files are the
     only thing that carries context forward — they must stay accurate or
     the next session starts from stale information.
