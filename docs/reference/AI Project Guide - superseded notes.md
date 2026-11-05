# Notes on the AI Project Guide and Feature Specification Prompt

`AI Project Guide.pdf` (written 31 July 2026) and `Workout App Feature Specification Prompt.docx` (2 August 2026) are the original guides. They are kept unchanged. Where the app and later decisions moved on, **this note wins**.

| Topic | The guide says | Now |
|---|---|---|
| Finishing a workout (C22) | Edit the date before saving a finished workout. | The date is today's date and is editable afterwards in History. |
| After finishing (C23) | The flow ends with "Go home". | It lands on the finished workout's Past Workout view (since v54). |
| Export (C24) | Export one raw format, independent of any spreadsheet. | Export Gym Log matches the user's own Excel layout. This was a deliberate change of direction. A generic raw export is still a possible future idea. |
| Excel sync (C26) | The project description says Excel "should sync". | Programs come in as JSON, converted from a spreadsheet by an AI (`docs/Program Import Format.md`). There is no Excel sync. |
| Spec format (C25) | Specs should be free of implementation detail, with set headings. | The specs in `docs/specs/` use Goal, Scope, Behaviour and Implementation Notes. That format has worked well, so use it for new specs. |

Principles from the guide that still apply: the app stays generic (it only knows Program, Workout and Exercise), there is one standard import format and AI converts everything else into it, offline-first, mobile-first, simple, fast to use during a workout. Check whether a feature affects architecture or the data model before writing code, and discuss it first if it does.
