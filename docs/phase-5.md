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

## 2. Slice 5.1 — encyclopedia (next code)

The named tools were the gate. They have landed, so this is the next PR.

The encyclopedia is a **sidebar tool**, not the host and not Actions List. Actions List is what this PC can do right now. The encyclopedia is reference text for spells, afflictions, and actions ([ADR 0005](adr/0005-sidebar-host.md), [`sidebar-host-design.md`](sidebar-host-design.md)).

Reserved id: `shell.encyclopedia`. Do not stub it in the registry until this slice. Register it the same way as the other `shell.*` tools. It reads the loaded sheet and must not add a second Save path, a dice roller, or a second character sheet.

### First prose is the OGL increment

Packs are mechanics-only today (`contentKind: "mechanics-only"`, `oglNoticeRequired: false`). [`licenseGate.test.ts`](../app/src/systems/pf1e/content/licenseGate.test.ts) rejects `description`, `summary`, `flavor`, `text`, and `benefit` in pack JSON.

The PR that first adds Open Game Content prose (a spell description, a feat Benefit, a class-feature block, or the same kind of text in the encyclopedia) must, in that same change ([`content-licensing.md`](content-licensing.md) §4):

1. Ship the OGL 1.0a text next to the content (do not rewrite the app MIT `LICENSE`).
2. Ship a Section 15 that lists the Open Game Content sources actually used.
3. Designate which fields are Open Game Content, and update the license gate so those fields are the allowed prose keys.
4. Set `oglNoticeRequired` to match that pack. Leave every other pack mechanics-only.
5. Still omit Product Identity (Golarion gazetteer, unique NPCs, adventure titles, Paizo logos, bestiary or adventure text).
6. Curate by hand. Do not scrape third-party SRD sites.

Player-typed summaries already on a sheet are not pack prose and do not trigger this.

### How far 5.1 goes

PF1e catalog rows that already exist (CRB feats and spells, APG Summoner spells, packed class features) are the rows this tool can show. Do not open a Remaster catalog, a Player Core 2 catalog, or a new book in this slice.

Afflictions and generic action entries that are not packed yet may ship as an empty group in the tool. Filling those catalogs is a later 5.1 follow-through, still under the same OGL notice, not a reason to start the later PF2e release.

Evolution and eidolon rules text, if added, use the same OGL increment. Do not put `class.summoner` in `content/pf1e/crb/`.

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

- [ ] `shell.encyclopedia` is a registered sidebar tool for the loaded sheet
- [ ] It shows rules text for packed PF1e spells and feats, and is visibly not Actions List
- [ ] The same change carries OGL 1.0a, Section 15, designated Open Game Content fields, and an updated license gate
- [ ] Product Identity stays out. No SRD scrape
- [ ] Existing PF1e and PF2e goldens still compute

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
