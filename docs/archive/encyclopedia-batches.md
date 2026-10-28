# Encyclopedia fill — batch log (archived)

> **Archived 2026-10-28.** The batch-by-batch record of how `content/pf1e/ogc/entries.json` was filled, moved verbatim from [`../sidebar-tools-encyclopedia.md`](../sidebar-tools-encyclopedia.md) and [`../phase-5.md`](../phase-5.md). The fill is complete; the rules that still apply are in the live spec.

Each change appended one batch to `entries.json`, skipped ids already present, and kept every `body` a short mechanical summary. Batches landed in order: E-R, F1a through F4, F0, L0 through L9, then A1.

## Batches

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
| **L1–L9** | One CRB spell level per change, split alphabetically into parts of at most 20 where a level needed it. *All landed.* Every one of the 622 CRB spells now has a summary. | 0 |
| **A1** | APG Summoner spells. *Landed.* `spell.evolution-surge` was already in the smoke set. | 0 |

The rows-still-to-add column totals 0. `ogcPack.test.ts` asserts that, so a later content pack that adds mechanic rows without summaries fails CI rather than quietly showing a shorter encyclopedia.


## Encyclopedia spec document history

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
| 2026-10-26 | Batch L7a landed (20 level 7 CRB spells, Animate Plants–Greater Polymorph). Next batch is L7b |
| 2026-10-26 | Batch L7b landed (20 level 7 CRB spells, Greater Restoration–Project Image). Next batch is L7c |
| 2026-10-26 | Batch L7c landed (last 17 level 7 CRB spells). Spell levels 0 through 7 are complete. Next batch is L8a |
| 2026-10-26 | Batch L8a landed (20 level 8 CRB spells, Animal Shapes–Greater Spell Immunity). Next batch is L8b |
| 2026-10-26 | Batch L8b landed (20 level 8 CRB spells, Holy Aura–Shield of Law). Next batch is L8c |
| 2026-10-26 | Batch L8c landed (last 11 level 8 CRB spells). Spell levels 0 through 8 are complete. Next batch is L9a |
| 2026-10-26 | Batch L9a landed (20 level 9 CRB spells, Astral Projection–Shades). Next batch is L9b |
| 2026-10-26 | Batch L9b landed (last 12 level 9 CRB spells). All 622 CRB spells and all 177 CRB feats now have a summary. Only A1 remains |
| 2026-10-26 | Batch A1 landed (26 APG Summoner spells). The pack is complete at 829 rows; every CRB feat, CRB feature, CRB spell, and APG spell has a summary |


## Phase 5 document history

| Date | Change |
| --- | --- |
| 2026-10-03 | Phase 5 opened. First Edition and hygiene marked done. Next code is slice 5.1 (encyclopedia + OGL notice in one change) |
| 2026-10-03 | Slice 5.1 prose locked in `content/pf1e/ogc/` ([`sidebar-tools-encyclopedia.md`](../sidebar-tools-encyclopedia.md)). Mechanic packs stay mechanics-only |
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
| 2026-10-26 | Batch L9b landed. The whole CRB catalog has summaries. Next encyclopedia batch is A1, the last one |
| 2026-10-26 | Batch A1 landed. Phase 5.1 encyclopedia content is complete at 829 rows |
