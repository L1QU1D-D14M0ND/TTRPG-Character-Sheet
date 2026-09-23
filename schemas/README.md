# Schemas

JSON Schema definitions for TTRPG Character Sheet save formats (repo: ttrpg-character-sheet).

| File | Purpose |
| --- | --- |
| [`character.schema.json`](character.schema.json) | One **PF2e** PC character sheet document (`schemaVersion` 1). [ADR 0002](../docs/adr/0002-character-schema.md). Optional `system` is `"pf2e"`; files without it still load as PF2e. Save always writes `system`. |
| [`pf1e/character.schema.json`](pf1e/character.schema.json) | One **PF1e** PC character sheet document (`schemaVersion` 1, independent of PF2e). [ADR 0006](../docs/adr/0006-pf1e-character-schema.md). `system` is required `"pf1e"`. |
| [`content/pf1e/pack.schema.json`](content/pf1e/pack.schema.json) | PF1e content-pack manifest (`contentKind`, `oglNoticeRequired`). |
| [`content/pf1e/*.schema.json`](content/pf1e/) | PF1e pack rows: class, race, item, feat, spell, feature, archetype, evolution. |

Do not add First Edition fields to `character.schema.json`. Do not add Second Edition fields to `pf1e/character.schema.json`. Pack JSON is validated at module load and in `packSchema.test.ts`.

Design notes: [`../docs/schema-design-notes.md`](../docs/schema-design-notes.md) (PF2e), [`../docs/pf1e-schema-design-notes.md`](../docs/pf1e-schema-design-notes.md) (PF1e).

Examples:

- [`../fixtures/characters/minimal.example.json`](../fixtures/characters/minimal.example.json) — minimal valid **PF2e** document
- [`../fixtures/characters/new-sheet.example.json`](../fixtures/characters/new-sheet.example.json) — PF2e factory-style sheet with auto-seeded skills
- [`../fixtures/characters/golden/fighter-5.json`](../fixtures/characters/golden/fighter-5.json) — PF2e Fighter 5
- [`../fixtures/characters/golden/wizard-5.json`](../fixtures/characters/golden/wizard-5.json) — PF2e Wizard 5
- [`../fixtures/characters/golden/bard-5.json`](../fixtures/characters/golden/bard-5.json) — PF2e Bard 5
- [`../fixtures/characters/golden/cleric-5.json`](../fixtures/characters/golden/cleric-5.json) — PF2e Cleric 5
- [`../fixtures/characters/golden/ranger-5.json`](../fixtures/characters/golden/ranger-5.json) — PF2e Ranger 5
- [`../fixtures/characters/golden/pf1e/fighter-5.json`](../fixtures/characters/golden/pf1e/fighter-5.json) — PF1e Fighter 5
- [`../fixtures/characters/golden/pf1e/wizard-5.json`](../fixtures/characters/golden/pf1e/wizard-5.json) — PF1e Wizard 5
- [`../fixtures/characters/golden/pf1e/fighter-2-wizard-3.json`](../fixtures/characters/golden/pf1e/fighter-2-wizard-3.json) — PF1e Fighter 2 / Wizard 3
- [`../fixtures/characters/golden/pf1e/synthesist-5.json`](../fixtures/characters/golden/pf1e/synthesist-5.json) — PF1e Summoner 5 Synthesist
- [`../fixtures/characters/golden/pf1e/wizard-transmutation-7.json`](../fixtures/characters/golden/pf1e/wizard-transmutation-7.json) — PF1e Wizard 7 (Transmutation specialist)
- [`../fixtures/characters/golden/pf1e/cleric-5.json`](../fixtures/characters/golden/pf1e/cleric-5.json) — PF1e Cleric 5
- [`../fixtures/characters/golden/pf1e/fighter-5-duelist-2.json`](../fixtures/characters/golden/pf1e/fighter-5-duelist-2.json) — PF1e Fighter 5 / Duelist 2 (prestige)
- [`../fixtures/characters/golden/pf1e/ranger-5-companion.json`](../fixtures/characters/golden/pf1e/ranger-5-companion.json) — PF1e Ranger 5 (animal companion)
