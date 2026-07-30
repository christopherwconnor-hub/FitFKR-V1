# FitFKR Complete

FitFKR is a private-by-default workout, progress, recovery, and fitness toolkit. This cumulative build includes the current four-day program and the customization and utilities requested across earlier versions.

## Included

- Editable, reorderable, duplicable, archivable workout plans
- Paste-to-import workout parser
- Per-set weight, rep, and completion logging
- Rest timer notifications, vibration, and timestamp recovery after backgrounding
- Workout history, volume chart, body weight, and measurements
- Recovery habits, daily score, and muscle-readiness overview
- Measurement-only vial and syringe converter, plate calculator, estimated 1RM, and macro starting point
- Twelve themes, eight font choices, custom accent color, and text sizing
- Local storage, JSON backup and restore, installable PWA, and offline cache

> The vial tool performs arithmetic from user-entered values. It does not recommend medications or doses and is not medical advice.

## Requirements

- Node.js 22.13 or later
- npm 10 or later

## Install and run

```bash
npm install
npm run dev
```

Open the local address printed in the terminal.

## Production build

```bash
npm run build
```

The validated production output is written to `dist/`.

## GitHub

1. Create a new repository such as `fitfkr`.
2. Upload this project or push it with Git.
3. Run `npm install` and `npm run build` in your deployment environment.

The project is prepared for the OpenAI Sites/Cloudflare runtime. If deploying elsewhere, use a host that supports the generated worker output in `dist/`.

## Privacy

Workout and wellness data are stored in the browser on the current device. Use **Settings → Export backup** before clearing browser storage or moving devices.

## Project structure

- `app/` — React/TypeScript application and design
- `public/` — PWA manifest, service worker, and icons
- `worker/` — server entrypoint
- `tests/` — build verification
- `.openai/hosting.json` — Sites configuration

## License

Private project. Add your preferred license before distributing publicly.
