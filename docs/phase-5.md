# Phase 5 — after the First Edition sheet

**Status:** Current phase (2026-10-03). First Edition finish and pre-release hygiene have landed.  
**Live checkboxes:** [`ROADMAP.md`](ROADMAP.md) Phase 5.  
**Depends on:** [ADR 0003](adr/0003-multi-system-product-direction.md), [ADR 0005](adr/0005-sidebar-host.md), [ADR 0007](adr/0007-content-licensing.md), [`content-licensing.md`](content-licensing.md), [`sidebar-host-design.md`](sidebar-host-design.md).

This file sequences Phase 5. It does not reopen the PF1e sheet, the three named sidebar tools, or the later PF2e release.

The multi-system increment plan ([`next-increment-multi-system.md`](next-increment-multi-system.md)) is the executed record of Phases M through 1x. Do not use it to pick the next PR.

---

## 1. What Phase 5 is

Phase 5 starts now that the PF1e sheet, CRB and APG catalogs, catalog picker, and named sidebar tools (Attack Helper, Actions List, Budget Calculator) have landed. Pre-release hygiene (non-affiliation disclaimer, NOTICE, About dialog, CONTRIBUTING, SECURITY) has landed.

Phase 5 is five slices, in this order:

| Slice | Work | License |
| --- | --- | --- |
| **5.1** | Spells / Afflictions / Actions **encyclopedia** (rules text) | OGL 1.0a + Section 15 in the **same** change as the first prose |
| **5.2** | Localized catalog names | Stays mechanics-only. A name is not prose ([`content-licensing.md`](content-licensing.md) §5) |
| **5.3** | Typed `effects[]` automation | Engine math. Not a bonus-type stacker. Not rules prose |
| **5.4** | Optional card-oriented play surfaces | No spec yet. Do not start during 5.1–5.3 |
| **5.5** | Additional systems behind `system` | Architecture already allows a third module. No third engine in this slice |

**Not Phase 5.** The later PF2e release stays frozen: one Player Core 2 class golden, companion nested-sheet editor, override cell editor, Remaster and legacy packs, PF2e panel i18n. Do not start that work in a Phase 5 PR. The PF2e slice must keep computing.

---

## 2. Slice 5.1 — encyclopedia

Spec: [`sidebar-tools-encyclopedia.md`](sidebar-tools-encyclopedia.md).

The smoke set has landed. `shell.encyclopedia` is on the PF1e sidebar. Prose lives in `content/pf1e/ogc/`, joined to mechanic rows by catalog id. `content/pf1e/crb/` and `content/pf1e/apg/` stay mechanics-only. The designated Open Game Content field is `body`.

Landed entries: the smoke set, batch E-R, and every feat batch, F1a through F4 and F0 (all 177 CRB feats). Afflictions and Actions render as empty groups. The remaining rows are added one batch per change. Next is **L9b** (CRB spell level 9, final part). Then the remaining CRB spell levels, then the APG spells. See [`sidebar-tools-encyclopedia.md`](sidebar-tools-encyclopedia.md).

---

## 3. Slice 5.2 — localized catalog names

Catalog labels are English pack content in every UI locale. A Spanish player searches "Shield", not "escudo". `es.json` must not absorb those names.

This slice adds a second name per catalog row from a curated translation source. It does not attach the OGL notice. It does not wait on 5.1 for licensing reasons; it waits only so 5.1 stays the single next PR.

---

## 4. Slice 5.3 — typed `effects[]`

`effects[]` stays an ignored hook until this slice. Unknown `type` values stay ignored after it.

Play-tab conditions are shown and read by Actions List and Attack Helper. `compute()` does not apply condition penalties. That boundary is stated in [`user-guide.md`](user-guide.md). This slice is where a typed effect may start changing derived numbers.

Do not build a general PF1e bonus-type stacker here. Feats, weapon Special tags, and inventory AC stay typed on the sheet unless a later slice says a specific effect applies them.

---

## 5. Slices 5.4 and 5.5

Card-oriented play surfaces and a third `system` module stay listed so design does not block them. Neither has a spec. Do not start either until 5.1–5.3 have landed, and do not pull in dice, cloud, VTT, a character library, or house-rule flags (ADR 0003 non-goals).

---

## 6. Done when

### 5.1

- [x] `content/pf1e/ogc/` holds the smoke set, OGL 1.0a, and Section 15; CRB and APG stay mechanics-only
- [x] `shell.encyclopedia` is on the PF1e sidebar only, lists that smoke set, and does not write the sheet
- [x] Afflictions and Actions groups are empty
- [x] Product Identity stays out. No SRD scrape
- [x] Existing PF1e and PF2e goldens still compute
- [ ] Remaining packed feat, spell, and feature paragraphs in `entries.json`

### 5.2

- [ ] A catalog row can carry a second, locale-specific name from a curated source
- [ ] UI catalogs (`en.json` / `es.json`) do not contain those names
- [ ] Packs that did not add prose stay `mechanics-only`

### 5.3

