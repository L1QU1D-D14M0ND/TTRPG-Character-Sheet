# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A local-first, installable PWA **player** character sheet for tabletop systems, built spreadsheet-style (Build + Play, no dice roller, no VTT). Working title: **TTRPG Character Sheet**. The npm package is `ttrpg-character-sheet`. The GitHub repository is [L1QU1D-D14M0ND/TTRPG-Character-Sheet](https://github.com/L1QU1D-D14M0ND/TTRPG-Character-Sheet) (`https://github.com/L1QU1D-D14M0ND/TTRPG-Character-Sheet.git`). Both were renamed from the earlier PF2e-only-phase name `Pathfinder-2E-Card` / `pathfinder-2e-character-sheet` (see [ADR 0008](docs/adr/0008-repo-package-rename.md)); the name is not indicative of current scope beyond that. The old GitHub slug redirects to this URL. Lowercase `ttrpg-character-sheet` resolves to the same repository; the canonical GitHub name is `TTRPG-Character-Sheet`.

**Current product priority (read before making scope calls):** **Phase 5** ([`docs/phase-5.md`](docs/phase-5.md), [`docs/sidebar-tools-encyclopedia.md`](docs/sidebar-tools-encyclopedia.md)). The encyclopedia smoke set has landed. Further paragraphs in `content/pf1e/ogc/entries.json` are one batch per change (E-R and F1a–F2c landed; next: F3a, Acrobatic–Extra Ki). CRB and APG stay mechanics-only. Pathfinder **Second Edition (PF2e)** must not regress and is deferred to a later release — that release is not Phase 5. If a task looks like "add a PF2e feature," check [`docs/ROADMAP.md`](docs/ROADMAP.md) and [ADR 0003](docs/adr/0003-multi-system-product-direction.md) first.

Everything here is governed by a stack of ADRs in `docs/adr/`. When a change touches product scope, schema shape, or shared-vs-per-system code, check the relevant ADR before assuming; a lot of scope decisions in this repo are deliberately locked, not open design space.

## Commands

All commands run from `app/`:

```bash
cd app
npm install          # or: npm ci
npm run dev           # Vite dev server
npm run build          # tsc -b && vite build (type-check is part of build, not a separate step)
npm run lint            # oxlint
npm test                 # vitest run (single run, CI mode)
npm run test:watch        # vitest watch mode
npm run preview            # serve the built dist/
npm run verify:pwa           # dist artifact check: manifest, icons, Workbox SW (run after build)
```

Run a single test file or test name with vitest directly, e.g.:

```bash
npx vitest run src/systems/pf1e/engine/fighter5.golden.test.ts
npx vitest run -t "loads and computes"
```

CI (`.github/workflows/ci.yml`) runs, in order: `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npm run verify:pwa`. Match that order locally before considering work done — `verify:pwa` only makes sense after a build (it checks `app/dist/`, not source).

There is no root-level `package.json`; the app lives entirely under `app/`. `schemas/`, `content/`, `fixtures/`, and `docs/` are plain JSON/Markdown consumed by the app at build/test time (via `path.resolve` from `app/vite.config.ts`, and via `readRepoFile`/`readRepoJson` helpers in tests) — not npm packages.

## Architecture

### Three layers (ADR 0004)

1. **Platform** — Vite, React 19, PWA plugin, CI. One app, one build.
2. **Shared kernel** (`app/src/shared/`) — edition-blind mechanics only: ids (`ids.ts`), signed-number formatting (`format.ts`), the `system` discriminator and envelope helpers (`envelope.ts`), Ajv schema compilation (`validate.ts`), Save/Load file IO (`saveLoad.ts`), generic override *application* (`overrides.ts` — the allow-list itself is per-system), i18n runtime (`i18n/`), and shared UI primitives (`ui/DerivedCell.tsx`, `ui/NotesPanel.tsx`, `ui/rows.ts` immutable row edit helpers).
3. **System modules** (`app/src/systems/pf1e/`, `app/src/systems/pf2e/`) — each owns its own schema/types, `compute()` calc engine, class/skill tables, and spreadsheet panels. **No cross-imports between `systems/pf1e` and `systems/pf2e`.**

