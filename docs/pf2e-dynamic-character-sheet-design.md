# Pathfinder Second Edition — Dynamic Character Sheet Design

**Status:** **System specification** for Pathfinder Second Edition (still valid). App-level product direction is [ADR 0003](adr/0003-multi-system-product-direction.md) / [`ttrpg-character-sheet-design.md`](ttrpg-character-sheet-design.md): multi-system PWA, **finish PF1e this release**, this PF2e slice **preserved**. Remaining PF2e goldens/content wait for a **later release**.  
**Implementation:** PF2e Phase 1–2 scaffold exists (S1 Fighter 5, T1 Wizard 5, leftover Bard 5 / Cleric 5 / Ranger 5 goldens, T3 form editors, S4 validation). Companion editor, remaining PC2 golden, content packs, and PF2e panel i18n catalogs wait for a later PF2e *release*.  
**Sequencing:** [`next-increment-multi-system.md`](next-increment-multi-system.md) (current). Historical: [`next-increment-design.md`](next-increment-design.md), [`continuation-design.md`](continuation-design.md).  
**Repo context:** npm package `ttrpg-character-sheet`; GitHub [`TTRPG-Character-Sheet`](https://github.com/L1QU1D-D14M0ND/TTRPG-Character-Sheet) (renamed from `Pathfinder-2E-Card`, [ADR 0008](adr/0008-repo-package-rename.md))  
**Audience:** Product / engineering  
**Ruleset target:** Pathfinder Second Edition — **Remaster-first**, legacy fallback when Remaster data is missing or errors

---

## 1. Purpose

Build a **dynamic character sheet** for **players** that can create, edit, recalculate, and **persist all information needed to play** Pathfinder Second Edition (PF2e) locally on desktop and mobile.

This document is the **PF2e system spec**. The app is a multi-system sheet ([umbrella design](ttrpg-character-sheet-design.md)); PF1e is specified separately.

“Dynamic” means dependent values update when inputs change (level, attributes, proficiency, gear, etc.). “Complete” means the saved character covers player-facing sheet domains needed at the table.

---

## 2. Locked decisions

| # | Topic | Decision |
| --- | --- | --- |
| 1 | Platform | **Installable PWA** — runs locally/offline after install; mobile-compatible |
| 2 | UI (placeholder) | **Spreadsheet / Excel-like** — dense grids, tabs/sheets, plain inputs |
| 3 | Ruleset | **Remaster when possible**; **legacy fallback** on missing data or errors |
| 4 | Calc depth (1.0) | **Core calculations only**; architecture expandable to complex feat/spell/mechanic effects |
| 5 | Content books | **Player Core + Player Core 2** only (player-facing). **No GM-exclusive** content |
| 5a | Content acquisition | **Hybrid** — curated hand-maintained pack first; optional attributed open/ORC import pipeline later |
| 5b | Sidebar | **Host** on loaded sheet (app-level, ADR 0005). Spells / Afflictions / Actions encyclopedia is a **future tool**, not the host |
| 6 | Persistence | **One sheet at a time** + **Save sheet** / **Load sheet** (local files). No multi-character library, no cloud |
| 7 | Character types | **All** player character types in the data model |
| 8 | Modes | **Build and Play** |
| 9 | UX polish | **Lightweight** — no fancy UI or animations |
| 10 | Interop | **No** Pathbuilder / Foundry import-export for now |
| 11 | Dice | **No** dice roller |
| 12 | Language | **English for 0.9**; **Spanish for 1.0** (i18n-ready strings from the start) |
| 13 | Stack | **TypeScript + React** |
| 14 | License | **MIT** |
| 15 | Campaign / house rules | **Omit** optional flags (e.g. Free Archetype) in 0.9/1.0 — extra feats entered as custom rows if needed |
| 16 | Golden tests | **Fighter 5 and Wizard 5 required regressions.** Bard 5, Cleric 5, and Ranger 5 landed. Remaining proposed set in §12 waits for a **later PF2e release** |
| 17 | Save extension | **`.json`** |
| 18 | App display name | Chrome is **TTRPG Character Sheet** (Phase M landed). Historical PF2e-only title is retired. |

See also: [ADR 0001](adr/0001-product-direction.md) (superseded), [ADR 0003](adr/0003-multi-system-product-direction.md) (current).

---

## 3. Goals and non-goals

### Goals by milestone

The **app** 0.9/1.0 bars are defined in the [umbrella design](ttrpg-character-sheet-design.md) (PF1e playable + this slice non-regressed). The list below is the **PF2e system** target, including work that is now **later**.

**PF2e slice that must keep working (app 0.9)**

- Spreadsheet Build + Play for the current editors.
- Core calcs + Fighter 5, Wizard 5, Bard 5, Cleric 5, and Ranger 5 goldens.
- Save / Load of PF2e documents (with `system: "pf2e"` after Phase M).

**Full PF2e catalog (later PF2e *release*)**

- Remaster-first / legacy fallback.
- Remaining goldens in §12; companion nested editor.
- Player Core + Player Core 2 catalog enough to rebuild those goldens.

**1.0 (app)**

- Spanish localization (shared catalogs).
- Still core calcs only.

**Later (design must not block)**

- **Sidebar tools** when specified. Candidate: Spells / Afflictions / Actions (combat maneuvers, etc.).
- Typed `effects[]` automation for feats/spells/items.
- Optional card-oriented play surfaces.

### Non-goals

- GM-only tools, encounter building, secret NPC stat blocks, or GM Core–exclusive data.
- Cloud sync, accounts, VTT replacement, dice roller.
- Fancy UI / animations in the placeholder phase.

---

## 4. What “complete character data” means

Save **inputs** and **session state**; **derived** fields may be cached but must be recomputable.

### 4.1 Identity & campaign

| Field | Notes |
| --- | --- |
| Character name, player name | |
| Level, XP | |
| Ancestry, heritage, background, class, subclass/doctrine/etc. | Remaster IDs preferred; legacy IDs as fallback |
| Size, traits, languages, deity (if any) | |
| Edicts/anathema or legacy alignment (table-optional) | Configurable |
| Campaign notes, appearance, personality | Free text |

### 4.2 Attributes

- Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma.
- Boost/flaw **sources** stored for auditability.
- Remaster attribute model primary; legacy score display optional for fallback characters.

### 4.3 Proficiencies

- Perception; Fortitude / Reflex / Will.
- Class DC; spell attack & spell DC (multiple traditions/sources allowed).
- Armor & weapon category proficiencies.
- All skills + dynamic Lore list.
- Ranks: Untrained / Trained / Expert / Master / Legendary.
- Slots for item / status / circumstance modifiers (1.0 sums simple cases).

### 4.4 Defenses & vitality

- Max HP, current HP, temporary HP, dying / wounded / doomed.
- AC breakdown (armor, Dex cap, proficiency, item, etc.).
- Resistances, immunities, weaknesses (player-facing).
- Speeds, senses.

### 4.5 Offense

- Melee / ranged / unarmed strikes.
- Spell attack rolls and save DCs.
- Class DC for class abilities.

### 4.6 Feats, features, actions

- Ancestry, heritage, background, class, skill, general, archetype feats.
- Class features by level.
- Granted actions/reactions (summary text in 0.9/1.0).
- Focus spells & focus pool.

**0.9/1.0:** structured records + free-text effects; no auto-application of arbitrary mechanical text.  
**Later:** optional typed `effects[]` on the same records.

### 4.7 Magic

- Tradition(s); prepared / spontaneous / innate / focus.
- Slots per rank + remaining (Play).
- Cantrips, repertoire / spellbook / prepared lists.
- Innate spells, rituals; simple charge trackers.

**Later UI:** sidebar **tools** may include a spell / affliction / action reference (not required for sheet save format). The **host** is app chrome ([`sidebar-host-design.md`](sidebar-host-design.md)).

### 4.8 Inventory & wealth

- Worn / readied / stowed; invested; bulk.
- Currency; formulas; notes.
- Equipped flags feeding core calcs.

### 4.9 Companions / extras

- Animal companion, familiar, eidolon, etc. as nested character-like records.
- 0.9/1.0: editable nested sheets; limited auto-linkage.

### 4.10 Session / Play state

- Current HP, conditions, hero points.
- Focus remaining; spell slots remaining; daily abilities used.

**Coverage checklist:** Appendix A.

---

## 5. Platform

**Primary:** Installable **PWA** (service worker, web app manifest, offline app shell + content packs).

| Capability | Requirement |
| --- | --- |
| Install on desktop & mobile | Yes |
| Offline after install | Yes |
| Mandatory cloud/server | No |
| Active characters | **One** loaded sheet |
| Persistence UX | **Save sheet** (download/export JSON) and **Load sheet** (open JSON); optional in-browser draft autosave while editing is OK if it does not become a multi-sheet library |

---

## 6. Calculation architecture (core now, expandable later)

```
Content catalog (Remaster → legacy fallback)
        ↓
Character document (choices, gear, session state, overrides, optional campaign flags)
        ↓
Modifier providers (0.9/1.0: attributes, prof, items, simple conditions)
        ↓
Resolver (bonus types, stacking rules)
        ↓
Derived view model → spreadsheet UI cells
```

### 6.1 In scope for 0.9/1.0

- Attribute modifiers from boosts/flaws.
- Proficiency bonus = rank + level (Untrained special-case).
- Perception, saves, skills, Class DC.
- HP max from ancestry/class/Con (+ simple encoded bonuses).
- AC from armor + Dex (capped) + proficiency + item.
- Basic strike attack/damage.
- Spell attack / spell DC from key attribute + proficiency.
- Bulk totals; investiture count.
- Spell slot / focus / hero point tracking.

### 6.2 Expansion hooks

- Feat/spell/item/feature records may include optional `effects: Effect[]`.
- Unknown effect types ignored safely (forward compatible).
- Manual **overrides** always win and are visibly marked.

### 6.3 Remaster → legacy fallback

1. Resolve by Remaster id/name.  
2. On miss or validation error, try legacy catalog.  
3. Stamp `rulesetSource: "remaster" | "legacy" | "custom"`.  
4. Isolate failures to row/cell — never fail whole sheet load for one bad entry.

---

## 7. Content strategy

**Books:** Remaster **Player Core** + **Player Core 2** (player-facing entities only).

Include as needed for players: ancestries, heritages, backgrounds, classes, class features, feats, skills, weapons/armor, conditions, spell metadata for sheet structure, etc.

**Exclude:** GM-exclusive material (e.g. GM-only guidance, NPC building exclusives, hazard design content that players do not need on a sheet).

**Later reference tool (not 0.9 blocker):** browsable Spells, Afflictions, Actions (combat maneuvers, etc.) fed from the same catalog where licensing allows — registered on the **sidebar host**, not a separate window.

**Acquisition:** **Hybrid** — ship a curated hand-maintained PC1/PC2 player pack for 0.9; keep schema compatible with a later attributed open/ORC dataset import after license review.

---

## 8. Persistence

| Mechanism | Role |
| --- | --- |
| Save sheet | Export current character to a local `.json` file |
| Load sheet | Replace the active sheet by opening a saved file |
| Optional draft autosave | Single in-progress buffer in IndexedDB so refresh does not wipe work — **not** a character library |
| `schemaVersion` | Migrations as the model grows |

### Top-level document sketch

```json
{
  "schemaVersion": 1,
  "meta": {
    "createdAt": "",
    "updatedAt": "",
    "preferredRuleset": "remaster",
    "appVersion": "",
    "locale": "en"
  },
  "identity": {},
  "attributes": {},
  "proficiencies": {},
  "vitals": {},
  "armorClass": {},
  "skills": [],
  "feats": [],
  "features": [],
  "actions": [],
  "strikes": [],
  "spellcasting": [],
  "inventory": { "items": [], "currency": {} },
  "companions": [],
  "conditions": [],
  "play": { "heroPoints": 0, "focusRemaining": 0 },
  "notes": {},
  "overrides": {},
  "extensions": {}
}
```

---

## 9. UI direction

**Spreadsheet metaphor (0.9 placeholder):**

- Identity strip: name, level, class, HP, hero points.
- Tabs: `Identity`, `Attributes`, `Skills`, `Combat`, `Feats`, `Spells`, `Inventory`, `Play`, `Notes` (names may adjust).
- Plain inputs; derived cells read-only and visually distinct.
- Prominent **Save sheet** / **Load sheet** controls.
- **Sidebar host** (app-level): collapsible rail; tools read/write the same document. Tool list TBD; empty host is valid.
- Mobile: wide-table horizontal scroll; Play tab thumb-friendly; sidebar collapsed by default.
- No cards, no decorative motion.

**Later tools:** reference tabs (Spells / Afflictions / Actions) plug into the host without abandoning the sheet grid.

**i18n:** All user-visible strings via message catalogs. Ship `en` in 0.9; add `es` for 1.0. Chrome catalog exists; remaining PF2e panel literals in `app/src/systems/pf2e/sheet/` extract when those panels change.

---

## 10. Technical approach

| Concern | Choice |
| --- | --- |
| Language | TypeScript |
| UI | **React** |
| Styling | Minimal CSS tables/grids; system fonts OK for placeholder |
| State | One character document in memory; Save/Load `.json` files; optional single draft buffer |
| App title | Chrome: **TTRPG Character Sheet** (Phase M landed) |
| Calcs | Pure functions + golden tests |
| Content | Planned: static JSON under `/content/remaster` and `/content/legacy` (directories not in the repo yet) |
| Offline | Service worker caches app shell + content packs |
| Telemetry | None |

---

## 11. Phased delivery

Live status checkboxes: [`ROADMAP.md`](ROADMAP.md). App-level phases (M, 1e, 2e, …) live there. This section is the original PF2e phase map.

### Phase 0 — Design lock (done)

- Product decisions complete; ADR 0001 accepted (later superseded by ADR 0003).
- Schema questions answered; `schemas/character.schema.json` is schemaVersion 1 (ADR 0002).

### Phase 1 — Schema + core calc engine (TypeScript) — martial/caster slice done; leftover goldens deferred

- Done: character JSON schema v1; TypeScript types; empty-sheet factory; Save strips `derived`; Ajv validation on Load/Save; `compute()` for attributes, proficiency, HP, AC, skills, strikes, spell attack/DC, bulk, investiture, overrides; Fighter 5, Wizard 5, Bard 5, Cleric 5, and Ranger 5 goldens; React PWA scaffold with derived cells plus identity, feats, spells, inventory, strike, and play editors. `computeCompanion()` reuses core calcs on nested `CompanionSheet`.
- Remaining (later PF2e *release*): golden for one PC2 class; companion nested-sheet editor.
- Content pack stubs (`/content/remaster`, `/content/legacy`) stay Phase 3; they are not in the repo yet.

### Phase 2 — PWA spreadsheet shell

- Tab chrome, Save/Load, derived cells, identity/feats/spells/inventory/strike/play editors exist. Remaining: companion nested sheet. IndexedDB one-key draft **landed** (app-level). PF2e panel literals remain English (later PF2e *release*). Chrome + PF1e catalogs use `en.json` / `es.json`.

### Phase 3 — Content fill-out (later PF2e *release*)

- PC1 + PC2 player catalog; legacy fallback rows for renames/replacements.

### Phase 4 — 1.0

- Spanish (`es`) locale (app-level).
- Stability pass; still core calcs unless scope expands.

### Phase 5 — Post-1.0

- Reference encyclopedia as a **sidebar tool** (spells / afflictions / actions), once tools are specified.
- Complex `effects[]` automation.

---

## 12. Accepted golden-test characters

Engineering fixtures (not necessarily shipped as player samples). Assert core outputs (HP, AC, skills, strikes, spell DC, etc.):

**Required regressions (app 0.9):**

1. Martial — **Fighter 5** (armor + multiple strikes) — exists
2. Prepared caster — **Wizard 5** — exists

**After PF1e 0.9 (original proposed set, still the PF2e coverage target):**

3. Spontaneous caster — **Bard 5** — exists
4. Divine prepared — **Cleric 5** — exists
5. Companion user — **Ranger 5** with animal companion **or** Druid with companion — Ranger 5 exists (nested sheet; no companion editor yet)
6. PC2 smoke test — one **Player Core 2** class at level 3 or 5

Exact subclass/spell picks can be chosen during implementation as long as the roles above stay covered.

---

## 13. Working product summary

This section is the **PF2e system target**, not the app 0.9 bar (see [umbrella §10](ttrpg-character-sheet-design.md)).

- PF2e documents: **Remaster-first / legacy fallback**; **core calcs** with expansion hooks.
- **Player Core + Player Core 2** (hybrid content acquisition); no GM exclusives — pack fill-out in a later PF2e *release*.
- **No** PF2e campaign house-rule flags in 0.9/1.0.
- Shared app: installable PWA, spreadsheet, one character, Save/Load, English then Spanish, no dice/cloud/VTT.
- Golden tests: Fighter 5, Wizard 5, Bard 5, Cleric 5, and Ranger 5 must keep passing; §12 remainder is later.

---

## Appendix A — Coverage checklist

- [x] Identity / level / XP / ancestry / heritage / background / class
- [x] Attributes + boost history
- [x] Perception, saves, class DC
- [x] AC + armor + shield
- [x] HP max/current/temp + dying track
- [x] Speeds, senses, languages, traits
- [x] All skills + lore + armor/weapon proficiencies
- [x] Strikes (melee/ranged/unarmed)
- [x] Feats by category + class features (+ optional `effects` stubs)
- [x] Inventory, bulk, investment, wealth
- [x] Spell tradition, slots, cantrips, repertoire/prepared, focus, innate, rituals
- [ ] Companions nested records (schema + golden yes; UI editor deferred to later PF2e release)
- [x] Conditions, hero points, daily/encounter resources
- [x] Notes / roleplay free text
- [x] Overrides + schemaVersion + Save/Load (calc engine + persistence yes; override UI editor deferred)
- [ ] i18n message catalogs (`en` → `es` runtime exists; PF2e panel literals deferred to later PF2e release)

## Appendix B — Document history

| Date | Change |
| --- | --- |
| 2026-08-13 | Initial options document |
| 2026-08-13 | First decision lock (local/mobile, spreadsheet, Remaster+legacy) |
| 2026-08-13 | PWA; PC1+PC2; Save/Load one sheet; i18n plan; TypeScript; elaborations for content source, house rules, golden tests, license |
| 2026-08-13 | Final lock: hybrid content, omit house-rule flags, accepted golden-test set, MIT |
| 2026-08-13 | Align phases and technical notes with the repo: scaffold exists, calc/content/i18n/validation not started; Save extension is `.json` only |
| 2026-08-14 | Point remaining Phase 1+ work at continuation options (`continuation-design.md`) |
| 2026-08-14 | Record S1/S4 landing; point remaining work at `next-increment-design.md` |
| 2026-08-15 | Point §11 at operational [`ROADMAP.md`](ROADMAP.md) after T1/T3 merge |
| 2026-08-17 | Relabel as PF2e **system** spec under ADR 0003; leftover goldens/content after PF1e 0.9 |
| 2026-08-17 | Sidebar is an app host (ADR 0005); encyclopedia is a future tool |
| 2026-08-19 | Bard 5 golden (spontaneous occult); remaining §12 goldens after PF1e 1.0 |
| 2026-08-19 | Cleric 5 golden (prepared divine); remaining §12 is companion user + PC2 class |
| 2026-08-19 | Ranger 5 golden (nested wolf companion + `computeCompanion`); remaining §12 is PC2 class |
| 2026-08-19 | Remaining PF2e leftover waits for a later *release*; finish First Edition first |
| 2026-09-03 | Chrome title is TTRPG Character Sheet; IndexedDB draft landed; PF2e panel i18n still later release |
| 2026-09-22 | Named sidebar tools (Attack Helper, Actions List, Budget Calculator) landed supporting PF2e |
| 2026-09-26 | Document audit: synchronize Appendix A coverage checklist with implemented engine and sheet domains |
