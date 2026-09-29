# Pathfinder First Edition — Character sheet (system spec)

**Status:** System specification locked (ADR 0003). PF1e **0.9 bar landed**. **1.0 landed** (Synthesist golden + Spanish UI catalog + stability). Wizard 7 playtest override and Phase 1x honesty/code fixes landed (2026-09-12). Feat batches F1–F4 (all 177 CRB feats) and spell batches S1–S5 (all 622 CRB spells) landed, completing the entire CRB player catalog. APG follow-through (Summoner `spellsPerDay` table + 27-spell catalog) landed. Catalog picker (ADR 0009 slices 1 & 2) and all three named sidebar tools (Attack Helper, Actions List, Budget Calculator) have landed. Next is pre-release / hygiene. Remaining PF2e work waits for a later release.  
**Parent:** [`ttrpg-character-sheet-design.md`](ttrpg-character-sheet-design.md)  
**Schema:** [ADR 0006](adr/0006-pf1e-character-schema.md), [`pf1e-schema-design-notes.md`](pf1e-schema-design-notes.md), [`../schemas/pf1e/character.schema.json`](../schemas/pf1e/character.schema.json)  
**Priority:** **Finished** for this release (remaining PF2e work waits for a later release)

This is the PF1e analog of the PF2e design doc. It does not replace the umbrella product lock.

---

## 1. Purpose

Let a player **build and play** a Pathfinder First Edition character on the shared spreadsheet PWA: identity (including multiclass), abilities, skills, combat (BAB, saves, AC/touch/FF, CMB/CMD, iteratives), feats, spells, inventory (pounds), and session state (HP, conditions, daily resources).

Ruleset target: **Core Rulebook**, player-facing, for **0.9**. No GM-exclusive bestiary/adventure text. Advanced Player’s Guide is **out of 0.9** (traits and extra classes as custom rows). **1.0** pulls APG far enough that a player can **build and play a Synthesist Summoner** (fused eidolon). Summoner stays out of the CRB pack.

---

## 2. Locked decisions (PF1e)

| # | Topic | Decision |
| --- | --- | --- |
| 1 | Ability model | Six **ability scores** (3–… no schema max). Modifier = `floor((score + tempScore − 10) / 2)` + `tempModifier`. `tempScore` is a score bump; `tempModifier` is a check/DC addend |
| 2 | Classes | `classes[]` rows: class id/name, levels, favored flag, optional prestige. **Free multiclass.** Total level = sum of class levels |
| 3 | BAB / saves / HD | Engine tables for the **11 CRB classes**. Custom/prestige rows pick a progression (full / ¾ / ½ BAB; good/poor saves; HD) |
| 4 | Skills | Rank-based. Class-skill +3 when trained. Armor check penalty on listed skills. Knowledge/Craft/Perform/Profession as addable rows (Knowledge subtypes auto-seeded) |
| 5 | AC | Normal, **touch**, **flat-footed**. Size and Dex (or lack of Dex) as in CRB |
| 6 | Maneuvers | **CMB** and **CMD** derived |
| 7 | Attacks | Iterative attacks from BAB (−5 steps). MAP is a PF2e concept — do not reuse |
| 8 | HP | Max at level 1 HD + Con; later levels user-entered rolled/fixed HD + Con (+ favored class HP if chosen). Engine sums; does not roll |
| 9 | Spell DC | `10 + spell level + ability mod` per spellcasting class entry. Caster level from class levels in that class |
| 10 | Spells per day | Default Max = class table + bonus spells from ability. Click to type a custom amount; empty resets to default. Domain/school slots are extra rows, not auto-granted (Wizard school bonus slot pulled forward by the 2026-09-12 override, see ROADMAP.md Phase 1x) |
| 11 | Encumbrance | Item **pounds**; total weight derived. Light/medium/heavy from Strength table (engine). No PF2e bulk |
| 12 | Play / dying | Negative HP allowed; dead at −Con (display threshold). **No** PF2e dying/wounded/doomed track, **no** hero points in 0.9 (optional later as a custom resource) |
| 13 | Alignment | First-class identity field (nine alignments + optional deity) |
| 14 | Size / race | Race (not ancestry/heritage). Size affects AC, attack, CMB/CMD, and carrying capacity as in the CRB size table. Stealth/Fly size skill modifiers are not auto-applied in 0.9 |
| 15 | Feats | Structured rows (type: general, combat, metamagic, item creation, …). No auto-application of feat text in 0.9 |
| 16 | Companions / familiars | Schema hook allowed; **no nested editor in PF1e 0.9**. **1.0 Synthesist** uses an extended companion stub (fused overlay), not a second character file |
| 17 | Goldens | 0.9: Fighter 5; Wizard 5; Fighter 2 / Wizard 3. **1.0:** add a Synthesist Summoner golden |
| 18 | House rules | No ABP, no Mythic, no Elephant in the Room in 0.9. Custom rows if a table uses them |
| 19 | Content ids | Kebab-case paths (`class.fighter`, `feat.power-attack`, `spell.fireball`, `skill.perception`, `race.human`) |
| 20 | 1.0 APG slice | Playable **Synthesist Summoner**: separate APG pack; fused STR/DEX/CON overlay; costume HP; evolution rows documentary. Not auto-applied evolutions. |

