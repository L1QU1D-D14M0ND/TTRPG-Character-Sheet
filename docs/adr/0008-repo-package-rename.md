# ADR 0008 — Repository and package rename

**Status:** Accepted
**Date:** 2026-08-28
**Depends on:** [ADR 0003](0003-multi-system-product-direction.md)
**Context:** [Legal review report](../legal-review-report.md) §4

## Context

ADR 0003's "defaults for open questions" table locked `Repo / npm package
rename` as **not in 0.9**, with an explicit override condition: *"Stakeholder
wants a rename PR."* The [legal review report](../legal-review-report.md)
independently flagged the old name as the single highest-leverage trademark
cleanup available — `Pathfinder-2E-Card` (repo) and
`pathfinder-2e-character-sheet` (npm package) both predate the multi-system
pivot, read as a Pathfinder-branded product name rather than a generic UI
label, and no non-affiliation disclaimer exists to offset that. The
stakeholder has now asked for the rename PR, which is the exact condition
ADR 0003 named for revisiting the lock.

This ADR does not touch product scope, schema shape, or engine behavior. It
is a naming decision only.

## Decision

Rename to **`ttrpg-character-sheet`** everywhere the old name is used as an
identifier:

| What | Old | New |
| --- | --- | --- |
| GitHub repository | `Pathfinder-2E-Card` | `ttrpg-character-sheet` |
| npm package (`app/package.json`) | `pathfinder-2e-character-sheet` | `ttrpg-character-sheet` |
| JSON Schema `$id` URLs | `.../L1QU1D-D14M0ND/Pathfinder-2E-Card/schemas/...` | `.../L1QU1D-D14M0ND/ttrpg-character-sheet/schemas/...` |

This name was chosen because it is not a new branding decision — it is the
kebab-case form of the **working display name** ("TTRPG Character Sheet")
already locked in ADR 0003 and ADR 0007, so no further product-naming
discussion is needed.

The working display name itself (**TTRPG Character Sheet**) is unchanged by
this ADR — only the machine-facing identifiers (repo slug, package name,
schema `$id`) move to match it.

## Consequences

- Every doc that stated the repo name was intentionally unchanged (ADR 0003
  Consequences, `CLAUDE.md`, `README.md`, `schemas/README.md`,
  `docs/ttrpg-character-sheet-design.md`,
  `docs/pf2e-dynamic-character-sheet-design.md`, `.cursor/environment.json`)
  is updated to the new name in the same change as this ADR. Dated
  historical records (e.g. the risk log in
  [`next-increment-multi-system.md`](../next-increment-multi-system.md))
  are left as-is — they describe a past state, not current fact.
- `app/package-lock.json` is regenerated (`npm install`), not hand-edited.
- The GitHub repository rename itself (Settings → repository name, or the
  equivalent API call) is **not** part of this change — it is a
  repo-administration action the owner performs directly. GitHub redirects
  the old URL after rename, but local clones' `origin` remotes, any forks,
  CI/webhook configuration, and external links should be updated manually
  and are not this ADR's responsibility to track.
- This closes the trademark gap identified in the
  [legal review report](../legal-review-report.md) §4 as "the highest-
  leverage single change available." The report's own body is left as a
  dated snapshot; it is not rewritten by this ADR.
- ADR 0003's Consequences line ("GitHub repository name `Pathfinder-2E-Card`
  is unchanged until a later rename decision") is superseded by this ADR via
  a postscript on ADR 0003, not edited in place.

**Postscript (2026-09-29, live GitHub slug):** The owner-admin rename has landed. GitHub's canonical repository name is `TTRPG-Character-Sheet`, not the lowercase slug in the decision table:

`https://github.com/L1QU1D-D14M0ND/TTRPG-Character-Sheet`

`https://github.com/L1QU1D-D14M0ND/Pathfinder-2E-Card` redirects there. `https://github.com/L1QU1D-D14M0ND/ttrpg-character-sheet` is the same repository (GitHub repo ids are case-insensitive; API `name` is `TTRPG-Character-Sheet`, id `1332950551`). The npm package name and the schema `$id` paths stay `ttrpg-character-sheet`, as decided above. `$id` URLs still resolve because of that case-insensitive alias.

## References

- [ADR 0003 — Multi-system product direction](0003-multi-system-product-direction.md)
- [Legal review report](../legal-review-report.md)
