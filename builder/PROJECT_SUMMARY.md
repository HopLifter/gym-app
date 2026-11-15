# GymLog Program Builder – Project Summary

Hand-over document. Keep this accurate at the end of every session.

## What this is
A separate desktop website for building training programs (GymLog Epic 2.1, Phase 1). Plain HTML/CSS/JS in one `index.html`. No frameworks, build tools or service worker. Lives in the `builder/` folder of the `HopLifter/gym-app` repo and is published with GitHub Pages at https://hoplifter.github.io/gym-app/builder/. (It started as its own repo, `HopLifter/gym-program-builder`, and was moved here with its history.)

Spec: `../docs/specs/Feature Spec 2.1 Program Builder Phase 1.md`. The GymLog roadmap, import format and project summary are in the repo root and `../docs/`: there is one copy of each, so nothing here is a reference copy.

**How to read this file:** the sections after "Key functions" are a log in the order the work happened. Steps 2 to 6 contain choices that later rounds changed (for example fixed `+2.5 kg` options, per-exercise `pattern`, `rest` and `supersetId`). The latest round wins; the Data model section below is current.

## Current status (15 November 2026): read this first
Phase 1 (core builder) and Phase 2 steps 1 to 4 are built, tested by the user and committed. A UI/UX overhaul followed on 15 November 2026 (stops 1 to 5 and a new Library; see "UI overhaul" at the end of this file). Stop 6 of the overhaul (code cleanup with no visible change) is not started. Spec for Phase 2: `../docs/specs/Feature Spec 2.1 Program Builder Phase 2.md`. The sections further down are a dated log; the LATEST section on a topic wins, and the code wins over both.

| Phase 2 step | Status |
|---|---|
| 1 Library, Export/Import everything | Done |
| UI cleanup (flat grid, workout bands, aligned weeks, settings panel) | Done |
| 2 Coaching fields, RIR load type, week flags | Done |
| 3 Athlete profiles (3.1 reference lift was built and dropped by the user) | Done |
| 4 Templates, Generate for an athlete, Export for GymLog | Done |
| 5 Progression tools (ramp, per-week table, deload scaling, back-offs, wave, rep range) | Not built |
| 6 Duplication and versions | Not built |
| 7 Metrics charts | Not built |

**Screens.** Library (opens first): a list on the left (Templates, then Athletes with the programs made for them) and a details panel on the right for the selected item. One click selects, a double click on a template or program opens the editor. The panel of a template or program shows facts, the Week 1 workouts and the actions; the panel of an athlete is the profile, edited in place (there is no separate athlete page). Top bar: `Import` (menu: Import program file, Import exercise list, Restore backup) and `Back up everything`; Last backup and the storage meter are pinned at the bottom. Editor: header (`‹ Library`, name, one line of facts, an amber "Last backup" reminder when the backup is old, one primary button (`Export for GymLog`, or `Use for athlete` on a template), and a `⋯` menu: Weeks and workouts, Copy AI prompt, Export program file, Save as template, Back up everything), the program grid (a band per workout, week columns 200 to 260 px, a flag per week, an `Add exercise…` search box at the foot of each workout), and the exercise settings panel on the right. The panel is the only place to change an exercise. The only dialogs left for an exercise are the superset picker and confirmations.

**Storage (browser localStorage, keys start with `builder_`).** `builder_programs_v1` (library entries `{ id, name, kind: program|template, note, modified, program }`), `builder_profiles_v1` (athlete profiles), `builder_open_v1`, `builder_exercise_list_v1`, `builder_lastexport_v1`. `builder_draft_v1` is only read once (old single draft). `builder_detail_height_v1` is obsolete. The backup is `Back up everything` (one JSON file with programs, templates, athletes and the Exercise List; `Restore backup` reads it).

**A program always belongs to an athlete (15 November 2026).** There is no "Not linked to an athlete" section and no blank program. `adoptProgramsWithoutAthlete()` runs at start-up and after `Restore backup`: every entry of kind `program` whose athlete does not exist becomes a template (`makeTemplate`: kind `template`, `source` and `profileUsed` null, calculated `kg` cleared; typed kg loads stay). `Import program file` adds a template. Deleting an athlete who has programs asks: keep them as templates, or delete them too. A new, empty library starts with one template. To train from a program yourself, make an athlete for yourself.

**The main flow.** Template (kg loads allowed) + athlete profile -> `Use for athlete` -> a program with `source` and a `profileUsed` snapshot; % loads become kg by matching the EXERCISE NAME to the athlete's lift (an exercise with no matching lift can get its own max in the Generate dialog); kg recalculates on every edit; an amber bar offers Recalculate when the profile changes -> `Export for GymLog` writes the file GymLog imports (`docs/Program Import Format.md`). Templates offer all four load types again, kg included (changed 8 November 2026, see "Feedback round 1"); Save as template keeps hand-typed kg loads.

**Decisions to remember.** RIR is its own field and its own load type (never converted to RPE); the RPE/RIR target is for kg loads only; the Block number was removed (put it in the program name); no "unsaved changes" warnings (everything autosaves; Export everything is the backup); the user dislikes boxes (flat UI with divider lines), side-by-side mockups, and "Open file"-style clutter in the editor header.

**Not built or not finished (ideas and gaps).** Steps 5 to 7 above. Overhaul stop 6 (code cleanup: dead code such as `kgForPercent`, `currentIsTemplate`, `loadTypeChoices`; repeated loops and storage helpers; stale comments). kg loads from a template: a warning, a mark and values typed in the Generate dialog (ROADMAP.md, Epic 2.1). Richer Library rows with a preset icon per program and a lifter-initial badge (ROADMAP.md, Epic 2.1). Dragging a template onto an athlete. Using the athlete's unavailable-exercises list inside programs beyond the Generate and export warnings (hiding them in the Add exercise picker, marking them in the grid). Checks not done in a real browser or on a phone: importing a downloaded `.gymlog.json` into GymLog (spec test T4.8), the RIR pattern picker dialog, many weeks scrolling sideways with the panel open. A set-group alignment problem on a `Bench` exercise was reported and dropped until it reappears.

