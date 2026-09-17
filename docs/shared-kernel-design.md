# Shared kernel — reuse between Pathfinder 1E and 2E

**Status:** Engineering lock (ADR 0004) — 2026-08-17  
**Parent:** [ADR 0003](adr/0003-multi-system-product-direction.md), [`ttrpg-character-sheet-design.md`](ttrpg-character-sheet-design.md)  
**Code:** Phase M extracted `app/src/shared`, `app/src/shell`, `app/src/systems/pf2e` (2026-08-17).

This document is the inventory of **what to share**, **what to fork**, and **how to work** so two editions stay compact without pretending they are one ruleset.

---

## 1. Rule of thumb

Share **structure, chrome, and edition-blind helpers**. Fork **math, document shape, and any field whose meaning differs**.

If two things have the same English label on a character sheet (AC, level, spell DC, weight) but different formulas or cardinality, they are **not** the same type. Give them system-local names. The tab chrome can still say “Combat”.

Do not introduce a shared abstraction for a pattern that has only one caller. Phase M extracts the kernel PF2e already needs (Save/Load, envelope, IDs, derived cells). PF1e is the second caller that proves the rest.

---

## 2. Layers

```
┌─────────────────────────────────────────────┐
│  Platform — Vite, React, PWA, CI, CSS       │
├─────────────────────────────────────────────┤
│  Shell — tabs, New/Load/Save, system picker │
│          SystemModule registry              │
│          Sidebar host (tools TBD)           │
├─────────────────────────────────────────────┤
│  Shared kernel — envelope, refs, effects,   │
│    overrides apply, ids, i18n, row UI,      │
│    Ajv helper, golden helper, coins, notes  │
├──────────────────────┬──────────────────────┤
│  systems/pf2e        │  systems/pf1e        │
│  schema, types,      │  schema, types,      │
│  compute(), panels   │  compute(), panels   │
│  content pack        │  content pack        │
└──────────────────────┴──────────────────────┘
```

**Import rule:** `systems/pf1e` must not import `systems/pf2e` (or the reverse). Both may import `shared` and `shell` may import both modules. Engines stay pure TypeScript (no React).

---

## 3. Target layout

```text
app/src/
  shell/                 # App chrome, tab bar, New/Load/Save, registry, sidebar host
  shared/
    envelope.ts          # SystemId, schemaVersion, Meta (locale, timestamps)
    contentRef.ts        # id + name + optional publication
    effects.ts           # open Effect stub
    overrides.ts         # last-wins apply; allow-list injected
    ids.ts               # newId()
    format.ts            # signed()
    abilities.ts         # AttributeKey; abilityModifierFromScore()
    currency.ts          # cp/sp/gp/pp
    notes.ts             # appearance / personality / campaign / other
    rows.ts              # DailyResource, generic labeled row — **not extracted**; still per-system createRows
    validate.ts          # Ajv 2020-12 compile(schema) + error format
    saveLoad.ts          # JSON parse, strip derived, download, filename
    ui/
      DerivedCell.tsx
      NotesPanel.tsx     # once both systems use the same Notes shape
      rows.ts            # immutable row helpers: replaceAt, patchAt, updateAt, removeAt, appendRow
  systems/
    pf2e/                # today’s character/ + engine/ + PF2e panels
    pf1e/
  test/
    readRepoFile.ts
    golden.ts            # load fixture → validate → compute → assert — **not extracted**; goldens live per-system + `shell/goldens.stability.test.ts`
```

Folder names can shift; the **boundaries** are the lock.

**Extracted today:** `envelope.ts`, `ids.ts`, `format.ts` (`signed`), `validate.ts`, `saveLoad.ts` (filename sanitize + `downloadJsonFile` / parse helpers — **not** `stripDerivedForSave`), `constants.ts`, `contentRef.ts`, `effects.ts`, `overrides.ts` (generic apply + per-system `applyOne`), `notes.ts`, `currency.ts`, `abilities.ts` (`AbilityKey`, `abilityModifierFromScore`), `i18n/` (`catalog.ts`, `context.tsx`, `index.ts`), `ui/DerivedCell.tsx`, `ui/NotesPanel.tsx`, `ui/rows.ts` (`replaceAt`, `patchAt`, `updateAt`, `removeAt`, `appendRow`).

