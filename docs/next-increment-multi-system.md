# Next increment — multi-system refactor, then PF1e

**Status:** Active sequencing document (2026-09-22)  
**Depends on:** [ADR 0003](adr/0003-multi-system-product-direction.md), [ADR 0004](adr/0004-shared-kernel.md), [ADR 0005](adr/0005-sidebar-host.md), [ADR 0007](adr/0007-content-licensing.md), [`ttrpg-character-sheet-design.md`](ttrpg-character-sheet-design.md), [`shared-kernel-design.md`](shared-kernel-design.md), [`sidebar-host-design.md`](sidebar-host-design.md), [`pf1e-character-sheet-design.md`](pf1e-character-sheet-design.md)  
**Historical PF2e increment (T1/T3 executed, leftover goldens deprioritized):** [`next-increment-design.md`](next-increment-design.md)

This document **does** change product sequencing: **finish First Edition** in this release; remaining PF2e work waits for a later *release*. It does **not** reopen PF2e schema math (ADR 0002) or authorize deleting the PF2e slice.

---

## 1. Purpose

The repo is a working multi-system sheet: **PF1e** is the development priority; **PF2e** is a preserved slice (schema, `compute()`, Fighter 5 / Wizard 5 / Bard 5 / Cleric 5 / Ranger 5 goldens, spreadsheet editors).

First Edition is **complete**: Feat batches F1–F4 (all 177 CRB feats) and spell batches S1–S5 (all 622 CRB spells) have landed, completing the entire CRB player catalog. APG follow-through (Summoner `spellsPerDay` + 27-spell catalog) landed. Catalog picker (ADR 0009 slices 1 & 2) and all three named sidebar tools (Attack Helper, Actions List, Budget Calculator) have landed. Next is pre-release / hygiene. Remaining **PF2e** work waits for a **later release** (PC2 golden, companion editor, Remaster packs, PF2e panel i18n). The PF2e slice stays in the app and must not regress. **1.0 landed:** Spanish (`es.json`) covers chrome + PF1e panels; PF2e panel literals remain. Batches 1–21, W1–W7, APG Synthesist, IndexedDB draft, and PWA dist check are in the repo.

---

## 2. Locked constraints

| Constraint | Source |
| --- | --- |
| Multi-system PWA, spreadsheet, React + TypeScript, MIT | ADR 0003 |
| PF1e development priority; PF2e slice must not regress | ADR 0003 |
| Existing Load files without `system` are PF2e | ADR 0003 |
| One sheet; Save/Load `.json`; no library, dice, VTT, house-rule flags | ADR 0003 |
| English 0.9 / Spanish 1.0; locale runtime + PF1e catalogs landed; `es.json` covers chrome + PF1e | ADR 0003 (T4′) |
| PF2e documents still validate against `schemas/character.schema.json` until a dedicated move is part of Phase M | ADR 0002 |
| Core calcs only; unknown `effects[]` ignored | ADR 0003 |
| Sidebar host when a sheet is loaded; tools TBD; empty host OK for 0.9 | ADR 0005 |

Settled PF2e engineering (keep through the refactor): Vitest, Ajv 2020-12 reject-on-invalid, `compute(doc) → DerivedView`, override allow-list, Fighter 5 + Wizard 5 goldens.

---

## 3. Current snapshot (repo at the pivot)

