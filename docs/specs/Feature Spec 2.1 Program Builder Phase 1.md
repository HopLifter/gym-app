# GymLog – Feature Spec 2.1: Program Builder Phase 1 (Core Builder)

**Status:** Built (steps 1 to 8 done). Step 9, the real-browser tests and one real block, is in progress. See `builder/PROJECT_SUMMARY.md`.  
**Roadmap item:** 2.1 Program Builder Epic, Phase 1  
**Build order:** Implement after Spec 1.7.  
**Chosen design:** Combined layout: Program Grid with an exercise table below it (see the Program Builder Layouts canvas)

## 1. Goal

Give the user a desktop website for building a training program faster and more clearly than in Excel. The program can use kg, % of 1RM and RPE. The website then creates an AI prompt, which turns the program into a reviewed GymLog import file.

**Done when:** the user builds a real block in the builder, gets it into GymLog through the AI prompt, and can reopen the program with its kg values in the builder.

## 2. Scope

**In scope**
- A new, separate website.
- Creating, editing, saving and reopening one program at a time.
- Weeks and workouts per week that update the layout immediately.
- kg, % of 1RM and RPE loads, with varied sets.
- Progression patterns.
- Supersets.
- Loading the Exercise List from a GymLog backup.
- Copying the AI prompt.

**Out of scope**
- Direct export to GymLog. The AI creates the import file.
- Calculating kg in the builder.
- Templates, duplication and versions (Phase 2).
- Workload analysis (Phase 3).
- Importing workout history into the builder (Phase 4).
- History-based suggestions (Phase 5).
- Phone support and offline support.
- Any change to GymLog itself, other than Spec 1.7.
- Accounts, a server or paid AI services.
- Supersets of more than two set groups.

## 3. Setup

- Published from the `builder/` folder of the `HopLifter/gym-app` repo (it began as its own repo, `HopLifter/gym-program-builder`), hosted on GitHub Pages.
- Plain HTML, CSS and JavaScript, with no frameworks and no build tools.
- One `index.html`, matching GymLog, plus `PROJECT_SUMMARY.md`.
- No service worker.
- Target screen width: 1024px and above.

**Storage:** The site shares its web address with GymLog (`hoplifter.github.io`), so the two sites can read each other's `localStorage`. Every builder key must start with `builder_`, and the builder must never read or write a `gymapp_` key.

## 4. Key concepts

- **Workout:** a row in the grid. It holds one list of exercises, and each exercise can be included in all weeks or only some of them.
- **Week 1:** the source for each exercise. Later weeks are generated from Week 1 and each set group's pattern.
- **Edited week:** a later week changed by hand. Generated values never overwrite it.
- **Set group:** one or more identical sets, such as `3 × 5 at 97.5 kg`. An exercise can have several, such as `3 × 5` then a back-off `1 × 8`.
- **Prescription:** the planned load, as kg, % of 1RM or RPE.
- **kg value:** the real weight added by the AI. It is stored next to the prescription and never replaces it.

## 5. Behaviour

### 5.1 Starting

On first visit, the page opens a new program: `New Program`, Block 1, 4 weeks and 3 workouts per week.

After that, it reopens the saved draft.

### 5.2 Header

The header shows, from left to right:
- Program name, an editable text field.
- ~~Block number~~ (removed 7 November 2026: put it in the program name; old files that still have `block` open fine).
- Weeks stepper, from 1 to 12.
- Workouts per week stepper, from 1 to 7.
- `Open file`, `Save file`, `Load Exercise List`, `New Program` and `Copy AI prompt` buttons. `Copy AI prompt` is the primary button.

### 5.3 Changing the size of the program

The grid updates immediately when a stepper changes.

- **Adding a week:** generates the new week from Week 1 and the patterns.
- **Adding a workout:** adds an empty workout.
- **Removing a week:** removes the last week. If it has edited cells or kg values, confirm first.
- **Removing a workout:** removes the last workout. If it has exercises, confirm first.

