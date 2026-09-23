# PF1e Core Rulebook pack (Phase 3c)

**Status:** Complete. Mechanic batches 1–21 and W1–W7 landed (Batch 15 is class spells-per-day + hybrid Max; W7 is double plus a documentary second head; Batch 20 is remaining light + medium armor; Batch 21 is heavy armor + shields). OGL / Product Identity review landed ([ADR 0007](adr/0007-content-licensing.md)). Stakeholder priority override (Wizard 7 playtest character) and Phase 1x honesty / code fixes landed (2026-09-12). APG Synthesist lives in a **separate** pack ([`pf1e-apg-pack-design.md`](pf1e-apg-pack-design.md)). This CRB folder stays CRB-only. All 177 CRB feats (Batches F1–F4) and all 622 CRB spells (Batches S1–S5) have landed, completing the entire CRB player catalog. APG follow-through (Summoner `spellsPerDay` + 27-spell catalog), catalog picker, and all three sidebar tools have landed.  

**Parent:** [`pf1e-character-sheet-design.md`](pf1e-character-sheet-design.md) §7, [ADR 0003](adr/0003-multi-system-product-direction.md)  
**On disk:** [`../content/pf1e/crb/`](../content/pf1e/crb/)  
**Code:** `app/src/systems/pf1e/content/` (lookup only; unknown ids do not fail Load)

This is not a dump of the Core Rulebook. Each batch takes **two character-creation / core-math mechanics**, checks the CRB procedure, maps it onto the sheet (or records the intended implementation), and only then adds the smallest catalog slice those mechanics need.

No class flavor text, no spell descriptions, no Product Identity. Landed batches ship **engine formulas** and, when needed, **numeric catalog tags** (Fighter/Wizard HD/BAB/saves).

---

## 1. How a batch works

For each mechanic:

1. **CRB rule** — what the Core Rulebook tells a player to do (procedure and table), in our own words.
2. **App today** — schema field, `compute()` helper, UI control, golden coverage.
3. **Gaps** — missing, approximated, or easy to misuse. 0.9 vs later.
4. **Pack slice** — catalog ids / tables to add *now*, or “engine-owned, no catalog row.”
5. **Tests** — Vitest against published table numbers, not against a second copy of the formula alone.

Do **not** add the next two mechanics in the same PR unless they are required to test this batch.

Resolver rule (locked): missing catalog id → treat as **custom**; isolate to that row; never reject the whole sheet.

---

## 2. Mechanic queue (character basics)

Order is CRB character-build order, not encyclopedia order. Sidebar tools stay out. **Two mechanics per PR** — do not start the following pair in the same change.