| Area | What exists |
| --- | --- |
| Product docs | ADR 0003–0007 + umbrella/PF1e/kernel/sidebar + Attack Helper + Actions List + Budget Calculator specs |
| Layout | `app/src/shared`, `shell`, `systems/pf1e`, `systems/pf2e` |
| Schema | PF2e `character.schema.json`; PF1e `schemas/pf1e/character.schema.json` |
| Engine | PF1e martial + spell DC/bonus slots; PF2e under `systems/pf2e/engine` |
| UI | PF1e + PF2e workspaces (PF1e Spells tab); empty Tools sidebar |
| Goldens | PF2e `fighter-5.json`, `wizard-5.json`, `bard-5.json`, `cleric-5.json`, `ranger-5.json`; PF1e `golden/pf1e/fighter-5.json`, `wizard-5.json`, `fighter-2-wizard-3.json`, `synthesist-5.json`, `wizard-transmutation-7.json` |
| Content | `content/pf1e/crb/` batches 1–21, W1–W7, and F1a–F1c (65 feats / 44 spells / 3 class features — golden, playtest, and combat-first-half rows). `content/pf1e/apg/` Synthesist + golden. Spanish UI catalog landed |

---

## 4. Sequencing

Pick **one** primary path. Default is **M then 1e**.

### Option M — Multi-system refactor (required first)

Move today’s PF2e `character/` + `engine/` (+ sheet panels as needed) behind a `system` switch. Add `system: "pf2e"` on Save; default missing `system` to `pf2e` on Load. New sheet still creates PF2e until PF1e factory exists — or New offers PF2e only until Phase 1e.

**Done when:** all existing Vitest tests pass; Load of current goldens works; Save of those characters includes `system: "pf2e"` (fixtures updated if the schema requires the field).

### Option 1e — PF1e schema + Fighter 5 (after M)

Schema file, types, factory, `compute()` for martial core, Identity/Abilities/Skills/Combat editors enough to enter the Fighter 5 golden, Vitest.

### Option 2e — PF1e Wizard 5 + spells editor

Spell DC, slots, list rows; Wizard 5 golden.

### Option 3e — Multiclass golden

Fighter 2 / Wizard 3 (or equivalent); proves stacked BAB/saves. May be a thin engine+fixture increment if editors already allow two class rows.

### Option T4′ — i18n prelude

Extract current chrome to `en.json` **before** a large PF1e UI wave. Same rationale as the skipped T4. Recommended as a **thin prelude or parallel** to M/1e, not instead of them.

### Option Sb — Sidebar host (after M, not instead of 1e)

Wire the collapsible rail + registry + `SidebarToolContext`. Zero tools is a valid empty state. Do **not** invent placeholder widgets.

### Not next (historical — at the 2026-08-17 pivot)

Several of these have since landed or moved: Bard/Cleric/Ranger 5 goldens exist; Spanish landed; companion editor / Remaster / PC2 remain a **later PF2e release**. Named sidebar tools stay out of honesty/catalog/APG work; they are the last character-sheet feature.

- PF2e companion nested sheet, Remaster pack, PC2 golden, PF2e panel i18n
- A third game system
- Full 1E bonus-type stacker or feat automation
- Named sidebar tools during M/Sb/1e/2e/3e/honesty/pack fill-out

### Recommendation

**CRB catalog complete: all 177 feats and all 622 spells packed.** Magic overlay landed. → **APG follow-through next** (Summoner `spellsPerDay` + spell catalog) → then optional goldens / OGL-with-rules-text. **Attack Helper**, **Actions List**, and **Budget Calculator** are the **last character-sheet features** (not during schema, pack, or honesty work). M / 1e / 2e / 3e / 1.0 / honesty fixes already landed.

---

## 5. Work packages

### WP-M — Shell / discriminator + kernel

| Option | Notes |
| --- | --- |
| **M1. Kernel + folder move + `system` field** (recommended) | `app/src/shared`, `app/src/shell`, `app/src/systems/pf2e`. Lift IDs, signed, Ajv helper, strip-derived, file IO. Schema: add optional `system` enum to PF2e schema (`pf2e` only); Save writes `system`. Register PF2e as the only `SystemModule`. See [shared kernel §12](shared-kernel-design.md). |
| M2. Wrapper envelope `{ system, character }` | Breaks every fixture; do not |
| M3. Parallel app / route | Two PWAs; rejects the product |
| M4. Shared `CharacterDocument` with optional 1E fields | Forbidden by ADR 0004 |