**Not extracted (do not treat as missing files to add unless a second caller needs them):** shared `DailyResource` entity factories (`createRows.ts`), `test/golden.ts`, shared `stripDerivedForSave` (each system owns strip-derived because document shape differs).

**Still per-system:** allow-lists inside each `engine/overrides.ts`, PF2e `ContentRef` extensions (`rulesetSource`, `legacyId`), edition math, `stripDerivedForSave`. Duplicating those is cheaper than a shared type with optional edition fields.

JSON Schema files stay per system (`schemas/character.schema.json` for PF2e; `schemas/pf1e/character.schema.json` for PF1e). A tiny **envelope** fragment (or documented required fields) is shared conceptually: `schemaVersion`, `system`.

---

## 4. `SystemModule` contract

The shell does not switch on `if (system === 'pf2e')` for math or panel trees. It registers modules. App retains **one** typed switch to pick `pf1eModule` vs `pf2eModule` when mounting `SheetSession` (TypeScript cannot erase the `LoadedSheet` union).

```ts
type SystemId = 'pf1e' | 'pf2e' // further ids reserved

interface SystemModule<Doc, Derived> {
  id: SystemId
  displayNameKey: string
  validate(data: unknown): Doc
  createEmpty(): Doc
  compute(doc: Doc): Derived
  parse(text: string): Doc
  serialize(doc: Doc): string
  download(doc: Doc): void
  readFile(file: File): Promise<Doc>
  suggestedFilename(doc: Doc): string
  Workspace: ComponentType<SheetWorkspaceProps<Doc, Derived>>
  sidebarTools: SidebarTool<Doc, Derived>[]
}
```

Tab ids and strip chrome stay **inside each Workspace**. They are not a field on the module.

Load:

1. Parse JSON object.
2. Read `system` (missing → `pf2e`).
3. Dispatch to that module’s `validate` + `compute`.

Save: module `serialize` (strips `derived`) + `validate`, write `system`.

New: picker iterates the registry → `createEmpty()`.

No conversion of a PF2e document into PF1e (or the reverse).

---

## 5. Share — types (structural)

These are the same *idea* in both CRB and Player Core. Keep them small. Systems **extend**, they do not replace, when they need extra fields.

| Kernel type | Shared fields | System extensions |
| --- | --- | --- |
| Envelope | `schemaVersion`, `system`, `meta.createdAt/updatedAt/appVersion/locale/characterId` | PF2e `meta.preferredRuleset` |
| `ContentRef` | `id`, `name`, optional `source` `{ book, page, rarity }` | PF2e `rulesetSource`, `legacyId`. PF1e may add license/provenance later |
| `Effect` | `type`, optional `selector`, `mode`, `value`, `predicate`, `label`, open index | Unknown `type` ignored by every engine |
| `OverrideValue` | `value`, `reason?`, `updatedAt?` | Allow-list of paths is **per system** |
| `AttributeKey` | `'str' \| 'dex' \| 'con' \| 'int' \| 'wis' \| 'cha'` | None — six abilities are the same letters |
| `Currency` | `cp`, `sp`, `gp`, `pp` | None |
| `Notes` | `appearance`, `personality`, `campaign`, `other` | Extra note bags stay in `extensions` |
| `DailyResource` | `id`, `name`, `max`, `remaining`, `resetsOn` | PF2e may use `'refocus'`; PF1e can ignore that enum member |
| Labeled row | `id`, summary text, optional `effects[]` | Feat *categories*, action costs, PF2e traits lists |
| Spell slot row | `max`, `remaining`, level index | PF2e calls it `rank`; PF1e `spellLevel`. **Store the number in a system field**; do not share a `rank` name that means two different ladders |
| Condition row | `id`, ref, optional numeric `value`, `duration`, `notes` | Condition catalogs differ; row shape is enough |
| Item skeleton | `id`, `ContentRef`, `quantity`, `equipped`, `priceGp?`, `notes?`, `effects[]` | PF2e: `bulk`, `invested`, `location`, runes. PF1e: `pounds`, enhancement, ACP, spell failure |

**Ability modifiers:** share `abilityModifierFromScore(score) = floor((score − 10) / 2)` for PF1e (and optional PF2e legacy-score display). PF2e **play math** stays boost-sum in `systems/pf2e`. Do not share a single `attributes` block type.