- [ ] At least one typed effect changes a derived number
- [ ] Unknown effect types are still ignored
- [ ] No general bonus-type stacker

---

## Appendix — Document history

| Date | Change |
| --- | --- |
| 2026-10-03 | Phase 5 opened. First Edition and hygiene marked done. Next code is slice 5.1 (encyclopedia + OGL notice in one change) |
| 2026-10-03 | Slice 5.1 prose locked in `content/pf1e/ogc/` ([`sidebar-tools-encyclopedia.md`](sidebar-tools-encyclopedia.md)). Mechanic packs stay mechanics-only |
| 2026-10-04 | Encyclopedia smoke set landed (`shell.encyclopedia`, four `body` entries). Remaining catalog prose is follow-through |
| 2026-10-04 | Batch E-R landed. Next encyclopedia batch is F1a |
| 2026-10-04 | Batch F1a landed. Next encyclopedia batch is F1b |
| 2026-10-04 | Batch F1b landed. Next encyclopedia batch is F1c |
| 2026-10-04 | Batch F1c landed. Next encyclopedia batch is F2a |
| 2026-10-05 | Batch F2a landed. Next encyclopedia batch is F2b |
| 2026-10-05 | Batch F2b landed. Next encyclopedia batch is F2c |
| 2026-10-05 | Batch F2c landed. Next encyclopedia batch is F3a |
| 2026-10-25 | Batch F3a landed. Next encyclopedia batch is F3b |
| 2026-10-25 | Batch F3b landed. Next encyclopedia batch is F3c |
| 2026-10-25 | Batch F3c landed. Next encyclopedia batch is F4 |
| 2026-10-25 | Batch F4 landed. Next encyclopedia batch is F0 |
| 2026-10-25 | Batch F0 landed. All 177 CRB feats have a summary. Next encyclopedia batch is L0 |
| 2026-10-25 | Batch L0 landed (28 level 0 spells). Next encyclopedia batch is L1a |
| 2026-10-25 | Batch L1a landed. Next encyclopedia batch is L1b |
| 2026-10-25 | Batch L1b landed. Next encyclopedia batch is L1c |
| 2026-10-25 | Batch L1c landed. Next encyclopedia batch is L1d |
| 2026-10-25 | Batch L1d landed. Next encyclopedia batch is L1e |
| 2026-10-25 | Batch L1e landed. Spell levels 0 and 1 complete. Next encyclopedia batch is L2a |
| 2026-10-25 | Batch L2a landed. Next encyclopedia batch is L2b |
| 2026-10-25 | Batch L2b landed. Next encyclopedia batch is L2c |
| 2026-10-25 | Batch L2c landed. Next encyclopedia batch is L2d |
| 2026-10-25 | Batch L2d landed. Next encyclopedia batch is L2e |
| 2026-10-25 | Batch L2e landed. Spell levels 0-2 complete. Next encyclopedia batch is L3a |
| 2026-10-25 | Batch L3a landed. Next encyclopedia batch is L3b |
| 2026-10-25 | Batch L3b landed. Next encyclopedia batch is L3c |
| 2026-10-25 | Batch L3c landed. Next encyclopedia batch is L3d |
| 2026-10-25 | Batch L3d landed. Spell levels 0-3 complete. Next encyclopedia batch is L4a |
| 2026-10-25 | Batch L4a landed. Next encyclopedia batch is L4b |
| 2026-10-25 | Batch L4b landed. Next encyclopedia batch is L4c |
| 2026-10-25 | Batch L4c landed. Next encyclopedia batch is L4d |
| 2026-10-25 | Batch L4d landed. Spell levels 0-4 complete. Next encyclopedia batch is L5a |
| 2026-10-25 | Batch L5a landed. Next encyclopedia batch is L5b |
| 2026-10-25 | Batch L5b landed. Next encyclopedia batch is L5c |
| 2026-10-25 | Batch L5c landed. Next encyclopedia batch is L5d |
| 2026-10-25 | Batch L5d landed. Spell levels 0-5 complete. Next encyclopedia batch is L6a |
| 2026-10-25 | Batch L6a landed. Next encyclopedia batch is L6b |
| 2026-10-25 | Batch L6b landed. Next encyclopedia batch is L6c |
| 2026-10-25 | Batch L6c landed. Next encyclopedia batch is L6d |
| 2026-10-25 | Batch L6d landed. Spell levels 0-6 complete. Next encyclopedia batch is L7a |
| 2026-10-26 | Batch L7a landed. Next encyclopedia batch is L7b |
| 2026-10-26 | Batch L7b landed. Next encyclopedia batch is L7c |
| 2026-10-26 | Batch L7c landed. Spell levels 0-7 complete. Next encyclopedia batch is L8a |
| 2026-10-26 | Batch L8a landed. Next encyclopedia batch is L8b |
| 2026-10-26 | Batch L8b landed. Next encyclopedia batch is L8c |
| 2026-10-26 | Batch L8c landed. Spell levels 0-8 complete. Next encyclopedia batch is L9a |
| 2026-10-26 | Batch L9a landed. Next encyclopedia batch is L9b |
