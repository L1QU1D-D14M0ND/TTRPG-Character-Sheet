# TTRPG Character Sheet — Product design

**Status:** Product direction lock (ADR 0003) — 2026-08-18  
**Implementation:** PF1e **0.9 bar landed**. **1.0 landed** — Synthesist golden + Spanish UI catalog + stability. The First Edition finish has landed (CRB catalog, APG follow-through, catalog picker, named sidebar tools, pre-release hygiene). **Current phase is Phase 5** ([`phase-5.md`](phase-5.md)): encyclopedia first, with the OGL notice in that change. Remaining PF2e work waits for a **later release** and is not Phase 5.  
**Next coding increment:** [`next-increment-multi-system.md`](next-increment-multi-system.md)  
**Repo context:** npm package `ttrpg-character-sheet`; GitHub [`TTRPG-Character-Sheet`](https://github.com/L1QU1D-D14M0ND/TTRPG-Character-Sheet) (renamed from `Pathfinder-2E-Card`, [ADR 0008](adr/0008-repo-package-rename.md))  
**Audience:** Product / engineering  
**Working display name:** TTRPG Character Sheet

System-specific specs:

- Pathfinder 1E — [`pf1e-character-sheet-design.md`](pf1e-character-sheet-design.md) ([ADR 0006](adr/0006-pf1e-character-schema.md))
- Pathfinder 2E — [`pf2e-dynamic-character-sheet-design.md`](pf2e-dynamic-character-sheet-design.md)
- Shared kernel — [`shared-kernel-design.md`](shared-kernel-design.md) ([ADR 0004](adr/0004-shared-kernel.md))
- Sidebar host — [`sidebar-host-design.md`](sidebar-host-design.md) ([ADR 0005](adr/0005-sidebar-host.md))

---

## 1. Purpose

Build a **dynamic character sheet** for **players** that can create, edit, recalculate, and **persist all information needed to play** a supported TTRPG **system** locally on desktop and mobile.

The first two systems are **Pathfinder First Edition** (development priority) and **Pathfinder Second Edition** (existing slice kept). The shell is a multi-system app, not a PF2e app with a 1E mode bolted on.

“Dynamic” means dependent values update when inputs change. “Complete” means the saved character covers player-facing sheet domains needed at the table **for that system**.

---

## 2. Locked decisions (product-level)

System-specific locks live in the PF1e / PF2e design docs. This table is the **app**.

| # | Topic | Decision |
| --- | --- | --- |
| 1 | Platform | **Installable PWA** — local/offline after install; mobile-compatible |
| 2 | UI | **Spreadsheet / Excel-like** plus a **loaded-sheet sidebar host** (tools TBD) — dense grids, tabs, plain inputs |
| 3 | Systems | Discriminated engines. 0.9/1.0 ship **PF1e** (priority) + **PF2e** (preserve). Further systems are reserved ids only |
| 4 | Priority | **Finish PF1e** in this release. Do not delete PF2e. Remaining PF2e goldens/content wait for a **later release** |
| 5 | Calc depth (1.0) | **Core calculations only** per system; expansion hooks (`effects[]`, overrides) |
| 6 | Persistence | **One sheet at a time** + **Save sheet** / **Load sheet**. No multi-character library, no cloud |
| 7 | Modes | **Build and Play** |
| 8 | UX polish | **Lightweight** — no fancy UI or animations |
| 9 | Interop | **No** Pathbuilder / Foundry / Hero Lab for now |
| 10 | Dice | **No** dice roller |
| 11 | Language | **English for 0.9**; **Spanish for 1.0** (i18n-ready strings from the start) |
| 12 | Stack | **TypeScript + React** |
| 13 | License | **MIT** (app) |
| 14 | Campaign / house rules | **Omit** optional flags in 0.9/1.0 — extras as custom rows |
| 15 | Save extension | **`.json`** |
| 16 | Working app title | **TTRPG Character Sheet** |
| 17 | Content | **Hybrid** curated pack per system; optional attributed open-data import later; **no GM-exclusive** content |
| 18 | Existing PF2e files | Load without `system` as **`pf2e`** |
| 19 | Sidebar | **Host** when a sheet is loaded; tools **read/write** the same document; tool list **TBD** ([ADR 0005](adr/0005-sidebar-host.md)) |

See [ADR 0003](adr/0003-multi-system-product-direction.md).

---

## 3. Goals and non-goals

### Goals by milestone

**0.9**

- Installable PWA; English UI; working title in chrome.
- Spreadsheet UI with Save / Load (one active character).
- Sidebar **host** may be empty or collapsed; **no named tools required**.
- User can **New** a PF1e or PF2e sheet (PF2e new-sheet path already exists).
- **PF1e** core calcs + editors enough to build and play the three PF1e goldens (martial, prepared caster, multiclass).
- **PF2e** existing slice still loads, computes, and round-trips (Fighter 5, Wizard 5). Not a full PF2e 0.9 catalog.
- Curated PF1e Core Rulebook player pack **enough to rebuild the PF1e goldens** (or goldens stay `custom` numeric inputs until the pack exists — pack may trail the engine, same pattern as current PF2e).

**1.0**

- Spanish localization.
- Same 0.9 CRB bar, stable.
- **PF1e:** player can build and play an **APG Synthesist Summoner** (fused eidolon on the same sheet).
- Still core calcs only.

**After 1.0** — landed. Honesty/code fixes, Wizard 7 playtest override, CRB player catalog (all 177 feats and all 622 spells), APG follow-through, optional PF1e goldens (Cleric 5, Fighter 5/Duelist 2, Ranger 5 with companion), catalog picker, named sidebar tools, and pre-release hygiene have landed.

**Phase 5 (current)** — [`phase-5.md`](phase-5.md).

- Encyclopedia (Spells / Afflictions / Actions **rules text**) as sidebar tool `shell.encyclopedia`, distinct from Actions List. The OGL notice ships in that same change.
- Localized catalog names (a second name per row; not UI-locale work).
- Typed `effects[]` automation.
- Optional card-oriented play surfaces.
- Additional systems behind the same `system` discriminator.

**Later PF2e release (not Phase 5)**

- Remaining PF2e goldens, companion editor, Remaster + legacy content packs, PF2e panel i18n.

### Non-goals (0.9/1.0)

- GM-only tools, encounter building, secret NPC stat blocks.
- Cloud sync, accounts, VTT replacement, dice roller.
- Fancy UI / animations.
- A third game system implementation.
- Merging PF1e and PF2e into one schema or one `compute()`.
- House-rule flag matrices (Free Archetype, PF1e Automatic Bonus Progression, etc.).
- Populated sidebar **tools** in 0.9 (the **host** may ship empty). Dice/VTT stay out even as future tools until an ADR says otherwise.

---

## 4. Architecture

```
Save file (.json)
  system: "pf1e" | "pf2e"   (+ reserved)
  schemaVersion
  …system-specific document…
        ↓
Load: pick schema + engine by system
        ↓
System calc engine → Derived view
        ↓
Shared spreadsheet chrome  +  sidebar host (read/write via update)
  + per-system panels (Combat, Spells, Play, Identity details)
  + shared-ish panels (Notes, generic row tables)
  + registered sidebar tools (shared and/or per system; list TBD)
```

### 4.1 Code layout

Phase M extracted the kernel. Current layout:

```text
app/src/
  shell/          # PWA chrome, tabs, Save/Load, New-system picker, registry, sidebar host
  shared/         # envelope, ids, Ajv helper, strip-derived, file IO, DerivedCell
  systems/
    pf2e/         # schema types, engine, PF2e-specific panels
    pf1e/         # schema types, engine, PF1e-specific panels, CRB pack lookup
```

The constraint is **one engine per system**, **no cross-imports between systems**, and **PF2e tests stay green**. `SystemModule` is registered per edition; the shell still branches on `system` to mount `Pf1eWorkspace` vs `Pf2eWorkspace` (the ADR 0004 `tabs` field is not on the module yet).

### 4.2 Envelope

- Every saved document has `schemaVersion` (integer, per-system numbering is allowed) and `system`.
- `system` is required on Save once the refactor lands.
- Load of current fixtures (no `system`) → `system: "pf2e"`.
- Validate against that system’s JSON Schema (Ajv 2020-12); reject invalid files.
- Save still strips `derived`.
- `overrides` and `extensions` remain the escape hatches in each system document.

PF2e schema file stays [`schemas/character.schema.json`](../schemas/character.schema.json); PF1e schema is [`schemas/pf1e/character.schema.json`](../schemas/pf1e/character.schema.json) ([ADR 0006](adr/0006-pf1e-character-schema.md)).

### 4.3 What is shared vs forked

Full inventory: [`shared-kernel-design.md`](shared-kernel-design.md) ([ADR 0004](adr/0004-shared-kernel.md)). Short form:

| Shared kernel | Per system |
| --- | --- |
| PWA, Vite, React shell, tab chrome, spreadsheet CSS | JSON Schema + TypeScript document types |
| Envelope (`schemaVersion`, `system`, meta timestamps/locale) | `compute(doc) →` that system’s `DerivedView` |
| `ContentRef` core, `Effect` stub, `OverrideValue`, coins, notes | Stacking, proficiency/BAB, AC, HP formula, skills, spells |
| Ajv helper, strip `derived`, file Save/Load | Class/skill tables, factories for strikes/spells |
| `DerivedCell`; later generic row tables | Combat / Spells / Play / Identity panels |
| Sidebar **host** + `SidebarToolContext` (`update`) | Named sidebar tools (TBD; may be shared or per system) |
| Golden-test helper; i18n with `shell.*` / `pf2e.*` / `pf1e.*` keys | Fixture numbers; content packs |

**Do not share:** one `CharacterDocument`, `ProficiencyRank`, typed PF2e bonus stacking, bulk, or a `compute()` that branches on edition.

The shell uses a `SystemModule` interface (validate, createEmpty, compute, tabs). Systems must not import each other.

---

## 5. Persistence

Unchanged from the PF2e lock except for `system`:

| Mechanism | Role |
| --- | --- |
| Save sheet | Export current character to a local `.json` file |
| Load sheet | Replace the active sheet by opening a saved file |
| Optional draft autosave | Single IndexedDB buffer — **not** a character library |
| New sheet | Pick system (PF1e or PF2e); factory for that system |

One active character. Switching system on an existing document is **not** supported (would be a destructive conversion). User creates a new sheet instead.

---

## 6. UI direction

**Spreadsheet metaphor:**

- Identity strip: name, level (or class-level summary for PF1e), current HP, and a small system badge.
- Tabs stay in the same family: Identity, Attributes/Abilities, Skills, Combat, Feats, Spells, Inventory, Play, Notes. Labels may differ per system (e.g. PF1e “Abilities” vs PF2e “Attributes”).
- Plain inputs; derived cells read-only and visually distinct.
- Prominent Save / Load / New.
- **Sidebar host** when a sheet is in memory: collapsible rail; tools and extra info; **read/write** through the same `update` as tabs ([`sidebar-host-design.md`](sidebar-host-design.md)). Tool list is unspecified; empty host is valid.
- Mobile: wide-table horizontal scroll; Play tab thumb-friendly; sidebar **collapsed by default**.
- No cards, no decorative motion.

**New sheet:** system choice before the empty factory runs.

**i18n:** All user-visible strings via message catalogs. Ship `en` in 0.9; `es` in 1.0. Chrome (`en.json` + `t()`) covers shell, tabs, PF1e Combat/Abilities/Skills, and Notes. Remaining PF2e panel literals extract when those panels change.

---

## 7. Content and licensing

- **App code:** MIT.
- **PF1e pack:** curated Core Rulebook **player-facing mechanic metadata** (ids, names, numbers). Open Game Content **prose** may be used under OGL 1.0a only after attaching the license and Section 15 in the same change ([ADR 0007](adr/0007-content-licensing.md), [`content-licensing.md`](content-licensing.md)). Do not paste Product Identity or GM-only adventure text. No third-party dump (d20pfsrd scrape, Hero Lab, etc.) as the ship pack.
- **PF2e pack:** still Remaster Player Core + Player Core 2, hybrid curated-first, optional attributed ORC import later. **Sequenced after** the PF1e 0.9 bar.
- Isolate content-resolve failures to the row; never fail whole-sheet load for one bad id.

Until a pack exists, **PF2e** goldens use `rulesetSource: "custom"` and filled numeric inputs. **PF1e** goldens use ContentRef `id`/`name` only (no `rulesetSource` on that document) plus filled numeric inputs; catalog stamps HD/BAB/saves when the player picks Fighter or Wizard.

---

## 8. Technical approach

| Concern | Choice |
| --- | --- |
| Language | TypeScript |
| UI | React |
| Styling | Minimal CSS tables/grids |
| State | One character document in memory; Save/Load `.json`; optional single draft buffer |
| Calcs | Pure functions + golden tests **per system** |
| Tests | Vitest + CI (already) |
| Validator | Ajv 2020-12, per-system schema |
| Offline | Service worker caches app shell + content packs |
| Telemetry | None |

---

## 9. Phased delivery

Live checkboxes: [`ROADMAP.md`](ROADMAP.md).

| Phase | Intent |
| --- | --- |
| 0 | Original PF2e design lock — **done** (ADR 0001/0002) |
| 0b | Multi-system product lock — **this document / ADR 0003** |
| M | Multi-system refactor; PF2e goldens still green; leave layout room for the sidebar rail |
| 1e | PF1e schema + core calc + Fighter 5 |
| 2e | PF1e Wizard 5 + system-specific editors |
| 3e | PF1e multiclass golden + remaining PF1e editors |
| 3c | PF1e Core content pack (may overlap 2e/3e) |
| Sb | Sidebar host (registry, collapse, empty state); **not** blocking 1e |
| 0.9 | English PWA; PF1e playable bar; PF2e slice non-regressed; sidebar host may be empty |
| 4 | Spanish + playable APG Synthesist Summoner; stability (**1.0**) |
| 1x | Finish First Edition — **done** (honesty/code fixes, CRB fill-out, APG follow-through, sidebar tools, hygiene) |
| 5 | **Current.** Encyclopedia, localized names, `effects[]`, optional card surfaces, additional systems ([`phase-5.md`](phase-5.md)). Later PF2e release stays separate |

---

## 10. Working product summary

- **Installable PWA**, spreadsheet UI, **TypeScript**, **MIT**.
- **Multi-system** save files; **PF1e priority**, **PF2e preserved**.
- **One character** loaded; **Save / Load**; **sidebar host** with Attack Helper, Actions List, and Budget Calculator.
- **Core calcs** for 0.9/1.0 with expansion hooks. Typed `effects[]` is Phase 5.3.
- **No** campaign house-rule flags, dice, cloud, or VTT.
- **English in 0.9**, **Spanish in 1.0**.
- **Phase 5** is current ([`phase-5.md`](phase-5.md)). Leftover PF2e catalog/goldens wait for a later release.

---

## Appendix — Document history

| Date | Change |
| --- | --- |
| 2026-08-17 | Initial umbrella design from ADR 0003 (PF1e-first multi-system pivot) |
| 2026-08-17 | Point §4 at shared-kernel inventory (ADR 0004) |
| 2026-08-17 | Loaded-sheet sidebar host; tools TBD (ADR 0005) |
| 2026-08-17 | Phase 1e schema (ADR 0006); tools wait until the sheet is ~90% done |
| 2026-08-17 | Phase 2e Wizard 5; Actions List named as a later tool |
| 2026-08-17 | Phase 3e Fighter 2 / Wizard 3; Budget Calculator named as a later tool |
| 2026-08-17 | Phase 3c batch 1: ability modifiers + BAB/saves |
| 2026-08-17 | Phase 3c batch 2: HP breakdown dialog + iterative attacks |
| 2026-08-17 | Annotate CRB batches 3–10; next is AC/CMB |
| 2026-08-17 | Layout §4.1 matches extracted kernel; PF1e goldens are not `rulesetSource` |
| 2026-08-18 | 1.0 bar includes playable APG Synthesist Summoner (CRB 0.9 unchanged) |
| 2026-08-18 | Content licensing review (ADR 0007): mechanics-only pack until rules text |
| 2026-08-18 | 1.0 APG slice 1: Summoner catalog + Synthesist name stamp |
| 2026-08-18 | Progress snapshot: PF1e 0.9 bar landed; 1.0 Synthesist in progress |
| 2026-08-19 | APG slice 2: documentary evolutions + fused overlay |
| 2026-08-19 | Synthesist golden (Half-Elf Radiant Striker); next is Spanish |
| 2026-08-19 | Spanish UI catalog (`es.json`); PF2e panel literals remain |
| 2026-08-19 | 1.0 stability pass; next is leftover PF2e work |
| 2026-08-19 | PF2e Bard 5 golden; next leftover is Cleric 5 |
| 2026-08-19 | PF2e Cleric 5 golden; next leftover is a companion user |
| 2026-08-19 | PF2e Ranger 5 golden (nested companion); next leftover is a PC2 class |
| 2026-08-19 | Finish First Edition this release; leftover PF2e waits for a later release |
| 2026-09-03 | Next code is honesty/code fixes; sidebar tools are the last character-sheet feature |
| 2026-09-12 | Wizard 7 playtest override and Phase 1x honesty/code fixes landed; next is remaining catalog |
| 2026-09-12 | Batches F1a–F1c landed (54 combat feats; 65 CRB feats total packed); next is F2a |
| 2026-09-14 | Document audit & sync: align First Edition finish status and next code step (F2a) |
| 2026-09-14 | Batch F2a landed (17 combat feats; 82 CRB feats packed); next is F2b |
| 2026-09-14 | Batch F2b landed (17 combat feats; 99 CRB feats packed); next is F2c |
| 2026-09-14 | Batch F2c landed (18 combat feats; 117 CRB feats packed; combat category complete); next is F3a |
| 2026-09-14 | Batches F3a–F3c landed (47 general feats; 164 CRB feats packed; general category complete); next is F4 |
| 2026-09-14 | Batch F4 landed (13 item creation + metamagic feats; all 177 CRB feats packed); next is S1 |
| 2026-09-14 | Batches S1–S5 landed (578 spells packed; all 622 CRB spells packed; CRB catalog complete); next is APG follow-through |
| 2026-09-20 | APG follow-through landed (Summoner spellsPerDay + 27 APG spells); synthesist-5 golden stamped |
| 2026-09-21 | Architecture deepening: PF1e catalog picker (ADR 0009 slices 1 & 2) landed |
| 2026-09-22 | Named sidebar tools (Attack Helper, Actions List, Budget Calculator) and pre-release hygiene landed |
| 2026-09-23 | Reliability & a11y pass: shared ModalDialog with focus management, shell ErrorBoundary, and draftStore connection fix |
| 2026-09-24 | Hygiene pass: HP breakdown dialog on ModalDialog, catalog picker capped first page, and override prototype pollution safety landed |
| 2026-10-03 | Phase 5 is current. First Edition finish and hygiene marked done |
