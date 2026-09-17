# ADR 0006 — PF1e character document JSON schema v1

**Status:** Accepted  
**Date:** 2026-08-17  
**Context:** Product lock is [ADR 0003](0003-multi-system-product-direction.md) (PF1e first, PF2e preserved). [ADR 0002](0002-character-schema.md) remains the contract for **PF2e** save files. [ADR 0004](0004-shared-kernel.md) forbids extending the PF2e schema with First Edition fields or sharing one TypeScript `CharacterDocument`. Target notes: [`../pf1e-schema-design-notes.md`](../pf1e-schema-design-notes.md). System spec: [`../pf1e-character-sheet-design.md`](../pf1e-character-sheet-design.md).

## Decision

Use [`schemas/pf1e/character.schema.json`](../../schemas/pf1e/character.schema.json) as **schemaVersion 1** for a single Pathfinder First Edition PC sheet:

- Authoritative **inputs** + **play state**. Optional **`derived`** cache — **omitted on Save sheet**.
- Discriminator **`system` is required** and must be `"pf1e"`. (PF2e still allows omitting `system` on Load.)
- **`schemaVersion` 1** is the PF1e document version. It is independent of PF2e’s `schemaVersion`.
- **`classes[]`** is the class list. Total level is **derived** (sum of `classes[].levels`). Do not store a competing `identity.level` input.
- Ability input is a final **score** per key, not PF2e boosts. Modifier = `floor((score + tempScore − 10) / 2)` plus optional `tempModifier`. `tempScore` is a score addend (bonus spells, carry); `tempModifier` is a check/DC addend only.
- BAB and saves are **not** user totals. They come from per-class progressions (`full` / `threeQuarter` / `half` BAB; `good` / `poor` saves), then stack. Manual totals go through **`overrides`**.
- AC uses **explicit buckets** (armor, shield, Dex via `maxDex`, size, natural, deflection, dodge, other) rather than a 12-type bonus graph. Armor check penalty is a user field on `armorClass` for 0.9.
- Skills are **rank-based**. Class-skill +3 when trained (`ranks >= 1`). No `ProficiencyRank`. Skill **keys must not contain `.`** so override paths `derived.skillTotals.<key>` stay unambiguous (use `knowledge-arcana`, not `knowledge.arcana`).
- Inventory weight is **pounds** (numbers; `0.5` allowed). No bulk. Load category is derived from Strength (and size) tables. Optional `inventory.ignoreWeight` sets the derived category to `ignored` without dropping carried pounds.
- **`currentHp` may be negative.** No dying/wounded/doomed track. No hero points / focus pool in this document.
- Spell slots are **user-entered** (max/remaining). Spell DC (`10 + spell level + ability`) and bonus-spells-from-ability are derived in `compute()`; slots themselves are not auto-filled from the class table.
- Open **`effects[]`** hooks: unknown `type` is ignored. **`extensions`** bag for experiments. No campaign-options block.
- Nested companions are a **stub array**. 1.0 Synthesist extends that stub (`kind: eidolon`, optional fused overlay, documentary evolutions), not a nested sheet. Optional `classes[].archetype` is a documentary ContentRef (name stamp only).
- **No maximum character level** in schema.
- Content ids: kebab-case paths (`class.fighter`, `feat.power-attack`, `race.human`). `ContentRef` is `{ id, name }` plus optional publication source — **no** Remaster/legacy fields.

## Consequences

- The app **must** validate PF1e documents against `schemas/pf1e/character.schema.json` on Load and before Save (Ajv 2020-12).
- The shell dispatches Load by `system`. A `pf1e` file must not be parsed with the PF2e schema (and the reverse).
- Save serializer strips `derived` and writes `"system": "pf1e"`.
- New-character factory inserts the CRB skill list that is not a Craft/Perform/Profession wildcard (Knowledges auto-seeded).
- Iterative attacks follow CRB: extra attacks when BAB ≥ 6, in −5 steps, maximum four from BAB. Fighter 5 is a **single** +5 attack, not +5/+0.
- Migrations required when PF1e `schemaVersion` increments.

**Postscript (2026-08-19):** Optional `companions[]` `kind: eidolon` with `fused` overlay and documentary `evolutions[]` for 1.0 Synthesist. Does not bump `schemaVersion`. Evolutions do not write fused scores. CRB goldens omit the fields; the Synthesist golden uses them.

**Postscript (2026-08-27):** `spellcasting[].slots[].max` may be null (or omitted). Null uses class table + ability bonus as the displayed Max. A number is a custom override. Remaining stays play state. Does not bump `schemaVersion`.

**Postscript (2026-09-12):** Optional `classes[].arcaneSchool` with `specialized` and `opposition[]` (Wizard school specialization and opposition schools; documentary). Does not bump `schemaVersion`. Exercised in `wizard-transmutation-7.json`.

## References

- [`../../schemas/pf1e/character.schema.json`](../../schemas/pf1e/character.schema.json)
- [`../../fixtures/characters/golden/pf1e/fighter-5.json`](../../fixtures/characters/golden/pf1e/fighter-5.json)
- [`../../fixtures/characters/golden/pf1e/wizard-5.json`](../../fixtures/characters/golden/pf1e/wizard-5.json)
- [`../../fixtures/characters/golden/pf1e/fighter-2-wizard-3.json`](../../fixtures/characters/golden/pf1e/fighter-2-wizard-3.json)
- [`../../fixtures/characters/golden/pf1e/synthesist-5.json`](../../fixtures/characters/golden/pf1e/synthesist-5.json)
- [`../../fixtures/characters/golden/pf1e/wizard-transmutation-7.json`](../../fixtures/characters/golden/pf1e/wizard-transmutation-7.json)
- [`../pf1e-schema-design-notes.md`](../pf1e-schema-design-notes.md)
- [`../pf1e-character-sheet-design.md`](../pf1e-character-sheet-design.md)
- [`0002-character-schema.md`](0002-character-schema.md) — PF2e documents only
- [`0003-multi-system-product-direction.md`](0003-multi-system-product-direction.md)
- [`0004-shared-kernel.md`](0004-shared-kernel.md)