**Size:** both use a size category that shifts AC/skills. The PF2e enum is `tiny`…`gargantuan`. PF1e also has Fine / Diminutive / Colossal. Put a **core** union in kernel if useful (`tiny`–`huge` overlap) or keep size **per system** — default: **per system**, because combat math attached to size is not shared. Display can still use a `<select>`.

---

## 6. Share — functions (edition-blind)

Lift from today’s PF2e code; strip edition knowledge.

| Helper | Today | Kernel role |
| --- | --- | --- |
| `newId()` | `createRows.ts` | UUID / fallback id |
| `signed(n)` | `engine/types.ts` | `+2` / `-1` / `0` display |
| `stripDerivedForSave` | per-system `character/saveLoad.ts` | Omit `derived`; stamp `system` + `meta`. Not lifted into shared — document shape differs |
| `suggestedSaveFilename` | `saveLoad.ts` | Sanitize `identity` name; `.json`. Name getter is injected (PF1e identity field may differ slightly) |
| `downloadCharacterJson` / `readCharacterFile` | `saveLoad.ts` | Blob + FileReader; validate via module |
| `formatAjvErrors` + compile | `validate.ts` | One Ajv instance helper; **schema argument** |
| `applyOverrides` | `engine/overrides.ts` | Generic `derived.*` path apply. **Allow-list and Derived shape are module-owned** — kernel takes `setPath(view, parts, value): boolean` or an allow-list callback |
| `isOverridden` | `overrides.ts` | `overriddenPaths.includes` |
| Empty-row “add line” | `createRows.ts` | Only truly generic factories (`DailyResource`). Feat/strike/spellcasting factories stay in the system |

**Do not** put in kernel: `proficiencyBonus`, `stackTyped`, `bulkUsedTenths`, MAP, BAB tables, HD, encumbrance-by-Strength, spell DC formulas.

A generic `decreasingSteps(start, step)` (PF2e MAP and PF1e iteratives both walk −5) is **optional later**. Both can write a three-line loop until it hurts. Prefer duplication of three lines over a clever shared combat helper.

---

## 7. Share — UI primitives

| Primitive | Why share | Why not a full panel |
| --- | --- | --- |
| Spreadsheet CSS (`.sheet-table`, `.derived`, `.panel-stack`, `.table-toolbar`) | Same placeholder look | — |
| `DerivedCell` | Read-only + override styling | — |
| Tab chrome / identity strip layout | One PWA | Strip *fields* differ (hero points vs class-level summary) |
| New / Load / Save / status line | Persistence UX | — |
| Sidebar **host** (rail, collapse, registry) | One loaded-sheet companion ([ADR 0005](adr/0005-sidebar-host.md)) | **Tools** may be per system; host is shell |
| Notes panel | Same `Notes` shape | — |
| Generic add/remove table | Feats, features, conditions, daily resources, inventory lines | Column set and row type are props or system-owned. **Do not build `SheetTable` in Phase M** unless two panels in that PR use it |
| Number input conventions | Integers, min 0 where needed | Validation messages per field |

**Fork panels (system-owned):** Identity (classes vs ancestry/class), Abilities vs Attributes, Skills (ranks vs proficiency), Combat, Spells, Play (dying vs negative HP), Inventory (bulk vs pounds). Edition-specific **sidebar tools** register on `SystemModule`; they must not duplicate a second write path.

**Parameterized later:** Feats/features tables are the best `SheetTable` candidates — both editions are “name, type, level, summary, remove”. Categories enums stay props.

---

## 8. Share — persistence, tests, i18n, content

### Persistence

- One active document in React state (union type).
- Optional IndexedDB **one** draft key; payload includes `system`.
- Reject invalid files; never partial-load a failed schema.
- Isolate **content** resolve failures to a row (future packs), not the whole file.

### Tests

- Vitest + CI job unchanged.
- Shared `readRepoFile` / golden helper: load JSON, validate with the right module, `compute`, assert.
- Fixtures: keep current paths for PF2e goldens in Phase M (less churn). New PF1e goldens under `fixtures/characters/golden/pf1e/` (or `pf1e-fighter-5.json`). Do not reuse `fighter-5.json` for both editions.

