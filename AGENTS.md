# Agent guidance

## Repository

Canonical GitHub URL: `https://github.com/L1QU1D-D14M0ND/TTRPG-Character-Sheet` (clone: `https://github.com/L1QU1D-D14M0ND/TTRPG-Character-Sheet.git`). `Pathfinder-2E-Card` redirects there. The npm package name stays `ttrpg-character-sheet`. See [ADR 0008](docs/adr/0008-repo-package-rename.md).

## Current phase

Status, current phase, and next work: [`docs/ROADMAP.md`](docs/ROADMAP.md). Docs index: [`docs/README.md`](docs/README.md).

Rules that hold in every Phase 5 change:

- CRB and APG packs stay mechanics-only. Rules prose goes only in `content/pf1e/ogc/` as `body` ([ADR 0007](docs/adr/0007-content-licensing.md), [`docs/sidebar-tools-encyclopedia.md`](docs/sidebar-tools-encyclopedia.md)).
- Catalog **names** are pack content, keyed by catalog id. A translated name goes in `content/pf1e/names/`, never in `app/src/locales/*.json` ([`docs/pf1e-localized-names.md`](docs/pf1e-localized-names.md)). A new mechanic row must arrive with its Spanish name: regenerate with `python3 scripts/build_names.py`, which fails on an uncovered row.
- Do not scrape an SRD.
- Do not start the later PF2e release (PC2 golden, companion editor, Remaster packs, PF2e panel i18n) in a Phase 5 PR. The PF2e slice must keep computing.

## Testing

- From `app/`, run `npx vitest run src/systems/pf1e` for PF1e work, and the full `npm test` before pushing.
- Do **not** invent catalog ids outside the lock file ([`docs/pf1e-crb-feat-spell-ids.md`](docs/pf1e-crb-feat-spell-ids.md)). Pack rules: [`docs/pf1e-crb-pack-design.md`](docs/pf1e-crb-pack-design.md).
- The catalog picker renders a capped first page (`VISIBLE_ROW_LIMIT`), so a row past the cap is reachable only by searching. Drive it from panel tests with the shared `src/test/pickCatalog` helper, which narrows by name for you.
- Do **not** record a demo video or upload Inventory screenshots unless the Inventory UI itself changed.
- Docs: relative links and `#anchors` are checked by `src/test/docsLinks.test.ts`. Project status goes in `docs/ROADMAP.md` only.

### When to record a browser walkthrough

Record a browser walkthrough when the sheet **control**, **layout**, or **Combat math** actually changes (new editor, restyle, derived AC/CMB/attack behavior, and similar).

Three scripted walkthroughs exist and assert their own results, so they can be re-run instead of re-done by hand:

```
google-chrome-stable --headless=new --remote-debugging-port=9222 \
  --no-first-run --user-data-dir=/tmp/cdp-profile about:blank &
npm run dev
npm run walkthrough:encyclopedia   # 10 checks
npm run walkthrough:picker         #  4 checks
npm run walkthrough:names          # 12 checks
```

They drive Chrome over the DevTools protocol with Node's built-in `WebSocket`, adding no dependency. The bundled browser bridge only speaks Firefox, which is not installed in this environment; if that changes, prefer the bridge.
