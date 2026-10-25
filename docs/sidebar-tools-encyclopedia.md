# Encyclopedia (sidebar tool) and OGC pack

**Status:** Smoke set, batch E-R, and every feat batch (F1a through F4 and F0) landed: all 177 CRB feats have a summary. Next batch is L7a (CRB spell level 7, first part).  
**Id:** `shell.encyclopedia` (PF1e module only).  
**Host lock:** [ADR 0005](adr/0005-sidebar-host.md), [`sidebar-host-design.md`](sidebar-host-design.md).  
**License lock:** [ADR 0007](adr/0007-content-licensing.md), [`content-licensing.md`](content-licensing.md).  
**Sequence:** [`phase-5.md`](phase-5.md) slice 5.1.

This is reference text for the table. It is not Actions List (what this PC can do right now) and not Attack Helper.

---

## 1. Where the prose lives

Rules text lives in a **new pack**, `content/pf1e/ogc/`. The CRB pack and the APG pack stay mechanics-only: no prose keys, `contentKind: "mechanics-only"`, `oglNoticeRequired: false`.

The encyclopedia joins an OGC entry to a mechanic row by the existing catalog id (`spell.fireball`, `feat.power-attack`). The mechanic row stays the stamp the picker and the sheet use. The OGC entry is the paragraph the tool displays.

`crbPack.ts` and `apgPack.ts` do not import the OGC pack. The encyclopedia module does. Character Load does not read it.

---

## 2. Pack layout

| File | Role |
| --- | --- |
| `content/pf1e/ogc/pack.json` | Manifest. `id: "pf1e.ogc"`, `system: "pf1e"`, `contentKind: "open-game-content"`, `oglNoticeRequired: true` |
| `content/pf1e/ogc/entries.json` | The entries. One array |
| `content/pf1e/ogc/OGL-1.0a.txt` | OGL 1.0a license text. Not a rewrite of the app MIT `LICENSE` |
| `content/pf1e/ogc/SECTION-15.txt` | Section 15 listing only the Open Game Content sources whose prose is actually in `entries.json` |

`listRepoFiles` scans `.json` only, so the two notice files are not pack schemas. A test asserts both files exist when `oglNoticeRequired` is true.

`pack.schema.json` today pins `contentKind` to `mechanics-only`. Widen it to `"mechanics-only"` or `"open-game-content"`. A mechanics-only pack keeps `oglNoticeRequired: false`. An `open-game-content` pack keeps `oglNoticeRequired: true`.

Do not name an OGC file `spells.json`, `feats.json`, `features.json`, or any other basename `packSchema.test.ts` already maps to a mechanic schema. That test keys schemas by basename, so `content/pf1e/ogc/spells.json` would be checked as a mechanic spell row. Later splits, if `entries.json` grows too large, use a new basename (`spell-entries.json`) and a schema for that basename.

---

## 3. Entry shape

`entries.json` is an array of objects. `additionalProperties: false`.

| Field | Rule |
| --- | --- |
| `id` | Required. Same string as the mechanic catalog id |
| `kind` | Required. `spell`, `feat`, or `feature` in this slice |
| `body` | Required. The Open Game Content paragraph. The only prose key this pack may use |

`body` stays on the forbidden-key list for `content/pf1e/crb/` and `content/pf1e/apg/`. It is allowed only under `content/pf1e/ogc/`. No `description`, `benefit`, `summary`, `flavor`, or `text` key anywhere, including the OGC pack.

There is no `name` on an entry. The tool shows the mechanic catalog's `name`. A second name is slice 5.2, not this pack.

Every id must resolve:

| `kind` | Lookup |
| --- | --- |
| `spell` | Existing spell catalog (CRB or APG) |
| `feat` | CRB feat catalog |
| `feature` | CRB feature catalog |

An id that does not resolve fails the OGC test. It does not fail character Load. Duplicate ids fail the test.

Product Identity stays out of `body` and out of the notice files' descriptive lines. The same word list the license gate already uses (`golarion`, `absalom`, and the rest in `licenseGate.test.ts`) applies to OGC strings. Curate by hand. Do not scrape a third-party SRD.

`kind` values `affliction` and `action` are not in this slice's schema. Those groups are empty in the tool until a later 5.1 follow-through adds them under the same notice.

---

## 4. First change versus later fill

