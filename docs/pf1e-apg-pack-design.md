# PF1e Advanced Player’s Guide pack (1.0 Synthesist)

**Status:** Synthesist golden landed (Half-Elf Radiant Striker). Slice 4 landed (Summoner spellsPerDay + 27 APG spells). Spanish UI catalog landed (`es.json`). **1.0 landed.**  
**Parent:** [`pf1e-character-sheet-design.md`](pf1e-character-sheet-design.md) decisions 16 and 20, [ADR 0007](adr/0007-content-licensing.md)  
**On disk:** [`../content/pf1e/apg/`](../content/pf1e/apg/)  
**Code:** `app/src/systems/pf1e/content/apgPack.ts` (apply reuses the CRB class path)  
**Golden:** [`../fixtures/characters/golden/pf1e/synthesist-5.json`](../fixtures/characters/golden/pf1e/synthesist-5.json)

This pack is **not** the CRB folder. **Never** add `class.summoner` to `content/pf1e/crb/`.

---

## License

Mechanics-only until rules text ([ADR 0007](adr/0007-content-licensing.md), [`content-licensing.md`](content-licensing.md)). That prose is Phase 5.1, in the same change as the OGL notice ([`phase-5.md`](phase-5.md)).

- Ids, names, HD / BAB / save tags, class-skill keys, skill points per level.
- No class flavor, eidolon prose, evolution **text**, or spell descriptions.
- `pack.json` has `contentKind: mechanics-only` and `oglNoticeRequired: false`.
- Vitest [`licenseGate.test.ts`](../app/src/systems/pf1e/content/licenseGate.test.ts) scans this folder with the CRB pack.

---

## Slice 1 — Summoner class + Synthesist name

**Pairing:** Catalog id for Summoner using the same row shape as CRB classes. Documentary Synthesist archetype (id + name).

**Already in the app:** Identity class select, `applyCrbClassProgression`, class-skill stamp, skill-rank pool, stacked BAB/saves. Unknown ids still resolve to custom.

**In this slice:**

| Piece | What landed |
| --- | --- |
| Pack | `content/pf1e/apg/classes.json` one row: `class.summoner` / Summoner / d8 / ¾ BAB / poor Fort, poor Ref, good Will / 2 skill points / APG class skills (no Craft/Profession wildcards) |
| Pack | `archetypes.json` one row: `archetype.synthesist` / Synthesist / `classId: class.summoner` |
| Apply | Picking Summoner stamps HD/BAB/saves/skill points and class-skill checkboxes. Does **not** add a spellcasting entry, features, or fused scores |
| Archetype | Optional `classes[].archetype` ContentRef. Stamps name only. Leaving Summoner clears it |
| Lookup | `lookupCrbClass('class.summoner')` stays null. `lookupApgClass` finds it |

**Out:** Fused STR/DEX/CON overlay, costume HP, evolution rows, Summoner spell list, Magical Child / other APG classes, a Synthesist golden, Spanish.

---

## Slice 2 — documentary evolutions + fused overlay

**Pairing:** Evolution catalog ids (name stamp only) plus a fused STR/DEX/CON overlay and costume HP on the same sheet.

**In this slice:**

| Piece | What landed |
| --- | --- |
| Pack | `evolutions.json` — ids and names only (Bite, Claws, …). No point costs, no evolution text |
| Schema | `companions[]` may use `kind: eidolon` with optional `fused` and `evolutions[]`. No `schemaVersion` bump |
| Apply | Picking an evolution stamps id/name. Does **not** write fused scores, costume HP, natural armor, or attacks |
| Compute | While `fused.active`, physical ability mods, Fort, carry, dead-at, and `maxHp` use the overlay. Pilot scores stay on `abilities`. HD max stays on `derived.pilotMaxHp` |
| UI | Identity shows the overlay when Synthesist is selected. Abilities inputs remain the pilot |

**Out:** Auto-applied evolutions, Summoner spell list, Magical Child, a Synthesist golden, Spanish.

---

## Slice 3 — Synthesist golden

**Pairing:** One table fixture that uses slice 1 + 2 together.

**In this slice:**

| Piece | What landed |
| --- | --- |
| Fixture | `fixtures/characters/golden/pf1e/synthesist-5.json` — Half-Elf Radiant Striker, Summoner 5 Synthesist, fused overlay on, documentary evolutions |
| Honesty | Race is custom Half-Elf (Human catalog only). Fused STR/DEX/CON and costume HP are typed. Ability Increase / Flight / Improved Natural Armor do not write scores, speeds, or AC. Pounce is a custom name. Summoner spells are typed rows (no APG spell catalog). Summoner stays out of CRB |
| Tests | `synthesist5.golden.test.ts` plus schema Load and APG pack assertions |

**Out:** Auto-applied evolutions, Summoner spell list, Magical Child, Spanish.

---

## Slice 4 — Summoner spellsPerDay + spell catalog

**Pairing:** Summoner Table 2-8 spells-per-day progression and curated APG Summoner spell catalog (mechanics-only).

**In this slice:**

| Piece | What landed |
| --- | --- |
| Pack | `content/pf1e/apg/classes.json` — 20-level × 10-spell-level `spellsPerDay` table for `class.summoner` matching standard 6-level spontaneous progression. |
| Pack | `content/pf1e/apg/spells.json` — 27 mechanics-only APG Summoner spells (levels 1–6: Ant Haul, Rejuvenate Eidolon Lesser/Normal/Greater, Evolution Surge Lesser/Normal/Greater, Summon Eidolon, Pit spells, etc.). |
| Lookup / Apply | `lookupApgSpell`, `applyApgSpell`, and cross-pack `applySpell` in `app/src/systems/pf1e/content/`. |
| Picker | `CatalogPicker` groups spells under Core Rulebook and Advanced Player's Guide optgroups. |
| Golden | `synthesist-5.json` stamps catalog IDs for `spell.mage-armor`, `spell.shield`, `spell.rejuvenate-eidolon-lesser`, `spell.summon-eidolon`. |

**Out:** Auto-applied evolutions, other APG classes (Magical Child, etc.).

---

## Later slices (not this change)

Auto-applied evolutions and other APG classes wait for subsequent increments. Spanish UI lives in `app/src/locales/es.json`, not this pack.

---

## Document history

| Date | Change |
| --- | --- |
| 2026-08-18 | Slice 1: Summoner catalog + Synthesist name stamp; fused overlay waits |
| 2026-08-19 | Slice 2: documentary evolution names + fused STR/DEX/CON overlay and costume HP |
| 2026-08-19 | Slice 3: Synthesist golden (Half-Elf Radiant Striker) |
| 2026-08-19 | Spanish UI catalog landed outside this pack (`es.json`) |
| 2026-08-19 | 1.0 stability; this pack unchanged |
| 2026-08-19 | Summoner spell catalog / other APG classes sequenced in the First Edition finish, not leftover PF2e |
| 2026-09-03 | `pack.json` status slice-3 (golden already landed). Next code is honesty/code fixes; APG follow-through waits |
| 2026-09-20 | Slice 4: Summoner spellsPerDay table + APG Summoner spell catalog (27 spells); synthesist-5 golden stamped |