### 5.4 Program Grid

- Weeks run across and workouts run down.
- The left column shows `Workout N`, followed by its editable description.
- Each cell lists the exercises for that week in the order they will have in GymLog: a paired set group is shown straight after its partner, inside one frame, so a superset reads as a pair. An exercise with several paired set groups therefore appears several times (for example Bench, Curls, then Incline Bench, Curls).
- Each exercise shows its name, then one line per set group with sets × reps, the target RPE (if set) and the load, all on the same line.
- Paired set groups show `A1` and `A2` in front of their lines, with letters restarting in each workout.
- An exercise with more than one set group shows every set group, one per line. There is no `+N more`.
- An exercise that isn't included in a week doesn't appear in that week's cell.
- An edited week shows `(edited)`.
- When a kg value exists, the load shows as `75% · 120 kg`.
- Every week cell has an `Add exercise` button at the end of its list.
- All loads (kg, % and RPE) use `--accent`. The text names the type (`97.5 kg`, `75%`, `RPE 8`), so colour is never the only signal.
- A blank load shows `Set load`. If its set group's pattern changes the load, later weeks also show the planned change counted from Week 1, such as `Set load + 5 kg` in Week 2 and `Set load + 10 kg` in Week 3. Edited weeks show plain `Set load`.
- The grid scrolls sideways when needed, and the Workout column stays fixed.

### 5.5 Exercise table

Clicking an exercise in the grid:
- Highlights that exercise in every week.
- Opens a table below the grid. The table shows the selected exercise. If some of its set groups are in a superset, each paired set group is shown together with its partner's line, framed as a pair, in GymLog order (for example selecting Curls shows Bench with Curls, then Incline Bench with Curls). Partner lines are fully editable, and clicking a partner's name selects it.

The table stays visible while the grid scrolls. By default it fits its content, up to 380px tall. The user can drag the bar on its top edge (or focus it and use the up and down arrow keys) to make the table taller or shorter, from 120px up to 90% of the window height; double-clicking the bar resets it. The chosen height is remembered in `localStorage` under `builder_detail_height_v1`. `Close` hides the table and clears the highlight.

The table is laid out with one line per set group, so each set group's load type, pattern and weekly values line up on the same line. The exercise shows:
- Exercise name, and for each set group its set scheme and its own rest time (editable).
- For each set group, its own kg, %, RPE load type control. Set groups of one exercise can use different load types, such as a single at 103% of 1RM followed by 3 × 3 at RPE 7.
- One progression pattern button for each set group. Clicking one opens the pattern picker for that set group.
- One cell per week.
- Add set group, Move Up, Move Down and Delete actions, at the far right. `Add set group` opens the Week 1 editor with a new set group added. Supersets are set per set group line, in the `Superset` column (5.10).

Clicking another exercise in the grid replaces the exercise in the table.

### 5.6 Adding an exercise

`Add exercise` opens a modal with:
- Name, a dropdown of the Exercise List with `New Exercise` at the top. That option shows a free-text field.
- Load type, default kg.
- One row per set group, each with sets (default 3), reps (default 10) and load (which may be blank, meaning "set later"). `Add set group` adds a row, and each row except the last can be deleted, so every group's start values can be entered straight away.
- Each set group row also has its own load type and rest in minutes (default 1.5), so groups can rest for different times.
- Notes, optional.
- Add to, with the options `All weeks` and `This week only`. The default is `All weeks`.

**All weeks:** The exercise is included in every week with the pattern `Same every week` on every set group.

**This week only:** The exercise is included only in the week whose button was clicked. That week is marked as edited. The entered values are also kept in the other weeks' hidden entries, so `Add to this week` has values to start from.

New exercises go at the end of the workout's list.

If the Exercise List hasn't been loaded, only the free-text field shows.

### 5.7 Editing a week

