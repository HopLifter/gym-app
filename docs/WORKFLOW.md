# GymLog: Build and Publish Workflow

Rules for working on GymLog and the Program Builder. Claude Code follows these every session.

## Project
- One git repo holds both projects: `C:\Projects\gym-app` (GitHub `HopLifter/gym-app`, branch `main`). Git history and the files in this repo are the source of truth.
- **GymLog** (phone app): offline-first workout tracker, plain HTML/CSS/JS. `index.html` (the whole app) and `sw.js` (offline cache) in the repo root. Live: https://hoplifter.github.io/gym-app/
- **Program Builder** (desktop site): `builder/index.html`, a separate page with its own `builder/PROJECT_SUMMARY.md` and `builder/CLAUDE.md`. Live: https://hoplifter.github.io/gym-app/builder/
- Shared documents exist once, in the repo: `ROADMAP.md`, `PROJECT_SUMMARY.md` (GymLog), `docs/Program Import Format.md`, `docs/specs/` (feature specs), `docs/mockups/`, `docs/reference/`.
- Read `PROJECT_SUMMARY.md` (and `builder/PROJECT_SUMMARY.md` for builder work) before changing anything. They record design decisions (custom modals instead of `alert()`/`confirm()`, custom dd/mm/yyyy date fields, etc.) that new work must follow.
- Keep the two projects in sync. A change to the import format updates `docs/Program Import Format.md` and the builder's AI prompt in the same commit. A roadmap change is made once, in `ROADMAP.md`.
- The builder never reads or writes a `gymapp_` localStorage key; its keys start with `builder_`.

## Working on a change
1. Work in `C:\Projects\gym-app` only, never inside OneDrive. Run `git pull` and `git status` first.
2. Make the change. Keep commits small and each about one thing.
3. Update `PROJECT_SUMMARY.md` (and `builder/PROJECT_SUMMARY.md` if the builder changed) to describe what changed and why.
4. Update `ROADMAP.md` so it matches reality: mark items implemented (with the version), add new items, keep the suggested order current.
5. Specs live in `docs/specs/`. Set a spec's status to "Implemented in vNN" when it ships.

## Version bump (whenever GymLog's `index.html` changes)
- Bump `CACHE_NAME` in `sw.js` (e.g. `gym-app-cache-v63` to `v64`).
- Bump `APP_VERSION` in `index.html` so it matches.
- Update the cache version in `PROJECT_SUMMARY.md`.
- Both must change together, or the phone keeps serving the old cached copy.
- Changes to `builder/` alone need no bump. The builder has no service worker.

## Build snapshots in OneDrive (archive)
After a build the user has approved, copy it to a dated folder under `C:\Users\cjroy\OneDrive\Personal Projects\GymLog\` as a read-only archive:
- Name: `YYYYMMDD`, or `YYYYMMDD_V2`, `_V3` for later builds the same day.
- Contents: `index.html`, `sw.js`, `manifest.json`, the `icon-*.png` files, `builder/`, `PROJECT_SUMMARY.md`, `ROADMAP.md`.
- Never edit a snapshot folder, and never work inside one. Older folders (up to `20261105`) stay as they are.
- This is a backup. If a snapshot and the repo disagree, the repo is right.
- Never copy `TestData\` or other personal data into the repo.

## Publishing to GitHub
Only publish when the user says they are happy and asks for it. A request to publish covers that one push only.

1. Confirm the version bump was done (if `index.html` changed), and that the summaries and `ROADMAP.md` are up to date.
2. `git pull`, then `git status` and `git diff --stat`. Show the user a short summary of what is changing.
3. Commit with a clear message that includes the new cache version when it changed.
4. Push to `main`. GitHub Pages redeploys automatically (a minute or two).
5. Report the result and the live links. Remind the user to reopen the app on the phone to pick up the new version.

## Cautions
- Both the repo and its Pages site are public. Never commit personal data (backups, real training files, `TestData`). `.gitignore` and a local pre-commit hook block the usual file names, but check what you stage.
- Never push without the user's explicit request for that push.
- Never force-push, and never rewrite history on `main`.
- Never put passwords or tokens into any file.
- Creating a GitHub repo is outward-facing: ask first.
