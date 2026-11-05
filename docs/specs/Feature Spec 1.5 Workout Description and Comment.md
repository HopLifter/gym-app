# GymLog – Feature Spec 1.5: Workout Description and Comment

**Status:** Implemented in v60. The comment box wording changed in v61: see `PROJECT_SUMMARY.md`.
**Roadmap item:** 1.5 Workout Description and Comment
**Build order:** Implement after Spec 1.4.
**Chosen design:** Option B, comment at the top of the page

## 1. Goal

Add two pieces of text to each workout:
- **Description:** a short summary set in the import file, such as `Squat + Heavy Bench`.
- **Comment:** a journal entry the user writes, such as `Slept 5 hours. Got carried away chatting, so this ran long.`

## 2. Scope

**In scope**
- An optional `description` field in the program import file.
- Showing the description on the Workout and Queue screens.
- An editable comment box on each workout.
- Showing the comment on Past Workouts.

**Out of scope**
- Editing the description in the app.
- Changing workout titles or adding block numbers.
- Adding the comment or description to Export Gym Log.
- Searching comments.
- Changes to the existing per-exercise Notes field.
- Changes to the existing workout `note` field.

## 3. Behaviour

### 3.1 Description

**Import:** Each workout in the import file may include a `description` string:

```json
{
  "label": "Block 2 - Wk1 D1",
  "description": "Squat + Heavy Bench",
  "exercises": []
}
```

- The value is trimmed and saved on the workout.
- Missing, blank or non-text values count as no description.
- Files without this field import exactly as they do today.

**Workout screen:** The description sits directly below the title, inside the sticky header, on Today's Workout, peeked Queued Workouts and Past Workouts.
- It is read-only in every view, including History edit mode.
- It wraps onto a second line if needed.
- With no description, nothing is shown and the header keeps its current height.

**Queue screen:** The second line of a queue item shows the description. Without one, it shows the existing text (`Program workout` or `Ad-hoc`).

**History list:** No change. The second line remains the date.

### 3.2 Comment

Every workout has one comment, including ad-hoc workouts.

**Editable views (Today's Workout, peeked Queued Workouts):**
- A box labelled `Workout comment` sits at the top of the page content, above the first exercise card.
- It is below the sticky header, so it scrolls away with the page.
- It is one line tall when empty, and grows with its content.
- The placeholder is `How did today go?`
- It saves automatically on every change, like the other editable fields.

**Past Workout, viewing:**
- The comment appears below the exercise table, with the label `Workout comment`.
- It is read-only and keeps the user's line breaks.
- If the comment is empty, the whole section is hidden.

**Past Workout, editing:**
- The same box appears above the exercise cards, as in the editable views.
- Changes go through `historyEditDraft`. Save keeps them, and Leave discards them.

### 3.3 Moving through the app

The description and comment stay on the workout in each of these actions:
- Reordering the queue.
- Finishing a workout.
- Restoring a workout to the queue.

Deleting a workout deletes both.

### 3.4 Backup and export

- Both fields are saved within the workout, so Backup All Data and Restore from Backup include them with no code changes.
- Export Gym Log does not change.
- Recent Performance does not change.

## 4. Visual design

**Description**
- 13px, regular weight, `--text-dim`.
- Sits close below the title.

**Comment box**
- Uses the existing global `textarea` style.
- The label uses the 11px `--text-dim` style of the exercise field labels.
- Automatic height replaces the manual resize handle, so set `resize: none`.
- It sits 12px above the first exercise card.

**Comment on the Past Workout view**
- Uses the 14px `--text` body text style and `white-space: pre-wrap`.
- Sits below the table, with a top margin matching the table's spacing.

## 5. Data model

Two new optional text fields on queue and history workouts:

```json
{
  "description": "Squat + Heavy Bench",
  "comment": "Slept 5 hours."
}
```

- No new localStorage key and no migration. A missing field means empty.
- `comment` is separate from the existing `note` field on purpose. `endProgram()` overwrites `note`, and `restoreWorkoutToQueue()` deletes it.

## 6. Implementation notes

All code changes are in `index.html`, except the version bump in `sw.js`.

- **`doImport()`:** Save the trimmed `description` when it is a non-empty string.
- **`renderWorkoutHeader()`:** Fill and show the description element, and hide it when empty.
- **`renderEmptyHeader()`:** Hide the description element.
- **`renderQueueList()`:** Use the description on the second line, with the existing text as the fallback.
- **Comment box:** Add it as a static element in `#workoutBody`, above `#workout`, not inside the re-rendered exercise cards. Follow the `dayTitle` pattern: only write its value when it does not have focus, so typing is never interrupted.
- **Comment input handler:** Write to `getActiveWorkout().comment`, then call `saveActiveWorkout()`. This already handles the History draft. Do not call `render()` on each keystroke.
- **Auto-height:** Set the height from `scrollHeight` on input and after rendering. Reset it first, so the box can also shrink.
- **`isCondensedHistoryView()`:** Hide the box in this view.
- **`renderCondensedExercises()`:** Add the read-only comment after the table, including in the "No exercises logged." case. Treat whitespace-only comments as empty. Use `escapeHtml()` or `textContent`.
- **Header height:** Do not hard-code it. `positionUndoBanner()` already reads the header's real height.
- **Version:** Bump `APP_VERSION` in `index.html` and `CACHE_NAME` in `sw.js` together to `gym-app-cache-v60`.

## 7. Acceptance tests

**Description**
1. An import with descriptions shows them below the title on Today's Workout.
2. They also show on peeked Queued Workouts and Past Workouts.
3. The Queue list shows the description on the second line.
4. A workout without a description shows `Program workout` in the Queue, and no blank line on the Workout screen.
5. Ad-hoc workouts still show `Ad-hoc`.
6. A file without `description` imports as it does today.
7. The description cannot be edited, including in History edit mode.
8. A long description wraps cleanly at 375px, and the undo banner still sits below the header.

**Comment**
9. The box appears above the first exercise on Today's Workout and peeked Queued Workouts.
10. It works on ad-hoc workouts and workouts with no exercises.
11. Typing saves automatically and does not lose focus.
12. The box is one line when empty, grows as text is added, and shrinks when text is removed.
13. The comment survives a full app reload.
14. It appears below the table on the Past Workout view, with line breaks kept.
15. With no comment, nothing extra shows on the Past Workout view.
16. Editing it in History and pressing Save keeps the change.
17. Editing it in History and choosing Leave discards the change.
18. Finishing a workout keeps its comment and description.
19. Restore to Queue keeps both, and the comment is editable again.
20. Special characters such as `<`, `&` and quotes display correctly.
21. A backup and restore keeps both fields.
22. Existing workouts with neither field display and behave normally.
23. Export Gym Log output is unchanged.
24. The Global Workout Timer, Set Progress Tracking and Program Queue behave as they did before.

## 8. When finished

- Provide a git commit message.
- Update `PROJECT_SUMMARY.md`, including the new behaviour, data model, cache version and any testing limits.
