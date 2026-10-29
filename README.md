# ttrpg-character-sheet

**TTRPG Character Sheet** (working title) — installable local PWA for **player** characters. **Pathfinder First Edition** is the development priority; **Pathfinder Second Edition** is a preserved slice that also computes (Build + Play) and must not regress.

**Status:** see the [Roadmap](docs/ROADMAP.md), the single source for the current phase and next work. First Edition is complete (CRB player catalog, APG Synthesist, catalog picker, Attack Helper, Actions List, Budget Calculator, and the rules encyclopedia). The PF2e slice stays in the app and must not regress; the rest of PF2e waits for a later release.

The npm package is `ttrpg-character-sheet`. The GitHub repository is [TTRPG-Character-Sheet](https://github.com/L1QU1D-D14M0ND/TTRPG-Character-Sheet). Both were renamed from `Pathfinder-2E-Card` / `pathfinder-2e-character-sheet` — see [ADR 0008](docs/adr/0008-repo-package-rename.md). The old GitHub URL redirects to the new one.

## App

```bash
cd app
npm install
npm run dev
```

- React + TypeScript + Vite
- Save/Load `.json` (Ajv). Missing `system` loads as PF2e; Save writes `"system": "pf1e"` or `"pf2e"`
- Layout: `app/src/shared` kernel, `app/src/shell` (chrome + collapsible Tools sidebar), `app/src/systems/pf1e`, `app/src/systems/pf2e`
- PF1e martial + spell calc (Fighter 5, Wizard 5, Fighter 2 / Wizard 3, Synthesist 5, Wizard 7, Cleric 5, Duelist 7, and Ranger 5 goldens) and PF2e core calc engine (Fighter 5, Wizard 5, Bard 5, Cleric 5, and Ranger 5 goldens)
- Spreadsheet editors per system (PF1e: identity/classes, abilities, skills, combat, spells, inventory, play)
- **Sidebar tools:** **Attack Helper**, **Actions List**, **Budget Calculator**, and the PF1e **Encyclopedia** (no in-app dice; physical table dice only)
- **Spanish:** the chrome and the PF1e panels are translated, and the catalog itself is too: rows show their Spanish name with the English one beside them, searchable either way. Your saved sheet keeps the English name.

## Docs

Start with the [docs index](docs/README.md). The most-used entries:

- [User & Player Guide](docs/user-guide.md)
- [Roadmap](docs/ROADMAP.md) — current status and next work
- [ADR 0003 — Multi-system product direction](docs/adr/0003-multi-system-product-direction.md) (current product lock)
- [Contributing Guide](CONTRIBUTING.md) · [Security Policy](SECURITY.md)

## Schema

- [`schemas/character.schema.json`](schemas/character.schema.json) — PF2e document (`schemaVersion` 1; optional `system: "pf2e"`)
- [`schemas/pf1e/character.schema.json`](schemas/pf1e/character.schema.json) — PF1e document (`schemaVersion` 1; required `system: "pf1e"`)
- [`fixtures/characters/minimal.example.json`](fixtures/characters/minimal.example.json)
- [`fixtures/characters/new-sheet.example.json`](fixtures/characters/new-sheet.example.json)
- [`fixtures/characters/golden/fighter-5.json`](fixtures/characters/golden/fighter-5.json) — PF2e Fighter 5
- [`fixtures/characters/golden/wizard-5.json`](fixtures/characters/golden/wizard-5.json) — PF2e Wizard 5
- [`fixtures/characters/golden/bard-5.json`](fixtures/characters/golden/bard-5.json) — PF2e Bard 5 (spontaneous occult)
- [`fixtures/characters/golden/cleric-5.json`](fixtures/characters/golden/cleric-5.json) — PF2e Cleric 5 (prepared divine)
- [`fixtures/characters/golden/ranger-5.json`](fixtures/characters/golden/ranger-5.json) — PF2e Ranger 5 (animal companion nested sheet)
- [`fixtures/characters/golden/pf1e/fighter-5.json`](fixtures/characters/golden/pf1e/fighter-5.json) — PF1e Fighter 5
- [`fixtures/characters/golden/pf1e/wizard-5.json`](fixtures/characters/golden/pf1e/wizard-5.json) — PF1e Wizard 5
- [`fixtures/characters/golden/pf1e/fighter-2-wizard-3.json`](fixtures/characters/golden/pf1e/fighter-2-wizard-3.json) — PF1e Fighter 2 / Wizard 3
- [`fixtures/characters/golden/pf1e/synthesist-5.json`](fixtures/characters/golden/pf1e/synthesist-5.json) — PF1e Summoner 5 Synthesist (Radiant Striker)
- [`fixtures/characters/golden/pf1e/wizard-transmutation-7.json`](fixtures/characters/golden/pf1e/wizard-transmutation-7.json) — PF1e Wizard 7 (Transmutation specialist, Flare Nightingale)
- [`fixtures/characters/golden/pf1e/cleric-5.json`](fixtures/characters/golden/pf1e/cleric-5.json) — PF1e Cleric 5
- [`fixtures/characters/golden/pf1e/fighter-5-duelist-2.json`](fixtures/characters/golden/pf1e/fighter-5-duelist-2.json) — PF1e Fighter 5 / Duelist 2 (prestige)
- [`fixtures/characters/golden/pf1e/ranger-5-companion.json`](fixtures/characters/golden/pf1e/ranger-5-companion.json) — PF1e Ranger 5 (animal companion)
- [`content/pf1e/crb/`](content/pf1e/crb/) — PF1e CRB pack (complete: all 177 feats and all 622 spells; mechanics-only)
- [`content/pf1e/apg/`](content/pf1e/apg/) — PF1e APG pack (Summoner class, Synthesist archetype, evolutions, and 27-spell catalog; mechanics-only)
- [`content/pf1e/ogc/`](content/pf1e/ogc/) — PF1e encyclopedia pack (829 rules summaries joined by catalog id; OGL 1.0a + Section 15)
- [`content/pf1e/names/`](content/pf1e/names/) — PF1e localized catalog names (curated Spanish name for all 980 catalog rows; mechanics-only)

## Trademark & Non-Affiliation Disclaimer

This application is an independent, community-created software tool.

"Pathfinder" and "Pathfinder Roleplaying Game" are registered trademarks of Paizo Inc. **TTRPG Character Sheet** is not affiliated with, endorsed, sponsored, or approved by Paizo Inc.

Game mechanics and rules references used in content packs are provided solely as uncopyrightable functional game statistics under the Open Game License (OGL 1.0a) mechanics-only policy outlined in [ADR 0007](docs/adr/0007-content-licensing.md).

## License

[MIT](LICENSE) · See [NOTICE](NOTICE) for attributions.
