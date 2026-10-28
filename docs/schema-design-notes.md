# Character JSON schema — design notes (Pathfinder 2E)

**Schema:** [`../schemas/character.schema.json`](../schemas/character.schema.json)  
**Example:** [`../fixtures/characters/minimal.example.json`](../fixtures/characters/minimal.example.json)  
**schemaVersion:** `1`  
**Status:** Locked. Schema decisions for **PF2e** documents (v1.1 amendments; still `schemaVersion: 1`). PF1e has its own schema ([`pf1e-schema-design-notes.md`](pf1e-schema-design-notes.md)). Optional `system: "pf2e"` landed: Load without it is PF2e; Save writes `pf2e`.

---

## Design principles

1. **One file = one PC.** Companions are nested subsets, not separate top-level files.
2. **Inputs + play state are authoritative.** `derived` is optional cache and **must be omitted from Save sheet**.
3. **Remaster-first refs** via `ContentRef` (`id`, `name`, `rulesetSource`, optional `legacyId`).
4. **`effects[]` on most rows** for post-1.0 automation; empty in 0.9 is fine; unknown `type` values must be ignored.
5. **`overrides`** map for manual totals without destroying inputs.
6. **`extensions`** bag for experimental fields without bumping `schemaVersion` every time.
7. **No `campaignOptions`** (Free Archetype omitted per product lock).

---

## Locked schema decisions

| Topic | Decision |
| --- | --- |
| Bulk / light items | **Decimals** — `1` = 1 Bulk, `0.1` = 1L |
| Attribute boosts | **User enters final boosts** — no automatic partial-boost pairing in 0.9/1.0 (`kind: "partial"` reserved) |
| Skills on new sheet | **Auto-seed** the standard skills; later auto-fill ranks from class/feats/etc. |
| Strikes vs items | **Snapshot** from item at link/refresh time; `itemId` retained; no live auto-mutate |
| Spellcasting entries | Used for class spellcasting (including class innate/focus as applicable) |
| Focus pool | **One shared pool** on `play` |
| Companions | **Subset sheet** is enough for 0.9/1.0 |
| Content ids | Kebab-case path ids (see below) |
| Level | **No hard upper cap** (`minimum: 1` only) |
| `derived` on Save | **Omit** from Save sheet exports |

### Content id convention

```text
ancestry.human
heritage.skilled-human
class.fighter
feat.power-attack
spell.heal
condition.frightened
weapon.longsword
armor.chain-mail
skill.athletics
lore.warfare
```

### Standard skills to auto-seed

`acrobatics`, `arcana`, `athletics`, `crafting`, `deception`, `diplomacy`, `intimidation`, `medicine`, `nature`, `occultism`, `performance`, `religion`, `society`, `stealth`, `survival`, `thievery`  
(plus user-added `lore:*` rows)

---

## Scaffold decisions (locked)

| Topic | Decision |
| --- | --- |
| UI framework | **React** + TypeScript |
| Save file extension | **`.json`** |
| App display name | **TTRPG Character Sheet** in chrome (Phase M landed; ADR 0003 / ADR 0008) |

### Soft follow-up (not blocking)

- **Ancestry-only innate spells** (no class spellcasting): same `spellcasting[]` entry pattern is available when needed; not required for every ancestry at seed time.
- Decimal bulk float noise: engine should round/compare carefully (e.g. work in tenths internally).

---

## Known issues / risks

### I1 — Blank drafts vs complete characters

Empty `ContentRef.name` values are schema-valid for new sheets. “Ready to play” checks belong in app logic (or a future stricter schema).

### I2 — Decimal bulk float noise

Prefer internal integer tenths when summing; persist decimals per decision.

### I3 — Override path grammar

`overrides` keys are free-form (`derived.ac.total`, etc.). Document paths in code; optionally validate known paths in-app.

### I4 — Open `effects` types

Unknown `type` values must be ignored by the resolver.

### I5 — No dual-class model

PF2e Dual Class (campaign option) remains out of scope; use feats/features/`extensions` if needed. This is **not** PF1e free multiclassing, which is in scope on the PF1e document ([PF1e design](pf1e-character-sheet-design.md)).

### I6 — Class-specific resources

Kineticist / inventor / etc. use `play.dailyResources`, feats/features, or `extensions` until specialized UI exists.

### I7 — Remaster rune names in item stats

Legacy rune names map in content fallback, not alternate schema enums.

### I8 — Cross-references

`equippedArmorItemId` → `inventory.items[].id` enforced in app, not JSON Schema.

---

## Deferred

- Campaign flags, card UI metadata, sidebar **tool** caches (host is session UI; catalogs are content packs)  
- Foundry/Pathbuilder mappings, dice roller, multi-character library  
- Automatic partial-boost pairing, live strike sync from items  

---

## Next implementation steps

PF2e leftover editors/goldens/content wait for a **later PF2e release** ([roadmap](ROADMAP.md) Phase 1x). Remaining PF2e notes:

1. ~~TypeScript types mirrored from the schema.~~  
2. ~~Empty-sheet factory: auto-seed 16 skills; `schemaVersion: 1`.~~  
3. ~~Save sheet serializer that strips `derived`.~~  
4. ~~Validate Load and Save against `schemas/character.schema.json`.~~  
5. ~~Core calc engine + Fighter 5 golden.~~ Wizard 5, Bard 5, Cleric 5, and Ranger 5 goldens exist; remaining PF2e golden is the PC2 smoke test (later release).  
6. Companion nested-sheet editor still missing (Ranger 5 golden stores the nested sheet; editor waits for the later PF2e release).  
7. PF2e panel literals remain English (later PF2e *release*). Chrome + PF1e catalogs use `en.json` / `es.json`.  
8. IndexedDB one-key draft **landed** (app-level; not a character library).

S1/S4 record: [`continuation-design.md`](archive/continuation-design.md).  
Historical PF2e increment: [`next-increment-design.md`](archive/next-increment-design.md).  
Current sequencing: [`next-increment-multi-system.md`](archive/next-increment-multi-system.md).

---

## Document history

| Date | Change |
| --- | --- |
| 2026-08-13 | Schema v1 lock notes |
| 2026-08-17 | Relabeled PF2e-only; point leftover work at ADR 0003 sequencing |
| 2026-08-19 | Bard 5 golden exists; remaining leftover PF2e goldens deferred |
| 2026-08-19 | Cleric 5 golden exists; remaining leftover is companion user + PC2 class |
| 2026-08-19 | Ranger 5 golden + `computeCompanion`; remaining leftover is PC2 class; companion editor still missing |
| 2026-08-19 | Remaining PF2e leftover waits for a later release; finish First Edition first |
| 2026-09-03 | Chrome title is TTRPG Character Sheet; IndexedDB draft and PF1e/chrome i18n landed |
