# ADR 0003 — Multi-system TTRPG sheet (PF1e first)

**Status:** Accepted  
**Date:** 2026-08-17  
**Supersedes:** [ADR 0001](0001-product-direction.md) (PF2e-only product lock)  
**Context:** Stakeholder asked whether the project can pivot from a Pathfinder 2E-only sheet into a broader TTRPG tool, with Pathfinder First Edition added and **prioritized over 2E**. Feasibility review of the current schema, calc engine, and spreadsheet shell concluded: 1E is a second engine, not a PF2e variant; the existing layering makes a multi-system refactor tractable if the working PF2e slice is kept as a regression safety net.

This ADR does **not** implement code. It replaces the product lock. Schema/engine/UI work follows the [roadmap](../ROADMAP.md) and [next increment](../next-increment-multi-system.md).

## Decision

Build a **lightweight installable PWA** **player** character sheet for **multiple TTRPG systems**, spreadsheet-style UI, **Build + Play**, **TypeScript**, **MIT**.

**Development priority:** Pathfinder **First Edition** is the next system to take to a playable 0.9 bar. Pathfinder **Second Edition** remains a first-class system in the architecture; the existing PF2e vertical slice (schema, `compute()`, Fighter 5 / Wizard 5 goldens, spreadsheet editors) is **kept and must not regress**. Remaining PF2e 0.9 work (extra goldens, companion editor, Remaster content packs) is **deprioritized** until the PF1e 0.9 bar is met, unless a later ADR says otherwise.

Other systems (Starfinder, D&D 5e, etc.) are **architecture-only** for 0.9/1.0: the shell must not assume PF1e/PF2e are the only possible `system` values, but no third engine ships in those milestones.

| Area | Choice |
| --- | --- |
| Product | Multi-system player character sheet (not a VTT, not a GM suite) |
| Platform | Installable PWA; offline after install; mobile-compatible |
| UI | Excel-like tables/tabs **plus a loaded-sheet sidebar host** (tools TBD); no fancy UI or animations |
| Systems in 0.9/1.0 | **PF1e** (priority to complete) + **PF2e** (existing slice preserved) |
| System discriminator | Top-level `system` on every save file (`pf1e` \| `pf2e`); missing field on existing files means `pf2e` |
| Engines | One calc engine **per system**; shared shell, persistence, and golden-test harness |
| PF1e ruleset | **0.9** Core Rulebook player-facing. **1.0** also a playable APG Synthesist Summoner. No GM exclusives |
| PF2e ruleset | Unchanged from ADR 0001: Remaster-first; legacy fallback; Player Core + Player Core 2 (deferred fill-out) |
| Content acquisition | Hybrid — curated pack first per system; optional attributed open-data import later (OGL 1.0a for PF1e Open Game Content; ORC for PF2e Remaster) after license review |
| Calc depth (0.9/1.0) | Core math only; `effects[]` / automation later |
| Persistence | One active sheet; Save sheet / Load sheet (local JSON); optional single draft buffer |
| Character types | All player character types **in that system’s** data model (PF1e includes free multiclassing + prestige as class rows) |
| Modes | Build and Play |
| Dice | No dice roller (a future sidebar tool does not reopen this unless a later ADR says so) |
| Campaign options | Omit house-rule flags for 0.9/1.0 (PF2e Free Archetype; PF1e traits/variant rules). Extra feats/traits entered as custom rows |
| i18n | English in 0.9; Spanish in 1.0. Chrome uses `en.json` + `t()`; remaining PF2e panel literals extract when those panels change |
| Language | TypeScript |
| UI framework | React |
| Save files | `.json` |
| Working app title | **TTRPG Character Sheet** |
| Interop | No Pathbuilder / Foundry / Hero Lab integration for now |
| License | MIT (app). Content packs follow the source license; curated stats/summaries only; no GM-only text dumps |
| PF1e golden tests | Fighter 5; Wizard 5; one multiclass (see design § goldens) |
| PF2e golden tests | Existing Fighter 5 + Wizard 5 stay required regressions. Remaining ADR 0001 goldens (Cleric, Bard/Sorcerer, companion, PC2) move to **post-PF1e-0.9** |

## What does not transfer (why two engines)

