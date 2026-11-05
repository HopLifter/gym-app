# GymLog – Feature Spec 1.4: Program Queue

**Status:** Implemented in v59
**Roadmap item:** 1.4 Program Queue
**Build order:** Implement this before Spec 1.5.

## 1. Goal

Let the user add a new program without replacing the current one. The new program waits behind the current one and takes over automatically when the current program finishes.

Keep a permanent list of programs, so a later feature can show past programs and their workouts.

## 2. Scope

**In scope**
- Adding one Next Program behind the Current Program.
- Removing the Next Program with one action.
- Switching programs automatically.
- Keeping ended programs in a permanent saved list.
- Showing Current and Next on the Queue and Settings screens.

**Out of scope**
- A Past Programs screen (Roadmap 1.6).
- More than one waiting program.
- Generating or changing block numbers. The user types them into the import file, and the app treats them as ordinary title text.
- Renaming existing workouts.
- Adding a note to the last workout of a program that finishes normally.
- Pop-ups or banners when programs switch.
- Workout descriptions and comments (Spec 1.5).

## 3. Definitions

- **Current Program:** the active program. There is at most one.
- **Next Program:** the program waiting behind it. There is at most one.
- **Ended program:** a program that finished, or was ended manually. It stays in the saved list.
- **Queued workouts of a program:** workouts in `queue` whose `programId` matches that program's `id`.
- **Finished:** a program with no queued workouts left.

## 4. Behaviour

### 4.1 Importing

The import validation stays the same, with one addition: an empty `workouts` array shows an error in the import modal and imports nothing.

**Error text:** `This file has no workouts.`

After validation, the first matching rule applies:

| Situation | Result |
|---|---|
| No Current Program | The import becomes the Current Program. |
| Current Program is finished | The Current Program becomes ended, and the import becomes the Current Program. |
| Current Program has queued workouts, and there is no Next Program | The import becomes the Next Program. |
| A Next Program exists | Blocked with `openNotice()`. The normal UI cannot reach this state, as Settings hides the import button. |

- The `Replace current program?` confirm is removed. No program is replaced during import.
- Imported workouts are added to the end of the queue, as they are today.
- Importing never changes Today's Workout unless the queue was empty.
- The running-timer guard is not needed for import, because existing workouts do not move.
- After import, the app lands on the Queue screen, as it does today.

### 4.2 Automatic switch

Run a single helper, `syncProgramState()`, after any workout leaves the queue through Finish Workout or Delete from Queue. It also runs once at startup, after the data migration.

1. If the Next Program has no queued workouts:
   - If any of its workouts are in history, mark it ended.
   - Otherwise, delete its entry from the program list.
2. If the Current Program has no queued workouts, mark it ended.
3. If there is no longer a Current Program and a Next Program exists, the Next Program becomes the Current Program.

There is no pop-up or banner. The workout title shows that the next program has started.

Finishing the last workout does not write a note to that workout. The Finish Workout landing screen does not change.

If nothing is waiting, the app shows `No active program`.

### 4.3 Reordering the queue

The user can still move workouts freely. A Next Program workout can be moved ahead of a Current Program workout. This does not change which program is Current. The switch depends only on the Current Program running out of queued workouts.

Ad-hoc workouts have no effect on the switch.

### 4.4 Removing the Next Program

Settings shows a red `Remove Next Program` button while a Next Program exists.

First, if Today's Workout belongs to the Next Program, call `blockIfTimerRunning()`.

Then open the shared confirm modal:
- **Title:** `Remove next program?`
- **Text:** `"Program name" and its N queued workouts will be removed. Anything already logged stays in your history.`
- **Buttons:** Cancel and red `Remove`

On confirm:
- Delete all queued workouts belonging to that program.
- Run `syncProgramState()`.
- Call `setActiveToNextQueued()`, then re-render the current screen.

### 4.5 End Current Program

The existing behaviour stays, with these changes:
- The ended program stays in the saved list as ended, rather than being discarded.
- If a Next Program exists, it becomes the Current Program.
- If a Next Program exists, this sentence is added to the end of the confirm text: `"Next program name" becomes your current program.`

The running-timer guard stays unchanged. The existing `Program "X" ended here.` note on manual End Current Program also stays unchanged.

### 4.6 Restoring from History

Restore to Queue works as it does today. A restored workout does not change any program's status, even if its program has ended. That workout stays in the queue with its old `programId` and does not hold up the switch of any other program.

### 4.7 Backup and restore

- New backups include the saved program list.
- Backups made before this feature must still restore correctly (see section 6).

## 5. Screens

### 5.1 Settings: Program Management

| State | Shows | Buttons |
|---|---|---|
| No Current Program | `No active program.` | `Start New Program` |
| Current only | Current Program name | `Add Next Program`, `End Current Program` |
| Current and Next | Current Program name, Next Program name | `Remove Next Program`, `End Current Program` |

The Next Program uses the same label and name styles as the Current Program (`.program-bar-label`, `.program-bar-name`), with the label `Next Program`.

`Add Next Program` and `Start New Program` both open the existing Import Program modal.