The first change ships the pack scaffold, the notice files, the license-gate split, the tool, and this smoke set:

| id | kind | Mechanic pack |
| --- | --- | --- |
| `spell.fireball` | `spell` | CRB |
| `feat.power-attack` | `feat` | CRB |
| `feature.arcane-bond` | `feature` | CRB |
| `spell.evolution-surge` | `spell` | APG |

Section 15 for that change lists the Core Rulebook and the Advanced Player's Guide, because those are the books the smoke set copies from. A later batch that adds prose from another book adds that book to Section 15 in the same change.

Filling the remaining CRB feats and spells, APG spells, or packed class features is follow-through on this pack. It is not a new pack and not a change to the mechanic catalogs.

### Later fill is one batch per change

Do not add the remaining catalog in one change. Each change appends one batch to `entries.json`, skips ids already present, and keeps every `body` a short mechanical summary. A batch that copies a book paragraph updates `SECTION-15.txt` in that same change.

`ogcPack.test.ts` expects the smoke set plus every landed batch. The next batch updates that test in the same change.

| Batch | What | Rows still to add |
| --- | --- | ---: |
| **E-R** | Remaining CRB features: Physical Enhancement, Telekinetic Fist. *Landed.* | 0 |
| **F1a** | Combat feats Agile Maneuvers–Dazzling Display. *Landed.* | 0 |
| **F1b** | Combat feats Deadly Aim–Greater Overrun. *Landed.* | 0 |
| **F1c** | Combat feats Greater Penetrating Strike–Improved Trip. *Landed.* | 0 |
| **F2a** | Combat feats Improved Two-Weapon Fighting–Quick Draw. *Landed.* | 0 |
| **F2b** | Combat feats Rapid Reload–Staggering Critical. *Landed.* | 0 |
| **F2c** | Combat feats Stand Still–Wind Stance. *Landed.* | 0 |
| **F3a** | General feats Acrobatic–Extra Ki. *Landed.* | 0 |
| **F3b** | General feats Extra Lay On Hands–Leadership. *Landed.* | 0 |
| **F3c** | General feats Lightning Reflexes–Turn Undead. *Landed.* | 0 |
| **F4** | Item creation and metamagic feats not named in F0: Brew Potion, Craft Rod, Craft Staff, Craft Wand, Forge Ring, and the eight metamagic feats from Empower Spell to Widen Spell. *Landed.* | 0 |
| **F0** | Feats packed before the F ranges: Improved Initiative, Weapon Focus, Point-Blank Shot, Spell Focus, Eschew Materials, Scribe Scroll, Craft Wondrous Item, Craft Magic Arms and Armor, Craft Construct, Heighten Spell. After F4. *Landed.* `feat.power-attack` was already in the smoke set. | 0 |
| **L0** | CRB spell level 0. *Landed.* | 0 |
| **L1–L9** | One CRB spell level per change. A level with more than 40 spells is split alphabetically into parts of at most 20 (`L1a`, `L1b`, …). Skip `spell.fireball`. **Levels 0-6 complete (482 rows). L7a is next.** Remaining per level: L7 57, L8 51, L9 32. | 140 |
| **A1** | APG Summoner spells. Skip `spell.evolution-surge`. | 26 |

The rows-still-to-add column totals 166, which is every CRB feat, CRB spell, and APG Summoner spell not yet in `entries.json`. `ogcPack.test.ts` asserts that total, so the table cannot drift from the packs unnoticed.

**Catalog name artifact.** `spell.atonement-fm` is named "Atonement FM" in the mechanic pack: the CRB spell list marks that spell's focus and material components with an F/M suffix, and the suffix was carried into the name when the id was locked. The encyclopedia shows catalog names verbatim, so it renders that way. The id is in the lock file ([`pf1e-crb-feat-spell-ids.md`](pf1e-crb-feat-spell-ids.md)), so renaming it is its own change, not an encyclopedia batch.

Order is E-R, then F1a through F4, then F0, then L0 through L9, then A1. Afflictions and Actions stay empty until those batches have landed.

---

## 5. Tool behavior

Register `shell.encyclopedia` on the PF1e sidebar tools only, with `labelKey: "shell.toolEncyclopedia"`. Do not register it on the PF2e module. Do not stub it before this slice.