---

## 3. What “complete” means (PF1e domains)

Save **inputs** and **session state**; **derived** is optional cache and omitted on Save.

### 3.1 Identity

Name, player name, race, size, alignment, deity, total level (derived), XP, appearance/personality notes, languages, speed(s).

`classes[]`: each row has class ref, levels, hit die, BAB progression, Fort/Ref/Will progression, favored class (HP vs skill vs none — user pick per level or a running total).

### 3.2 Abilities

STR DEX CON INT WIS CHA scores. Temp modifiers as optional breakdown. Derived modifiers.

### 3.3 Offense / defense

- BAB (stacked), melee/ranged attack extras (user + derived from ability/size).
- Iterative attack bonuses list.
- Fort / Ref / Will (stacked class + ability + user modifiers).
- AC, touch, flat-footed.
- CMB, CMD.
- Initiative (Dex + user).
- HP max / current / temp; nonlethal (optional field).

### 3.4 Skills

Per-skill: ranks, class-skill flag, ability, ACP applies, misc. Derived total. Max ranks = character level (CRB); engine may warn in a later UI, not a schema max.

### 3.5 Feats, features, special abilities

Rows with name, type, level taken, summary text, empty `effects[]`. Class features as feature rows (user-entered in 0.9).

### 3.6 Magic

One `spellcasting[]` entry per casting class (wizard, cleric, …). Ability key, caster level (default: levels in that class), spell DCs by level or a DC-for-level function in derived, slots max/remaining, spell list rows (cantrips/orisons, prepared or known), arcane spell failure as an inventory-derived or user field.

**0.9 does not** auto-prepare a spellbook from the Core list. User types or picks ids when a pack exists.

### 3.7 Inventory & wealth

Items with pounds, equipped/carried, weapon/armor/shield subfields (enhancement bonus, armor bonus, max Dex, ACP, spell failure). `weapon.properties` is a **list of N kebab-case tags** on that inventory entry — one tag is valid (siangham: monk; sap: nonlethal), many tags are valid (whip: reach + trip + disarm + nonlethal; later magic `flaming` / `keen`), and empty omits the field. Double weapons also stamp optional `weapon.secondHead` documentary dice; primary `damageDice` stays a single string. Currency (pp/gp/sp/cp). Derived weight and load category. **Ignore weight** opts out of load category (pounds still sum). Medium/heavy load penalties are not auto-written onto ACP / max Dex / speed.

### 3.8 Play

Current HP, conditions (name, value, duration text), daily resources (generic rows: channel, rage, …). No hero-point strip required.

---

## 4. Calculation architecture (0.9 core)

```
Class rows → BAB, saves, HD contribution
Ability scores → modifiers
Armor/shield/size/Dex → AC, touch, FF
BAB + STR/DEX + size → CMB, attack extras
BAB → iterative list
Skill ranks + ability + class + ACP → skill totals
Spell level + ability → DC
Weight vs STR → load
Overrides last
Unknown effects[] ignored
```

### 4.1 In scope for PF1e 0.9

- Ability modifiers from scores.
- Stacked BAB and saves from class progressions.
- HP max from recorded HD rolls + Con + favored HP. Click the max HP number to type each physical HD roll and review the tally.
- AC / touch / FF from armor, shield, Dex (capped), size, natural/deflection/dodge/other as **user modifier buckets** (full 1E bonus-type engine is post-0.9; 0.9 uses named buckets that **sum dodge** and **max enhancement/deflection/natural** if those fields are present — keep the implementation small: prefer explicit fields on AC rather than a 12-type general stacker in the first increment).
- CMB / CMD.
- Iterative attacks from BAB.
- Skill totals including class-skill +3 and ACP.
- Spell DC; bonus spells from ability score.
- Total weight; load category.
- Initiative.

### 4.2 Explicitly later

