# ADR 0004 — Shared kernel vs per-system modules

**Status:** Accepted  
**Date:** 2026-08-17  
**Depends on:** [ADR 0003](0003-multi-system-product-direction.md)  
**Context:** The product is a multi-system sheet (PF1e first, PF2e preserved). ADR 0003 already forbids one calc engine and one character schema. This ADR locks **what to reuse** so Phase M does not either (a) copy-paste the shell into two apps or (b) grow a single `CharacterDocument` with `#ifdef` fields.

Detail and inventories: [`../shared-kernel-design.md`](../shared-kernel-design.md).

## Decision

Split the codebase into three layers:

1. **Platform** — Vite, React, PWA, CI, spreadsheet CSS. One app.
2. **Shared kernel** — envelope, persistence wiring, IDs, `ContentRef` core, `Effect` stub, override *application*, row-table UI primitives, i18n helper, golden-test helper. No edition math.
3. **System modules** — PF2e and PF1e each own schema, document types, `compute()`, class/skill tables, Combat / Spells / Play / Identity panels, and **optional sidebar tools**.

The shell talks to a system through a **`SystemModule` interface** (id, `displayNameKey`, validate, createEmpty, compute, `Workspace`, save filename, `sidebarTools`). Tabs stay inside each Workspace (tab ids and strip chrome differ per edition). The active sheet is a discriminated union. App retains **one** typed switch to mount `pf1eModule` vs `pf2eModule` (TypeScript cannot erase the union). **Do not** share one TypeScript `CharacterDocument` or one JSON Schema `oneOf` body.

The loaded-sheet **sidebar host** is shell chrome ([ADR 0005](0005-sidebar-host.md)): tools read/write the same document via `update`. Host extraction may start in Phase M as an empty rail; named tools are later.

**Extract during Phase M** (with PF2e as the first consumer) so PF1e does not duplicate Save/Load. **Do not** extract a generic `SheetTable` or a 12-type bonus stacker in Phase M unless a second caller already exists in the same PR.

## Consequences

- PF2e `ModifierBreakdown`, `ProficiencyRank`, bulk, MAP strikes, dying track, and hero/focus fields stay in `systems/pf2e`. PF1e BAB/saves/iteratives/pounds stay in `systems/pf1e`.
- Shared types are **structural** (id, name, summary, slots max/remaining, currency coins, six ability *keys*). Shared functions are **mechanical but edition-blind** (`newId`, `signed`, strip `derived`, Ajv compile-with-schema, path-based override apply with a **per-system allow-list**).
- Lookalikes (AC, “level”, spell DC, encumbrance) keep **different names or types** when the math differs, even if the spreadsheet tab is titled the same.
- A later system (Starfinder, 5e) should be able to register another `SystemModule` without editing PF1e/PF2e engines.

## References

- [`../shared-kernel-design.md`](../shared-kernel-design.md)
- [`../ttrpg-character-sheet-design.md`](../ttrpg-character-sheet-design.md)
- [`../next-increment-multi-system.md`](../archive/next-increment-multi-system.md)
- [`0003-multi-system-product-direction.md`](0003-multi-system-product-direction.md)
- [`0005-sidebar-host.md`](0005-sidebar-host.md)
