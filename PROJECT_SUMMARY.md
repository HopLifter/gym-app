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
| 1. Data model and draft save | Built, awaiting user test |
| 2. Header, steppers, grid | Not started |
| 3. Add exercises, week cell editing | Not started |
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
- `render()`: currently a temporary JSON viewer.

## Testing limits
No automated tests; everything is checked by hand in a browser. The step 1 page has temporary test buttons that will be replaced in step 2.
