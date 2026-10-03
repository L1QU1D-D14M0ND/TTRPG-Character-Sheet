# Continuation design — options to proceed from Phase 1

**Status:** Archival. Executed (S1 vertical slice + S4 validation prelude landed 2026-08-14). Historical PF2e sequencing. Do not use this file to schedule new work.  
**Current sequencing:** [`phase-5.md`](phase-5.md) and [`ROADMAP.md`](ROADMAP.md). [`next-increment-multi-system.md`](next-increment-multi-system.md) is the executed record of the multi-system increment.  
**Date:** 2026-08-14  
**Audience:** Product / engineering  
**Depends on:** [`pf2e-dynamic-character-sheet-design.md`](pf2e-dynamic-character-sheet-design.md) (PF2e system spec), [ADR 0001](adr/0001-product-direction.md) (superseded), [ADR 0002](adr/0002-character-schema.md), [`schema-design-notes.md`](schema-design-notes.md)  
**Remaining work (historical PF2e increment):** [`next-increment-design.md`](next-increment-design.md)

This document does **not** reopen locked PF2e schema/math decisions. It mapped the pre-S1 scaffold to remaining PF2e 0.9/1.0 work and recommended S1 + S4. Treat it as the record of those choices. **Do not use §11 as the next coding slice.** App 0.9 is now PF1e-first.

Sections §3–§11 below are the **pre-S1 snapshot** and are intentionally not rewritten.

---

## 1. Purpose

Phase 0 (design lock) is done. **As of this document (2026-08-14),** Phase 1 was **partially** done: schema v1, TypeScript types, empty-sheet factory, Save/Load `.json`, and a spreadsheet PWA chrome existed. The calc engine, JSON Schema validation, content packs, golden tests, row editors, and i18n catalogs were **not started**. Those gaps were closed in later increments. Do not treat this section as the current repo.

The question now is **how to sequence and implement** the remaining work, not **what product to build**.

---

## 2. Locked constraints (do not reopen)

| Constraint | Source |
| --- | --- |
| Installable PWA, local/offline, one sheet, Save/Load `.json` | ADR 0001 |
| Spreadsheet UI, React + TypeScript, MIT | ADR 0001 |
| Remaster-first / legacy fallback; PC1 + PC2 player-facing only | ADR 0001 |
| Core calcs for 0.9/1.0; `effects[]` ignored unless typed later | ADR 0001 §6 |
| No dice, cloud, VTT interop, house-rule flags, or GM exclusives | ADR 0001 |
| English in 0.9, Spanish in 1.0; strings externalized from the start | ADR 0001 |
| Validate against `schemas/character.schema.json` on Load and before Save | ADR 0002 |
| Strip `derived` on Save; auto-seed 16 skills; decimal bulk; user-entered boosts | ADR 0002 |
| Golden-test roles: Fighter 5; Wizard/Witch 5; Bard/Sorcerer 5; Cleric 5; companion user; one PC2 class | Design §12 |

If a later option would violate a lock, it is marked **out of scope**.

---

## 3. Current snapshot (repo as of 2026-08-14)

### Present

| Area | What exists |
| --- | --- |
| Schema | `schemas/character.schema.json` (schemaVersion 1, JSON Schema 2020-12) |
| Fixtures | `fixtures/characters/minimal.example.json`, `new-sheet.example.json` |
| Types | Hand-written `app/src/character/types.ts` |
| Factory | `createEmptyCharacter()` seeds 16 skills + blank ContentRefs |
| Persistence | `saveLoad.ts`: parse JSON, require `schemaVersion === 1` plus `identity`/`meta`/`attributes`; Save strips `derived` |
| UI | `App.tsx` tabs: Identity, Attributes, Skills, Combat, Feats, Spells, Inventory, Play, Notes |
| Editable now | Name, level, class name, ancestry/heritage/background names, size, boost totals, skill ranks, perception rank, class DC attr, shield raised, currency, HP/temp/dying/wounded/doomed, hero points, focus pool/remaining, notes |
| Placeholder | Strikes, feats/features, spell lists, inventory items, conditions, companions |
| PWA | `vite-plugin-pwa` manifest + Workbox glob; **not runtime-tested** |
| Tooling | Vite 8, React 19, TypeScript, oxlint; **no unit test runner** |
| i18n | Hardcoded English strings in `App.tsx` |
| Content | No `/content/remaster` or `/content/legacy` |

