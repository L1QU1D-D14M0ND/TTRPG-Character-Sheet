# Next increment design — options after S1 / S4

**Status:** Archival. Historical (T1 + T3 executed 2026-08-14). **Not** the current coding sequence. Do not use this file to schedule new work.  
**Current sequencing:** [`phase-5.md`](phase-5.md) and [`ROADMAP.md`](ROADMAP.md). [`next-increment-multi-system.md`](next-increment-multi-system.md) is the executed multi-system record. Leftover PF2e goldens, companion editor, and content packs stay a later release, not Phase 5.  
**Date:** 2026-08-14  
**Audience:** Product / engineering  
**Depends on:** [`pf2e-dynamic-character-sheet-design.md`](pf2e-dynamic-character-sheet-design.md) (PF2e system spec), [ADR 0001](adr/0001-product-direction.md) (superseded), [ADR 0002](adr/0002-character-schema.md), [`schema-design-notes.md`](schema-design-notes.md), [`continuation-design.md`](continuation-design.md) (S1/S4 path, now executed)

This document does **not** reopen locked PF2e schema/math decisions. It mapped the repo **after** the Fighter 5 slice, listed **options** for the next increment, and recommended T1 (with a T4 prelude). **T1 and T3 landed together; T4 did not.** Treat §3–§7 as the pre-T1 snapshot. Do not use this file to schedule Cleric/Bard/Champion work ahead of Phase M / 1e.

S1/S4 choices that already landed stay locked unless an option below says otherwise: Vitest, Ajv 2020-12 in-app with reject-on-invalid, `compute(doc) → DerivedView`, boost-sum modifiers, override allow-list, shared row editors (not a generic `SheetTable` yet), Fighter 5 as the martial golden.

---

## 1. Purpose

S4 prelude and S1 are done: Load/Save validate against `character.schema.json`, `compute()` covers martial core math, derived cells show in the spreadsheet, inventory and strike rows exist, and `fixtures/characters/golden/fighter-5.json` passes.

The remaining 0.9 bar is still large: five golden roles, spell and companion editors, i18n catalogs, a draft buffer, PWA proof, and content packs. The question is **which slice to do next**, not **what product to build**.

---

## 2. Locked constraints (do not reopen)

Same as [`continuation-design.md`](continuation-design.md) §2. In particular:

- English chrome must be externalized **before 0.9**; Spanish catalogs ship at 1.0.
- Golden roles stay: Wizard/Witch 5, Bard/Sorcerer 5, Cleric 5, companion user, one PC2 class.
- Core calcs only; unknown `effects[]` ignored.
- One sheet; Save/Load `.json`; no library, dice, VTT, or house-rule flags.

S1 defaults that should be treated as **settled engineering** unless a later ADR says otherwise:

| Pick | Settled as |
| --- | --- |
| Test runner | Vitest |
| Validator | Ajv 2020-12 in-app; reject invalid Load/Save |
| Engine API | `compute(doc) → DerivedView` |
| Attribute modifier | Sum of entered boosts |
| Override keys | Documented allow-list |
| Martial golden | Fighter 5 |

---

## 3. Current snapshot (repo after S1 / S4)

### Present

| Area | What exists |
| --- | --- |
| Schema | `schemas/character.schema.json` v1; Ajv on Load and Save |
| Tests | Vitest; fixture validation; engine unit tests; Fighter 5 golden |
| CI | `.github/workflows/ci.yml` — lint, test, build |
| Engine | `app/src/engine/compute.ts` — attributes, proficiency, HP, AC, skills (incl. armor check penalty), strikes, bulk tenths, investiture, overrides |
| UI derived | Green read-only cells: HP max, AC, attribute modifiers, skill totals, perception/saves/class DC, strike attack/damage, bulk, invested |
| Editors | Identity (partial), attributes boost totals, skill ranks + add lore, combat proficiencies, armor/shield equip, strikes, inventory items (armor/weapon/shield subfields), play HP/dying, notes |
| Persistence | Save strips `derived`; empty-sheet factory still seeds 16 skills |
| PWA | `vite-plugin-pwa` configured; **not** install/offline proven |
| i18n | Hardcoded English in `App.tsx`, `CombatPanel.tsx`, `InventoryPanel.tsx` |
| Content | No `/content/remaster` or `/content/legacy` |

