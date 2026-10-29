# Pathfinder 1E — localized catalog names

A **second, locale-specific name** for rows that already exist in the mechanic packs ([`../crb/`](../crb/), [`../apg/`](../apg/)). Phase 5.2.

| File | Contents |
| --- | --- |
| `pack.json` | Manifest. `contentKind: mechanics-only`, no OGL notice |
| `es.json` | `{ id, names: { es } }` for all 980 catalog rows: 11 + 1 classes, 7 races, 1 archetype, 3 features, 8 evolutions, 123 items, 177 feats, 649 spells |

## Why this is a pack and not `es.json` in the UI catalog

Catalog labels are **pack content**, not UI strings. `app/src/locales/es.json` translates the application's own chrome (buttons, headings, tab names) and must not absorb catalog names: a row is identified by its catalog id, and its names travel with the row through the pack registry, not through the locale runtime. `catalogNames.test.ts` asserts the UI catalogs stay free of them.

## Licensing

Mechanics-only. A **name is not prose**, so translating one does not trigger the OGL increment in [`docs/content-licensing.md`](../../../docs/content-licensing.md) §4, and this folder carries no OGL 1.0a notice. Open Game Content prose still lives only in [`../ogc/`](../ogc/). No Product Identity: these are generic mechanical names (Guerrero, Espada larga, Bola de fuego), and the license gate scans this folder with every other pack.

## Curation

Translations are **hand-written**, not scraped and not machine-translated, in `scripts/names_part1.py` (everything but spells) and `scripts/names_spells.py` (spells). Spell families (`Mass X`, `Greater X`, `Summon Monster N`) are **composed** from a base name so a family cannot drift apart. Regenerate with:

```
python3 scripts/build_names.py
```

The script fails when a catalog row has no curated name, so a pack that grows a row cannot quietly ship untranslated. `namesPack.test.ts` asserts the same coverage from the app side.

## Adding a locale

Add the locale to `names.schema.json`'s `names` properties, add the key to each row in a new or existing file, and register it in `namesPack.ts`. The runtime falls back to the English pack name whenever a row or a locale is missing, so a partial locale degrades row by row rather than failing.