The tool is read-only. It does not call `update`. Search text and the selected entry are session state, not save-file fields.

The list is the OGC entries, not the whole mechanic catalog. A spell or feat with no `body` does not appear. Groups:

| Group | First change |
| --- | --- |
| Spells | The smoke-set spells |
| Feats | The smoke-set feat |
| Features | The smoke-set feature, so a class-feature paragraph has a home |
| Afflictions | Empty |
| Actions | Empty |

Empty groups stay visible, with a short chrome sentence that no entries are packed yet. That sentence is a locale string. `body` is not. A group that ships entries but matches nothing gets a different sentence (`noMatches`), so "nothing is packed" never describes a packed group.

Entries render sorted by catalog name, not in the order batches were appended to `entries.json`.

Search matches the mechanic catalog name, case-insensitive substring, same rule as the catalog picker. Render at most 60 matches and show how many matches are held back. The 60-row cap is shared across groups round-robin rather than spent in group order, so a large Spells group cannot starve a smaller Feats group of every row. Each truncated group also notes how many of its own rows are held back. Selecting an entry shows its catalog name, kind, and `body`.

Chrome strings (`shell.toolEncyclopedia`, group labels, empty-group sentence, no-match sentence, per-group and total overflow notes) go in `en.json` and `es.json`. Do not put `body` in the locale catalogs.

---

## 6. What this slice does not do

- It does not add prose keys to `content/pf1e/crb/` or `content/pf1e/apg/`.
- It does not add `class.summoner` to the CRB pack.
- It does not apply `body` in `compute()`, Attack Helper, or Actions List.
- It does not add a dice roller, a second sheet, or a Save path.
- It does not ship a PF2e or Remaster encyclopedia.
- It does not translate `body`.

---

## 7. Done when

- [x] `content/pf1e/ogc/` exists with `pack.json`, `entries.json`, `OGL-1.0a.txt`, and `SECTION-15.txt`
- [x] The smoke set is the only entries, and each id resolves to the mechanic row named above
- [x] CRB and APG packs still fail the license gate if a prose key appears, and still have `oglNoticeRequired: false`
- [x] The OGC pack fails the gate if `body` is missing, if a forbidden key appears, if Product Identity appears, or if the notice files are missing
- [x] `shell.encyclopedia` is on the PF1e sidebar and absent from the PF2e sidebar
- [x] The tool lists the smoke set, shows empty Afflictions and Actions groups, and does not write the sheet
- [x] Existing PF1e and PF2e goldens still compute

---

## Appendix — Document history