### Missing relative to 0.9

- Spell attack / spell DC in `compute()` (design §6.1; not needed by Fighter 5)
- Spellcasting entry editor (slots, cantrips, repertoire/prepared, focus lists)
- Feats / features / actions row editors
- Conditions and `play.dailyResources` editors
- Companion nested-sheet editor
- Identity leftovers: XP, subclass, languages, traits, deity, edicts/anathema
- HP bonus rows (Toughness in the golden JSON has no UI)
- Speeds / senses editors
- Override UI (engine applies them; no cell editor)
- Remaining five golden fixtures
- `en` message catalog
- IndexedDB single-draft buffer
- Content packs
- PWA install + offline verification

Appendix A in the product design remains mostly unchecked; martial combat/inventory is the exception.

---

## 4. Gap map

```
Locked product (0.9)
        │
        ├── Data contract ──── schema v1 ✓  types ✓  factory ✓  Ajv Load/Save ✓
        │
        ├── Calc ──────────── martial core ✓  overrides ✓  Fighter 5 ✓
        │                     spell attack/DC ✗  remaining goldens ✗
        │
        ├── UI ────────────── identity/skills/combat/inventory slice ✓
        │                     feats/spells/companions/conditions ✗  i18n ✗
        │
        ├── Content ───────── pack format ✗  remaster catalog ✗  legacy remap ✗
        │
        └── Platform ──────── PWA plugin ✓  draft IndexedDB ✗  offline proof ✗
```

---

## 5. Sequencing strategies

Pick **one** primary path for the next increment. Mixing is possible; each path optimizes a different risk.

### Option T1 — Wizard 5 vertical slice (recommended)

Ship **one playable prepared caster** end-to-end: spell attack/DC in `compute()` → Spells tab editor → Wizard 5 golden → Save/Load round-trip.

Then clone the slice for Cleric (prepared divine) and Bard (spontaneous).

| Pros | Cons |
| --- | --- |
| Same S1 shape; next §12 role unblocked | Feats/conditions stay placeholders |
| Forces the spellcasting schema to meet the UI | Temptation to hard-code Wizard-only prepared lists |
| Cleric/Bard reuse most of the editor | Companion nested sheet still untouched |

**Best when:** the next goal is “does the sheet work for casters?”

### Option T2 — Remaining-goldens engine-first

Hand-write Wizard/Bard/Cleric/Ranger/Champion JSON fixtures and extend `compute()` until all six goldens pass **before** more editors.

| Pros | Cons |
| --- | --- |
| Math locked for every 0.9 role | Users still cannot enter a wizard in the UI |
| Surfaces companion-subset calc gaps early | Large fixture work with no visible sheet payoff |

**Best when:** spell/companion math is the highest risk.

### Option T3 — Editors-first (complete the form)

Build feats, features, actions, conditions, daily resources, identity leftovers, HP bonuses — so a human can **type** a full character — then return to casters.

| Pros | Cons |
| --- | --- |
| Spreadsheet coverage closer to Appendix A | More hardcoded English unless i18n lands first (N3) |
| HP bonus / condition rows help Play mode now | Spell DC still missing; goldens #2–6 stay blocked |

**Best when:** table-use feedback on Build/Play tracking matters more than the next golden.

### Option T4 — i18n-first prelude, then T1

Extract every current chrome string into `en.json` **before** the Wizard editor, then do T1 with catalogs from the first new string.

| Pros | Cons |
| --- | --- |
| Satisfies “externalize from the start” before a second wave of UI | No new playable character type until catalogs exist |
| New spell/feat strings never start as literals | Small delay before Wizard 5 |

**Best when:** multiple people will add tabs in parallel. Pair as a **thin prelude** to T1 (same pattern as S4 before S1).

### Option T5 — Companion-first (Ranger 5)

Build the nested `CompanionSheet` editor and golden #5 before casters.

| Pros | Cons |
| --- | --- |
| Exercises the subset schema while it is still unused | Nested UI is the hardest editor; poor first follow-up to S1 |
| | Spellcasting still blocked |

**Not recommended as the solo next step.** Do it after at least one caster golden, unless companion linkage is suddenly the blocker.

### Option T6 — Content-first

Start PC1/PC2 catalog files now that Fighter ids exist (`class.fighter`, `armor.breastplate`, …).