**Action:** keep `schemas/character.schema.json` path for PF2e in this increment (less churn). Do **not** extract `SheetTable` or a bonus-type library in M. Genericize `applyOverrides` only if PF2e tests stay green with an allow-list callback; otherwise move it with PF2e and genericize in 1e. Leave CSS/layout room for a sidebar rail.

### WP-Sb — Sidebar host

Collapsible `<aside>`, tool registry, empty state, context `{ character, derived, update }`. No named tools. See [`sidebar-host-design.md`](sidebar-host-design.md).

### WP-1e — PF1e martial slice

Schema ADR + JSON Schema + types + factory + compute (abilities, BAB, saves, HP, AC trio, CMB/CMD, iteratives, skills, pounds) + Fighter 5 golden + enough UI to enter that character.

### WP-2e — PF1e caster slice

Spellcasting entry editor; DC; slots; Wizard 5 golden.

### WP-3e — Multiclass

Second class row; stacked progressions; multiclass golden.

### WP-F — i18n

`en.json` + `es.json` + `t(key)`; `character.meta.locale`. PF2e panel literals remain.

### WP-3c — PF1e CRB pack

After goldens can be typed by hand. Review CRB character mechanics **two at a time** ([`pf1e-crb-pack-design.md`](pf1e-crb-pack-design.md) §2 and §6). Batches 1–21 and W1–W7 landed (including Batch 7). Draft buffer + PWA proof landed. OGL/PI review landed ([ADR 0007](adr/0007-content-licensing.md)). APG slice 3 + Synthesist golden landed ([`pf1e-apg-pack-design.md`](pf1e-apg-pack-design.md)). Spanish UI catalog landed. 1.0 stability landed. Honesty fixes and Wizard 7 playtest override landed. CRB catalog fill-out complete (all 177 feats and 622 spells packed). APG follow-through (Summoner `spellsPerDay` + 27 spells) landed. All three sidebar tools (Attack Helper, Actions List, Budget Calculator) landed. Resolver: miss → custom; do not fail Load.

---

## 6. Recommended default plan

| Step | Package | Deliverable |
| --- | --- | --- |
| 1 | Docs (this PR) | ADR 0003–0005, umbrella + PF1e + kernel + sidebar host, roadmap |
| 2 | WP-M | Shared kernel + multi-system shell; PF2e goldens green; `system` on Save; layout room for rail |
| 3 | WP-F (thin) | Extract existing English chrome |
| 4 | WP-1e | PF1e schema + martial `compute()` + Fighter 5 + New→PF1e |
| 5 | WP-2e | Wizard 5 + spells UI |
| 6 | WP-3e | Multiclass golden |
| 7 | WP-3c | Minimal CRB pack for golden ids |
| 7b | WP-Sb | Sidebar host (empty registry); after M, not blocking 1e |
| 8 | Platform | IndexedDB draft; PWA install/offline proof |
| 9 | 0.9 | English; PF1e bar; PF2e slice still works; sidebar host may be empty |
| 10 | Phase 4 | `es` + playable APG Synthesist = 1.0 |
| 11 | 1x | Finish First Edition (honesty/code fixes [landed], playtest priority [landed], CRB catalog [landed], magic overlay [landed], APG follow-through [next], optional goldens, OGL-with-rules-text, **then** sidebar tools as the last sheet feature) |
| 12 | Later release | Leftover PF2e goldens/content; encyclopedia / `effects[]` / more systems |

Steps 2–10, Phase 1x honesty fixes, and CRB catalog fill-out (all 177 feats and all 622 spells) landed. The **next development increment** is APG follow-through (Summoner `spellsPerDay` + spell catalog).

---

## 7. Definitions of done

### This documentation increment

