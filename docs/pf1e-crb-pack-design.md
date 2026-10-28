# PF1e Core Rulebook pack

**Status:** Locked. The pack is complete: every CRB class, player race, mundane weapon, armor, shield, feat (177), and spell (622) is packed. Do not open another CRB id batch.  
**Governs:** [`../content/pf1e/crb/`](../content/pf1e/crb/) and its lookups in `app/src/systems/pf1e/content/`.  
**Parent:** [`pf1e-character-sheet-design.md`](pf1e-character-sheet-design.md) §7, [ADR 0003](adr/0003-multi-system-product-direction.md), [ADR 0007](adr/0007-content-licensing.md).  
**History:** the batch-by-batch reviews (batches 1–21, W1–W7, F1–F4, S1–S5, with each CRB procedure check and verdict) are archived in [`archive/pf1e-crb-pack-batch-reviews.md`](archive/pf1e-crb-pack-batch-reviews.md).

This file keeps only the rules that still hold for anyone touching the pack, its resolver, or the sheet fields it stamps.

---

## 1. What the pack is

A curated **mechanics-only** catalog of Core Rulebook player options: ids, display names, and the numeric tags the sheet already uses. It is not a dump of the book. No class flavor, no feat benefit, no spell description, no Product Identity.

Rules prose lives in a separate pack, [`../content/pf1e/ogc/`](../content/pf1e/ogc/), joined by catalog id ([`sidebar-tools-encyclopedia.md`](sidebar-tools-encyclopedia.md)). The APG Summoner lives in its own pack ([`pf1e-apg-pack-design.md`](pf1e-apg-pack-design.md)). **`class.summoner` never goes in this folder.**

Small closed formulas stay **engine-owned**, not JSON tables: ability modifiers, BAB and save progressions, iterative attacks, AC / touch / flat-footed, CMB / CMD, size modifiers, and the Strength carrying-capacity table.

---

## 2. Pack layout

```text
content/pf1e/crb/
  README.md          # license / what is in this folder
  pack.json          # manifest
  classes.json       # HD/BAB/saves + class skills + skill points + spells/day (casters)
  races.json         # race id + name + size
  items.json         # weapon/armor/shield/gear ids + documentary stats
  feats.json         # feat id + name + category (all 177 CRB feats)
  features.json      # class feature id + name + source (Arcane Bond, Physical Enhancement, Telekinetic Fist)
  spells.json        # spell id + name + spellLevel (all 622 CRB spells)
```

A class row is not a class description. It is:

| Field | Why |
| --- | --- |
| `id` | `class.fighter`, `class.rogue`, … |
| `name` | Display label |
| `hitDie` | d10 / d6 / … |
| `babProgression` | `full` / `threeQuarter` / `half` |
| `saves.fort/ref/will` | `good` / `poor` |
| `skillPointsPerLevel` | Ranks per level before Int |
| `classSkills` | Seeded skill keys that stamp checkboxes. Craft/Perform/Profession wildcards are not listed |
| `spellsPerDay` | Optional 20×10 table. `null` cell = cannot cast yet; `0` = the table lists 0. Cleric omits the domain +1 |
| `source.book` | `"CRB"`. Page numbers stay omitted |

Id patterns: `class.<kebab>`, `race.<kebab>`, `weapon.<kebab>`, `armor.<kebab>`, `shield.<kebab>`, `item.<kebab>`, `feat.<kebab>`, `feature.<kebab>`, `spell.<kebab>`. Feat and spell ids are closed lists in [`pf1e-crb-feat-spell-ids.md`](pf1e-crb-feat-spell-ids.md) and [`pf1e-crb-feat-spell-ids.json`](pf1e-crb-feat-spell-ids.json) (read by Vitest). Do not invent ids outside that lock file.

---

## 3. License

[ADR 0007](adr/0007-content-licensing.md) and [`content-licensing.md`](content-licensing.md) govern.

- App code is MIT. This pack is curated game-mechanics numbers and labels.
- `pack.json` keeps `contentKind: "mechanics-only"` and `oglNoticeRequired: false`. The OGL 1.0a notice and Section 15 live with the prose in `content/pf1e/ogc/`, not here.
- No prose keys (`description`, `summary`, `benefit`, `flavor`, `text`, `body`, …). No Golarion gazetteer, Paizo branding, or adventure names.
- Do not scrape d20pfsrd, Archives of Nethys, Hero Lab, or Foundry dumps.
- [`licenseGate.test.ts`](../app/src/systems/pf1e/content/licenseGate.test.ts) enforces the forbidden keys, the Product Identity word list, and that `class.summoner` stays out.

---

## 4. Resolver

```ts
lookupCrbClass(id) → CrbClassProgression | null
applyCrbClassProgression(classRow, id) → ClassEntry
lookupCrbRace(id) → CrbRace | null
applyCrbRace(identity, id) → Identity
```

