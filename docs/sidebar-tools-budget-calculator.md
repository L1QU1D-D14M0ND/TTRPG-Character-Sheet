# Sidebar tool: Budget Calculator

> **Status:** **Landed** (2026-09-20). Implemented under `app/src/shell/sidebar/tools/budgetCalculator/`. Id: `shell.budget-calculator`.
> **When:** Shipped as the last character-sheet feature of Phase 1x (alongside Attack Helper and Actions List).
> **Host:** `docs/sidebar-host-design.md`. **Access:** `docs/adr/0005-sidebar-host.md`.

A shopping and crafting planner. The user lists gear, magic items, and other priced purchases, then compares **buying at market** versus **crafting some or all** of those lines. Crafting must show **material cost**, **time**, **DC**, and **requirements**, and must flag unmet requirements as short reasons (same spirit as Actions List).

No dice roller. The first slice may be **read-only** (numbers and reasons only). Optional later `update` may deduct gold or add crafted items to inventory — never required for 0.9.

---

## What it is

A **named later tool** (`shell.budget-calculator`) in the loaded-sheet sidebar.

The user builds a **shopping list** of priced items (weapons, armor, wondrous items, potions, scrolls, and similar). For each line they choose:

- **Buy** — pay market price (or a user-entered sale price).
- **Craft** — pay the crafting material cost, spend the listed time, and meet DC plus feat / caster-level / spell / skill requirements.

The tool totals:

| Total | Meaning |
| --- | --- |
| **Buy all** | Sum of market (or sale) prices for every line. |
| **Mixed** | Buy price for lines marked buy + craft material cost for lines marked craft. |
| **Craft all** | Craft material cost for every line that *can* be crafted; buy-only lines stay at market. |
| **Time** | Sum of craft time for lines marked craft (display as days / weeks; do not roll). |
| **Afford?** | Compare mixed (or selected) total to the sheet’s current gold (read `character.inventory` / wealth fields). |

Per crafted line, show **DC**, **time**, **requirements**, and **why this PC cannot craft it yet** when a check fails.

---

## What it is not

| Not | Why |
| --- | --- |
| A dice roller | Product lock. Take 10 / take 20 are **text** (“you may take 10 if not threatened”), never rolled here. |
| A magic-item generator | No random tables, no “roll a wand.” The user picks known items (catalog or typed name + price). |
| A GM economy simulator | No settlement availability, no Diplomacy to haggle as a live check. Optional later: a **sale %** field the user types. |
| Live `update` in the first slice | Deducting gp or adding the item to inventory is a **later** write. First slice computes and displays. |
| Shared PF1e / PF2e craft math | Fork. PF1e CRB Craft / magic-item creation versus PF2e Craft activity are different procedures. |

---

## Inputs (read)

From the loaded `CharacterDocument` (system-specific):

| Input | Why |
| --- | --- |
| Wealth / gp on the sheet | Affordability. PF1e: gold pieces on inventory or a dedicated purse field when it exists. PF2e: coins / bulk-valued items as the sheet stores them. |
| Caster level, spell list, feats | Magic-item creation requirements (e.g. Craft Wondrous Item, CL 5, *mage armor*). |
| Skill totals (Craft, Spellcraft, etc.) | Compare to DC; show “Spellcraft 11 vs DC 10” as text. |
| Size / class (optional later) | Some items have size-adjusted prices or class-only recipes. First slice can ignore. |

**List lines** (user-authored in the tool, not necessarily on the sheet yet):

| Field | Required | Notes |
| --- | --- | --- |
| Name | yes | Display label. |
| Catalog id | no | When a pack exists, resolve price / craft recipe from the pack. |
| Market price | yes if no catalog | gp (PF1e) or the system’s currency. |
| Quantity | yes | Default 1. |
| Mode | yes | `buy` or `craft`. |
| Craft recipe override | no | User-entered DC, time, material cost, requirements when the pack has no recipe. |

Until packs exist, **typed price + typed craft fields** are enough. Do not block the tool on a missing catalog.