- Full typed-bonus graph (every CRB bonus type on every check).
- Automatic feat math (Power Attack, Combat Expertise, Weapon Finesse toggling).
- Spellbook legality, domain spell slots auto-granted, school opposition.
- Magic item generation, charging wands as encyclopedia.
- Prestige prereq checking.
- Familiars / animal companions / eidolons as nested sheets. **1.0 Synthesist** is an overlay on the same sheet, not this nested-PC work.
- Mythic, path of war, 3PP.

### 4.3 Stacking (pragmatic 0.9)

Do **not** port `engine/stacking.ts` item/status/circumstance. For 0.9, AC uses explicit inputs (armor bonus, shield, Dex, size, natural, deflection, dodge, other) with CRB-ish combination: dodge and “other” sum; armor/shield/natural/deflection take the field as given (user responsible for not stacking two enhancement bonuses until a later stacker exists). Document this in the schema notes so goldens are honest.

---

## 5. UI (PF1e-specific)

Fork or parameterize vs PF2e:

- **Identity:** classes table (add class, levels), alignment, race, size. No heritage/background/edicts required (background can be notes).
- **Abilities:** six scores, not boost totals.
- **Combat:** BAB, saves, three ACs, CMB/CMD, iteratives — not proficiency ranks or MAP.
- **Skills:** ranks + class checkbox, not untrained/trained/expert/master/legendary.
- **Spells:** per-class entry; DC by spell level; no focus pool / hero points.
- **Play:** current HP (can be negative); conditions; daily resources. No dying track.
- **Inventory:** lb, not bulk/invested.

Shared: Notes, generic feat/feature row tables, Save/Load, derived-cell look, **sidebar host** (PF1e may register edition tools later; none required for 0.9).

---

## 6. Golden-test characters

Engineering fixtures. Assert core outputs. Until catalog batches 8–10 land, goldens keep numeric combat/skill inputs on the sheet (PF1e ContentRef has no `rulesetSource`; that field is PF2e-only).

1. **Fighter 5** — full BAB, heavy armor, **one** attack at +5 (iteratives start at BAB +6), Fort good, skill ACP, HP from d10s.
2. **Wizard 5** — ½ BAB, prepared arcane, INT DCs, bonus spells, cantrips, light load, poor Fort/Ref good Will.
3. **Multiclass** — **Fighter 2 / Wizard 3** (or same level split). Assert **stacked** BAB and mixed saves. This is the fixture that proves `classes[]` is not a single-class afterthought.

Exact ability scores, feats, and spell picks are chosen when writing the fixture. Roles above stay covered.

Optional later (this First Edition finish): Cleric 5 (domains/channel as daily resources), prestige smoke test (Fighter 5 / Duelist 2), and companion table fixture (Ranger 5) have all landed (`cleric-5.json`, `fighter-5-duelist-2.json`, `ranger-5-companion.json`). **1.0 Synthesist golden:** landed (`synthesist-5.json`). **Playtest priority override golden:** landed (`wizard-transmutation-7.json` — CRB Wizard 7 Transmutation specialist).

---

## 7. Content pack (Phase 3c)

Curated CRB player catalog under [`content/pf1e/crb/`](../content/pf1e/crb/). Review process: [`pf1e-crb-pack-design.md`](pf1e-crb-pack-design.md) — **two mechanics per batch**.

Batch 1–15 (landed, including Batch 7): ability modifiers + BAB/saves; HP dialog + iteratives; AC/CMB; skills; size; encumbrance (Ignore weight opt-out); spell DC + bonus slots from ability; Human race catalog (ability +2 stays typed); Fighter/Wizard class skills + skill-point pool; documentary weapons/armor ids; remaining 9 CRB classes; documentary feat ids (Combat math stays typed); documentary spell ids; remaining CRB player races + size stamp; class spells-per-day tables with hybrid Max. Remaining mundane weapons/armor are queued as batches 16–21 ([pack design §7](pf1e-crb-pack-design.md)); **batches 16–19 landed** (simple, martial, and exotic weapons). **W1–W7 landed** `reach`, `brace`, `trip`, `disarm`, `monk`, `nonlethal`, and `double` on `weapon.properties`, an **array of N tags** (one is valid; many are valid; magic properties use the same list). Double weapons also stamp a documentary `secondHead` ([pack design §7.6](pf1e-crb-pack-design.md)). **Batch 20 landed** remaining light + medium armor. **Batch 21 landed** heavy armor, shields (`kind: shield`), and mundane extras. Magic weapons/armor overlay landed. Honesty/code fixes and Wizard 7 playtest additions landed (stale W7 test titles; golden inventory vs catalog stamp; honest `focusTab`; Wizard features and spells packed). Batches F1a–F1c, F2a–F2c, F3a–F3c, F4, and S1–S5 landed (all 177 CRB feats and all 622 CRB spells packed, completing the entire CRB player catalog). **APG follow-through landed** (Summoner `spellsPerDay` + 27-spell catalog; [`pf1e-apg-pack-design.md`](pf1e-apg-pack-design.md)). **Sidebar tools landed** (Attack Helper, Actions List, Budget Calculator). Load penalties, equipped-item AC, class features, feat combat math, Spell Focus DC, domain/specialist extras, and auto-filled spellbooks are not auto-written.

