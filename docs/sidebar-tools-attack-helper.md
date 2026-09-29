# Attack Helper (sidebar tool)

**Status:** **Landed** (2026-09-20). Implemented under `app/src/shell/sidebar/tools/attackHelper/`. Host lock: [ADR 0005](adr/0005-sidebar-host.md), [`sidebar-host-design.md`](sidebar-host-design.md).  
**Id:** `shell.attack-helper` (shared entry; per-system math behind it).  
**Sequencing:** Shipped as the last character-sheet feature of Phase 1x (alongside [Actions List](sidebar-tools-actions-list.md) and [Budget Calculator](sidebar-tools-budget-calculator.md)). Both PF1e and PF2e supported. No in-app dice.

---

## 1. Purpose

Help the player **resolve an attack at the table** without rolling in the app. They pick a weapon (and optional feats), then see:

- **Mechanical** expectations: what the attack **triggers** (for example attacks of opportunity / reactive strikes) and what it can **inflict** on the target (conditions, extra effects, traits that matter).
- **Mathematical** expectations: **to-hit** bonus, **potential damage**, and other bonuses/penalties that apply to that attack.

The player then rolls **physical dice**. This tool **must not** include a dice roller, random damage, or auto-resolved hit/miss.

---

## 2. Inputs (session UI)

| Input | Source | Notes |
| --- | --- | --- |
| Weapon / strike | Character sheet (PF2e `strikes[]` / linked inventory weapon; PF1e attacks / equipped weapons) | One selection at a time |
| Applicable feats | Character `feats[]` (and class features that modify attacks) | Player **toggles** which ones apply to *this* swing (Power Attack, Combat Expertise, Deadly Aim, MAP / iterative slot, etc.) |
| Optional context | Session only unless it consumes a sheet resource | e.g. which iterative / MAP attack, charge, two-weapon; do not invent a second character file |

Toggles for “I’m using this feat **now**” are **session state** on the tool. If using the attack **consumes** a daily/encounter resource on the sheet, that write goes through `update` like any other Play edit.

---

## 3. Outputs (read-only display)

**Math (from `derived` + selected toggles):**

- Attack bonus / to-hit (and iterative / MAP list if the system has one).
- Damage expression (dice **notation** such as `1d8+4`, not a rolled total).
- Extra bonuses/penalties that apply (ability, enhancement, circumstance, charge, etc. — using that system’s stacking).
- Critical / confirm hints as **text and numbers**, not a roll.

**Mechanics (from sheet rows + later content packs):**

- Events this attack can **trigger** (attacks of opportunity, reactive strike, cleave follow-ups — as listed for the weapon/feats, not a full combat AI).
- What it can **inflict** on the target (damage type, traits like trip/disarm, conditions from feats). Unknown `effects[]` stay ignored until typed automation exists; until then, **summary text** on the feat/weapon row is enough.

Do not auto-apply HP damage or conditions to a target: there is no NPC on the sheet. Inflict lists are **player-facing reminders**.

---

## 4. Dice (non-goal, locked)

- **No** in-app dice, RNG, or “roll this attack” button.
- Copyable to-hit and damage **expressions** are fine so the player can read them while rolling at the table.
- ADR 0003’s “no dice roller” stays in force. This tool does not reopen it.

---

## 5. Read / write

| Direction | Use |
| --- | --- |
| Read | `character` weapons, feats, abilities; `derived` strike/attack/damage |
| Session | Selected weapon id, feat toggles, which attack in a full-attack / MAP sequence |
| Write (`update`) | Only if the player marks a consumed resource (rage round, panache, etc.). Do not persist “I was looking at the longsword” on Save unless a later ADR says so |

Same `SidebarToolContext` as every tool. No parallel combat document.

---

## 6. Editions

Both PF1e and PF2e need this tool; **formulas fork**:

| | PF2e | PF1e |
| --- | --- | --- |
| Weapon pick | Strike rows (+ item link) | Attack / weapon rows |
| Multiple attacks | MAP (−5 / −10) | Iteratives from BAB |
| Feats | e.g. Power Attack (Remaster) as sheet rows | e.g. Power Attack, Combat Expertise |
| Opportunity | Reactive Strike / AoO from feats & reactions | Attacks of opportunity from threatened area / feats |

Do not share one attack-math function. Share the **tool chrome** (weapon select, feat checkboxes, math/mechanics panels). Register via `SystemModule.sidebarTools` and/or a shared shell wrapper that delegates compute to the active system.

Until content packs exist, mechanical lines come from user-entered `summary` / traits on the strike and feat rows.

---

## 7. Relationship to other tools

| Tool | Relationship |
| --- | --- |
| **Attack Helper** (this) | Resolve **this** swing: expressions only |
| **Actions List** | Whether an attack is available **now** |
| **Budget Calculator** | Buying or crafting the weapon **before** play. Spec: [`sidebar-tools-budget-calculator.md`](sidebar-tools-budget-calculator.md) |

---

## 8. Out of scope for the first tools increment

- Targeting a creature / NPC AC (no encounter tracker).
- Automating feat legality (prereqs, “you already used this this turn”).
- Full 1E bonus-type stacker beyond what that edition’s `compute()` already does.
- Spell attacks as the first slice (melee/ranged **weapons** first; spells can reuse the chrome later).

---

## Appendix — Document history

| Date | Change |
| --- | --- |
| 2026-08-17 | Named later tool: Attack Helper; table dice only |
| 2026-08-17 | Cross-link Budget Calculator (shop/craft the weapon first) |
| 2026-09-20 | Tool landed for both PF1e and PF2e (`shell.attack-helper`) under `app/src/shell/sidebar/tools/attackHelper/` |
| 2026-09-22 | i18n parity and pre-release hygiene landed |