---

## Outputs (display)

### Per line

| Field | Buy | Craft |
| --- | --- | --- |
| Line cost | Market × qty | Material cost × qty |
| Time | — | Recipe time × qty (or “one item / N days”) |
| DC | — | Craft or Spellcraft DC |
| Requirements | — | Feats, CL, spells, tools, skill ranks — listed, not hidden |
| Can craft? | — | Yes, or grey-style **short reasons** (see below) |
| Take 10 note | — | Text only, e.g. “Take 10 Spellcraft 21 vs DC 18” |

**Short reasons** (same tone as Actions List — a few words):

- `missing Craft Wondrous Item`
- `CL 3 < 5`
- `no mage armor on list`
- `Spellcraft 11 < DC 20` (or `need take 10` if 11+10 ≥ DC but raw total is not)
- `no formula` (PF2e)
- `not a craftable item` (unique plot item — stay on buy)

Do **not** invent house-rule shortcuts (no “half time if you have the feat twice”).

### Totals bar

- Buy-all gp, craft-all materials gp, mixed gp.
- Total craft days (and a one-line “at 8 hours/day” reminder if the recipe uses workdays).
- Remaining gold after mixed plan (may be negative — show the deficit; do not clamp).
- Count of craft lines blocked by requirements.

---

## Craft math (fork per system)

Packs and engine tables own the numbers. The tool **displays** them. Do not hard-code a second copy of CRB tables in the React tree.

### Pathfinder 1E (CRB player-facing)

Mundane Craft (weapons, armor, adventuring gear), typical CRB procedure:

| Piece | Typical CRB (display; pack may refine) |
| --- | --- |
| Material cost | About **⅓ of market price** |
| Check | Craft skill vs DC by item (e.g. DC 5 very simple, DC 10 typical, DC 15 martial / high quality, DC 20 exotic — **pack supplies the DC**) |
| Progress | gp-value per week (or per day for some jobs) from check result × DC; show the **formula and resulting days**, do not roll |
| Tools | Masterwork tools etc. as **requirements**, not silent bonuses unless the sheet already includes them in the skill total |

Magic item creation (wondrous, arms/armor, potions, scrolls, wands), typical CRB player-facing:

| Piece | Typical CRB (display; pack may refine) |
| --- | --- |
| Material cost | About **½ of market price** (plus any special component the recipe lists) |
| Time | About **1 day per 1,000 gp of market price** (minimum 1 day), or the specific item’s published time |
| Check | Often Spellcraft DC **5 + caster level**; some items use a different skill — pack says which |
| Feats | Craft Wondrous Item, Craft Magic Arms and Armor, Scribe Scroll, Brew Potion, Craft Wand, … |
| Caster level | Item CL vs the PC’s caster level (or the CL they choose to create at, if the recipe allows) |
| Spells | Required spells on the class list / prepared / known — pack lists them; tool checks the sheet’s spell list when present |
| XP cost | **No XP cost in PF1e** (CRB eliminated D&D 3.5e XP crafting costs; magic item creation costs only gp, time, feats, and Spellcraft/Craft checks). |

Potion / scroll / wand: use the published creation costs and times from the pack (they differ from wondrous-item ½ price). Do not collapse every magic item into one formula in the UI.

### Pathfinder 2E (when this tool is enabled for PF2e)

Typical Remaster Craft activity (pack confirms):

| Piece | Typical (display) |
| --- | --- |
| Materials | Usually **half** the Price in raw materials |
| Activity | **4 days** of downtime Craft, then a Craft check vs the item’s **level DC** |
| Success | After the check, pay the rest or continue crafting to reduce remaining cost — **show the published steps as text**, do not automate a campaign calendar |
| Formula | Required unless the item is trivial / the pack says otherwise |
| Skill | Crafting (or the skill the recipe names) |

Do not reuse PF1e ⅓-price / 1 day per 1,000 gp on a PF2e sheet.

### Unknown recipe

