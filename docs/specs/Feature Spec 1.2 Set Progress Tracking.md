# GymLog – Feature Spec 1.2: Set Progress Tracking

**Status:** Implemented in v58
**Roadmap item:** 1.2 Set Progress Tracking
**Chosen design:** Option A, Numbered Sets (see the Set Tracker Options mockups)

## 1. Goal

Show which set the user is on while the rest timer is open, so they don't lose track during a workout.

The user's set starts when the timer starts. When the timer runs out, the user taps Reset to begin the next set.

## 2. Scope

**In scope**
- A row of numbered set squares in the existing rest timer bar.
- Reset moves to the next set.
- A warning before an active set timer is closed or replaced.

**Out of scope**
- Changes to exercise cards, History, Export Gym Log, Backup or the Finish Workout flow.
- Saving progress to `localStorage`.
- Recording reps or weight for each set.
- Marking sets as complete by tapping them.
- Undoing a Reset.
- Workout Focus Mode (Roadmap 1.3).

This narrower scope replaces the 1.2 bullet list in `ROADMAP.md`.

## 3. Behaviour

### 3.1 Starting a timer

Tapping an exercise's ⏱ button:
- Starts the existing rest timer.
- Reads the set count from the tapped exercise (`ex.sets`).
- Shows one numbered square per set, with Set 1 as the current set.

If `ex.sets` is blank or 0, the timer works as it does today, with no set squares and no warnings.

### 3.2 During a set

The bar stays open on every screen, as it does today. The countdown, Pause, `Rest Complete`, `+MM:SS` overtime and `Over 5:00` states do not change. The current set does not change until the user taps Reset.

### 3.3 Reset

Tapping Reset works in any timer state: running, paused, Rest Complete or overtime.

- **Not on the final set:** Move to the next set and restart the countdown, as Reset does today.
- **On the final set:** Show the All Sets Complete state.

### 3.4 All Sets Complete

- All squares show as done.
- The time text reads `All sets complete`.
- The timer stops, and overtime does not run.
- Pause and Reset are hidden.
- ✕ closes the bar with no warning.

### 3.5 Close warning

An **active set timer** is one with set squares that is not in the All Sets Complete state.

Tapping ✕ on an active set timer opens the existing confirm modal:
- **Title:** `Close set timer?`
- **Text:** `You will lose track of which set you are on. Are you sure you want to do this?`
- **Buttons:** Cancel and red `Confirm`

Confirm closes the bar. Cancel changes nothing, and the timer keeps running while the modal is open.

### 3.6 Replace warning

Tapping ⏱ on any exercise during an active set timer opens the confirm modal:
- **Title:** `Replace set timer?`
- **Text:** `You will lose track of which set you are on. Are you sure you want to do this?`
- **Buttons:** Cancel and red `Confirm`

Confirm starts a new timer at Set 1 for the tapped exercise. Cancel changes nothing.

Tapping ⏱ during All Sets Complete starts the new timer with no warning.

### 3.7 Supersets

- One timer covers one round of both exercises.
- The number of squares comes from the exercise whose ⏱ was tapped. The partner's set count is ignored.
- The label shows both names, with the tapped exercise first, such as `DB Bench + Seated Rows`. Long labels are cut off with `…`.

### 3.8 Editing sets during a timer

The set total is fixed when the timer starts. Changing the Sets field during a timer does not update the open bar. The new number applies the next time ⏱ is tapped.

### 3.9 App close

Set progress is lost if the app fully closes, the same as the rest timer itself.

## 4. Visual design

The set squares sit in a new row above the existing bar content. The time, progress bar and buttons stay in their current row below.

| State | Background | Text | Border |
|---|---|---|---|
| Completed | `--done` | `--text` | `--done` |
| Current | `--accent` | `--bg` | `--accent` |
| Upcoming | Transparent | `--text-dim` | `--line` |

- Squares are 30×30px, with an 8px radius and 14px bold numbers.
- Squares have a 6px gap and wrap onto a second row if they don't fit.
- Squares are display only and do not respond to taps.
- The All Sets Complete bar uses the `--accent` border and the existing 16px finished text style, with no pulse animation.

## 5. Implementation notes

All code changes are in `index.html`.

- **State:** Add `totalSets`, `currentSet` and `allSetsComplete` to the in-memory `restTimer` object. Do not add anything to the saved data model.
- **`startRestTimer(ex)`:** Set the new fields, and build the superset label with `findSupersetPartner(ex)`.
- **`resetRestTimer()`:** Move to the next set, or stop the interval and enter All Sets Complete on the final set.
- **`tickRestTimer()` and the `visibilitychange` handler:** Must not move the All Sets Complete state into overtime.
- **`renderRestTimer()`:** Draw the squares and All Sets Complete state, and hide Pause and Reset in that state.
- **Warnings:** Add one helper that checks for an active set timer, and use `openConfirm()` for both warnings. Native browser dialogs must not be used.
- **Close button:** Send ✕ through the warning check before `dismissRestTimer()`.
- **`start-timer` action:** Send ⏱ through the warning check before `startRestTimer(ex)`.
- **Layout:** `.rest-timer-bar` is currently a flex row, so wrap its content to add the squares above it.
- **Bottom padding:** The taller bar could cover the end of the page. Increase the `body` bottom padding so Add Exercise and the last list item can scroll clear of it.
- **Version:** Bump `APP_VERSION` in `index.html` and `CACHE_NAME` in `sw.js` together to `gym-app-cache-v58`.

## 6. Acceptance tests

1. Tapping ⏱ on a 5-set exercise shows five squares with Set 1 current.
2. Reset during the countdown moves to Set 2 and restarts the timer.
3. Reset while paused moves to the next set and restarts the timer.
4. Reset during Rest Complete and overtime moves to the next set and clears the overtime display.
5. Overtime display still works at each set.
6. Reset on the final set shows All Sets Complete, stops the timer and hides Pause and Reset.
7. ✕ during All Sets Complete closes the bar with no warning.
8. ✕ on an active set timer shows the warning. Cancel keeps the timer and current set unchanged.
9. Confirm on the close warning closes the bar.
10. ⏱ on the same exercise during an active set timer shows the warning.
11. ⏱ on a different exercise during an active set timer shows the warning.
12. Confirm on the replace warning starts the tapped exercise at Set 1.
13. ⏱ during All Sets Complete starts a new timer with no warning.
14. A superset shows both names and uses the tapped exercise's set count.
15. A 1-set exercise shows one square, and Reset goes straight to All Sets Complete.
16. An exercise with blank or 0 sets uses the timer with no squares or warnings.
17. An exercise with 10 sets wraps cleanly at a 375px screen width.
18. Changing the Sets field during a timer does not change the open bar.
19. A 0-second rest timer still moves through sets correctly.
20. Set progress stays correct after switching tabs, backgrounding the app and locking the phone.
21. The bar never covers Add Exercise or the last item after scrolling to the bottom.
22. The Global Workout Timer, History, Export Gym Log and Backup behave as they did before.

## 7. When finished

- Provide a git commit message.
- Update `PROJECT_SUMMARY.md`, including the new behaviour, cache version and any testing limits.
- Update the 1.2 entry in `ROADMAP.md` to match this spec.