PF2e proficiency ranks, typed item/status/circumstance stacking, single AC, MAP strikes, bulk, hero points, and the dying track do not implement PF1e. PF1e needs ability scores (not boosts), per-class BAB and save progressions, skill ranks, three ACs + CMB/CMD, iterative attacks, pounds/encumbrance, spell DCs of `10 + spell level + ability`, and a `classes[]` identity (free multiclass). Shared code is the **kernel** in [ADR 0004](0004-shared-kernel.md): PWA shell, spreadsheet chrome, Save/Load + Ajv, derived-cell pattern, generic override *application*, row-editor patterns, i18n, golden-fixture helper — not proficiency math, stacking, or a unified character type.

## Consequences

- ADR 0001 is historical for the PF2e-only lock. PF2e **system** rules in [the PF2e design](../pf2e-dynamic-character-sheet-design.md) and [ADR 0002](0002-character-schema.md) remain in force for PF2e documents.
- Next **code** increment is a multi-system refactor (move PF2e under a system module; add `system` on save/load) **before** a PF1e schema/engine. Existing PF2e goldens stay green through that refactor.
- Do not delete or freeze-rot the PF2e engine to “make room” for 1E.
- GitHub repository name `Pathfinder-2E-Card` is unchanged until a later rename decision. **Superseded 2026-08-28 — see [ADR 0008](0008-repo-package-rename.md).**
- 0.9 is redefined: a playable **PF1e** sheet plus a non-regressed PF2e slice, not “finish every PF2e golden.”
- Content Phase 3 splits per system; PF1e Core pack is sequenced before the PF2e Remaster pack.
- Shared vs forked code is locked in [ADR 0004](0004-shared-kernel.md). Phase M extracts the kernel with PF2e as the first consumer.
- Sidebar **host** (read/write rail when a sheet is loaded; tools unspecified) is locked in [ADR 0005](0005-sidebar-host.md). Empty/collapsed host is enough for 0.9; tool list comes later.
- A future ADR will lock the PF1e JSON schema (analog of ADR 0002). Envelope rules in this ADR and [PF1e schema notes](../pf1e-schema-design-notes.md) are the standing defaults until then.

**Postscript (2026-08-18):** Phase 3c continues through CRB feat/spell catalog ids. **1.0** is Spanish **plus** a playable APG **Synthesist Summoner** (fused eidolon). 0.9 stays Core Rulebook goldens. Summoner does not go in the CRB pack. APG slice 1 (Summoner tags + Synthesist name) landed 2026-08-18. See [`pf1e-apg-pack-design.md`](../pf1e-apg-pack-design.md).

**Postscript (2026-08-18, licensing):** Content licensing review is [ADR 0007](0007-content-licensing.md). The CRB pack stays mechanics-only (no OGL notice until rules text). 1.0 APG pack follows the same bar.

**Postscript (2026-08-28, rename):** Stakeholder triggered the "Repo / npm package rename" override from the table below. Repo and npm package renamed to `ttrpg-character-sheet` — see [ADR 0008](0008-repo-package-rename.md). The Consequences line above about the repo name being unchanged is superseded by that ADR.

**Postscript (2026-08-19):** Stakeholder override: **finish First Edition** in this release. Remaining PF2e work (PC2 golden, companion editor, Remaster packs, PF2e panel i18n) waits for a **later release**. The PF2e slice stays in the app and must not regress. See [`ROADMAP.md`](../ROADMAP.md) Phase 1x.

**Postscript (2026-08-27):** Batch 15 hybrid Max superseded the defaults-table row “PF1e spells per day = user-entered max slots in 0.9”. Default Max is class table + bonus spells; a typed number is an override ([ADR 0006](0006-pf1e-character-schema.md) postscript).

**Postscript (2026-09-03):** **Sidebar tools are the last character-sheet feature** in the First Edition finish (Attack Helper, Actions List, Budget Calculator). They are not gated on a “~90% sheet” midpoint. Next code after mundane CRB 16–21 / W1–W7 is honesty/code fixes, then remaining feats/spells.

**Postscript (2026-09-12):** Stakeholder override: for the next slice, prioritize getting the app to an **optimal state to build and play a specific PF1e playtest character** — a CRB Wizard 7, Transmutation specialist (opposition schools Necromancy and Enchantment) — ahead of the default Phase 1x order (honesty fixes → remaining feats/spells → APG follow-through → optional goldens → magic overlay → OGL → sidebar tools). That default order resumes once this bar is met; it is not replaced.