### 5.2 Queue screen

The sticky program bar shows `Current Program` and its name. If a Next Program exists, it also shows `Next Program` and its name below that. Long names wrap.

The empty-state text and `Start New Program` button on the Workout screen do not change.

## 6. Data model

Add one localStorage key:

`gymapp_programs_v1`: an array of:

```json
{
  "id": "prog_...",
  "name": "Block 2 - Strength Cycle",
  "importedAt": "2026-11-03",
  "status": "current",
  "endedAt": "2026-12-01"
}
```

- `status` is `current`, `next` or `ended`.
- `endedAt` is an ISO date, present only on ended programs.
- Queue and history workouts do not change. `programId` remains the link between a workout and its program.

**Migration, at startup:**
- If `gymapp_programs_v1` is missing and `gymapp_program_v1` holds a program, create the list with that program as `current`.
- If both are missing, create an empty list.
- After migrating, remove `gymapp_program_v1`.
- Then run `syncProgramState()`, so a program that already has no queued workouts is marked ended.

Programs ended before this feature were never saved, so they cannot be added to the list. Their workouts stay in History as they are. Workouts with an unknown `programId` must not cause errors.

**Backups:** Add `gymapp_programs_v1` to `ALL_DATA_KEYS`, and keep `gymapp_program_v1` in it. This lets an old backup restore and then migrate on the reload. A new backup holds a null value for the old key, which removes it on restore.

## 7. Implementation notes

All code changes are in `index.html`, except the version bump in `sw.js`.

- **State:** Replace the single `program` variable with a saved list and two helpers, such as `currentProgram()` and `nextProgram()`. Update every place that reads `program`.
- **`loadProgram()` and `saveProgram()`:** Replace with versions that read and write the list.
- **`renderProgramBar()` and `renderSettings()`:** Add the Next Program display and buttons.
- **`importConfirmBtn` handler:** Remove the Replace confirm, add the empty-workouts check and apply the table in 4.1.
- **`doImport()`:** Take the status to assign. The workout-building code does not change.
- **`completeActiveWorkout()`:** Call `syncProgramState()` after the workout moves to history.
- **`confirmDeleteFromQueue()`:** Call `syncProgramState()` before `afterDelete()`. This single change covers both the Queue list and the header ⋮ menu.
- **`confirmEndProgram()` and `endProgram()`:** Mark the program ended, promote the Next Program and extend the confirm text.
- **Dialogs:** Use `openConfirm()` and `openNotice()`. Native browser dialogs must not be used.
- **Version:** Bump `APP_VERSION` in `index.html` and `CACHE_NAME` in `sw.js` together to `gym-app-cache-v59`.

## 8. Acceptance tests

**Importing**
1. With no program, an import becomes the Current Program.
2. With a Current Program that has queued workouts, an import becomes the Next Program with no Replace prompt.
3. Its workouts appear after all existing queue items, and Today's Workout does not change.
4. With a running workout timer, adding a Next Program does not affect the timer.
5. With a finished Current Program, an import becomes Current straight away and the old program is marked ended.
6. A file with an empty `workouts` array shows the error and imports nothing.
7. Invalid JSON and wrong-format errors still work.

**Screens**
8. Settings shows the correct buttons in each of the three states in 5.1.
9. The Queue bar shows Current and Next, and a long name wraps cleanly at 375px.
10. The undo banner still sits correctly under the taller Queue header.

**Automatic switch**
11. Finishing the Current Program's last workout makes the Next Program Current, with no pop-up.
12. The Finish Workout landing screen is unchanged, and the Today tab shows the next program's first workout.
13. No note is added to that last workout.
14. Deleting the Current Program's last queued workout also triggers the switch.
15. Finishing the last workout with no Next Program shows `No active program`, and the program is marked ended.
16. An ad-hoc workout left in the queue does not stop the switch.
17. Moving a Next Program workout ahead of a Current Program workout changes the order only.
18. Deleting every Next Program workout by hand clears the Next Program.

**Remove and end**
19. Remove Next Program deletes only that program's queued workouts, after the warning.
20. Cancel on that warning changes nothing.
21. Remove is blocked while Today's Workout belongs to the Next Program and its timer is running.
22. Finished workouts from a removed program stay in History.
23. End Current Program promotes the Next Program, and the warning names it.
24. End Current Program with no Next Program behaves as it does today.
25. The manual `Program "X" ended here.` note still appears.

**Data**
26. All states survive a full app reload.
27. Existing data migrates on first launch, with no change to the queue or history.
28. A new backup restores Current, Next and ended programs.
29. A backup made on v58 restores and migrates correctly.
30. Workouts with an unknown `programId` still display normally in the Queue and History.
31. Restoring a workout from an ended program works, and does not reactivate that program.
32. The Global Workout Timer, Set Progress Tracking, Export Gym Log and Exercise List behave as they did before.

## 9. When finished

- Provide a git commit message.
- Update `PROJECT_SUMMARY.md`, including the new behaviour, data model, cache version and any testing limits. Remove or mark as superseded the text describing the Replace prompt.
