# Encyclopedia (sidebar tool) and OGC pack

**Status:** Landed. The pack is complete at 829 rows (all 177 CRB feats, 3 CRB features, 622 CRB spells, and 27 APG spells); `ogcPack.test.ts` asserts that no mechanic row is left without a summary.  
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

Filling the CRB feats and spells, APG spells, and packed class features was follow-through on this pack, not a new pack and not a change to the mechanic catalogs. That fill is now complete.

### What still applies after the fill

Each change appended one batch to `entries.json` and skipped ids already present. The batch table and dated history are archived in [`archive/encyclopedia-batches.md`](archive/encyclopedia-batches.md).

Two rules outlast the fill and still bind any change that adds prose:

- Every `body` stays a short mechanical summary written for this pack. A change that instead copies a paragraph from a book adds that book's copyright notice to `SECTION-15.txt` in the same change ([ADR 0007](adr/0007-content-licensing.md)).
- `ogcPack.test.ts` no longer lists the packed rows. It asserts the pack equals the catalog: no unjoinable id, no mechanic row without a summary, no duplicates, and the per-kind totals. So a content pack that registers new feats or spells must ship their summaries, or CI fails. The earlier per-batch roster, ~1030 lines restating ids the mechanic packs already own, was removed once the sequence finished.

**Catalog name artifact.** `spell.atonement-fm` is named "Atonement FM" in the mechanic pack: the CRB spell list marks that spell's focus and material components with an F/M suffix, and the suffix was carried into the name when the id was locked. The encyclopedia shows catalog names verbatim, so it renders that way. The id is in the lock file ([`pf1e-crb-feat-spell-ids.md`](pf1e-crb-feat-spell-ids.md)), so renaming it is its own change, not an encyclopedia batch.

Afflictions and Actions still render as empty groups, because no affliction or action catalog exists to join to.

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
