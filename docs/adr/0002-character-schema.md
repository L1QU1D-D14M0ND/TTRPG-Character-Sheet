# ADR 0002 — Character document JSON schema v1

**Status:** Accepted (PF2e documents only)  
**Date:** 2026-08-13  
**Context:** Product direction locked in ADR 0001; Save/Load format needed before calc engine and UI. Stakeholder answered schema open questions. [ADR 0003](0003-multi-system-product-direction.md) does **not** retire this schema: it remains the contract for Pathfinder 2E save files. The PF1e schema is [ADR 0006](0006-pf1e-character-schema.md). Do not extend this schema with First Edition fields.

## Decision

Use `schemas/character.schema.json` as **schemaVersion 1** for a single PC sheet:

- Authoritative **inputs** + **play state**
- Optional **`derived`** cache — **omitted on Save sheet**
- **`ContentRef`** with Remaster→legacy→custom provenance
- Open **`effects[]`** hooks and **`extensions`**
- Nested **`CompanionSheet`** subset
- **`overrides`** map for manual totals
- No campaign-option block
- **Decimal bulk** (`0.1` = 1L)
- **User-entered final attribute boosts** (no partial pairing automation yet)
- **Auto-seed** standard skills in the app factory
- **Strike snapshots** linked by `itemId`
- **One shared focus pool** on `play`
- **No maximum character level** in schema
- Content ids: kebab-case paths (`class.fighter`, …)

## Consequences

- The app **must** validate documents against `schemas/character.schema.json` on Load and before Save.
- Load and Save run JSON Schema validation (Ajv 2020-12). Invalid files are rejected.
- Save serializer strips `derived`.
- New-character factory inserts the 16 standard skills.
- Level-up / proficiency math must not assume a max level of 20.
- Migrations required when `schemaVersion` increments.

## References

- [`../../schemas/character.schema.json`](../../schemas/character.schema.json)
- [`../../fixtures/characters/minimal.example.json`](../../fixtures/characters/minimal.example.json)
- [`../schema-design-notes.md`](../schema-design-notes.md)
- [`0001-product-direction.md`](0001-product-direction.md) — superseded product lock
- [`0003-multi-system-product-direction.md`](0003-multi-system-product-direction.md) — current product lock
- [`../continuation-design.md`](../archive/continuation-design.md) — S1/S4 implementation options (executed)
- [`../next-increment-design.md`](../archive/next-increment-design.md) — historical PF2e options after S1/S4
- [`../next-increment-multi-system.md`](../archive/next-increment-multi-system.md) — current sequencing
