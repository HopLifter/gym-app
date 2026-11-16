# GymLog – Future Features & Epics Roadmap

**Status:** Exploratory backlog  
**Last updated:** 15 November 2026 (Program Builder UI/UX overhaul; ideas "kg loads from a template" and "the Exercise List as a global list" added to Epic 2.1); 8 November 2026 (Program Builder Phase 2 steps 1 to 4 built; real use starts); 6 November 2026 (Program Builder Phase 2 spec drafted; coach feedback on the Program Builder added to Epic 2.1); 5 November 2026 (Program Builder Phase 1 implemented and moved into this repo; 1.7 implemented, v62; smaller ideas merged in as section 6)  
**Purpose:** Capture future feature ideas, larger development initiatives (Epics), and their intended value before writing detailed requirements specifications.

## 1. Individual Features

These are relatively independent features that can be designed and implemented separately.

### 1.1 Global Workout Timer

**Goal:** Track the total time spent on an individual workout.

- Option to start a timer when selecting "Start Workout".
- Track elapsed workout time independently of the existing rest timer.
- Continue tracking accurately when switching apps or locking the phone.
- Display total workout duration in the workout interface.
- Status: implemented (v54, with follow-ups to v57).

**Complexity:** 2/5  
**UX/UI Improvement:** 4/5

### 1.2 Set Progress Tracking

**Goal:** Show which set the user is on while the rest timer is open, so they don't lose track during a workout.

- A row of numbered set squares in the rest timer bar (Option A, Numbered Sets).
- Reset moves to the next set; the final set shows an All Sets Complete state.
- A warning before an active set timer is closed or replaced.
- Out of scope: saving progress, recording reps/weight per set, tapping to mark sets complete, undoing a Reset.
- Status: implemented in v58 (spec 1.2).

**Complexity:** 3/5  
**UX/UI Improvement:** 5/5

### 1.3 Workout Focus Mode

**Goal:** Introduce a dedicated, distraction-free workout interface.

- Provide an optional full-screen or simplified workout experience.
- Hide unrelated information, including past and future workouts.
- Prioritize the current exercise and set progression.
- Integrate the rest timer and global workout timer.
- Retain the existing workout interface as an alternative.

**Complexity:** 4/5  
**UX/UI Improvement:** 5/5

### 1.4 Program Queue

**Goal:** Add a new program without replacing the current one; it waits behind the current program and takes over automatically when that finishes.

- One Current Program and at most one Next Program, shown on the Queue and Settings screens.
- Automatic switch when the Current Program has no queued workouts left.
- Remove Next Program, and End Current Program promotes the Next Program.
- A permanent saved list of programs (`gymapp_programs_v1`), including ended ones, with migration from the old single-program key.
- Out of scope: a Past Programs screen (see 1.6), more than one waiting program.
- Status: implemented in v59, published in build 20261103_V8 (cache v61).

**Complexity:** 3/5  
**UX/UI Improvement:** 4/5

### 1.5 Workout Description and Comment

**Goal:** Give each workout a short description (from the import file) and a journal-style comment written by the user.

- Optional `description` per workout in the import file, shown read-only under the title and on the Queue list.
- Editable, auto-saving workout comment at the top of the workout page; read-only on Past Workouts.
- Out of scope: editing the description in the app, adding either field to Export Gym Log, searching comments.
- Status: implemented in v60, wording tweaked in v61 (comment box has no label, placeholder "Leave a comment about this workout…"); published in build 20261103_V8.

**Complexity:** 2/5  
**UX/UI Improvement:** 4/5

### 1.6 Past Programs Screen

**Goal:** Show past (ended) programs and their workouts, using the permanent program list added in 1.4.

- Not yet specified.
- Status: planned. Its dependency, 1.4, is done.

### 1.7 Superset Import

**Goal:** Let an import file define superset pairs, so the Program Builder's AI-prepared files can include them.

- Add an optional import field that pairs two adjacent exercises.
- Keep the shared rest time correct on import.
- Files without the field import as they do today.
- Status: implemented in v62 (build 20261104, spec 1.7). Needed for Program Builder Phase 1, which can now rely on it.

**Complexity:** 2/5  
**UX/UI Improvement:** 3/5

### 1.8 Set-by-Set Logging

**Goal:** Hold different weights and reps for one exercise within the same exercise box.

- Replace the single sets, reps, weight and RPE values with a list of sets.
- Keep the common case simple when all sets are the same.
- Migrate existing workouts and backups, and extend the import format.
- Update Rest Timer squares, Volume, Recent Performance, condensed History and Export Gym Log.
- Status: idea. Foundation for 1.9 and 1.10.

**Complexity:** 4/5  
**UX/UI Improvement:** 5/5

### 1.9 Planned vs. Actual Tracking

**Goal:** Keep the prescribed values when the logged values differ from them.