**How to pick the next PR:** the 0.9 character-basics queue and mundane 16–21 / W1–W7 rows are **Done**. Honesty / code fixes and Wizard 7 playtest rows landed. Remaining feat/spell ids are **locked** ([§8](#8-remaining-crb-feats-and-spells)). Batches **F1a–F1c**, **F2a–F2c**, **F3a–F3c**, **F4**, and **S1–S5** landed (all 177 CRB feats and all 622 CRB spells packed, completing the entire CRB player catalog). APG follow-through, catalog picker, and sidebar tools (Attack Helper, Actions List, Budget Calculator) have all landed. Next is pre-release / hygiene.

| Batch | Mechanics | Why this pair | Kind | Status |
| --- | --- | --- | --- | --- |
| **1** | Ability scores → modifiers; BAB + save progressions (and how they stack) | Scores feed every later total; BAB/saves are the class-table core | Engine + Fighter/Wizard tags | Done |
| **2** | Hit points (HD + Con + favored); iterative attacks from BAB | HD uses class hit die from batch 1; iteratives are a use of BAB | Engine + HP dialog / slash line | Done |
| **3** | AC / touch / flat-footed; CMB / CMD | Same Combat block; Dex, size, dodge, and deflection are shared | Engine review (no new catalog) | Done |
| **4** | Skills (ranks, class +3, ACP); max ranks = character level | Skill total vs rank cap; ACP already lives on AC inputs | Engine review (class-skill list waits for 9) | Done |
| **5** | Size (AC/attack vs CMB/CMD vs carry) | One CRB size table, three consumers (AC/attack, CMB/CMD, carry) | Engine review (table tests; goldens stay Medium) | Done |
| **6** | Encumbrance (Strength heavy-load table; light / medium / heavy) | Carry multiplier comes from size (batch 5) | Engine review | Done |
| **7** | Spell DC; bonus spells from ability | Already computed in Phase 2e | Engine review (no new catalog) | Done |
| **8** | Race (Human first — golden) | Golden `race.human`; ability adjustments stay typed into scores | Catalog | Done |
| **9** | Class skills + skill points per level (Fighter, Wizard) | Needs skill math from batch 4 | Catalog | Done |
| **10** | Weapons / armor on the three goldens | Documentary item ids; combat numbers stay on `armorClass` / `attacks` | Catalog | Done |
| **11** | Remaining 9 CRB classes (progressions + class skills) | Same catalog row as Fighter/Wizard; Identity select already lists `CRB_CLASSES` | Catalog | Done |
| **12** | Feats on the three goldens | Documentary feat ids; Combat math stays typed | Catalog | Done |
| **13** | Spell metadata on the goldens | Documentary spell ids; slots/DCs/prepared stay typed | Catalog | Done |
| **14** | Remaining CRB player races; stamp catalog size | Identity already lists `CRB_RACES`; Gnome/Halfling are Small; ability adjustments stay typed | Catalog | Done |
| **15** | Class spells-per-day tables; hybrid Max (computed default + click-to-override) | Bonus-slot math from batch 7 needs the class table to fill Max | Catalog + engine/UI | Done |
| **16** | Remaining simple melee; simple ranged + simple ammo | CRB simple weapon table, two halves. Skip packed dagger/quarterstaff | Catalog | Done |
| **17** | Martial light; remaining martial one-handed | CRB martial melee that is not two-handed. Skip packed longsword | Catalog | Done |
| **18** | Martial two-handed; martial ranged + arrows | Rest of the martial table | Catalog | Done |
| **19** | Exotic melee; exotic ranged + repeating bolts | CRB exotic table, two halves. Double weapons stay one row / primary head | Catalog | Done |
| **W1** | Reach | First Special tag after all weapon ids exist | Catalog | Done |
| **W2** | Brace | One CRB Special quality | Catalog | Done |
| **W3** | Trip | One CRB Special quality | Catalog | Done |
| **W4** | Disarm | One CRB Special quality | Catalog | Done |
| **W5** | Monk | One CRB Special quality | Catalog | Done |
| **W6** | Nonlethal | One CRB Special quality | Catalog | Done |
| **W7** | Double (second head) | Last: needs a second documentary head, not only a tag | Catalog | Done |
| **20** | Remaining light armor; remaining medium armor | Skip packed chain shirt / chainmail | Catalog | Done |
| **21** | Heavy armor; shields (+ mundane extras) | Finish the CRB armor table. New `kind: shield` stamps `ItemEntry.shield` | Catalog | Done |
| **later** | Magic weapons; magic armor | Overlay on mundane ids; no `plus-1` catalog ids | Catalog | Done |
| **F1a** | Remaining combat feats (part 1 of 6: Agile Maneuvers–Dazzling Display) | First 18 combat feats. Documentary stamp | Catalog | Done |
| **F1b** | Remaining combat feats (part 2 of 6: Deadly Aim–Greater Overrun) | Next 18 combat feats | Catalog | Done |
| **F1c** | Remaining combat feats (part 3 of 6: Greater Penetrating Strike–Improved Trip) | Next 18 combat feats | Catalog | Done |
| **F2a** | Remaining combat feats (part 4 of 6: Improved Two-Weapon Fighting–Quick Draw) | Next 17 combat feats | Catalog | Done |
| **F2b** | Remaining combat feats (part 5 of 6: Rapid Reload–Staggering Critical) | Next 17 combat feats | Catalog | Done |
| **F2c** | Remaining combat feats (part 6 of 6: Stand Still–Wind Stance) | Next 18 combat feats | Catalog | Done |
| **F3a** | Remaining general feats (part 1 of 3: Acrobatic–Extra Ki) | Next 16 general feats | Catalog | Done |
| **F3b** | Remaining general feats (part 2 of 3: Extra Lay On Hands–Leadership) | Next 16 general feats | Catalog | Done |
| **F3c** | Remaining general feats (part 3 of 3: Lightning Reflexes–Turn Undead) | Next 15 general feats | Catalog | Done |
| **F4** | Remaining item creation + metamagic (Brew Potion–Widen Spell) | Remaining 13 item creation and metamagic feats | Catalog | Done |
| **S1** | Remaining spells levels 0–1 | Finished in S1–S5 bulk landing (82 spells) | Catalog | Done |
| **S2** | Remaining spells levels 2–3 | Finished in S1–S5 bulk landing (147 spells) | Catalog | Done |
| **S3** | Remaining spells levels 4–5 | Finished in S1–S5 bulk landing (139 spells) | Catalog | Done |
| **S4** | Remaining spells levels 6–7 | Finished in S1–S5 bulk landing (127 spells) | Catalog | Done |
| **S5** | Remaining spells levels 8–9 | Finished in S1–S5 bulk landing (83 spells) | Catalog | Done |

The 0.9 character-basics write-ups are in §4. Batches 14–15 are 1x fill-out. Batches 16–19 landed remaining simple, martial, and exotic weapon ids. **W1–W7** landed `reach`, `brace`, `trip`, `disarm`, `monk`, `nonlethal`, and `double` on a `weapon.properties` array of **N** tags (one is valid; many are valid). W7 also stamps a documentary `secondHead`. **Batches 20–21** landed remaining armor and shields. Honesty/code fixes landed (stale W7 test titles; golden inventory vs catalog `properties` / `secondHead`; honest `focusTab`). CRB feat and spell catalog work is complete (all 177 feats and all 622 spells packed). Magic properties use the same list. Mundane equipment fill-out is locked in [§7](#7-remaining-mundane-weapons-and-armor). APG follow-through, catalog picker, and sidebar tools (Attack Helper, Actions List, Budget Calculator) have landed. Next is pre-release / hygiene.

---

## 3. Pack layout

```text
content/pf1e/crb/
  README.md          # license / what is in this folder
  pack.json          # manifest + which batches have landed
  classes.json       # HD/BAB/saves + class skills + skill points + spells/day (casters)
  races.json         # race id + name + size (batch 8 Human; batch 14 remaining CRB player races)
  items.json         # weapon/armor/gear ids (batch 10 goldens; 16–21 remaining mundane; magic overlay)
  feats.json         # feat id + name + category (all 177 CRB feats packed)
  features.json      # class feature id + name + source (Arcane Bond, Physical Enhancement, Telekinetic Fist)
  spells.json        # spell id + name + spellLevel (all 622 CRB spells packed)
```

A class catalog row in this phase is **not** a class description. It is:

| Field | Why |
| --- | --- |
| `id` | `class.fighter`, `class.rogue`, … |
| `name` | Display label |
| `hitDie` | d10 / d6 / … (HP batch will use this; stored now because it is on the class table) |
| `babProgression` | `full` / `threeQuarter` / `half` |
| `saves.fort/ref/will` | `good` / `poor` |
| `skillPointsPerLevel` | Ranks per level before Int (all 11 CRB classes) |
| `classSkills` | Seeded skill keys that stamp checkboxes (batch 9) |
| `spellsPerDay` | Optional 20×10 table (batch 15). null cell = cannot cast yet; 0 = table lists 0. Cleric omits domain +1. |
| `source.book` | `"CRB"` — page omitted until we cite without copying tables as images |

Features, proficiency lists, and domain/specialist extra slots wait. Craft/Perform/Profession wildcards are not in `classSkills`.

---

## 4. License (this folder)

Review landed 2026-08-18: [ADR 0007](adr/0007-content-licensing.md), [`content-licensing.md`](content-licensing.md).

- **App code:** MIT.
- **This pack:** curated **game mechanics numbers** (ids, names, HD/BAB/save tags, pounds, documentary weapon/armor fields, spell level). No Paizo logos, no Golarion gazetteer, no copied feat/spell/class **prose**.
- Do not scrape d20pfsrd / Archives of Nethys / Hero Lab as the ship pack.
- **OGL 1.0a / Section 15 is not in the repo yet.** Add it in the same change that first ships Open Game Content **rules text**. `pack.json` has `contentKind: mechanics-only` and `oglNoticeRequired: false`.
- Vitest [`licenseGate.test.ts`](../app/src/systems/pf1e/content/licenseGate.test.ts) scans entity JSON for forbidden prose keys and a short Product Identity word list. `class.summoner` is not in this folder.

---

## Batch 1 — two mechanics

### 4.1 Ability scores and modifiers

**CRB (player-facing):** Each character has six ability scores: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma. The **ability modifier** for a score is read from the Ability Modifiers table, which is exactly:

`modifier = floor((score − 10) / 2)`

Examples: 1 → −5; 8–9 → −1; 10–11 → 0; 12–13 → +1; 18–19 → +4; 20–21 → +5. Odd and even scores in a pair share a modifier. There is **no maximum score** in the table (magic items and spells can raise scores past 18).

How the score is *generated* (4d6 drop lowest, point-buy, elite array) is a campaign choice. The sheet stores the **final score after racial adjustments**.

Temporary bonuses that **increase the score** (belt of giant strength, *bull’s strength*) change the score, then the modifier is recomputed. Bonuses that apply to **checks** but not the score are a different layer (later typed-bonus work).

**App today:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Input | `abilities.{str…cha}.score` | Integer; no schema max |
| Extra | `tempModifier` | **Added to the modifier after** `floor((score−10)/2)` — not added to the score |
| Engine | `abilityModifierFromScore`, `abilityModifiers` in `engine/abilities.ts` | Used by AC, CMB, skills, saves, spell DC, attacks, load (Strength **score**, not modifier, for encumbrance) |
| UI | Abilities tab: Score, Temp mod, derived Modifier | |
| Goldens | Fighter 5, Wizard 5, Fighter 2 / Wizard 3 | Assert the six modifiers |

**Verdict:** The **formula is correct** and matches the CRB table. Encumbrance correctly uses the **score**, not the modifier.

**Gaps (do not fix in this batch unless they block goldens):**

| Gap | Why it waits |
| --- | --- |
| `tempModifier` is a modifier addend, not a score increase | A +4 belt should be entered as score 18→22 (modifier +6), not temp +4 (which would yield modifier +8 on a 18). Documented on the Abilities tab. A later “ability score bonus” field could exist; do not silently treat temp as a score bump. |
| No point-buy / 4d6 helper | User types the final score. Out of 0.9 core calc. |
| No racial ability adjustments as catalog | Human +2 any is entered in the score. Batch 8 stamps `race.human` id/name only. |
| Score 0 / negative | Formula still applies (`0` → −5). CON 0 as “dead” is play-state later, not this formula. |
| Ability damage / drain | CRB lowers the score. User lowers `score`. No separate track in 0.9. |

**Pack slice:** none. This table is **engine-owned** (small, closed formula). Do not duplicate it as a JSON lookup of every score.

**Tests:** CRB sample scores including odd values, 1, 20, and a high score (45). `tempModifier` adds to the modifier only.

---

### 4.2 Base attack bonus and saving throws

**CRB (player-facing):** Each class has a **base attack bonus** progression and three **base save** progressions (Fortitude, Reflex, Will), each **good** or **poor**.

Published class tables (levels 1–20) match these formulas:

| Progression | Formula | Level 1 | Level 5 | Level 20 |
| --- | --- | --- | --- | --- |
| BAB full (Fighter, Barbarian, Paladin, Ranger) | `levels` | +1 | +5 | +20 |
| BAB ¾ (Cleric, Druid, Rogue, Bard, Monk) | `floor(levels × 3 / 4)` | +0 | +3 | +15 |
| BAB ½ (Wizard, Sorcerer) | `floor(levels / 2)` | +0 | +2 | +10 |
| Save good | `2 + floor(levels / 2)` | +2 | +4 | +12 |
| Save poor | `floor(levels / 3)` | +0 | +1 | +6 |

**Multiclass (CRB):** Add the **integer** BAB from each class, and the **integer** base save from each class. Do **not** add all class levels together and then look up one table. Do **not** use the optional “fractional BAB/saves” house rule in 0.9.

Example (golden): Fighter 2 (full BAB +2, Fort good +3, Ref poor +0, Will poor +0) + Wizard 3 (half BAB +1, Fort poor +1, Ref poor +1, Will good +3) → BAB **+3**, base Fort **+4**, base Ref **+1**, base Will **+3**. Ability modifiers are applied **after** that stack (Fort + Con, etc.).

**Iterative attacks** (extra attacks at BAB +6 / +11 / +16, −5 steps) are a **use of BAB**, not the BAB table itself. They are **batch 2**.

**App today:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Input | `classes[].babProgression`, `classes[].saves`, `classes[].levels` | User-entered per row |
| Engine | `babFromProgression`, `saveFromProgression`, `stackedBab`, `stackedSave` | Per-row then sum |
| Derived | `derived.bab`, `fortitude` / `reflex` / `will` (base + ability + misc) | Combat tab |
| UI | Identity class table: HD, BAB, Fort/Ref/Will selects | Catalog did not fill these |
| Goldens | Fighter 5 BAB 5; Wizard 5 BAB 2; F2/W3 BAB 3 | Spot checks, not 1–20 tables |

**Verdict:** Formulas and **per-class stacking** match CRB. Empty sheet (no class rows) yields BAB 0 and base saves 0, which is correct for “no class.”

**Gaps:**

| Gap | Why it waits / this batch |
| --- | --- |
| Identity did not stamp HD/BAB/saves from `class.fighter` | **This batch:** catalog + apply when the player picks a CRB class. Custom rows stay fully manual. |
| Only Fighter and Wizard in the pack | Other 9 CRB classes use the same three BAB tags; add them when we review those classes, not all at once. |
| Fractional BAB/saves | Optional variant. Out. |
| Prestige class tables | Out of 0.9 goldens. |
| Saves include ability + misc in `derived.fortitude` | Correct CRB total; base-only is not a separate derived field. Goldens assert the **total**. |

**Pack slice:** `classes.json` with **Fighter** and **Wizard** progression tags only.

**Tests:** Full 1–20 BAB (all three tags) and save (good/poor) tables; catalog rows match those tags; unknown id resolves to miss; applying `class.fighter` onto an empty class row yields d10 / full / good Fort.

---

## 5. Resolver (batch 1; race in batch 8)

```ts
lookupCrbClass(id) → CrbClassProgression | null
applyCrbClassProgression(classRow, id) → ClassEntry
lookupCrbRace(id) → CrbRace | null
applyCrbRace(identity, id) → Identity
```

- Known class id → fill `class` ref, `hitDie`, `babProgression`, `saves`, `skillPointsPerLevel`. Leave `levels` and favored-class totals alone. Identity also **stamps** class-skill checkboxes from the union of catalog lists (`stampClassSkills`). Ranks are not spent.
- Known race id → fill `race` id, name, and source. Stamp `identity.size` when the catalog row has `size` (batch 14). Do **not** rewrite ability scores or languages.
- Unknown or empty id → `null` / custom (`class.id` or `race.id` cleared). Do not throw.
- Load of an existing sheet **does not** re-apply the catalog (the saved row is authoritative). Apply is a UI action when the player picks a class or race.

---

## Batch 2 — two mechanics

### 4.3 Hit points (HD + Con + favored)

**CRB (player-facing):** Each class level grants one **hit die**. At **1st character level**, the die is usually taken as **maximum** (d10 fighter → 10). At later levels the player **rolls** that class’s hit die at the table. Constitution modifier is added to **each** HD. A level never grants fewer than **1** HP. **Favored class** may add +1 HP per level in that class (instead of +1 skill rank). The sheet does **not** roll.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Input | `vitals.hpRolled[]` | Die results **before** Con, in class-row order |
| Engine | `hpFromHitDie` = `max(1, roll + Con)`; `maxHp`; `hpBreakdown` | Missing rolls contribute 0 |
| Favored | `classes[].favored.hp` | Summed after dice |
| UI | Click **max HP** (`/ 40`) or Play → Max HP / Enter HD rolls | Dialog: one row per HD, type the physical roll, Con and from-HD, favored lines, total |
| Goldens | Fighter 5 = 49; Wizard 5 = 37; F2/W3 = 40 | Unchanged |

**Verdict:** The formula matches CRB. 1st-level max is **not auto-written** (the player types 10 or clicks **Max 1st**). HD slots follow `classes[]` order (Fighter 2 then Wizard 3 → two d10 then three d6).

**Gaps:** Toughness and other HP feats are still user-entered favored/misc later, not auto. Temp HP is play-state, not in max. Average-HP optional rule is “type 6 on a d10,” not a second engine.

**Pack slice:** none new (hit die size already on the class catalog from batch 1).

**Tests:** Golden breakdowns; min 1 HP; `setHitDieRoll` fills in order.

### 4.4 Iterative attacks

**CRB (player-facing):** When making a **full-round attack** with a manufactured weapon, extra attacks come from BAB: a second attack at **BAB +6** (at BAB−5), a third at **+11**, a fourth at **+16**. Maximum **four** from BAB. **Fighter 5 is a single +5**, not +5/+0. Haste, two-weapon fighting, and natural attacks are separate (not this batch). No in-app dice.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Engine | `iterativeAttacks(bab)` | `[bab]` then −5 while the next bonus is ≥ +1, max four |
| Display | Identity BAB; Combat “Iterative attacks”; each attack’s Attack cell | CRB slash line: `+6/+1` |
| Goldens | Fighter 5 `[5]` / longsword `+9`; Wizard `[2]`; F2/W3 `[3]` | Unchanged |

**Verdict:** Matches the CRB extra-attack table for BAB 1–20.

**Gaps:** Full-round vs standard action is a reminder, not an encounter tracker. Rapid Shot / TWF wait with feat automation.

**Pack slice:** none (pure BAB math).

**Tests:** Full BAB 1–20 iterative lists; `formatIteratives`; Fighter 5 is not +5/+0.

---

## Batch 3 — two mechanics

### 4.5 Armor class, touch, and flat-footed

**CRB (player-facing):** Armor Class starts at **10**. Add armor bonus, shield bonus, Dexterity modifier (not more than the armor’s **maximum Dex bonus**), size modifier, natural armor, deflection, dodge, and any other AC bonuses the player is tracking. A Dexterity **penalty** is not limited by max Dex.

**Touch** AC is the total without armor, shield, or natural armor (those require hitting the armor, not the creature). Dex, size, deflection, dodge, and similar still apply.

**Flat-footed** AC loses the Dexterity **bonus** and **dodge**. Dexterity **penalties** still apply. Uncanny Dodge and similar exceptions are not this batch.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Input | `armorClass.*` | Armor, shield, natural, deflection, dodge, other, `maxDex` (blank = none), ACP |
| Engine | `cappedDexBonus`, `flatFootedDex`, `armorClassValues` in `engine/ac.ts` | `other` is on all three totals; dodge is not on flat-footed |
| UI | Combat AC inputs + AC / touch / FF derived cell | Override flag lights if any of the three paths is overridden; muted note that Other applies to all three |
| Goldens | Fighter 5 **18 / 12 / 16**; Wizard 5 **12 / 12 / 10**; F2/W3 **15 / 11 / 14** | Unchanged |

**Verdict:** The three formulas match CRB for Medium goldens and the Dex-cap / Dex-penalty cases below. Armor/shield/natural/deflection stacking is **user-responsible** (no typed-bonus stacker — risk P2).

**Gaps:**

| Gap | Why it waits |
| --- | --- |
| Item-granted AC from equipped inventory | Batch 10 documentary ids; numbers stay on `armorClass` |
| Armor Training raising chainmail max Dex | Fighter 5 golden notes it is not auto-applied (`maxDex` 2 with Dex +2) |
| Uncanny Dodge keeping Dex when flat-footed | Feat automation later |
| Size table beyond a Small spot check | Landed in batch 5 |

**Pack slice:** none (engine-owned).

**Tests:** Fighter 5 chainmail snapshot; touch omits armor/shield/natural; other on all three; dodge not on FF; Dex penalty on FF; maxDex caps AC/touch.

### 4.6 CMB and CMD

**CRB (player-facing):** **CMB** is BAB + Strength modifier + the **special size modifier** (opposite sign of the AC/attack size modifier) + miscellaneous. **CMD** is 10 + BAB + Strength + Dexterity + special size + dodge + deflection + miscellaneous. Armor, shield, and natural armor do **not** add to CMD. Armor **max Dex does not cap** the Dexterity used for CMD.

One CMD number in 0.9. Maneuver-specific CMD and being flat-footed for CMD wait.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Engine | `compute.ts`: CMB = BAB + STR + special size + `cmbMisc`; CMD adds uncapped DEX, dodge, deflection, `cmdMisc` | `armorClass.other` is **not** added to CMD (use `cmdMisc`) |
| UI | Combat CMB / CMD cell | No extra “CMD vs max Dex” copy (decision 8C) |
| Goldens | Fighter 5 CMB **+9** / CMD **21**; Wizard 5 **+1** / **13**; F2/W3 **+6** / **17** | Unchanged |

**Verdict:** Matches CRB for the goldens and the maxDex / dodge-deflection cases. Special size vs AC is locked with a Small spot check; full size tables landed in batch 5.

**Gaps:** Ranged CMB (Dex); Combat Expertise; CMD vs trip/grapple separately; load penalties auto-written onto max Dex (batch 6, document only).

**Pack slice:** none.

**Tests:** Empty sheet 0 / 10; Fighter 5 9 / 21; maxDex does not lower CMD; dodge and deflection add to CMD not CMB; `other` stays off CMD; Small AC +1 and CMB −1.

---

## Batch 4 — two mechanics

### 4.7 Skill totals (ranks, class +3, ACP)

**CRB (player-facing):** A skill check is **ranks + ability modifier + miscellaneous**. If the skill is a **class skill** and the character has **at least 1 rank**, add **+3**. Armor check penalty applies to Climb, Swim, and the other Dex/Str skills the CRB marks; it does **not** apply to Diplomacy, Perception, Spellcraft, or Knowledge.

Pathfinder 1st Edition does **not** use 3.5’s cross-class half ranks. Every rank spent is a full rank. Skill points per level and Fighter/Wizard class-skill lists landed in **batch 9**.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Input | `skills[].ranks`, `classSkill`, `misc`, `armorPenaltyApplies` | Factory seeds the CRB list (Knowledge subtypes included; Craft/Perform/Profession added in UI) |
| Engine | `skillTotal`, `classSkillBonus` | +3 only when `ranks ≥ 1` and class skill; ACP only if the row flags it |
| ACP source | `armorClass.armorCheckPenalty` | Typed by the player (load penalties not auto-written — batch 6) |
| UI | Skills tab | Total derived; Disable Device / UMD / Handle Animal show **—** at 0 ranks; Fly **—** without a fly speed |
| Goldens | Fighter 5 Climb **+7**, Intimidate **+7**, Perception **+6**, Swim **−1**; Wizard 5 Spellcraft **+12** | Unchanged |

**Verdict:** The formula matches CRB. Fighter 5 Swim is a class skill at 0 ranks and does **not** get +3 (total −1 from Str +4 and ACP −5).

**Gaps:** Spellcraft and Linguistics are also unusable untrained in the CRB; 0.9 blanks only Disable Device, UMD, Handle Animal, and Fly-without-speed (decision 6B). Favored-class skill ranks are stored on the class row and not auto-spent (batch 9 adds them to the pool). Class-skill checkboxes stamp from the pack when the player picks a CRB class.

**Pack slice:** none.

**Tests:** +3 only when trained and class; ACP on Climb not Diplomacy; factory ACP flags match the CRB armor-check list; Fighter 5 and Wizard 5 golden totals.

### 4.8 Maximum ranks

**CRB (player-facing):** You cannot have more ranks in a skill than your **character level** (total Hit Dice). There is no 3.5 cross-class rank cap of level/2.

**App today / this batch:** `ranksExceedLevel` is true when `ranks > level` and `level > 0`. The Skills tab **warns** and does **not** clamp. `compute()` still adds the typed ranks.

**Gaps:** Skill-point pool display landed in batch 9. No schema maximum. Ranks are not auto-spent.

**Pack slice:** none.

**Tests:** Warn at 6 ranks on a 5th-level character; 5 on 5 is fine; over-cap Climb still totals 9 (6 + class +3) rather than clamping to 5.

---

## Batch 5 — two mechanics

### 4.9 Size modifier to AC, attack, CMB, and CMD

**CRB (player-facing):** A creature’s **size** adds a modifier to Armor Class and attack rolls. Fine is **+8**, then Diminutive +4, Tiny +2, Small +1, Medium +0, Large **−1**, Huge −2, Gargantuan −4, Colossal **−8**.

CMB and CMD use a **special size modifier** with the **opposite sign** of that AC/attack number (Small −1 CMB/CMD; Large +1). Swallow-whole and other grapple special cases are not this batch.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Input | `identity.size` | Fine … Colossal select; factory and goldens are Medium |
| Engine | `sizeAcAttackModifier`, `sizeCmbModifier` | AC/attack uses the table; CMB/CMD uses the negated table |
| Consumers | `armorClassValues`; `compute()` melee/ranged and CMB/CMD | Same modifier on AC, touch, and FF; same special size on CMB and CMD |
| Goldens | All three PF1e goldens | Stay Medium (size modifier 0) |

**Verdict:** The published Fine–Colossal row matches the engine. Empty-sheet Small is AC 11 / attack +1 / CMB −1 / CMD 9; Large is the inverse on those combat numbers.

**Gaps:** Size stays on `identity.size` (Human goldens are Medium; batch 14 stamps catalog size on pick). Stealth/Fly size skill modifiers stay player-typed (PF1e design §14). Quadruped / powerful-build carry is batch 6 out-of-scope.

**Pack slice:** none (engine-owned).

**Tests:** Full AC/attack table; special size is always the opposite sign; Small and Large empty-sheet combat deltas; Fighter 5 remains Medium with size 0 on melee and CMB.

### 4.10 Carrying-capacity size multiplier

**CRB (player-facing):** Carrying capacity is the Medium biped Strength table multiplied by a **size factor**: Fine ×1/8, Diminutive ×1/4, Tiny ×1/2, Small ×3/4, Medium ×1, Large ×2, then ×4 / ×8 / ×16 for Huge / Gargantuan / Colossal.

Light and medium load are still fractions of that heavy load. Strength-table pounds and load *category* are **batch 6**. Quadruped (×1.5) is not this batch.

**App today / this batch:** `sizeCarryMultiplier` feeds `loadThresholds`. Small heavy is `floor(Medium heavy × 3/4)`; Large is Medium ×2.

**Gaps:** Strength 1–29 column and overloaded category review wait for batch 6. Inventory auto-sum from equipped armor stays out of 0.9 (player types Combat).

**Pack slice:** none.

**Tests:** Full Medium-relative multiplier table; STR 10 Small/Large thresholds scale off the Medium heavy without asserting the Strength column.

---

## Batch 6 — two mechanics

### 4.11 Strength heavy-load table

**CRB (player-facing):** A Medium biped’s **heavy load** comes from the Strength table (STR 1 = 10 lb, 10 = 100, 14 = 175, 18 = 300, 29 = 1400). **Light** load is one-third of that heavy value; **medium** load is two-thirds. Size from batch 5 multiplies the Medium heavy number first, then those fractions apply.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Engine | `mediumBipedHeavyLoad`, `loadThresholds` | Heavy from the STR column; light = `floor(heavy/3)`; medium = `floor(2×heavy/3)`; × size multiplier |
| Strength used | `effectiveAbilityScore` of STR | `tempScore` raises carry; `tempModifier` does not |
| Goldens | Fighter 5 STR 18 → heavy **300**, light **100** | Unchanged |

**Verdict:** Strength 1–29 matches the published Medium biped column. STR 14 is 58 / 116 / 175; STR 18 is 100 / 200 / 300.

**Gaps:** Quadruped (×1.5) and powerful build wait. Coins are not auto-converted to pounds. STR ≤ 0 is an engine bound (0 lb), not a CRB row.

**Pack slice:** none.

**Tests:** Full STR 1–29 heavy column; STR 14 and 18 light/medium/heavy fractions.

### 4.12 Load category and Ignore weight

**CRB (player-facing):** Compare carried pounds to those three thresholds. At or below light is a light load; then medium; then heavy. More than a heavy load is beyond what the character can carry as a load (the sheet labels this **overloaded**). Medium and heavy loads impose max Dex, ACP, and speed penalties in the CRB.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Carried | `weightUsed` | Quantity × pounds; **dropped** excluded |
| Category | `loadCategory` / `effectiveLoadCategory` | Thresholds are inclusive; above heavy → `overloaded` |
| Ignore | `inventory.ignoreWeight` (optional boolean, omitted = false) | Load category becomes **`ignored`**. Pounds and L/M/H thresholds still compute. No schemaVersion bump |
| UI | Inventory **Ignore weight** toggle | Pressed state; summary shows `N lb · ignored` without L/M/H |
| Penalties | ACP / max Dex / speed | **Not** auto-written from load. The player types them. Muted note on Inventory |

**Verdict:** Category math matches the inclusive CRB bands. The Ignore weight control is a sheet opt-out of the *category*, not of inventory pounds.

**Gaps:** Auto-applying medium/heavy penalties onto ACP, max Dex, and speed stays out of 0.9 (player types). Inventory auto-sum from equipped armor stays out of 0.9.

**Pack slice:** none.

**Tests:** Inclusive bands at STR 18; dropped items excluded; Fighter 5 45 lb light; ignoreWeight → ignored with pounds unchanged; omitted flag still counts weight.

---

## Batch 8 — two mechanics

### 4.13 Human catalog id

**CRB (player-facing):** Race is chosen at character creation. The three goldens are **Human**.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `content/pf1e/crb/races.json` | One row: `race.human` / Human / source CRB |
| Lookup | `lookupCrbRace` | Unknown or empty id → `null` (custom). Never throws |
| Apply | `applyCrbRace` | Stamps `identity.race` id, name, and source. Batch 8 did **not** rewrite size; batch 14 later stamps catalog size |
| UI | Identity Race select | Human or Custom, plus a typed name |
| Goldens | All three PF1e goldens | Already stored `race.human`; Load does not re-apply the catalog |

**Verdict:** The golden id resolves. Custom races stay a free name with `id` cleared.

**Gaps:** Other CRB races and size stamp wait for batch 14; extra feat / extra skill rank / bonus language as catalog traits.

**Pack slice:** Human only.

**Tests:** Catalog lists Human; unknown id is null; goldens resolve `race.human`.

### 4.14 Ability adjustments stay on the score

**CRB (player-facing):** A Human gets **+2 to one ability score** of the player’s choice.

**App today / this batch:** That +2 is **already in the typed score** on the goldens (Fighter STR 18, Wizard INT 18). `applyCrbRace` does not add +2 to any ability. Identity shows a muted note.

**Gaps:** Auto-stamping +2 (which ability?) waits; bonus feat waits with feat catalog. Human extra skill rank per level is in the skill-point **pool** (batch 9) when `race.human`, not auto-spent.

**Pack slice:** none beyond the Human row.

**Tests:** Applying `race.human` leaves ability scores unchanged; unknown apply clears id and keeps the typed name. Size stamp is batch 14.

---

## Batch 9 — two mechanics

### 4.15 Class skills (Fighter, Wizard)

**CRB (player-facing):** Each class has a **class skill** list. If you have at least one level in a class that lists a skill, that skill is a class skill (and the +3 from batch 4 applies once trained). Multiclass **unions** the lists. Craft, Profession (Fighter and Wizard) and Perform are wildcards — not this batch.

**Fighter (seeded skills):** Climb, Handle Animal, Intimidate, Knowledge (dungeoneering), Knowledge (engineering), Ride, Survival, Swim.

**Wizard (seeded skills):** Appraise, Fly, Linguistics, Spellcraft, and all Knowledge skills.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `classes.json` `classSkills` | Keys matching the Skills tab |
| Apply | `stampClassSkills` when Identity picks or removes a CRB class | Standard skills overwritten from the union; Craft/Perform/Profession extras keep their checkbox; **ranks unchanged** |
| Goldens | Fighter 5 / Wizard 5 / F2/W3 flags | Already matched the lists; Load does not re-stamp |

**Verdict:** Catalog lists match the CRB seeded skills. Stamping a Fighter 5 sheet reproduces the golden checkboxes.

**Gaps:** Other 9 CRB classes; Craft/Profession as automatic class skills when the player adds a wildcard row.

**Pack slice:** `classSkills` on Fighter and Wizard.

**Tests:** Lists and 2 skill points; Fighter stamp; F+W union; wildcard extras preserved; golden flags after stamp.

### 4.16 Skill points per level

**CRB (player-facing):** Each class grants a number of skill ranks per level (**Fighter 2**, **Wizard 2**) plus the Intelligence modifier, **minimum 1** per class level. A Human gains **+1 skill rank per character level**. Favored-class skill ranks are extra and chosen by the player. Pathfinder does **not** ×4 ranks at 1st level.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `skillPointsPerLevel` | 2 for Fighter and Wizard; stamped onto the class row on apply |
| Engine | `skillRanksFromClassLevel`, `skillRanksBudget` | Sum of class contributions + favored `skillRanks` + Human +1×level when `race.human` |
| UI | Skills tab | `spent / budget`; warn if over; ranks stay typed |
| Goldens | Fighter 5 **15/15**; Wizard 5 **35/35**; F2/W3 **30/30** | Unchanged |

**Verdict:** The three Human goldens spend exactly the pool. Picking Fighter does not spend ranks.

**Gaps:** Auto-spend of the pool; other classes’ tables (Rogue 8, …). INT tempScore affects the modifier used for the pool (same as other Int-based math).

**Pack slice:** `skillPointsPerLevel` on Fighter/Wizard. Optional `classes[].skillPointsPerLevel` on the sheet (old saves omit; compute falls back to the pack).

**Tests:** Min 1 with Int penalty; Human and favored add to the pool; three golden budgets; stamp does not spend ranks.

---

## Batch 10 — two mechanics

### 4.17 Weapons on the three goldens

**CRB (player-facing):** Equipment tables list a weapon’s **weight, damage dice, type, crit, and range**. The player records those on the sheet. Attack bonuses are a Combat calculation (BAB + ability + misc), not a property that auto-fills from the item.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `content/pf1e/crb/items.json` | Golden ids: `weapon.dagger`, `weapon.longsword`, `weapon.quarterstaff` (plus armor and spellbook in 4.18) |
| Lookup | `lookupCrbItem` | Unknown or empty id → `null` (custom). Never throws |
| Apply | `applyCrbItem` | Stamps item id, name, pounds, and `weapon` subobject. Clears `armor`. Does **not** rewrite quantity, location, `armorClass`, or `attacks` |
| UI | Inventory item select | Catalog or Custom, plus a typed name. Muted note: AC and attacks stay on Combat |
| Goldens | Fighter 5 longsword/dagger; Wizard 5 quarterstaff | Already stored those ids; Load does not re-apply the catalog |

**Verdict:** The golden weapon ids resolve. Quarterstaff is stored as a **single 1d6** to match the golden attack row, not the CRB double-weapon listing. The Fighter 5 dagger row has no `weapon` subobject; the catalog still lists 1d4 / 10 ft for a fresh apply.

**Gaps:** Remaining mundane weapons are queued in [§7](#7-remaining-mundane-weapons-and-armor) (batches 16–19). Magic weapons are reserved later (not plus-N catalog rows). Priced treasure and two-weapon / double-weapon attack rows wait.

**Pack slice:** weapon rows needed by the goldens.

**Tests:** Catalog lists golden ids; unknown id is null; goldens resolve.

### 4.18 Armor (and spellbook) on the three goldens

**CRB (player-facing):** Armor tables list **AC bonus, max Dex, ACP, spell failure, and weight**. Those numbers are copied onto Combat (`armorClass`) by the player. Equipping an item does not by itself change AC.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `items.json` | `armor.chainmail`, `armor.chain-shirt`, `item.spellbook` (3 lb, no combat subobject) |
| Apply | `applyCrbItem` | Armor stamps the documentary `armor` subobject and clears `weapon`. Spellbook stamps pounds only |
| Combat | `armorClass` / `attacks` | **Unchanged** when a catalog item is applied or equipped |
| Goldens | Fighter 5 chainmail; F2/W3 chain shirt; Wizard 5 unarmored + spellbook | Already stored those ids |

**Verdict:** Equipping catalog chainmail on an empty sheet leaves **AC 10**. Fighter 5 still computes AC 18 from the typed `armorBonus` 6.

**Gaps:** Remaining mundane armor and shields are queued in [§7](#7-remaining-mundane-weapons-and-armor) (batches 20–21). Magic armor is reserved later. Auto-sum of equipped AC / ACP / max Dex stays **out of 0.9**.

**Pack slice:** armor and gear rows needed by the goldens.

**Tests:** Apply chainmail does not rewrite `armorClass`; empty sheet AC stays 10; Fighter 5 AC 18 still comes from typed Combat.

---

## Batch 11 — two mechanics

### 4.19 Remaining CRB class progression tags

**CRB (player-facing):** Each base class has a **Hit Die**, **BAB** column (full / ¾ / ½), and **Fort / Ref / Will** (good or poor). The eleven CRB classes are Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Wizard.

**App today / this batch:** Those nine missing classes are extra rows in the **same** `classes.json` / `CrbClassProgression` catalog as Fighter and Wizard. `lookupCrbClass`, `applyCrbClassProgression`, and the Identity class select already consume `CRB_CLASSES` — no second apply path. Unknown ids (e.g. Alchemist) still resolve to custom.

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `classes.json` | Chapter order. Same fields as batch 1 |
| Apply | existing `applyCrbClassProgression` | Stamps HD / BAB / saves / skill-point table. Leaves levels and favored totals |
| Engine | existing `babFromProgression` / `stackedBab` | Paladin 2 + Rogue 3 is BAB **+4** |
| Goldens | Fighter / Wizard ids | Unchanged; still resolve |

**Verdict:** Level-5 published numbers match: Rogue BAB +3, Monk all good saves +4, Barbarian d12 / full BAB.

**Gaps:** Class features, weapon/armor proficiencies, spell lists, prestige and APG classes.

**Pack slice:** nine class ids with HD/BAB/saves.

**Tests:** Table of nine tags against CRB HD/BAB/save/skill-point columns; unknown `class.alchemist` is null; goldens still resolve Fighter/Wizard.

### 4.20 Remaining class skills and skill points

**CRB (player-facing):** Skill ranks per level are on the class table (Rogue **8**, Bard/Ranger **6**, Barbarian/Druid/Monk **4**, Cleric/Paladin/Sorcerer **2**, plus Int, min 1). Class-skill lists come from the skill summary table. Craft / Perform / Profession stay wildcards.

**App today / this batch:** The new rows fill `skillPointsPerLevel` and `classSkills` on the **same** catalog type as batch 9. `stampClassSkills` and `skillRanksBudget` are unchanged. Seeded keys are sorted to `STANDARD_SKILLS` order on load.

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `classSkills` / `skillPointsPerLevel` | Seeded keys only; no Craft/Perform/Profession |
| Apply | existing `stampClassSkills` on class pick | Union of whatever classes are on the sheet |
| Pool | existing `skillRanksBudget` | Rogue 5 Human Int 10 → **45 / 0** until the player types ranks |
| Honesty | empty sheet + Rogue | No feat, feature, or spell rows; Combat AC stays 10 |

**Verdict:** Picking Rogue reuses the Fighter stamp path. Multiclass Fighter+Rogue unions Climb with Disable Device.

**Gaps:** Auto-spend of the pool; wildcard Craft/Perform/Profession rows; class features.

**Pack slice:** class-skill lists and skill-point table for the nine classes.

**Tests:** Every catalog class-skill key is a seeded skill; Rogue stamp; Fighter+Rogue union; Rogue pool without auto-spend; Paladin 2 / Rogue 3 stacked saves.

---

## Batch 12 — two mechanics

### 4.21 Feat catalog ids on the three goldens

**CRB (player-facing):** Feats are chosen by name (Power Attack, Weapon Focus, Scribe Scroll, …). A specialization (Weapon Focus: longsword) is part of the choice, not a second feat.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `content/pf1e/crb/feats.json` | Golden ids only |
| Lookup | `lookupCrbFeat` | Unknown or empty id → `null` (custom). Never throws |
| Apply | `applyCrbFeat` | Stamps feat id, catalog name, category, and source. Does **not** rewrite level, summary, or Combat |
| UI | Feats tab select | Catalog or Custom, plus a typed name (Weapon Focus (longsword) stays typed on the goldens) |
| Goldens | Fighter 5 / Wizard 5 / F2/W3 | Already stored those ids; Load does not re-apply |

**Verdict:** The golden feat ids resolve. Class features (Armor Training, Arcane Bond) stay on `features[]`, not this catalog.

**Gaps:** Remaining CRB feats; Weapon Focus / Spell Focus school-or-weapon as a structured field.

**Pack slice:** five feat ids.

**Tests:** Catalog lists golden ids; unknown id is null; goldens resolve.

### 4.22 Feat combat math stays typed

**CRB (player-facing):** Power Attack changes the attack/damage numbers the player uses. Improved Initiative adds +4 to initiative. The sheet does not roll or apply those for the player in 0.9.

**App today / this batch:** Applying a catalog feat leaves `combat`, `attacks`, and `initiativeMisc` unchanged. Summaries stay player text. `effects[]` stay ignored.

**Gaps:** Auto-applying Power Attack / Weapon Focus / Improved Initiative.

**Pack slice:** none beyond the feat rows.

**Tests:** Empty sheet melee/initiative stay 0 after Power Attack; Wizard 5 Improved Initiative still has `initiativeMisc` 0 and Dex-only initiative +2.

---

## Batch 13 — two mechanics

### 4.23 Spell catalog ids on the goldens

**CRB (player-facing):** Spells are chosen by name (Detect Magic, Light, Magic Missile, Fireball). The player writes them on the prepared list; the catalog does not fill a spellbook.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `content/pf1e/crb/spells.json` | Golden ids only |
| Lookup | `lookupCrbSpell` | Unknown or empty id → `null` (custom). Never throws |
| Apply | `applyCrbSpell` | Stamps spell id, catalog name, source, and `spellLevel`. Does **not** rewrite prepared, summary, uses, slots, or DCs |
| UI | Spells tab select | Catalog or Custom, plus a typed name |
| Goldens | Wizard 5 / F2/W3 | Already stored those ids; Fighter 5 has no spells. Load does not re-apply |

**Verdict:** The golden spell ids resolve. Three goldens can be rebuilt from race / class / item / feat / spell ids.

**Gaps:** Remaining CRB spells; spell descriptions (OGL first); auto-prepared spellbook.

**Pack slice:** four spell ids.

**Tests:** Catalog lists golden ids; unknown id (`spell.mage-armor`) is null; goldens resolve.

### 4.24 Spell slots, DCs, and prepared stay typed

**CRB (player-facing):** A Wizard prepares spells into slots. DC is 10 + spell level + ability. Bonus slots come from a high ability score. The sheet does not fill those from a catalog pick in 0.9.

**App today / this batch:** Applying a catalog spell leaves `slots`, `prepared`, and summaries unchanged. `compute()` still derives DC and bonus slots from the spellcasting ability. Batch 7 reviews that engine math.

**Gaps:** Auto-filling slots from class level; adding bonus slots into max; remaining CRB spell text.

**Pack slice:** none beyond the spell rows.

**Tests:** Empty Wizard-shaped entry still has slots 0 and Fireball DC 13 after apply (INT 10); Wizard 5 still has typed 3rd-level slots 2/1 and Fireball DC 17.

---

## Batch 14 — two mechanics

### 4.27 Remaining CRB player races

**CRB (player-facing):** The Core Rulebook player races are Dwarf, Elf, Gnome, Half-Elf, Half-Orc, Halfling, and Human. Ability adjustments and languages are chosen at creation; this batch does not write those scores.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `content/pf1e/crb/races.json` | Seven rows: id, name, size, source CRB |
| Lookup | `lookupCrbRace` | Unknown or empty id → `null` (custom). Never throws |
| Apply | `applyCrbRace` | Stamps race id, name, source, and catalog size. Does **not** rewrite languages, speeds, or ability scores |
| UI | Identity Race select | Lists `CRB_RACES` or Custom, plus a typed name |
| Goldens | PF1e Fighter/Wizard/multiclass | Stay `race.human`. Synthesist stays custom Half-Elf (`id` null) |

**Verdict:** Catalog names are generic race labels. Custom races stay a free name with `id` cleared. Half-Elf catalog id does **not** grant Human extra skill ranks.

**Gaps:** Racial ability adjustments, languages, speeds, weapon familiarity, extra feat. Do not auto-apply racial +2.

**Pack slice:** six remaining CRB player races (Human already existed).

**Tests:** Catalog lists seven ids; unknown id (`race.tiefling`) is null; Synthesist golden stays custom.

### 4.28 Race size stamp

**CRB (player-facing):** Gnome and Halfling are **Small**. The other CRB player races are **Medium**. Size already feeds AC/attack, CMB/CMD, and carry (batch 5).

**App today / this batch:** `applyCrbRace` writes `identity.size` from the catalog row. The player can still change size afterward. Ability scores stay typed. Goldens stay Medium.

**Gaps:** Size skill modifiers (Stealth/Fly) stay player-typed.

**Pack slice:** optional `size` on each race row (Human included).

**Tests:** Gnome/Halfling apply stamps `small`; Human apply stamps `medium` without changing scores; goldens remain Medium.

---

## Batch 16 — two mechanics

### 4.31 Remaining simple melee

**CRB (player-facing):** The simple melee table lists unarmed, light, one-handed, and two-handed weapons with **Medium damage dice, crit, type, range (if thrown), and weight**. The player copies those onto an attack row. Reach / brace / trip tags are special properties, not Combat auto-math.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `content/pf1e/crb/items.json` | Remaining simple melee ids from [§7.2](#72-weapons--batches-1619). Dagger and quarterstaff already existed |
| Apply | `applyCrbItem` | Stamps name, pounds, and `weapon` subobject. Does **not** rewrite `armorClass` or `attacks` |
| Goldens | Fighter 5 dagger; Wizard 5 quarterstaff | Unchanged. Quarterstaff stays a **single 1d6** |

**Verdict:** Medium table numbers resolve. Unarmed strike is not a catalog item. Gauntlet is packed.

**Gaps:** Small-size damage dice; reach/brace/trip tags; auto-filling attack rows.

**Pack slice:** eleven remaining simple melee weapons.

**Tests:** Table of Medium numbers; unarmed strike id is null; apply spear leaves AC 10.

### 4.32 Simple ranged weapons and ammo

**CRB (player-facing):** Simple ranged weapons list damage, crit, range increment, and weight. Ammunition is sold in listed bundles (10 darts / bolts / bullets) with a bundle weight.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `items.json` | Blowgun, heavy/light crossbow, dart, javelin, sling. Ammo rows are `kind: item` with the published **bundle** weight |
| Apply | existing | Weapons stamp `weapon`. Ammo stamps pounds only |
| Combat | `attacks` | Unchanged |

**Verdict:** Sling weight is **0** (table dash). Dart is ½ lb. Ammo quantity is packs of 10; pounds are the bundle line, not per shot.

**Gaps:** Loading actions; composite/repeating crossbows (exotic, batch 19); arrows (martial, batch 18).

**Pack slice:** six simple ranged weapons and three ammo ids.

**Tests:** Published range and dice; ammo has no weapon subobject; later gear (`item.bedroll`) stays null.

---

## Batch 17 — two mechanics

### 4.33 Martial light weapons

**CRB (player-facing):** Martial light melee weapons list Medium damage, crit, type, thrown range if any, and weight. Shield bash, spiked armor, and spiked shields sit on the same table; they wait with armor (batch 21).

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `items.json` | Eight martial light ids from [§7.2](#72-weapons--batches-1619) |
| Apply | `applyCrbItem` | Stamps name, pounds, and `weapon`. Does **not** rewrite Combat |
| Skip | shield-bash / spikes | Not packed as `weapon.*` ids |

**Verdict:** Medium table numbers resolve, including kukri 18–20 and light pick ×4. Sap is documentary 1d6 bludgeoning; nonlethal is not a catalog field.

**Gaps:** Nonlethal sap tag; Small-size dice; auto-filling attack rows.

**Pack slice:** eight martial light weapons.

**Tests:** Table of Medium numbers; `weapon.light-shield` is null.

### 4.34 Remaining martial one-handed

**CRB (player-facing):** Martial one-handed weapons use the same columns. Longsword already exists from the goldens. Heavy shield bash waits with shields.

**App today / this batch:** seven remaining ids. Packed longsword is unchanged.

**Verdict:** Rapier and scimitar stamp crit 18. Trident has a 10 ft range increment. Flail trip/disarm is not a catalog field.

**Gaps:** Flail trip/disarm tags; two-handed martial (batch 18).

**Pack slice:** seven remaining martial one-handed weapons.

**Tests:** Table numbers; longsword still 1d8/19–20; apply rapier leaves AC 10.

---

## Batch 18 — two mechanics

### 4.35 Martial two-handed

**CRB (player-facing):** Martial two-handed melee weapons list Medium damage, crit, type, and weight. Reach / trip / brace wait for the property queue after all weapon ids.

**App today / this batch:** eleven ids. Documentary stamp only. Combat stays typed.

**Verdict:** Falchion is 2d4 / 18–20. Greatsword is 2d6 / 19–20. Halberd and scythe store “piercing or slashing.” Reach is not tagged yet.

**Gaps:** Special tags ([§7.6](#76-weapon-properties-after-all-weapon-ids)); Small-size dice; auto-filling attack rows.

**Pack slice:** eleven martial two-handed weapons.

**Tests:** Table of Medium numbers; apply greatsword leaves AC 10.

### 4.36 Martial ranged and arrows

**CRB (player-facing):** Longbow and shortbow (and their composites) list damage, crit, range increment, and weight. Arrows are sold as a 20-count bundle (3 lb). Composite Strength rating is a player choice, not extra catalog ids.

**App today / this batch:** four bow ids plus `item.arrows` (bundle weight 3 lb).

**Verdict:** Composite longbow range 110 ft and composite shortbow 70 ft on one row each. No `str-2` ids.

**Gaps:** Strength rating for composites; loading; exotic bows (batch 19).

**Pack slice:** four martial ranged weapons and arrows.

**Tests:** Published range and dice; arrows have no weapon subobject; later gear (`item.bedroll`) stays null.

---

## Batch 19 — two mechanics

### 4.37 Exotic melee

**CRB (player-facing):** Exotic light, one-handed, and two-handed melee weapons list Medium damage, crit, type, and weight. Double weapons list two heads; this batch stamps the **primary** head only. Monk / trip / disarm / reach / double wait for the property queue.

**App today / this batch:** thirteen ids. Documentary stamp only. Combat stays typed.

**Verdict:** Whip is 1d3 slashing. Bastard sword is 1d10 / 19–20. Double weapons store one dice string (orc double axe 1d8 ×3; gnome hooked hammer 1d8 B ×3; dwarven urgrosh 1d8 S ×3). Spiked chain is not in this locked list.

**Gaps:** Special tags ([§7.6](#76-weapon-properties-after-all-weapon-ids)); second documentary head (W7); Small-size dice; auto-filling attack rows.

**Pack slice:** thirteen exotic melee weapons.

**Tests:** Table of Medium numbers; primary head only on doubles; apply kama leaves AC 10.

### 4.38 Exotic ranged and repeating bolts

**CRB (player-facing):** Exotic ranged weapons list damage, crit, range increment, and weight. Repeating bolts are sold as a 5-count bundle (1 lb). A net has no damage dice — range 10 ft, 6 lb.

**App today / this batch:** seven ranged ids plus `item.repeating-crossbow-bolts`. Net stores `rangeFeet` only.

**Verdict:** Shuriken is 0.5 lb. Repeating heavy crossbow is 1d10 / 19–20 / 120 ft / 12 lb. Net has no damageDice.

**Gaps:** Net “see text”; repeating reload; Special tags.

**Pack slice:** seven exotic ranged weapons and repeating bolts.

**Tests:** Published range and dice; repeating bolts have no weapon subobject; `item.bedroll` stays null.

---

## W1 — two mechanics

### 4.39 Reach tag

**CRB (player-facing):** Reach is a Special quality on longspear, glaive, guisarme, lance, ranseur, and whip. It is a label on the weapon, not a change to the damage dice.

**App today / this batch:** those six catalog rows append `reach` to `weapon.properties`. Combat threatened area stays typed.

**Verdict:** At landing, each of these six had **one** tag (`["reach"]`). W2 later appends `brace` on the longspear so that row is N = 2. W3 later appends `trip` on the guisarme and whip. W4 later appends `disarm` on the ranseur and whip. Glaive / lance stay reach-only until their later types.

**Gaps:** Threatened area; disarm / monk / nonlethal / double.

**Pack slice:** `properties: ["reach"]` on the six reach weapons.

**Tests:** Those six include `reach`; glaive is still N = 1; apply longspear leaves AC 10.

### 4.40 Properties list of N tags

**CRB (player-facing):** Some weapons have one Special (glaive: reach; kama: trip). Some have two or more (guisarme: reach + trip; whip later: four tags). Magic properties later join the same list.

**App today / this batch:** optional `weapon.properties` is an array of kebab-case strings. Omit when empty. Inventory shows every tag and can add/remove. Not a single-select.

**Verdict:** N is 0 (omit), 1, or many. The UI that lands with W1 must work for a longspear with only reach and still accept a second tag on that same control.

**Gaps:** Closed suggestion list of CRB tags; magic catalog rows.

**Pack slice:** schema + Inventory list control. No extra weapon ids.

**Tests:** Normalize 0 / 1 / many; Inventory can stamp a one-tag row, add a second tag, and drop back to one.

---

## W2 — two mechanics

### 4.41 Brace tag

**CRB (player-facing):** Brace is a Special quality on longspear, spear, trident, halberd, and dwarven urgrosh.

**App today / this batch:** append `brace` on those five rows. Do not replace tags already present.

**Verdict:** Longspear is `["reach", "brace"]` (N = 2). Spear, trident, and urgrosh stay `["brace"]` (N = 1). W3 later appends `trip` on the halberd so that row is N = 2. Both lengths are valid.

**Gaps:** Brace vs charge math in Combat; remaining Specials.

**Pack slice:** append `brace` on the five brace weapons.

**Tests:** Longspear keeps reach; brace-only rows are length 1; glaive still reach-only; apply spear leaves AC 10.

### 4.42 Append without replacing

**CRB (player-facing):** A weapon can have more than one Special. Adding brace does not remove reach.

**App today / this batch:** W2 only appends. Inventory already lists N tags.

**Verdict:** The same control shows one chip on a spear and two chips on a longspear.

**Gaps:** none for this mechanic.

**Pack slice:** none beyond 4.41.

**Tests:** Inventory spear is brace-only; longspear shows reach and brace.

---

## W3 — two mechanics

### 4.43 Trip tag

**CRB (player-facing):** Trip is a Special quality on sickle, flail, heavy flail, guisarme, halberd, scythe, kama, whip, gnome hooked hammer, dire flail, and bolas.

**App today / this batch:** append `trip` on those eleven rows. Do not replace tags already present.

**Verdict:** Sickle, scythe, gnome hooked hammer, and bolas stay `["trip"]` (N = 1). Guisarme is `["reach", "trip"]`. Halberd is `["brace", "trip"]`. W4 later appends `disarm` on the flail, heavy flail, dire flail, and whip. W5 later appends `monk` on the kama. One tag and two tags are both valid.

**Gaps:** Trip CMB math in Combat; remaining Specials (monk, nonlethal, double).

**Pack slice:** append `trip` on the eleven trip weapons.

**Tests:** Those eleven include `trip`; trip-only rows are length 1; guisarme keeps reach; halberd keeps brace; whip keeps reach; apply kama leaves AC 10.

### 4.44 Append without replacing

**CRB (player-facing):** A weapon can have more than one Special. Adding trip does not remove reach or brace.

**App today / this batch:** W3 only appends. Inventory already lists N tags.

**Verdict:** The same control shows one chip on a kama and two chips on a guisarme.

**Gaps:** none for this mechanic.

**Pack slice:** none beyond 4.43.

**Tests:** Inventory kama is trip-only; guisarme shows reach and trip.

---

## W4 — two mechanics

### 4.45 Disarm tag

**CRB (player-facing):** Disarm is a Special quality on flail, heavy flail, ranseur, nunchaku, sai, whip, and dire flail.

**App today / this batch:** append `disarm` on those seven rows. Do not replace tags already present.

**Verdict:** Nunchaku and sai are `["disarm"]` (N = 1) at landing. Flail, heavy flail, and dire flail are `["trip", "disarm"]`. Ranseur is `["reach", "disarm"]`. Whip is `["reach", "trip", "disarm"]` (N = 3). W5 later appends `monk` on nunchaku and sai so those rows are N = 2. One, two, and three tags are all valid.

**Gaps:** Disarm CMB math in Combat; remaining Specials none (W7 landed double).

**Pack slice:** append `disarm` on the seven disarm weapons.

**Tests:** Those seven include `disarm`; disarm-only rows are length 1; flails keep trip; ranseur keeps reach; whip keeps reach and trip; apply nunchaku leaves AC 10.

### 4.46 Append without replacing

**CRB (player-facing):** A weapon can have more than one Special. Adding disarm does not remove reach or trip.

**App today / this batch:** W4 only appends. Inventory already lists N tags.

**Verdict:** The same control shows one chip on a nunchaku and three chips on a whip.

**Gaps:** none for this mechanic.

**Pack slice:** none beyond 4.45.

**Tests:** Inventory nunchaku is disarm-only; whip shows reach, trip, and disarm.

---

## W5 — two mechanics

### 4.47 Monk tag

**CRB (player-facing):** Monk is a Special quality on quarterstaff, kama, nunchaku, sai, siangham, and shuriken.

**App today / this batch:** append `monk` on those six rows. Do not replace tags already present.

**Verdict:** Quarterstaff, siangham, and shuriken are `["monk"]` (N = 1). Kama is `["trip", "monk"]`. Nunchaku and sai are `["disarm", "monk"]`. One tag and two tags are both valid.

**Gaps:** Monk flurry / weapon list in Combat; remaining Specials none (W7 landed double).

**Pack slice:** append `monk` on the six monk weapons.

**Tests:** Those six include `monk`; monk-only rows are length 1; kama keeps trip; nunchaku/sai keep disarm; apply siangham leaves AC 10.

### 4.48 Append without replacing

**CRB (player-facing):** A weapon can have more than one Special. Adding monk does not remove trip or disarm.

**App today / this batch:** W5 only appends. Inventory already lists N tags.

**Verdict:** The same control shows one chip on a siangham and two chips on a kama.

**Gaps:** none for this mechanic.

**Pack slice:** none beyond 4.47.

**Tests:** Inventory siangham is monk-only; kama shows trip and monk.

---

## W6 — two mechanics

### 4.49 Nonlethal tag

**CRB (player-facing):** Nonlethal is a Special quality on sap, whip, and bolas.

**App today / this batch:** append `nonlethal` on those three rows. Do not replace tags already present.

**Verdict:** Sap is `["nonlethal"]` (N = 1). Bolas is `["trip", "nonlethal"]`. Whip is `["reach", "trip", "disarm", "nonlethal"]` (N = 4). One tag and many tags are both valid.

**Gaps:** Nonlethal damage math in Combat; remaining Special none (W7 landed double).

**Pack slice:** append `nonlethal` on the three nonlethal weapons.

**Tests:** Those three include `nonlethal`; sap is length 1; bolas keeps trip; whip keeps reach, trip, and disarm; apply sap leaves AC 10.

### 4.50 Append without replacing

**CRB (player-facing):** A weapon can have more than one Special. Adding nonlethal does not remove reach, trip, or disarm.

**App today / this batch:** W6 only appends. Inventory already lists N tags.

**Verdict:** The same control shows one chip on a sap and four chips on a whip.

**Gaps:** none for this mechanic.

**Pack slice:** none beyond 4.49.

**Tests:** Inventory sap is nonlethal-only; whip shows reach, trip, disarm, and nonlethal.

---

## W7 — two mechanics

### 4.51 Double tag

**CRB (player-facing):** Double is a Special quality on quarterstaff, orc double axe, dire flail, gnome hooked hammer, two-bladed sword, and dwarven urgrosh.

**App today / this batch:** append `double` on those six rows. Do not replace tags already present.

**Verdict:** Orc double axe and two-bladed sword are `["double"]` (N = 1). Quarterstaff is `["monk", "double"]`. Dire flail is `["trip", "disarm", "double"]`. Gnome hooked hammer is `["trip", "double"]`. Dwarven urgrosh is `["brace", "double"]`.

**Gaps:** Two-weapon / double-weapon **attack rows** stay typed; this tag does not write Combat.

**Pack slice:** append `double` on the six double weapons.

**Tests:** Those six include `double`; double-only rows are length 1; quarterstaff keeps monk; dire flail keeps trip and disarm; apply two-bladed sword leaves AC 10.

### 4.52 Second documentary head

**CRB (player-facing):** A double weapon lists two Medium damage heads. The gnome hooked hammer is 1d8 B ×3 / 1d6 P ×4. The dwarven urgrosh is 1d8 S ×3 / 1d6 P ×3. Matching heads (quarterstaff, orc double axe, dire flail, two-bladed sword) repeat the primary dice on the second head.

**App today / this batch:** optional `weapon.secondHead` stores that off-hand documentary head. Primary `damageDice` stays a **single** string (no slash). Apply stamps `secondHead` onto the inventory weapon subobject. Attack rows stay typed.

**Verdict:** Primary head is unchanged from batches 16–19. Second head is Medium table numbers. A longsword has no `secondHead`.

**Gaps:** Inventory does not edit dice fields (primary or second); two-weapon attack rows wait.

**Pack slice:** `secondHead` on the six double weapons. Character and catalog schemas allow the nested object.

**Tests:** Those six have `secondHead` matching the CRB Medium off-hand; primary `damageDice` has no `/`; longsword has no `secondHead`.

---

## Batch 20 — two mechanics

### 4.53 Remaining light armor

**CRB (player-facing):** Light armor lists Medium armor bonus, max Dex, armor check penalty, arcane spell failure, and weight. Padded, leather, and studded leather sit above the packed chain shirt.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `items.json` | Remaining light ids from [§7.3](#73-armor-and-shields--batches-2021). Packed chain shirt stays |
| Apply | `applyCrbItem` | Stamps name, pounds, and `armor` (`acBonus`, `maxDex`, `armorCheckPenalty`, `spellFailurePercent`). Does **not** rewrite `armorClass` |

**Verdict:** Medium table numbers resolve. Padded and leather stamp ACP 0. Studded leather is −1 / 15%.

**Gaps:** Speed reduction; Armor Training raising max Dex; auto-writing Combat AC.

**Pack slice:** three remaining light armor ids.

**Tests:** Table of Medium numbers; packed chain shirt unchanged; apply breastplate leaves AC 10.

### 4.54 Remaining medium armor

**CRB (player-facing):** Medium armor uses the same columns. Hide, scale mail, and breastplate sit around the packed chainmail.

**App today / this batch:** three remaining ids. Packed chainmail is unchanged.

**Verdict:** Hide is +4 / max Dex 4 / −3 / 20% / 25 lb. Scale mail is +5 / 3 / −4 / 25% / 30 lb. Breastplate is +6 / 3 / −4 / 25% / 30 lb (same bonus as chainmail, better max Dex).

**Gaps:** Heavy armor and shields wait for batch 21. Combat still stays typed.

**Pack slice:** hide, scale mail, breastplate.

**Tests:** Table of Medium numbers; packed chainmail unchanged; `item.bedroll` stays null.

---

## Batch 21 — two mechanics

### 4.55 Heavy armor

**CRB (player-facing):** Heavy armor lists Medium armor bonus, max Dex, armor check penalty, arcane spell failure, and weight. Splint mail and half-plate cap Dex at 0. Full plate is +9 / max Dex 1 / −6 / 35% / 50 lb.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `items.json` | Four heavy ids from [§7.3](#73-armor-and-shields--batches-2021) |
| Apply | `applyCrbItem` | Stamps name, pounds, and `armor`. Does **not** rewrite `armorClass` |

**Verdict:** Medium table numbers resolve. Splint mail and banded mail share +7 with different max Dex / ACP / weight.

**Gaps:** Speed reduction; Armor Training; auto-writing Combat AC.

**Pack slice:** splint mail, banded mail, half-plate, full plate.

**Tests:** Table of Medium numbers; packed chainmail/breastplate unchanged; apply full plate leaves AC 10.

### 4.56 Shields and mundane extras

**CRB (player-facing):** Shields list a shield bonus, ACP, spell failure, and weight. Most have no Dex cap (table dash). The tower shield is +4 / max Dex 2 / −10 / 50% / 45 lb. Armor spikes, shield spikes, and a locked gauntlet are extras on the same chapter, not weapon-table bash ids.

**App today / this batch:** catalog `kind: "shield"` stamps `ItemEntry.shield` and clears `armor` / `weapon`. `ShieldItemStats` gains `maxDex` and `spellFailurePercent`. Tower stamps max Dex 2. Other shields stamp `maxDex: null`. Extras: armor spikes 10 lb and shield spikes 5 lb as `kind: item`; locked gauntlet is a 5 lb weapon with gauntlet dice (1d3 B). Do not mint `weapon.light-shield`.

**Verdict:** Six shield ids resolve. Switching chainmail to a buckler drops the armor subobject. Combat `shieldBonus` stays typed.

**Gaps:** Shield-bash damage on the shield row; auto-writing Combat AC; Inventory does not edit shield numbers (same as armor).

**Pack slice:** six shields plus three extras.

**Tests:** Table of Medium shield numbers; tower max Dex 2 / 50% ASF; `weapon.light-shield` is null; Save/Load round-trips a tower shield; apply full plate + tower leaves AC 10.

---

## Batch 7 — two mechanics

### 4.25 Spell DC

**CRB (player-facing):** A spell’s saving-throw DC is **10 + the spell’s level + the caster’s ability modifier** (Intelligence for a Wizard). Cantrips are level 0, so DC is 10 + modifier. A Dexterity or Intelligence **penalty** lowers DC the same way a bonus raises it.

Spell Focus and similar feats raise DC for a school. They are a player choice, not this formula.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Engine | `spellDc`, `dcByLevel` in `engine/spellcasting.ts` | `10 + spell level + ability modifier` for levels 0–9 |
| Ability | `abilityModifiers` | `tempScore` is in the score before the modifier; `tempModifier` is a DC addend |
| UI | Spells tab derived DC column | Override per level; muted note that Spell Focus does not change DC |
| Goldens | Wizard 5 INT +4 → 14 / 15 / 17 (0 / 1 / 3); F2/W3 INT +3 → 13 / 14 / 15 | Unchanged |

**Verdict:** The formula matches CRB. Wizard 5 Spell Focus (evocation) does **not** add +1 to Fireball.

**Gaps:** Auto-applying Spell Focus / Greater Spell Focus; school-specific DC; concentration; spell resistance.

**Pack slice:** none (engine-owned). Catalog spell rows from batch 13 do not write DC.

**Tests:** 10 + level + mod including a penalty; Wizard 5 and F2/W3 snapshots; Spell Focus leaves Fireball at 17; `tempModifier` raises DC without changing bonus slots.

### 4.26 Bonus spells from ability

**CRB (player-facing):** A high spellcasting ability grants **bonus spells per day** from the Ability Modifiers and Bonus Spells table. Cantrips (level 0) never receive bonus slots. A score of 10–11 grants none. 12–13 grants +1 1st; 18–19 grants +1 at 1st through 4th; 20–21 grants +2 1st and +1 at 2nd through 5th. Odd and even scores in a pair share a row. You only receive a bonus slot of a level you can already cast.

Those bonus slots are added to the class table’s spells per day. Batch 15 fills **Max** from that sum unless the player types a custom amount.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Engine | `bonusSpellsFromAbility`, `bonusSlotsByLevel` | Table from the ability **score** (`tempScore` included; `tempModifier` is not) |
| Input | `spellcasting[].slots[].max` / `remaining` | Max null = default (batch 15). Remaining stays user-entered. Compute does not rewrite the document |
| UI | Spells tab Bonus slots column (derived) next to Max / Left | Max shows class + bonus; click to customize |
| Goldens | Wizard 5 INT 18 → bonus `[0, 1, 1, 1, 1]`; default max 4/4/3/2 is class 4/3/2/1 plus those bonuses | Unchanged as bonus snapshot; Max now derived in batch 15 |

**Verdict:** The table matches CRB for scores 10–30. Empty INT 18 still shows bonus 1st-level +1 with slot max 0.

**Gaps:** Auto-adding bonus into max waited for batch 15. Specialist/domain extra slots still wait. The bonus **column** still shows the raw ability table even for levels the class cannot cast; those levels stay 0 in default Max.

**Pack slice:** none in this batch.

**Tests:** Published bonus columns for 10–30 (odd scores share the even score below); no bonus cantrips at INT 30; Wizard 5 bonus 1/1/1/1; empty INT 18 leaves default max 0 without a class table; `tempScore` +2 (score 20) grants two bonus 1sts.

---

## Batch 15 — two mechanics

### 4.29 Class spells-per-day tables

**CRB (player-facing):** Each casting class has a **spells per day** table by class level. A dash means the class cannot cast that spell level yet. A **0** means the class can cast that level but the table grants none — bonus spells from ability still apply. Cleric domain slots are written as `+1` on the published table; they are extra slots, not this base table. Sorcerer and Bard have no 0-level slots per day (cantrips at will). Paladin and Ranger begin at 4th level.

**App today / this batch:**

| Piece | Where | Behavior |
| --- | --- | --- |
| Pack | `classes.json` `spellsPerDay` | 20×10 grid on Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Wizard. Non-casters omit the field |
| Lookup | `classSpellsPerDayRow` | Unknown id / no table / level < 1 → null. Never throws |
| Goldens | Wizard 5 and Fighter 2 / Wizard 3 | `slots[].max` null so Max uses the table. Synthesist keeps typed max (no APG table yet) |

**Verdict:** Cleric numbers match Wizard/Druid (no domain +1). Paladin 4 1st-level `0` is stored as 0, not a dash.

**Gaps:** Domain/school extra slots; spells known; APG Summoner table.

**Pack slice:** `spellsPerDay` on the seven CRB casting classes.

**Tests:** Full Wizard 1–20; Cleric/Druid match Wizard; Bard 1/5/16, Sorcerer 1/5, Paladin 3–4, Ranger 4/13 snapshots; Fighter/Summoner have no table.

### 4.30 Hybrid Max (computed default + click-to-override)

**CRB (player-facing):** Daily allotment is class table + bonus spells from ability, only for levels the class can already cast, and only if the ability score is at least 10 + spell level.

**App today / this batch:** Default Max = that sum. Click the Max cell to type a custom amount. Leave the field **empty** to return to the default. `remaining` is still play state. Compute does not rewrite `slots[].max`.

**Gaps:** Remaining does not auto-fill from Max. Specialist/domain extras still typed.

**Pack slice:** none (uses 4.29).

**Tests:** Wizard 5 INT 18 → 4/4/3/2; INT 10 zeros 1st–3rd; Paladin 4 CHA 18 → 1st max 1; Cleric 1 has no domain extra; typed 7 stays 7; empty sheet with no class table stays 0; Spells tab click / type / clear.

---

## 6. Recommended upcoming work

The 0.9 character-basics queue (batches 1–13) is done. Batches 14–15 landed remaining CRB player races and class spells-per-day. Batches 16–19 landed remaining simple, martial, and exotic weapon ids. W1–W7 landed reach, brace, trip, disarm, monk, nonlethal, and double (plus a documentary second head). Batches 20–21 landed remaining armor and shields. Do **not** start the next pair of CRB encyclopedia rows in the same change as a platform increment.

**Status:** First Edition complete. Honesty/code fixes, playtest Wizard 7, remaining CRB feats/spells, APG follow-through (Summoner `spellsPerDay` + 27-spell catalog), catalog picker, magic overlay, and sidebar tools (Attack Helper, Actions List, Budget Calculator) have landed. Next is pre-release / hygiene. Leftover PF2e waits for a later release. Do **not** add Summoner to this CRB folder.

---

## 7. Remaining mundane weapons and armor

Locked fill-out after batch 15. Same rules as batch 10: documentary stamp of id, name, pounds, and weapon/armor (or later shield) stats. Combat numbers stay on `armorClass` / `attacks`. Unknown id → custom. Mechanics-only names and numbers. Two mechanics per PR.

**Already packed (do not duplicate):** Batch 10 goldens plus Batches 16–19 remaining simple, martial, and exotic weapons and their ammo. W1–W7 Special tags (and W7 `secondHead`) are on the matching weapons. Batches 20–21 remaining armor, shields, and mundane extras. Skip those ids in later batches. Honesty fixes, remaining feats/spells, and the magic overlay have landed.

### 7.1 Shared locks (every 16–21 PR)

| Lock | Rule |
| --- | --- |
| Scope | Core Rulebook Chapter 6 tables only. No APG / Ultimate Combat / Adventurer’s Armory rows |
| Combat | Apply does **not** rewrite `armorClass` or `attacks` |
| Quarterstaff | Stays a **single 1d6** row. Do not split it into a double-weapon pair here |
| Double weapons (exotic 2H) | One catalog row; stamp the **primary** head only. Second head / two-weapon attack rows wait |
| Composite bows | One row each (`weapon.composite-longbow`, `weapon.composite-shortbow`). Strength rating stays typed / notes — no `str-2` ids |
| Unarmed strike | **Not** an inventory catalog item. Pack `weapon.gauntlet` only |
| Shield bash / spiked armor | **Not** weapon-table ids in 16–19. They wait with shields / extras in batch 21 |
| Ammo | Pack with the ranged mechanic that uses it (`item.*`, `kind: item`) |
| Masterwork | Same overlay pattern as magic. **No** separate masterwork catalog rows |
| Magic | **Do not pack** in 16–21. See [§7.5](#75-reserved-magic-weapons-and-armor) |
| Special properties | **Do not pack** in 16–19. After all weapon ids, one CRB Special type per PR. See [§7.6](#76-weapon-properties-after-all-weapon-ids) |
| Cost | Optional `costGp` may land with a later priced-treasure slice. Not required to add a weapon/armor row |
| Tests | New ids resolve; goldens still resolve; apply still leaves AC 10 on an empty sheet |

Id pattern stays `weapon.<kebab>`, `armor.<kebab>`, `item.<kebab>`, `shield.<kebab>`.

### 7.2 Weapons — batches 16–19

67 remaining weapon ids (packed 3; skip unarmed strike and the five armor/shield-as-weapon table lines).

#### Batch 16 — simple melee remainder + simple ranged

**Landed.** Remaining simple melee (11) and simple ranged + ammo (6 + 3). Packed dagger/quarterstaff unchanged. Unarmed strike not packed.

| Id | Name | Group |
| --- | --- | --- |
| `weapon.gauntlet` | Gauntlet | Unarmed |
| `weapon.punching-dagger` | Punching dagger | Light |
| `weapon.spiked-gauntlet` | Spiked gauntlet | Light |
| `weapon.light-mace` | Light mace | Light |
| `weapon.sickle` | Sickle | Light |
| `weapon.club` | Club | One-handed |
| `weapon.heavy-mace` | Heavy mace | One-handed |
| `weapon.morningstar` | Morningstar | One-handed |
| `weapon.shortspear` | Shortspear | One-handed |
| `weapon.longspear` | Longspear | Two-handed |
| `weapon.spear` | Spear | Two-handed |

**Mechanic B — simple ranged + simple ammo** (6 weapons + 3 ammo).

| Id | Name |
| --- | --- |
| `weapon.blowgun` | Blowgun |
| `weapon.heavy-crossbow` | Heavy crossbow |
| `weapon.light-crossbow` | Light crossbow |
| `weapon.dart` | Dart |
| `weapon.javelin` | Javelin |
| `weapon.sling` | Sling |
| `item.blowgun-darts` | Blowgun darts |
| `item.crossbow-bolts` | Crossbow bolts |
| `item.sling-bullets` | Sling bullets |

Hand crossbow and repeating crossbows also use bolts; they wait for batch 19 and reuse `item.crossbow-bolts` / `item.repeating-crossbow-bolts`.

#### Batch 17 — martial light + remaining martial one-handed

**Landed.** Eight martial light weapons and seven remaining martial one-handed. Packed longsword unchanged. Shield-bash / spiked-armor lines wait for batch 21.

| Id | Name |
| --- | --- |
| `weapon.throwing-axe` | Throwing axe |
| `weapon.light-hammer` | Light hammer |
| `weapon.handaxe` | Handaxe |
| `weapon.kukri` | Kukri |
| `weapon.light-pick` | Light pick |
| `weapon.sap` | Sap |
| `weapon.starknife` | Starknife |
| `weapon.short-sword` | Short sword |

**Mechanic B — remaining martial one-handed** (7). Packed longsword stays. Skip heavy-shield bash and heavy spiked shield.

| Id | Name |
| --- | --- |
| `weapon.battleaxe` | Battleaxe |
| `weapon.flail` | Flail |
| `weapon.heavy-pick` | Heavy pick |
| `weapon.rapier` | Rapier |
| `weapon.scimitar` | Scimitar |
| `weapon.trident` | Trident |
| `weapon.warhammer` | Warhammer |

#### Batch 18 — martial two-handed + martial ranged

**Landed.** Eleven martial two-handed weapons, four bows, and arrows (3 lb bundle). Composite Strength rating stays typed. No Special tags.

| Id | Name |
| --- | --- |
| `weapon.falchion` | Falchion |
| `weapon.glaive` | Glaive |
| `weapon.greataxe` | Greataxe |
| `weapon.greatclub` | Greatclub |
| `weapon.heavy-flail` | Heavy flail |
| `weapon.greatsword` | Greatsword |
| `weapon.guisarme` | Guisarme |
| `weapon.halberd` | Halberd |
| `weapon.lance` | Lance |
| `weapon.ranseur` | Ranseur |
| `weapon.scythe` | Scythe |

**Mechanic B — martial ranged + arrows** (4 weapons + 1 ammo).

| Id | Name |
| --- | --- |
| `weapon.longbow` | Longbow |
| `weapon.composite-longbow` | Composite longbow |
| `weapon.shortbow` | Shortbow |
| `weapon.composite-shortbow` | Composite shortbow |
| `item.arrows` | Arrows |

#### Batch 19 — exotic melee + exotic ranged

**Landed.** Thirteen exotic melee weapons, seven exotic ranged, and repeating bolts (1 lb bundle). Double weapons stamp the primary head only. No Special tags. Net is range and weight only.

**Mechanic A — exotic melee** (13). Light + one-handed + two-handed in one mechanic so the exotic table stays one PR pair.

| Id | Name | Group |
| --- | --- | --- |
| `weapon.kama` | Kama | Light |
| `weapon.nunchaku` | Nunchaku | Light |
| `weapon.sai` | Sai | Light |
| `weapon.siangham` | Siangham | Light |
| `weapon.bastard-sword` | Bastard sword | One-handed |
| `weapon.dwarven-waraxe` | Dwarven waraxe | One-handed |
| `weapon.whip` | Whip | One-handed |
| `weapon.orc-double-axe` | Orc double axe | Two-handed |
| `weapon.elven-curve-blade` | Elven curve blade | Two-handed |
| `weapon.dire-flail` | Dire flail | Two-handed |
| `weapon.gnome-hooked-hammer` | Gnome hooked hammer | Two-handed |
| `weapon.two-bladed-sword` | Two-bladed sword | Two-handed |
| `weapon.dwarven-urgrosh` | Dwarven urgrosh | Two-handed |

**Mechanic B — exotic ranged + repeating bolts** (7 weapons + 1 ammo).

| Id | Name |
| --- | --- |
| `weapon.bolas` | Bolas |
| `weapon.hand-crossbow` | Hand crossbow |
| `weapon.repeating-heavy-crossbow` | Repeating heavy crossbow |
| `weapon.repeating-light-crossbow` | Repeating light crossbow |
| `weapon.net` | Net |
| `weapon.shuriken` | Shuriken |
| `weapon.halfling-sling-staff` | Halfling sling staff |
| `item.repeating-crossbow-bolts` | Repeating crossbow bolts |

### 7.3 Armor and shields — batches 20–21

Mundane armor and shields from the CRB table are packed (batches 20–21). Extras (armor spikes, shield spikes, locked gauntlet) landed with batch 21.

#### Batch 20 — remaining light armor + remaining medium armor

**Landed.** Remaining light armor (3) and remaining medium armor (3). Packed chain shirt and chainmail unchanged.

**Mechanic A — remaining light armor** (3). Packed chain shirt stays.

| Id | Name |
| --- | --- |
| `armor.padded` | Padded |
| `armor.leather` | Leather |
| `armor.studded-leather` | Studded leather |

**Mechanic B — remaining medium armor** (3). Packed chainmail stays.

| Id | Name |
| --- | --- |
| `armor.hide` | Hide |
| `armor.scale-mail` | Scale mail |
| `armor.breastplate` | Breastplate |

Stamp the same `armor` subobject as chainmail (`acBonus`, `maxDex`, `armorCheckPenalty`, `spellFailurePercent`). Still do not write Combat.

#### Batch 21 — heavy armor + shields

**Landed.** Four heavy armor ids, six shields (`kind: shield`), and three mundane extras.

**Mechanic A — heavy armor** (4).

| Id | Name |
| --- | --- |
| `armor.splint-mail` | Splint mail |
| `armor.banded-mail` | Banded mail |
| `armor.half-plate` | Half-plate |
| `armor.full-plate` | Full plate |

**Mechanic B — shields** (6) plus mundane extras.

| Id | Name |
| --- | --- |
| `shield.buckler` | Buckler |
| `shield.light-wooden` | Light wooden shield |
| `shield.light-steel` | Light steel shield |
| `shield.heavy-wooden` | Heavy wooden shield |
| `shield.heavy-steel` | Heavy steel shield |
| `shield.tower` | Tower shield |

This is the PR that may add `kind: "shield"` to the item catalog schema and stamp `ItemEntry.shield` (and clear `armor` / `weapon`). Tower shield needs `maxDex` and spell failure on the shield stats — extend `ShieldItemStats` here if those fields are still missing. Do not auto-write `armorClass.shieldBonus`.

Mundane extras in the same mechanic (still not magic; not counted in the 67 remaining weapon-table ids):

| Id | Name |
| --- | --- |
| `item.armor-spikes` | Armor spikes |
| `item.shield-spikes` | Shield spikes |
| `weapon.locked-gauntlet` | Locked gauntlet |

Shield-bash damage may live as an optional `weapon` subobject on the shield row later; do not mint `weapon.light-shield` ids.

### 7.4 Packed vs remaining counts

| Kind | Packed now | Remaining in 16–21 | Skip / later |
| --- | --- | --- | --- |
| Weapons | 71 (3 goldens + 17 simple + 15 martial light/1H + 11 two-handed + 4 bows + 20 exotic + locked gauntlet extra) | 0 | Unarmed strike; shield-bash lines; spiked chain was not in the locked 13; W1–W7 Special tags are in; W7 stamps a documentary second head |
| Armor | 12 (2 goldens + 3 light + 3 medium + 4 heavy) | 0 | Magic armor |
| Shields | 6 | 0 | Magic shields |
| Ammo / extras | spellbook + 5 ammo + armor spikes + shield spikes | 0 | Priced treasure as a later slice |
| Magic weapons / armor | overlay landed | 0 | Sheet overlay + named items; see [§7.5](#75-reserved-magic-weapons-and-armor) |

### 7.5 Magic weapons and armor

**Landed** as a sheet overlay after batches 16–21 (no plus-N catalog rows). Mundane ids stayed stable.

| Decision | Lock |
| --- | --- |
| Mundane id is stable | A +1 longsword is still `weapon.longsword`. Never add `weapon.longsword-plus-1` or `armor.full-plate-plus-2` |
| Enhancement is a sheet overlay | Later: optional enhancement bonus on the **inventory row** (`ItemEntry` / weapon-armor-shield stats), not a second catalog copy of every table weapon. Magic **properties** (`flaming`, `keen`, …) append to the same `weapon.properties` array as CRB Special tags — not a second field |
| Named items later | A later catalog may add specific magic items (`weapon.holy-avenger`, …) with an optional `baseItemId` pointing at the mundane row. That is its own pair of mechanics, after 21 |
| Masterwork | Same overlay as enhancement. Not a catalog row per weapon |
| Combat | Magic attack/damage/AC still stay typed until a batch says otherwise |
| License | Still mechanics-only until the first pack **prose**. Names of specific items are labels; do not copy item body text without OGL / Section 15 |

Schema work that is allowed when magic *starts* (not now): optional `baseItemId` on a catalog row; optional `enhancementBonus` on character item stats; keep `additionalProperties: false` so mundane JSON does not grow unused keys.

After batch 21, remaining **feats** and **spells** are locked in [§8](#8-remaining-crb-feats-and-spells). Do not start the magic pair unless a later lock says otherwise.

### 7.6 Weapon properties (after all weapon ids)

CRB Chapter 6 **Special** is a closed list of mundane tags. Do **not** tag these during batches 16–19. Finish the remaining weapon **rows** first (19), then add **one property type per PR**.

The storage shape **and the Inventory feature** are a list of **N** tags, not a single slot and not a “must have two” widget. Some CRB weapons have **one** Special (glaive: reach; siangham: monk; sap: nonlethal). Some have **two or more** (guisarme: reach and trip; ranseur: reach and disarm; whip: reach, trip, disarm, and nonlethal). Later magic properties (`flaming`, `keen`, …) slot into **this same list on the inventory entry**.

Thrown range is already `rangeFeet`. Net “see text,” crossbow loading, and later-book qualities (performance, deadly, grapple, …) stay out until their own slice.

| Batch | Property | CRB weapons that get the tag (after 19 exists) |
| --- | --- | --- |
| **W1** | `reach` | Longspear, glaive, guisarme, lance, ranseur, whip (**Landed**) |
| **W2** | `brace` | Longspear, spear, trident, halberd, dwarven urgrosh (**Landed** — longspear is N = 2; spear/trident/urgrosh are N = 1; W3 later appends trip on the halberd) |
| **W3** | `trip` | Sickle, flail, heavy flail, guisarme, halberd, scythe, kama, whip, gnome hooked hammer, dire flail, bolas (**Landed** — sickle/scythe/hooked hammer stay N = 1; W5 later appends monk on the kama; W4 later appends disarm on the flails and whip; W6 later appends nonlethal on bolas and whip) |
| **W4** | `disarm` | Flail, heavy flail, ranseur, nunchaku, sai, whip, dire flail (**Landed** — flails keep trip; ranseur keeps reach; W5 later appends monk on nunchaku/sai; W6 later appends nonlethal on the whip) |
| **W5** | `monk` | Quarterstaff, kama, nunchaku, sai, siangham, shuriken (**Landed** — quarterstaff/siangham/shuriken are N = 1; kama keeps trip; nunchaku/sai keep disarm) |
| **W6** | `nonlethal` | Sap, whip, bolas (**Landed** — sap is N = 1; bolas keeps trip; whip is N = 4) |
| **W7** | `double` | Quarterstaff, orc double axe, dire flail, gnome hooked hammer, two-bladed sword, dwarven urgrosh (**Landed** — orc double axe / two-bladed sword are N = 1; quarterstaff keeps monk; dire flail keeps trip and disarm; hooked hammer keeps trip; urgrosh keeps brace; `secondHead` is documentary Medium numbers) |

Each W-batch is two mechanics: (1) **append** that one quality on the matching catalog rows (keep any tags already present); (2) apply stamps the full list onto the inventory `weapon` subobject and **does not** rewrite `attacks` / CMB / reach math.

| Lock | Rule |
| --- | --- |
| List | `weapon.properties` is an **array of N tags**. N = 0 (omit the field), N = 1 (siangham: `["monk"]`; sap: `["nonlethal"]`; glaive: `["reach"]`), or N ≥ 2 (whip: `["reach", "trip", "disarm", "nonlethal"]`). Never a single enum field. A control that only works for two-or-more tags is wrong |
| Append | W3 trip on a guisarme that already has reach from W1 yields `["reach", "trip"]`. Do not replace the array |
| Magic later | The same array on that inventory entry is where later magic properties go (`flaming`, `keen`, ghost touch, …). Enhancement bonus stays a separate overlay. Do not mint plus-N ids and do not add a second “magic properties” field |
| Feature / UI | Inventory lists **every** current tag and can add/remove. Works for a weapon with only one property and still accepts a second. A single-select “property” dropdown is not allowed |
| Schema | Optional `weapon.properties` is an array of kebab-case strings. Do **not** close the enum to only the seven CRB tags — that would block magic later. Unique tags; omit the field when empty |
| One type per PR | Do not land reach and trip in the same change. Multiple tags on one weapon accumulate across PRs |
| Combat | Still typed. Reach does not change threatened area in the engine until a later batch says so |
| Double last | W7 landed `double` and a documentary `secondHead`. Primary `damageDice` stays a single string. Two-weapon attack rows still wait |
| Display | List **all** current tags, not only the first |
| License | Tags are mechanic labels, not Special-quality prose |

---

## 8. Remaining CRB feats and spells

Locked fill-out after honesty/code fixes. Same rules as batches 12–13: documentary stamp of id, name, and feat category or `spellLevel`. Combat numbers and slots stay typed. Unknown id → custom. Mechanics-only names and numbers. Two groups per PR.

**Full id tables:** [`pf1e-crb-feat-spell-ids.md`](pf1e-crb-feat-spell-ids.md) (human) and [`pf1e-crb-feat-spell-ids.json`](pf1e-crb-feat-spell-ids.json) (Vitest).

### 8.1 Shared locks

See the lock file. Highlights:

| Lock | Rule |
| --- | --- |
| Scope | Core Rulebook Chapter 5 feat table + Chapter 10 class lists only |
| Fields | `id` + `name` + `category` or `spellLevel`. No prerequisites, benefit, or spell text |
| Spell level | Sorcerer/wizard list when present; otherwise the lowest CRB class-list level |
| Specialization | One row per feat. Weapon/school choice stays typed on the sheet |
| Skip | Batch 12 five feats; Batch 13 four spells |
| Combat | Apply does **not** rewrite `armorClass`, `attacks`, initiative, or slots |

### 8.2 Batches F1–F4 and S1–S5

| Batch | Remaining rows | Status |
| --- | ---: | --- |
| F1a remaining combat (Agile Maneuvers–Dazzling Display) | 0 (18 packed) | Done |
| F1b remaining combat (Deadly Aim–Greater Overrun) | 0 (18 packed) | Done |
| F1c remaining combat (Greater Penetrating Strike–Improved Trip) | 0 (18 packed) | Done |
| F2a remaining combat (Improved Two-Weapon Fighting–Quick Draw) | 0 (17 packed) | Done |
| F2b remaining combat (Rapid Reload–Staggering Critical) | 0 (17 packed) | Done |
| F2c remaining combat (Stand Still–Wind Stance) | 0 (18 packed) | Done |
| F3a remaining general (Acrobatic–Extra Ki) | 0 (16 packed) | Done |
| F3b remaining general (Extra Lay On Hands–Leadership) | 0 (16 packed) | Done |
| F3c remaining general (Lightning Reflexes–Turn Undead) | 0 (15 packed) | Done |
| F4 remaining item creation + metamagic | 0 (13 packed) | Done |
| S1 remaining levels 0–1 | 0 (82 packed) | Done |
| S2 remaining levels 2–3 | 0 (147 packed) | Done |
| S3 remaining levels 4–5 | 0 (139 packed) | Done |
| S4 remaining levels 6–7 | 0 (127 packed) | Done |
| S5 remaining levels 8–9 | 0 (83 packed) | Done |

**Already packed (do not duplicate):** Batch 12 / 13 goldens, Wizard 7 playtest additions, Batches F1a–F1c, Batches F2a–F2c, Batches F3a–F3c, Batch F4, and Batches S1–S5 (all 177 feats and all 622 spells packed; see [`pf1e-crb-feat-spell-ids.md`](pf1e-crb-feat-spell-ids.md) and [`pf1e-crb-feat-spell-ids.json`](pf1e-crb-feat-spell-ids.json)).

Do **not** start APG follow-through in the same change as a platform increment.

---

## Appendix — Document history

| Date | Change |
| --- | --- |
| 2026-08-17 | Phase 3c opened. Batch 1: ability modifiers + BAB/save progressions; Fighter/Wizard catalog tags |
| 2026-08-17 | Batch 2: HP breakdown dialog (manual HD rolls) + iterative attacks |
| 2026-08-17 | Annotated upcoming batches 3–10 (next PR is AC/touch/FF + CMB/CMD) |
| 2026-08-17 | Batch 3 UI-honesty notes; typo Encumberance → Encumbrance |
| 2026-08-17 | Skill warn/blank and Combat honesty landed early; batch 3 formula table tests still next |
| 2026-08-18 | Audit merged on local `main`; batch 3 remains the next code change |
| 2026-08-18 | Batch 3: AC/touch/FF + CMB/CMD table tests; next is skills |
| 2026-08-18 | Batch 4: skill totals + max ranks; next is size tables |
| 2026-08-18 | Batch 5: size AC/attack/CMB/CMD + carry multiplier; next is encumbrance |
| 2026-08-18 | Batch 6: Strength heavy-load + load category; Ignore weight opt-out; next is Human catalog |
| 2026-08-18 | Batch 8: Human race catalog id; +2 stays typed; next is class skills |
| 2026-08-18 | Batch 9: Fighter/Wizard class skills + skill-point pool; next is weapons/armor ids |
| 2026-08-18 | Batch 10: documentary weapons/armor ids; AC/attacks stay typed; next is remaining 9 CRB classes |
| 2026-08-18 | Batch 11: remaining 9 CRB classes reuse the Fighter/Wizard catalog row; next is feat ids |
| 2026-08-18 | Batch 12: documentary feat ids; Combat math stays typed; next is spell metadata. 1.0 bar includes Synthesist Summoner (APG, not this pack) |
| 2026-08-18 | Batch 13: documentary spell ids; slots/DCs/prepared stay typed; next is Batch 7 pack review |
| 2026-08-18 | Batch 7: spell DC + bonus-spells table; slots stay typed; next is PWA proof |
| 2026-08-18 | App draft + PWA proof landed; this pack’s next gate is OGL before rules text |
| 2026-08-18 | OGL / PI review: mechanics-only pack; no Section 15 until rules text; next is 1.0 |
| 2026-08-18 | APG slice 1 landed in a separate pack; this folder stays CRB-only |
| 2026-08-19 | Pack `status` records batches 1–13 complete. Next product work is still APG overlay, not more CRB encyclopedia rows |
| 2026-08-19 | APG slice 2 landed in the separate pack; this folder stays CRB-only |
| 2026-08-19 | Synthesist golden landed in fixtures; this folder stays CRB-only |
| 2026-08-19 | Spanish UI catalog landed; this folder stays English mechanics-only names |
| 2026-08-19 | 1.0 stability; this folder stays CRB-only |
| 2026-08-19 | Batch 14: remaining CRB player races + size stamp; ability adjustments stay typed; next is spells-per-day tables |
| 2026-08-27 | Batch 15: class spells-per-day tables + hybrid Max (click to customize, empty resets); next is remaining catalog rows |
| 2026-08-27 | Locked remaining mundane weapons/armor into batches 16–21; magic weapons/armor reserved as a later overlay, not plus-N rows |
| 2026-08-27 | Batch 16: remaining simple melee + simple ranged and ammo; Combat stays typed; next mundane equipment is martial weapons (17) |
| 2026-08-27 | Batch 17: martial light + remaining martial one-handed; skip shield-bash ids; next is martial two-handed + bows (18) |
| 2026-08-27 | After all weapon ids, CRB Special tags (reach, brace, trip, disarm, monk, nonlethal, double) land one type per PR; not in 16–19. `weapon.properties` is an array (2+ tags per weapon; later magic properties use the same list) |
| 2026-08-27 | Batch 18: martial two-handed + martial ranged and arrows; Combat stays typed; next is exotic weapons (19) |
| 2026-08-27 | Batch 19: exotic melee + exotic ranged and repeating bolts; double weapons primary head only; next catalog is W1 reach |
| 2026-08-27 | W1: reach on a `weapon.properties` array of N tags (one or many); Inventory add/remove; next is W2 brace |
| 2026-08-27 | W2: brace appended (longspear keeps reach; spear/trident/halberd/urgrosh are N = 1); next is W3 trip |
| 2026-08-27 | W3: trip appended (guisarme/whip keep reach; halberd keeps brace; sickle/kama and the other trip-only rows are N = 1); next is W4 disarm |
| 2026-08-28 | W4: disarm appended (nunchaku/sai are N = 1; flails keep trip; ranseur keeps reach; whip is N = 3); next is W5 monk |
| 2026-09-01 | W5: monk appended (quarterstaff/siangham/shuriken are N = 1; kama keeps trip; nunchaku/sai keep disarm); next is W6 nonlethal |
| 2026-09-01 | W6: nonlethal appended (sap is N = 1; bolas keeps trip; whip is N = 4); next is W7 double |
| 2026-09-01 | W7: double appended plus documentary secondHead; primary dice stay a single string; next is Batch 20 armor |
| 2026-09-01 | Batch 20: remaining light + medium armor; Combat stays typed; next is heavy armor + shields (21) |
| 2026-09-01 | Batch 21: heavy armor + shields (kind shield) + extras; Combat stays typed; next is remaining feats/spells |
| 2026-09-03 | Next code is honesty/code fixes (not feats/spells). Sidebar tools are the last character-sheet feature |
| 2026-09-03 | Locked remaining CRB feat/spell ids (F1–F4, S1–S5). Do not pack until after honesty/code fixes |
| 2026-09-12 | Playtest priority override landed: Wizard 7 features (Arcane Bond, Physical Enhancement, Telekinetic Fist), 6 feats, 40 spells packed |
| 2026-09-12 | Phase 1x honesty / code fixes landed: W7 test renames, golden weapon stamps vs catalog, focusTab wired |
| 2026-09-12 | Feat batches subdivided into 10 steps (F1a–F1c, F2a–F2c, F3a–F3c, F4); Batch F1a landed (18 combat feats); next is F1b |
| 2026-09-12 | Batch F1b landed (18 combat feats; 47 CRB feats packed); next is F1c |
| 2026-09-12 | Batch F1c landed (18 combat feats; 65 CRB feats packed; F1 combat first-half complete); next is F2a |
| 2026-09-14 | Batch F2a landed (17 combat feats; 82 CRB feats packed; 71 combat feats packed total); next is F2b |
| 2026-09-14 | Batch F2b landed (17 combat feats; 99 CRB feats packed; 88 combat feats packed total); next is F2c |
| 2026-09-14 | Batch F2c landed (18 combat feats; 117 CRB feats packed; 106 combat feats packed total; combat category complete); next is F3a |
| 2026-09-14 | Batches F3a–F3c landed (47 general feats; 164 CRB feats packed; 49 general feats packed total; general category complete); next is F4 |
| 2026-09-14 | Batch F4 landed (13 item creation + metamagic feats; all 177 CRB feats packed); next is S1 |
| 2026-09-14 | Batches S1–S5 landed (578 spells packed; all 622 CRB spells packed; CRB catalog complete); next is APG follow-through |
| 2026-09-14 | Magic weapons and armor landed: sheet overlay (enhancementBonus, masterwork, properties), CRB special abilities catalog, baseItemId inheritance, and specific magic weapons/armor/shields |