| Pros | Cons |
| --- | --- |
| Engine can grow a `resolveContent()` stub against real files | Licensing work still has no caster proof |
| | Same S5 risk as before S1 |

**Out of scope as a solo next step.** A **minimal** pack can ride along with T1 once Wizard ids are known.

### Recommendation

**T1 (Wizard 5 vertical slice)** with a thin **T4 prelude** (extract `en.json` from current chrome, then add new Spells-tab strings only via `t()`).

Suggested order:

1. Extract existing UI strings to `app/src/locales/en.json` + `t(key)`
2. Spell attack / spell DC on each `spellcasting[]` entry; override paths `derived.spellcasting.<id>.attack` / `.dc`
3. Spells tab: add/edit/remove one or more spellcasting entries; slot max/remaining; cantrip and spell list rows
4. `fixtures/characters/golden/wizard-5.json` + Vitest
5. Identity leftovers needed by that fixture (subclass/doctrine name is enough)
6. Repeat for Cleric 5, then Bard 5 (spontaneous prepared vs signature flags)
7. Conditions + daily resources (Play) and feat/feature rows
8. Ranger 5 + companion nested editor
9. Champion 5 (PC2 armor + class DC smoke)
10. IndexedDB draft buffer; PWA install/offline check
11. Minimal remaster pack for golden ids
12. Spanish + stability (Phase 4)

Steps 1–4 are the **next development increment**. Steps 5–9 finish Phase 1 goldens and honest 0.9 editors. Steps 10–12 are 0.9 platform / 1.0.

---

## 6. Work packages and options

### WP-F — i18n (prelude)

Lock: catalogs from the start; `en` in 0.9; `es` in 1.0. Still hardcoded.

| Option | Notes |
| --- | --- |
| **F1. JSON + thin `t(key)`** (recommended, unchanged) | `app/src/locales/en.json`. Select from `character.meta.locale` (no UI language picker required yet). |
| F2. `react-i18next` | Heavier; only if plurals/interpolation get painful. |
| F3. Postpone until Spanish | **Violates** the lock if Wizard/feat editors add more literals. |

**Action:** extract `App.tsx` / `CombatPanel.tsx` / `InventoryPanel.tsx` chrome in the same PR that starts the Spells editor, or immediately before it. Content names (spell titles) stay on the character / future catalog, not in UI catalogs.

Do **not** add `es` in this increment.

---

### WP-J — Spell math

Design §6.1: spell attack and spell DC from key attribute + proficiency.

| Option | Notes |
| --- | --- |
| **J1. Per `spellcasting[]` entry** (recommended) | `attack = attr + proficiencyBonus(rank, level) + stack(proficiency.modifiers)`; `dc = 10 + that bonus`. Store on `DerivedView.spellcasting[id]`. |
| J2. Single primary tradition only | Too weak for cleric + archetype later. |
| J3. Defer DC until content packs | Golden Wizard can still assert numbers from entered proficiency; no pack required. |

Focus points stay on `play` (one shared pool) — already editable.

Unknown `effects[]` on spell rows stay ignored.

Override allow-list additions:

- `derived.spellcasting.<id>.attack`
- `derived.spellcasting.<id>.dc`

---

### WP-K — Spells tab editor

Today: entry count + focus pool/remaining.

| Option | Notes |
| --- | --- |
| **K1. Spreadsheet blocks per entry** (recommended) | Header row: name, tradition, castType, attribute, rank. Slot table: rank 1–10 max/remaining. Three list tables: cantrips, spells, focus (optional innate/rituals as later columns). |
| K2. One giant table of all spells | Harder prepared vs spontaneous. |
| K3. Sidebar browser | **Later** (Phase 5). Do not build the encyclopedia now. |

Prepared vs spontaneous for 0.9:

- Prepared: `prepared` checkbox on spell list rows; slots remaining is Play state.
- Spontaneous: repertoire rows; `signature` checkbox; slots remaining by rank.
- Innate/focus: `usesPerDay` / `usesRemaining` on the spell row.

**0.9 does not auto-fill slot tables from class.** User enters max slots (same spirit as user-entered boosts). A later content pack can seed them.

---

### WP-D — Remaining golden characters

S1 settled Fighter 5. Remaining defaults from continuation-design §10 still apply unless changed here.

