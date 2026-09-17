# Agent guidance

## Testing

### Honesty / code fixes (landed)

Phase 1x honesty / code fixes landed (2026-09-12): leftover W7 test titles renamed, golden `weapon.properties` / `secondHead` stamped vs catalog, honest `focusTab` wired. See [`docs/ROADMAP.md`](docs/ROADMAP.md) Phase 1x honesty / code fixes.

### CRB catalog fill-out (completed — next is APG follow-through)

All 177 CRB feats (110 combat, 49 general, 9 item creation, 9 metamagic) and all 622 CRB spells (Batches S1–S5) have landed under [ADR 0007](docs/adr/0007-content-licensing.md) (names + category/level only, mechanics-only). Next catalog increment is APG follow-through (Summoner `spellsPerDay` + spell catalog). Architecture deepening: PF1e catalog picker ([ADR 0009](docs/adr/0009-pf1e-catalog-picker.md)) — slice 1 landed; slice 2 is Identity race / class / archetype.

- From `app/`, run `npx vitest run src/systems/pf1e`.
- Do **not** record a demo video or upload Inventory screenshots unless the Inventory UI itself changed.
- Do **not** invent ids outside the lock file.

See [`docs/pf1e-crb-pack-design.md`](docs/pf1e-crb-pack-design.md) §8.

### When to record a browser walkthrough

Record a browser walkthrough when the sheet **control**, **layout**, or **Combat math** actually changes (new editor, restyle, derived AC/CMB/attack behavior, and similar).

### Sidebar tools

Named tools (Attack Helper, Actions List, Budget Calculator) are the **last character-sheet feature**. Do not implement one unless asked, and not before remaining catalog / APG follow-through / optional goldens / magic overlay / OGL-with-rules-text.
