# GymLog – Feature Spec 2.1: Program Builder Phase 2 (Reuse and Coaching Tools)

**Status:** Reviewed (6 November 2026); all questions decided and the Library mockup approved (`docs/mockups/Program Builder Library - Athlete-centred (revised).html`). Ready to build, step 1 first. Nothing is built yet.
**Applies to:** `builder/index.html` only. GymLog itself does not change: new fields reach the phone through the existing `notes`, `rpe` and `weight` import fields.
**Builds on:** `Feature Spec 2.1 Program Builder Phase 1.md` (the "Phase 1 spec") and `builder/PROJECT_SUMMARY.md`. Where this spec does not mention something, Phase 1 behaviour stays.
**Source of the ideas:** coach feedback, `ROADMAP.md` section 2.1 ("Coach feedback, 6 November 2026").

## 1. Goal

Let a coach build a block once, reuse it for many athletes, and use the tools coaches actually program with. Concretely:

- Keep every program, template and athlete profile in a library inside the browser, with a full export and import as the backup.
- Make a template (structure and prescriptions, no kg) and an athlete profile (1RMs, rounding), and generate a finished program with kg values from the two.
- Write the GymLog import file directly from the builder.
- Add coaching fields and progression tools.
- Add duplication, saved versions, and charts of weekly workload.

## 2. Scope

**In scope (steps 1 to 7):**

1. Library: programs, templates and profiles in the browser, plus export and import of everything.
2. Coaching fields: RIR (target and load type), set type, rep range, tempo, pause length, week flags.
3. Reference lifts and athlete profiles (with an optional training max and a list of exercises the athlete cannot do).
4. Templates, Generate, and writing the GymLog import file.
5. Progression tools, six sub-steps in the agreed order.
6. Duplication (week, workout, program) and manual version snapshots.
7. Metrics charts (sets, tonnage, average intensity per lift per week).

**Out of scope (later):** body heat map by muscle group, cluster sets, band and chain tension, block phase names, autoregulation rules, an RPE-chart load estimate, drag-and-drop reordering, dragging a template onto an athlete (a later shortcut for `Use for athlete…`), printable or PDF program, comments per week, multi-athlete dashboard, mobile layout, automatic snapshots, undo and redo, an automated test suite, and any change to GymLog or its import format.

## 3. Decisions already made

These come from the coach feedback session and this planning session. Do not reopen them while building.

| Topic | Decision |
|---|---|
| Template vs profile | One feature. A template has no kg. A profile holds 1RMs. Template + profile = program. |
| Template format | A template is a program in the Phase 1 format with every `kg` null, plus a `refLift` on each exercise. No second format. |
| RPE and blank loads | Stay blank after Generate. The coach or athlete fills them in. |
| Percentage base | Each exercise has a **reference lift**. Percent loads use that lift's 1RM, or its training max if the profile says so. |
| Accessories | Three tiers: variations use a main lift's 1RM; other lifts the coach wants by % are added to the profile as extra lifts; true accessories have no reference and use kg, RPE or blank. See section 7. |
| Storage | Everything lives in the browser library. "Export everything" and "Import everything" protect against the browser losing data. |
| Programs | All programs go in the library, not only templates and profiles. |
| Library layout | Athlete-centred (mockup option C, adjusted): templates at the top, athletes below as collapsible blocks that hold their programs. Coach flow: make templates, add an athlete, apply a template to the athlete, and the new program appears under that athlete. |
| Applying a template | Click first (`Use for athlete…`); drag onto an athlete comes later. The generated program is saved to the library immediately. |
| Coaching fields in GymLog | Written automatically into the exercise `notes` on export. No GymLog change. |
| Training max | Included, simple version: optional per lift, and the profile says which value percentages use. |
| Versions | Manual snapshots only ("Save version"), at most 10 per program (to protect browser storage). |
| RIR | A separate field from RPE, not a display mode. A set group has one effort target, RPE or RIR. RIR is also a fourth load type (kg, %, RPE, RIR). On the phone the RPE field stays blank and the RIR is written into the exercise notes. |
| Deload | A deload week does not use up a progression step: the next week continues as if the deload had not happened. |
| Gym resources | Each athlete profile holds a list of exercises the athlete cannot do (default: everything in the Exercise List is available). Generate flags them; the exercise picker hides them. Automatic substitution is out of scope. |
| Progression tool order | 1 percentage ramp, 2 per-week table, 3 deload flag, 4 top set + back-offs, 5 wave loading, 6 rep progression in a range. |
| Units and dates | kg always, dd/mm/yyyy always, no native `alert()`, `confirm()` or `prompt()`. |

## 4. Key concepts

- **Library:** the saved collection of programs, templates, profiles and versions.
- **Template:** a reusable program with no kg values. Shown with its own list and its own metrics.
- **Athlete profile ("profile"):** a name, a list of **lifts** (name, 1RM, optional training max, which of the two percentages use) and the **rounding step** (default 2.5 kg).
- **Reference lift:** the name of a profile lift an exercise's percentages are based on, and the lift its sets and tonnage are counted under in the charts. Optional.
- **Generate:** turn a template and a profile into a new program. The result is an ordinary program.
- **Live kg:** a program linked to a profile always shows kg for its percentage set groups, recalculated after every edit.
- **Version:** a saved copy of one program at one moment, which can be restored.

## 5. Impact on the data model

All changes are additive. Existing Phase 1 files and drafts open unchanged: missing fields read as `null` or their default.