| # | Role | Default | Slice needs |
| --- | --- | --- | --- |
| 2 | Prepared | **Wizard 5** (not Witch) | WP-J + WP-K; spellbook/prepared list |
| 3 | Spontaneous | **Bard 5** (not Sorcerer — keeps PC2 slot free) | Same editor; `castType: spontaneous` + signature |
| 4 | Divine prepared | **Cleric 5** | Second tradition; doctrine as `identity.subclass` |
| 5 | Companion | **Ranger 5 + animal companion** | Nested `CompanionSheet` editor; companion HP/AC/strike |
| 6 | PC2 | **Champion 5** | Mostly martial; class DC + armor (engine already exists) |

Each caster golden should assert: attribute modifiers, max HP, AC, Perception, saves, Class DC, two skills, spell attack, spell DC, at least one slot row remaining. Companion golden asserts nested sheet HP/AC/strike. Champion can omit spells.

Until content packs exist, goldens keep `rulesetSource: "custom"` with numeric inputs filled in (same as Fighter 5).

**Wizard 5 sketch (for the next golden, not locked stats):** level 5, INT as key, trained/expert spellcasting, prepared arcane slots, cantrips + prepared list, ancestry HP + wizard HP/level. Exact boosts and slot counts chosen when writing the fixture; tests pin the numbers.

---

### WP-L — Other editors the goldens will need

Not all of these belong in the **next** increment. Listed so T3 does not get lost.

| Editor | Needed by | Notes |
| --- | --- | --- |
| `identity.subclass` name | Cleric doctrine, Wizard thesis optional | Tiny; include with Wizard if the fixture uses it |
| HP `vitals.bonuses[]` | Fighter already has Toughness in JSON only | Small Play/Identity table; worth doing soon |
| Feats / features / actions | All goldens eventually | Structured rows + summary text; no automation |
| Conditions | Play | Value + duration; no auto AC/skill yet unless encoded as `modifiers` |
| Daily resources | Focus is done; others | Kineticist etc. stay generic rows (I6) |
| Languages / traits / speeds / senses | Identity completeness | Low calc risk |
| Companion subset | Golden #5 | Nested copy of combat/skills/vitals; do **not** recurse `CharacterDocument` |
| Override UI | Optional | Engine works; a later column to set `derived.*` paths |

Row UI: continue **per-panel tables** (current Combat/Inventory) unless a shared `SheetTable` appears naturally. Continuation option E1 is still desirable but not a blocker.

---

### WP-G — Content packs (still Phase 3)

Unchanged: hand-maintained split JSON per entity kind, after the Wizard slice uses custom numeric inputs. Optional stub file for `class.wizard` / `spell.*` ids once the golden exists.

Licensing: curated stats/summaries only; no GM-only text; no Foundry dump.

---

### WP-E-D1 / WP-H — Draft buffer and PWA

Still recommended **after** the caster slice, not inside it:

- `idb-keyval` one key; restore-on-boot confirm; never a library
- One `npm run build && npm run preview` install + offline check before calling 0.9 done

---

## 7. Recommended default plan

Assume **T1 + thin T4 prelude**.

| Step | Package | Deliverable |
| --- | --- | --- |
| 1 | WP-F | `en.json` + `t()` for current chrome |
| 2 | WP-J | Spell attack/DC on `spellcasting[]`; override paths |
| 3 | WP-K | Spells tab entry + slots + spell list rows |
| 4 | WP-D #2 | Wizard 5 golden + Vitest |
| 5 | WP-D #4, #3 | Cleric 5 then Bard 5 (reuse editor) |
| 6 | WP-L | Feats/features, conditions, HP bonuses, identity leftovers |
| 7 | WP-D #5, #6 | Ranger + companion; Champion 5 |
| 8 | WP-E-D1, WP-H | IndexedDB draft; PWA proof |
| 9 | WP-G | Minimal remaster pack for golden ids |
| 10 | Phase 4 | `es` catalog; still core calcs |

Steps 1–4 are the **next development increment**.

---

## 8. Definitions of done (updated)

### S1 / S4 (done)

- [x] Load and Save validate against `character.schema.json`
- [x] `compute()` for attributes, proficiency, HP, AC, skills, bulk, investiture, strikes
- [x] Overrides apply last; unknown `effects` ignored
- [x] Fighter 5 golden
- [x] `derived` omitted on Save
- [x] Untrained proficiency does not add level; no max-level cap
- [x] Vitest + CI