### Missing relative to 0.9

- JSON Schema validation on Load/Save
- Pure calc engine + override application + Remaster→legacy content resolve
- Golden-test characters and a test runner
- Row editors for strikes, feats, features, actions, spells, items, lore, conditions, companions
- IndexedDB single-draft buffer
- Message catalogs (`en`, later `es`)
- Content packs (PC1 + PC2 player catalog)
- Derived cells in the UI (read-only, visually distinct)
- Install/offline verification

Appendix A coverage checklist in the product design remains entirely unchecked.

---

## 4. Gap map

```
Locked product (0.9)
        │
        ├── Data contract ──── schema v1 ✓  types ✓  factory ✓  Save strip ✓
        │                     JSON Schema validate ✗  type generation ✗
        │
        ├── Calc ──────────── engine ✗  overrides ✗  stacking ✗  golden tests ✗
        │
        ├── UI ────────────── tab chrome ✓  identity/skills/play partial ✓
        │                     row editors ✗  derived cells ✗  i18n catalogs ✗
        │
        ├── Content ───────── pack format ✗  remaster catalog ✗  legacy fallback ✗
        │
        └── Platform ──────── PWA plugin ✓  draft IndexedDB ✗  offline proof ✗
```

Work below is grouped so each package can be estimated independently. Sequencing is a separate choice in §5.

---

## 5. Sequencing strategies

Pick **one** primary path. Mixing is possible, but each path optimizes a different risk.

### Option S1 — Vertical slice (recommended)

Ship **one playable Fighter 5** end-to-end: validate → compute HP/AC/skills/strikes → show derived cells → Save/Load round-trip → golden fixture.

Then clone the slice for casters, companion, PC2.

| Pros | Cons |
| --- | --- |
| Early proof that schema, engine, and UI fit | Other tabs stay placeholders longer |
| Golden tests appear immediately | Temptation to hard-code Fighter-only paths |
| Failures isolated to one character type | Content pack can stay tiny at first |

**Best when:** the next goal is “does the architecture work?”

### Option S2 — Engine-first (matches design §11 as written)

Finish Phase 1 on paper: validation, pure functions, all six golden roles as fixtures, **then** wire UI.

| Pros | Cons |
| --- | --- |
| Math locked before UI binds to it | No visible sheet improvement until engine is broad |
| Golden set forces API completeness | Requires content stubs for six characters before UI payoff |

**Best when:** calc correctness is the highest risk.

### Option S3 — Playable-sheet-first

Build row editors so a human can **enter** a full character by hand; derived fields stay blank or user-typed until the engine lands.

| Pros | Cons |
| --- | --- |
| Sheet becomes usable as a digital form sooner | Users will treat blank “totals” as truth; later derived cells may surprise |
| Editors inform which fields need better UX | Duplicate work if editors assume the wrong derived shape |

**Best when:** table-use feedback is needed before investing in math.

### Option S4 — Foundation-first

Add Vitest, Ajv validation, i18n plumbing, CI, schema-to-types, **then** engine and UI.

| Pros | Cons |
| --- | --- |
| Fewer rewrites; ADR 0002 validation lands early | Slowest visible product progress |
| i18n-from-the-start lock is satisfied before more UI strings | Easy to over-invest in tooling |

**Best when:** multiple contributors will land soon.

### Option S5 — Content-first

Start the PC1/PC2 catalog and content-id convention before the engine.

| Pros | Cons |
| --- | --- |
| Engine can resolve real ids instead of fixtures-only | Licensing/attribution work with no playable output |
| Surfaces catalog schema questions early | Large busywork if pack format is wrong |

**Out of scope as a solo next step.** Content without a resolver does not move 0.9. Pair a **minimal** pack with S1 instead.

### Recommendation

**S1 (vertical slice)**, with a thin **S4 prelude** (Vitest + JSON Schema validation) because ADR 0002 already requires validation and golden tests need a runner.

Suggested order:

1. Test runner + schema validation (Load/Save + fixture tests)
2. Calc engine for attributes, proficiency, HP, AC, skills, one strike
3. Wire derived cells on Identity / Attributes / Skills / Combat
4. Fighter 5 golden fixture
5. Row editors needed by that fixture (strikes, armor item, HP inputs)
6. Repeat for remaining golden roles
7. i18n extraction once the slice UI has stabilized enough not to churn catalogs
8. Content pack fill-out (Phase 3) after ids are exercised by goldens
9. Spanish + stability (Phase 4)

---

## 6. Work packages and options

### WP-A — Test runner and golden harness

**Need:** no test framework in `app/package.json`. Design §12 is blocked without one.

| Option | Notes |
| --- | --- |
| **A1. Vitest** (recommended) | Same Vite toolchain; watch mode; happy with TypeScript and JSON fixtures |
| A2. Node.js built-in `node:test` | Zero extra deps; weaker Vite/TS DX |
| A3. Tests only in CI via a separate package | Overkill for a single `app/` |

**Action:** add `npm test` (`vitest run`) and `npm run test:watch`. Keep golden characters as JSON under `fixtures/characters/golden/` plus expected `derived` snapshots (or expected totals files). Engine tests import fixtures, run `compute(character)`, assert totals.

Do **not** ship golden files as player samples (design §12).

---

### WP-B — JSON Schema validation (ADR 0002)

**Need:** Load and pre-Save must validate against `schemas/character.schema.json`. Today Load only checks `schemaVersion === 1` and three keys.

| Option | Notes |
| --- | --- |
| **B1. Ajv 2020-12 in the app** (recommended) | Import the schema JSON; validate in `parseCharacterJson` and `serializeCharacter`. Surface first error path in the status bar. |
| B2. Ajv in tests/CI only; keep today’s runtime checks | **Violates ADR 0002** unless the ADR is amended. Not recommended. |
| B3. Replace JSON Schema with Zod and generate both | Large rewrite; schema file is already the lock. Can add Zod later as a mirror, not a replacement. |

**Load policy options** (orthogonal):

| Option | Notes |
| --- | --- |
| **B-L1. Reject invalid files** (recommended for 0.9) | Matches “validate on Load”. Blank drafts remain valid (issue I1). |
| B-L2. Load with warnings | Friendlier for hand-edited JSON; more UI. Defer unless users complain. |

**Save policy:** validate **after** stripping `derived`. If invalid, do not download; show the path.

**Types vs schema:**

| Option | Notes |
| --- | --- |
| **B-T1. Keep hand-written types** (ok for now) | Current `types.ts` is aligned; add a CI test that fixtures validate. |
| B-T2. Generate types from JSON Schema | `json-schema-to-typescript` reduces drift. Do when schema churns again. |

**Action:** B1 + B-L1 + fixture validation tests for both example files. Copy schema into the Vite bundle via `import schema from '../../../schemas/character.schema.json'`.

---

### WP-C — Core calc engine

**Need:** design §6.1. Pure functions; `derived` is a cache; `overrides` win and must be marked in UI.

#### C.1 Engine shape

| Option | Notes |
| --- | --- |
| **C1. `compute(doc) → DerivedView`** (recommended) | Single pure function (plus helpers). Input: character + optional content catalog. Output: view model the spreadsheet binds to. Also fills optional `derived` cache if callers want it. |
| C2. Incremental graph (nodes per skill/strike) | Better for huge sheets; unused at 0.9 scale. |
| C3. Per-tab compute | Easy to get inconsistent totals (Combat AC ≠ Play AC). Avoid. |

Suggested modules (under `app/src/engine/`):

```text
engine/
  proficiency.ts    rank → bonus; untrained does not add level
  attributes.ts     sum of boost amounts → modifier; modifierOverride / overrides win
  stacking.ts       item / status / circumstance / untyped (PF2e: same-type circumstance/status/item do not stack; take best)
  hp.ts
  ac.ts
  skills.ts
  strikes.ts
  spell.ts          spell attack / spell DC
  bulk.ts           integer tenths internally (issue I2)
  investiture.ts
  overrides.ts      apply overrides map last; record which paths were overridden
  resolveContent.ts Remaster id → legacy → custom (no-op until packs exist)
  compute.ts        orchestrator
```