**Program** (file `version` becomes 2; `isValidProgram` accepts 1 and 2, and a newer number is still rejected):

| New field | Type | Meaning |
|---|---|---|
| `weekFlags` | array of `null` or `"deload"` / `"test"` / `"comp"`, length = `weeks` | Step 2. Grows and shrinks with the week count. |
| `deloadRule` | `{ setsPct, loadPct }` | Step 5.3. Default `{ setsPct: 60, loadPct: 90 }`. |
| `source` | `null` or object | Step 4. `{ templateId, templateName, profileId, profileName, generatedOn }`. |
| `profileUsed` | `null` or object | Step 4. Copy of the lifts used: `{ lifts: [{name, base, value}], rounding }`. |

**Exercise:** `refLift` (text or `null`).

**Set group** (in each week's `groups[]`):

| New field | Type | Meaning |
|---|---|---|
| `rir` | number (0 to 10) or `null` | Step 2. Effort target in reps in reserve, for kg loads only (decided 8 November 2026; an older % load that already has a target keeps showing it so it can be cleared). A group has either `rpe` or `rir`, never both. It is `null` when `loadType` is `rir` or `rpe`. |
| `loadType` | adds `"rir"` to `kg`, `pct`, `rpe` | Step 2. With `rir`, `load` is the RIR value, and `rpe` and `rir` (the targets) are `null`. `kg` may still be filled in (as for an RPE load). |
| `setType` | `null` or `"warmup"`, `"top"`, `"backoff"`, `"amrap"`, `"drop"` | Step 2. |
| `repsMax` | number or `null` | Step 2. `reps` is the lower end. When set it must be above `reps`. |
| `tempo` | text or `null` | Step 2. Up to 12 characters, such as `3-1-1-0`. |
| `pause` | seconds or `null` | Step 2. Pause length in the bottom position. |
| `loadFrom` | `null` or `{ group, pct }` | Step 5.4. This group's load is `pct` percent of set group number `group` (any other group of the same exercise and week; no loops). |

**Pattern** (`patterns[]`, one per Week 1 set group) gains kinds: `ramp` (`end`, step 5.1), `wave` (`length`, `offsets[]`, `reps[]` optional, `bump`, step 5.5). A new parallel array `repPatterns[]` (one per set group; `{ kind: "same" }` or `{ kind: "range", min, max, loadAdd }`) holds step 5.6.

**Library** (browser storage; the key names are final):

| Key | Holds |
|---|---|
| `builder_programs_v1` | array of `{ id, name, modified, program }` |
| `builder_templates_v1` | not used. Decided 8 November 2026: a template is stored in `builder_programs_v1` as an entry with `kind: "template"` (programs have `kind: "program"`, or no `kind` in older data). Same editor, same Open, Duplicate, Rename, Export, Delete. A template has its calculated kg values cleared. |
| `builder_profiles_v1` | array of profile objects (see 6.2) |
| `builder_versions_v1` | array of `{ id, programId, savedOn, note, program }`, at most 10 per program |
| `builder_open_v1` | `{ kind: "program" or "template", id }` of the item open in the editor |

`builder_draft_v1` (Phase 1) is read once on first load. Its program is moved into the library as a program named after it, then the key is left alone, never deleted. `builder_exercise_list_v1` and `builder_detail_height_v1` stay as they are. The rule stays: the builder never reads or writes a `gymapp_` key.

**Storage size.** Browsers allow roughly 5 MB per site for this kind of storage. By estimate (not yet measured), a large 12-week program (5 workouts, 8 exercises each) is about 125 KB, so programs and templates alone leave plenty of room. Versions are the main consumer: 10 snapshots of one large program are about 1.25 MB. Step 1 measures a real program from the user's block and replaces this estimate. Step 1 includes a storage meter and a warning at 80%. If this becomes a real limit, moving the library to IndexedDB is a self-contained later change, because all library reads and writes go through one small set of functions (see section 12).

**Personal data.** Profiles hold athletes' lifts. The repo and its Pages site are public. A library export must never go into the repo: step 1 adds `*library*.json` to `.gitignore`.

## 6. Behaviour

### Step 1 – Library, export and import of everything

**Goal:** replace the single draft with a library, without losing Phase 1 behaviour.

**1.1 Library screen (athlete-centred layout, chosen from the mockup options).** A `Library` button in the header opens a full-page screen (Back returns to the editor). From top to bottom:
- **Header bar:** Back, title, Import everything, Export everything.
- **Templates** (at the top): a list, newest edited first, with `+ New template`. A row shows the name, the last edited date (dd/mm/yyyy), `Weeks × workouts/week`, and the buttons `Use for athlete…`, Open, Duplicate, Rename, Delete, Export.
- **Athletes:** one block per athlete, with `+ New athlete` and an `Expand all` / `Collapse all` button beside it. The button is one control whose label follows the state: `Expand all` while any athlete is collapsed, `Collapse all` once every athlete is expanded. It does not affect the "Not linked to an athlete" section. A block shows the name, the main lifts (for example `Squat 200 · Bench 130 · Deadlift 240`), a count such as `4 programs`, and the buttons `Edit profile` and `New program…`. **Blocks are collapsed by default**, except the athlete whose program was edited last. Expanding a block lists that athlete's programs, newest edited first, each with Open, Duplicate, Rename, Delete, Export. A program that is open in the editor is marked `Open now`.
- **Not linked to an athlete** (programs only; collapsed by default; hidden when empty): programs without an athlete, for example Phase 1 programs. **This section is temporary.** Once programs are made from templates and athletes it empties out, so it is kept minimal and easy to remove: it is drawn by one function (`renderUnlinkedSection`) with one call from the Library screen, has no buttons of its own beyond the normal program buttons, and there is no `Link to athlete…` action. Removing it later means deleting that function and its call. Step 1's single program list is this same section.
- **Footer:** `Last exported` and the storage meter.
- **Empty first visit:** with nothing in the library the screen shows one prompt, `Create your first template`, and a second button `Import (restore backup)`.
- **Build order.** The screen grows with the steps. Step 1 builds the screen, the footer and a single list of programs (the "Not linked to an athlete" section). Step 3 adds the Athletes section with profiles. Step 4 adds Templates and `Use for athlete…`, and from then on a generated program appears under its athlete. The layout above is the finished result.
- Dragging a template onto an athlete is a later shortcut for `Use for athlete…` (see section 2, out of scope). It is not part of step 1.

**1.2 Autosave replaces the draft.** The open program saves into its library entry after every edit (what `changed()` does today for the draft). New Program creates a new library entry. There is no "unsaved changes" warning for the library; the warning stays only where a file is replaced (Open file with a program that has changed since its last export). Save file and Open file keep working as Phase 1 describes. Open file adds the file's program to the library as a new entry instead of replacing the open one.

**1.3 Delete.** Asks first (`Delete "<name>"? This cannot be undone.`). Deleting a program also deletes its versions (the dialog says how many).

**1.4 Export everything.** One file, `GymLog-Builder-Library-YYYYMMDD.json`, format `gym-builder-library`, version 1, holding all programs, templates, profiles, versions and the Exercise List. A line on the Library screen shows `Last exported: dd/mm/yyyy` (stored in `builder_lastexport_v1`) and turns amber after 14 days or if never exported.

**1.5 Import everything.** Choose a file. It is checked as strictly as Phase 1 program files (size limit 20 MB, shape check on every item, duplicate ids, newer version rejected). Then a dialog shows the counts and offers: **Add as copies** (default; every item gets a new id, and `(imported)` is added to a name only if that name already exists) or **Replace everything** (confirms first, red button). Invalid file: `This file can't be opened.` and nothing changes.

**1.6 Storage meter.** Library footer: `Browser storage: 1.2 MB of about 5 MB`. A failed write (quota) shows a notice that the last change was not saved and offers Export everything. The page keeps working in memory.

**1.7 Migration.** On first load with no library, a Phase 1 draft becomes a program in the library (see section 5). No draft: a new empty program.

**Build progress.** Step 1 is built in two stops. Stop 1 (built 6 November 2026): 1.1 (single program list), 1.2, 1.3, 1.6 meter, 1.7, and Export per program. Stop 2 (built 6 November 2026, awaiting user test): 1.4 and 1.5 (Export / Import everything, Last exported), the storage-full notice with an Export everything button, T1.12. Step 1 is then complete apart from the template-dependent tests. An empty library cannot happen yet: deleting the last program creates a new empty one.

**Acceptance tests**
- T1.1: A Phase 1 draft present on first load appears as one program in the library, and the editor opens it.
- T1.2: Editing then reloading keeps the edit with no manual save.
- T1.3: New creates a separate entry; opening the first still shows its own content.
- T1.4: Duplicate creates a copy with a new id, named `<name> copy`.
- T1.5: Delete asks first; Cancel keeps it; confirming removes it and its versions.
- T1.6: Export everything then Import with Replace gives back identical programs, templates, profiles and versions.
- T1.7: Import with Add as copies keeps existing items and adds the imported ones with new ids.
- T1.8: A file with a broken item is refused with the message and changes nothing.
- T1.9: `Last exported` shows today's date after an export and amber if it is older than 14 days.
- T1.10: Fill storage artificially: the notice appears and editing continues.
- T1.11: No `gymapp_` key is read or written.
- T1.12: `.gitignore` blocks `*library*.json`.
- T1.13 (from step 4, because it offers `Create your first template`): With nothing in the library (and no Phase 1 draft) the Library shows `Create your first template` and `Import (restore backup)`, and nothing else.
- T1.14: Footer shows `Last exported` and the storage meter on every state of the screen.
- T1.15 (from step 3): An athlete block starts collapsed unless it holds the last edited program; clicking the heading expands and collapses it, and the choice is remembered while the screen stays open.
- T1.15a (from step 3): `Expand all` opens every athlete block and the button then reads `Collapse all`; collapsing one block by hand turns it back to `Expand all`; `Collapse all` closes them all.
- T1.16 (from step 4): A program generated for an athlete appears under that athlete, not in `Not linked to an athlete`.

### Step 2 – Coaching fields

**Goal:** the cheap options, all as fields with no new calculations.

**2.1 RIR (reps in reserve).** RIR is a separate field from RPE. It works in two ways, per set group:
- **As an effort target** next to a kg load (not next to a % load: decided 8 November 2026). The set group's `Target` control chooses `RPE`, `RIR` or none. Only one is stored (`rpe` or `rir`); switching clears the other.
- **As a load type**, a fourth choice beside kg, % and RPE, for sets where the load itself is chosen by feel (for example 3 × 8 at RIR 2, weight blank). The load is the RIR value (0 to 10, whole or half steps).
- **Patterns for the RIR load type:** `Same every week`, `−1 RIR per week` (never below 0), `Set each week manually`. A custom step is not offered, as for RPE.
- Switching a group's load type to or from RIR follows the existing load-type switching rule (asks first if values exist; edited weeks can be kept or cleared).
- **On the phone:** the GymLog `rpe` field stays blank for RIR, and `weight` is blank for the RIR load type. The prescription is written into the exercise notes (2.7), for example `RIR 2`.
- The grid, the table and the AI prompt show and describe RIR as its own value, never converted to RPE.

**2.2 Set type.** Per set group: none, Warm-up, Top set, Back-off, AMRAP, Drop set. Shown as a short badge in the grid, the table and the week editor. No calculation depends on it in this step (step 5.4 uses it).

**2.3 Rep range.** Per set group, an optional upper number. The week editor shows `Reps` and `to` (blank = a fixed number). Shown as `8–12`. `reps` stays the lower end, and the GymLog file gets that number, with the range in notes (2.7).

**2.4 Tempo.** Per set group, free text up to 12 characters (suggested format `3-1-1-0`). **2.5 Pause.** Per set group, seconds (0 to 30), shown as `2 s pause`.

**2.6 Week flags.** At the right of each week heading in the grid, a grey flag icon; clicking it opens a small menu: None, Deload, Test, Competition. A flagged week shows the flag name and icon in the flag's colour (amber, blue, green), with no drop-down arrow. Deload only labels the week in this step (5.3 adds the behaviour).

**2.7 Export of coaching fields.** Anything set is joined into the exercise `notes` in this fixed order, separated by ` · `, before the coach's own notes: `Top set · RIR 2 · 8–12 reps · Tempo 3-1-1-0 · 2 s pause`. For a group that has a load type of RIR, the `RIR 2` there is the whole prescription of the load. For an RPE target the value goes in the GymLog `rpe` field, not in notes. GymLog shows `notes` already, so nothing changes in the app. The builder's AI prompt (and `HOW TO READ THE PROGRAM JSON`) describes the new fields in this step's commit, as WORKFLOW requires.

**Build progress.** Step 2 is built in three stops. Layout chosen from the mockup (`docs/mockups/Program Builder Coaching Fields - Options.html`): week editor option B (core fields on one line, a second line for set type, tempo and pause shown only when used or after one click); grid display 1 (set-type badge before the prescription, a dim detail line for tempo and pause only when used). Stop 1 (built 7 November 2026, awaiting user test): rep range, RPE or RIR target (as a target only), set type, tempo and pause, in the week editor and the grid; Phase 1 files migrate. Stop 2 (built 7 November 2026, awaiting user test): RIR as a fourth load type (`-1 RIR per week`, never below 0), set-type badge moved to the right of the load, and the AI prompt (and Phase 1 spec section 7) updated for all the new fields. Stop 3 (built 8 November 2026, awaiting user test): week flags (Deload, Test, Competition) as a small control in each week heading; the AI prompt adds the flag to that week's workout descriptions.

**Data:** the set group, program and week-flag fields in section 5. Adding or removing a week adds or removes a flag entry. Phase 1 files open with all new fields empty.

**Acceptance tests**
- T2.1: A kg set group can have an RPE target or an RIR target; setting one clears the other. RIR 2 is stored as `rir: 2` and `rpe: null`, and never becomes RPE 8.
- T2.1a: The RIR load type shows `RIR 2` in the grid and table; `−1 RIR per week` gives 3, 2, 1, 0, 0 over five weeks and never goes below 0.
- T2.1b: The exported GymLog file has no `rpe` and no `weight` for an RIR load, and the notes contain `RIR 2`.
- T2.2: A set group can be given each set type and clears back to none.
- T2.3: Rep range 8 to 12 shows `8–12`; an upper number not above the lower is refused with a message.
- T2.4: Tempo accepts `3-1-1-0` and refuses more than 12 characters.
- T2.5: Week flags appear on the right week, and change when weeks are added or removed.
- T2.6: A Phase 1 file opens with no new data and saves back valid.
- T2.7: Copy AI prompt includes the new fields, and the prompt text in the spec matches.

### Step 3 – Reference lifts and athlete profiles

**Goal:** the building blocks for Generate.

**Build progress.** Step 3 is built in two stops. Stop 3a (built 8 November 2026, awaiting user test): athlete profiles (3.2, 3.3, 3.4, 3.6): storage, the Athletes section of the Library, the profile screen (layout B, two columns, chosen from `docs/mockups/Program Builder Athlete Profile - Options.html`), the unavailable-exercises list, and profiles in Export and Import everything. Stop 3b: the reference lift on exercises (3.1). Using the unavailable list inside programs (3.6 b to d) waits for step 4, which links a program to an athlete.

**3.1 Reference lift on an exercise.** A `Reference lift` field in the Add exercise modal and in the table's exercise cell. It is a dropdown with the profile lift names (or the standard three if no profile is open), `None`, and `Other…` (free text). It applies to every set group of the exercise and is optional for kg and RPE loads (used for the charts). A % set group on an exercise with no reference lift shows a small warning `No reference lift`. Existing exercises default to none.

**3.2 Athlete profile.**
```json
{
  "format": "gym-builder-profile",
  "version": 1,
  "id": "pr_1",
  "name": "Sam Lee",
  "modified": "2026-11-06",
  "rounding": 2.5,
  "unavailable": ["Leg Press", "Hack Squat"],
  "lifts": [
    { "name": "Back Squat", "oneRm": 200, "trainingMax": 185, "base": "tm" },
    { "name": "Bench Press", "oneRm": 130, "trainingMax": null, "base": "1rm" },
    { "name": "Deadlift", "oneRm": 240, "trainingMax": null, "base": "1rm" }
  ]
}
```
- `base` says whether percentages use `oneRm` or `trainingMax`. `base: "tm"` needs a training max.
- A new profile starts with Back Squat, Bench Press and Deadlift (blank values). The coach can add, rename, reorder and delete lifts; names may come from the Exercise List.
- `rounding` is a number from 0.5 to 10 (default 2.5). Rounding is always to the nearest step.
- The profile also keeps an optional notes box and the date the 1RMs were last updated (dd/mm/yyyy).

**3.3 Profile screen.** The Athletes tab lists profiles. Opening one shows the form: name, the lifts table (name, 1RM, training max, a "Use" choice of 1RM or training max), rounding, notes. All values in kg. Saves automatically like everything else.

**3.4 Calculation.** `kgForPercent(percent, lift, profile)` returns `round(percent / 100 × baseValue / step) × step`, or `null` when the lift is missing, the value is blank, or the percent is blank. Pure function, no drawing code.

**3.5 Accessory lifts.** See section 7.

**3.6 Exercises the athlete cannot do (gym resources).** The profile holds `unavailable`, a list of exercise names. The default is empty: every exercise is available.
- The profile screen has a section `Exercises this athlete can't do`. It shows the Exercise List (`builder_exercise_list_v1`) as a searchable list with a checkbox per exercise (checked = cannot do). Names typed in that are not in the list can also be added. With no Exercise List loaded, the section says `Load your Exercise List to choose from it` and still allows typed names.
- Names are compared case-insensitively with spaces trimmed. An exercise renamed in the Exercise List is not followed automatically; the profile shows `Not in your Exercise List` beside a name that no longer matches.
- **Where it is used:** (a) the Generate dialog lists every template exercise the athlete cannot do (step 4.2); (b) in a program linked to a profile, the Add exercise dropdown hides unavailable exercises, with a `Show all` switch; (c) in such a program an unavailable exercise gets a warning mark in the grid and the table, `Not available for <name>`; (d) Export for GymLog warns about them (step 4.4).
- Nothing is removed or replaced automatically. Substituting an exercise is the coach's decision (out of scope for this phase). A lift the coach wants to program by % (for example Overhead Press) is added to the profile like any other lift.

**Acceptance tests**
- T3.1: A new profile has the three lifts; adding Overhead Press and a 1RM works.
- T3.2: `kgForPercent(80, squat 200, step 2.5)` returns 160; with a 2.5 step and 77.5% of 200 returns 155.
- T3.3: A lift with `base: "tm"` uses the training max; choosing TM with no training max shows `Add a training max` and the lift is treated as missing.
- T3.4: A missing lift or blank value returns `null`, not 0.
- T3.5: An exercise's reference lift can be set from the dropdown, `Other…` and None.
- T3.6: Rounding outside 0.5 to 10 is refused.
- T3.7: A profile (including `unavailable`) exports and imports with Export everything (step 1) unchanged.
- T3.8: Ticking Leg Press in the profile's list stores it in `unavailable`; unticking removes it.
- T3.9: A typed name not in the Exercise List can be added; a name later missing from the list shows `Not in your Exercise List`.
- T3.10: In a program linked to that profile, Leg Press is hidden in the Add exercise dropdown and returns with `Show all`.
- T3.11: A Leg Press already in a linked program shows the warning mark in the grid and the table; an exercise with different capitalisation (`leg press`) is also matched.
- T3.12: With no Exercise List loaded, the section shows the hint and typed names still work.

### Step 4 – Templates, Generate, GymLog file

**4.1 Templates.** `Save as template` (editor menu) copies the open program into the Templates tab with all `kg` set to null. A template opens in the same editor as a program, with a `Template` tag in the header. Differences: no kg shown and no GymLog export (a template has no kg to export). `New` on the Templates tab creates an empty one. A template's `source` is always null.

**4.2 Generate.** In the Library, click `Use for athlete…` on a template and pick the athlete, or click `New program…` on an athlete block and pick the template (or use the editor menu). Either way a template and a profile are chosen. The dialog shows the name for the new program (default `<template> – <athlete>`), a count of how many % set groups will get a kg value, and a list of problems (for example `Pause Squat uses Back Squat: no 1RM`, or `Leg Press: not available for Sam`). Generate is allowed with problems; those groups stay blank and the new program shows a warning bar. Result: a new program, saved to the library at once (it appears under the athlete) and opened in the editor. It can be deleted if it is not wanted.
- Each % set group gets `kg = kgForPercent(load, refLift, profile)`.
- kg and RPE set groups and all blank loads are copied unchanged.
- `source` and `profileUsed` are filled in (section 5).

**4.3 Live kg.** A program with `profileUsed` recalculates `kg` for all % set groups after every edit. If the athlete's profile has changed since (compared with `profileUsed`), a bar says `<name>'s profile has changed. Recalculate kg?` with Recalculate (updates `profileUsed`) and Dismiss. Programs without a profile behave as in Phase 1 (kg only from an AI file).

**4.4 Export for GymLog.** `Export for GymLog` writes `<program name>.gymlog.json` in the format of `docs/Program Import Format.md`. It is blocked, with a list, if any % set group in an included week has no kg.
- One GymLog workout per program workout per included week. `label` = `<program name> - Wk<week> D<n>` (the block number was removed from the builder), `description` = the workout description (with ` · Deload week` etc. appended for a flagged week).
- Each included exercise set group becomes one GymLog exercise, in the order of the Phase 1 grid (a paired set group sits right after its partner).
- `weight` = `kg` (or `load` for kg groups); omitted when blank. For RPE loads `rpe` = the load and `weight` is omitted. For kg and % loads `rpe` = the target RPE if set.
- `reps` = the lower rep; `rest` in seconds; `notes` as in step 2.7.
- `superset` letters are assigned per workout (A, B, C…).
- If the program is linked to a profile and contains exercises that profile cannot do (3.6), a warning lists them with `Export anyway` and `Cancel`. Export is not blocked.
- A preview in a dialog shows the first workout in readable form before the file is downloaded.

**4.5 The AI prompt.** Stays, for blank and RPE loads and for programs without a profile. Its text says that a program with a profile can use `Export for GymLog` instead.

**Docs to update in this step's commit:** `ROADMAP.md`, `builder/PROJECT_SUMMARY.md`, this spec. `docs/Program Import Format.md` does not change.

**Acceptance tests**
- T4.1: Save as template removes every kg and keeps everything else.
- T4.2: Generate from a 4-week template for a profile with Squat 200 gives the expected kg for a 75/80/85/90% squat (150, 160, 170, 180).
- T4.3: An exercise whose reference lift is missing from the profile stays blank and appears in the problem list.
- T4.4: Kg and RPE set groups and blank loads are unchanged after Generate.
- T4.5: Editing a % load in a generated program updates kg at once.
- T4.6: Changing the profile's squat 1RM shows the bar; Recalculate updates every kg; Dismiss leaves them.
- T4.7: Export is blocked with a list when a % group has no kg; works once fixed.
- T4.8: The exported file imports into GymLog (v62 or later) and a superset pair appears side by side. (Real device test.)
- T4.9: An exercise with a rep range exports the lower rep and a notes line `8–12 reps`.
- T4.10: A deload-flagged week's workout descriptions include the label.
- T4.11: Generating twice from one template gives two independent programs.

### Step 5 – Progression tools

All six tools live in the pattern picker (Phase 1 spec 5.9) except 5.2 (a table) and 5.3 (a program-level control). Every tool generates the later weeks from Week 1; a week edited by hand keeps its values unless the coach picks Replace (the existing Keep / Replace choice).

**5.1 Percentage ramp (% only).** Pattern `ramp`: the coach enters an **end percentage**. Weeks between Week 1 (the start) and the last included week are filled in equal steps, rounded to the nearest 0.5%. Preview as for other patterns. If a week is flagged deload, the ramp still counts it as a week (5.3 explains the effect).

**5.2 Per-week table.** A `Week table` button next to Pattern opens a dialog with one row per week and, for the chosen set group, columns for sets, reps (and upper rep), load and target RPE. Edited cells mark the week edited. This extends the Phase 1 manual entry, which only set the load. Only available for one set group at a time.

**5.3 Deload week flag.** The program setting `Deload: sets [60]% · load [90]%` sets `deloadRule`. In a deload week, generated values are scaled: sets × setsPct (rounded up, at least 1), kg and % loads × loadPct (rounded to the nearest 2.5 kg for kg, 0.5% for %). RPE and RIR loads and targets are unchanged. A pattern still counts the deload week as a normal week for progression: a +2.5 kg per week pattern gives Week 4 deload and Week 5 = Week 4's normal load, not an extra step. The coach can override a deload week by hand, which marks it edited. Removing the flag restores the normal value.

**5.4 Top set + back-offs.** Any set group can take its load from another set group of the same exercise: the week editor gives each set group a `Load from` choice (none, or any other set group of the exercise) and a `% of that set`. It stores `loadFrom: { group, pct }`. This is not limited to one top set: several top sets, several back-off groups, and chains (a drop set taken from a back-off) are all allowed. The Back-off set type (2.2) is only a label and does not decide anything.
- The load of the group is the source group's load × pct, rounded (kg: to 2.5; %: to 0.5). Available only if both groups have the same load type (kg or %).
- Links cannot form a loop (A from B and B from A is refused with a message). Groups are calculated in dependency order.
- A change to a source group updates every group linked to it, in every week. Weeks edited by hand keep their values.
- Links stay attached to the right group when set groups are added, deleted or split (as `patterns` and `supersets` do). Deleting a source group removes the links to it and keeps each group's last computed value.
- A linked group's own load pattern is disabled (its load follows the source). Its sets, reps and rest stay free.

**5.5 Wave loading.** Pattern `wave`: a **wave length** (2–6 weeks), a load offset per week of the wave (from Week 1), an optional **reps** per week of the wave, and a **bump** added each time a new wave starts. Example: length 3, offsets 0 / +5 / +10, reps 5 / 3 / 1, bump 2.5 gives 100×5, 105×3, 110×1, then 102.5×5, 107.5×3, 112.5×1. A wave with a reps list controls reps, so the rep progression of 5.6 is disabled for that group.

**5.6 Rep progression in a range.** `repPatterns[k]` of kind `range`: min, max, `loadAdd`. Week 1 reps = min. Each later week adds 1 rep until max; the week after max resets to min and adds `loadAdd` to the load (kg or %; none for RPE loads). Example: 3 × 8–12 at 80 kg with loadAdd 2.5 gives 8, 9, 10, 11, 12 reps, then 8 reps at 82.5 kg. Disabled if the group uses a wave with a reps list.

**Combining.** A set group has one load pattern (`patterns[k]`) and one rep pattern (`repPatterns[k]`), plus optionally `loadFrom`. If a combination is not allowed (for example wave reps + rep range, or `loadFrom` + a load pattern), the control is disabled and the tooltip says why.

**Acceptance tests (one set per sub-step)**
- T5.1: Ramp from 70% to 85% over 4 weeks gives 70, 75, 80, 85; 70 to 90 over 5 weeks gives 70, 75, 80, 85, 90. A ramp whose steps fall between 0.5% marks (70 to 85 over 5 weeks, 3.75 per week) rounds to the nearest 0.5%, halves rounding up.
- T5.2: Ramp is not offered for kg or RPE load types.
- T5.3: The week table edits sets, reps, load and RPE for each week in one dialog; Cancel changes nothing; edited weeks are marked.
- T5.4: Flagging Week 4 as deload gives sets 3→2 (60%, rounded up) and 100 kg → 90 kg; Week 5 equals the unflagged Week 5.
- T5.5: Removing the deload flag restores the original values; a hand-edited deload week is kept.
- T5.6: A back-off at 85% of a 100 kg top set is 85 kg; changing the top set to 105 kg changes the back-off to 90 kg (rounded to 2.5).
- T5.7: Deleting the source set unlinks the back-off and keeps its value.
- T5.7a: Two top sets (group 1 at 100 kg, group 2 at 110 kg) each with its own back-off group at 85% give 85 kg and 92.5 kg (93.5 rounded to 2.5).
- T5.7b: A chain (drop set at 90% of a back-off at 85% of a 100 kg top set) gives 85 kg, then 76.5 rounded to 77.5 (nearest 2.5; halves round up).
- T5.7c: A loop is refused with a message and nothing changes.
- T5.7d: Adding a set group above a linked group keeps every link on the right groups.
- T5.8: The wave example above generates exactly those loads and reps.
- T5.9: Rep range 8–12 with loadAdd 2.5 gives the sequence in 5.6.
- T5.10: Disallowed combinations are disabled with a reason.
- T5.11: Each tool survives Save file, Open file and Export everything.

### Step 6 – Duplication and versions

**6.1 Duplicate week.** In the grid, a week column's menu: `Duplicate week` inserts a copy to the right of it (all exercises and values, `edited` set to true for each copied week), and `Remove week` stays as before. The program's week count and every exercise's `weeks[]` and `weekFlags` grow by one. The copied week's flag is copied too.

**6.2 Duplicate workout.** A workout row's menu: `Duplicate workout` adds a copy under it (with `(copy)` kept out of the name; workouts have descriptions only), in every week. Superset pair ids are re-created so the copy is independent. The workouts-per-week count grows by one.

**6.3 Copy day across weeks.** Menu on a workout cell: `Copy this day to…`: choose the weeks to overwrite. Confirms before replacing anything that exists there. Copied cells are marked edited.

**6.4 Duplicate program.** Already in the Library screen (step 1); versions are not copied.

**6.5 Save version.** A `Versions` button in the editor header. `Save version` adds a snapshot with an optional note and the date (dd/mm/yyyy, plus time). The list shows each version with Restore and Delete. At 10 versions the oldest is removed after a warning. Restore replaces the open program, and first offers `Save the current program as a version?` so a restore can be undone.

**6.6 Compare (simple).** Selecting a version shows a short summary against the open program: weeks, workouts, exercises added or removed, and the number of changed set groups. No cell-by-cell diff in this phase.

**Acceptance tests**
- T6.1: Duplicate week inserts after the chosen week, copies flags and values, and the week count rises by one.
- T6.2: Duplicate workout creates independent copies; changing one's superset does not change the other.
- T6.3: Copy day overwrites only the chosen weeks after confirming.
- T6.4: Save version adds a snapshot; Restore returns the program to it and offers to save the current one first.
- T6.5: An 11th version keeps 10, removing the oldest after a warning.
- T6.6: Deleting a program deletes its versions; Export everything includes versions.

### Step 7 – Metrics charts

**7.1 Where.** A `Metrics` panel in the editor (a tab beside the grid, or a second view of the bottom area; mockups decide before building, see section 10), and a small version in the template list and the Generate dialog.

**7.2 Measures, per lift per week.** "Lift" is the exercise's reference lift; exercises without one count under `Other`.
- **Sets:** sum of sets in the lift's included set groups.
- **Tonnage (kg):** sum of sets × reps × kg per set group. Reps use the lower rep for a range. Needs a kg value: from `kg`, the kg load, or (for % groups) a profile chosen in the panel's `Preview with athlete` dropdown. RPE, RIR and blank loads add nothing and are counted as `N set groups without a kg value` under the chart.
- **Average intensity:** reps-weighted average of kg ÷ the lift's base value (1RM or training max), as a percentage. It needs the profile (the program's own, or one chosen in the preview dropdown). % loads can be averaged without a profile as a plain percentage. Set groups that cannot be counted are excluded, and the count is shown.

**7.3 Charts.** Drawn with inline SVG, no library. One chart per measure, weeks along the bottom, one line or bar group per lift, using the accent colours of the spec 8 palette. A table of the numbers sits under the charts (copyable). Deload weeks are shaded.

**7.4 Live.** Charts update after every edit. Calculation functions are pure and separate from drawing (`weekMetrics(program, profile)` returns the numbers).

**7.5 Template comparison.** The Templates tab can tick two to four templates and open a comparison: a table of total sets and average intensity per lift per week. Tonnage needs a profile, offered as a dropdown.

**Acceptance tests**
- T7.1: A one-exercise program (3 × 5 at 100 kg, Squat) gives sets 15 and tonnage 1,500 for that week.
- T7.2: Average intensity for 3 × 5 at 150 kg for a 200 kg squat is 75%.
- T7.3: Exercises with no reference lift appear under `Other`.
- T7.4: A % group without a profile counts nothing toward tonnage and is reported as excluded.
- T7.5: Editing a load updates the charts at once.
- T7.6: A range 8–12 uses 8 reps for tonnage.
- T7.7: Blank and RPE loads are excluded and counted.
- T7.8: The template comparison matches the per-template panel numbers.

## 7. The accessory-lift question in detail

Only Squat, Bench and Deadlift have a 1RM in most athletes' records, so most accessories have no direct %.

| Case | Example | How it works |
|---|---|---|
| Variation of a main lift | Pause squat, close-grip bench, deficit deadlift | Reference lift = the main lift. % of that main lift's 1RM (often 60–85%). |
| Extra lift with a known max | Overhead press, front squat | Add it to the profile with its own 1RM. Reference lift = that lift. |
| True accessory | Rows, curls, lateral raises | No reference lift. Use kg, RPE (or RIR) or leave blank. |

If the coach wants a % for an accessory with no 1RM, the builder leaves it blank and warns; nothing is guessed.

## 8. Visual design

Same tokens as Phase 1 spec section 8. **Use as few boxes as possible.** Group things with headings, spacing and thin divider lines, not with a border and background around each block or list item: boxes waste space and force extra gaps between them. Boxes stay only where they do a job: dialogs, input fields, and warning bars. New screens (Library, profile form, metrics) follow the same layout rules. A mockup of the Library screen and the Metrics panel is shown and agreed before step 1.1 and step 7 are built (project working preference).

## 9. Risks and open points

- **One 4,000-line file.** All steps add to `builder/index.html`. This is fine for now; if it becomes hard to work in, splitting into a few script files (still no build tools) is a separate decision.
- **Parallel Phase 1 bug fixing.** Phase 1 fixes from the real-block test continue in separate small commits. A Phase 2 step that touches the same function should be built on the latest `main`.
- **Browser storage can be cleared.** The Last exported reminder and Export everything are the safeguard.
- **Pattern combinations.** Section 6, step 5 "Combining" is the part most likely to need a second round after a real block.
- **Open questions** are in section 11.

## 10. Suggested build order

Each step ends with a stop for the user to test. Sub-steps of step 5 are separate builds.

1. Library (mockup first).
2. Coaching fields.
3. Reference lifts and athlete profiles.
4. Templates, Generate, GymLog file. *First point where a percentage block can go from template to phone without the AI.*
5.1 Ramp → 5.2 Week table → 5.3 Deload → 5.4 Back-offs → 5.5 Wave → 5.6 Rep range.
6. Duplication and versions.
7. Metrics charts (mockup first).

Step 3 can be built before step 2 if the coach wants Generate sooner; they do not depend on each other. Step 4 needs step 3.

## 11. Open questions to confirm before building

Questions 1 to 6 were decided in review on 6 November 2026 (also recorded in section 3).

1. **Deload and effort targets (5.3):** RPE and RIR loads and targets are unchanged in a deload week.
2. **Autosave (1.2):** the library autosaves and the "unsaved changes" warning goes away. Export everything, the Last exported reminder and versions are the safety net.
3. **Library import (1.5):** two modes only, Add as copies and Replace everything. No smart merge.
4. **Back-offs (5.4):** no limit on top sets; any set group can take its load from any other set group of the same exercise (no loops).
5. **Unavailable exercises on Generate (4.2):** flagged and kept in the new program.

7. **kg only for programs that belong to a lifter (idea from the user, 7 November 2026; to confirm in step 3 or 4).** A kg load only makes sense once a program is tied to a specific lifter. So a template would offer % of 1RM, RPE and RIR (and RPE/RIR targets), and the kg option would be hidden or disabled in templates. A program tied to a lifter would offer all four. **Decided (8 November 2026):** a Phase 1 program that uses kg loads is not changed or converted. It stays in the Library under "Not linked to an athlete", with a small note (such as "pre-filled") saying it came in with kg loads already set. Building this and hiding kg in templates belongs to step 4. Not built; today every program offers all four load types.
6. **Linking an existing program to an athlete:** not built. The "Not linked to an athlete" section is temporary (1.1), so it gets no `Link to athlete…` action. To use an old program for an athlete, save it as a template (step 4) and use it for that athlete.

New questions that come up while building go here before they are decided.

## 12. Implementation notes

- All library reads and writes go through a few functions (`libraryLoad`, `librarySave`, `libraryDelete`, and so on) so the storage can be changed later without touching the editor.
- New calculation functions are pure and tested by throwaway scripts first: `kgForPercent`, `generateFromTemplate`, `weekMetrics`, `exportGymLogFile`, `deloadWeek`, `rampValues`, `waveValues`, `repRangeValues`.
- `generateWeeks` is extended, not rewritten. It already skips edited weeks and keeps kg where the prescription is unchanged.
- Escape all user text. Treat every opened file, including a library file, as untrusted.
- Bump nothing in GymLog. The builder has no service worker, so each push is live as soon as Pages redeploys.

## 13. When finished

For each step: update `builder/PROJECT_SUMMARY.md` and `ROADMAP.md`, set this spec's status per step ("Step n implemented"), and give a commit message. Ask the user before publishing.
