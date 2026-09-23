# PF1e character JSON schema — design notes

**Status:** Implemented. Contract: [ADR 0006](adr/0006-pf1e-character-schema.md), [`schemas/pf1e/character.schema.json`](../schemas/pf1e/character.schema.json).  
**Parent lock:** [ADR 0003](adr/0003-multi-system-product-direction.md), [`pf1e-character-sheet-design.md`](pf1e-character-sheet-design.md)  
**Shared envelope / refs:** [`shared-kernel-design.md`](shared-kernel-design.md)  
**PF2e schema (unchanged):** [`character.schema.json`](../schemas/character.schema.json), [ADR 0002](adr/0002-character-schema.md)

Do not extend the PF2e schema with optional 1E fields. PF1e has its own document type.

---

## Envelope

```json
{
  "schemaVersion": 1,
  "system": "pf1e",
  "meta": { "createdAt": "", "updatedAt": "", "appVersion": "", "locale": "en" }
}
```

- `system` is required `"pf1e"`.
- `schemaVersion` is the **PF1e** document version (starts at 1). Independent of PF2e’s `schemaVersion`.
- Save omits `derived`.
- `overrides` map for manual totals; `extensions` bag for experiments.

---

## Design principles

1. **One file = one PC.** Familiars/companions are a stub array (not in 0.9 UI).
2. **Inputs + play state are authoritative.**
3. **Multiclass is normal.** Identity is `classes[]`, not a single `identity.class`. `identity.level` is **not stored**; level is derived from the class sum.
4. **User-entered where tables are large or play-state** (HD rolled, slot remaining). **Engine-owned where tables are small** (BAB/save/HD types, ability modifiers, iterative steps, encumbrance thresholds). **Hybrid** for class spells per day: computed default Max, click to override.
5. **`effects[]` on rows** for later automation; unknown `type` ignored.
6. **No campaign-options block** in 0.9.

---

## Locked field names (schema v1)

See the JSON Schema for types. Summary:

| Area | Fields |
| --- | --- |
| Identity | `characterName`, `playerName`, `race`, `size` (includes Fine/Diminutive/Colossal), `alignment`, `deity` (string), `xp`, `languages` |
| Classes | `id`, `class` ContentRef, `levels`, `hitDie`, `babProgression` (`full` / `threeQuarter` / `half`), `saves` good/poor, `favored.hp` / `favored.skillRanks`, optional `archetype` ContentRef, optional `arcaneSchool` (`{ specialized, opposition[] }`) (documentary) |
| Abilities | `score` + optional `tempScore` (score addend) + optional `tempModifier` (check/DC addend) per key |
| Vitals | `hpRolled[]` (before Con), `currentHp` (may be negative), `tempHp`, `nonlethal`, speeds/senses |
| AC | explicit `armorBonus`, `shieldBonus`, `natural`, `deflection`, `dodge`, `other`, `maxDex` (null = no cap), `armorCheckPenalty` (≤ 0) |
| Combat misc | initiative / melee / ranged / CMB / CMD / save misc |
| Skills | `key` kebab **without dots**, `ranks`, `classSkill`, `armorPenaltyApplies`, `misc`. Optional `classes[].skillPointsPerLevel` (catalog fallback). |
| Attacks | snapshot rows; engine adds BAB + ability + size |
| Inventory | `pounds`, location `equipped\|carried\|stowed\|dropped` (dropped excluded from weight), optional `ignoreWeight` |
| Play | `dailyResources` only — no hero points, no dying track |

ContentRef is `{ id, name }` plus optional `source`. No Remaster/legacy fields.