If the user marks **craft** but the pack has no recipe and they typed no override: the line stays in the list, cost is **blank or market**, and the reason is `no recipe`. Do not guess ⅓ or ½.

---

## Affordability

Read current wealth from the sheet. Compare to the **mixed** total (or the mode the user selected: buy-all / craft-all).

| Display | Rule |
| --- | --- |
| Can afford | remaining ≥ 0 |
| Short | show `short 250 gp` (or the system’s currency) |
| Craft blocked | even if gold is enough, still list requirement reasons — gold and feats are independent |

Do not auto-sell inventory to raise gold.

---

## Writes (later, optional)

| Write | When allowed |
| --- | --- |
| Deduct gp | User confirms “apply this purchase.” Host `update`. |
| Add item to inventory | Same confirmation. Use the system inventory shape (`pounds` vs `bulk`). |
| Add feat / formula | Out of scope (item creation feats are character-build, not shopping). |

First implementation: **no writes**. Copy totals to notes is optional later, not required.

---

## Host wiring

| Piece | Value |
| --- | --- |
| Tool id | `shell.budget-calculator` |
| Slot | Named tool in the loaded-sheet sidebar |
| Access | `SidebarToolContext` — `character`, `derived`, `update` (update unused until apply-purchase) |
| Systems | PF1e first (priced adventuring + magic items). PF2e when that sheet’s inventory/wealth is stable. |

Empty sidebar until this id is registered in code. Spec-only until the last-sheet-feature window.

---

## Tests (when implemented)

| Case | Expect |
| --- | --- |
| Buy-only list | Mixed total = sum of market prices. Time 0. No DC column required. |
| Craft all mundane | Materials ≈ ⅓ market (or pack value); time and Craft DC from pack; remaining gold = purse − materials. |
| Craft all wondrous | Materials ≈ ½ market; days ≈ market/1000; Spellcraft DC 5+CL; feat + CL + spell reasons when missing. |
| Mixed | One buy + one craft: mixed = market(buy) + materials(craft). |
| Missing feat | Line cost still shown; `canCraft` false; reason `missing Craft Wondrous Item`. |
| CL too low | Reason `CL 3 < 5` (or the pack’s CL). |
| No recipe | Reason `no recipe`; do not invent ⅓ price. |
| PF2e sheet | Half materials + 4-day activity + level DC + formula; **not** PF1e 1 day / 1,000 gp. |
| Apply purchase (later write) | Gold decreases; item appears in inventory; undo restores both. |
| Golden Fighter 2 / Wizard 3 | CL 3, Spellcraft 11: a CL 5 wondrous item is blocked on CL (and feat if they lack it); a DC 10 Craft they can take 10 on may show as text, not a roll. |

Do not assert house-rule “craft overnight” or auto take 20.

---

## Relationship to other tools

| Tool | Relationship |
| --- | --- |
| Attack Helper | After you buy/craft a weapon, Attack Helper uses it. Budget Calculator does not preview attack math. |
| Actions List | Crafting **in combat** is usually not an action on that list. Downtime Craft is this tool. Shared idea: short reasons for “you cannot.” |
| Inventory tab | Source of current gear and, later, destination of applied purchases. |

---

## Out of scope (this tool)

- Rolling Craft or Spellcraft.
- Settlement item availability / “the shop doesn’t have it.”
- Generating random treasure.
- Pathfinder Society chronicle gold (unless a later pack adds it).
- Editing the character’s Craft skill ranks (that stays on the Skills tab).

---

## Appendix — Document history

| Date | Change |
| --- | --- |
| 2026-08-17 | Named later tool: Budget Calculator; buy vs craft (cost, time, DC, requirements); no dice |
| 2026-09-20 | Tool landed for both PF1e and PF2e (`shell.budget-calculator`) under `app/src/shell/sidebar/tools/budgetCalculator/` |
| 2026-09-22 | i18n parity and pre-release hygiene landed |
| 2026-09-26 | Docs correction: remove 3.5e XP crafting cost artifact (PF1e magic item creation has no XP cost) |
