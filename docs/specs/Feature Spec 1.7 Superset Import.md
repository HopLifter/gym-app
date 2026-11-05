# GymLog – Feature Spec 1.7: Superset Import

**Status:** Implemented in v62  
**Roadmap item:** 1.7 Superset Import  
**Build order:** Implement before Program Builder Phase 1.

## 1. Goal

Let a program import file define superset pairs, so they no longer have to be set up by hand after importing.

## 2. Scope

**In scope**
- An optional `superset` field on exercises in the import file.
- Pairing two adjacent exercises during import.
- Giving a pair one shared rest time.

**Out of scope**
- Supersets of more than two exercises.
- Warnings for invalid superset values.
- Changes to the superset behaviour after import.
- Changes to Export Gym Log, Backup or History.

## 3. Behaviour

### 3.1 Import file

An exercise may include a `superset` text value:

```json
{
  "label": "Block 2 - Wk1 D1",
  "exercises": [
    { "name": "Pull Ups", "sets": 3, "reps": 8, "rest": 90, "superset": "A" },
    { "name": "Dips", "sets": 3, "reps": 10, "rest": 90, "superset": "A" },
    { "name": "Barbell Row", "sets": 3, "reps": 10, "rest": 120 }
  ]
}
```

The value only has to match within the same workout. `A` in one workout has no link to `A` in another.

### 3.2 Pairing rules

Within each workout:

- Values are trimmed before comparing. Missing, blank or non-text values mean no superset.
- A pair is formed when exactly two exercises share a value, and they are next to each other.
- Both exercises get the same new `supersetId`, created with `newId("grp")`.
- The second exercise's `rest` is set to the first exercise's `rest`, matching `pairSuperset()`.

If a value is used by one exercise, by more than two exercises, or by exercises that aren't adjacent, those exercises import unpaired. The import still succeeds and shows no error, matching how the importer treats other unusual values.

The `superset` field is not saved on the exercise. Only `supersetId` is saved.

Files without the field import exactly as they do today.

## 4. Data model

No new storage key and no migration. The saved exercise shape is unchanged. `supersetId` already exists and is currently always `null` after import.

## 5. Implementation notes

All code changes are in `index.html`, except the version bump in `sw.js`.

- **`doImport()`:** After building each workout's `exercises`, run a new helper such as `applyImportedSupersets(exercises, exerciseDefs)`.
- **Helper:** Group exercise positions by trimmed `superset` value, then apply section 3.2.
- **Existing behaviour:** Rendering, Move Up/Down, Remove Superset and the Rest Timer already work from `supersetId` and adjacency, so they need no changes.
- **Version:** Bump `APP_VERSION` in `index.html` and `CACHE_NAME` in `sw.js` together to `gym-app-cache-v62`.

## 6. Acceptance tests

1. Two adjacent exercises with `superset: "A"` import as a pair.
2. The pair shows in the shared bordered group on the Workout screen.
3. The pair shows the superset line in the condensed History view after the workout is finished.
4. The second exercise's rest changes to match the first.
5. Changing rest on either exercise updates both.
6. Move Up and Move Down move the pair together.
7. Remove Superset clears both exercises.
8. The Rest Timer shows both names and uses the tapped exercise's set count.
9. Two different pairs in one workout import correctly.
10. The same letter in two different workouts creates two separate pairs.
11. Three exercises with the same value import unpaired, and the import succeeds.
12. One exercise with a value imports unpaired.
13. Two non-adjacent exercises with the same value import unpaired.
14. Blank, whitespace-only and non-text values import unpaired.
15. A file with no `superset` fields imports exactly as it did before.
16. Export Gym Log shows the existing `(Superset A)` tag for imported pairs.
17. A backup and restore keeps imported pairs.

## 7. When finished

- Provide a git commit message.
- Update `PROJECT_SUMMARY.md`, including the new behaviour, cache version and any testing limits.
- Update `ROADMAP.md`, marking 1.7 as implemented.
- Update `Program Import Format`: add `superset` to the Exercise table and remove Supersets from section 5.
