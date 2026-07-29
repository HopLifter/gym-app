# Gym Workout App — Project Summary

## What this is
A free, offline-first workout tracker for personal phone use. Built as a
single-page web app (not a native app) so there's no App Store, no fees,
no subscriptions.

## Live setup
- Hosted on GitHub Pages: https://hoplifter.github.io/gym-app/
- Repo: github.com/HopLifter/gym-app
- Files: `index.html` (the whole app) + `sw.js` (offline caching)
- No backend/server — all data lives in the browser's localStorage on the phone
- Workout plan is currently edited directly in the app (not yet synced from Excel)

## Why these tech choices
- **Plain HTML/CSS/JavaScript**, no frameworks — simplest possible setup for a
  first project, no build tools needed
- **GitHub Pages** instead of local file storage — the phone is a corporate
  device with MDM restrictions that blocked local file access (Files app,
  Shortcuts, Safari were all locked down). Hosting online sidesteps that.
- **Service worker** (`sw.js`) caches the page so it loads with zero signal
  after the first visit — this is what makes it usable at the gym.
- **localStorage** for notes/data — persists between sessions on the same
  phone, no login or database needed.

## Known limitations / things to know
- Cache version in `sw.js` (`CACHE_NAME`) must be bumped (e.g. v3 → v4) every
  time `index.html` changes, or the phone will keep serving the old cached copy.
- No Excel sync yet — workout data is edited by hand in the app.
- No login/accounts — data is local to one phone only, not backed up anywhere.
- Superset pairing reorders the exercise list (paired exercises are moved
  next to each other automatically).

## Current features (as of this version)
- Editable exercise fields: name, sets, reps, weight, RPE, rest time
- Auto-calculated Volume (sets × reps × weight)
- Notes field per exercise
- Add / delete exercises, with 6-second undo after delete
- Reorder exercises (Move Up / Move Down)
- Superset pairing: link two exercises, shown grouped with a visual badge
- Installable as a home screen shortcut via browser (Add to Home Screen)
- Works fully offline after first load

## Backlog / ideas not yet built
- Sync workout plan from an Excel export (CSV import)
- Multiple workout days / a weekly schedule view
- History of past sessions (not just today's)

## How to resume work in a new chat
1. Upload the current `index.html` and `sw.js`
2. Upload this summary file
3. Say what you want to change or add next

## Working preferences (apply every session)
- This is my first project — explain new technical concepts at a first-year
  university student level as they come up.
- When wrapping up a session, provide a git commit message for the latest changes.
- If anything is ambiguous, ask clarifying questions before proceeding.