License: mechanics-only until rules text ([ADR 0007](adr/0007-content-licensing.md)). **1.0 landed.** Spanish UI catalog: [`../app/src/locales/es.json`](../app/src/locales/es.json). Synthesist golden landed.

**1.0 (not this CRB pack):** Playable APG Synthesist Summoner. Do not add `class.summoner` to `content/pf1e/crb/`. Slice 3 landed: Synthesist golden.

---

## 8. Relationship to PF2e

Reuse is the **kernel**, not the rules. See [`shared-kernel-design.md`](shared-kernel-design.md): PWA, Ajv Load/Save, `ContentRef` core, `Effect` stub, coins, notes, `DerivedCell`, **sidebar host**. Do not share proficiency math, bulk, hero points, `ProficiencyRank`, or a single character TypeScript type. A shared golden helper was inventoried and **not** extracted; goldens live per-system plus `shell/goldens.stability.test.ts`.

PF2e Dual Class (campaign option) stays out of PF2e 0.9; it is **not** the same as PF1e multiclass. PF1e multiclass is in scope here.

---

## Appendix — Document history

| Date | Change |
| --- | --- |
| 2026-08-17 | Initial PF1e system spec under ADR 0003 |
| 2026-08-17 | Share sidebar host with PF2e; PF1e tools optional later |
| 2026-08-17 | Schema v1 (ADR 0006). Fighter 5 golden uses a single +5 iterative (CRB). |
| 2026-08-17 | Phase 3e: Fighter 2 / Wizard 3 golden proves stacked BAB/saves. |
| 2026-08-17 | Phase 3c batch 1: CRB pack process; ability modifiers + BAB/saves. |
| 2026-08-17 | Phase 3c batch 2: HP breakdown dialog (manual HD rolls) + iterative slash notation. |
| 2026-08-17 | Annotate upcoming CRB batches 3–10; next is AC/touch/FF + CMB/CMD. |
| 2026-08-17 | Size lock is AC/attack/CMB/CMD/carry, not skill size mods. PF1e goldens have no `rulesetSource`. |
| 2026-08-17 | Ability modifier uses `tempScore` (score bump) plus `tempModifier` (check/DC addend). |
| 2026-08-18 | Audit 1A–10B on local `main`. Next pack work is still batch 3 table tests. |
| 2026-08-18 | Batch 3 AC/CMB review landed. Next pack work is skills (batch 4). |
| 2026-08-18 | Batch 4 skill review landed. Next pack work is size tables (batch 5). |
| 2026-08-18 | Batch 5 size review landed. Next pack work is encumbrance (batch 6). |
| 2026-08-18 | Batch 6 encumbrance review landed (Ignore weight opt-out). Next pack work is Human catalog (batch 8). |
| 2026-08-18 | Batch 8 Human catalog landed. Next pack work is class skills (batch 9). |
| 2026-08-18 | Batch 9 class skills + skill-point pool landed. Next pack work is weapons/armor ids (batch 10). |
| 2026-08-18 | Batch 10 documentary weapons/armor ids landed. Next pack work is remaining 9 CRB classes. |
| 2026-08-18 | Batch 11 remaining 9 CRB classes landed. Next pack work is feat catalog ids. |
| 2026-08-18 | Batch 12 documentary feat ids landed. 1.0 bar includes playable Synthesist Summoner. |
| 2026-08-18 | Batch 13 documentary spell ids landed. Next pack work is Batch 7 pack review. |
| 2026-08-18 | Batch 7 spell DC + bonus-spells table tests landed. Next is PWA proof. |
| 2026-08-18 | App draft buffer + PWA proof landed. Next is OGL then 1.0. |
| 2026-08-18 | OGL / PI review landed (ADR 0007). Next is 1.0 Synthesist + Spanish. |
| 2026-08-18 | APG slice 1: Summoner catalog + Synthesist name. Next is evolutions + fused overlay. |
| 2026-08-18 | Progress snapshot: PF1e 0.9 bar landed; 1.0 in progress. |
| 2026-08-19 | APG slice 2: documentary evolutions + fused overlay. Next is Synthesist golden. |
| 2026-08-19 | Synthesist golden (Half-Elf Radiant Striker). Next is Spanish. |
| 2026-08-19 | Spanish UI catalog. Next is 1.0 stability. |
| 2026-08-19 | 1.0 stability. Next is leftover PF2e work. |
| 2026-08-19 | Finish First Edition this release; leftover PF2e waits for a later release. |
| 2026-08-19 | CRB batch 14: remaining player races + size stamp. Next is spells-per-day tables. |
| 2026-08-27 | CRB batch 15: class spells-per-day tables + hybrid Max. Next is remaining catalog rows. |
| 2026-08-27 | Remaining mundane CRB weapons/armor queued as batches 16–21; magic gear reserved later. |
| 2026-08-27 | CRB batch 16: remaining simple melee + simple ranged. Next mundane equipment is martial weapons. |
| 2026-08-27 | CRB batch 17: martial light + remaining martial one-handed. Next is martial two-handed + bows. |
| 2026-08-27 | Weapon Special tags queued one type per PR after all weapon ids; not in 16–19. `weapon.properties` is an array (2+ tags; later magic properties use the same list). |
| 2026-08-27 | CRB batch 18: martial two-handed + martial ranged and arrows. Next is exotic weapons. |
| 2026-08-27 | CRB batch 19: exotic melee + exotic ranged and repeating bolts. Next catalog is W1 reach. |
| 2026-08-27 | W1: reach on `weapon.properties` (N tags: one or many). Next is W2 brace. |
| 2026-08-27 | W2: brace appended. Next is W3 trip. |
| 2026-08-27 | W3: trip appended. Next is W4 disarm. |
| 2026-08-28 | W4: disarm appended. Next is W5 monk. |
| 2026-09-01 | W5: monk appended. Next is W6 nonlethal. |
| 2026-09-01 | W6: nonlethal appended. Next is W7 double. |
| 2026-09-01 | W7: double appended plus documentary secondHead. Next is Batch 20 armor. |
| 2026-09-01 | CRB batch 20: remaining light + medium armor. Next is heavy armor + shields. |
| 2026-09-01 | CRB batch 21: heavy armor + shields + extras. Next is remaining feats/spells. |
| 2026-09-03 | Next code is honesty/code fixes; sidebar tools are the last character-sheet feature. |
| 2026-09-03 | Remaining CRB feat/spell ids locked (F1–F4, S1–S5). |
| 2026-09-12 | Wizard 7 playtest override (Flare Nightingale) landed: features, feats, spells, and golden fixture. |
| 2026-09-12 | Honesty/code fixes landed: W7 test renames, golden weapon stamps vs catalog, focusTab wired. |
| 2026-09-12 | Next code is remaining CRB feats/spells from locked tables (F1–F4, S1–S5). |
| 2026-09-12 | Batches F1a–F1c landed (54 combat feats; 65 CRB feats packed); next is F2a |
| 2026-09-14 | Document audit & sync: align First Edition finish status and next code step (F2a) |
| 2026-09-14 | Batch F2a landed (17 combat feats; 82 CRB feats packed); next is F2b |
| 2026-09-14 | Batch F2b landed (17 combat feats; 99 CRB feats packed); next is F2c |
| 2026-09-14 | Batch F2c landed (18 combat feats; 117 CRB feats packed; combat category complete); next is F3a |
| 2026-09-14 | Batches F3a–F3c landed (47 general feats; 164 CRB feats packed; general category complete); next is F4 |
| 2026-09-14 | Batch F4 landed (13 item creation + metamagic feats; all 177 CRB feats packed); next is S1 |
| 2026-09-14 | Batches S1–S5 landed (578 spells packed; all 622 CRB spells packed; CRB catalog complete); next is APG follow-through |
| 2026-09-20 | APG follow-through landed (Summoner spellsPerDay table + 27 APG spells); synthesist-5 golden stamped |
| 2026-09-21 | Architecture deepening: PF1e catalog picker (ADR 0009 slices 1 & 2) landed |
| 2026-09-22 | Named sidebar tools (Attack Helper, Actions List, Budget Calculator) and pre-release hygiene landed |
| 2026-09-23 | Reliability & a11y pass: shared ModalDialog with focus management, shell ErrorBoundary, and draftStore connection fix |
| 2026-09-24 | Hygiene pass: HP breakdown dialog on ModalDialog, catalog picker capped first page, and override prototype pollution safety landed |
