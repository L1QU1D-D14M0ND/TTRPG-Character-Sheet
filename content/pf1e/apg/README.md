# Pathfinder 1E — Advanced Player’s Guide player catalog

Curated **mechanics-only** data for the PF1e sheet. Not a copy of the Advanced Player’s Guide. **Never** put Summoner in [`../crb/`](../crb/).

| File | Contents |
| --- | --- |
| `pack.json` | Manifest and which 1.0 slices have landed |
| `classes.json` | Slices 1 & 4: Summoner **progression tags** (HD, BAB, saves, class skills, skill points) and Table 2-8 **spells per day** table. |
| `archetypes.json` | Slice 1: Synthesist **id + name**. Apply does not rewrite HD/BAB/saves or fused ability scores. |
| `evolutions.json` | Slice 2: evolution **ids + names**. Apply does not write fused scores, costume HP, or attacks. |
| `spells.json` | Slice 4: Curated APG Summoner **spells** (27 mechanics-only rows: Ant Haul, Rejuvenate Eidolon, Evolution Surge, Pit spells, etc.). |

**License:** app is MIT. This folder is **mechanics-only** (ids, names, numbers). No Product Identity, no class flavor, no eidolon or spell text. OGL 1.0a / Section 15 is **not** attached until a later increment ships Open Game Content prose. See [`docs/content-licensing.md`](../../../docs/content-licensing.md) and [ADR 0007](../../../docs/adr/0007-content-licensing.md).

See [`docs/pf1e-apg-pack-design.md`](../../../docs/pf1e-apg-pack-design.md). **1.0 and Slice 4 landed.** Synthesist golden: [`fixtures/characters/golden/pf1e/synthesist-5.json`](../../../fixtures/characters/golden/pf1e/synthesist-5.json). Evolutions are still not auto-applied. Spanish UI is `app/src/locales/es.json`, not this folder.
