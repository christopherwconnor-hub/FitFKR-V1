# FitFKR

This is the protected continuation project for the FitFKR version selected on July 30, 2026. Its current structure, navigation, visual language, themes, mobile layout, and core behavior are the approved baseline.

Future improvements should be small and additive. Read `PROJECT-GUARDRAILS.md` before changing the interface.

A polished, mobile-first React + TypeScript workout tracker built around a precise six-day training plan. FitFKR runs entirely in the browser and stores workout logs, history, weight entries, progress photos, and theme preferences on the device.

## Features

- Monday–Saturday plan with every prescribed set, rep, time, and finisher
- Per-set weight, rep/time, and completion logging
- Previous-session awareness and progressive-overload prompts
- Exercise-specific next-weight suggestions after every prescribed set and rep is completed
- Automatic session volume and PR tracking
- Rest timer and cardio finisher timer
- Recovery-day checklist
- Body-weight trend chart
- On-device progress photo timeline
- Workout history, weekly completion, and streaks
- Motivational workout-completion celebration and six consistency achievements
- Dark/light themes
- Three selectable themes, including the pink-and-white Blush Studio theme
- Three selectable typography styles, including Soft Serif and Soft Rounded feminine options
- Plain-text workout plan importing with saved plan selection
- In-app workout plan editing, with editable custom copies of the built-in plan
- Copy-and-paste workout plan creation with starting-weight recognition
- Rest-between-sets timer with 30, 60, 90, and 120-second presets
- Installable PWA with offline caching
- Responsive desktop and mobile interface
- Automatic Rest & Recovery dashboard when the active plan has no workout scheduled today
- Device-local peptide prescription schedule with selectable days and prescribed mg/unit fields
- U-100 syringe concentration converter for vial mg and BAC-water volume
- FDA-status and safety labels for commonly marketed peptides, with no dose recommendations

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
```

The default build uses Next.js and is compatible with Vercel. The separate `npm run build:sites` command produces the Cloudflare/Sites build.

## Deploy to Vercel

1. Upload this complete project to GitHub.
2. Import the repository into Vercel.
3. Leave **Framework Preset** set to **Next.js**.
4. Leave **Build Command** set to `npm run build` or the default Next.js command.
5. Leave **Output Directory** empty.
6. Deploy.

No environment variables are required.

## Deploy to GitHub Pages

This starter uses a Cloudflare-compatible Next.js runtime for its hosted preview. For GitHub Pages, the simplest route is GitHub Actions:

1. Create a new GitHub repository and upload this project.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Add a static-export workflow and configure the project for static export, or deploy the project with a Next.js-compatible GitHub Pages action.

Because all user data is stored locally in the browser, no database or environment variables are required. If you prefer a one-click host with no configuration changes, the same project can be deployed directly to Cloudflare, Vercel, or Netlify.

## Privacy

FitFKR has no accounts, analytics, or remote database. Training data, peptide schedules, and compressed progress photos remain in the current browser’s local storage. Clearing browser data also clears saved app data.

## Peptide schedule safety

The peptide tab is a private recordkeeping and arithmetic tool, not medical advice. It does not recommend a peptide, dose, frequency, route, diluent, or treatment. The concentration converter assumes a U-100 syringe, where 100 syringe units equal 1 mL, and should be checked against the medication label by a licensed prescriber or dispensing pharmacist before use.

## Importing workout plans

Open **Plans & themes**, then choose a `.txt` file. Format day headings and exercises like this:

```text
Monday – Arms & Abs

Hammer Curl – 3 × 12
Cable Crunch – 3 × 15

Finish:

15–20 minutes incline treadmill
```

The importer supports Monday through Sunday, parenthetical day notes, recovery checklist items without set counts, `×` or `x` set notation, and cardio finishers. Imported schedules are stored on the current device and appear in the workout-plan selector.

You can also paste the same format directly into **Plans & themes → Paste & Build**. Starting weights are optional:

```text
Shoulder Press – 3 × 10 @ 25 lb
Cable Row – 3 × 12, 40 lb
```

When a starting weight is included, it is prefilled in every set and can still be edited during the workout.