Unknown `effects[].type` values are **ignored** (schema I4). Do not implement a general effect interpreter in 0.9.

#### C.2 Attribute math (0.9)

Locked: user enters **final boost totals**; no partial pairing.

| Option | Notes |
| --- | --- |
| **C-A1. modifier = sum(boost.amount)** (recommended) | Matches the current Attributes UI (one “boost count” number stored as a single `free` boost). Remaster play: +0 baseline. |
| C-A2. Also honor `legacyScore` → floor((score−10)/2) when `preferredRuleset === "legacy"` | Useful for imported-by-hand legacy sheets. Can add once C-A1 goldens pass. |
| C-A3. Auto-split boosts into ancestry/background/class/level rows | Nice UX; **not** required. Keep one aggregated boost until a boost-history editor exists. |

`attribute.modifierOverride` and `overrides["derived.attributeModifiers.str"]` (etc.) beat the sum.

#### C.3 Proficiency

Remaster/legacy core: **Untrained** = +0 (no level). **Trained+** = rank bonus + level.

| Rank | Bonus |
| --- | --- |
| untrained | 0 (no level) |
| trained | +2 + level |
| expert | +4 + level |
| master | +6 + level |
| legendary | +8 + level |

Confirm against Player Core when encoding goldens; if a table uses the older untrained −2 house style, that is a **campaign flag** and is **out of scope**.

#### C.4 HP, AC, strikes, spells, bulk (core only)

Implement as specified in design §6.1:

- **HP max** = `ancestryHp + (classHpPerLevel + Con modifier) * level + Σ bonuses` (`perLevel` bonuses × level).
- **AC** = 10 + capped Dex + armor proficiency (category of equipped armor, or unarmored) + item (armor AC + potency) + other breakdown fields; add shield item bonus only when `shieldRaised`.
- **Skill** = attribute + proficiency + breakdown; apply armor check penalty to skills with `armorPenaltyApplies` when armor’s `checkPenalty` applies (Str below armor Strength).
- **Strike attack** = attack attribute + weapon-category proficiency + item (potency) + breakdown; **damage** = dice string + damage attribute (if set). Snapshot fields on the strike are authoritative (no live item sync).
- **Spell attack / DC** = key attribute + spellcasting proficiency; DC = 10 + that bonus.
- **Bulk** = Σ (quantity × bulk) in tenths; capacity = 5 + Str modifier (unencumbered) and 10 + Str (maximum), plus `inventory.bulkBonus`.
- **Invested count** = number of `invested: true` items (display vs typical 10; do not hard-fail).

#### C.5 Overrides path grammar (issue I3)

| Option | Notes |
| --- | --- |
| **C-O1. Document a small allow-list** (recommended) | e.g. `derived.ac`, `derived.maxHp`, `derived.perception`, `derived.skillTotals.athletics`, `derived.strikes.<id>.attack`. Unknown keys stored but ignored with a console/status warning. |
| C-O2. JSON Pointer into the view model | More general; easier to foot-gun. |
| C-O3. Validate override keys in JSON Schema | Requires schema bump; defer. |

UI: overridden cells get a distinct style (border or suffix `*`) and remain editable as override, not as fake inputs.

---

### WP-D — Golden-test characters

Roles are locked; **exact picks are not**.

| # | Role | Option | Why pick it |
| --- | --- | --- | --- |
| 1 | Martial | **Fighter 5** (only option) | Armor + multiple strikes |
| 2 | Prepared arcane/occult | **D2a Wizard 5** (recommended) vs D2b Witch 5 | Wizard is the simpler prepared + spellbook case |
| 3 | Spontaneous | **D3a Bard 5** (recommended) vs D3b Sorcerer 5 | Bard is PC1, leaving PC2 slot free for #6; Sorcerer is PC2 and would double-dip |
| 4 | Divine prepared | **Cleric 5** (only option) | Doctrine + prepared divine |
| 5 | Companion | **D5a Ranger 5 + animal companion** (recommended) vs D5b Druid + companion | Ranger keeps Druid available as a later caster variant; companion subset sheet is the point |
| 6 | PC2 smoke | **D6a Champion 5** vs D6b Investigator 5 vs D6c Swashbuckler 5 vs D6d Oracle 3 | Champion stresses armor + class DC; Investigator stresses skills; Oracle stresses mystery spellcasting; level 3 is allowed and cheaper |