- Store planned and actual values separately, instead of overwriting the plan.
- Show the difference in Past Workouts.
- Include both in backups, so the Program Builder can analyze them.
- Status: idea. Depends on 1.8.

**Complexity:** 3/5  
**UX/UI Improvement:** 4/5

### 1.10 Missed Reps Logging

**Goal:** Record quickly when prescribed reps were not reached.

- Assume a set went as planned, so only exceptions need input.
- Enter the actual reps for a set with minimal tapping during a workout.
- Show missed reps in Past Workouts and Recent Performance.
- Status: idea. Depends on 1.8 and 1.9. Specify these three together, because they share one data model.

**Complexity:** 3/5  
**UX/UI Improvement:** 5/5

## 2. Epics

Epics are larger initiatives that must be broken down into smaller features and implementation steps.

### 2.1 Program Builder Epic

**Goal:** Allow users to create, manage, and reuse training programs, first in a desktop website and later directly within GymLog.

**Decisions so far:**

- Build a separate desktop website on GitHub Pages, in its own repo. Move it into GymLog only once it is stable.
- Save programs as a downloadable program file.
- Use the combined layout: a Program Grid (weeks across, workouts down) as the main view. Selecting an exercise opens a week-by-week table for that workout below it.
- Update the layout immediately when the number of weeks or workouts per week changes.
- Support mixed programming within one program: fixed kg, % of 1RM and RPE targets, with easy switching between them. Percentages are always % of 1RM.
- The builder keeps every load as written and does not convert it to kg.
- Offer progression as a pick list of patterns, similar to a Google Calendar series: same every week, a custom change per week, a percentage increase (kg only, with the rounding chosen by the user), +1 RPE per week (RPE only, capped at 10), or set each week manually. Each set group has its own pattern.
- Suggestions never change a program until the user approves them.
- Add no AI costs. The tool outputs a prompt to use with AI separately.
- Support supersets. A superset pairs one set group of an exercise with one set group of another exercise, with equal set counts (a larger group can be split, e.g. Curls 6 sets into 3 + 3). In the GymLog import file each pair becomes two adjacent entries, so one exercise can appear several times in a workout.
- Each set group has its own load type (kg, % of 1RM or RPE) and its own rest time.
- A blank load stays blank, and later weeks show the planned change (for example `Set load + 5 kg`).
- Exercise names come from the GymLog Exercise List.
- Single user for now, but avoid choices that would block future users.
- Sets per muscle group is out of scope for now.
- Exercises usually run in every week, but can be added to or removed from individual weeks.
- Week 1 generates later weeks from the pattern, and any week can still be edited by hand.
- The review table is edited in the AI chat for now.
- Reopened programs show the kg value next to each prescription.

**Getting a program into GymLog:**

1. The builder creates a prompt containing the program, for use with a separate AI.
2. The user adds their 1RMs and, optionally, a Backup All Data file.
3. The AI returns a readable, editable table showing each prescription and its suggested kg.
4. The user edits the table, and the AI asks for confirmation.
5. Once confirmed, the AI provides two files: the GymLog import file and a copy of the program for the builder, with the kg values added.

The builder does not export directly to GymLog.

**Phases:**

