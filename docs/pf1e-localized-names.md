# Phase 5.2 — localized catalog names

**Status:** Landed 2026-10-29. Live status: [`ROADMAP.md`](ROADMAP.md).
**Depends on:** [ADR 0007](adr/0007-content-licensing.md), [ADR 0009](adr/0009-pf1e-catalog-picker.md), [`content-licensing.md`](content-licensing.md) §5, [`phase-5.md`](phase-5.md) §3.

A Spanish player used to meet a Spanish application wrapped around an English catalog: every button, heading, and tab translated, and then 980 rows reading "Longsword", "Power Attack", "Fireball". This slice gives each catalog row a second, locale-specific name.

---

## 1. The boundary this slice defends

`content-licensing.md` §5 already said catalog labels are **pack content, not UI strings**, and that `es.json` must never absorb them. That rule is what shapes the design:

| | UI catalog (`app/src/locales/*.json`) | Name pack (`content/pf1e/names/`) |
| --- | --- | --- |
| Translates | the application's own chrome | catalog rows |
| Keyed by | message path (`shell.newSheet`) | catalog id (`weapon.longsword`) |
| Reaches the UI via | the locale runtime, `t()` | the pack registry, `displayName()` |
| Grows when | a control is added | a mechanic row is added |

Putting a row's label in both places would mean one row with two labels that can disagree, and would make the locale runtime a second content pipeline with none of the pack tests behind it. `app/src/shared/i18n/catalogNames.test.ts` asserts the separation holds in both directions.

---

## 2. The row's name never changes

A row's English `name` stays the row's identity. The document, the goldens, and a saved `.json` keep "Longsword" in every locale, and only the *presentation* is translated. Two consequences a player can see:

- the picker trigger shows "Espada larga", while the editable name field next to it still reads "Longsword", because that field edits the document;
- picking a row in a Spanish UI writes `item.name = "Longsword"`, so the character reads identically on a machine set to English.

This is why the mechanic packs were not touched. A `nameEs` column on `items.json` would have put a presentation concern inside the row that the engine computes from, and would have forced every mechanic pack to care about locales.

---

## 3. Shape

`content/pf1e/names/es.json` is a sidecar: `{ id, names: { es } }`, 980 rows, one per registered catalog row. The index is keyed by id **alone**, not per kind, because ids are already one shared namespace per kind and a translation is a property of the row rather than of the list it appears in.

`namesPack.ts` exposes two functions:

- `localizedName(id, locale)` — the curated name, or `null`;
- `displayName(id, englishName, locale)` — the curated name or the English one, never empty.

Missing row, missing locale, and `locale === 'en'` all fall back, so a partial locale degrades **row by row** instead of failing, and adding a third locale needs no new fallback logic.

---

## 4. Both names stay searchable

A row carries `altName` (the English name) whenever its label is a translation. Search matches either, after folding case **and accents**:

- a player who learned the game in English finds "Longsword" with the Spanish UI on;
- a player on a keyboard without dead keys types "punteria mortal" and reaches "Puntería mortal".

Without the fold, half the Spanish catalog would be unreachable from a plain keyboard, which would make the translation worse than no translation. The picker and the encyclopedia both do this.

Ordering stays the pack's own in either locale, so translating labels never reshuffles or drops a catalog.

---

## 5. Prose stays English

The encyclopedia relabels its **entries** and leaves `body` alone. That prose is Open Game Content under the notice in `content/pf1e/ogc/`; translating it is a prose slice with a different licence bar, not a name slice. The selected entry shows `Bola de fuego (Fireball)` above the English summary.

---

## 6. Licensing

Mechanics-only, `oglNoticeRequired: false`. A **name is not prose**, so §4 of `content-licensing.md` is not triggered and no OGL notice ships with this pack. The license gate scans the folder with every other pack, and `namesPack.test.ts` asserts the manifest and that the notice files are absent.

---

## 7. Curation

Hand-written in `scripts/names_part1.py` and `scripts/names_spells.py`; no scrape, no machine translation. Spell families (`Mass X`, `Greater X`, `Summon Monster N`) are **composed** from a base name, so "Cure Light Wounds" and "Mass Cure Light Wounds" cannot drift apart. `python3 scripts/build_names.py` regenerates the pack and **fails** when a catalog row has no curated name.

---

## 8. Done when

- [x] A catalog row can carry a second, locale-specific name from a curated source
- [x] UI catalogs (`en.json` / `es.json`) do not contain those names
- [x] Packs that did not add prose stay `mechanics-only`
- [x] All 980 registered rows are covered, asserted from the app side
- [x] The document keeps the English name in every locale
- [x] Both names stay searchable, accent-insensitively

## 9. Verification

- `npx vitest run` — 878 tests, including `namesPack.test.ts` (10), `catalogNames.test.ts` (5), `CatalogPickerLocale.test.tsx` (7), `pf1eEncyclopediaLocale.test.tsx` (4), and four added encyclopedia-builder cases.
- `npm run walkthrough:names` — 12 checks in real Chrome, driving the actual language switcher.
- `npm run walkthrough:encyclopedia` (10) and `npm run walkthrough:picker` (4) still pass unchanged.
