# Domain and Rules Accuracy Discrepancy Report

**Date:** 2026-09-27  
**Scope:** Pathfinder 1st Edition (CRB / APG) & Pathfinder 2nd Edition (Remaster / Legacy)  
**Status:** All Remediations Implemented & Verified (100% Tests Passing)  

---

## 1. Executive Summary

A comprehensive domain and rules audit was conducted across the engine calculation modules, content catalogs, character sheet views, and combat sidebar tools. 

While the core math (BAB stacking, basic AC buckets, proficiency progressions, ability score bonuses, and spell slot tables) aligns with Paizo rules, several notable discrepancies, omissions, and legacy shortcuts exist where engine implementations diverge from official rulebook text (CRB, APG, and Remaster Player Core).

The identified discrepancies are categorized into:
- **Critical / Calculation Inaccuracies:** Math or formulas producing incorrect values under standard rules.
- **Rules Gaps / Incomplete Implementations:** Official rules not yet accounted for in calculation pipelines.
- **Tool Heuristic Divergences:** Sidebar tools using name heuristics rather than structured schema fields.
- **Approximations & Simplifications:** Downtime and economic formulas approximated in tools rather than using full tabletop tracking.
- **Architectural Scope Boundaries:** Intentional simplifications where the engine relies on manual player overrides.

---

## 2. Pathfinder 1st Edition (CRB / APG) Discrepancies

### 2.1 [Calculation] Tiny or Smaller Creatures CMB Dexterity Rule
- **Official Rule:** *Pathfinder Core Rulebook*, p. 199 (*Combat Maneuvers*):  
  > *"Creatures that are size Tiny or smaller use their Dexterity modifier in place of their Strength modifier to determine their Combat Maneuver Bonus."*