**Testing.** No automated tests. Open `builder/index.html` directly in a browser (or https://hoplifter.github.io/gym-app/builder/ once published). Earlier rounds were checked with throwaway scripts in the preview pane using a stand-in for localStorage (the pane blocks storage) plus screenshots.

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
| 7. Save/Open file, Exercise List | Done, committed |
| 8. Copy AI prompt | Done, committed |
| 9. Acceptance tests, real block | In progress: automated tests pass; user tests and the real block remain |

## Data model (implemented in `index.html`)
One `program` object, as spec section 6: `format`, `version`, `name`, `block`, `weeks`, `workoutsPerWeek`, `workouts[]` (each with `id`, `description`, `exercises[]`). Each exercise has `id`, `name`, `notes`, `patterns[]` (one per Week 1 set group), `supersets[]` (one per Week 1 set group: null or a pair id shared by exactly two groups) and one `weeks[]` entry per program week (`included`, `edited`, `groups[]` of `{sets,reps,loadType,load,rpe,kg,rest}`). Load type and rest (seconds) are per set group. See spec section 6.

Defaults for a new set group (`newGroup`): 3 sets, 10 reps, kg, blank load, rest 90 s; the pattern is `same`.

Storage keys (current, see "Phase 2 step 1" at the end): `builder_programs_v1` (the library), `builder_open_v1` (which program is open), `builder_draft_v1` (Phase 1 draft: now only read once to migrate it into the library), `builder_exercise_list_v1` (array of names loaded from a GymLog backup), `builder_detail_height_v1` (table height preference).

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

## Step 8 additions
- `Copy AI prompt` (`copyAiPrompt`): with no exercises it shows `Add an exercise first.` and copies nothing. If some set groups in included weeks have no load, it first asks (`N loads are blank. The AI will suggest values for them.`, Cancel / `Copy prompt`). The prompt is built by `buildAiPrompt` from the template `AI_PROMPT_LINES` (spec section 7) with the program name and the exact program JSON (`JSON.stringify(program, null, 2)`, the same as a saved file). `Prompt copied.` on success; if the clipboard is unavailable or refuses, `showPromptBox` shows the prompt in a text box.
- The prompt template gained a "HOW TO READ THE PROGRAM JSON" section (weeks, groups, patterns, supersets, rest per set group) and a line about blank loads with a pattern, because the data model changed after the first spec draft. The spec (section 7) has the same text.
- `showConfirm` accepts `primary: true` for a green confirm button (red stays the default for destructive confirms).

## Step 9: acceptance tests (spec section 10)
Run by script in the preview pane (a throwaway test harness, not kept in the repo), all passing: 1-6, 8, 9 (with a stub list), 10-22, 24-38a, 42-45 (45 checked for New Program), 48, 49 and 50 (clipboard failure simulated). Test 7 passes for the fixed Workout column (checked by scrolling a 12-week grid).

Left for a real browser with the user (the preview pane blocks storage, downloads and file pickers): 23 (table stays visible while scrolling), 39 (draft survives a reload), 40 and 41 (Save file / Open file), 45 (Open file warning), 46 (real backup loads only the Exercise List), 47 (no `gymapp_` keys created), and the end-to-end tests 51-54 with the AI and GymLog.

Testing limit: there is no automated test suite in the repo; everything is checked by hand or by throwaway scripts.

## Adjustable table height (user request during step 9)
- The bar on the top edge of the bottom table (`makeDetailResizer`) resizes it: drag, arrow keys when focused, double-click to reset. Range 120px to 90% of the window; the default still fits the content up to 380px. The choice is saved under `builder_detail_height_v1` (a screen preference, not part of the program). Spec 5.5 and the storage key list were updated.

## Phase 2 step 1, stop 1: Library (6 November 2026, awaiting user test)
Spec: `../docs/specs/Feature Spec 2.1 Program Builder Phase 2.md`, mockup `../docs/mockups/Program Builder Library - Athlete-centred (revised).html`.
- **The single draft is gone.** All programs live in the library, `builder_programs_v1`: an array of `{ id, name, modified, program }`. `builder_open_v1` is `{ kind: 'program', id }`. A Phase 1 draft is moved in once on first load (the `builder_draft_v1` key is left alone). Every edit saves to the open program's entry at once (`changed()` and `changedQuietly()` call `touchCurrent()` and `saveLibrary()`); the entry shares the `program` object with the editor.
- **No unsaved-changes warning.** `dirty`, the leave-page warning and the "Replace current program?" confirms were removed. New Program adds a program and opens it. Open file adds the file as a new library program and opens it (nothing is replaced). Save file is unchanged (`downloadProgram(p)` is shared with the per-row Export).
- **Library screen** (`Library` button in the header; `renderLibrary`): flat list with thin dividers (no boxes). Step 1 has one section, `Not linked to an athlete`, drawn by `renderUnlinkedSection()` (TEMPORARY: removing it later means deleting that function and its one call). Rows: name, `N weeks × M workouts`, last edited (dd/mm/yyyy), `Open now` tag, Open, Duplicate (`<name> copy`), Rename (modal), Export (program file), Delete (confirm). Deleting the open program opens the most recent other one, or a new empty program if it was the last. Footer: storage meter (amber/red from 80%). Import everything and Export everything are disabled placeholders until stop 2.
- Functions: `libraryLoadPrograms` (skips invalid entries), `librarySavePrograms`, `libraryReadOpenId`/`libraryWriteOpenId`, `libraryStorageChars`, `formatDate`, `findEntry`, `mostRecentEntry`, `addProgramEntry`, `setCurrent`, `openLibrary`/`closeLibrary`/`openFromLibrary`, `duplicateProgram`, `renameProgram`, `deleteProgram`.
- Tested by script with a stand-in for localStorage (the preview pane blocks storage): T1.1 to T1.4, delete, bad entries skipped, screen switching. Not yet done in a real browser: reload persistence, real file Open/Export.
- Known: `libraryLoadPrograms` drops invalid entries, so a corrupted library key would be overwritten by the next save; a backup export (stop 2) is the safeguard.

## Phase 2 step 1, stop 2: Export / Import everything (6 November 2026, awaiting user test)
- **Export everything** (`exportEverything`): downloads `GymLog-Builder-Library-YYYYMMDD.json`, format `gym-builder-library`, version 1: `programs` (the library entries), `templates`, `profiles`, `versions` (empty until steps 3, 4 and 6), and `exerciseList`. Saves the time under `builder_lastexport_v1`. The Library footer shows `Last exported: dd/mm/yyyy (N days ago)`, amber when never or more than 14 days (`lastExportInfo`).
- **Import everything** (`importEverything`, `parseLibraryFile`, `askImportMode`, `applyImport`): file limit 20 MB. Every program gets the same full check as an opened program file (`cleanLibraryEntry`); ONE broken item, a duplicate id, a wrong format or a newer version refuses the whole file with "This file can't be opened." and changes nothing. A dialog then offers `Add as copies` (default; new ids, ` (imported)` added to a name that already exists, original dates kept) or `Replace everything` (extra red confirm). The Exercise List: Replace takes the file's list if it has one; Add only fills in a missing list.
- **Storage-full notice:** when a save fails, the red bar under the header says the last change could not be saved and has an `Export everything` button. The page keeps working in memory.
- `.gitignore` now blocks `*library*.json` (library exports hold athletes' data once profiles exist).
- Tested by script (stand-in storage): export/import round trip identical with Replace, Add as copies, broken item, duplicate id, newer version and garbage refused, Last exported states, save failure bar. Not yet done in a real browser: the real file download and file picker.

## UI cleanup, stop 1: flat grid (7 November 2026, awaiting user test)
Mockups: `../docs/mockups/Program Builder Flat Grid - Options.html`, `Workout Bands - Options.html`, `Workout Bands - Round 2.html` (chosen: Option 1 structure, band B1, removed-workout version i). These supersede Phase 1 spec 5.4 (the left Workout column) wherever they differ.
- **No boxes in the grid.** Exercises are separated by faint divider lines (`--hair`), not borders. The selected exercise is a soft tint (`--selected-bg`) with no outline. A superset pair keeps a thin green bar on its left.
- **Workout bands.** The left "Workout" column is gone. Each workout is one full-width row (`tr.band-row`, `.band`): bold `Workout N` plus its one-sentence description, which is an input that looks like text (placeholder `Add a description`). The band is `position: sticky; left: 0`, so it stays in view when a wide program scrolls sideways.
- **Sticky week header.** `body` is now a flex column; `#main` is the scroll container (both directions) and the `th` cells are `position: sticky; top: 0`, with a light accent underline (`--accent-soft`). The old `.grid-wrap` border and its own scrolling were removed (a nested scroller would break sticky). The bottom exercise table (`.detail`) is a flex item under `#main`.
- **Superset labels (A1, A2)** moved to the right end of the prescription line (`renderGroupLines`).
- **Remove a workout from one week.** `+ Add exercise` and `Remove from week` sit at the foot of each cell. There is no new data: a workout counts as removed from a week when it has exercises and none are `included` that week (`workoutRemovedInWeek`). The cell then reads `No workout this week · Restore`. `confirmRemoveWorkoutFromWeek` asks first and names exercises that exist only in that week, because those are deleted (same rule as `removeFromWeek`). `restoreWorkoutInWeek` sets `included` back to true and keeps hand edits.
- Tested by script and screenshot: bands, sticky header while scrolled, labels at the right, remove and restore, the delete-only-here case, description saved to the library. Not tested: many weeks (horizontal scroll with the sticky band) in a real browser.
- Still to do in this cleanup (stop 2): header buttons, program settings behind `Edit` plus a New Program dialog in the Library, removing the Block field, Library page changes (no back button, Import program, Load Exercise List, pinned footer, start on the Library), new exercises added to the global list.

## UI cleanup, stop 1b: column widths and the exercise settings panel (7 November 2026, awaiting user test)
Mockup: `../docs/mockups/Program Builder Exercise Settings - Options.html` (chosen: Option 1, docked panel). This REPLACES the bottom exercise table (Phase 1 spec 5.5): `renderTableRows`, `tableSpecs`, `renderWeekCell`, `buildGroupCells`, `buildSupersetCell`, `buildActionsCell`, the drag-to-resize bar and the `builder_detail_height_v1` key are gone (that key may still sit unused in a browser).
- **Column widths:** `table.grid` is `table-layout: fixed` with `width: clamp(n × 200px, 100%, n × 260px)`; `--n` (the week count) is set on the table. Columns fill the window up to 260 px, shrink to 200 px, then the grid scrolls sideways. The workout band is limited to the visible width (`--mainw`, set by `updateMainWidth()` on render and on window resize).
- **Layout:** `#workspace` is a row holding `#main` (the scrolling grid) and `#detail` (the panel, 360 px, its own scroll). Both scroll independently, so all weeks can still be reached sideways while the panel is open.
- **Panel** (`renderDetail`): header with the exercise name, the workout, and a `×`. The `×` closes it (`closeDetail`); clicking any exercise in the grid opens it again. One section per set group (`renderSetGroupSection`): `Edit` (opens the Week 1 editor), Load type, Rest (`restRow`), Progression (opens the pattern picker), Superset (`supersetRow`). Then the Weeks strip (`renderWeeksStrip`): one row per week, one column per set group; click a value to edit that week; a dashed underline marks a week edited by hand; a week without the exercise shows `Not in this week · Add`. Then Notes (new: `exercise.notes` is now editable here, autosaves) and the actions: `+ Add set group`, Move up, Move down, Delete exercise.
- A superset partner is no longer shown as a second table line; the Superset row names the partner and its set group.
- Tested by script and screenshot at 1280 px: panel content, close and reopen by clicking an exercise, 12 weeks scrolling sideways with the panel open (columns 200 px), 4 weeks filling the width (216 px with the panel open). Not tested: week editor, pattern picker and superset dialogs opened from the panel in a real browser (they are the same dialogs as before).

## UI cleanup, stop 1c: aligned rows and thin scroll bars (7 November 2026, awaiting user test)
- **Exercises line up across weeks.** The grid is now one table row per exercise (a "slot"), the same in every week, instead of one stacked cell per week (`workoutSlots`, `renderSlotCell`, `renderFootCell`, `renderGrid`). A week with an extra set group, or without the exercise, leaves a plain blank gap in the other weeks (clicking a blank cell still selects the exercise, and the panel's Weeks strip shows a single `Add` link for a week without it), so the rows below stay in line. A slot is one exercise's run of set groups, or a superset pair (partner right after, as in GymLog). Row height is the tallest week. The selected exercise's whole row is tinted (`td.cell.sel`). A workout removed from a week is one tall cell (`rowspan`) down the workout. `weekSegments` was removed (no longer used).
- **Scroll bars** are thin and dark everywhere (`scrollbar-width: thin; scrollbar-color`). A horizontal bar still appears when the week columns would have to be narrower than 200 px (for example 4 weeks with the panel open in a narrow window) so that every week stays reachable.
- Tested by script and screenshot: Week 2 with two extra set groups on Back Squat, Bench Press absent in Week 3, a superset pair, Workout 2 removed from Week 4: boxes of the same exercise share the same top in every week.

## UI cleanup, stop 2: header, program settings, Library page (7 November 2026, awaiting user test)
- **Block is gone.** No Block field, and new programs have no `block`. `isValidProgram` accepts a missing `block` (old files that have one still open and keep it). The AI prompt's GymLog label is now `<program name> - Wk<week> D<workout>` (Phase 1 spec section 7 and the Phase 2 spec 4.4 updated to match; `docs/Program Import Format.md` is unchanged, its Block advice is general).
- **Editor header** now holds: the name box, `4 weeks · 3 workouts per week`, `Edit`, and on the right `Library` and a plain `Copy AI prompt`. Removed: Block, the two steppers, Open file, Save file, Load Exercise List, New Program.
- **New program dialog** (`openNewProgramDialog`, from `+ New program` in the Library): name, weeks, workouts per week (steppers). It adds the program and opens it.
- **Edit** (`openProgramSettings`, `applyProgramSettings`): weeks and workouts per week. Adding weeks to a program with exercises asks `Extend existing workouts and patterns` (default) or `Leave the new weeks blank` (the new weeks have every exercise left out, so each workout shows `No workout this week · Restore`). Removing weeks or workouts that hold edited cells, kg values or exercises asks first, and says what is lost. `setWeekCount`, `setWorkoutCount`, `startNewProgram` and `lastWeekHasWork` were replaced (`weeksHaveWork`).
- **Library page:** starts here when the builder opens. No back button; every row has `Open` (and clicking the name opens it). The top bar has `Import program` (adds a program file to the library and stays on the Library; replaces Open file), `Load Exercise List` (moved here), `Import everything`, `Export everything`. The footer (Last exported, storage meter) is pinned to the bottom of the window (`.lib-body` scrolls, `.lib-foot` does not). `Save file` is gone; use `Export` on a row.
- **Exercise list:** every exercise on the list is in the Add exercise picker. `New Exercise` types a name, which is added to the global list (`addToExerciseList`, at the end; a name that matches an existing one ignoring capitals uses the list's spelling). The "Not in your Exercise List" warning was removed.
- Tested by script and screenshot: start on the Library, old `block` file opens, New program dialog (name, 6 weeks, 2 workouts), Edit with extend, blank and shrink (confirm), new exercise names joining the list, Library layout.

## Phase 2 step 2, stop 1: coaching fields (7 November 2026, awaiting user test)
Spec: `../docs/specs/Feature Spec 2.1 Program Builder Phase 2.md`, step 2 (2.1 to 2.5). Mockup chosen: week editor B, grid display 1.
- **Data:** every set group has `repsMax`, `rir`, `setType`, `tempo`, `pause` (all `null` = not used), see `newGroup()`. `rir` and `rpe` are never both set (one effort target); a group whose load type is RPE has neither. `migrateOldPatterns` fills the new fields with `null` for older files and drafts, so Phase 1 files open and save back valid. `isValidProgram` checks them (`repsMax` above `reps`, `rir` 0 to 10, set type from `SET_TYPES`, tempo at most 12 characters, pause 0 to 30 seconds). `cloneGroup`, `replaceEditedGroup` and the new `groupsEqual` (replaces a JSON.stringify comparison that depends on key order) include them; changing a group's load type clears `rir` too.
- **Week editor** (`openWeekEditor`, now 800 px wide): one line per set group: Sets, Reps, `to` (upper reps, blank = a fixed number), Load type, Load, Target (an `RPE | RIR` switch and a number), Rest. Under it a link `▸ Set type, tempo, pause…` opens a second line (Set type, Tempo, Pause in seconds); a group that already uses any of them shows it open. Errors are shown for an upper rep that is not above the lower one, a target outside 0 to 10, tempo over 12 characters, and pause outside 0 to 30. Week 1 changes flow to unedited weeks; a later week saved with no change is not marked edited.
- **Grid** (`renderGroupLines`): a small badge for the set type (`Top` is accent coloured), then `sets × reps` (`4 × 5–6`) with `@ RPE 8` or `@ RIR 2`, then the load, then A1/A2 at the right, then a dim line `Tempo 3-1-1-0 · 2 s pause` when used. The settings panel and weeks strip use `setsRepsText` so a rep range shows there too.
- Not in this stop: RIR as a load type with its patterns (stop 2), week flags and the AI prompt text for the new fields (stop 3), the GymLog notes text (step 4).
- Tested by script and screenshot: Phase 1 style file migrates and opens; setting rep range, RIR target, set type, tempo and pause in Week 1 flows to later weeks; the four error messages; Week 2 unchanged save stays unedited, a tempo change marks it edited; switching RIR to RPE clears the other; the target control is hidden for an RPE load type.

### Step 2 stop 1, round 2 (7 November 2026, after user feedback)
- **Library:** clicking a program's name no longer opens it (that was my addition, removed). Only `Open` opens it.
- **Panel now has the new fields** (they were only in the week editor, which is reached from the panel's `Edit` link or the Weeks strip, so they were hard to find): per set group, `Target` (an RPE | RIR switch and a number; hidden when the load is an RPE; switching clears the number because RPE 8 is not RIR 8), `Set type`, `Tempo`, `Pause`. They change Week 1 (the source) and the weeks that are not edited follow (`setGroupFields`). Rep range stays in the week editor (`Edit`).
- **Superset label** (A1, A2) sits in its own right-hand column of the set group line (`.ex-group` is a grid: `.ex-rx` plus `.ex-label`), so it stays on the first line when the prescription wraps instead of dropping to a line of its own.
- Open question: a bug the user reported with the first `Bench` row in Workout 1 (see the conversation); not reproduced yet.

### Step 2, stop 2: RIR as a load type (7 November 2026, awaiting user test)
- **Fourth load type `rir`** next to kg, % and RPE (`LOAD_TYPE_OPTIONS`, `LOAD_LABELS`, `LOAD_LIMITS` 0 to 10). Shown as `RIR 2` in the grid, the panel and the week editor; the panel's Load type control and the Add exercise dialog offer it. A group whose load is an RPE or RIR has no separate target (`hasEffortTarget`). `isValidProgram` accepts it; `kg` may still be filled in.
- **Patterns for RIR:** `Same every week`, `−1 RIR per week` (option `rir1`, stored as `{ kind: 'add', type: 'rir', amount: -1 }`) and `Set each week manually`; no custom step. `nextLoad` keeps RIR (and RPE) between 0 and 10, so 3, 2, 1, 0, 0 over five weeks. The pattern picker warns when RIR would pass 0.
- **Set-type badge** now sits after the load (`3 × 8  RIR 3  TOP`), so sets × reps × load always start at the left.
- **AI prompt** (`AI_PROMPT_LINES`, and Phase 1 spec section 7) now describes `rir`, `repsMax`, `setType`, `tempo` and `pause`, says RIR never goes in the GymLog `rpe` field, and gives the notes text order (`Top set · RIR 2 · 8–12 reps · Tempo 3-1-1-0 · 2 s pause`).
- New open question in the Phase 2 spec (section 11, no. 7): the user's idea that kg is only for programs tied to a lifter, with templates offering %, RPE and RIR.
- Tested by script and screenshot: the four load buttons, the change-load-type confirm, `−1 RIR per week` giving 3, 2, 1, 0, 0, a valid program, the badge position. Not tested: the pattern picker dialog for RIR in a real browser.

### Small fixes (8 November 2026)
- The grid's `+ Add exercise` link now reads `Add exercise`.
- The Target (RPE | RIR) control is shown for **kg** loads only (`hasEffortTarget`). A % load no longer offers it (switching a group to % already clears its target). An older % load that already has a target keeps showing the control so the target can be changed or cleared. The AI prompt and the specs say "kg loads" now.
- Decided for step 4: a Phase 1 program with kg loads that is saved as a template stays under "Not linked to an athlete" in the Library with a small "pre-filled" note (see the Phase 2 spec, section 11, no. 7).

### Step 2, stop 3: week flags (8 November 2026, awaiting user test)
- **Data:** `program.weekFlags`, one entry per week: `null`, `"deload"`, `"test"` or `"comp"` (`WEEK_FLAGS`). New programs have all `null`. `migrateOldPatterns` adds the list to older files (all `null`); `isValidProgram` refuses a wrong length or an unknown value. Changing the number of weeks in Edit adds `null` entries or drops the flags of removed weeks (`applyProgramSettings`).
- **Control:** a small dropdown beside each week heading (`weekFlagSelect`): `Flag` (none), `Deload`, `Test`, `Competition`. A flagged week shows it as a coloured tag (amber, blue, green). The flag only labels the week for now: the deload scaling of sets and loads comes in step 5.3.
- **AI prompt** (and Phase 1 spec section 7): explains `weekFlags` and adds ` · Deload week` / ` · Test week` / ` · Competition week` to the description of every workout in a flagged week. Step 4's direct GymLog export will do the same.
- Tested by script and screenshot: an older file without flags opens, a bad value or length is refused, flags set and kept aligned when weeks are added or removed.

### Week flag control, revised (8 November 2026, after user feedback)
The `Flag` dropdown was replaced by a grey flag icon at the right of each week heading (`weekFlagButton`). Clicking it opens a small menu (`openFlagMenu`): `None`, `Deload`, `Test`, `Competition` (closes on a choice, Escape or a click outside). A flagged week shows the flag name and icon in its colour (amber, blue, green) with no arrow; click it again to change or clear the flag. Data and validation are unchanged (`program.weekFlags`).

## Phase 2 step 3, stop 3a: athlete profiles (8 November 2026, awaiting user test)
Spec: `../docs/specs/Feature Spec 2.1 Program Builder Phase 2.md`, step 3 (3.2, 3.3, 3.4, 3.6). Mockup chosen: `../docs/mockups/Program Builder Athlete Profile - Options.html`, option B (two columns). Not in this stop: the reference lift on exercises (3.1, stop 3b) and using the unavailable list in programs (needs step 4's link between a program and an athlete).
- **Data:** `builder_profiles_v1`, an array of profiles `{ format: 'gym-builder-profile', version, id (pf_…), name, modified, rounding (0.5 to 10, default 2.5), notes, unavailable: [names], lifts: [{ name, oneRm, trainingMax, base: '1rm'|'tm', updated }] }`. A new profile has Back Squat, Bench Press and Deadlift with blank values. Checked by `cleanProfile`; loaded by `profilesLoad`, saved by `profilesSave` / `saveProfiles`. Export everything and Import everything now include profiles (one broken profile refuses the whole file; Add as copies gives new ids and ` (imported)` on a repeated name).
- **Calculation (pure):** `kgForPercent(percent, liftName, profile)` = percent of the lift's base value (1RM or training max, as `base` says), rounded to the profile's step; `null` when the lift, its value or the percent is missing. `findLift` ignores capitals and end spaces. Not used by the editor yet (step 4).
- **Library:** an `Athletes` section above the programs (`renderAthletesSection`): one flat row per athlete with name, a one-line summary (`Squat 200 · Bench 130 · 2.5 kg steps`, `TM` marks a training max), an amber `N exercises unavailable` tag, last edited date, and `Edit profile`, `Duplicate`, `Delete`. `New Athlete` creates one and opens its screen.
- **Profile screen** (`renderProfile`, `Library / <name>` at the top, no back arrow): left column: name, notes, the lifts table (lift name with suggestions from the Exercise List, 1RM, training max, `1RM | TM` Use switch, last-updated date or `Add a training max` when TM is chosen with none, remove ✕), `Add lift`, and `Round loads to`. Right column: `Exercises <name> can't do`: a search box, the Exercise List as tick boxes (ticked = cannot do), a count, names that are ticked but no longer on the list marked `Not in your Exercise List`, and an `Add "<text>" as unavailable` button for a typed name. Everything saves as you type.
- Tested by script and screenshot: create, percent maths (80% of 200 = 160, 77.5% = 155, training max 185 gives 148 rounded to 147.5, missing lift or blank gives null), max edits and rejected values, add lift, tick and typed names, export/import round trip with profiles, broken profile refused, duplicate and delete.

### Profile Save/Delete and the Templates section (8 November 2026, awaiting user test)
- **Profile screen:** top right now has `Save` (green) and `Delete`. `Save` stores the profile (it is already saved as you type), shows "Saved." and returns to the Library. `Delete` asks first (`deleteAthlete`); if programs were made for the athlete (`program.source.profileId`, which step 4 will fill in) the pop-up says how many will move to "Not linked to an athlete" and that they are kept, and their link is cleared. The `Library` text at the top left still works as a breadcrumb. The Delete button on a Library row uses the same pop-up.
- **Templates section:** the Library now has three sections in this order: `Templates`, `Athletes`, `Not linked to an athlete`. A template is a library entry with `kind: 'template'` (programs: `kind: 'program'`; older entries without `kind` are programs). It opens in the same editor (a small `Template` tag in the header) and has the same Open, Duplicate, Rename, Export, Delete. `New Template` (dialog like New Program) creates an empty one; `Save as template` on a program row copies it with the calculated kg values cleared. Export and Import everything keep `kind`. The spec's separate `builder_templates_v1` key is not used.
- Still step 4: `Use for athlete…` (Generate), linking a program to an athlete, hiding the kg load type in templates.

## Phase 2 step 4, stop 4a: Generate (8 November 2026, awaiting user test)
Spec: step 4 (4.2, 4.3). The per-exercise "reference lift" (step 3b) was built and then DROPPED by the user (reverted, never committed). % loads are matched to an athlete lift **by exercise name** instead.
- **Data:** a generated program has `source` (`{ templateId, templateName, profileId, profileName, generatedOn }`) and `profileUsed` (a snapshot `{ rounding, lifts: [{ name, value, extra }] }` of the maxes used: the 1RM, or the training max when the profile says `TM`; `extra: true` marks a max typed in the Generate dialog for an exercise with no lift of that name). Both are `null` otherwise (older files get `null`; checked by `isValidSource` / `isValidSnapshot`). Saving a program as a template clears them.
- **Calculation (pure):** `snapshotFromProfile`, `kgFromSnapshot(percent, exerciseName, snap)` (percent of the lift with that name, rounded to the profile step; `null` if no lift), `recalcKg(program)` (fills `kg` on every % set group; called from `changed()`, so editing a % load updates kg at once), `analyseGenerate` (counts % loads that get kg, lists exercises with no matching lift, lifts with no max, and exercises the athlete cannot do), `snapshotKey` / `freshSnapshot` (to spot a changed profile).
- **Generate dialog** (`openGenerateDialog`): from a template row (`Use for athlete`, pick the athlete) or from an athlete block (`New Program`, pick the template). Name defaults to `<template> - <athlete>`. Shows `N of M percentage loads will get a kg value.`, a box for a max of its own for each exercise with no matching lift (the "asked to fill this out separately" rule), and an amber list of things to look at (a lift with no max; exercises the athlete cannot do). The program is always created, saved to the library at once and opened (`generateProgram`).
- **Library:** `Use for athlete` is the first button on a template row. Each athlete is now a collapsible block (`renderAthleteBlock`) with `Edit profile`, `Duplicate`, `Delete`, `New Program`; opening it lists their programs (`from <template>` in the detail line). `Expand all` / `Collapse all` sits in the Athletes header. By default only the athlete of the most recently edited program is open. `Not linked to an athlete` now holds only programs with no athlete (including ones whose athlete was deleted: `deleteAthlete` clears the link).
- **Editor:** a `for <athlete>` tag beside the name. If the athlete's profile changed since the program was made, an amber bar says so with `Recalculate` and `Dismiss` (`updateProfileBar`); Dismiss lasts until the numbers change again (not saved).
- **Import everything, Add as copies:** imported programs keep their link to the imported copy of their athlete and template (`profileIdMap`, `entryIdMap` in `applyImport`).
- Not in this stop (4b): `Export for GymLog` with preview, hiding the kg option in templates, the "pre-filled" note.
- Tested by script and screenshot: 75/80/85/90% of 200 gives 150/160/170/180; an extra max of 150 gives 105 kg at 70%; kg updates when a % load is edited; the bar appears, dismisses, comes back on a new change and recalculates (80% of 220 = 176 rounds to 175); athlete blocks expand and collapse; New Program from an athlete preselects them; Save as template clears the link; Add as copies keeps links; deleting an athlete unlinks their programs.

## Phase 2 step 4, stop 4b: Export for GymLog (8 November 2026, awaiting user test)
Spec 4.1, 4.4. This completes step 4: template, athlete, Generate, then a file for the phone app.
- **Export for GymLog** (`exportForGymLog`, button in the editor header; not shown for a template): writes `<program name>.gymlog.json` in the format of `docs/Program Import Format.md`. Pure builders: `buildGymLogFile(program)`, `gymlogExerciseEntry`, `coachingNotes`, `gymlogWeight`, `missingKgList`, `unavailableInProgram`.
  - One GymLog workout per program workout per week; a workout with no included exercises that week is left out. `label` = `<program name> - Wk<week> D<n>`; `description` = the workout description, plus ` · Deload week` / `Test week` / `Competition week` for a flagged week.
  - Each included set group is one exercise entry, in the same order as the grid (a paired set group sits right after its partner, with `superset` letters A, B… restarting in each workout). `weight`: kg load = the load, else the calculated or AI-filled `kg`; omitted when blank. `rpe`: the load if the load type is RPE, else the RPE target; RIR never goes in `rpe`. `reps` = the lower rep; `rest` in seconds. `notes` = `Top set · RIR 2 · 8–12 reps · Tempo 3-1-1-0 · 2 s pause`, then the coach's own notes.
  - **Blocked** with a list (first 10, then "and N more") when a % set group in an included week has a load but no kg: make the program for an athlete from a template, or add kg with Copy AI prompt. Empty program: "There is nothing to export yet".
  - **Preview** dialog: workout and entry counts and the first workout in readable form (superset letters, notes). `Download file`, or `Export anyway` with an amber line when the athlete the program was made for cannot do some of its exercises (they are only warned about, never blocked). After downloading: a notice says to import it in GymLog (Settings, Program Management).
- **No kg in templates** (`loadTypeChoices`, `currentIsTemplate`): the panel's load type control, the week editor's new set group and the Add exercise dialog (which starts on %) offer % of 1RM, RPE and RIR only. A set group that already uses kg keeps it.
- **Pre-filled** (`hasKgLoads`, `saveAsTemplate`): `Save as template` on a program with filled-in kg loads adds an ordinary copy named `<name> (pre-filled)` under "Not linked to an athlete", with `entry.note = 'pre-filled'` (shown in the row detail; kept by Duplicate and Export/Import everything). A program without kg loads still becomes a real template.
- Tested by script and screenshot: 85% of 200 = 170 kg, the RIR target goes into the notes (not `rpe`), the superset pair shares letter A and sits together, the deload week description, the blocked list, the empty message, the Export anyway warning, template header without the export button, kg hidden in templates, the pre-filled copy, and a real template from a % only program. Not tested: importing the downloaded file into GymLog on a phone (T4.8).

## Feedback round 1 (8 November 2026, after first real use; awaiting user test)
- **kg is back in templates** (`loadTypeChoices` offers all four types everywhere). This reverses the "no kg in templates" decision of step 4b. kg is the default load type for a new exercise, in programs and templates. `Save as template` no longer makes a "(pre-filled)" copy; it keeps typed kg loads and clears only the calculated `kg`. (`hasKgLoads` is now unused; the `pre-filled` note still shows on old entries.)
- **Add exercise dialog** (`openAddExerciseModal`): the name dropdown starts on `Select Exercise`, first option `Create New Exercise` (shows the name box); Add without a choice says so. Set group rows are compact: Sets, Reps, `to`, Load type, Load, Target (RPE | RIR), Rest on one line; a second line holds Set type, Tempo, Pause and Progression (Same every week, Add kg / % / RPE / RIR per week, Add % per week for kg) with an amount. Manual progression, per-week values and supersets stay in the settings panel: after Add, the panel opens on the new exercise (`createExercise` sets `selected`). `createExercise` takes optional `fields.patterns`.
- Delete on a program "not linked to an athlete" was reported broken and then worked again; it could not be reproduced, no change made.
- Athlete page feedback: not received yet.

### Feedback round 1, change of plan: one add flow, in the panel (8 November 2026, awaiting user test)
- **The big Add exercise window is gone** (the user found a dialog the first time and the panel afterwards confusing). `Add exercise` opens a small picker (`openAddExerciseModal(wi)`): `Select Exercise`, `Create New Exercise` (name box, joins the global list), Add. The exercise goes into every week with defaults (3 × 10, kg, blank load, 90 s) and the settings panel opens on it (`createExercise` sets `selected`). The "Add to: this week only" option left with the dialog; remove an exercise from a week in the panel's Weeks strip.
- **Panel scope** (`panelScope`, `renderScopeBar`, `viewGroup`, `setGroupFields`): `Apply changes to: All weeks | One week only` plus a week picker. Applies to Target, Set type, Tempo, Pause and the `Edit` link. All weeks = change Week 1, weeks not edited follow (as before). One week = only that week changes and is marked edited; for Week 1 the later weeks are marked edited first so they keep their values. Load type, Rest, Progression and Superset always apply to all weeks (the panel says so). Clicking a week's cell in the grid presets that week as the "one week" choice; selecting another exercise resets the scope to All weeks.
- `createExercise` still accepts `fields.patterns` (now unused).

### Feedback round 1, panel rework (8 November 2026, awaiting user test)
- **Add exercise starts in one week.** `Add exercise` in a week's cell puts the exercise in that week only (`createExercise(..., weekIndex)`) and the panel opens on `One week only` for that week. Choosing `All weeks` (`applyToAllWeeks`) puts it in every week; if Week 1 did not have it, the chosen week's settings become Week 1 so nothing typed is lost. Clicking an exercise that is missing from some weeks also starts on `One week only`.
- **Panel layout** (`renderDetail`, `renderSetGroupSection`): Move up / Move down in the header beside the cross; the `Apply changes to` bar; then per set group: Load type, Progression, the loads of every week as inputs (`renderWeekLoads`, `setWeekLoad`: Week 1 flows to unedited weeks, another week becomes edited, `Reset` returns it to the progression), Target, Rest, optional fields, Superset, and `+ Add set group` under the last group. The old Weeks strip is gone.
- **Optional fields:** Set type, Tempo and Pause are hidden until `+ Set type` / `+ Tempo` / `+ Pause` is clicked (`shownOptional`, screen state); a field with a value is always shown; the × clears and hides it.
- Sets, reps and rep range are still edited with the `Edit` link (week editor dialog).

## UI overhaul (15 November 2026; stops 1 to 5 and the Library tested by the user, stop 6 not started)
Mockups: `../docs/mockups/Program Builder UI Overhaul - Panel Options.html` (the user chose Option A, the week table) and `../docs/mockups/Program Builder UI Overhaul - Library Options.html` (the user chose Option A, one list). This section replaces the older log entries about the week editor dialog, the pattern picker, the `Apply changes to` scope, the Add exercise dialog, the athlete page and the "Not linked to an athlete" section: all of those are gone.

**Stop 1: the settings panel is the one place to change an exercise.**
- Each set group has a week table (`renderWeekTable`, `repsCell`): a row per week with sets × reps, the load and (for % loads with an athlete) the kg. The Week 1 row changes all weeks. A value typed in a later row changes that week only: its box has a green edge and the reset arrow at the end of the row puts the week back. The last column always keeps the width of the reset arrow.
- Reps accept a range typed as `8-10` (`readReps`).
- A week is "edited" only while it differs from what Week 1 and the patterns give (`patternWeeks`, `samePrescription`, `settleEditedWeek`): typing the old value back clears the mark.
- A change in Week 1 also reaches an edited week, but only in the fields where that week still had Week 1's old value (`withSourceFields`, used by `setGroupFields`, `setWeekFields`, `setGroupRest`).
- Progression is the `Each week` row (`progressionRows`, `setPattern`): `no change`, `add` (kg, %, RPE or RIR; negative allowed) or `add % of the load` (kg loads only, with a `Round` row). It applies at once. Pattern kind `manual` is no longer written; an old file that has it opens and acts as `same` (`patternKind`).
- One set group is open at a time; the others fold to one summary line (`panelOpenGroup`, `groupSummary`). `+ Add set group` and `Delete` (in the group heading) work on every week (`addSetGroup`, `confirmDeleteSetGroup`).
- `In weeks` (`inWeeksRow`): one on/off button per week takes the exercise out of a week or puts it back.
- Tab, Enter and a click on another box keep their place when a typed value redraws the panel (`panelIntent`, `watchPanelIntent`, `restorePanelFocus`, the `data-fk` attribute).
- No longer possible: a different target, rest, set type, tempo or pause for one week, and removing one set group from one week only. Old data that has such differences keeps them.

**Stop 2: Add exercise is a search box** at the foot of each workout (`addExerciseBox`, `matchExercises`). Typing filters the Exercise List; the last menu line creates a new name; Enter or a click adds the exercise to every week; the cursor stays in the box.

**Stop 3: design tokens.** All colours, 5 font sizes (12, 13, 14, 16, 20), the spacing scale (4 to 32) and 3 radii are CSS variables at the top of the style block; no other colour value is in the styles. Controls have one look; edges use `--control` (#626A63, about 3.5:1 on the background); one `:focus-visible` ring; the danger button has dark text; `color-scheme: dark`. Icons are inline SVG (`ICONS`, `icon`, `iconButton`). Green is only for the primary action, selection, the superset bar and a value changed by hand.

**Stop 4: header, menus and labels.** `openMenu` / `menuButton` are the one menu (week flags, row actions, Import, the editor `⋯`). Labels use sentence case: `Back up everything`, `Restore backup`, `Import exercise list`, `Export program file`. `keyClick` makes non-button rows work with Enter and Space.

**Stop 5: Generate and Export repairs.**
- Generate dialog: typing a max changes only the count line (`updateCount`); the max boxes are redrawn only when the template or athlete changes, so a filled box stays and the first click on `Create program` works.
- Export with missing kg (`openMissingKgDialog`, `missingKgList` now grouped by exercise): a program made for an athlete gets a max box per exercise; the max is added to `program.profileUsed.lifts` as an extra (the same model as Generate) and the export continues. A program without `profileUsed` gets the correct advice.
- GymLog file: the coach's exercise note is written on the first entry of an exercise in a workout only (`gymlogExerciseEntry(..., withNotes)`); the AI prompt says the same.
- Dialogs trap the Tab key and give the focus back when they close (`openModal`; `showConfirm` now uses `openModal`).

**The Library** (`renderLibrary`, `renderLibraryList`, `renderEntryRow`, `renderAthleteRows`, `renderEntryPanel`, `renderAthletePanel`, `libSel`, `librarySelection`): see "Screens" and "A program always belongs to an athlete" at the top. Removed on purpose: Expand all / Collapse all, the "Open now" tag (the open program is selected when the Library opens), the green New program button.

**Testing.** Checked in a real browser at 1280 px with a throwaway test library (an 8-week template, two athletes, one generated program). Not checked: 1920 px after stop 1, `Import program file` and `Restore backup` with real files, a phone import of the exported file.