Clicking a week cell in the table opens a small editor with:
- One row per set group: sets, reps, load type (changeable only on a group added here; the table's control changes existing groups), load, optional target RPE and rest.
- `Add set group` and a delete action on each group, except the last.
- `Remove from this week`.
- `Use pattern value`, shown only on edited weeks. It clears the edit.

Target RPE is only shown for kg and % loads.

A table cell for a week that doesn't include the exercise shows `Not in this week`, with an `Add to this week` button. Adding it back uses the pattern's value for that week.

If removing an exercise from a week would leave it in no weeks, confirm first, then delete the exercise.

**In Week 1:** Changes regenerate every week that isn't edited.

**In later weeks:** Any change marks that week as edited.

### 5.8 Switching load type

Changing the load type control on a set group opens a confirm if any of that group's loads has a value:
- **Title:** `Change load type?`
- **Text:** `All loads for this set group will be cleared.`
- **Buttons:** Cancel and red `Change`

On confirm, that set group uses the new type with a blank load in every week, its target RPE and kg value are cleared, and its pattern resets to `Same every week`.

If some weeks were edited by hand, the confirm also asks what to do with them: `Keep the edited weeks as they are` (the default) or `Clear the edited weeks too`. Kept weeks stay exactly as they are.

A blank load shows `Set load` in the grid and table.

If the exercise's set groups use different load types, the control shows none as selected.

### 5.9 Progression patterns

Each set group has its own pattern. Clicking a set group's pattern opens the picker, titled `Repeat across weeks`, showing the exercise, workout and (with several set groups) which set group.

Options, in order:

| Option | kg | % of 1RM | RPE |
|---|---|---|---|
| Same every week | Yes | Yes | Yes |
| Custom change per week | Any amount, typed or nudged in steps of 1.25 kg. May be negative. | Any amount, typed or nudged in steps of 0.5%. May be negative. | No |
| +1 RPE per week | No | No | Yes |
| Percentage increase | Any percentage above 0 (steps of 0.5%), with rounding set by the user | No | No |
| Set each week manually | Yes | Yes | Yes |

There are no fixed `+2.5` or `+5` options: Custom covers them. RPE is subjective and tops out at 10, so it has no custom option, and generated RPE loads never go above 10. With `+1 RPE per week` and a start value, the picker warns if the pattern would pass 10: `RPE is capped at 10. Every week after it reaches 10 stays at 10.`

**Rounding (Percentage increase):** the user chooses the rounding step in kg (for example 2.5 or 1.25, depending on the plates available) and the direction: to the nearest, up to, or down to that step. The default is to the nearest 2.5 kg.

**Edited weeks:** if any week was edited by hand (including through `Set each week manually`) and the user applies a pattern other than manual, the picker asks what to do with those weeks: `Keep the edited weeks as they are` (the default) or `Replace the edited weeks with the new pattern`. Replacing puts the new pattern's value into that set group in each edited week, and the week stops being marked edited if it then matches the patterns.

- The picker also has a load type control (which applies to that set group) and a `Start` value, which sets Week 1 of that set group. Changing the load type uses the same confirm as 5.8.
- A preview shows the load for each week and updates immediately. A blank load shows the planned change, such as `Set load + 5 kg`.
- With `Set each week manually`, the preview becomes one input per week for that set group, and each of those weeks is marked as edited.
- `Apply` saves the pattern. `Cancel` changes nothing.
- A blank load shows its planned change, for example `Set load + 5 kg`.

**Calculation:** Each week starts from the previous week's generated value, and Week 1 is the start value. Each set group follows its own pattern. A blank Week 1 load stays blank in every generated week.

**Rounding example:** `+5%` from 100 kg gives `100, 105, 110, 115`. Each result is calculated as `round(previous × 1.05 ÷ 2.5) × 2.5`.

### 5.10 Supersets

A superset pairs one set group of an exercise with one set group of another exercise in the same workout. The two set groups have the same number of sets: each round is one set of each.

- Every set group line in the table has a `Superset` cell. `Superset with…` opens a dialog to choose the other exercise and which of its free set groups to pair with. `Remove` clears the pair.
- If the two set groups have different numbers of sets, the dialog says so and offers `Split and superset`. The group with more sets is split in two (for example Curls 6 sets becomes 3 + 3), with the same reps, load, rest and pattern in each part. The first part pairs and the rest stays free, so it can be paired with another exercise.
- Example: Bench 3 sets, Incline Bench 3 sets and Curls 6 sets. Curls is split 3 + 3, one half pairs with Bench and the other with Incline Bench.
- A set group belongs to at most one pair, and a pair is always two set groups of two different exercises.
- A pair shares one rest time: the later exercise adopts the earlier one's rest, and editing either updates both.
- Editing the sets of a paired set group (in any week) gives its partner the same sets in that week. A later week that changes is marked edited.
- Move Up and Move Down move one exercise at a time. Paired set groups do not have to sit next to each other in the builder.
- Deleting an exercise or a set group unpairs its partner; the partner stays.
- A pair only acts as a superset in weeks where both exercises are included and both have that set group. Otherwise the set group is treated as normal that week.
- In the import file, the AI puts each pair next to each other, so an exercise with several paired set groups can appear several times in a GymLog workout. That is expected.

### 5.11 kg values

The AI adds kg values to the builder copy of a program.

- `Open file` shows them next to each prescription, as in 5.4.
- A set group's kg value is cleared when its load or load type changes, including through a pattern.
- A kg-type load shows its load once, unless the kg value differs. In that case it shows `97.5 kg · 100 kg`.

### 5.12 Exercise List

`Load Exercise List` opens a file picker for a GymLog Backup All Data file.

- The file is a JSON object. `gymapp_exercise_list_v1` holds a JSON-encoded string, so it must be parsed a second time to get the list.
- The list replaces any list already saved.
- Nothing else from the backup is kept.
- A success notice shows `N exercises loaded.`
- If the file isn't valid or has no list, show `This file doesn't contain an Exercise List.`

A name not on the list is allowed. The modal shows `Not in your Exercise List`, because GymLog's Recent Performance matches exact names.

### 5.13 Saving and opening

**Draft:** Every change saves to `localStorage` under `builder_draft_v1`.

**Save file:** Downloads the program as JSON. The file name is the program name with unsafe characters removed, followed by `.program.json`.

**Open file:** Reads a program file. If the current draft has changes that haven't been saved to a file, confirm first.

- **Title:** `Replace current program?`
- **Text:** `Changes that haven't been saved to a file will be lost.`
- **Buttons:** Cancel and red `Replace`

An invalid file, or one with a higher `version`, shows `This file can't be opened.` and changes nothing.

**New Program:** Uses the same confirm, then opens the defaults from 5.1.

Track unsaved changes with a dirty flag. Set it on every change, and clear it on Save file, Open file and New Program. Warn with the browser's `beforeunload` event if the user closes the page while it's set.

### 5.14 Copy AI prompt

The button builds the prompt in section 7 and copies it to the clipboard.

- It shows `Prompt copied.`
- If the clipboard isn't available, a modal shows the prompt in a text box.
- With no exercises, it shows `Add an exercise first.` and copies nothing.
- With blank loads, it asks first: `N loads are blank. The AI will suggest values for them.` The buttons are Cancel and `Copy prompt`.

## 6. Data model

Saved in the draft and in program files:

```json
{
  "format": "gym-program-builder",
  "version": 1,
  "name": "Block 2 - Strength Cycle",
  "block": 2,
  "weeks": 4,
  "workoutsPerWeek": 3,
  "workouts": [
    {
      "id": "wk_1",
      "description": "Squat + Heavy Bench",
      "exercises": [
        {
          "id": "ex_1",
          "name": "Bench Press",
          "notes": "",
          "supersets": [null, null],
          "patterns": [
            { "kind": "add", "type": "kg", "amount": 2.5 },
            { "kind": "same", "type": "kg", "amount": 0 }
          ],
          "weeks": [
            {
              "included": true,
              "edited": false,
              "groups": [
                { "sets": 3, "reps": 5, "loadType": "kg", "load": 97.5, "rpe": 8, "kg": null, "rest": 180 },
                { "sets": 1, "reps": 8, "loadType": "kg", "load": 82.5, "rpe": null, "kg": null, "rest": 120 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

- `rest` belongs to each set group and is in seconds, matching GymLog. The screens show minutes.
- `loadType` is `kg`, `pct` or `rpe`.
- `load` is a number or `null`. A `pct` load of `75` means 75% of 1RM.
- `rpe` is an optional target for kg and % loads. It is always `null` when `loadType` is `rpe`.
- `kg` is a number or `null`, and only the AI or an opened file sets it.
- `patterns` has one entry per set group of Week 1, in the same order. Set groups in later weeks follow the pattern with the same position.
- `pattern.kind` is `same`, `add`, `percent` or `manual`. `add` covers Custom and +1 RPE.
- `pattern.type` is the load type it changes.
- `pattern.amount` is the weekly change (it may be negative for `add`). It is unused for `same` and `manual`, and is the percentage for `percent`.
- `percent` patterns also have `step` (the rounding step in kg, default 2.5) and `mode` (`nearest`, `up` or `down`, default `nearest`).
- Each exercise has one `weeks` entry per program week, even for weeks where `included` is `false`.
- Generated values still update in weeks where `included` is `false`, unless that week is edited.

**Other storage keys**
- `builder_draft_v1`: the program above.
- `builder_exercise_list_v1`: an array of exercise names.
- `builder_detail_height_v1`: the height in pixels of the bottom table, if the user resized it.

## 7. AI prompt

Fill in `[program name]` and `[program JSON]`. The program JSON is the exact content of a saved program file.

```text
You are helping me turn a training program into real weights for my workout app, GymLog.

PROGRAM: [program name]

MY DATA
Before starting, ask me for my 1RM for every lift that uses a % load. I may also attach a GymLog backup file with my workout history. Use it for RPE-based and blank loads.

HOW TO READ THE PROGRAM JSON
- "workouts" lists the workouts of one week. Each exercise has "weeks": one entry for each program week, in order (the first is Week 1). A week entry has "included" (false means the exercise is not done that week), "edited" and "groups".
- A group is a set group: "sets" × "reps" at "load". "loadType" says what the load means: "kg" (kilograms), "pct" (percent of my 1RM) or "rpe" (target RPE). "rpe" is an optional target RPE for kg and pct loads. "rest" is in seconds. "kg" is the real weight you fill in; it is null for now.
- Each exercise's "patterns" and "supersets" lists have one entry for each set group of its first week, in the same order. A blank load ("load": null) with a pattern changes every week by that pattern: "add" adds "amount" per week (in the unit of the load), and "percent" multiplies the previous weight by 1 + "amount" ÷ 100 and rounds to a multiple of "step" kg ("mode" says nearest, up or down). RPE never goes above 10.

STEP 1: SUGGEST WEIGHTS
Work out a kg value for every set group in a week where "included" is true:
- "pct" load: 1RM × load ÷ 100, rounded to the nearest 2.5 kg.
- "kg" load: use the load, unless I ask you to change it.
- "rpe" or blank load: suggest a weight from my history. If there is no useful history, ask me for one. For a blank load with a pattern, suggest the first week's weight and follow the pattern for later weeks.
Do not guess a 1RM. Ask if one is missing.

STEP 2: SHOW ME A TABLE
Show one table per workout, with these columns: Week, Exercise, Sets × Reps, Prescription, Suggested kg, Target RPE, Rest (min), Reasoning.
Keep the Reasoning short. Group superset exercises together, and label them.
Then ask me what I want to change.

STEP 3: UPDATE AND CONFIRM
Update the table with my changes. Ask whether I confirm it. Do not create any final files until I clearly confirm.

STEP 4: CREATE TWO FILES
After I confirm, create both files, and check that each one is valid JSON.

File 1: [program name].gymlog.json, for import into GymLog:
{
  "program": { "name": "<name>" },
  "workouts": [
    {
      "label": "<program name> - Wk<week> D<workout>",
      "description": "<description>",
      "exercises": [
        { "name": "<name>", "sets": 3, "reps": 5, "weight": 120, "rpe": 8, "rest": 180, "notes": "", "superset": "A" }
      ]
    }
  ]
}
Rules for File 1:
- Create one workout for every week and workout, in order: all of Week 1, then all of Week 2.
- Leave out an exercise in any week where its "included" value is false.
- Leave out a workout that has no included exercises in that week.
- If an exercise has several set groups, create a separate exercise entry for each, in order.
- "weight" is always in kg. "rest" is always in seconds.
- Use a period for decimals.
- "rpe" is the target RPE, or the load if the load type is "rpe". Leave it out if there is neither.
- For two set groups with the same value in their exercises' "supersets" list (the same pair id), give both entries the same "superset" letter if both exercises are included that week and both have that set group. Each pair gets its own letter. Letters restart in each workout. Put the two entries next to each other, at the position of the earlier one. An exercise with several paired set groups therefore appears several times.
- Leave "superset" out for all other entries, including a paired set group when its partner isn't included that week.

File 2: [program name].program.json, for my Program Builder:
- Return the exact program JSON below, unchanged, except:
  - Set "kg" on every set group in an included week to the confirmed weight.
  - If I changed a sets, reps, load or rest value in the table, update that value too. For a load changed in a later week, also set that week's "edited" to true.

After the files, tell me how many workouts File 1 contains.

PROGRAM JSON
[program JSON]
```

## 8. Visual design

Match GymLog's dark look, using its tokens:

| Token | Value |
|---|---|
| `--bg` | `#0B0D0C` |
| `--surface` | `#161917` |
| `--line` | `#2A2F2B` |
| `--text` | `#EDEEEA` |
| `--text-dim` | `#8C948C` |
| `--accent` | `#C6FF3D` |
| `--danger` | `#E05C4E` |

- Use the same system font as GymLog, with `font-variant-numeric: tabular-nums`.
- A selected exercise uses a `--accent` border and a `#232A1A` background.
- The primary button uses a `--accent` background and `--bg` text.
- Week columns in the grid are at least 220px wide. Week columns in the table are at least 116px wide.
- Follow the Combined and Progression pattern artboards for layout.

## 9. Implementation notes

- **Structure:** Keep one `program` object, a `render()` function that redraws from it, and small named functions for each change.
- **Logic:** Keep calculation functions, such as `generateWeeks(exercise, weekCount)`, separate from drawing code. This makes them easy to test and to move into GymLog in Phase 6.
- **Dialogs:** Use custom modals. Native `confirm()`, `alert()` and `prompt()` must not be used.
- **Escaping:** Use `textContent` or an `escapeHtml()` helper for all user text.
- **Decimals:** Accept `.` and `,` in number fields, as GymLog does.
- **Opened files:** Treat every opened file as untrusted, and validate it before replacing the program.

### Suggested build order

1. Create the repo, GitHub Pages site and data model, with a working draft save.
2. Build the header, steppers and grid.
3. Add exercises and week cell editing.
4. Add the exercise table and load type switching.
5. Add progression patterns.
6. Add supersets and reordering.
7. Add Save file, Open file and the Exercise List.
8. Add Copy AI prompt.
9. Run the acceptance tests, then build one real block.

Stop after each step so the user can test it.

## 10. Acceptance tests

**Grid and size**
1. A new program shows 4 weeks and 3 workouts.
2. Each stepper updates the grid immediately and stops at its limits.
3. A new week follows each set group's pattern.
4. A new workout starts empty.
5. Removing a week with edits or kg values asks first.
6. Removing a workout with exercises asks first.
7. The grid scrolls sideways with 12 weeks, and the Workout column stays fixed.

**Exercises and loads**
8. Add Exercise with `All weeks` places the exercise in every week, and `This week only` places it only in the chosen week.
9. The dropdown shows the loaded Exercise List.
10. A custom name is allowed and shows the warning.
11. kg, % and RPE display correctly in one workout.
12. A blank load shows `Set load`.
13. Changing Week 1 updates all unedited weeks.
14. Changing a later week marks it as edited.
15. `Use pattern value` clears an edit.
16. `Remove from this week` hides the exercise in that week's grid cell, and `Add to this week` brings it back. Removing it from its only week asks first, then deletes it.
17. A second set group shows in full in the grid, with no `+1 more`.
18. Changing a set group's load type asks first, then clears that group's loads and pattern. Set groups can have different load types and rest times.
19. Comma and period decimals are both accepted.

**Table**
20. Clicking an exercise highlights it in every week and opens its workout's table.
21. Clicking another exercise in the grid replaces the exercise in the table and moves the highlight.
22. Close hides the table and clears the highlight.
23. The table stays visible while scrolling.

**Patterns**
24. Each option in 5.9 appears for the correct load type, in the listed order. Each set group has its own pattern and start value.
25. Custom `+2.5 kg` from 100 kg gives 100, 102.5, 105, 107.5.
26. Custom `+2.5%` from 75% gives 75, 77.5, 80, 82.5.
27. `+1 RPE` from 7 gives 7, 8, 9, 10, and never goes above 10.
28. Percentage increase of 5 from 100 kg gives 100, 105, 110, 115, and the percentage can be changed.
29. Custom changes update the preview.
30. Manual inputs save and mark weeks as edited.
31. Edited weeks stay unchanged, and the picker says so.
32. Cancel changes nothing.
33. A blank Week 1 load stays blank, and later weeks show the planned change, such as `Set load + 5 kg`.

**Supersets**
34. Pairing two set groups shows A1 and A2 on those set groups in the grid and table.
35. The later exercise adopts the earlier one's rest, and editing either updates both. Editing the sets of one updates the other.
36. Move Up and Move Down move one exercise at a time.
37. Pairing groups with different set counts offers `Split and superset`; Bench 3 + Incline 3 with Curls 6 works as in 5.10.
38. Removing a pair, deleting a set group and deleting an exercise unpair the partner correctly.
38a. In a week where one exercise of a pair is not included, the other shows without a superset label.

**Files**
39. The draft survives a page reload.
40. Save file downloads the correct name and content.
41. Open file restores the program exactly.
42. A program with kg values shows `75% · 120 kg`.
43. Changing a load clears only that set group's kg value.
44. An invalid file shows the error and changes nothing.
45. Open file and New Program warn about unsaved changes.
46. A GymLog backup loads the Exercise List, and nothing else from it is stored.
47. The builder creates no `gymapp_` keys, and GymLog's data is unchanged.

**AI prompt**
48. The prompt contains the name and complete program JSON.
49. The blank-load warning shows the correct count.
50. The text box appears if the clipboard fails.

**End to end**
51. A real program goes through the prompt, and the AI shows the table and waits for confirmation.
52. File 1 imports into GymLog with correct workout order, labels, weights, rest and supersets.
53. A set group split imports as separate exercise entries, in order.
53a. A week-only exercise appears only in that week in GymLog, and a week with no included exercises is left out.
54. File 2 opens in the builder with its kg values.

## 11. When finished

- Provide a git commit message.
- Create `PROJECT_SUMMARY.md` in the new repo, including the data model, behaviour and testing limits.
- Update `ROADMAP.md` in the GymLog repo, marking Phase 1 as implemented.