Skill keys must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` so `derived.skillTotals.<key>` overrides parse (use `knowledge-arcana`, not `knowledge.arcana`).

---

## Auto-seed skills (factory)

Seed CRB skills that are not wildcard Craft/Perform/Profession:

`acrobatics`, `appraise`, `bluff`, `climb`, `diplomacy`, `disable-device`, `disguise`, `escape-artist`, `fly`, `handle-animal`, `heal`, `intimidate`, `linguistics`, `perception`, `ride`, `sense-motive`, `sleight-of-hand`, `spellcraft`, `stealth`, `survival`, `swim`, `use-magic-device`, plus Knowledge (`arcana`, `dungeoneering`, `engineering`, `geography`, `history`, `local`, `nature`, `nobility`, `planes`, `religion`).

User adds `craft-*`, `perform-*`, `profession-*` like PF2e lore.

---

## Engine notes (0.9 martial)

- Modifier = `floor((score + tempScore − 10) / 2)` + `tempModifier`.
- `tempScore` feeds bonus spells and Strength carrying capacity. `tempModifier` does not.
- BAB/saves stack **per class row** (do not add levels then apply one table).
- Iteratives: extra attacks when BAB ≥ 6, −5 steps, max four from BAB. Display as a CRB slash line (`+6/+1`). **Fighter 5 is +5 only**, not +5/+0.
- HP: each `hpRolled` entry contributes `max(1, roll + Con mod)`, plus favored-class HP totals. The player types each HD result in the Max HP breakdown dialog (physical dice).
- AC: Dex bonus capped by `maxDex`; Dex **penalties** still apply when flat-footed; dodge is lost when flat-footed. Touch omits armor/shield/natural. CMD uses dodge + deflection, not armor. Full review is batch 3.
- CMB: `BAB + STR + special size + misc`. CMD: `10 + BAB + STR + DEX + special size + dodge + deflection + misc`.
- Load: CRB Strength heavy-load table × size multiplier; light/medium = floor(heavy/3) and floor(2×heavy/3). Load penalties are not auto-applied to ACP / max Dex. `inventory.ignoreWeight` sets load category to `ignored` (pounds still sum).
- Item armor/weapon subfields are documentary in 0.9; combat numbers come from `armorClass` / `attacks`.
- Unknown `effects[]` are ignored (not read).

---

## Content id convention

```text
race.human
race.elf
class.fighter
class.wizard
class.summoner
archetype.synthesist
feat.power-attack
spell.fireball
skill.perception
skill.knowledge-arcana
weapon.longsword
armor.chainmail
condition.sickened
```

Catalog ids may contain `.` as a namespace separator (`class.fighter`). **Skill keys on the sheet** cannot (`knowledge-arcana`, never `knowledge.arcana`) so `derived.skillTotals.<key>` overrides stay unambiguous. The catalog id for a Knowledge skill is `skill.knowledge-arcana`, matching the sheet key after the `skill.` prefix.

---

## Locked-for-now schema choices

| Topic | Decision |
| --- | --- |
| Weight | Pounds as numbers (allow 0.5 for light items). No bulk |
| Ability input | Final **score**, not PF2e boosts |
| BAB | Derived from class progressions; not a user total unless override |
| Spell slots | Default Max from class table + bonus; `max` null uses that default. Remaining stays user-entered |
| Focus / hero points | Omit from 0.9 PF1e document |
| Dying track | Omit; `currentHp` may be negative |
| Dual schema | Never store a PF1e character inside the PF2e schema |
| Level cap | No hard maximum in schema |

---

## Next implementation steps

1. ~~Schema ADR + `schemas/pf1e/character.schema.json` + TypeScript types.~~
2. ~~Empty-sheet factory with seeded skills.~~
3. ~~`compute()` for abilities, BAB, saves, HP, AC trio, CMB/CMD, iteratives, skills, weight.~~
4. ~~Fighter 5 golden.~~
5. ~~Spell DC + slots editor + Wizard 5 golden (Phase 2e).~~
6. ~~Multiclass golden (Phase 3e).~~
7. ~~Phase 3c CRB pack in batches of two mechanics ([`pf1e-crb-pack-design.md`](pf1e-crb-pack-design.md)). All 177 CRB feats, 622 CRB spells (Batches S1–S5), and 8 golden characters landed. APG follow-through (Summoner `spellsPerDay` + 27 spells) landed. Phase 1x honesty / code fixes landed.~~

Sidebar **tools** (Attack Helper, Actions List, Budget Calculator) have landed for both PF1e and PF2e.

---

## Document history

| Date | Change |
| --- | --- |
| 2026-08-17 | Initial target notes (no on-disk schema yet) |
| 2026-08-17 | ADR 0006 + on-disk schema; field names locked |
| 2026-08-17 | Phase 2e: spell DC + bonus slots in compute |
| 2026-08-17 | Phase 3e: Fighter 2 / Wizard 3 golden |
| 2026-08-17 | Phase 3c batch 1: ability modifiers + BAB/saves |
| 2026-08-17 | Phase 3c batch 2: HP breakdown dialog + iterative slash notation |
| 2026-08-17 | Point next schema/pack work at annotated CRB batches 3–10 |
| 2026-08-17 | Catalog ids vs skill keys: `skill.knowledge-arcana`, not `knowledge.arcana` |
| 2026-08-17 | Optional `tempScore` (score addend); `tempModifier` remains a check/DC addend |
| 2026-08-18 | Optional `ignoreWeight`; load category may be `ignored` |
| 2026-08-18 | Phase 3c batch 13: golden spell catalog ids; slots/DCs stay typed |
| 2026-08-18 | Phase 3c batch 7: spell DC + bonus-spells table; slots stay typed |
| 2026-08-18 | App IndexedDB draft + PWA build verify |
| 2026-08-18 | OGL / PI review: mechanics-only CRB pack; no Section 15 until rules text |
| 2026-08-18 | Optional `classes[].archetype`; APG slice 1 Summoner catalog |
| 2026-08-19 | Optional eidolon companion fused overlay + documentary evolutions |
| 2026-08-19 | Synthesist golden (Half-Elf Radiant Striker) |
| 2026-08-19 | Spanish UI catalog (`es.json`); pack names stay English |
| 2026-08-19 | 1.0 stability; Save stamps `meta.locale` |
| 2026-08-19 | CRB batch 14: remaining player races + optional catalog `size`; ability adjustments stay typed |
| 2026-08-27 | CRB batch 15: `slots[].max` nullable; default Max is class table + bonus |
| 2026-09-03 | Next code is honesty/code fixes; sidebar tools are the last character-sheet feature |
| 2026-09-12 | Optional `classes[].arcaneSchool` (`specialized` + `opposition[]`); Wizard 7 playtest golden |
| 2026-09-22 | Phase 1x honesty / code fixes, CRB feats/spells catalog completion, APG follow-through, and sidebar tools landed |
