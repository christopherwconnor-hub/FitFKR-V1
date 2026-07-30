# FitFKR

FitFKR is a private-by-default fitness PWA for workout logging, progress, recovery, and common fitness calculations. It is a standard React + TypeScript + Vite project with no Cloudflare, Wrangler, vinext, or OpenAI hosting dependency.

## Included

- Fully editable, reorderable, duplicable, archivable, restorable and resettable workouts
- Exercise add/delete/reorder, notes, substitutions, set/rep targets and cardio finishers
- Plain-text multi-workout importer
- Per-set weight and rep tracking, previous-session values and progressive-overload prompts
- Detailed workout history, calendar, volume and per-exercise personal records
- Timestamp-based rest/cardio timers with notifications, selectable sounds and vibration
- Body-weight graphs, complete measurements and retained front/side/back progress-photo timeline
- Recovery habits, daily score, history and muscle-group recovery display
- 1RM, plate, macro, vial-measurement, medication-volume and unit-conversion calculators
- 12 themes, feminine and rounded fonts, custom accent, icon style and text sizing
- Local JSON backup and restore
- Installable offline PWA

All app records are stored in the browser on the current device. Export a backup regularly. Progress-photo file contents are intentionally not placed in JSON backups.

## Local setup

Use Node 22.14 (the pinned version in `.nvmrc`).

```bash
pnpm install
pnpm run dev
```

Production verification:

```bash
pnpm run build
pnpm run preview
```

The production output is `dist/`.

## Upload to GitHub

1. Create a new empty GitHub repository.
2. Extract this ZIP.
3. Upload all extracted files, including dotfiles such as `.nvmrc` and `.gitignore`.
4. Commit them to the `main` branch.

Or from a terminal:

```bash
git init
git add .
git commit -m "Initial FitFKR release"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

## Deploy with Vercel

1. In Vercel, choose **Add New → Project**.
2. Import the GitHub repository.
3. Vercel should detect **Vite** automatically.
4. Keep these settings:
   - Install command: `pnpm install --frozen-lockfile`
   - Build command: `pnpm run build`
   - Output directory: `dist`
5. Deploy.

`vercel.json` already provides the single-page-app rewrite. No environment variables are required.

## GitHub Pages

Vercel is the simplest deployment target for this project. For a project-level GitHub Pages URL, set `base` in `vite.config.ts` to `"/YOUR_REPOSITORY_NAME/"` and ensure the PWA paths use the same base before deploying `dist/`.

## Health calculator note

The vial tool performs concentration and volume arithmetic only. It does not recommend substances, doses, protocols, or treatment. Verify any medication-related measurements with a licensed clinician or pharmacist.