| Date | Change |
| --- | --- |
| 2026-10-03 | Lock Phase 5.1 prose in `content/pf1e/ogc/`, joined by catalog id. Mechanic packs stay mechanics-only. First change is the tool plus a four-row smoke set |
| 2026-10-04 | Smoke set and `shell.encyclopedia` landed. Remaining catalog prose is follow-through on `entries.json` |
| 2026-10-04 | Follow-through locked to one batch per change. Next batch is E-R (two remaining CRB features) |
| 2026-10-04 | Batch E-R landed (Physical Enhancement, Telekinetic Fist). Next batch is F1a |
| 2026-10-04 | Batch F1a landed (18 combat feats, Agile Maneuvers–Dazzling Display). Next batch is F1b |
| 2026-10-04 | Batch F1b landed (18 combat feats, Deadly Aim–Greater Overrun). Next batch is F1c |
| 2026-10-04 | Batch F1c landed (18 combat feats, Greater Penetrating Strike–Improved Trip). Next batch is F2a. Feats packed before the F ranges are batch F0, after F4 |
| 2026-10-05 | Batch F2a landed (17 combat feats, Improved Two-Weapon Fighting–Quick Draw). Next batch is F2b |
| 2026-10-05 | Batch F2b landed (17 combat feats, Rapid Reload–Staggering Critical). Next batch is F2c |
| 2026-10-05 | Batch F2c landed (18 combat feats, Stand Still–Wind Stance). Combat feats in the F ranges are complete. Next batch is F3a |
| 2026-10-25 | Batch F3a landed (16 general feats, Acrobatic–Extra Ki). Next batch is F3b |
| 2026-10-25 | Batch F3b landed (16 general feats, Extra Lay On Hands–Leadership). Next batch is F3c |
| 2026-10-25 | Batch F3c landed (15 general feats, Lightning Reflexes–Turn Undead). General feats in the F ranges are complete. Next batch is F4 |
| 2026-10-25 | Batch F4 landed (13 item creation and metamagic feats, Brew Potion–Widen Spell). Next batch is F0 |
| 2026-10-25 | Batch F0 landed (10 feats packed before the F ranges). All 177 CRB feats now have a summary. Next batch is L0 |
| 2026-10-25 | Batch L0 landed (28 level 0 CRB spells). First spell batch. Next batch is L1a |
| 2026-10-25 | Batch L1a landed (20 level 1 CRB spells, Alarm–Delay Poison). Next batch is L1b |
| 2026-10-25 | Batch L1b landed (20 level 1 CRB spells, Detect Animals or Plants–Floating Disk). Next batch is L1c |
| 2026-10-25 | Batch L1c landed (20 level 1 CRB spells, Goodberry–Obscuring Mist). Next batch is L1d |
| 2026-10-25 | Batch L1d landed (20 level 1 CRB spells, Pass without Trace–True Strike). Next batch is L1e |
| 2026-10-25 | Batch L1e landed (last 3 level 1 CRB spells). Spell levels 0 and 1 are complete. Next batch is L2a |
| 2026-10-25 | Batch L2a landed (20 level 2 CRB spells, Acid Arrow–Darkness). Next batch is L2b |
| 2026-10-25 | Batch L2b landed (20 level 2 CRB spells, Darkvision–Hypnotic Pattern). Next batch is L2c |
| 2026-10-25 | Batch L2c landed (20 level 2 CRB spells, Inflict Moderate Wounds–Scare). Next batch is L2d |
| 2026-10-25 | Batch L2d landed (20 level 2 CRB spells, Scorching Ray–Warp Wood). Next batch is L2e |
| 2026-10-25 | Batch L2e landed (last 4 level 2 CRB spells). Spell levels 0 through 2 are complete. Next batch is L3a |
| 2026-10-25 | Batch L3a landed (20 level 3 CRB spells, Arcane Sight–Gaseous Form). Next batch is L3b |
| 2026-10-25 | Batch L3b landed (20 level 3 CRB spells, Gentle Repose–Magic Circle against Evil). Next batch is L3c |
| 2026-10-25 | Batch L3c landed (20 level 3 CRB spells, Magic Circle against Good–Secret Page). Next batch is L3d |
| 2026-10-25 | Batch L3d landed (last 15 level 3 CRB spells). Spell levels 0 through 3 are complete. Next batch is L4a |
| 2026-10-25 | Batch L4a landed (20 level 4 CRB spells, Air Walk–Dispel Evil). Next batch is L4b |
| 2026-10-25 | Batch L4b landed (20 level 4 CRB spells, Divination–Lesser Globe of Invulnerability). Next batch is L4c |
| 2026-10-25 | Batch L4c landed (20 level 4 CRB spells, Lesser Planar Ally–Shout). Next batch is L4d |
| 2026-10-25 | Batch L4d landed (last 12 level 4 CRB spells). Spell levels 0 through 4 are complete. Next batch is L5a |
| 2026-10-25 | Batch L5a landed (20 level 5 CRB spells, Animal Growth–Dream). Recorded the "Atonement FM" catalog name artifact. Next batch is L5b |
| 2026-10-25 | Batch L5b landed (20 level 5 CRB spells, Elemental Body II–Overland Flight). Next batch is L5c |
| 2026-10-25 | Batch L5c landed (20 level 5 CRB spells, Passwall–Telekinesis). Next batch is L5d |
| 2026-10-25 | Batch L5d landed (last 9 level 5 CRB spells). Spell levels 0 through 5 are complete. Next batch is L6a |
| 2026-10-25 | Batch L6a landed (20 level 6 CRB spells, Acid Fog–Forceful Hand). Next batch is L6b |
| 2026-10-25 | Batch L6b landed (20 level 6 CRB spells, Form of the Dragon I–Mass Eagle's Splendor). Next batch is L6c |
| 2026-10-25 | Batch L6c landed (20 level 6 CRB spells, Mass Fox's Cunning–Symbol of Fear). Next batch is L6d |
| 2026-10-25 | Batch L6d landed (last 10 level 6 CRB spells). Spell levels 0 through 6 are complete. Next batch is L7a |
