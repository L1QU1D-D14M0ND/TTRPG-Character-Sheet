# Roadmap

Operational tracker for **TTRPG Character Sheet** (working title). Product decisions live in [ADR 0003](adr/0003-multi-system-product-direction.md) and the [umbrella design](ttrpg-character-sheet-design.md). Reuse boundaries: [ADR 0004](adr/0004-shared-kernel.md), [`shared-kernel-design.md`](shared-kernel-design.md). Sidebar host: [ADR 0005](adr/0005-sidebar-host.md), [`sidebar-host-design.md`](sidebar-host-design.md). Content licensing: [ADR 0007](adr/0007-content-licensing.md), [`content-licensing.md`](content-licensing.md). PF1e system spec: [`pf1e-character-sheet-design.md`](pf1e-character-sheet-design.md). PF2e system spec: [`pf2e-dynamic-character-sheet-design.md`](pf2e-dynamic-character-sheet-design.md) (ADR 0001 superseded; [ADR 0002](adr/0002-character-schema.md) still governs PF2e documents). Sequencing: [Phase 5](phase-5.md). The [multi-system next increment](next-increment-multi-system.md) is the executed record of Phases M–1x. Historical PF2e sequencing: [continuation design](continuation-design.md) (S1/S4 executed), [next increment (PF2e)](next-increment-design.md) (T1/T3 executed; leftover goldens deprioritized).

**Status date:** 2026-10-03  
**Current phase:** **Phase 5.** Sequencing: [`phase-5.md`](phase-5.md). First Edition is complete (1.0, CRB batches 1–21 and W1–W7, all 177 CRB feats, all 622 CRB spells, APG Summoner `spellsPerDay` + 27 spells, catalog picker, Attack Helper, Actions List, Budget Calculator). Pre-release hygiene landed (disclaimer, NOTICE, About dialog, CONTRIBUTING, SECURITY). The PF2e slice stays in the app and must not regress. Remaining PF2e work waits for a **later release** (PC2 golden, companion editor, Remaster packs, PF2e panel i18n) and is **not** Phase 5.  

**0.9 bar:** landed (English PWA, PF1e Fighter 5 / Wizard 5 / multiclass, PF2e slice, Save/Load, empty Tools sidebar). **1.0** is Spanish + playable APG Synthesist.

---

## Target milestones

**0.9** — installable English PWA; spreadsheet Build + Play; **PF1e** core calcs + editors for Fighter 5, Wizard 5, and one multiclass golden; **PF2e** existing slice (Fighter 5, Wizard 5, current editors) still loads and computes; Save/Load one sheet with a `system` discriminator; **sidebar host** may be empty or collapsed (no named tools required).

**1.0** — Spanish locale; same 0.9 bar, called stable; **PF1e player can build and play an APG Synthesist Summoner** (fused eidolon). Still core calcs; no in-app dice.

**Finish First Edition** — landed. Honesty/code fixes, CRB pack fill-out (177 feats, 622 spells), APG follow-through (Summoner `spellsPerDay` + 27 spells), optional extra PF1e goldens (Cleric 5, Duelist, Ranger companion), catalog picker (ADR 0009 slices 1 & 2), and all three sidebar tools (Attack Helper, Actions List, Budget Calculator) have landed. Pre-release hygiene (legal disclaimer, NOTICE, About modal, CONTRIBUTING, SECURITY) landed.

**Phase 5 (current)** — encyclopedia (rules text, with the OGL notice in that same change), then localized catalog names, then typed `effects[]`, then optional card surfaces, then additional systems. See [`phase-5.md`](phase-5.md).

**Later release — Second Edition** — leftover PF2e goldens (PC2 class), companion nested editor, Remaster/legacy packs, PF2e panel i18n. Do not start that work in Phase 5.

---

## Phase 0 — Original PF2e design lock

**Status:** Done (historical)

- [x] PF2e-only product decisions ([ADR 0001](adr/0001-product-direction.md), superseded)
- [x] PF2e character JSON schema v1 ([`schemas/character.schema.json`](../schemas/character.schema.json), [ADR 0002](adr/0002-character-schema.md))
- [x] PF2e design doc v1.0 lock

---

## Phase 0b — Multi-system product lock

**Status:** Done (this documentation change)

- [x] Pivot to a multi-system player sheet; **PF1e development priority**; PF2e slice preserved ([ADR 0003](adr/0003-multi-system-product-direction.md))
- [x] Umbrella design ([`ttrpg-character-sheet-design.md`](ttrpg-character-sheet-design.md))
- [x] PF1e system spec + schema target notes
- [x] Roadmap and next-increment retargeted
- [x] Shared kernel vs per-system inventory ([ADR 0004](adr/0004-shared-kernel.md))
- [x] Loaded-sheet sidebar host; tools TBD ([ADR 0005](adr/0005-sidebar-host.md))
- [x] Working display name in PWA chrome (deferred to Phase M)

