# Phase 5 — after the First Edition sheet

**Status:** Current phase. Slices 5.1 and 5.2 are complete; **next is 5.3**. Live status: [`ROADMAP.md`](ROADMAP.md).  
**Depends on:** [ADR 0003](adr/0003-multi-system-product-direction.md), [ADR 0005](adr/0005-sidebar-host.md), [ADR 0007](adr/0007-content-licensing.md), [`content-licensing.md`](content-licensing.md), [`sidebar-host-design.md`](sidebar-host-design.md).

This file sequences Phase 5. It does not reopen the PF1e sheet, the three named sidebar tools, or the later PF2e release.

The multi-system increment plan ([`next-increment-multi-system.md`](archive/next-increment-multi-system.md)) is the executed record of Phases M through 1x. Do not use it to pick the next PR.

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

**Complete.** `shell.encyclopedia` is on the PF1e sidebar. Prose lives in `content/pf1e/ogc/` (829 rows: every CRB feat, CRB feature, CRB spell, and APG spell), joined to mechanic rows by catalog id. `content/pf1e/crb/` and `content/pf1e/apg/` stay mechanics-only. The designated Open Game Content field is `body`. Afflictions and Actions render as empty groups until a catalog exists for them.

---

## 3. Slice 5.2 — localized catalog names

Spec: [`pf1e-localized-names.md`](pf1e-localized-names.md).

**Complete.** Catalog labels are English pack content in every UI locale, and `es.json` must not absorb them: a row's label is keyed by catalog id and travels with the row through the pack registry, not through the locale runtime.

`content/pf1e/names/es.json` is a mechanics-only sidecar giving all 980 registered rows a curated Spanish name. The picker and the encyclopedia label rows in the active locale, keep the English name alongside as `altName`, and search both after folding case and accents. The **document is unchanged**: picking a row in a Spanish UI still writes the English `name`, so a saved character reads identically in either locale. The encyclopedia's `body` prose stays English, since that is an Open Game Content question rather than a name one.

---

## 4. Slice 5.3 — typed `effects[]`

`effects[]` stays an ignored hook until this slice. Unknown `type` values stay ignored after it.

Play-tab conditions are shown and read by Actions List and Attack Helper. `compute()` does not apply condition penalties. That boundary is stated in [`user-guide.md`](user-guide.md). This slice is where a typed effect may start changing derived numbers.

Do not build a general PF1e bonus-type stacker here. Feats, weapon Special tags, and inventory AC stay typed on the sheet unless a later slice says a specific effect applies them.

---

## 5. Slices 5.4 and 5.5

Card-oriented play surfaces and a third `system` module stay listed so design does not block them. Neither has a spec. Do not start either until 5.1–5.3 have landed, and do not pull in dice, cloud, VTT, a character library, or house-rule flags (ADR 0003 non-goals).

With 5.1 and 5.2 landed, **5.3 is the only remaining blocker** before either may be specced.

---

## 6. Done when

### 5.1

- [x] `content/pf1e/ogc/` holds the smoke set, OGL 1.0a, and Section 15; CRB and APG stay mechanics-only
- [x] `shell.encyclopedia` is on the PF1e sidebar only, lists that smoke set, and does not write the sheet
- [x] Afflictions and Actions groups are empty
- [x] Product Identity stays out. No SRD scrape
- [x] Existing PF1e and PF2e goldens still compute
- [x] Remaining packed feat, spell, and feature paragraphs in `entries.json`

### 5.2

- [x] A catalog row can carry a second, locale-specific name from a curated source
- [x] UI catalogs (`en.json` / `es.json`) do not contain those names
- [x] Packs that did not add prose stay `mechanics-only`

### 5.3

- [ ] At least one typed effect changes a derived number
- [ ] Unknown effect types are still ignored
- [ ] No general bonus-type stacker

---

Dated history of this file (through 2026-10-26) is archived in [`archive/encyclopedia-batches.md`](archive/encyclopedia-batches.md#phase-5-document-history).