**Recommendation:** Fighter 5, Wizard 5, Bard 5, Cleric 5, Ranger 5 + companion, Champion 5.

Each fixture should assert at least: attribute modifiers, max HP, AC, Perception, Fort/Ref/Will, two skills, Class DC, one strike attack/damage, bulk used, invested count. Casters also assert spell attack + spell DC and a slot row. Companion fixture asserts nested sheet HP/AC/strike.

Until content packs exist, goldens may use `rulesetSource: "custom"` with numeric inputs filled in (ancestryHp, classHpPerLevel, armor stats on items). That still tests the engine. Swap ids to catalog refs in Phase 3.

---

### WP-E — Spreadsheet UI (Phase 2 remainder)

Scaffold tabs exist. Remaining work is **editors + derived columns**, not a new IA.

| Option | Notes |
| --- | --- |
| **E1. Generic `SheetTable` + row factories** (recommended) | One table component: columns config, add/remove row, input vs derived cells. Use for strikes, feats, items, spells, conditions, lore, daily resources. |
| E2. One-off tables per tab | Faster first editor; copy-paste debt by tab four. |
| E3. Excel-like formula bar | **Out of scope** (fancy UI). |

**Derived cell styling:** read-only, distinct background, `aria-readonly`. Inputs stay plain.

**Mobile:** keep horizontal scroll on wide tables; Play tab controls stay large enough for thumbs (already mostly numeric inputs).

**Priority order if following S1:**