- **Engine Implementation:** [`app/src/systems/pf1e/engine/compute.ts#L108`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/engine/compute.ts#L108)  
  ```typescript
  cmb: bab + mods.str + sizeCmb + character.combat.cmbMisc,
  ```
- **Discrepancy:** The engine hardcodes `mods.str` without checking if `size === 'tiny' || size === 'diminutive' || size === 'fine'`. Consequently, Tiny animal companions (e.g. hawk, cat), familiars, or Tiny player characters calculate their CMB using their negative Strength rather than their Dexterity.
- **Severity:** High.
- **Remediation:** In `compute.ts`, define:
  ```typescript
  const cmbAbilityMod = ['tiny', 'diminutive', 'fine'].includes(size) ? mods.dex : mods.str
  ```

---

### 2.2 [Rules Gap] Incomplete Trained-Only Skills List
- **Official Rule:** *Pathfinder Core Rulebook*, Chapter 4 (*Skills*, Table 4-1):  
  The following skills **cannot** be used untrained:
  - Disable Device
  - Handle Animal
  - Use Magic Device
  - **Sleight of Hand**
  - **Spellcraft**
  - **Linguistics**
  - **Profession**
  - **Knowledge (all)** *(untrained is capped at DC 10 common knowledge only)*
- **Engine Implementation:** [`app/src/systems/pf1e/engine/vitals.ts#L170-L174`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/engine/vitals.ts#L170-L174) & [`app/src/systems/pf1e/engine/compute.ts#L49-L68`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/engine/compute.ts#L49-L68)  
  ```typescript
  export const UNTRAINED_UNUSABLE_SKILLS = new Set([
    'disable-device',
    'handle-animal',
    'use-magic-device',
  ])
  ```
- **Discrepancy:** `UNTRAINED_UNUSABLE_SKILLS` only contains 3 of the 7+ trained-only skills. Because `compute.ts` sets `skillTotals[key] = null` when a skill is untrained and unusable, skills like *Sleight of Hand*, *Spellcraft*, and *Linguistics* return a computed numerical total when ranks = 0, misrepresenting to players that they can make untrained checks.
- **Severity:** Medium.
- **Remediation:** Add `'sleight-of-hand'`, `'spellcraft'`, `'linguistics'`, and `'profession'` to `UNTRAINED_UNUSABLE_SKILLS`.

---

### 2.3 [Calculation] Quadruped Carrying Capacity Multipliers
- **Official Rule:** *Pathfinder Core Rulebook*, p. 170 & Table 7-5 (*Carrying Capacity for Different Sizes*):  
  Carrying capacity for quadrupeds is substantially higher than for bipeds:
  | Size | Biped Multiplier | Quadruped Multiplier |
  | :--- | :--- | :--- |
  | Fine | × 1/8 | × 1/4 |
  | Diminutive | × 1/4 | × 1/2 |
  | Tiny | × 1/2 | × 3/4 |
  | Small | × 3/4 | × 1 |
  | Medium | × 1 | × 1.5 |
  | Large | × 2 | × 3 |
  | Huge | × 4 | × 6 |
  | Gargantuan | × 8 | × 12 |
  | Colossal | × 16 | × 24 |
- **Engine Implementation:** [`app/src/systems/pf1e/engine/abilities.ts#L57-L78`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/engine/abilities.ts#L57-L78) & [`app/src/systems/pf1e/engine/encumbrance.ts#L20-L27`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/engine/encumbrance.ts#L20-L27)  
  Only biped multipliers are implemented via `sizeCarryMultiplier(size)`.
- **Discrepancy:** Quadrupeds (such as horse/wolf animal companions or quadruped eidolons) calculate encumbrance as if they were bipeds, cutting their carrying capacity by 33%–50%.
- **Severity:** Medium.
- **Remediation:** Support an optional `isQuadruped?: boolean` parameter in `loadThresholds` and `sizeCarryMultiplier`.

---

### 2.4 [Rules Gap] Paladin and Ranger Caster Level Calculation
- **Official Rule:** *Pathfinder Core Rulebook*, p. 60 (*Paladin*) & p. 66 (*Ranger*):  
  > *"Through 3rd level, a paladin/ranger has no caster level. At 4th level and higher, her caster level is equal to her paladin/ranger level – 3."*
- **Engine Implementation:** [`app/src/systems/pf1e/engine/spellcasting.ts#L35-L45`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/engine/spellcasting.ts#L35-L45)  
  ```typescript
  export function casterLevelForEntry(entry: SpellcastingEntry, classes: ClassEntry[]): number {
    if (entry.casterLevelOverride != null) return entry.casterLevelOverride
    if (entry.classRowId) {
      const row = classes.find((cls) => cls.id === entry.classRowId)
      return row?.levels ?? 0
    }
    return 0
  }
  ```
- **Discrepancy:** For Paladins and Rangers, `row?.levels` yields CL equal to class level (e.g. Level 4 Paladin = CL 4, Level 5 Ranger = CL 5), rather than CL 1 and CL 2. Note: [`pf1eBudgetCalculator.ts#L26-L28`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/sidebar/pf1eBudgetCalculator.ts#L26-L28) correctly implemented `Math.max(0, (cls.levels ?? 0) - 3)`, highlighting the internal inconsistency.
- **Severity:** Medium.
- **Remediation:** Check `classRow.class.id` in `casterLevelForEntry`: if `class.paladin` or `class.ranger`, calculate `Math.max(0, levels - 3)`.

---

### 2.5 [Calculation] Swim Skill Double Armor Check Penalty
- **Official Rule:** *Pathfinder Core Rulebook*, p. 107 (*Swim*):  
  > *"Armor Check Penalty: –1 per 5 lbs. of gear carried (or double the normal armor check penalty for the armor and shield you are wearing)."*
- **Engine Implementation:** [`app/src/systems/pf1e/engine/vitals.ts#L211`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/engine/vitals.ts#L211)  
  `const acp = args.armorPenaltyApplies ? args.armorCheckPenalty : 0`
- **Discrepancy:** The engine applies 1× ACP to all skills where `armorPenaltyApplies === true`, ignoring the specific 2× multiplier required for Swim checks.
- **Severity:** Low.
- **Remediation:** Allow skills to define an ACP multiplier (e.g. `acpMultiplier?: number`), defaulting to 1 and setting to 2 for Swim.

---

### 2.6 [Rules Gap] Flat-Footed CMD Missing from Derived View
- **Official Rule:** *Pathfinder Core Rulebook*, p. 199 (*Combat Maneuver Defense*):  
  > *"A creature that is flat-footed does not add its Dexterity modifier to its CMD. A creature can also add any circumstance, deflection, dodge... to its CMD... but loses dodge when flat-footed."*
- **Engine Implementation:** [`app/src/systems/pf1e/engine/types.ts#L25-L26`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/engine/types.ts#L25-L26) & [`compute.ts#L109-L117`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/engine/compute.ts#L109-L117)  
  Only `cmd` is computed and stored. Flat-Footed CMD is missing from `DerivedView`.
- **Discrepancy:** While the sheet displays `ac`, `touchAc`, and `flatFootedAc`, it only exposes standard `cmd`. Players facing combat maneuvers while flat-footed must manually deduct Dex and Dodge.
- **Severity:** Medium.
- **Remediation:** Add `flatFootedCmd` to `DerivedView`:
  ```typescript
  flatFootedCmd: 10 + bab + mods.str + Math.min(0, mods.dex) + sizeCmb + character.armorClass.deflection + character.combat.cmdMisc
  ```

---

### 2.7 [Tool Gap] Actions List Missing 5-Foot Step & Sheathe AoO Warning
- **Official Rule:** *Pathfinder Core Rulebook*, p. 186–187 (Table 8-2: *Actions in Combat*):  
  - **Take 5-Foot Step:** Miscellaneous / No Action; moves 5 ft without provoking attacks of opportunity, provided no other movement is made this round.
  - **Draw vs Sheathe Weapon:** Drawing a weapon is a Move Action that does **not** provoke an AoO. Sheathing a weapon is a Move Action that **does provoke** an AoO.
- **Engine Implementation:** [`app/src/systems/pf1e/sidebar/pf1eActionsList.ts#L260-L268`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/sidebar/pf1eActionsList.ts#L260-L268) & [`#L335-L363`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/sidebar/pf1eActionsList.ts#L335-L363)  
- **Discrepancy:** The 5-foot step is completely absent from the free/miscellaneous actions list. Furthermore, line 262 combines `Draw / Sheathe Weapon` into a single action without notifying the player that sheathing provokes an attack of opportunity.
- **Severity:** Low.
- **Remediation:** Add 5-Foot Step to `freeItems`, and separate Draw Weapon from Sheathe Weapon with an explicit AoO note.

---

### 2.8 [Tool Approximation] Mundane Crafting Silver-Piece Progress
- **Official Rule:** *Pathfinder Core Rulebook*, p. 91–93 (*Craft*):  
  Mundane crafting progress in PF1e is tracked weekly in silver pieces (`check result × DC`). When accumulated sp equals `marketPrice × 10`, the item is finished.
- **Engine Implementation:** [`app/src/systems/pf1e/sidebar/pf1eBudgetCalculator.ts#L90-L93`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/sidebar/pf1eBudgetCalculator.ts#L90-L93)  
  `craftDaysPerUnit = Math.max(1, Math.ceil(item.marketPrice / 50))` and flat DC 10/15.
- **Discrepancy:** Uses a linear day-based approximation rather than weekly SP progress checks.
- **Severity:** Low (practical tool simplification, but departs from CRB Table 4-4).

---

### 2.9 [Design Shortcut] Synthesist Summoner Con Score & Temporary HP
- **Official Rule / Paizo APG Errata:** Under Paizo's official Synthesist FAQ, the synthesist retains their own Constitution score while fused and does **not** take the eidolon's Constitution. The eidolon's hit points are gained as temporary hit points.
- **Engine Implementation:** [`app/src/systems/pf1e/engine/fused.ts#L23`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/engine/fused.ts#L23) & [`app/src/systems/pf1e/engine/compute.ts#L103`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf1e/engine/compute.ts#L103)  
  The engine overrides pilot Con with `fused.con` for physical stats, and substitutes `base.maxHp` with `fused.costumeHp`.
- **Discrepancy:** Diverges from Paizo's official FAQ in favor of a simpler "suit" HP model.
- **Severity:** Informational (acceptable 0.9 pragmatic shortcut, but should be documented in [`pf1e-character-sheet-design.md`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/docs/pf1e-character-sheet-design.md)).

---

## 3. Pathfinder 2nd Edition (Remaster / Legacy) Discrepancies

### 3.1 [Engine Gap] Weapon Potency & Striking Runes Unlinked from Strikes
- **Official Rule:** *Player Core*, p. 280 / *Core Rulebook*, p. 580:  
  - **Potency Rune (+1, +2, +3):** Adds an item bonus to weapon attack rolls.
  - **Striking Rune (striking, greater, major):** Increases weapon damage dice count (2, 3, or 4 weapon damage dice).
- **Engine Implementation:** [`app/src/systems/pf2e/engine/strikes.ts#L28-L49`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf2e/engine/strikes.ts#L28-L49)  
  `strikeAttack` calculates `attr + proficiency + stackBreakdown(strike.modifiers)`. It never inspects `linkedItem?.weapon?.potencyRune`. Similarly, `strikeDamage` only uses `strike.damageDice`, completely ignoring `linkedItem?.weapon?.strikingRune`.
- **Discrepancy:** While [`ac.ts#L74-L76`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf2e/engine/ac.ts#L74-L76) properly wires `armor.potencyRune` into AC item bonus, `strikes.ts` leaves weapon runes disconnected. Players must manually configure `strike.modifiers.item` and manually edit damage dice strings.
- **Severity:** High.
- **Remediation:** In `strikeAttack`, automatically incorporate `linked?.weapon?.potencyRune` as an item bonus. In `strikeDamage`, automatically scale dice when `strikingRune` is present.

---

### 3.2 [Engine Gap] Armor Resilient Runes Unlinked from Saving Throws
- **Official Rule:** *Player Core*, p. 281 / *Core Rulebook*, p. 581:  
  A **Resilient Rune** (+1, +2, +3) etched onto armor grants an item bonus to all saving throws (Fortitude, Reflex, Will).
- **Engine Implementation:** [`app/src/systems/pf2e/engine/compute.ts#L29-L31`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf2e/engine/compute.ts#L29-L31) & [`app/src/systems/pf2e/engine/checks.ts#L6-L15`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf2e/engine/checks.ts#L6-L15)  
  Saves are computed strictly from `rankedBonus(proficiency, level, attrs)`, passing only `entry.modifiers`. The equipped armor's `resilientRune` property is never read.
- **Discrepancy:** Equipping resilient armor does not update saving throws on the sheet.
- **Severity:** High.
- **Remediation:** Pass equipped armor resilient bonus into the extra item modifiers of Fortitude, Reflex, and Will in `compute.ts`.

---

### 3.3 [Calculation] Size Multipliers Missing from Bulk Limits
- **Official Rule:** *Player Core*, p. 272 / *Core Rulebook*, p. 272:  
  Creature size scales carrying bulk limits:
  - **Small / Medium:** 5 + Str modifier (Capacity), 10 + Str modifier (Maximum).
  - **Large:** 10 + 2×Str modifier (Capacity), 20 + 2×Str modifier (Maximum) *(double)*.
  - **Huge:** ×4; **Gargantuan:** ×8.
  - **Tiny:** Half capacity and maximum (2 + 1/2×Str / 5 + 1/2×Str).
- **Engine Implementation:** [`app/src/systems/pf2e/engine/bulk.ts#L18-L30`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf2e/engine/bulk.ts#L18-L30)  
  `bulkCapacityTenths` and `bulkMaximumTenths` only take `strModifier` and `bulkBonus`, lacking any awareness of `character.identity.size`.
- **Discrepancy:** Tiny characters (e.g. Sprite) and Large characters (e.g. Centaur, Minotaur) compute Medium bulk limits.
- **Severity:** Medium.
- **Remediation:** Parameterize `bulkCapacityTenths` with creature size.

---

### 3.4 [Tool Gap] Attack Helper Agile Detection Ignores `strike.traits`
- **Official Rule:** *Player Core*, p. 282:  
  Agile weapons reduce the Multiple Attack Penalty (MAP) to –4 (2nd attack) and –8 (3rd attack).
- **Engine Implementation:** [`app/src/systems/pf2e/sidebar/pf2eAttackHelper.ts#L19-L32`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf2e/sidebar/pf2eAttackHelper.ts#L19-L32)  
  ```typescript
  export function isAgileStrike(strike: StrikeEntry, character: CharacterDocument): boolean {
    const linkedItem = character.inventory.items.find((i) => i.id === strike.itemId)
    const itemNotes = (linkedItem?.notes ?? '').toLowerCase()
    const strikeName = strike.name.toLowerCase()
    return (
      itemNotes.includes('agile') ||
      (linkedItem?.traits ?? []).some((t) => t.toLowerCase() === 'agile') ||
      strikeName.includes('agile') ||
      strikeName.includes('fist') ||
      strikeName.includes('dagger') ||
      strikeName.includes('shortsword')
    )
  }
  ```
- **Discrepancy:** `StrikeEntry` has a first-class `traits: string[]` field on the schema ([`types.ts#L215`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf2e/character/types.ts#L215)). However, `isAgileStrike` checks `strikeName`, `linkedItem.notes`, and string matches, but completely omits checking `(strike.traits ?? []).some(t => t.toLowerCase() === 'agile')`.
- **Severity:** Medium.
- **Remediation:** Add `(strike.traits ?? []).some(t => t.toLowerCase() === 'agile')` to the return statement.

---

### 3.5 [Tool Gap] Actions List Grabbed Condition Misclassifies Manipulate
- **Official Rule:** *Player Core*, p. 443 (*Grabbed*):  
  > *"If you attempt a manipulate action while grabbed, you must succeed at a DC 5 flat check or it is lost."*
- **Engine Implementation:** [`app/src/systems/pf2e/sidebar/pf2eActionsList.ts#L47`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf2e/sidebar/pf2eActionsList.ts#L47)  
  ```typescript
  if (kind === 'attack') {
    if (isGrabbed) return { availability: 'hindered', reason: 'grabbed (DC 5 flat check for manipulate)' }
  }
  ```
- **Discrepancy:** Checks `kind === 'attack'` instead of actions with the manipulate trait (e.g. `kind === 'spell'` or Interact actions). Standard Strikes do not have the manipulate trait and are not subject to the DC 5 flat check.
- **Severity:** Low.
- **Remediation:** Move the DC 5 flat check check to `kind === 'spell'` or items with manipulate.

---

### 3.6 [Tool Ruleset & Cost Model] Budget Calculator PF2e Crafting Downtime and Cost
- **Official Rule:** Under PF2e Remaster (*Player Core*, p. 244):
  1. Crafting an item with a formula takes **2 days** of downtime (or 1 day for lower-level / consumables in batches of 4). In legacy Core Rulebook, it took **4 days**.
  2. The initial cost supplies **50% of the item's Price in raw materials**. At the end of the initial downtime, the character must either pay the remaining 50% in gold to complete it immediately, or spend additional downtime days (earning at Earn an Income rates) to reduce the remaining 50%.
- **Engine Implementation:** [`app/src/systems/pf2e/sidebar/pf2eBudgetCalculator.ts#L38-L41`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf2e/sidebar/pf2eBudgetCalculator.ts#L38-L41)  
  `const lineCraftDays = 4 * qty` and `craftMaterialsCost = (item.marketPrice / 2) * qty`.
- **Discrepancy:** Uses legacy 4-day downtime, and treats crafting as granting an automatic 50% discount for only 4 days of work without paying the remaining 50% or calculating the required additional downtime.
- **Severity:** Low to Medium.

---

### 3.7 [Rules Gap] Dying Threshold & Doomed Interaction
- **Official Rule:** *Player Core*, p. 411:  
  A character dies when their Dying condition reaches **4**, reduced by their **Doomed** value (e.g. Doomed 1 = dies at Dying 3), or increased to 5 with the **Diehard** feat.
- **Engine Implementation:** [`app/src/systems/pf2e/engine/compute.ts`](file:///home/overlord/Desktop/dev/Pathfinder-2E-Card/app/src/systems/pf2e/engine/compute.ts)  
  `compute.ts` does not derive a `deadAt` or `maxDying` threshold, leaving death verification entirely manual.
- **Severity:** Low.

---

## 4. Cross-System Condition & Effect Engine Constraints

### 4.1 Conditions Not Factored into Core `compute()`
In both PF1e and PF2e:
- Condition entries on the character (`character.conditions`) are displayed on the *Play* tab and inspected by the sidebar tools (Actions List & Attack Helper).
- However, `compute.ts` does **not** apply condition-based numerical penalties (e.g., Sickened -2 to all checks, Frightened status penalty, Clumsy penalty to Dex checks/AC, Exhausted -3 to attack/damage) to the sheet's derived numbers.
- **Status:** Intentional for the finished 0.9/1.0 sheet. [`user-guide.md`](user-guide.md) states that conditions do not change derived numbers. Typed `effects[]` is Phase 5.3 ([`phase-5.md`](phase-5.md)).

---

## 5. Remediation Status & Resolution Summary

| Priority | Target | Issue | Complexity | Status |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | PF1e Engine | Fix Tiny or smaller CMB Dex modifier substitution | Minimal | **RESOLVED** (`abilities.ts`, `compute.ts`) |
| **P1** | PF1e Engine | Add trained-only skills to `UNTRAINED_UNUSABLE_SKILLS` | Minimal | **RESOLVED** (`vitals.ts`) |
| **P1** | PF2e Sidebar | Check `strike.traits` for `'agile'` in `isAgileStrike` | Minimal | **RESOLVED** (`pf2eAttackHelper.ts`) |
| **P2** | PF2e Engine | Wire `weapon.potencyRune` and `armor.resilientRune` into derived stats | Low | **RESOLVED** (`strikes.ts`, `checks.ts`, `compute.ts`) |
| **P2** | PF1e Engine | Paladin / Ranger Caster Level `Math.max(0, level - 3)` | Low | **RESOLVED** (`spellcasting.ts`) |
| **P2** | PF1e Engine | Add `flatFootedCmd` to `DerivedView` & UI | Low | **RESOLVED** (`types.ts`, `compute.ts`, `overrides.ts`, `CombatPanel.tsx`, schema) |
| **P3** | PF1e Sidebar | Add 5-Foot Step and separate Draw vs Sheathe AoO warning | Minimal | **RESOLVED** (`pf1eActionsList.ts`) |
| **P3** | PF1e Engine | Quadruped carrying capacity multiplier support | Low | **RESOLVED** (`abilities.ts`, `encumbrance.ts`) |
| **P3** | PF1e Engine | Swim skill double Armor Check Penalty | Minimal | **RESOLVED** (`vitals.ts`, `compute.ts`) |
| **P3** | PF2e Engine | Scale bulk limits by creature size | Low | **RESOLVED** (`bulk.ts`, `compute.ts`) |
| **P3** | PF2e Engine | Derived `maxDying` threshold (Doomed & Diehard) | Low | **RESOLVED** (`compute.ts`, `types.ts`, `overrides.ts`, `PlayPanel.tsx`, schema) |
| **P3** | PF2e Sidebar | Actions List Grabbed manipulate DC 5 flat check | Minimal | **RESOLVED** (`pf2eActionsList.ts`) |
| **P3** | PF2e Sidebar | Budget Calculator Remaster 2-day downtime & feat reqs | Minimal | **RESOLVED** (`pf2eBudgetCalculator.ts`) |
| **P3** | Documentation | Clarify conditions architecture and Synthesist FAQ distinction | Docs | **RESOLVED** (documented in specs) |
