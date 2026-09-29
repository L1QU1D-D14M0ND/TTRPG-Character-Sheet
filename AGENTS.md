# Agent guidance

## Repository

Canonical GitHub URL: `https://github.com/L1QU1D-D14M0ND/TTRPG-Character-Sheet` (clone: `https://github.com/L1QU1D-D14M0ND/TTRPG-Character-Sheet.git`). `Pathfinder-2E-Card` redirects there. The npm package name stays `ttrpg-character-sheet`. See [ADR 0008](docs/adr/0008-repo-package-rename.md).

## Testing

### Honesty / code fixes (landed)

Phase 1x honesty / code fixes landed (2026-09-12): leftover W7 test titles renamed, golden `weapon.properties` / `secondHead` stamped vs catalog, honest `focusTab` wired. See [`docs/ROADMAP.md`](docs/ROADMAP.md) Phase 1x honesty / code fixes.

### CRB catalog fill-out & APG follow-through (completed)

All 177 CRB feats (110 combat, 49 general, 9 item creation, 9 metamagic) and all 622 CRB spells (Batches S1–S5) have landed under [ADR 0007](docs/adr/0007-content-licensing.md) (names + category/level only, mechanics-only). APG follow-through (Summoner `spellsPerDay` + 27-spell catalog) landed. Architecture deepening: PF1e catalog picker ([ADR 0009](docs/adr/0009-pf1e-catalog-picker.md)) — slice 1 and slice 2 (Identity race / class / archetype) landed.

- From `app/`, run `npx vitest run src/systems/pf1e`.
- Do **not** record a demo video or upload Inventory screenshots unless the Inventory UI itself changed.
- Do **not** invent ids outside the lock file.
- The catalog picker renders a capped first page (`VISIBLE_ROW_LIMIT`), so a row past the cap is reachable only by searching. Drive it from panel tests with the shared `src/test/pickCatalog` helper, which narrows by name for you.

See [`docs/pf1e-crb-pack-design.md`](docs/pf1e-crb-pack-design.md) §8.

### When to record a browser walkthrough

Record a browser walkthrough when the sheet **control**, **layout**, or **Combat math** actually changes (new editor, restyle, derived AC/CMB/attack behavior, and similar).

### Sidebar tools (landed)

All three named sidebar tools (Attack Helper, Actions List, Budget Calculator) have landed for both PF1e and PF2e with active session switching, complete formulas, and table-dice reminders. Empty/collapsed host default and `focusTab` contracts preserved.