### i18n

- One catalog per locale.
- Key prefix: `shell.*`, `pf2e.*`, `pf1e.*`.
- Content names (feat “Power Attack”) live on the character / pack, not in UI catalogs.
- Extract English before a large PF1e editor wave (T4′).

### Content packs (later)

- Same file hygiene: kebab-case ids (`class.fighter`, `feat.power-attack` — **ids are not portable across systems** even when the string matches).
- Resolver: id → row; miss → stamp custom; do not crash Load.
- Packs live in `content/pf1e/…` and `content/pf2e/…` (or `content/remaster` under pf2e). No shared “fighter” record.

---

## 9. Do not share (anti-list)

Grounded in the current PF2e engine vs the PF1e spec:

| PF2e today | PF1e | Why not one module |
| --- | --- | --- |
| `ProficiencyRank` + `proficiencyBonus` | No ranks; BAB / save progressions | Different functions of level |
| `ModifierBreakdown` + `stackTyped` | Named AC buckets; dodge stacks; enhancement does not | Different stacking |
| One `ac` | AC, touch, flat-footed | Cardinality |
| Strikes + MAP | Iteratives from BAB; CMB/CMD | Different attack sequences |
| `bulk` tenths + investiture | Pounds + STR load | Different units |
| `identity.level` + one `class` | `classes[]` sum | Multiclass is normal in 1E |
| Boosts → modifier | Score → `floor((score−10)/2)` | Different inputs |
| Spell attack/DC from proficiency | DC `10 + spell level + ability`; no spell attack proficiency | Different DC |
| Dying / wounded / doomed, hero points, focus | Negative HP, generic daily resources | Play model |
| `CompanionSheet` nested PF2e fields | Familiar/companion later, different stats | Nested sheet is system-shaped |

**Also forbidden:**

- One `compute(doc)` with `if (doc.system === …)` for more than registry dispatch.
- Optional fields on a shared document (“`bab` if pf1e else `proficiencies`”).
- Wrapping `{ system, character }` in a way that breaks current fixtures (ADR 0003: add `system` on the existing object).
- Sharing `DerivedView` as a single interface. Each module exports its own; shell only needs `overriddenPaths` + whatever the active panels read.

---

## 10. Lookalikes — same tab, different type

Use this table when naming fields so we do not “standardize” the wrong thing.

| Sheet word | PF2e | PF1e | Kernel? |
| --- | --- | --- | --- |
| Level | `identity.level` | Sum of `classes[].levels` | No |
| HP | Ancestry + class/level + Con | HD recorded + Con + favored | No (both have `maxHp` / `currentHp` **numbers** on vitals/play; formulas fork) |
| AC | Armor + Dex cap + proficiency | Armor/shield/Dex/size/natural/deflection/dodge | No |
| Fort/Ref/Will | Ranked proficiency | Class progressions + ability | No |
| Skills | Rank + level + ability | Ranks + class +3 + ability + ACP | No |
| Feats | Categories incl. ancestry/archetype | Combat/metamagic/item creation/… | Row chrome only |
| Spells | Rank 1–10, traditions, focus | Spell level 0–9, school, ASF | Slot max/remaining chrome; not DC |
| Weight | Bulk | Pounds | Item skeleton without the unit field name |
| Initiative | Optional play field | Dex + misc | No |

`currentHp`, `temporaryHp`, and a derived `maxHp` **display** can look identical in Play. Store them on each system’s vitals; a tiny shared `VitalsPlay` `{ currentHp, temporaryHp }` is allowed if both structs embed it.

---

## 11. Standardized work (how we add things)

### Adding a system

1. `systems/<id>/` with schema, types, `createEmpty`, `compute`, goldens.
2. Implement `SystemModule` (`Workspace`, `displayNameKey`, `sidebarTools`).
3. Add the id to `SystemId`, register in `shell/registry.ts`, add a `LoadedSheet` variant. No edits inside another system’s engine.
4. Fixtures named with the system (`pf1e-fighter-5.json` or a `pf1e/` folder).
5. i18n keys under `<id>.*`.
6. `sidebarTools` on the module (empty array is valid); do not skip the host `update` path.

### Adding a sidebar tool (later)

