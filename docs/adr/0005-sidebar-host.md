# ADR 0005 — Loaded-sheet sidebar host (tools TBD)

**Status:** Accepted  
**Date:** 2026-08-17  
**Depends on:** [ADR 0003](0003-multi-system-product-direction.md), [ADR 0004](0004-shared-kernel.md)  
**Supersedes (UI slice):** ADR 0001 “Later reference UI = sidebar with Spells / Afflictions / Actions” as the *definition* of the sidebar. That encyclopedia remains a **future tool**, not the host.

**Context:** The loaded character sheet is a spreadsheet. Stakeholder wants a **sidebar** that appears when a sheet is loaded, showing tools and extra information, with **read and write** access to that sheet. Specific tools will be named later.

Detail: [`../sidebar-host-design.md`](../sidebar-host-design.md).

## Decision

When a character document is in memory (New or Load), the shell shows a **sidebar host** beside the spreadsheet: a collapsible rail that can display **extra information** and **tools**.

- **One document.** Tools read `character` + `derived` and write only through the same `update(mutator)` path as sheet tabs. No parallel copy, no bypass of Ajv on Save, no private undo stack that diverges from the sheet.
- **Registry, not a hard-coded encyclopedia.** The host is a slot. Tools register (shared and/or per `SystemModule`). Unspecified tools must be addable without redesigning chrome or forking persistence.
- **Sheet stays primary.** Spreadsheet tabs remain the full editor. The sidebar is companion chrome, not a second character sheet. Mobile: collapsed by default; sheet stays usable full-width.
- **Tool implementations are not specified** except three named later tools: **Attack Helper** ([`../sidebar-tools-attack-helper.md`](../sidebar-tools-attack-helper.md)) — weapon + feat preview, **no dice**; **Actions List** ([`../sidebar-tools-actions-list.md`](../sidebar-tools-actions-list.md)) — what the PC can do now, with unavailable actions **greyed out** and a one-word / short-sentence reason; and **Budget Calculator** ([`../sidebar-tools-budget-calculator.md`](../sidebar-tools-budget-calculator.md)) — buy vs craft cost, time, DC, and requirements. None is on the PF1e 0.9 critical path. **Postscript (2026-09-03):** they are the **last character-sheet features** in the First Edition finish, not a “~90% sheet” midpoint. Pulling a tool that contradicts a non-goal (in-app dice, VTT, cloud) still needs its own lock.
- **UI chrome only for tool layout.** Which tool is open / whether the rail is collapsed is **session UI state**, not a save-file field, unless a specific tool must persist something — then it writes through `update` into the character (`extensions` or a later schema field).

## Consequences

- Phase M should leave room in the shell layout for the rail (even if collapsed/empty) so Phase Sb is not a full-width retrofit.
- Phase **Sb** (sidebar host) follows M; it does **not** block Phase 1e. 0.9 may ship with an empty or collapsed host.
- **Attack Helper** is a named later tool: weapon + feat preview; physical dice only.
- **Actions List** is a named later tool: current action menu; grey-out + short reason from conditions.
- **Budget Calculator** is a named later tool: shopping list with buy vs craft totals, craft time/DC/requirements, and short reasons when the PC cannot craft a line.
- ADR 0001’s Spells / Afflictions / Actions browser is a candidate **encyclopedia** tool (rules text), distinct from Actions List (this PC, right now).
- Sidebar strings go through i18n (`shell.tools*`, tool keys under `shell.*` or `pf1e.*` / `pf2e.*`).

**Postscript (2026-09-03):** Named tools (Attack Helper, Actions List, Budget Calculator) ship as the **last character-sheet feature** after Phase 1x honesty/code fixes, remaining catalog, APG follow-through, optional goldens, and OGL-with-rules-text (magic overlay landed). The “~90% done” gate is retired. Empty/collapsed host remains correct until then.

**Postscript (2026-09-22):** Attack Helper, Actions List, and Budget Calculator have landed.

**Postscript (2026-10-03):** The encyclopedia is Phase 5.1 (`shell.encyclopedia`), not a host redesign. See [`../phase-5.md`](../phase-5.md). Do not stub it before that slice. The OGL notice ships in the same change as its rules text.

## Defaults

| Pick | Default | Override if… |
| --- | --- | --- |
| 0.9 tools populated | **No** — host may be empty/collapsed | Attack Helper or another named tool is pulled into 0.9 |
| Host on New (empty sheet) | **Yes** — any in-memory document |
| Collapse default (desktop) | Collapsed when `tools.length === 0`; otherwise expanded unless the user toggled |
| Collapse default (narrow) | Collapsed |
| Dice / VTT in the sidebar | **Out.** Attack Helper shows expressions only; player rolls physical dice |

## References

- [`../sidebar-host-design.md`](../sidebar-host-design.md)
- [`../sidebar-tools-attack-helper.md`](../sidebar-tools-attack-helper.md)
- [`../sidebar-tools-actions-list.md`](../sidebar-tools-actions-list.md)
- [`../sidebar-tools-budget-calculator.md`](../sidebar-tools-budget-calculator.md)
- [`../ttrpg-character-sheet-design.md`](../ttrpg-character-sheet-design.md)
- [`../shared-kernel-design.md`](../shared-kernel-design.md)
- [`../ROADMAP.md`](../ROADMAP.md)
- [`../phase-5.md`](../phase-5.md)
- [`0001-product-direction.md`](0001-product-direction.md)
- [`0003-multi-system-product-direction.md`](0003-multi-system-product-direction.md)
- [`0004-shared-kernel.md`](0004-shared-kernel.md)