**Do not** merge these into one `CharacterDocument` type or one JSON Schema `oneOf`. PF1e and PF2e are deliberately two engines, not a shared model with edition flags — see "What does not transfer" in [ADR 0003](docs/adr/0003-multi-system-product-direction.md#what-does-not-transfer-why-two-engines). PF2e has proficiency ranks/stacking/single AC/MAP/bulk/hero points/dying track; PF1e has flat ability scores, per-class BAB/save progressions, three ACs + CMB/CMD, iteratives, and free multiclassing via a `classes[]` array. Lookalike concepts (AC, "level", spell DC, encumbrance) intentionally keep different names/types per system even when a UI tab has the same title.

### The `SystemModule` interface (`app/src/shell/types.ts`)

The shell (`app/src/shell/App.tsx`) talks to each system only through this interface: `id`, `displayNameKey`, `validate`, `createEmpty`, `compute`, `parse`/`serialize`/`download`/`readFile`, `suggestedFilename`, a `Workspace` component, and `sidebarTools[]`. Each system exports one module object (`app/src/systems/pf1e/module.ts`, `app/src/systems/pf2e/module.ts`). `app/src/shell/registry.ts` holds the two registered modules plus `matchSheet`/`createSheet`/`serializeSheet`/`parseSheetFor` helpers that switch on the loaded sheet's `system`. `App.tsx` has exactly one typed switch (`sheet.system === 'pf1e' ? ... : ...`) to mount the right module — that's intentional (TypeScript can't erase the discriminated union), don't try to generalize it away.

Adding a third system means adding a new module + registering it in `registry.ts`/`SYSTEM_IDS`, not touching PF1e/PF2e engines.

### Data flow per sheet

1. **Envelope**: every saved document has a top-level `system: "pf1e" | "pf2e"`. A file with no `system` field loads as `pf2e` (back-compat with pre-multi-system fixtures) — see `resolveSystemId` in `app/src/shared/envelope.ts`. PF1e documents *require* `system: "pf1e"`. Never change this default silently; it's a locked ADR 0003 behavior existing fixtures depend on.
2. **Validate**: `validate(data)` in each system's `character/validate.ts` compiles the system's JSON Schema (`schemas/character.schema.json` for PF2e, `schemas/pf1e/character.schema.json` for PF1e) via the shared Ajv helper (`app/src/shared/validate.ts`) and throws `CharacterValidationError` on failure.
3. **Compute**: `compute(doc)` in each system's `engine/compute.ts` derives everything the sheet displays (HP, AC, modifiers, etc.) as a `DerivedView`. Overrides are applied **last**, via `applyOverrides` (shared) + a per-system `applyOne` allow-list — never let engine math read overrides mid-calculation.
4. **Save**: strips `derived` before writing JSON (derived state is never persisted — it's recomputed on load).
5. **Persistence model**: one active sheet in memory, explicit Save/Load `.json` (no cloud, no character library), plus one autosaved IndexedDB **draft** (refresh-restore only, debounced ~400ms — see the autosave `useEffect` in `App.tsx` and `app/src/shell/draftStore.ts`). This is not multi-document storage; don't add one without a product decision.

### PF1e content packs (`content/pf1e/`, loaded via `app/src/systems/pf1e/content/`)

Content packs are plain JSON (classes/races/items/feats/spells/archetypes/evolutions) registered into an in-memory catalog at module load (`packRegistry.ts` — `register*Pack`/`lookup*`), validated against `schemas/content/pf1e/*.schema.json`, and consumed by the engine/panels via lookup functions re-exported from `content/index.ts`. `content/pf1e/crb/` is the Core Rulebook pack; `content/pf1e/apg/` is the APG Summoner/Synthesist pack. **These are two separate packs on purpose — `class.summoner` must never be added to the CRB pack** (a Vitest license-gate test, `content/licenseGate.test.ts`, enforces this and other rules below).

**Licensing constraint (ADR 0007) — this is a hard rule, not a style preference:** pack JSON under `content/pf1e/crb/` and `content/pf1e/apg/` is **mechanics-only**. No `description`/`summary`/`benefit`/`flavor`/`text`/`body`/etc. keys, no Product Identity (Golarion place names, Paizo branding, adventure/NPC names). A test scans every pack file for forbidden keys and a PI word list. Phase 5.1 rules text goes in `content/pf1e/ogc/` with `body` as the only prose field, plus the OGL notice, per [`docs/sidebar-tools-encyclopedia.md`](docs/sidebar-tools-encyclopedia.md).

### Golden fixtures and regression tests

`fixtures/characters/golden/**/*.json` are full example characters used both as documentation and as regression tests. `app/src/shell/goldens.stability.test.ts` loads every golden through `parseLoadedSheet` and asserts it computes without error — this is the fastest way to sanity-check that a schema/engine change didn't break existing saves. Each system also has its own per-character golden tests (e.g. `app/src/systems/pf1e/engine/fighter5.golden.test.ts`, `synthesist5.golden.test.ts`) that assert specific derived numbers. **When changing engine math, run the golden tests for the system you touched and keep both systems' goldens green** — PF2e goldens are a regression net, not dead code to prune.

CRB "batch" test files (`crbBatch1.test.ts` … `crbBatch21.test.ts`, `crbBatchW1.test.ts` … `crbBatchW7.test.ts`, `crbBatchF1a.test.ts` … `crbBatchF4.test.ts`, `crbBatchS1.test.ts` … `crbBatchS5.test.ts`) are incremental content-pack coverage added batch-by-batch per [`docs/pf1e-crb-pack-design.md`](docs/pf1e-crb-pack-design.md); new CRB content generally gets its own batch test rather than being folded into an existing one.

### i18n

`app/src/shared/i18n/` (`I18nProvider`/`useI18n`/`useT`) resolves `some.nested.key` against `app/src/locales/{en,es}.json`, falling back to English then the raw key if missing. Locale is persisted to `localStorage` and stamped onto `character.meta.locale` on save/draft (see `stampSheetLocale` in `registry.ts`). Shell chrome and PF1e panels are localized; **PF2e panel literals are intentionally not yet extracted** (deferred alongside the rest of PF2e work — see ADR 0003 postscript). Don't assume every user-facing string in PF2e panels is a bug; it's tracked, deferred work.

### Sidebar host (ADR 0005)

`app/src/shell/sidebar/SidebarHost.tsx` is a registry-based rail shown beside the loaded sheet. Tools read `character`/`derived` and write only through the same `update(mutator)` path the spreadsheet panels use — no parallel state, no bypassing Ajv validation on save. All three named tools (**Attack Helper**, **Actions List**, and **Budget Calculator**; see `docs/sidebar-tools-*.md`) have **landed** in `app/src/shell/sidebar/tools/` and are registered on both `pf1eModule.sidebarTools` and `pf2eModule.sidebarTools` (no in-app dice; physical table dice only). The encyclopedia (`shell.encyclopedia`) is registered on the PF1e sidebar only. Empty/collapsed host default and `focusTab` contracts are preserved.

### PWA

`vite-plugin-pwa` (`app/vite.config.ts`) emits a Workbox service worker + manifest on `npm run build`. `npm run verify:pwa` (`app/scripts/verify-pwa.mjs`) checks the **built artifacts** in `app/dist/` (standalone manifest, 192/512 PNG icons, a Workbox precache SW, manifest link in `index.html`) — it is not a runtime/offline test. Manual install/offline verification steps are in `app/README.md`.

## Conventions worth knowing before editing

- Prefer reading the linked ADR/design doc before changing behavior it locks — this repo tracks a lot of "decided, not open" scope in `docs/adr/*.md` and `docs/*.md`, and the README's "Docs" section indexes all of them.
- `docs/ROADMAP.md` states the current phase and status date at the top — check it for what's actually in scope right now versus deferred.
- Lint is `oxlint` (`app/.oxlintrc.json`), not ESLint; rules currently enforced: `react/rules-of-hooks` (error) and `react/only-export-components` (warn).
- Tests are Vitest, `environment: 'node'` (not jsdom) per `app/vite.config.ts`, except where a test explicitly needs DOM (`@testing-library/react` + `jsdom` are devDependencies for that case).
- Repo-relative file reads in tests go through `readRepoFile`/`readRepoJson` (`app/src/test/readRepoFile.ts`), which resolves paths relative to the repo root, not `app/`.
- `.claude/skills/` has six imported skills (`tdd`, `diagnosing-bugs`, `codebase-design`, `improve-codebase-architecture`, `grilling`, `domain-modeling`; see `.claude/skills/README.md` for provenance) — use `tdd` for red-green-refactor work on engine math, `diagnosing-bugs` for hard engine/compute bugs, and `codebase-design`/`improve-codebase-architecture` before proposing refactors, since this repo's `SystemModule`/kernel split already follows that "deep module" discipline. `domain-modeling`'s ADR template is a minimal fallback — this repo's own ADR format (Status/Date/Decision/Consequences, see `docs/adr/`) is the one to actually follow.