- [x] ADR 0003 accepted in-repo; ADR 0001 marked superseded
- [x] Umbrella + PF1e system spec + PF1e schema notes
- [x] Roadmap tracks PF1e-first phases
- [x] PF2e design/schema docs labeled as system specs, not the app 0.9 bar
- [x] Shared-kernel inventory ([ADR 0004](adr/0004-shared-kernel.md), [`shared-kernel-design.md`](shared-kernel-design.md))
- [x] Sidebar host lock ([ADR 0005](adr/0005-sidebar-host.md), [`sidebar-host-design.md`](sidebar-host-design.md))

### Phase M

- [x] `system` on saved PF2e documents
- [x] Load without `system` still works (current goldens)
- [x] PF2e unit + golden tests pass
- [x] `shared/` + `shell/` + `systems/pf2e/` (or equivalent); systems do not import each other
- [x] PF2e registered as a `SystemModule`; no edition `if` in math
- [x] Kernel includes at least: `newId`, strip-derived, Ajv error format, file Save/Load wiring, `DerivedCell`
- [x] Shell layout can host a sidebar rail (empty/collapsed OK)

### Phase Sb

- [x] Collapsible rail on a loaded sheet
- [x] Registry + empty state; tools would receive `character`, `derived`, `update`
- [x] Attack Helper implementation (landed)
- [x] Actions List implementation (landed)
- [x] Budget Calculator implementation (landed)

### Phase 1e

- [x] PF1e schema validates Load/Save
- [x] `compute()` for martial core
- [x] Fighter 5 golden
- [x] New sheet can create PF1e

### Phase 2e

- [x] Spell DC + bonus spells from ability
- [x] Spellcasting editor
- [x] Wizard 5 golden

### Phase 3e

- [x] Two class rows; stacked BAB/saves
- [x] Fighter 2 / Wizard 3 golden

### Phase 3c (mechanic batches done; OGL review landed)

- [x] Batch 1: ability modifiers + BAB/save progressions (review + Fighter/Wizard tags)
- [x] Batch 2: HP breakdown dialog (manual HD rolls) + iterative attacks
- [x] Batch 3: AC / touch / FF + CMB / CMD (CRB write-up + table tests)
- [x] Batch 4: skills (ranks, class +3, ACP) + max ranks
- [x] Batch 5: size tables (AC/attack vs CMB/CMD vs carry)
- [x] Batch 6: encumbrance (Strength table; light / medium / heavy) + Ignore weight
- [x] Batch 8: Human race catalog id
- [x] Batch 9: Fighter/Wizard class skills + skill points
- [x] **Batch 10:** weapons/armor ids
- [x] **Batch 11:** remaining 9 CRB classes (same catalog row as Fighter/Wizard)
- [x] **Batch 12:** feat catalog ids
- [x] **Batch 13:** spell catalog ids
- [x] **Batch 7:** spell DC / bonus slots (table tests; slots stay typed)
- [x] **Batch 14:** remaining CRB player races + size stamp
- [x] **Batch 15:** class spells-per-day tables + hybrid Max
- [x] IndexedDB one-key draft + PWA build verify
- [x] OGL / Product Identity review (mechanics-only pack; [ADR 0007](adr/0007-content-licensing.md))

### Phase 4 (1.0 landed)

- [x] APG slice 1: Summoner catalog + Synthesist name ([`pf1e-apg-pack-design.md`](pf1e-apg-pack-design.md))
- [x] Documentary evolution names + fused overlay
- [x] Synthesist golden (Half-Elf Radiant Striker)
- [x] Spanish (`es`) catalog
- [x] 1.0 stability pass

### PF1e 0.9 bar

- [x] Fighter 5 golden
- [x] Wizard 5 golden
- [x] Multiclass golden
- [x] Editors for those domains (no familiar nested sheet)
- [x] `en` catalog for shell chrome + PF1e panels; locale runtime; `es.json` covers those keys (PF2e panel literals remain)
- [x] PWA dist artifacts (`verify:pwa`); runtime offline is a manual `app/README.md` step
- [x] PF2e Fighter 5 / Wizard 5 still pass
- [x] Sidebar host may be empty; named tools not required

