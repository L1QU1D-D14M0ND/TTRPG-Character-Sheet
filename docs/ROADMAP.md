# Roadmap

**This file is the single source of truth for project status.** README, `AGENTS.md`, `CLAUDE.md`, and the design docs link here instead of restating the current phase. When a milestone lands, update this file; other docs change only if a rule they state changes.

Product decisions live in [ADR 0003](adr/0003-multi-system-product-direction.md) and the [umbrella design](ttrpg-character-sheet-design.md). All docs are indexed in [`README.md`](README.md). Finished phases, merged-branch notes, and the dated change log are in [`archive/roadmap-history.md`](archive/roadmap-history.md).

**Status date:** 2026-10-28  
**Current phase:** **Phase 5** ([`phase-5.md`](phase-5.md)).  
**Next work:** **Phase 5.2 — localized catalog names.**

---

## Now — Phase 5

Slice order and done-when criteria: [`phase-5.md`](phase-5.md).

- [x] **5.1 Encyclopedia** — `shell.encyclopedia` on the PF1e sidebar; `content/pf1e/ogc/` is complete at 829 rows (177 CRB feats, 3 CRB features, 622 CRB spells, 27 APG spells) with the OGL 1.0a notice and Section 15. CRB and APG packs stay mechanics-only. Spec: [`sidebar-tools-encyclopedia.md`](sidebar-tools-encyclopedia.md)
- [ ] **5.2 Localized catalog names** — a second name per row from a curated source, not `es.json` ([`content-licensing.md`](content-licensing.md) §5)
- [ ] **5.3 Typed `effects[]` automation** — unknown types stay ignored; not a bonus-type stacker
- [ ] **5.4 Optional card-oriented play surfaces** — no spec; do not start during 5.1–5.3
- [ ] **5.5 Additional systems behind `system`** — no third engine in 5.1–5.4

Out of scope for Phase 5 unless a later ADR says otherwise: dice roller, cloud, VTT interop, house-rule flags, GM-exclusive content, multi-character library.

---

## Later release — Second Edition

Frozen. Do not start this work in a Phase 5 PR. The PF2e slice stays in the app and must not regress.

Already in the repo (kept; must not regress):

- [x] PF2e schema v1, types, factory, Ajv, `compute()` (HP, AC, skills, strikes, spell attack/DC, bulk, investiture, overrides)
- [x] Goldens: PF2e Fighter 5; Wizard 5; Bard 5; Cleric 5; Ranger 5
- [x] Spreadsheet editors except companions
- [x] Vitest + CI
- [x] English catalogs for chrome + PF1e panels; locale runtime exists; `es.json` covers those keys. PF2e panel literals remain
- [x] IndexedDB draft buffer
- [x] PWA dist artifacts (`verify:pwa` after build). Runtime install/offline stays a manual [`app/README.md`](../app/README.md) step

Not started (later PF2e release):

- [ ] PF2e goldens: one Player Core 2 class
- [ ] Companion nested-sheet editor
- [ ] Override UI (engine works; no cell editor)
- [ ] Remaster + legacy content packs
- [ ] PF2e panel i18n catalogs

PF2e content (not started):

- [ ] Curated Remaster Player Core player catalog
- [ ] Player Core 2 player catalog
- [ ] Legacy fallback rows; `rulesetSource` stamp

---

## Landed milestones

| Milestone | Landed | What it means |
| --- | --- | --- |
| **0.9** | 2026-08-17 | Installable English PWA; PF1e Fighter 5 / Wizard 5 / multiclass goldens; PF2e slice preserved; Save/Load with a `system` discriminator; empty Tools sidebar |
| **1.0** | 2026-08-19 | Spanish locale; playable APG Synthesist Summoner |
| **Finish First Edition** | 2026-09-24 | Whole CRB player catalog (classes, races, mundane gear, 177 feats, 622 spells), APG follow-through, catalog picker (ADR 0009), Attack Helper, Actions List, Budget Calculator, extra PF1e goldens |
| **Pre-release hygiene** | 2026-10-03 | Non-affiliation disclaimer, NOTICE, About dialog, CONTRIBUTING, SECURITY |
| **Phase 5.1** | 2026-10-26 | Encyclopedia and OGC pack complete |

Per-phase checklists (Phases 0, 0b, M, 1e, 2e, 3e, 3c, Sb, 4, and 1x): [`archive/roadmap-history.md`](archive/roadmap-history.md).

---

## Domain coverage

### PF1e (target)

| Domain | Schema | UI editor | Derived calcs |
| --- | --- | --- | --- |
| Identity / race / alignment / `classes[]` | Yes | Yes | Level from class sum |
| Ability scores | Yes | Yes | Modifiers |
| BAB, saves, iteratives | Yes | Yes (derived) | Yes |
| AC / touch / FF, CMB / CMD | Yes | Yes | Yes |
| HP (HD + Con) | Yes | Yes | Yes |
| Skills (ranks) | Yes | Yes | Yes |
| Feats / features | Yes | Yes | n/a (effects ignored) |
| Inventory (pounds) | Yes | Yes | Weight + load; Ignore weight |
| Spellcasting | Yes | Yes | DC + bonus slots |
| Play (negative HP, conditions) | Yes | Yes | Dead-at threshold |
| Overrides + Save/Load | Yes | Save/Load yes | Overrides applied |

### PF2e (in repo)

| Domain | Schema | UI editor | Derived calcs |
| --- | --- | --- | --- |
| Identity / level / XP / ancestry / class | Yes | Yes | n/a |
| Attributes + boost history | Yes | Boost total | Yes (modifiers) |
| Perception, saves, class DC | Yes | Yes | Yes |
| AC + armor + shield | Yes | Yes | Yes |
| HP max/current/temp + dying | Yes | Yes | Max HP yes |
| Speeds, senses, languages, traits | Yes | Yes | n/a |
| Skills + lore + armor/weapon prof | Yes | Yes | Skills yes |
| Strikes | Yes | Yes | Attack/damage |
| Feats / features / actions | Yes | Yes | n/a (effects ignored) |
| Inventory, bulk, investment, wealth | Yes | Yes | Bulk/invest |
| Spellcasting / slots / focus | Yes | Yes | Spell attack/DC |
| Companions | Yes | No | No |
| Conditions, hero points, daily resources | Yes | Yes | n/a |
| Notes | Yes | Yes | n/a |
| Overrides + Save/Load | Yes | Save/Load yes; override UI no | Overrides applied |
| i18n catalogs (`en` → `es`) | n/a | Chrome + PF1e `es.json`; PF2e panel literals remain | n/a |

---

## Document history

Entries up to 2026-10-26 are in [`archive/roadmap-history.md`](archive/roadmap-history.md#document-history).

| Date | Change |
| --- | --- |
| 2026-10-28 | Docs cleanup: this file is the single status source. Finished phases and the change log moved to the archive. Next work is Phase 5.2 |