1. Core builder: create, edit, save and reopen programs, and copy the AI prompt. Status: implemented (5 November 2026) as a separate desktop page in the `builder/` folder of this repo, https://hoplifter.github.io/gym-app/builder/ (it began as its own repo, plain HTML/CSS/JS, no change to GymLog itself). Its own `PROJECT_SUMMARY.md` and spec describe it. The end-to-end run (AI prompt, GymLog import, reopening the AI's program file) is still being tried with a real block.
2. Reuse: templates, duplication and versions. Status: **steps 1 to 4 built** (8 November 2026), spec `docs/specs/Feature Spec 2.1 Program Builder Phase 2.md`. Done: browser library with export and import of everything; the flat editor (workout bands, aligned weeks, settings panel, week flags); coaching fields (rep range, RPE or RIR target, RIR load type, set type, tempo, pause); athlete profiles (maxes, rounding, exercises the athlete cannot do); templates; Generate a program for an athlete from a template (kg calculated by matching the exercise name to the athlete's lift); Export for GymLog (the phone import file). Not built yet: step 5 progression tools (ramp, per-week table, deload scaling, back-offs, wave, rep range), step 6 duplication and versions, step 7 metrics charts. Dropped by the user: the per-exercise "reference lift". **UI/UX overhaul (15 November 2026):** the exercise settings panel is the one place to change an exercise (a week table and an inline progression replace the week editor and progression dialogs); Add exercise is a search box; one set of design tokens and SVG icons; a simpler editor header with a menu; the Library is a list with a details panel, and the athlete profile is edited in that panel; a program always belongs to an athlete (a program without one becomes a template); Generate and Export for GymLog repairs; "Add to all workouts" puts an exercise at the start or the end of every workout; a code cleanup. The overhaul is complete. Feedback after it (15 November 2026): a new athlete starts with no lifts, Tab works in the athlete's lifts table, and the library can be empty (no automatic "New Template"). Details: `builder/PROJECT_SUMMARY.md`, section "UI overhaul".
3. Analysis: weekly and per-exercise workload.
4. History: import backups and compare planned with actual (best after 1.8 to 1.10).
5. Suggestions: AI suggestions based on workout history, approved by the user.
6. Mobile: move the builder into GymLog.

**Coach feedback (6 November 2026, planning session).** An experienced powerlifting coach review of Phase 1 produced the items below. They are ideas, not approved specs; review them together before any build. Decisions made so far:

- **Templates and athlete profiles are one feature.** The builder stores a collection of block templates (structure and prescriptions, no kg). An athlete profile holds a name, a 1RM per main lift (optionally a training max) and the plate rounding (usually 2.5 kg). Generate = template + profile gives a populated program with kg values; the coach reviews and edits it, then the builder writes the GymLog import file directly. The AI round trip is no longer needed for percentage loads.
- **RPE and blank loads stay blank** after generation (decided). The athlete or coach fills them in. A labelled estimate from an RPE chart may come later.
- **Percentage reference lift (decided).** Each exercise gets a "% of which lift" field (for example pause squat: Squat; close-grip bench: Bench). Percent loads use that lift's 1RM (or training max).
- **Metrics on the programming screen.** Charts for sets, tonnage and average intensity per lift per week, updating as exercises and loads are added. The same metrics show on the template selection screen so templates can be compared. Bonus, later: a body diagram heat map by muscle group; it needs an exercise-to-muscle table with weights, so design the exercise data to allow it.
- **Progression tools for coaches** (agreed; order): 1) percentage ramp (start and end %, weeks in between fill linearly); 2) per-week table (percentage and reps for each week in one row); 3) deload week flag (reduces sets or intensity, coach can override); 4) top set plus back-offs (back-offs as a % of the top set); 5) wave loading; 6) rep progression in a range.
- **Coaching options to add slowly** (cheapest first): RIR, set-type labels (warm-up, top set, back-off, AMRAP, drop set), rep ranges, tempo, pause length, deload/test/competition week flags. Later: cluster sets, band/chain tension, block phase names, autoregulation rules, training max (%TM).
- **Considered for the long term:** desktop-only layout limits (mobile is Phase 6); a safety net beyond one localStorage draft (version history, undo and redo); an automated test suite.
- **Richer Library rows (idea, 7 November 2026, not yet designed):** each program row gets a small picture at the top left with the title left-aligned underneath, the description to the right of the picture, and a few key stats between the description and the buttons. The stats stay the same for every program so programs can be compared quickly. Decided: the picture is a **preset icon** chosen from a small built-in library (no uploaded images, so nothing extra in the browser's 5 MB storage; the icon is stored as a short key, such as `barbell`, on the program or template, and drawn as inline SVG). A template shows its icon as a placeholder the user picks. Once a template is applied to a lifter, a small badge at the bottom right of the icon shows the first letter of the lifter's name (from the program's `source` in step 4). Stats for now: weeks and workouts per week only; more (total sets, average intensity from the Phase 2 metrics) can follow. The icon can be picked in both places: by clicking it on the Library row, and next to the program name in the editor. Still open: which icons are in the library. Show full-width mockups before building.
- **kg loads from a template (idea, 15 November 2026, not yet designed):** a template can hold loads in kg, and "Use for athlete" copies them to the athlete's program unchanged. Ideas: 1) the Generate dialog warns that some exercises have kg loads from the template and may need a change for this athlete; 2) the athlete's program marks those values until the coach changes or confirms them (this needs one new optional field on a set group, for example `preset: true`; a missing field means no mark, so old files still open); 3) the Generate dialog lets the coach type a value for each of those exercises at that moment. Discuss the data model before any build.
- **Idea to revisit (15 November 2026): the Exercise List as a global list.** Decide how the Exercise List works across the builder as a whole (and with GymLog): where it lives, how it is edited, and how exercise names stay the same in programs, templates and athletes' lifts. Not designed yet; discuss before any build.
- **Other quality-of-life ideas:** duplicate week, day or program; copy a day across weeks; drag-and-drop reordering; printable or PDF program for athletes; search in the exercise picker; comments per week; a multi-athlete dashboard.

Potential features:

- Program creation and editing interface.
- Configurable training variables, including sets, reps, weights, RPE and rest.
- Flexible program structures (programs, weeks, workouts and exercises).
- Weekly and per-exercise workload analysis.
- Multiple saved programs and reusable templates.
- Performance-informed program adjustments based on completed workouts.
- Program versioning and progression management.
- Recommendations and/or automatic progression based on workout history.

**Design decision:** Support both recommendations and predefined progression rules, through one flow where the user approves every change.

**Complexity:** 5/5  
**UX/UI Improvement:** 5/5

### 2.2 Native Capabilities & App Integrations Epic

**Goal:** Evolve GymLog beyond a standalone workout tracker by connecting it with phone capabilities and other applications.

Potential features:

- Reliable phone alarms and notifications when rest periods finish.
- Background timer functionality.
- Apple Shortcuts integration.
- Apple Books integration (e.g. reading during rest periods).
- Music and audio application integrations.
- Apple Health integration.
- External Bluetooth device support.
- Potential native iOS application or native wrapper.

**Important architectural consideration:** The current PWA has limitations around background execution, notifications and controlling other applications. Each desired capability should be evaluated independently before deciding whether native iOS development is necessary.

**Complexity:** 5/5  
**UX/UI Improvement:** 5/5

### 2.3 UI/UX Overhaul Epic

**Status:** In progress. Stops 1 to 3 are done (v64 and v66). Stop 4 is built (v69) and in test with the user.

**Purpose:** Make GymLog safe for the data and easy to use with one hand in the gym: flat screens with divider lines, large controls, design tokens, fewer taps for each set. Mockups: `docs/mockups/GymLog UI Overhaul - Workout Screen Options.html`.

**Stops:**

1. Protect the data: safe storage helpers, failed-save rollback, text escaping (done, v64).
2. Mockups for the Workout screen, the bottom bar and the History list (done).
3. New Workout screen: flat rows with one open row, − and + buttons, history button, superset pair opens as one, timer bar tap goes to its exercise (done, v66).
4. Set bar that replaces the rest timer bar: one button ("Start Workout", "Start Set 1" …, "Next Exercise", "Finish Workout") and a small pause button, saved rest time and set count, active exercise, "Start This Exercise" and "Restart This Exercise" in the rows (built, v69; in test). This stop replaces feature 1.2's set squares and prepares feature 1.8.
5. Other screens: Queue, History with month headings, Settings, dialogs, bottom sheets, one message bar.
6. Exercise picker: full screen, search, recent exercises, values from the last session.
7. Backup and restore: last backup date and reminder, file summary before restore, undo copy.
8. Import preview and a progress screen for each exercise.
9. Clean-up: dead code, manifest and icon, documents.

**Complexity:** 4/5  
**UX/UI Improvement:** 5/5

## 3. Suggested Development Order

An initial suggested sequence, subject to further exploration:

1. Global Workout Timer (done).
2. Set Progress Tracking (done).
3. Program Queue (done).
4. Workout Description and Comment (done).
5. Superset Import (done).
6. Program Builder Epic, Phases 1 to 3 (Phase 1 done; Phase 2 steps 1 to 4 done, steps 5 to 7 left).
   The UI/UX Overhaul Epic (2.3) is in progress now, stops 1 to 3 done; it comes before the items below.
7. Set-by-Set Logging.
8. Planned vs. Actual Tracking.
9. Missed Reps Logging.
10. Program Builder Epic, Phases 4 and 5.
11. Workout Focus Mode.
12. Past Programs Screen.
13. Program Builder Epic, Phase 6.
14. Native Capabilities & App Integrations Epic.

Superset Import comes first because Builder Phase 1 needs it. Features 1.8 to 1.10 come before Builder Phases 4 and 5, because good suggestions depend on accurate workout data. Workout Focus Mode follows them, so it is designed around set-by-set logging.

Until 1.8 is built, the builder stores sets individually, and each different weight and rep combination becomes a separate exercise entry in the GymLog import file.

## 4. Roadmap Principles

- Keep GymLog offline-first, mobile-first and simple to operate in the gym.
- Prioritize practical improvements over unnecessary complexity.
- Keep individual features modular and maintainable.
- Discuss architecture and data implications before writing feature specifications.
- Break Epics into smaller, independently implementable features.
- Preserve existing functionality unless a change is explicitly intended.
- Do not commit to native iOS development until actual integration requirements justify it.

## 5. Backlog Status

All items in this document are exploratory ideas, not approved implementation requirements.

New ideas should first be discussed and refined, then added to this roadmap. Detailed feature specifications should only be created once the underlying problem, desired behavior and scope are sufficiently clear.

## 6. Smaller ideas

Small or unscheduled ideas that came out of building GymLog. They are not ordered. Move one into section 1 when it is ready to specify.

- **Unit conversion (kg ⇄ lb) toggle in Settings** — all weight data is
  currently assumed/stored in kg with no stored unit; a Settings-level
  toggle to display (and enter) everything in lb was floated as a
  future idea, not built.
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
  GymLog branding on top of the condensed History view
- Remove the now-unused `.status.saved` CSS rule as routine cleanup