---

## Phase M — Multi-system refactor

**Status:** Done (2026-08-17)

- [x] Add `system` to saved documents (`pf2e` on Save; missing on Load → `pf2e`)
- [x] Extract shared kernel (`newId`, strip-derived, Ajv helper, Save/Load wiring, `DerivedCell`) and `SystemModule` registry ([ADR 0004](adr/0004-shared-kernel.md))
- [x] Isolate PF2e types/engine/panels so a second system can sit beside them (no cross-imports)
- [x] New sheet still produces a valid PF2e document until PF1e factory exists
- [x] Existing PF2e goldens and unit tests stay green
- [x] Leave shell layout room for a sidebar rail (empty/collapsed aside OK)
- [x] Locale runtime (`I18nProvider` / `useT()`, `es.json` stub falling back to English). Chrome + PF1e panels extracted; PF2e panel literals remain (T4′)

Working display name in chrome is **TTRPG Character Sheet**.

---

## Phase 1e — PF1e schema + martial core

**Status:** Done (2026-08-17)

- [x] PF1e JSON Schema + schema ADR (analog of ADR 0002) — [ADR 0006](adr/0006-pf1e-character-schema.md)
- [x] TypeScript types; empty-sheet factory (seeded PF1e skills)
- [x] Ajv validate Load/Save for `system: "pf1e"`
- [x] Core calc: ability modifiers, BAB, saves, HP, AC/touch/FF, CMB/CMD, iteratives, skills, pounds/load
- [x] Overrides last; unknown `effects[]` ignored
- [x] Golden: PF1e Fighter 5
- [x] New sheet: user can choose PF1e
- [x] Editors enough to enter that Fighter (identity/classes, abilities, skills, combat, inventory subset)

---

## Phase 2e — PF1e prepared caster

**Status:** Done (2026-08-17)

- [x] Spell DC + bonus spells from ability in `compute()`
- [x] Spellcasting entry editor (slots, lists)
- [x] Golden: PF1e Wizard 5

---

## Phase 3e — PF1e multiclass

**Status:** Done (2026-08-17)

- [x] Two (or more) class rows in UI; stacked BAB/saves/HD
- [x] Golden: Fighter 2 / Wizard 3 (or equivalent mixed BAB)

---

## Phase 3c — PF1e content pack

**Status:** Mechanic batches done (1–21 and W1–W7, including Batch 7). OGL / PI review landed. Fill-out after 15 lives in Phase 1x.

- [x] Batch 1 review: ability modifiers; BAB + save progressions — [`pf1e-crb-pack-design.md`](pf1e-crb-pack-design.md)
- [x] Pack scaffold `content/pf1e/crb/` + Fighter / Wizard progression tags
- [x] Lookup: catalog id → custom; unknown id does not throw
- [x] Batch 2: HP breakdown dialog (manual HD rolls) + iterative attacks (CRB slash line)
- [x] **Batch 3:** AC / touch / FF + CMB / CMD — CRB procedure + table tests; UI honesty already landed; no new catalog; no typed-bonus stacker
- [x] **Batch 4:** skills (ranks, class +3, ACP) + max ranks = level; warn/blank already landed; class-skill lists wait for 9
- [x] **Batch 5:** size tables (AC/attack vs CMB/CMD vs carry) — goldens stay Medium
- [x] **Batch 6:** encumbrance (Strength heavy-load table; light / medium / heavy) — Ignore weight opt-out; penalties not auto-written
- [x] **Batch 8:** Human race catalog id — +2 stays typed into scores
- [x] **Batch 9:** Fighter/Wizard class skills + skill points — stamp checkboxes; ranks not auto-spent
- [x] **Batch 10:** weapons/armor ids on the three goldens — documentary stamp only; AC/attacks stay typed
- [x] **Batch 11:** remaining 9 CRB classes — same catalog row / apply / stamp / pool as Fighter and Wizard
- [x] **Batch 12:** feat catalog ids on the three goldens — documentary stamp only; Combat math stays typed
- [x] **Batch 13:** spell catalog ids on the Wizard / multiclass goldens — documentary stamp only; slots/DCs stay typed
- [x] **Batch 7:** spell DC / bonus slots — CRB table tests; slots stay user-entered; Spell Focus does not change DC
- [x] **Batch 14:** remaining CRB player races + size stamp — ability adjustments stay typed; Human extra skill rank stays `race.human` only
- [x] **Batch 15:** class spells-per-day tables + hybrid Max — click to customize, empty resets; remaining stays play state
- [x] OGL / Product Identity review — pack stays mechanics-only; no OGL notice until rules text ([ADR 0007](adr/0007-content-licensing.md))

