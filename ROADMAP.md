# GymLog – Future Features & Epics Roadmap

**Status:** Exploratory backlog  
**Last updated:** 5 November 2026 (Program Builder Phase 1 implemented; 1.7 implemented, v62)  
**Purpose:** Capture future feature ideas, larger development initiatives (Epics), and their intended value before writing detailed requirements specifications.

## 1. Individual Features

These are relatively independent features that can be designed and implemented separately.

### 1.1 Global Workout Timer

**Goal:** Track the total time spent on an individual workout.

- Option to start a timer when selecting "Start Workout".
- Track elapsed workout time independently of the existing rest timer.
- Continue tracking accurately when switching apps or locking the phone.
- Display total workout duration in the workout interface.
- Status: implemented (before v58).

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

1. Core builder: create, edit, save and reopen programs, and copy the AI prompt. Status: implemented (5 November 2026) as a separate desktop website, https://hoplifter.github.io/gym-program-builder/ (repo github.com/HopLifter/gym-program-builder, plain HTML/CSS/JS, no change to GymLog itself). Its own `PROJECT_SUMMARY.md` and spec describe it. The end-to-end run (AI prompt, GymLog import, reopening the AI's program file) is still being tried with a real block.
2. Reuse: templates, duplication and versions.
3. Analysis: weekly and per-exercise workload.
4. History: import backups and compare planned with actual (best after 1.8 to 1.10).
5. Suggestions: AI suggestions based on workout history, approved by the user.
6. Mobile: move the builder into GymLog.

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

## 3. Suggested Development Order

An initial suggested sequence, subject to further exploration:

1. Global Workout Timer (done).
2. Set Progress Tracking (done).
3. Program Queue (done).
4. Workout Description and Comment (done).
5. Superset Import (done).
6. Program Builder Epic, Phases 1 to 3 (Phase 1 done).
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
