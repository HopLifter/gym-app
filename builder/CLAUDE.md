# GymLog Program Builder

A separate desktop website for building training programs (Epic 2.1 of the GymLog roadmap). Plain HTML, CSS and JavaScript, one `index.html`, no frameworks, no build tools, no service worker. Hosted on GitHub Pages at `HopLifter/gym-program-builder`.

## Read first
- `docs/Feature Spec 2.1 Program Builder Phase 1.md` is the spec to implement. Follow its suggested build order and **stop after each step so the user can test it**.
- `docs/GymLog ROADMAP (reference).md`, `docs/GymLog Program Import Format (reference).md` and `docs/GymLog PROJECT_SUMMARY (reference).md` are read-only copies from the GymLog project. The real ones live in `C:\Users\cjroy\OneDrive\Personal Projects\GymLog` (newest build folder). Do not edit these copies.

## Rules
- Never read or write a `gymapp_` localStorage key. Every builder key starts with `builder_`.
- No native `alert()`, `confirm()` or `prompt()`. Use custom modals.
- Escape all user text. Treat every opened file as untrusted.
- Keep calculation functions (e.g. `generateWeeks`) separate from drawing code.
- Match GymLog's dark look (tokens in spec section 8).
- Git work stays here in `C:\Projects\gym-program-builder`, outside OneDrive.
- Never push without the user's explicit request for that push. Never force-push. Never put passwords or tokens in any file.
- Creating the GitHub repo is outward-facing: ask the user first.

## Working preferences
- This is the user's first project: explain new technical concepts at a first-year university student level.
- If anything is ambiguous, ask before proceeding.
- For layout decisions of real substance, show concrete mockup options before building.
- At the end of a session: provide a git commit message and keep `PROJECT_SUMMARY.md` in this repo accurate (it is the hand-over document).
- Testing: the user wants real data. A GymLog Backup All Data file is at `C:\Users\cjroy\OneDrive\Personal Projects\GymLog\TestData\baseline-backup-v58.json`; use it for the Exercise List test. Never copy it into this repo.
