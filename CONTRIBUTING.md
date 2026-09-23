# Contributing to TTRPG Character Sheet

Thank you for your interest in contributing to **TTRPG Character Sheet**!

This project is a lightweight, local-first Progressive Web Application (PWA) for playing tabletop roleplaying games, currently supporting Pathfinder First Edition (PF1e) and Pathfinder Second Edition (PF2e).

## Development Setup

The web application is located in the `app/` directory and built with React, TypeScript, and Vite.

```bash
cd app
npm install
npm run dev
```

### Verification Scripts

Before submitting changes, make sure all checks pass cleanly:

```bash
# Run the test suite (Vitest)
npm test -- --run

# Run code linter (Oxlint)
npm run lint

# Build the production bundle and typecheck (TypeScript + Vite)
npm run build

# Verify PWA manifest, service worker, and icons
npm run verify:pwa
```

## Repository Architecture

- `app/src/shared/`: Shared kernel code (persistence, Ajv validation, ID generation, localization runtime, UI helpers).
- `app/src/shell/`: Shell chrome, navigation, topbar toolbar, modal dialogs, and sidebar host.
- `app/src/systems/pf1e/`: Pathfinder 1E engine, character calculation, sheets, panels, and content adapters.
- `app/src/systems/pf2e/`: Pathfinder 2E engine, character calculation, sheets, and panels.
- `content/pf1e/`: Curated JSON content packs (`crb/` Core Rulebook, `apg/` Advanced Player's Guide).
- `schemas/`: Character document JSON schemas validated on Save/Load.

## Critical Guidelines

### 1. Content Licensing & Mechanics-Only Policy (ADR 0007)

All content in `content/pf1e/` is strictly **mechanics-only**:
- **Allowed:** Uncopyrightable game mechanics, tables, identifiers, and statistics (hit dice, BAB, save progressions, spell levels, item weights, damage dice).
- **Prohibited:** Copied rules-text prose, spell descriptions, feat benefit paragraphs, class flavor text, or setting lore.
- **Prohibited:** Paizo Product Identity (Golarion place names, deity names, unique NPC names, campaign setting lore).
- **Automated License Gate:** `licenseGate.test.ts` scans all pack files on every test run. Any forbidden prose or Product Identity keys will fail CI.

### 2. Internationalization (i18n)

The application supports English (`en`) and Spanish (`es`):
- Any user-facing strings in shared chrome, dialogs, or sidebar tools must be externalized to `app/src/locales/en.json` and `app/src/locales/es.json`.
- The test suite enforces **strict key and placeholder parity** between `en.json` and `es.json` in `i18n.test.ts`.

### 3. Separation of Systems (ADR 0004)

`systems/pf1e` and `systems/pf2e` must remain completely independent:
- Never cross-import between `systems/pf1e` and `systems/pf2e`.
- Code reused between systems must live in `app/src/shared/` or `app/src/shell/`.
- Existing PF1e and PF2e golden character test suites must stay green.

### 4. Non-Goals

Please do not propose PRs for:
- In-app dice rolling or RNG (the sheet is designed to accompany physical table dice).
- Cloud storage, user authentication, or telemetry tracking.
- VTT / third-party tool synchronization.
