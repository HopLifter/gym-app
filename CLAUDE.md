# GymLog and Program Builder

One repo, two projects: the GymLog phone app (repo root) and the Program Builder desktop site (`builder/`).

Follow the workflow at the start of every session, and read `PROJECT_SUMMARY.md` (plus `builder/PROJECT_SUMMARY.md` for builder work):

@docs/WORKFLOW.md

At the start of a session, ask which project it is for: GymLog, Program Builder, or planning future features. The user titles sessions `[GymLog]`, `[Builder]` or `[Planning]`.

## Working preferences
- Keep answers short and concise.
- Ask before assuming. If anything is ambiguous, ask.
- This is the user's first project: explain new technical concepts at a first-year university level.
- Challenge architecture decisions and suggest simpler options. Discuss anything that affects the data model before writing code.
- For layout decisions of real substance, show concrete mockup options with realistic data first.
- Build in steps and stop after each so the user can test. Put a clickable link to the page at the top of each build report.
- Test with real data. The baseline backup is `C:\Users\cjroy\OneDrive\Personal Projects\GymLog\TestData\baseline-backup-v58.json`. Never copy it into the repo.
- At the end of each session: update the summaries and `ROADMAP.md`, and give a git commit message.
- Units are always kg and dates always dd/mm/yyyy. No native `alert()`, `confirm()` or `prompt()`.