Goldens still store numeric combat/skill/slot inputs on the sheet (catalog stamps HD/BAB/saves/class skills when the player picks a CRB class, race id/name/size when they pick a CRB race, documentary item fields when they pick a catalog weapon or armor, feat name/category when they pick a catalog feat, and spell name/level when they pick a catalog spell). Remaining feat/spell ids wait until after honesty/code fixes.

---

## Phase Sb — Sidebar host

**Status:** Done (thin host, 2026-08-17; named tools landed 2026-09-20).

- [x] Collapsible rail on the loaded sheet (New or Load)
- [x] Tool registry + empty state; `SidebarToolContext` (`character`, `derived`, `update`)
- [x] Mobile collapsed by default (and desktop starts collapsed while the registry is empty)
- [x] No named tools required (list specified later)
- [x] **Attack Helper** (last character-sheet feature — landed) — [`sidebar-tools-attack-helper.md`](sidebar-tools-attack-helper.md)
- [x] **Actions List** (last character-sheet feature — landed) — [`sidebar-tools-actions-list.md`](sidebar-tools-actions-list.md)
- [x] **Budget Calculator** (last character-sheet feature — landed) — [`sidebar-tools-budget-calculator.md`](sidebar-tools-budget-calculator.md)

See [ADR 0005](adr/0005-sidebar-host.md), [`sidebar-host-design.md`](sidebar-host-design.md).

---

## Phase 1–2 leftover (PF2e) — later release

**Status:** Frozen for this release. Bard 5, Cleric 5, and Ranger 5 goldens already in the tree; remaining §12 golden is the PC2 smoke test. Do not continue that set until a later PF2e *release*.

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

---

## Phase 3 (PF2e content) — later release

**Status:** Not started (0%). Sequenced with the later PF2e *release*, not this First Edition finish.

- [ ] Curated Remaster Player Core player catalog
- [ ] Player Core 2 player catalog
- [ ] Legacy fallback rows; `rulesetSource` stamp

---

## Phase 4 — 1.0

**Status:** Done (2026-08-19)

- [x] Spanish (`es`) locale catalog
- [x] Stability pass on the 0.9 bar (PF1e CRB goldens + PF2e slice); still core calcs only
- [x] APG pack scaffold + Summoner class catalog (HD/BAB/saves/class skills) — [`pf1e-apg-pack-design.md`](pf1e-apg-pack-design.md)
- [x] Synthesist documentary archetype stamp (name only; no fused math)
- [x] Documentary evolution names
- [x] Fused STR/DEX/CON overlay + costume HP (not auto-applied evolutions)
- [x] Synthesist Summoner golden (Half-Elf Radiant Striker)
- [x] **Playable APG Synthesist Summoner** — fused eidolon as a transformation (separate APG pack; do not add Summoner to the CRB catalog). Player can build and play at the table: pilot vs fused physical scores, costume HP, evolution rows, Summoner spells. Not a nested second PC sheet. Not auto-applied evolutions.

---

## Phase 1x — Finish First Edition

**Status:** Done (2026-09-24). PF2e leftover waits for a later *release*, not for Phase 5. The OGL notice moved to Phase 5.1, because it ships with the first rules-text prose.

Bar: a player can build and play PF1e from catalog beyond the four goldens, still core calcs, still mechanics-only until rules text. Keep Summoner out of the CRB pack. Existing PF1e and PF2e goldens must stay green.

Landed catalog (do not re-open):