The same shape holds for items, feats, features, and spells.

- **Missing or unknown id → custom.** Isolate it to that row. Never throw, never reject the whole sheet.
- **Apply is a UI action**, run when the player picks a catalog row. Load does **not** re-apply the catalog; the saved row is authoritative.
- A class pick fills the class ref, `hitDie`, `babProgression`, `saves`, and `skillPointsPerLevel`, and stamps class-skill checkboxes from the union of all class rows (`stampClassSkills`). It leaves `levels` and favored-class totals alone.
- A race pick fills the race ref and stamps `identity.size` when the row has one. It does **not** rewrite ability scores or languages.

---

## 5. Standing locks

These came out of the batch reviews and still bind any change to the pack, the resolver, or the stamped fields.

### What stays typed on the sheet

| Area | Lock |
| --- | --- |
| Ability scores | Racial adjustments (Human +2 and the rest) stay typed into the score. `applyCrbRace` adds nothing. A `tempScore` raises carry; a `tempModifier` does not |
| Hit points | 1st-level max HD is not auto-written (the player types it or clicks **Max 1st**). HP feats such as Toughness stay favored/misc entries |
| Skills | A class pick stamps class-skill checkboxes and shows the rank pool. It never spends ranks. Human and favored-class ranks join the pool, not the skills |
| Armor and AC | Equipping catalog armor or a shield does not rewrite `armorClass`. Armor/shield/natural/deflection stacking is the player's job; there is no typed-bonus stacker |
| Attacks | Picking a weapon does not rewrite `attacks`, CMB, or reach. Weapon Special tags are documentary |
| Encumbrance | The sheet shows the load category. Load penalties to ACP and max Dex are not auto-written. Ignore weight opts out of the category, not the pounds |
| Feats | Feat picks are a documentary stamp of id, name, and category. Power Attack, Improved Initiative, and the rest do not change derived numbers |
| Spells | Spell picks stamp id, name, and `spellLevel`. Prepared lists, DCs, and remaining slots stay typed. Default Max slots come from the class table plus bonus spells; a typed number overrides it (ADR 0006 postscript) |

### Weapons, armor, and shields

| Lock | Rule |
| --- | --- |
| Scope | Core Rulebook Chapter 6 tables only |
| Quarterstaff | One 1d6 row, not split into a double-weapon pair |
| Double weapons | One row; the primary head is the stamped stats. `secondHead` is a documentary second set of numbers. Two-weapon attack rows wait |
| Composite bows | One row each. Strength rating stays typed or in notes; no `str-2` ids |
| Unarmed strike | Not an inventory catalog item. `weapon.gauntlet` and `weapon.locked-gauntlet` are |
| Shields | `kind: "shield"` stamps `ItemEntry.shield` and clears `armor` / `weapon`. Shield bash is not a weapon-table id |
| Ammo | `item.*` rows, quantity as the table's bundle |
| Magic and masterwork | A sheet overlay on the mundane row. A +1 longsword is still `weapon.longsword`. Never mint `-plus-1` ids or masterwork copies. Named magic items, if ever added, carry an optional `baseItemId` |

### Weapon properties

| Lock | Rule |
| --- | --- |
| Shape | `weapon.properties` is an array of **N** kebab-case tags: omit when empty, `["reach"]`, or `["reach", "trip", "disarm", "nonlethal"]`. Never a single enum field |
| Append | Adding a tag keeps the ones already there |
| Open enum | The schema does not close the list to the seven CRB tags (`reach`, `brace`, `trip`, `disarm`, `monk`, `nonlethal`, `double`). Magic properties (`flaming`, `keen`, …) go in the same array |
| UI | Inventory lists every tag and can add or remove any. A single-select property control is wrong |
| Combat | Tags do not change engine math (reach does not change threatened area) |

### Feats and spells

| Lock | Rule |
| --- | --- |
| Scope | Core Rulebook Chapter 5 feat table and Chapter 10 class spell lists only |
| Fields | `id`, `name`, and `category` or `spellLevel`. No prerequisites, benefit, or spell text |
| Spell level | The sorcerer/wizard level when the spell is on that list; otherwise the lowest CRB class-list level |
| Specialization | One row per feat. The weapon or school choice stays typed on the sheet (Weapon Focus (longsword)) |
| Class features | Armor Training, Arcane Bond, and similar go in `features[]` / `features.json`, not the feat catalog |

---

## 6. Tests

- Pack rows are checked against the published CRB tables, not against a second copy of the formula.
- New ids resolve; golden ids still resolve; applying a catalog row to an empty sheet leaves AC 10.
- New CRB content gets its own batch test file (`crbBatch*.test.ts`) rather than being folded into an existing one.
- From `app/`: `npx vitest run src/systems/pf1e`.
