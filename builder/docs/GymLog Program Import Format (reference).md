# GymLog – Program Import Format

How to format a program so GymLog can import it. You can give this document to Claude along with your spreadsheet and ask for the JSON.

**Applies to:** the app as of v62, including the `description` field (v60) and the `superset` field (v62).

## 1. How to import

Go to Settings → Program Management, then open the import screen. Either paste the JSON or choose a `.json` file.

- Before Spec 1.4 is built, the button is `Start New Program`, and importing replaces your current program.
- After Spec 1.4, the button is `Add Next Program` when you have a current program, and your current program is kept.

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
        { "name": "Bench Press", "sets": 3, "reps": 5, "weight": 97.5, "rpe": 7.5, "rest": 180, "notes": "" },
        { "name": "Pull Ups", "sets": 3, "reps": 8, "rest": 90 }
      ]
    },
    {
      "label": "Block 2 - Wk1 D2",
      "description": "Deadlift + Volume Bench",
      "exercises": [
        { "name": "Deadlift", "sets": 3, "reps": 3, "weight": 170, "rpe": 8.5, "rest": 300, "notes": "" }
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
| `description` | No | Text | Nothing is shown. Needs Spec 1.5. |
| `exercises` | Recommended | List | The workout has no exercises. |

The file needs at least one workout. Once Spec 1.4 is built, an empty list is rejected.

### Exercise

| Field | Required | Format | If left out |
|---|---|---|---|
| `name` | Recommended | Text | Shows `Exercise`. |
| `sets` | Recommended | Whole number | `3` |
| `reps` | Recommended | Whole number | `10` |
| `weight` | No | Number, in kg | `0` |
| `rpe` | No | Number | Blank |
| `rest` | No | Number, in **seconds** | `60` |
| `notes` | No | Text | Blank |
| `superset` | No | Text, such as `"A"` | Not part of a superset. Needs Spec 1.7 (v62). |

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

The app shows `Invalid JSON — couldn't parse the file.` when the file can't be read. It shows `Expected { "program": { "name": ... }, "workouts": [...] }` when `program`, its `name` or `workouts` is missing.

## 7. Prompt for converting a spreadsheet

Attach your spreadsheet and this document, then use:

> Convert this spreadsheet into a GymLog program JSON file, following the Program Import Format document. Program name: [name]. Block number: [number]. Use the title format `Block [number] - Wk[week] D[day]`, and write a short description for each workout based on its main lifts. Rest must be in seconds. Check that the JSON is valid, and tell me how many workouts it contains.