- [x] **CRB Batch 14** — remaining player races + size stamp (ability adjustments stay typed)
- [x] **CRB Batch 15** — class spells-per-day tables + hybrid Max (click to customize, empty resets)
- [x] **CRB Batch 16** — remaining simple melee + simple ranged (and simple ammo)
- [x] **CRB Batch 17** — martial light + remaining martial one-handed
- [x] **CRB Batch 18** — martial two-handed + martial ranged (and arrows)
- [x] **CRB Batch 19** — exotic melee + exotic ranged
- [x] **CRB weapon properties W1** — `reach` on a `weapon.properties` array of N tags (one or many). [`pf1e-crb-pack-design.md`](pf1e-crb-pack-design.md) §7.6
- [x] **CRB weapon properties W2** — `brace` appended on the same list (longspear keeps reach).
- [x] **CRB weapon properties W3** — `trip` appended on the same list (guisarme keeps reach; kama is N = 1).
- [x] **CRB weapon properties W4** — `disarm` appended on the same list (nunchaku is N = 1; whip keeps reach and trip).
- [x] **CRB weapon properties W5** — `monk` appended on the same list (siangham is N = 1; kama keeps trip; nunchaku/sai keep disarm). [`pf1e-crb-pack-design.md`](pf1e-crb-pack-design.md) §7.6
- [x] **CRB weapon properties W6** — `nonlethal` appended on the same list (sap is N = 1; bolas keeps trip; whip keeps reach, trip, and disarm).
- [x] **CRB weapon properties W7** — `double` appended on the same list, plus a documentary `secondHead` (two-bladed sword is N = 1; quarterstaff keeps monk). Primary dice stay a single string.
- [x] **CRB Batch 20** — remaining light + medium armor
- [x] **CRB Batch 21** — heavy armor + shields

### Phase 1x — priority override: playtest character

**Status:** Done (2026-09-12). Supersedes the default Phase 1x order (honesty fixes → remaining feats/spells → APG → optional goldens → magic overlay → OGL → sidebar tools) **for this slice only**; that order resumes once this bar is met.

**Source:** a played character sheet (CRB Wizard 7, Transmutation specialist, opposition schools Necromancy + Enchantment; homebrew Mana pool, Hero Points, and several custom magic items/spells). Full transcription and gap cross-reference: [`pf1e-playtest-flare-nightingale.md`](pf1e-playtest-flare-nightingale.md).

Bar: that character (or an equivalent CRB Transmutation Wizard) can be **built and played** in the app, not just saved as a document:

- [x] **Wizard arcane school (specialist)** — school pick + opposition schools as a structured field on the class row (documentary; `compute()` does not enforce prepared-spell legality against opposition schools yet, matching the existing "no auto-application" bar for feats/effects). This is CRB core, not APG — closes the gap called out since [`pf1e-character-sheet-design.md`](pf1e-character-sheet-design.md) row 10 ("domain/school slots are extra rows, not auto-granted")
- [x] **Bonus school spell slot** — one extra slot per spell level the specialist can cast, from the chosen school; same hybrid-Max pattern as Batch 15 (typed override, empty resets)
- [x] **CRB Wizard school powers as catalog features** — Physical Enhancement, Telekinetic Fist, Arcane Bond (Batch 11's per-class feature stamp pattern); documentary text + `levelGained`, no automatic ability-score/attack math (same boundary as feats)
- [x] **Targeted CRB spell catalog fill** — pack the Wizard-list spells this character's spellbook actually uses (levels 0–4) ahead of the rest of the locked S1–S5 alphabetical order; anything outside the CRB list (homebrew spells) stays a custom `ContentRef` row, unpacked
- [x] **Targeted CRB feat catalog fill** — pack this character's remaining feats (Eschew Materials, Heighten Spell, Craft Wondrous Item, Craft Magic Arms and Armor, Craft Construct, Point Blank Shot) ahead of the rest of the locked F1–F4 order
- [x] **Expose `vitals.resistances` / `senses` / `speeds` in a PF1e panel** — schema already carries these ([ADR 0006](adr/0006-pf1e-character-schema.md)); no panel reads or writes them today, so damage reduction and similar defenses have no UI entry point
- [x] Confirm **Mana pool** and **Hero Points** need no schema/engine change — both fit today as named `play.dailyResources` rows (name/max/remaining); do **not** build a bespoke resource-pool mechanic for this (would reopen the "omit house-rule flags" default in [ADR 0003](adr/0003-multi-system-product-direction.md))
- [x] Optional: a **Transmutation Wizard 7 golden** exercising the above, if it does not block the rest of this slice

Not in this slice: auto-applying opposition-school prepare/cast legality, auto-computing school-power bonuses onto abilities/attacks, a general magic-item "special ability" rules engine (custom items keep living in `notes`/`effects` as documentary text), and anything from the honesty-fixes or sidebar-tools lists below.

### Phase 1x — honesty / code fixes

**Status:** Done (2026-09-12). Do **not** start sidebar tools here. Combat/spell math stays typed; do not auto-apply feat text, weapon Special tags, or AC from inventory.

Findings from the 2026-09-03 docs-vs-code pass (code disagrees with landed W7 / catalog stamp / host contract):

- [x] **Rename leftover W7-era tests** — `crbBatch19.test.ts` and `crbBatchW6.test.ts` still use `it('does not pack double yet')`. W7 packed `double` on double weapons. Keep the assertions that kama/whip/nunchaku/siangham/nonlethal rows do **not** carry `double`; rename so the title matches.
- [x] **Golden inventory vs catalog stamp** — CRB goldens that reference catalog weapons omit `weapon.properties` / `secondHead` even when the catalog row has them (Load does not re-apply). Stamp those documentary fields onto the fixtures, or re-apply them when a catalog id is present, so a loaded golden matches a fresh catalog pick. Do **not** rewrite `armorClass` / `attacks`.
- [x] **Honest `focusTab`** — `SidebarToolContext.focusTab` is on the host interface and wired in `SheetSession` to `Workspace` tab switching with fallback guards against invalid tab IDs.

Not in this slice (locked as-is): weapon properties remain documentary labels (`compute()` does not read them); Human extra skill ranks stay `race.human`-only; APG Summoner still has no `spellsPerDay` (that is APG follow-through); do not extract unused kernel files (`rows.ts`, `golden.ts`) just to match an old layout sketch.

### Phase 1x — remaining catalog and last sheet features

After the honesty fixes, in this order:

- [x] **CRB feat/spell id tables** — remaining Chapter 5 feats and Chapter 10 class-list spells locked ([`pf1e-crb-feat-spell-ids.md`](pf1e-crb-feat-spell-ids.md); F1–F4 / S1–S5).
- [x] **CRB feat batches F1a–F1c** — first half of remaining combat feats (54 feats packed: Agile Maneuvers–Improved Trip; 65 CRB feats total in pack). [`pf1e-crb-pack-design.md`](pf1e-crb-pack-design.md) §8
- [x] **CRB feat batch F2a** — remaining combat feats part 4 of 6 (17 feats packed: Improved Two-Weapon Fighting–Quick Draw; 82 CRB feats total in pack).
- [x] **CRB feat batch F2b** — remaining combat feats part 5 of 6 (17 feats packed: Rapid Reload–Staggering Critical; 99 CRB feats total in pack).
- [x] **CRB feat batch F2c** — remaining combat feats part 6 of 6 (18 feats packed: Stand Still–Wind Stance; 117 CRB feats total in pack; combat category complete).
- [x] **CRB feat batches F3a–F3c** — remaining general feats (47 feats packed: Acrobatic–Turn Undead; 164 CRB feats total in pack; general category complete).
- [x] **CRB feat batch F4** — remaining item creation + metamagic feats (13 feats packed: Brew Potion–Widen Spell; 177 CRB feats total in pack; CRB feats complete).
- [x] **CRB spell batches S1–S5** — remaining class-list spells levels 0–9 (578 spells packed: S1 82 spells, S2 147 spells, S3 139 spells, S4 127 spells, S5 83 spells; all 622 CRB spells packed; CRB spells complete).
- [x] **APG follow-through** — Summoner `spellsPerDay` + spell catalog (mechanics-only); other APG classes as separate slices (Magical Child, etc.). Auto-applied evolutions only if a later slice says so. [`pf1e-apg-pack-design.md`](pf1e-apg-pack-design.md)
- [x] **Optional PF1e goldens** (system spec §6) — Cleric 5 (domains/channel as daily resources); prestige smoke test; PF1e familiar/companion table fixture if the stub needs one
- [x] **CRB magic weapons / armor** — overlay on mundane ids; no plus-N catalog rows. [`pf1e-crb-pack-design.md`](pf1e-crb-pack-design.md) §7.5
- [x] **PF1e catalog picker** — searchable dialog replacing per-panel `<select>` catalogs ([ADR 0009](adr/0009-pf1e-catalog-picker.md)). Slice 1 landed (feats, features, spells, evolutions, items). Slice 2 landed (Identity race / class / archetype).
- **OGL notice + Section 15** — not a Phase 1x checkbox. Both packs remain `contentKind: "mechanics-only"` (`oglNoticeRequired: false`). The notice ships in Phase 5.1 with the first rules-text prose ([ADR 0007](adr/0007-content-licensing.md)).
- [x] **Sidebar tools** — **last character-sheet feature** in the First Edition finish: Attack Helper, then Actions List, then Budget Calculator landed.

Do **not** start PF2e companion editor, PC2 golden, Remaster packs, or PF2e panel i18n in this phase.

---

## Phase 5 — After the PF1e sheet

**Status:** Current (2026-10-03). Detail and slice order: [`phase-5.md`](phase-5.md). Named sidebar tools have landed. The later PF2e release stays frozen and is not part of this phase.

- [ ] **5.1 Encyclopedia** — Spells / Afflictions / Actions rules text as sidebar tool `shell.encyclopedia` (not Actions List). The same change attaches OGL 1.0a + Section 15 ([ADR 0007](adr/0007-content-licensing.md))
- [ ] **5.2 Localized catalog names** — a second name per row from a curated source, not `es.json` ([`content-licensing.md`](content-licensing.md) §5)
- [ ] **5.3 Typed `effects[]` automation** — unknown types stay ignored; not a bonus-type stacker
- [ ] **5.4 Optional card-oriented play surfaces** — no spec; do not start during 5.1–5.3
- [ ] **5.5 Additional systems behind `system`** — no third engine in 5.1–5.4

Out of scope for 0.9/1.0, and still out of Phase 5 unless a later ADR says otherwise: dice roller, cloud, VTT interop, house-rule flags, GM-exclusive content, multi-character library.

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

## Recommended next work (in order)

1. **Phase 5.1 — encyclopedia + OGL notice** — one change. Sidebar tool `shell.encyclopedia` for packed PF1e spell and feat rules text. OGL 1.0a and Section 15 ship in that change ([`phase-5.md`](phase-5.md), [ADR 0007](adr/0007-content-licensing.md)). Both packs stay `mechanics-only` until then.
2. **Phase 5.2 — localized catalog names.**
3. **Phase 5.3 — typed `effects[]`.**
4. **Later PF2e release** — PC2 golden, companion editor, Remaster packs, PF2e panel i18n. Not a Phase 5 slice.

*Landed milestones (Phase 1x):* Wizard 7 playtest override, Phase 1x honesty/code fixes, PF1e catalog picker ([ADR 0009](adr/0009-pf1e-catalog-picker.md)) slice 1 & 2, APG follow-through (Summoner spellsPerDay + spell catalog), Optional PF1e goldens (Cleric 5, Fighter 5 / Duelist 2, Ranger 5 with companion/familiar), Sidebar tools (Attack Helper, Actions List, Budget Calculator), and pre-release hygiene.

Housekeeping (not a product increment): do **not** merge `cursor/setup-cloud-agent-env-2c8f` or `cursor/multi-system-docs-990b` (superseded / would regress).

---

## Merged branch history

| Branch | Objective | Outcome |
| --- | --- | --- |
| `cursor/s1-s4-prelude-5edf` | Vitest + Ajv + Fighter 5 calc/UI slice | Merged (ancestor of tip) |
| `cursor/continuation-design-options-5edf` | Phase 1 sequencing options | Merged; marked executed |
| `cursor/merge-next-steps-5edf` | Next-increment options after S1/S4 | Merged |
| `cursor/t1-t3-wizard-editors-5edf` | Wizard 5 + form editors (T1/T3) | Merged into `main` |
| `cursor/setup-cloud-agent-env-2c8f` | Cloud Agent `environment.json` | Already on `main` via #2 (same content). Do not merge the old tip. |
| `cursor/multi-system-docs-990b` | Parallel Phase M–3e rewrite | Superseded by #7/#8. Do not merge (conflicts; missing CRB 1–2). |
| `cursor/pf1e-multiclass-budget-990b` | CRB batches 1–2 + batch 3–10 annotations | Same tree as #8; histories joined on local `main` |
| `cursor/audit-docs-code-cad8` | Wizard 5 slots, engine honesty, 1A–10B | Merged on local `main` (2026-08-18) |

---

## Document history

| Date | Change |
| --- | --- |
| 2026-08-13 | First operational roadmap, audited against the repo and PF2e design doc §11 |
| 2026-08-15 | Refresh after merging S1/S4/T1/T3 into `main` |
| 2026-08-17 | Retarget to multi-system / PF1e-first (ADR 0003). PF2e leftover 0.9 work deprioritized |
| 2026-08-17 | Shared kernel inventory (ADR 0004); Phase M extracts it |
| 2026-08-17 | Sidebar host (ADR 0005); tools TBD; Phase Sb |
| 2026-08-17 | Reserve Attack Helper as a later sidebar tool (no in-app dice) |
| 2026-08-17 | Phase M kernel/shell + thin sidebar host landed |
| 2026-08-17 | Phase 1e: PF1e schema (ADR 0006), martial compute, Fighter 5, New→PF1e. Tools deferred until sheet ~90% done |
| 2026-08-17 | Phase 2e: spell DC + bonus slots + Wizard 5. Reserve Actions List tool |
| 2026-08-17 | Phase 3e: Fighter 2 / Wizard 3 golden. Reserve Budget Calculator tool |
| 2026-08-17 | Phase 3c batch 1: CRB ability modifiers + BAB/save progressions; Fighter/Wizard catalog tags |
| 2026-08-17 | Phase 3c batch 2: HP breakdown dialog (manual HD rolls) + iterative attack slash notation |
| 2026-08-17 | Annotate CRB batches 3–10; next recommended PR is AC/touch/FF + CMB/CMD |
| 2026-08-17 | Audit: Wizard 5 slots corrected to CRB 4/4/3/2; remaining issues in next-increment §9 |
| 2026-08-17 | Design decisions 1A–10B: new-sheet picker, tempScore, en.json chrome, shared kernel types |
| 2026-08-18 | Local `main` absorbed the audit branch; next code is still CRB batch 3 table tests |
| 2026-08-18 | Phase 3c batch 3: AC/touch/FF + CMB/CMD table tests; next is skills |
| 2026-08-18 | Phase 3c batch 4: skill totals + max ranks; next is size tables |
| 2026-08-18 | Phase 3c batch 5: size AC/attack/CMB/CMD + carry multiplier; next is encumbrance |
| 2026-08-18 | Phase 3c batch 6: Strength heavy-load + load category; Ignore weight; next is Human catalog |
| 2026-08-18 | Phase 3c batch 8: Human race catalog; next is class skills |
| 2026-08-18 | Phase 3c batch 9: class skills + skill-point pool; next is weapons/armor ids |
| 2026-08-18 | Phase 3c batch 10: documentary weapons/armor ids; next is remaining 9 CRB classes |
| 2026-08-18 | Phase 3c batch 11: remaining 9 CRB classes reuse the Fighter/Wizard catalog; next is feat ids |
| 2026-08-18 | Phase 3c batch 12: documentary feat ids; 1.0 bar includes playable Synthesist Summoner |
| 2026-08-18 | Phase 3c batch 13: documentary spell ids; slots/DCs stay typed; next is Batch 7 pack review |
| 2026-08-18 | Phase 3c batch 7: spell DC + bonus-spells table tests; next is PWA proof |
| 2026-08-18 | IndexedDB one-key draft + PWA build verify; next is OGL review then 1.0 |
| 2026-08-18 | OGL / PI review landed (ADR 0007); pack stays mechanics-only; next is 1.0 |
| 2026-08-18 | 1.0 APG slice 1: Summoner catalog + Synthesist name; next is evolutions + fused overlay |
| 2026-08-18 | Progress snapshot: PF1e 0.9 bar landed; local `main` published to origin |
| 2026-08-19 | Pre-1.0 architecture: locale runtime, system registry, pack schemas, override maps, PF1e extract + a11y, jsdom tests. Next code is again evolutions + fused overlay |
| 2026-08-19 | APG slice 2: documentary evolution names + fused overlay; next is Synthesist golden |
| 2026-08-19 | Synthesist golden (Half-Elf Radiant Striker); next is Spanish |
| 2026-08-19 | Spanish catalog (`es.json`) for chrome + PF1e panels; PF2e panel literals remain |
| 2026-08-19 | 1.0 stability: locale stamped on Save; all goldens still compute |
| 2026-08-19 | PF2e Bard 5 golden (spontaneous occult); next is Cleric 5 |
| 2026-08-19 | PF2e Cleric 5 golden (prepared divine); next is a companion user |
| 2026-08-19 | PF2e Ranger 5 golden (nested wolf companion); next is a PC2 class |
| 2026-08-19 | Finish First Edition this release; leftover PF2e waits for a later release |
| 2026-08-19 | Phase 1x batch 14: remaining CRB player races + size stamp; next is spells-per-day tables |
| 2026-08-27 | Phase 1x batch 15: class spells-per-day + hybrid Max; next is remaining catalog rows |
| 2026-08-27 | Locked remaining mundane CRB weapons/armor into batches 16–21; magic weapons/armor reserved later |
| 2026-08-27 | Phase 1x batch 16: remaining simple melee + simple ranged; next mundane equipment is martial weapons |
| 2026-08-27 | Phase 1x batch 17: martial light + remaining martial one-handed; next is martial two-handed + bows |
| 2026-08-27 | Weapon Special tags queued one type per PR after all weapon ids (not in 16–19); `weapon.properties` is an array (2+ tags; later magic uses the same list) |
| 2026-08-27 | Phase 1x batch 18: martial two-handed + martial ranged and arrows; next is exotic weapons |
| 2026-08-27 | Phase 1x batch 19: exotic melee + exotic ranged and repeating bolts; next catalog is W1 reach |
| 2026-08-27 | Phase 1x W1: reach as N-tag `weapon.properties` (one or many); next is W2 brace |
| 2026-08-27 | Phase 1x W2: brace appended (N = 1 or 2); next is W3 trip |
| 2026-08-27 | Phase 1x W3: trip appended (N = 1 or 2); next is W4 disarm |
| 2026-08-28 | Phase 1x W4: disarm appended (N = 1, 2, or 3); next is W5 monk |
| 2026-09-01 | Phase 1x W5: monk appended (N = 1 or 2); next is W6 nonlethal |
| 2026-09-01 | Phase 1x W6: nonlethal appended (N = 1, 2, or 4); next is W7 double |
| 2026-09-01 | Phase 1x W7: double appended plus documentary secondHead; next is Batch 20 armor |
| 2026-09-01 | Phase 1x batch 20: remaining light + medium armor; next is heavy armor + shields |
| 2026-09-01 | Phase 1x batch 21: heavy armor + shields + extras; next is remaining feats/spells |
| 2026-09-03 | Docs-vs-code pass: next code is honesty/code fixes (not feats/spells). Sidebar tools are the last character-sheet feature, not a ~90% mid-pack gate |
| 2026-09-03 | Locked remaining CRB feat/spell id tables (F1–F4, S1–S5). Packing waits for honesty/code fixes |
| 2026-09-12 | Stakeholder override: prioritize an optimal state to play a specific PF1e Wizard 7 Transmutation-specialist playtest character ahead of the default Phase 1x order. Pulled forward: arcane school + opposition schools, bonus school spell slot, CRB school powers as catalog features, a targeted spell/feat catalog fill, and exposing `vitals.resistances`/`senses`/`speeds` in a panel. Honesty fixes and the alphabetical F1–F4/S1–S5 fill resume after. See ADR 0003 postscript |
| 2026-09-12 | Feat batches subdivided into 10 steps (F1a–F1c, F2a–F2c, F3a–F3c, F4); Batch F1a landed (18 combat feats); next is F1b |
| 2026-09-12 | Batch F1b landed (18 combat feats; 47 CRB feats packed); next is F1c |
| 2026-09-12 | Batch F1c landed (18 combat feats; 65 CRB feats packed; F1 combat first-half complete); next is F2a |
| 2026-09-14 | Roadmap audit & cleanup: record F1a–F1c landed (65 feats packed) and F2a next in checklists and recommended next work |
| 2026-09-14 | Batch F2a landed (17 combat feats; 82 CRB feats packed; 71 combat feats packed total); next is F2b |
| 2026-09-14 | Batch F2b landed (17 combat feats; 99 CRB feats packed; 88 combat feats packed total); next is F2c |
| 2026-09-14 | Batch F2c landed (18 combat feats; 117 CRB feats packed; 106 combat feats packed total; combat category complete); next is F3a |
| 2026-09-14 | Batches F3a–F3c landed (47 general feats; 164 CRB feats packed; 49 general feats packed total; general category complete); next is F4 |
| 2026-09-14 | Batch F4 landed (13 item creation + metamagic feats; all 177 CRB feats packed); next is S1 |
| 2026-09-14 | Batches S1–S5 landed (578 spells packed; all 622 CRB spells packed; CRB catalog complete); next is APG follow-through |
| 2026-09-20 | APG follow-through: Summoner spellsPerDay table + 27 APG spells packed; synthesist-5 golden stamped |
| 2026-09-21 | Architecture deepening: PF1e catalog picker (ADR 0009 slices 1 & 2 identity race/class/archetype) landed |
| 2026-09-22 | Sidebar tools landed for PF1e & PF2e (Attack Helper, Actions List, Budget Calculator); pre-release hygiene (disclaimer, NOTICE, About dialog, CONTRIBUTING, SECURITY) landed |
| 2026-09-23 | Reliability/a11y pass: shared focus-managed ModalDialog, shell ErrorBoundary with autosave rescue, draftStore connection-leak fix, lint gate set to --max-warnings 0 |
| 2026-09-24 | Hygiene pass: HP breakdown moved onto the shared ModalDialog (last raw `<dialog>`, 28% → 93% covered); catalog picker renders a capped first page with an overflow note (650 → 61 options, ~56ms → ~21ms open); shell workflow coverage for New/Load/Save/locale/draft (App.tsx 41% → 79%) with the twin `SheetSession` branches collapsed onto one `editCharacter` helper and a non-stale sidebar toggle |
| 2026-09-24 | Reliability fix: override paths naming a record entry (`derived.attacks.__proto__.attack`) resolved through `Object.prototype` and crashed compute on load; record entries are now read by own key and unsafe keys refused, in the shared helper both systems use |
| 2026-10-03 | Phase 5 opened ([`phase-5.md`](phase-5.md)). First Edition and hygiene marked done. Next code is slice 5.1 (encyclopedia + OGL notice in one change). Later PF2e release stays frozen |
