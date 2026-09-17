# Pathfinder 1E — Core Rulebook player catalog

Curated **mechanics-only** data for the PF1e sheet. Not a copy of the Core Rulebook.

| File | Contents |
| --- | --- |
| `pack.json` | Manifest and which review batches have landed |
| `classes.json` | Class **progression tags** (HD, BAB, saves) plus **class skills**, **skill points per level**, and **spells per day** for caster classes. All 11 CRB base classes. Same row shape; Identity select lists the catalog. |
| `races.json` | Race **id, name, size**. Batch 8: Human. Batch 14: remaining CRB player races; apply stamps size. Ability adjustments stay typed into scores. |
| `items.json` | Item **id, name, pounds**, plus documentary weapon/armor/shield stats. Batch 10 goldens. Batches 16–19: remaining simple, martial, and exotic weapons and ammo. W1–W7: `weapon.properties` tags (`reach`, `brace`, `trip`, `disarm`, `monk`, `nonlethal`, `double`) — N tags, one or many. Double weapons also stamp a documentary `secondHead`. Batch 20: remaining light + medium armor. Batch 21: heavy armor, shields (`kind: shield`), and mundane extras ([pack design §7](../../../docs/pf1e-crb-pack-design.md)). Magic weapons/armor later. Combat numbers stay on `armorClass` / `attacks`. |
| `feats.json` | Feat **id, name, category**. Batch 12: golden feats. Summaries and Combat math stay typed. |
| `features.json` | Class feature **id, name**, source. CRB class features (e.g. Arcane Bond, Physical Enhancement, Telekinetic Fist). Summaries and math stay typed. |
| `spells.json` | Spell **id, name, spellLevel**. Batch 13: golden spells. Slots, DCs, and prepared flags stay typed. |

**License:** app is MIT. This folder is **mechanics-only** (ids, names, numbers). No Product Identity, no class flavor, no spell text. OGL 1.0a / Section 15 is **not** attached until a later increment ships Open Game Content prose. See [`docs/content-licensing.md`](../../../docs/content-licensing.md) and [ADR 0007](../../../docs/adr/0007-content-licensing.md). Do not scrape third-party SRDs into this tree.

See [`docs/pf1e-crb-pack-design.md`](../../../docs/pf1e-crb-pack-design.md) for the review process, landed batches (1–21 and W1–W7, including Batch 7 and Batch 15 hybrid Max), landed honesty/code fixes and Wizard 7 playtest features/spells, then remaining catalog from the locked feat/spell id tables ([`docs/pf1e-crb-feat-spell-ids.md`](../../../docs/pf1e-crb-feat-spell-ids.md)). `weapon.properties` is a **list of N tags** (one is valid; many are valid; later magic properties use the same entry). APG Summoner lives in [`../apg/`](../apg/). **Never** add `class.summoner` here.