---

## 8. Risks

| ID | Risk | Mitigation |
| --- | --- | --- |
| M1 | Refactor breaks PF2e goldens | Move first, no math changes; keep tests green |
| M2 | One shared `CharacterDocument` type grows `#ifdef` fields | Separate types; union at the shell ([ADR 0004](adr/0004-shared-kernel.md)) |
| M4 | Over-extracting SheetTable / bonus stacker in Phase M | Kernel §12: only extract what PF2e already needs; second caller in 1e |
| P2 | 1E bonus-type rabbit hole | Explicit AC fields in 0.9 ([PF1e design §4.3](pf1e-character-sheet-design.md)) |
| N3 | UI strings proliferate | T4′ before PF1e editor wave |
| N2 | Content licensing | No scrape; ADR 0007 mechanics-only pack; OGL notice in the same PR as rules text |
| S1 | Repo still named Pathfinder-2E-Card | **Historical.** npm/package/`$id` renamed ([ADR 0008](adr/0008-repo-package-rename.md)); GitHub slug is owner-admin |

---

## 9. Audit notes (2026-08-17; merged local `main` 2026-08-18)

Code/docs pass after Phases M–3e and 3c batches 1–2. **First pass:** Wizard 5 slots **4/4/3/2**; `miscDamage` with null damage ability; attack-override slash line.

**Decisions (implemented on local `main`):** 1A New-sheet picker with Cancel abort (boot stays PF2e). 2B `tempScore` + keep `tempModifier`. 3A last-wins BAB; Combat flags BAB vs iteratives separately. 4A one `other` field; Combat states it applies to all three ACs. 5A warn when ranks > level (no clamp). 6B blank Disable Device / UMD / Handle Animal at 0 ranks; blank Fly without a fly speed. 7B full attack-row fields. 8C no extra CMD/max-Dex copy. 9B `en.json` + `t()` for chrome (shell, tabs, PF1e Combat/Abilities/Skills, Notes). 10B shared `ContentRef`/`Effect`/`applyOverrides`/`Notes`/`Currency`.

**Branch audit (2026-08-18):** Ancestors of `origin/main` need no merge. `pf1e-multiclass-budget-990b` had the same tree as #8 (histories joined). `audit-docs-code-cad8` merged. **Do not merge** `setup-cloud-agent-env-2c8f` (old tree) or `multi-system-docs-990b` (parallel rewrite; 17 conflicts; missing CRB 1–2). **2026-09-03:** publish tip is post–batch 21 / W7 (`4433597`); 0.9 + APG slice 1 is no longer the tip.

**Still sequenced (finish First Edition; leftover PF2e later release):**

| Item | Disposition |
| --- | --- |
| Documentary evolution names + fused overlay | Landed (slice 2; evolutions not auto-applied) |
| Synthesist golden | Landed (Half-Elf Radiant Striker) |
| Spanish (`es`) catalog | Landed (chrome + PF1e panels; PF2e literals remain) |
| 1.0 stability | Landed (goldens compute; Save stamps `meta.locale`) |
| PF2e Bard 5 golden | Landed (spontaneous occult; signature spells typed) |
| PF2e Cleric 5 golden | Landed (prepared divine; Divine Font typed) |
| PF2e Ranger 5 golden | Landed (nested wolf companion; `computeCompanion`; no companion editor) |
| OGL notice + Section 15 | Same PR as first pack **rules text** |
| App’s one typed switch to pick `pf1eModule` vs `pf2eModule` | TypeScript cannot erase the `LoadedSheet` union; tabs stay inside each Workspace |
| Remaining PF2e panel literals | Later PF2e *release* (when those panels next change) |
| Finish First Edition (honesty/code fixes, CRB fill-out, APG follow-through, catalog picker, sidebar tools) | Landed (CRB feats/spells complete, APG Summoner spells complete, catalog picker landed, sidebar tools landed). Pre-release / hygiene landed |
| Leftover PF2e (PC2 golden, companion editor, Remaster packs) | Later *release* |