### Next increment (Wizard slice + editors)

- [ ] `en` catalog for existing chrome; new Spells-tab strings go through `t()` (T4 skipped)
- [x] Spell attack and spell DC in `compute()` per spellcasting entry
- [x] Spells tab can add/edit a prepared caster (slots + lists)
- [x] Wizard 5 golden asserts HP, AC, skills, spell attack, spell DC, a slot row
- [x] Save/Load round-trip of that golden still schema-valid
- [x] Identity leftovers, HP bonuses, speeds/senses, feats/features/actions, conditions, daily resources (T3; no companions)

### Phase 1 (schema + core calc) — still open after the next increment

- [ ] Remaining goldens: Cleric, Bard, Ranger+companion, Champion
- [x] Spell attack/DC covered (once Wizard lands)

### 0.9

- [ ] All six goldens
- [ ] Row editors for every Appendix A domain a player must persist
- [ ] `en` catalog (no new hardcoded chrome)
- [ ] PWA install + offline app shell verified once
- [ ] Optional single draft buffer
- [ ] Enough curated content rows to rebuild the golden set

### 1.0 / later

Unchanged: Spanish; stability; no typed `effects[]`; no sidebar encyclopedia; no ORC pipeline; no VTT/dice/library.

---

## 9. Risks

| ID | Risk | Mitigation |
| --- | --- | --- |
| N3 | UI strings proliferate before i18n | T4 prelude; Spells editor uses `t()` from the first commit |
| N5 | Companion nested sheet vs full PC | Keep subset; do not recurse; not in the next increment |
| N7 | Prepared vs spontaneous UI forks | One entry editor with `castType` flags; don’t split tabs |
| N8 | Slot tables vs class tables in books | User-entered max slots in 0.9 (like boosts) |
| N9 | Spell list vs encyclopedia | Store `ContentRef` + rank + summary only; no full spell text dump |
| I1–I4, I8 | Unchanged from continuation-design | Same mitigations |
| N2 | Content licensing | Still no third-party dump |

---

## 10. Open picks (need a decision or accept the default)

| Pick | Default | Alternatives |
| --- | --- | --- |
| Sequence | **T1 Wizard slice + T4 i18n prelude** | T2 engine-first goldens; T3 editors-first; T5 companion-first |
| i18n | **JSON + `t()`** | react-i18next |
| Spell math | **Per spellcasting entry** | Primary tradition only |
| Spells UI | **Per-entry spreadsheet blocks** | One giant spell table |
| Slot max | **User-entered** | Seed from content pack (later) |
| Prepared golden | **Wizard 5** | Witch 5 |
| Spontaneous golden | **Bard 5** | Sorcerer 5 |
| Companion golden | **Ranger 5 + animal companion** | Druid + companion |
| PC2 golden | **Champion 5** | Investigator / Swashbuckler / Oracle |
| Next increment includes feats? | **No** | Yes if choosing T3 |
| Draft buffer in next increment? | **No** | Yes if platform risk spikes |

Changing a **settled S1** pick (Ajv, Vitest, `compute()` shape) does need an explicit note; it does not need a product ADR.

---

## 11. Suggested first implementation issue slice

If the next change is code, not more design:

1. Add `app/src/locales/en.json` and replace hardcoded chrome in `App.tsx`, `CombatPanel.tsx`, and `InventoryPanel.tsx`.
2. Extend `DerivedView` with `spellcasting: Record<id, { attack: number; dc: number }>`.
3. Spells tab: add spellcasting entry; edit tradition, castType, attribute, rank; slot max/remaining; add cantrip/spell rows.
4. Show derived spell attack and DC.
5. Add `fixtures/characters/golden/wizard-5.json` and a Vitest file mirroring `fighter5.golden.test.ts`.

That slice proves casters on the same architecture as Fighter 5 without waiting on content packs, companions, or Spanish.

---

## Appendix — Document history

| Date | Change |
| --- | --- |
| 2026-08-14 | Options after merging S1/S4 with the Phase 1 continuation design |
| 2026-08-14 | T1 + T3 executed (Wizard 5, spell attack/DC, form editors); T4 skipped |
| 2026-08-17 | Marked historical; sequencing moved to `next-increment-multi-system.md` |
