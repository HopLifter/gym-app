# GymLog – Program Import Format

How to format a program so GymLog can import it. You can give this document to Claude along with your spreadsheet and ask for the JSON. The Program Builder's "Export for GymLog" button writes this format for you.

**Applies to:** the app as of v73, including the `description` field (v60), the `superset` field (v62) and the import check (v73).

## 1. How to import

Go to Settings → Program Management, then open the import screen. Either paste the JSON or choose a `.json` file.

- With no current program, the button is `Start New Program`, and the import becomes your Current Program.
- With a current program, the button is `Add Next Program`, and your current program is kept. The import waits behind it as the Next Program. If the current program has no queued workouts left, the import ends it and becomes the Current Program instead.
- With a Next Program already waiting, the button is hidden until you remove it.

**Check Import (v73).** After "Check File", a full screen shows the file before anything changes:

- The program name. You can change it.
- **Names to Check.** A name on your Exercise List (capitals ignored) uses the list spelling. A name that is the same as a list name when capitals, dots, spaces, dashes and a last "s" are ignored uses the list name ("Conv. Deadlifts" → "Conv. Deadlift"). Other names stay as in the file and go on the Exercise List at import. Tap a name to choose a different one.
- **Values to Check.** RPE that is not a whole number from 1 to 10, sets or reps that are not a whole number from 1 to 100, and a weight or rest that is not a number. The import can still continue.
- The workouts. Tap one to see its exercises.

After the import, the message bar shows Undo for 8 seconds. Undo removes the program, its workouts and the names that the import put on the Exercise List.

## 2. Basic structure

The file is one JSON object with two parts: `program` and `workouts`.

```json
{
  "program": { "name": "Block 2 - Strength Cycle" },
  "workouts": [
    {
      "label": "Block 2 - Wk1 D1",
      "description": "Squat + Heavy Bench",
      "exercises": [
        { "name": "Back Squat", "sets": 4, "reps": 5, "weight": 140, "rpe": 8, "rest": 240, "notes": "Keep the bar speed up." },
        { "name": "Bench Press", "sets": 3, "reps": 5, "weight": 97.5, "rpe": 7, "rest": 180, "notes": "" },
        { "name": "Pull Ups", "sets": 3, "reps": 8, "rest": 90 }
      ]
    },
    {
      "label": "Block 2 - Wk1 D2",
      "description": "Deadlift + Volume Bench",
      "exercises": [
        { "name": "Deadlift", "sets": 3, "reps": 3, "weight": 170, "rpe": 8, "rest": 300, "notes": "" }
      ]
    }
  ]
}
```

Workouts appear in the Queue in the same order as the file.

## 3. Fields

### Program

| Field | Required | Format | Notes |
|---|---|---|---|
| `name` | Yes | Text | Shown as the Current or Next Program. |

### Workout

| Field | Required | Format | If left out |
|---|---|---|---|
| `label` | Recommended | Text | Shows `Workout`. |
| `description` | No | Text | Nothing is shown. |
| `exercises` | Recommended | List | The workout has no exercises. |

The file needs at least one workout. An empty list is rejected.

### Exercise

| Field | Required | Format | If left out |
|---|---|---|---|
| `name` | Recommended | Text | Shows `Exercise`. |
| `sets` | Recommended | Whole number | `3` |
| `reps` | Recommended | Whole number | `10` |
| `weight` | No | Number, in kg | `0` |
| `rpe` | No | Whole number from 1 to 10 | Blank |
| `rest` | No | Number, in **seconds** | `60` |
| `notes` | No | Text | Blank |
| `superset` | No | Text, such as `"A"` | Not part of a superset. |

The app ignores any other fields.

**Supersets:** Give two exercises that sit next to each other the same `superset` value, for example `"A"`. They import as a superset pair and share one rest time, taken from the first exercise. The value only has to match within the same workout, so `A` in one workout is unrelated to `A` in another. If a value is used by only one exercise, by three or more, or by exercises that aren't next to each other, those exercises import unpaired with no error.

## 4. Conventions

**Block numbers:** The app does not add these. Put them in `label`, for example `Block 2 - Wk1 D1`, and keep the block number the same for the whole file. Using it in the program `name` too makes programs easy to tell apart.

**Description:** Keep it short, as it sits under the title on your phone. For example: `Squat + Heavy Bench`.

**Rest:** Use seconds in the file. The app shows minutes, so `240` appears as 4 minutes.

**Decimals:** Use a period in the file, such as `97.5`. A comma, such as `97,5`, is not valid JSON.

**Exercise names:** Spell each exercise the same way every time. Recent Performance finds past results by name, so `Bench` and `Bench Press` count as different exercises. Import does not add new names to your Exercise List.

**Workout comments:** Leave these out. You write them in the app, so they aren't part of the import file.

## 5. What can't be imported

**Dates:** Workouts have no planned date. A workout's date is set when you finish it.

## 6. Common mistakes

These are the mistakes that stop a file from importing or give unexpected results:

- A comma after the last item in a list or object.
- A missing comma between items.
- Straight double quotes replaced with curly ones. Use `"`, not `“`.
- A double quote inside text that isn't escaped. Write `\"` instead.
- Rest entered in minutes, which turns a 4-minute rest into 4 seconds.
- Numbers wrapped in quotes. Use `5`, not `"5"`.

The app shows `Invalid JSON — couldn't parse the file.` when the file can't be read. It shows `Expected { "program": { "name": ... }, "workouts": [...] }` when `program`, its `name` or `workouts` is missing. It shows `This file has no workouts.` when `workouts` is empty.

## 7. Prompt for converting a spreadsheet

Attach your spreadsheet and this document, then use:

> Convert this spreadsheet into a GymLog program JSON file, following the Program Import Format document. Program name: [name]. Block number: [number]. Use the title format `Block [number] - Wk[week] D[day]`, and write a short description for each workout based on its main lifts. Rest must be in seconds. Check that the JSON is valid, and tell me how many workouts it contains.