1. Implement `SidebarTool` (shared or under the system).
2. Register; use `character` / `derived` / `update` only ([`sidebar-host-design.md`](sidebar-host-design.md)).
3. Do not add a save-file field for “which tool is open.”
4. A tool that needs new persisted data uses `extensions` or a schema ADR — not a parallel file.

### Adding a calculated field

1. Input on the **system** document; formula in that system’s engine.
2. Expose on that system’s `DerivedView`.
3. Show with `DerivedCell` + override path `derived.…` on that system’s allow-list.
4. Golden assertion. Do not add the field to the other edition “for symmetry.”

### Adding a row editor

1. Prefer an existing system panel.
2. If a second edition needs the same columns, extract `SheetTable` then — not before.
3. Factories (`createEmptyFeat`) live next to the system type.

### Naming

- File/folder: `pf1e`, `pf2e`, never `pathfinder` alone.
- Content ids: kebab-case, **namespaced by system pack**, not global.
- Override paths: `derived.` + module-defined suffix.
- Do not reuse PF2e type names (`ProficiencyRank`, `StrikeEntry`, `bulk`) in PF1e files.

### Tests

- Engine unit tests sit beside the engine.
- Goldens are the contract. Phase M is done only when existing PF2e goldens still pass.

---

## 12. What Phase M actually extracts

**In scope (first kernel):**

- `SystemId`, optional `system` on the PF2e schema, Load default `pf2e`.
- Move PF2e code under `systems/pf2e` (or equivalent) without math changes.
- Lift `newId`, `signed`, Ajv error format, strip-derived, file download/read.
- `DerivedCell` + spreadsheet CSS stay shared (already are).
- Shell registry with **one** module registered (PF2e).
- Working display name in chrome (ADR 0003) can land here.
- Layout: do not paint the shell into a full-bleed grid with no room for a sidebar rail ([ADR 0005](adr/0005-sidebar-host.md)). Optional empty collapsed `<aside>`.

**Out of scope for Phase M:**

- `SheetTable`.
- Shared spell-slot or feat TypeScript interfaces used by both (PF1e types do not exist yet).
- Moving goldens on disk.
- PF1e schema (Phase 1e) — done: [ADR 0006](adr/0006-pf1e-character-schema.md).
- Named sidebar **tools** (Phase Sb host, then a tools increment). Empty rail is OK.
- Full override-kernel generic if the PF2e allow-list move is riskier than copying `applyOverrides` once — **prefer one generic apply with a callback** if it stays under ~80 lines and PF2e tests pass; otherwise move the current function with PF2e and genericize in 1e.

**Phase 1e then:** PF1e module; start sharing `NotesPanel`, `Currency`, `DailyResource`, `abilityModifierFromScore`, `ContentRef` core, `Effect`, `OverrideValue` as soon as both types exist. If a shared type does not fit without optional edition fields, **stop and fork**.

---

## 13. Compactness vs false sharing

The compact codebase is:

- One PWA and CSS.
- One persistence path.
- One way to add a row and show a derived cell.
- Two small engines, not one large engine.

It is **not**:

- A 2e document with 1e fields attached.
- A “bonus type” library that implements both stacking systems.
- Shared “class” or “level” objects.

Duplicating a 20-line skill total function is cheaper than a shared skill API with flags.

---

## Appendix — Document history

| Date | Change |
| --- | --- |
| 2026-08-17 | Initial shared-kernel inventory and SystemModule contract (ADR 0004) |
| 2026-08-17 | Sidebar host on the shell; `sidebarTools` on SystemModule (ADR 0005) |
| 2026-08-17 | Record what Phase M actually extracted vs still-duplicated types |
| 2026-08-17 | Extract ContentRef, Effect, applyOverrides, Notes, Currency, AbilityKey; `en.json` + `t()` |
| 2026-08-19 | Align `SystemModule` with `shell/types.ts`: `Workspace`, `displayNameKey`, no `schema`/`tabs` on the module |
| 2026-09-03 | Record that golden.ts and shared stripDerivedForSave were never extracted; i18n.tsx not i18n.ts |
| 2026-09-14 | Extract ui/rows.ts (replaceAt, patchAt, updateAt, removeAt, appendRow) adopted across panels; split shared/i18n for Fast Refresh |
