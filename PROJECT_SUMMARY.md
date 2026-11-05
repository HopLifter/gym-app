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
| 3. Add exercises, week cell editing | Done, committed |
| 4. Exercise table, load type switching | Done, committed |
| 5. Progression patterns | Done, committed |
| 6. Supersets and reordering | Done as 6.1 (set-group pairs), committed |
| 7. Save/Open file, Exercise List | Built, awaiting user test |
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

## Step 4 additions
- **Deliberate spec deviation (user request):** the grid shows every set group of an exercise (sets × reps, target RPE, load) instead of the first group plus `+N more`. Acceptance test 17 should be read as "a second set group shows in the grid".
- Add exercise modal: the Load field label follows the load type (`Load (kg)` etc.) and its placeholder reads `Blank = set later`.
- Clicking an exercise in the grid (or a table row's name cell) sets `selected` (screen state only, not saved). It highlights that exercise in every week and opens the table in `#detail`, sticky at the bottom of the window, max 380px tall, scrolling inside. `Close` clears it. `render()` clears a selection whose exercise no longer exists.
- Table columns: exercise (name, set scheme, editable rest in minutes), load type control, pattern text, one cell per week, actions. Clicking a week cell opens the week editor; a hidden week shows `Not in this week` and `Add to this week`.
- Load type switching (spec 5.8): confirm if any load, target RPE or kg value exists; then every group in every week takes the new type with blanks, edits are cleared and the pattern resets to `Same every week`. No type is highlighted if Week 1's groups mix types.
- Rest edits update the superset partner too (`setRest`). Delete asks first.
- Disabled placeholders: Pattern button (step 5), Move Up, Move Down and Superset (step 6).

## Step 4 feedback changes (user requests, deviate from the spec)
- Each set group shows sets × reps and its load on one line (wraps only if the column is too narrow).
- All load types (kg, %, RPE) use the accent green. The text still names the type.
- The table shows only the selected exercise, not the whole workout. Clicking another exercise in the grid swaps the table.

## Step 5 additions
- Pattern picker `openPatternPicker(wi, ex)`, opened from the table's Pattern button. Title `Repeat across weeks`. Options per load type follow the spec 5.9 table (Percentage increase only for kg). Custom uses a stepper (kg 1.25, % 0.5, RPE 0.25, can go negative, limit +/-50 kg, 20%, 5 RPE).
- Stored pattern is only `{kind, type, amount}`. Small, Large and Custom are all `kind: "add"`; the picker works out which one is selected from the amount (`patternOption`).
- Start value (Week 1 of the first set group) is hidden with more than one set group. Preview is computed on a copy with `generateWeeks`, so Cancel changes nothing. Edited weeks show `(edited)` and a note `N edited weeks will stay as they are.`
- Set each week manually: inputs for Weeks 2 and up (first set group only), prefilled from the previous preview. Apply sets those loads and marks every one of those weeks edited. Other set groups in those weeks are left alone.
- Load type control in the picker uses the same confirm as the table. After Change or Cancel the picker reopens.
- A changed load clears that group's kg value.

## Step 5 feedback changes (user requests, deviate from the spec)
- Pattern options show only amounts (`+2.5 kg per week`, `+5 kg per week`), not "Small increase" or "Large increase".
- RPE offers only `+1 RPE`, Custom (steps of 1) and Manual, plus Same every week. RPE is subjective, so no 0.5 or 0.25 steps.
- New `Add set group` button in the table's actions column (with Move Up and Move Down). It opens the Week 1 editor with a new set group added; Save applies it and regenerates unedited weeks, Cancel adds nothing. Hidden on superset pairs.

## Step 5 second round of changes (user requests; the spec in `docs/` was updated to match)
- **Patterns are per set group.** Data model: `exercise.pattern` became `exercise.patterns[]`, one entry per Week 1 set group, same order. `generateWeeks` applies `patterns[k]` to set group k. The week editor keeps each row's pattern attached when groups are added or deleted in Week 1; new groups start as `Same every week`. `loadDraft` converts old drafts that still have a single `pattern` (`migrateOldPatterns`).
- Pattern picker `openPatternPicker(wi, ex, k)` works on one set group; the table shows one pattern button per set group. `Start` is always shown (it sets Week 1 of that set group). The spec's "Start hidden with several set groups" rule is gone.
- Pattern options, in order. kg: Same every week, Custom change per week, Percentage increase, Set each week manually. %: Same, Custom, Manual. RPE: Same, `+1 RPE per week`, Manual. No fixed +2.5 or +5 options. Custom and Percentage amounts are typed (comma or period) and also have - and + buttons; Custom may be negative. Generated RPE never goes above 10.
- Blank loads show the planned change counted from Week 1, e.g. `Set load + 5 kg` in Week 2 and `+ 10 kg` in Week 3 (`plannedChange`). Edited weeks show plain `Set load`.
- Add exercise modal: one row per set group (sets, reps, load), `Add set group`, delete per row.
- Manual entry marks the weeks it sets as edited, so later changes to the exercise's other set groups no longer flow into those weeks (the picker warns about this).

## Step 5 third round of changes (user requests; the spec in `docs/` was updated to match)
- **Rest is per set group.** `exercise.rest` is gone; every set group has `rest` (seconds). Week 1 is the source, so changing it in the table regenerates the weeks that are not edited. A superset pair shares rest (`setGroupRest` updates the partner). Old drafts are converted in `migrateOldPatterns`.
- **Load type is per set group.** The table, the Add exercise rows and the pattern picker each use the group's own kg / % / RPE control (`loadTypeControl`, `setGroupLoadType`). Changing it asks first if that group has values, then clears that group's loads and pattern. Weeks edited by hand stay marked edited (spec 5.8 used to clear edits). The week editor can only choose a type for a group added there.
- **Table layout:** one table line per set group, so the load type, pattern and week values of each group line up. Columns: Exercise, Set group (scheme and rest), Load type, Pattern, Weeks, Actions. A week that does not include the exercise is one tall cell.
- **Percentage increase rounding:** the picker lets the user choose the rounding step in kg and nearest / up / down. Stored as `step` and `mode` on the `percent` pattern (defaults 2.5 and nearest).
- **Edited weeks:** when applying a non-manual pattern with hand-edited weeks, the picker offers Keep (default) or Replace (`replaceEditedGroup`).
- **RPE cap:** blank RPE loads keep showing `Set load + N RPE`. Once a start value is given and `+1 RPE` would pass 10, the picker warns that RPE stays at 10.

## Step 5 fourth round of changes (user requests)
- In the pattern picker the `+` button sits directly beside the value (`[-] value [+] unit per week`).
- Changing a set group's load type when some weeks were edited by hand now asks: keep the edited weeks as they are (default) or clear them too (`setGroupLoadType`, `applyGroupLoadType(ex, k, type, replaceEdited)`). This replaces the earlier decision that edited weeks always stay marked edited.

## Step 6 additions
- `Superset` (table actions) pairs an exercise with the one below it (`makeSuperset`). Disabled, with the reason as its tooltip, on the last exercise, if either is already paired, or if either has more than one set group. The second exercise adopts the first's rest; editing either rest updates both (`setGroupRest`). The button reads `Remove Superset` on a pair (`removeSuperset` clears both).
- `Move Up` / `Move Down` move a whole unit (`exerciseUnits`): a pair moves together, a single exercise jumps over a whole pair. Disabled at the top and bottom.
- Deleting one exercise of a pair clears the pair (`deleteExercise`). `Add set group` is hidden on paired exercises (table and week editor).
- Labels `A1` / `A2` show in the grid and in the table's week cells, only in weeks where both exercises of the pair are included (`supersetLabels`). The table's exercise cell says `Superset with <name>`.
- Bug fixed while testing: `removeSuperset` read the pair id after clearing it on the first exercise, so the partner stayed paired.

## Step 6.1: supersets per set group (rebuild of step 6, awaiting user test)
- A superset now pairs ONE SET GROUP of an exercise with one set group of another exercise in the same workout, instead of two whole adjacent exercises. Data model: `exercise.supersetId` became `exercise.supersets[]`, one entry per Week 1 set group (null or a pair id shared by exactly two groups), like `patterns`. Old drafts convert in `migrateOldPatterns`; `purgeBrokenPairs` clears any id not used exactly twice.
- Each set group line in the table has a `Superset` cell: `Superset with…` (dialog `openSupersetPicker`) or `With <exercise>` plus `Remove`. Different set counts offer `Split and superset`: the larger group is split in two in every week (`splitGroup`), the first part pairs, the rest stays free (e.g. Curls 6 sets -> 3 + 3 for Bench 3 and Incline 3).
- Pairs share rest (`setGroupRest`, `pairGroups`) and sets (`syncPairs` after a week edit; a later week that changes is marked edited). Deleting an exercise or a set group unpairs the partner. `Add set group` is allowed on any exercise. Move Up/Down move one exercise at a time (pairs need not be adjacent in the builder).
- Labels A1/A2 sit on the paired set group lines, per week, only where both exercises are included and both have that group (`supersetLabels` returns `exerciseId:groupIndex` keys).
- The spec (5.10, tests 34-38a, data model, AI prompt rules) was updated. Step 8 must make the prompt place each pair side by side, so a repeated exercise such as Curls appears several times in the import file.

## Step 6.1 feedback change
- The grid and the table now show a workout in GymLog order: a paired set group is drawn straight after its partner inside one frame (`weekSegments`, `ss-block`), so Bench 2 + Curls 2 sit together and Incline + Curls 2 sit below. The table (`tableSpecs`) shows the selected exercise plus the partner line of each of its pairs, with the partner marked "Superset partner"; selecting Curls 2 shows both pairs one under the other. The spec (5.4, 5.5) was updated.

## Step 7 additions
- `Save file` (`saveProgramFile`): downloads the program as JSON named from the program name with unsafe characters removed, plus `.program.json` (`programFileName`). Clears the unsaved-changes flag.
- `Open file` (`openProgramFile`, `parseProgramFile`): reads the file (max 5 MB), converts old formats (`migrateOldPatterns`), checks it with `isValidProgram`, rejects duplicate ids and a higher `version`, and unpairs any broken superset. Invalid: the message "This file can't be opened." and nothing changes. If there are unsaved changes it asks `Replace current program?` first, after the file has been checked.
- `Load Exercise List` (`loadExerciseListFile`, `parseExerciseListFromBackup`): reads a GymLog backup (max 100 MB), takes only `gymapp_exercise_list_v1` (a JSON string inside the file, parsed a second time), trims, removes duplicates and non-text items, and stores the names under `builder_exercise_list_v1`, replacing any earlier list. Shows `N exercises loaded.`; otherwise "This file doesn't contain an Exercise List." Nothing else from the backup is kept.
- The builder never reads or writes a `gymapp_` localStorage key. The only `gymapp_` text in the code is the key name looked up inside the opened backup file.
