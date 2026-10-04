# User & Player Guide — TTRPG Character Sheet

A guide for players using **TTRPG Character Sheet** at the physical gaming table or in online sessions.

---

## 1. Quick Start & Table Workflow

### Platform & Offline Use
- **Local-First PWA:** The application runs entirely inside your browser. No data is sent to external servers, and no account or login is required.
- **Install as an App:** You can install the sheet through your browser's "Install" or "Add to Home Screen" option for dedicated, full-screen offline use.
- **Saving & Loading:**
  - **Save Sheet (`.json`):** Downloads your current character to a local JSON file on your computer/device. Use this between sessions to back up your characters.
  - **Load Sheet:** Replaces the active sheet in memory with a previously saved `.json` character file.
  - **Autosaved Draft:** While playing, your changes are automatically preserved in local browser storage (IndexedDB) as a single active draft. If you refresh or close the tab, the app restores your work.

### Physical Table Dice (No In-App Dice)
This sheet does **not** roll virtual dice. It computes all necessary modifiers, bonus breakdowns, iterative attacks, and damage formulas so you can roll physical dice at the table with confidence.

---

## 2. Character Sheet Layout & Editors

### Identity & Mode Switching
- **Top Strip:** Displays your character name, level/classes summary, current HP, and active system indicator.
- **Build vs. Play:**
  - **Build Tabs (Identity, Abilities, Skills, Combat, Spells, Inventory, Feats):** Used between sessions or when leveling up to adjust scores, buy equipment, select feats/spells, and configure class progressions.
  - **Play Tab:** Used during live encounters to track temporary session state: **Current HP** (which can drop into negative numbers in PF1e), nonlethal damage, active **Conditions** (e.g., *shaken*, *grappled*, *fatigued*), and **Daily Resources** (e.g., Channel Energy, Rage rounds, Ki points).
  - **Conditions do not change the numbers.** Adding *sickened*, *frightened*, *grappled*, or a similar condition updates the Play tab and the sidebar tools. It does not rewrite attack bonuses, AC, saves, or skills. Until Phase 5.3 types `effects[]`, enter a manual override when a condition should change a derived number. Encumbrance penalties are the same: the sheet shows the load category and does not auto-write those penalties.

---

## 3. Core Mechanics & Nuances (Pathfinder 1E)

### Abilities: Score vs. `tempScore` vs. `tempModifier`
Pathfinder 1E distinguishes between temporary ability increases and temporary check modifiers:
- **Base Score:** Your permanent ability score (e.g., Strength 16).
- **`tempScore` (Score Bump):** Enhancements that directly modify the physical ability score itself (such as a *Belt of Giant Strength +4* or *Bull's Strength*). A `tempScore` recalculates your carrying capacity, bonus spell slots, and base modifier.
- **`tempModifier` (Check/DC Addend):** Adjustments that modify rolls or DCs based on that ability without altering the score (such as morale bonuses to attack or skill checks).

### Manual Overrides
If your table uses a custom house rule or a temporary bonus that the core sheet math does not anticipate, you can override any calculated value:
- Overrides are applied **last** in calculation order.
- Entering an override preserves your underlying base inputs so you never lose your underlying math when the temporary effect expires.

### Multiclassing & Progressions
In PF1e, multiclassing is first-class:
- Add multiple rows under the **Classes** section on the Identity tab.
- Base Attack Bonus (BAB), Fortitude, Reflex, and Will saves stack per class progression table (`full`, `threeQuarter`, `half` BAB; `good` or `poor` saves).
- Total character level is automatically derived from the sum of all class levels.

---

## 4. The Tools Sidebar

The collapsible sidebar rail beside the sheet provides companion tools that read your character sheet in real time:

### 1. Attack Helper (`shell.attack-helper`)
Helps you resolve attack sequences with physical dice:
- **Select Strike / Weapon:** Pick any equipped weapon or attack from your sheet.
- **Toggle Feats & Stances:** Check active tactical options (such as *Power Attack*, *Combat Expertise*, or *Deadly Aim*).
- **Live Output:** Instantly view your adjusted to-hit expressions, full iterative sequences (e.g., `+11/+6`), damage dice notation, and critical hit ranges.
- **Reminders:** Highlights what the attack triggers (e.g., potential attacks of opportunity) and what conditions it can inflict on the target.

### 2. Actions List (`shell.actions-list`)
A live board of tactical options based on your current combat status:
- Groups options by action economy (Standard, Move, Full-Round, Swift, Immediate, Free actions in PF1e; Actions and Reactions in PF2e).
- **Availability State:**
  - **Available:** Normal presentation.
  - **Hindered:** Usable with penalties (e.g., attacking while *grappled*).
  - **Unavailable (Greyed Out):** Automatically disabled when current conditions forbid them (e.g., movement actions greyed out with the reason `immobilized` or `paralyzed`).

### 3. Budget Calculator (`shell.budget-calculator`)
A downtime purchasing and crafting planner:
- **Shopping List:** Add items by name, price, and quantity.
- **Buy vs. Craft:** Compare purchasing at market price versus crafting from raw materials:
  - **Mundane Crafting:** Calculates raw material cost (typically ⅓ market price), required Craft DC, and estimated creation time.
  - **Magic Item Creation:** Calculates material cost (typically ½ market price), Spellcraft DC, required caster level, item creation feats, and required prerequisite spells.
- **Take 10 Hints:** Shows whether your skill total can meet the crafting DC by taking 10 outside of combat without risk of failure.
- **Purse Tracker:** Compares total project cost against your character's current carried gold.

### 4. Encyclopedia (`shell.encyclopedia`)
A read-only reference list on a Pathfinder First Edition sheet. It is not the Actions List.
- **Packed entries:** Spells, feats, and features that have a rules paragraph in the encyclopedia pack. Search by the catalog's English name.
- **Empty groups:** Afflictions and Actions stay visible when nothing is packed yet.
- The paragraph does not change the sheet's numbers.
