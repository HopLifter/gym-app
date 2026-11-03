# GymLog – Future Features & Epics Roadmap

**Status:** Exploratory backlog  
**Purpose:** Capture future feature ideas, larger development initiatives (Epics), and their intended value before writing detailed requirements specifications.

## 1. Individual Features

These are relatively independent features that can be designed and implemented separately.

### 1.1 Global Workout Timer

**Goal:** Track the total time spent on an individual workout.

- Option to start a timer when selecting "Start Workout".
- Track elapsed workout time independently of the existing rest timer.
- Continue tracking accurately when switching apps or locking the phone.
- Display total workout duration in the workout interface.

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

## 2. Epics

Epics are larger initiatives that must be broken down into smaller features and implementation steps.

### 2.1 Program Builder Epic

**Goal:** Allow users to create, manage, and reuse training programs directly within GymLog.

Potential features:

- Program creation and editing interface.
- Configurable training variables, including sets, reps, weights, RPE and rest.
- Flexible program structures (programs, weeks, workouts and exercises).
- Weekly and per-exercise workload analysis.
- Multiple saved programs and reusable templates.
- Performance-informed program adjustments based on completed workouts.
- Program versioning and progression management.
- Recommendations and/or automatic progression based on workout history.

**Important design question:** Should GymLog primarily recommend adjustments, automatically apply predefined progression rules, or support both?

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

1. Global Workout Timer.
2. Set Progress Tracking.
3. Workout Focus Mode.
4. Program Builder Epic.
5. Native Capabilities & App Integrations Epic.

The first three features form a cohesive improvement to the actual workout experience. The two Epics represent larger expansions of GymLog's capabilities.

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
