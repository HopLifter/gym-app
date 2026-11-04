# GymLog Program Builder – Project Summary

Hand-over document. Keep this accurate at the end of every session.

## What this is
A separate desktop website for building training programs (GymLog Epic 2.1, Phase 1). Plain HTML/CSS/JS in one `index.html`. No frameworks, build tools or service worker. Planned hosting: GitHub Pages, `HopLifter/gym-program-builder` (repo not yet created on GitHub).

Spec: `docs/Feature Spec 2.1 Program Builder Phase 1.md`. Files in `docs/` marked "(reference)" are read-only copies from GymLog.

## Hard rules
- Never read or write a `gymapp_` localStorage key. Builder keys start with `builder_`.
- No native `alert()`, `confirm()` or `prompt()`; use custom modals.
- Escape all user text (`textContent` or an `escapeHtml()` helper). Treat opened files as untrusted.
- Calculation functions stay separate from drawing code.

## Build progress (spec section 9)
| Step | Status |
|---|---|
| 1. Data model and draft save | Done, committed and pushed |
| 2. Header, steppers, grid | Done, committed |
| 3. Add exercises, week cell editing | Built, awaiting user test |
| 4. Exercise table, load type switching | Not started |
| 5. Progression patterns | Not started |
| 6. Supersets and reordering | Not started |
| 7. Save/Open file, Exercise List | Not started |
| 8. Copy AI prompt | Not started |
| 9. Acceptance tests, real block | Not started |

## Data model (implemented in `index.html`)
One `program` object, as spec section 6: `format`, `version`, `name`, `block`, `weeks`, `workoutsPerWeek`, `workouts[]` (each with `id`, `description`, `exercises[]`). Each exercise has `id`, `name`, `rest` (seconds), `notes`, `supersetId`, `pattern {kind,type,amount}` and one `weeks[]` entry per program week (`included`, `edited`, `groups[]` of `{sets,reps,loadType,load,rpe,kg}`).

Defaults for a new exercise (step 1 choice, to be revisited when the Add Exercise modal is built in step 3): 3 sets, 10 reps, kg, blank load, rest 90 s, pattern `same`.

Storage keys: `builder_draft_v1` (the program), `builder_exercise_list_v1` (array of names; not used yet).

## Key functions so far
- `createDefaultProgram()`, `newWorkout()`, `newExercise(name, weekCount)`, `newGroup()`: build model objects.
- `isValidProgram(p)`: strict shape check used on anything loaded from outside.
- `saveDraft(program)` / `loadDraft()`: localStorage with try/catch; a damaged draft is ignored and a new program opens.
- `changed()`: call after every edit; sets the dirty flag, saves the draft and redraws.
- `render()`: redraws the header and grid from `program`.

## Testing limits
No automated tests; everything is checked by hand in a browser (open `index.html` directly).

## Step 2 additions
- Header: name, block, Weeks and Workouts/week steppers, buttons. Open file, Save file, Load Exercise List and Copy AI prompt are disabled placeholders until steps 7 and 8. New Program works (confirms if `dirty`).
- Grid: weeks across, workouts down, sticky Workout column, week columns at least 220px. Shows superset labels (A1/A2), `+N more`, `(edited)`, `Set load`, and loads such as `75% · 120 kg`. Exercise click and Add exercise are not wired yet (steps 3 and 4).
- Calculations (pure functions): `generateWeeks(exercise, weekCount)` (all pattern kinds, edited weeks kept, kg kept only where the prescription is unchanged), `supersetLabels`, `describeLoad`, `lastWeekHasWork`.
- Removing a week confirms if its last week has edited entries or kg values; removing a workout confirms if it has exercises.
- Custom modal `showConfirm`, notice `showNotice`, DOM helper `el` (text only, never HTML).
- Decisions: a newly added week copies Week 1's `included` flag. A draft reloaded with any exercise or a changed name counts as unsaved (`dirty`), because we cannot know if it was saved to a file.

## Step 3 additions
- `Add exercise` modal (spec 5.6): Exercise List dropdown with `New Exercise` (free text, `Not in your Exercise List` warning), sets, reps, load type, load, rest in minutes, notes, All weeks / This week only. Without a stored list only the text field shows. `loadExerciseList()` reads `builder_exercise_list_v1`; loading it from a backup is step 7.
- Week editor (spec 5.7): set groups (sets, reps, load, target RPE for kg and %), Add set group (hidden on paired exercises), delete group, Remove from this week (confirms and deletes if it is the only week), Use pattern value (edited weeks). A Week 1 save regenerates unedited weeks; a later week save marks it edited only if something changed. A kg value is kept only if the group's load and load type are unchanged.
- Until step 4, clicking an exercise in the grid opens this editor. Step 4 changes that to select the exercise and open the table; the editor then opens from table cells.
- Also built for later steps: `addToWeek`, `deleteExercise` (clears a superset partner), `parseNumber` ("." and ","), `openModal`.
- Decision: "This week only" in Week 1 does not mark Week 1 as edited (Week 1 is the source).
- The temporary test strip is gone.