Pulled forward: Wizard **arcane school** modeling (school pick + opposition schools, structured not just notes — this is CRB core, already flagged as a gap in [`pf1e-character-sheet-design.md`](../pf1e-character-sheet-design.md) row 10), the specialist's **bonus school spell slot**, the three CRB **school powers** (Physical Enhancement, Telekinetic Fist, Arcane Bond) as documentary catalog features, and a CRB spell/feat catalog fill **targeted at this character's spellbook and feat list** rather than the locked F1–F4/S1–S5 alphabetical order (that order still governs whatever this targeted pass doesn't cover). Also pulled forward: exposing the already-schema'd `vitals.resistances`/`senses`/`speeds` in a PF1e panel, since no panel reaches them today.

**Not** overridden: the "omit house-rule flags" default stays — the character's homebrew Mana pool and Hero Points get no new mechanical subsystem, they fit the existing generic `play.dailyResources` rows. Sidebar tools stay the last character-sheet feature; this override does not pull one in earlier. See [`ROADMAP.md`](../ROADMAP.md) Phase 1x ("priority override: playtest character") and the full transcription in [`pf1e-playtest-flare-nightingale.md`](../pf1e-playtest-flare-nightingale.md).

## Defaults for open questions

These are **locked for sequencing** unless the stakeholder overrides them. See also [the umbrella design](../ttrpg-character-sheet-design.md) § open picks.

| Pick | Default | Override if… |
| --- | --- | --- |
| Working display name | TTRPG Character Sheet | Stakeholder picks a marketing name |
| Repo / npm package rename | Not in 0.9 | Stakeholder wants a rename PR |
| How broad in 0.9/1.0 | PF1e + PF2e only; other `system` ids reserved | A third system is explicitly pulled in |
| PF1e books for 0.9 | Core Rulebook, player-facing | APG (traits, extra classes) is pulled in |
| PF1e books for 1.0 | 0.9 CRB bar **plus** APG Summoner / Synthesist far enough to play | Broader APG (all base classes, Magical Child, etc.) |
| PF1e goldens | Fighter 5; Wizard 5; Fighter 2 / Wizard 3 (or equivalent BAB mix) | Cleric/familiar is needed sooner |
| Resume remaining PF2e goldens | Later *release* (after finishing PF1e) | Stakeholder wants PF2e finished in this release |
| Missing `system` on Load | Treat as `pf2e` | Never; would break current fixtures |
| PF1e BAB/saves/HD | Engine tables for the 11 CRB classes + user-picked progression on custom/prestige rows | Fully user-entered BAB (weaker golden) |
| PF1e spells per day | Hybrid Max: class table + bonus spells; typed number overrides; empty resets (Batch 15 / ADR 0006) | Fully user-entered forever |
| Third nearby system (Starfinder 1e) | Out of scope; architecture must not make it impossible | Explicitly added later |
| Sidebar tools in 0.9 | Host only (empty/collapsed OK); no named tools | A specific tool is pulled into 0.9 |
| Sidebar tools vs pack fill-out | **Last character-sheet feature** after honesty fixes, remaining catalog, APG follow-through, optional goldens, magic overlay, and OGL-with-rules-text | A named tool is pulled in earlier |

## References

- [`../ttrpg-character-sheet-design.md`](../ttrpg-character-sheet-design.md) — umbrella product design
- [`../shared-kernel-design.md`](../shared-kernel-design.md) — reuse / `SystemModule` (ADR 0004)
- [`../pf1e-character-sheet-design.md`](../pf1e-character-sheet-design.md) — PF1e system spec
- [`../pf2e-dynamic-character-sheet-design.md`](../pf2e-dynamic-character-sheet-design.md) — PF2e system spec (still valid)
- [`../ROADMAP.md`](../ROADMAP.md)
- [`../next-increment-multi-system.md`](../next-increment-multi-system.md)
- [`0001-product-direction.md`](0001-product-direction.md) — superseded
- [`0002-character-schema.md`](0002-character-schema.md) — PF2e schema, still accepted
- [`0004-shared-kernel.md`](0004-shared-kernel.md) — reuse boundaries
- [`0005-sidebar-host.md`](0005-sidebar-host.md) — loaded-sheet sidebar; tools TBD