---

## Appendix — Document history

| Date | Change |
| --- | --- |
| 2026-08-17 | First multi-system / PF1e-first increment plan |
| 2026-08-17 | Phase M includes shared kernel (ADR 0004) |
| 2026-08-17 | Sidebar host (ADR 0005); tools unspecified |
| 2026-08-17 | Phase M/Sb implemented; Attack Helper reserved as later tool |
| 2026-08-17 | Phase 1e implemented; tools deferred until sheet ~90% done |
| 2026-08-17 | Phase 2e Wizard 5; Actions List reserved as later tool |
| 2026-08-17 | Phase 3e Fighter 2 / Wizard 3; Budget Calculator reserved as later tool |
| 2026-08-17 | Phase 3c batch 1: ability modifiers + BAB/saves; CRB pack scaffold |
| 2026-08-17 | Phase 3c batch 2: HP breakdown dialog + iterative attacks |
| 2026-08-17 | Annotate CRB batches 3–10; next increment is batch 3 only |
| 2026-08-17 | Audit: Wizard 5 slots 4/4/3/2; remaining design notes in §9 |
| 2026-08-17 | Implement audit decisions 1A–10B (picker, tempScore, chrome i18n, kernel types) |
| 2026-08-18 | Local `main` merge of audit + branch audit; next code remains batch 3 table tests |
| 2026-08-18 | Batch 3 AC/CMB table tests landed; next code is batch 4 skills |
| 2026-08-18 | Batch 4 skill totals + max ranks landed; next code is batch 5 size |
| 2026-08-18 | Batch 5 size tables landed; next code is batch 6 encumbrance |
| 2026-08-18 | Batch 6 encumbrance + Ignore weight landed; next code is batch 8 Human |
| 2026-08-18 | Batch 8 Human catalog landed; next code is batch 9 class skills |
| 2026-08-18 | Batch 9 class skills + skill-point pool landed; next code is batch 10 weapons/armor |
| 2026-08-18 | Batch 10 documentary weapons/armor ids landed; next code is remaining 9 CRB classes |
| 2026-08-18 | Batch 11 remaining 9 CRB classes landed (reuse Fighter/Wizard catalog); next is feat ids |
| 2026-08-18 | Batch 12 documentary feat ids landed; 1.0 bar includes Synthesist Summoner |
| 2026-08-18 | Batch 13 documentary spell ids landed; next is Batch 7 pack review |
| 2026-08-18 | Batch 7 spell DC + bonus-spells table tests landed; next is PWA proof |
| 2026-08-18 | IndexedDB draft + PWA verify landed; next is OGL then 1.0 |
| 2026-08-18 | OGL / PI review landed (ADR 0007); next code is 1.0 |
| 2026-08-18 | APG slice 1: Summoner catalog + Synthesist name; next is evolutions + fused overlay |
| 2026-08-18 | Progress snapshot: PF1e 0.9 bar landed; publishing local main to origin |
| 2026-08-19 | Architecture correction: locale runtime, system registry, pack schemas, PF1e i18n + a11y, jsdom tests. Next code is evolutions + fused overlay |
| 2026-08-19 | APG slice 2: documentary evolutions + fused overlay; next is Synthesist golden |
| 2026-08-19 | Synthesist golden (Half-Elf Radiant Striker); next is Spanish |
| 2026-08-19 | Spanish catalog (`es.json`) for chrome + PF1e panels; next is 1.0 stability |
| 2026-08-19 | 1.0 stability: locale stamped on Save; all six goldens still compute |
| 2026-08-19 | PF2e Bard 5 golden (spontaneous occult); next is Cleric 5 |
| 2026-08-19 | PF2e Cleric 5 golden (prepared divine); next is a companion user |
| 2026-08-19 | PF2e Ranger 5 golden (nested wolf companion); next is a PC2 class |
| 2026-08-19 | Finish First Edition this release; leftover PF2e waits for a later release |
| 2026-08-19 | CRB batch 14: remaining player races + size stamp; next is spells-per-day tables |
| 2026-08-27 | CRB batch 15: class spells-per-day + hybrid Max; next is remaining catalog rows |
| 2026-08-27 | Remaining mundane CRB weapons/armor locked as batches 16–21; magic gear reserved later |
| 2026-08-27 | CRB batch 16: remaining simple melee + simple ranged; next mundane equipment is martial weapons |
| 2026-08-27 | CRB batch 17: martial light + remaining martial one-handed; next is martial two-handed + bows |
| 2026-08-27 | CRB Special tags (reach, brace, trip, disarm, monk, nonlethal, double) queued one type per PR after all weapon ids; `weapon.properties` is an array (2+ tags; later magic uses the same list) |
| 2026-08-27 | CRB batch 18: martial two-handed + martial ranged and arrows; next is exotic weapons |
| 2026-08-27 | CRB batch 19: exotic melee + exotic ranged and repeating bolts; next catalog is W1 reach |
| 2026-08-27 | CRB W1: reach on N-tag `weapon.properties` (one or many); next is W2 brace |
| 2026-08-27 | CRB W2: brace appended (one or many tags); next is W3 trip |
| 2026-08-27 | CRB W3: trip appended (one or many tags); next is W4 disarm |
| 2026-08-28 | CRB W4: disarm appended (one or many tags); next is W5 monk |
| 2026-09-01 | CRB W5: monk appended (one or many tags); next is W6 nonlethal |
| 2026-09-01 | CRB W6: nonlethal appended (one or many tags); next is W7 double |
| 2026-09-01 | CRB W7: double appended plus documentary secondHead; next is Batch 20 armor |
| 2026-09-01 | CRB batch 20: remaining light + medium armor; next is heavy armor + shields |
| 2026-09-01 | CRB batch 21: heavy armor + shields + extras; next is remaining feats/spells |
| 2026-09-03 | Next code is honesty/code fixes; sidebar tools are the last character-sheet feature |
| 2026-09-03 | Remaining CRB feat/spell ids locked (F1–F4, S1–S5); packing waits for honesty/code fixes |
| 2026-09-12 | Stakeholder priority override (Wizard 7 Transmutation specialist Flare Nightingale) landed |
| 2026-09-12 | Phase 1x honesty / code fixes landed (W7 test renames, golden weapon stamps, focusTab wired) |
| 2026-09-12 | Batches F1a–F1c landed (54 combat feats; 65 CRB feats packed); next code is F2a |
| 2026-09-14 | Document sync: update status date, CRB feat counts (65), and next code recommendation to F2a |
| 2026-09-14 | Batch F2a landed (17 combat feats; 82 CRB feats packed); next is F2b |
| 2026-09-14 | Batch F2b landed (17 combat feats; 99 CRB feats packed); next is F2c |
| 2026-09-14 | Batch F2c landed (18 combat feats; 117 CRB feats packed; combat category complete); next is F3a |
| 2026-09-14 | Batches F3a–F3c landed (47 general feats; 164 CRB feats packed; general category complete); next is F4 |
| 2026-09-14 | Batch F4 landed (13 item creation + metamagic feats; all 177 CRB feats packed); next is S1 |
| 2026-09-14 | Batches S1–S5 landed (578 spells packed; all 622 CRB spells packed; CRB catalog complete); next is APG follow-through |
| 2026-09-20 | APG follow-through landed (Summoner spellsPerDay + 27 APG spells); synthesist-5 golden stamped |
| 2026-09-21 | Architecture deepening: PF1e catalog picker (ADR 0009 slices 1 & 2) landed |
| 2026-09-22 | Named sidebar tools (Attack Helper, Actions List, Budget Calculator) and pre-release hygiene landed |
