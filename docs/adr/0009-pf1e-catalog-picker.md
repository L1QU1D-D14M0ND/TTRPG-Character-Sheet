# ADR 0009 — PF1e catalog picker

**Status:** Accepted  
**Date:** 2026-09-17  
**Depends on:** [ADR 0004](0004-shared-kernel.md), [ADR 0007](0007-content-licensing.md)  
**Context:** Architecture review 2026-09-17. Eight hand-rolled catalog `<select>`s across five PF1e panels.

## Context

Feats, features, spells, items, evolutions, race, class, and archetype each re-implement the same picker: bind `ref.id ?? ''`, map a catalog array to `<option>`s, stamp with `apply*` on change, and pair a free-text name input. Spells rebuild 622 options per row per render. The write path is always `SheetUpdate`; `SpellsPanel.patchEntry` and `SynthesistPanel.writeEidolon` are wrappers over it.

A native `<select>` cannot search. jsdom 30.0.1 implements neither `HTMLDialogElement.showModal` nor `close`, which is why `HpBreakdownDialog` has no test. `NewSheetDialog` already uses a conditionally rendered `div` with `role="dialog"`.

ADR 0004 forbids extracting a generic UI primitive without a second caller in the same change. PF2e has no catalog picker.

## Decision

1. **One module** in `systems/pf1e/sheet/` (`CatalogPicker`). Not the shared kernel. A PF2e picker would be a second adapter and would justify a kernel primitive then, not now.

2. **The interface is `kind`, `value`, `onPick(next)`.** Labels for the trigger and the name input stay call-site i18n so existing `aria-label`s do not move. The module owns the trigger, open state, search, option list, Custom sentinel, stamping, and the paired name input. Callers keep the document write. Document-wide side effects (`stampClassSkills`, `ensureEidolonCompanion`) stay in the panel callback: they touch fields outside the stamped host.

3. **Currency is the stamped host object**, not a document path. `kind="feat"` takes and returns `FeatEntry`; `kind="race"` takes and returns `Identity`. A typed `HostFor<K>` mapping makes a wrong kind a compile error.

4. **Searchable `div role="dialog"`**, same idiom as `NewSheetDialog` (Escape and backdrop close). Do not use native `<dialog>` until jsdom supports `showModal` — otherwise the module's tests disappear. Add `@testing-library/user-event` as a devDependency so search typing is an honest test.

5. **One control for every kind.** The search field appears only when the kind has more than 12 rows (items, feats, spells). Class is one kind whose rows come in CRB/APG groups, not two kinds.

6. **Search is a case-insensitive substring on catalog `name`.** Feat category, spell level, and item kind show as a detail column; they are not facets. Catalog labels stay English in every UI locale ([content licensing](../content-licensing.md) §5).

7. **Custom name stays inline.** The dialog is only for browsing a catalog.

8. **Land in two slices.** First: feat, feature, spell, evolution, and item. Second: Identity race / class / archetype (the irregular hosts and the two document-wide side effects).

## Consequences

- Existing panel tests that `fireEvent.change` a `<select>` by catalog `aria-label` must open the dialog and pick a row instead. Scope those queries with `within(row)` and add a two-row isolation case where a catalog pick is involved.
- Tests at the picker interface cover Custom, stamp-on-pick, search, and the name input. Panel tests remain the evidence that the right kind is wired into the right field.
- `AGENTS.md` requires a browser walkthrough: this is a new sheet control.
- Identity stays on `<select>` until slice 2. That is an accepted, temporary split.

## References

- [ADR 0004 — Shared kernel vs per-system modules](0004-shared-kernel.md)
- [ADR 0007 — Content licensing](0007-content-licensing.md)
- [`../content-licensing.md`](../content-licensing.md) §5 (catalog labels stay English)
