# Program Builder

A separate desktop website for building training programs (Epic 2.1 of the GymLog roadmap). Plain HTML, CSS and JavaScript, one `index.html`, no frameworks, no build tools, no service worker. It lives in the `builder/` folder of this repo and is published at https://hoplifter.github.io/gym-app/builder/. The root `CLAUDE.md` and `docs/WORKFLOW.md` also apply.

## Read first
- `PROJECT_SUMMARY.md` (this folder) is the hand-over document.
- `../docs/specs/Feature Spec 2.1 Program Builder Phase 1.md` (core builder) and `../docs/specs/Feature Spec 2.1 Program Builder Phase 2.md` (library, templates, athletes, coaching tools) are the specs. The code and `PROJECT_SUMMARY.md` ("Current status") are newer than the specs where they differ. Follow the spec build order and **stop after each step so the user can test it**. Show full-width mockups (never side by side) for real layout choices.
- `../ROADMAP.md`, `../docs/Program Import Format.md` and `../PROJECT_SUMMARY.md` are the single copies of the GymLog documents. Keep them in step with the builder's AI prompt.

## Rules
- Never read or write a `gymapp_` localStorage key. Every builder key starts with `builder_`.
- No native `alert()`, `confirm()` or `prompt()`. Use custom modals.
- Escape all user text. Treat every opened file as untrusted.
- Keep calculation functions (e.g. `generateWeeks`) separate from drawing code.
- Match GymLog's dark look (tokens in spec section 8).
- Testing: use real data. Never copy the GymLog backup file into this repo.
