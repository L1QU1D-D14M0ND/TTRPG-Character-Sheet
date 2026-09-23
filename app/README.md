# TTRPG Character Sheet (app)

React + TypeScript + Vite PWA. Working product title: **TTRPG Character Sheet**.

Layout:

- `src/shared` — ids, signed, Ajv helper, file IO, `DerivedCell`
- `src/shell` — chrome, Save/Load dispatch by `system`, Tools sidebar host + named tools
- `src/systems/pf1e` — PF1e schema types, martial and spell `compute()`, spreadsheet workspace, catalog picker
- `src/systems/pf2e` — PF2e schema types, `compute()`, spreadsheet workspace

## Scripts

```bash
npm install
npm run dev
npm test
npm run build
```

## Features

- Spreadsheet-style UI per system (PF1e: classes/abilities/skills/combat/spells/inventory/play; PF2e: existing editors)
- New / Load / Save sheet (`.json`). New sheet asks PF1e vs PF2e. Load dispatches on `system`
- One IndexedDB draft (refresh restore). Not a character library
- `system: "pf2e"` written on PF2e Save; files without `system` still load as PF2e
- `system: "pf1e"` required on PF1e documents
- Auto-seeded standard skills per system
- PF1e martial + spell calc (Fighter 5, Wizard 5, Fighter 2 / Wizard 3, Synthesist 5, Wizard 7, Cleric 5, Duelist 7, and Ranger 5 goldens) and PF2e core calc (Fighter 5, Wizard 5, Bard 5, Cleric 5, Ranger 5)
- CRB pack complete: batches 1–21, W1–W7, F1–F4 (all 177 feats), S1–S5 (all 622 spells). Mechanics-only ([ADR 0007](../docs/adr/0007-content-licensing.md)). APG pack: Summoner class, Synthesist archetype, evolutions, and 27-spell catalog ([`../docs/pf1e-apg-pack-design.md`](../docs/pf1e-apg-pack-design.md)).
- Searchable catalog picker (ADR 0009 slices 1 & 2: feats, spells, items, evolutions, race, class, archetype)
- Save export strips `derived`
- Collapsible Tools sidebar with all three named tools: Attack Helper, Actions List, and Budget Calculator (no in-app dice; physical table dice only)
- PWA: `npm run build` emits a Workbox service worker + standalone manifest (CI `verify:pwa`). Install/offline checklist below
- Locale runtime (`I18nProvider` / `useT()`). Chrome + PF1e panels + sidebar tools use `en.json` / `es.json`. PF2e panel literals remain (later PF2e *release*)

## PWA proof (0.9)

CI runs `npm run build` then `npm run verify:pwa` (**dist artifact** check: standalone manifest, 192/512 PNG icons, Workbox SW that precaches `index.html`). Runtime install/offline is the manual checklist below.

Manual once on a preview URL:

```bash
cd app
npm run build && npm run verify:pwa && npm run preview
```

1. Open the preview origin (localhost is treated as secure).
2. Install (browser install / “Add to Home Screen”).
3. Go offline and reload — the app shell should still load.
4. Save/Load `.json` still works; the IndexedDB draft is one sheet, not a library.

Product lock: [`../docs/adr/0003-multi-system-product-direction.md`](../docs/adr/0003-multi-system-product-direction.md). PF1e schema: [`../docs/adr/0006-pf1e-character-schema.md`](../docs/adr/0006-pf1e-character-schema.md).

Schemas: `../schemas/character.schema.json` (PF2e), `../schemas/pf1e/character.schema.json` (PF1e)

Golden fixtures: `../fixtures/characters/golden/fighter-5.json` (PF2e), `../fixtures/characters/golden/wizard-5.json` (PF2e), `../fixtures/characters/golden/bard-5.json` (PF2e Bard 5), `../fixtures/characters/golden/cleric-5.json` (PF2e Cleric 5), `../fixtures/characters/golden/ranger-5.json` (PF2e Ranger 5), `../fixtures/characters/golden/pf1e/fighter-5.json` (PF1e Fighter 5), `../fixtures/characters/golden/pf1e/wizard-5.json` (PF1e Wizard 5), `../fixtures/characters/golden/pf1e/fighter-2-wizard-3.json` (PF1e Fighter/Wizard), `../fixtures/characters/golden/pf1e/synthesist-5.json` (PF1e Synthesist), `../fixtures/characters/golden/pf1e/wizard-transmutation-7.json` (PF1e Wizard 7 Transmutation specialist), `../fixtures/characters/golden/pf1e/cleric-5.json` (PF1e Cleric 5), `../fixtures/characters/golden/pf1e/fighter-5-duelist-2.json` (PF1e Duelist prestige), `../fixtures/characters/golden/pf1e/ranger-5-companion.json` (PF1e Ranger 5 with companion)