1. Combat: equipped armor/shield selectors (from inventory), AC derived, strike rows (add/edit/delete)
2. Inventory: item rows (name, bulk, location, equipped, invested, armor/weapon/shield subfields)
3. Attributes: show computed modifier beside boost count
4. Skills: derived total column; add Lore row
5. Play: max HP display; conditions rows; daily resources
6. Feats / features / actions: structured rows + summary text (no automation)
7. Spells: one spellcasting entry editor (slots remaining, lists)
8. Identity leftovers: languages, traits, deity, subclass, XP
9. Companions: nested subset editor (needed for golden #5)

**Optional draft buffer (design §8):**

| Option | Notes |
| --- | --- |
| **E-D1. `idb-keyval` single key** (recommended) | One record: last edited document. Restore on boot with a confirm if it differs from “new sheet”. |
| E-D2. Dexie | Too much for one key. |
| E-D3. Skip until after 0.9 playtests | Refresh-loss is real; cheap to add. Prefer E-D1 once Save/Load validation is in. |

Do **not** grow this into a character library (lock).

---

### WP-F — i18n

Lock: catalogs from the start; `en` in 0.9; `es` in 1.0. Currently hardcoded English.

| Option | Notes |
| --- | --- |
| **F1. JSON message files + thin `t(key)` helper** (recommended) | No runtime i18n framework required. `app/src/locales/en.json`, later `es.json`. Select from `character.meta.locale` or a UI control. |
| F2. `react-i18next` | Standard, heavier. Worth it if interpolation/plural rules get painful. |
| F3. Postpone until Spanish work | **Violates** “strings externalized from the start” if more UI is added with literals. Extract **before** building many new editors, or extract in the same PRs as new strings. |

**Action:** add `en.json` and replace `App.tsx` literals as soon as WP-E starts adding editors. Do not translate `es` until Phase 4.

Content names (feat titles, spell names) live in the catalog, not in UI catalogs. UI catalogs are chrome only (“Save sheet”, column headers, rank labels).

---

### WP-G — Content packs (Phase 3)

Not in repo. Design §7 / §10: static JSON under `/content/remaster` and `/content/legacy`. Hybrid acquisition: **hand-maintained first**.

#### G.1 When

| Option | Notes |
| --- | --- |
| **G1. After the Fighter slice uses custom numeric inputs** (recommended) | Engine APIs (`ContentRef` resolve) exist; pack format can follow real call sites. |
| G2. Parallel stub files now | Empty `{ "id": "class.fighter", "name": "Fighter" }` rows. Low cost if kept tiny. |
| G3. Full PC1+PC2 before engine | S5; not recommended. |

#### G.2 Pack format (open — needs a later ADR)

Sketch only (not locked):

```text
content/
  remaster/
    ancestries.json
    heritages.json
    backgrounds.json
    classes.json          # hp per level, key attr, skill/armor/weapon prof by rank
    feats.json            # id, traits, summary; effects[] empty
    equipment.json        # weapons, armor, shields
    spells.json           # metadata for sheet structure, not encyclopedia text if license-limited
    conditions.json
    skills.json
  legacy/
    remap.json            # remasterId ← legacyId / renamed entries
```

Each entity: `id` (kebab path), `name`, `source.book`, optional `legacyId`, player-facing stats the engine needs.

| Option | Notes |
| --- | --- |
| **G-F1. Split files per entity kind** (recommended) | Matches the sketch; easier diffs. |
| G-F2. One `pack.json` | Simple import; painful reviews. |
| G-F3. Foundry/Pathbuilder dump | **Interop lock: no.** License and schema mismatch. |

**Licensing:** curated original summaries + stats the sheet needs; no GM-only text; no wholesale book reproduction. Optional attributed ORC import is **post-1.0** and needs a license review before any pipeline work.

**Fallback algorithm** (design §6.3): resolve Remaster id → on miss/error try `legacyId` / legacy pack → else `custom` with the stored `name`. Stamp `rulesetSource`. Isolate failures to the row.

---

### WP-H — PWA / platform

Plugin is configured; install and offline are unverified.

| Action | Option |
| --- | --- |
| Verify install (desktop + mobile) | Manual checklist once `npm run build && npm run preview` is used |
| Cache content packs | Workbox already globs `json`; keep packs under `public/content` or `app/public/content` so they are hashed/cached |
| Icons | Replace Vite default `favicon.svg` with a simple sheet icon (lightweight; no animation) |
| Draft buffer | WP-E E-D1 |

**Out of scope:** accounts, sync, share URLs.

---

### WP-I — Repo / engineering hygiene (small, high leverage)

| Item | Option |
| --- | --- |
| Root vs `app/` | Keep schema/fixtures/docs at repo root (current). App imports schema via relative path. |
| CI | **I1. GitHub Actions:** `npm --prefix app ci && npm --prefix app run lint && npm --prefix app test && npm --prefix app run build` (recommended once Vitest exists) |
| Schema tests | Validate all `fixtures/characters/**/*.json` in CI |
| Remove unused Vite assets | `hero.png` / default SVGs if unused (noise, not blocking) |

---

## 7. Recommended default plan

Assume **S1 + thin S4 prelude**, with the open picks in §6.

| Step | Package | Deliverable |
| --- | --- | --- |
| 1 | WP-A, WP-B, WP-I | Vitest, Ajv validation on Load/Save, fixture tests, CI |
| 2 | WP-C | `compute()` for attributes, proficiency, HP, AC, skills, bulk, investiture, one strike; overrides allow-list |
| 3 | WP-E (slice) | Derived cells + inventory item row + strike row + armor equip |
| 4 | WP-D #1 | Fighter 5 golden |
| 5 | WP-F | Extract `en` catalog from existing + new strings |
| 6 | WP-E/D | Remaining goldens and the editors they need (spells, companion, conditions) |
| 7 | WP-E-D1, WP-H | IndexedDB draft; PWA install/offline check |
| 8 | WP-G | Minimal remaster pack for golden ids + legacy remap stubs |
| 9 | Phase 4 | `es` catalog, stability, still core calcs only |

Steps 1–4 are the **next development increment**. Steps 5–7 finish a honest 0.9. Steps 8–9 are 1.0 / Phase 3–4.

---

## 8. What “Phase 1 done” and “0.9 done” mean

### Phase 1 (schema + core calc) — remaining definition of done

- [ ] Load and Save validate against `character.schema.json`
- [ ] `compute(character)` implements design §6.1 for the fields listed in WP-C.4
- [ ] Overrides apply last; unknown `effects` types ignored
- [ ] At least the Fighter 5 golden passes; other five goldens exist or are scheduled immediately after
- [ ] `derived` still omitted on Save
- [ ] Untrained proficiency does not add level; no max-level cap

### 0.9 (installable English sheet)

- [ ] Phase 1 done
- [ ] Row editors for every Appendix A domain that a player must persist (even if companion linkage is manual)
- [ ] Derived cells visible and distinct
- [ ] `en` message catalog (no new hardcoded chrome)
- [ ] Save/Load round-trip of a golden character
- [ ] PWA install + offline app shell verified once
- [ ] Optional single draft buffer
- [ ] Content: enough curated rows to build the golden set (full PC1+PC2 catalog may still be filling)

### 1.0

- [ ] Spanish catalog
- [ ] Stability pass on the same functional bar
- [ ] Still core calcs; `effects[]` unused except ignored

### Explicitly later

Reference sidebar; typed effect automation; ORC import pipeline; card UI; Pathbuilder/Foundry; dice; multi-sheet library; house-rule flags.

---

## 9. Risks

| ID | Risk | Mitigation |
| --- | --- | --- |
| I1 | Blank drafts are schema-valid but not playable | App-level “ready” checklist later; do not tighten schema yet |
| I2 | Decimal bulk float noise | Engine tenths; persist decimals |
| I3 | Free-form override paths | WP-C C-O1 allow-list |
| I4 | Open effect types | Ignore unknown |
| I8 | `equippedArmorItemId` dangling | App check on compute; skip armor if missing |
| N1 | Types drift from JSON Schema | Fixture validation in CI; generate types if schema changes again |
| N2 | Content licensing | Hand-maintained stats/summaries only; license review before any third-party dump |
| N3 | UI strings proliferate before i18n | Extract catalogs in the same PRs as new editors (F1) |
| N4 | PWA “configured” ≠ offline | One preview-build install test before calling 0.9 done |
| N5 | Companion nested sheet vs full PC | Keep subset; do not recurse `CharacterDocument` |
| N6 | Class-specific resources (kineticist, inventor, …) | `play.dailyResources` + `extensions` until specialized UI (schema I6) |

---

## 10. Open picks (need a decision or accept the default)

Defaults in **bold** are the continuation recommendation. Changing them does not require a product ADR unless a lock is violated.

| Pick | Default | Alternatives |
| --- | --- | --- |
| Sequence | **S1 vertical slice + validation prelude** | S2 engine-first; S3 UI-first |
| Test runner | **Vitest** | node:test |
| Validator | **Ajv 2020-12 in-app** | CI-only (ADR change) |
| Invalid Load | **Reject** | Warn-and-load |
| Engine API | **`compute(doc) → view`** | Incremental graph |
| Attribute modifier | **Sum of entered boosts** | Plus legacyScore path |
| Override keys | **Documented allow-list** | JSON Pointer |
| Prepared golden | **Wizard 5** | Witch 5 |
| Spontaneous golden | **Bard 5** | Sorcerer 5 |
| Companion golden | **Ranger 5 + animal companion** | Druid + companion |
| PC2 golden | **Champion 5** | Investigator / Swashbuckler / Oracle |
| Row UI | **Shared SheetTable** | Per-tab tables |
| i18n | **JSON + `t()`** | react-i18next |
| Draft buffer | **idb-keyval, one key** | Skip |
| Content files | **Split JSON per kind, after slice** | Monolith pack now |

---

## 11. Suggested first implementation issue slice

If the next change is code, not more design:

1. Add Vitest.
2. Validate both fixtures with Ajv; fail Load/Save on schema errors.
3. Implement `compute()` for boosts → modifiers, proficiency, HP, AC (unarmored), skills (no armor penalty yet).
4. Show those derived numbers on Attributes, Skills, and the identity-strip HP (max vs current).
5. Add `fixtures/characters/golden/fighter-5.json` as soon as inventory + strike editors exist; until then, a hand-written golden JSON loaded via Load sheet is enough to drive the engine tests.

That slice is enough to prove the 0.9 architecture without waiting on content packs or Spanish.

---

## Appendix — Document history

| Date | Change |
| --- | --- |
| 2026-08-14 | Initial continuation options from current scaffold vs locked design |
| 2026-08-14 | Marked executed after S1/S4; remaining options moved to `next-increment-design.md` |
