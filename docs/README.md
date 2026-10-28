# Docs index

**Status:** [`ROADMAP.md`](ROADMAP.md) is the only place that states the current phase and next work. Every other doc links there.

Decisions are locked in ADRs; design docs explain how a locked decision is built. When a change touches product scope, schema shape, or shared-vs-per-system code, read the ADR first.

## Start here

| Doc | What it is for |
| --- | --- |
| [User & Player Guide](user-guide.md) | How players use the sheet and its tools |
| [Roadmap](ROADMAP.md) | Current phase, next work, landed milestones, PF2e backlog |
| [Phase 5](phase-5.md) | Order and done-when criteria for the current phase's slices |
| [Domain glossary](../CONTEXT.md) | Agreed names for catalog and sheet concepts |
| [Contributing](../CONTRIBUTING.md) · [Security](../SECURITY.md) | How to contribute and report issues |

## Decisions (ADRs)

| ADR | Decision | Status |
| --- | --- | --- |
| [0001](adr/0001-product-direction.md) | PF2e-only product direction | Superseded by 0003 |
| [0002](adr/0002-character-schema.md) | PF2e character JSON schema | Accepted (PF2e documents) |
| [0003](adr/0003-multi-system-product-direction.md) | Multi-system sheet, PF1e first | Accepted — current product lock |
| [0004](adr/0004-shared-kernel.md) | Shared kernel vs per-system modules | Accepted |
| [0005](adr/0005-sidebar-host.md) | Loaded-sheet sidebar host | Accepted |
| [0006](adr/0006-pf1e-character-schema.md) | PF1e character JSON schema | Accepted |
| [0007](adr/0007-content-licensing.md) | Content licensing (OGL / Product Identity) | Accepted |
| [0008](adr/0008-repo-package-rename.md) | Repo and package rename | Accepted |
| [0009](adr/0009-pf1e-catalog-picker.md) | PF1e catalog picker | Accepted |

## Product and architecture

| Doc | What it is for |
| --- | --- |
| [Umbrella design](ttrpg-character-sheet-design.md) | Product shape across systems (ADR 0003) |
| [Shared kernel](shared-kernel-design.md) | What is shared between editions and what is not (ADR 0004) |
| [Sidebar host](sidebar-host-design.md) | Tool registry and host contract (ADR 0005) |

## System specs

| Doc | What it is for |
| --- | --- |
| [PF1e system design](pf1e-character-sheet-design.md) | PF1e sheet spec |
| [PF1e schema notes](pf1e-schema-design-notes.md) | PF1e schema decisions (ADR 0006) |
| [PF2e system design](pf2e-dynamic-character-sheet-design.md) | PF2e sheet spec (still valid for PF2e documents) |
| [PF2e schema notes](schema-design-notes.md) | PF2e schema decisions (ADR 0002) |
| [Playtest reference — Flare Nightingale](pf1e-playtest-flare-nightingale.md) | The CRB Wizard 7 the playtest priority override was built against |

## Content packs and licensing

| Doc | What it is for |
| --- | --- |
| [Content licensing](content-licensing.md) | Inventory and rules behind ADR 0007 |
| [Legal review report](legal-review-report.md) | Licensing, trademark, and privacy review (§7 is the current summary) |
| [PF1e CRB pack](pf1e-crb-pack-design.md) | Standing rules for the Core Rulebook mechanics pack |
| [CRB feat and spell ids](pf1e-crb-feat-spell-ids.md) | Closed id lists ([JSON](pf1e-crb-feat-spell-ids.json) is read by Vitest) |
| [PF1e APG pack](pf1e-apg-pack-design.md) | Summoner / Synthesist pack |

## Sidebar tools

| Doc | Tool |
| --- | --- |
| [Attack Helper](sidebar-tools-attack-helper.md) | `shell.attack-helper` |
| [Actions List](sidebar-tools-actions-list.md) | `shell.actions-list` |
| [Budget Calculator](sidebar-tools-budget-calculator.md) | `shell.budget-calculator` |
| [Encyclopedia](sidebar-tools-encyclopedia.md) | `shell.encyclopedia` and the OGC pack |

## Archive

[`archive/`](archive/README.md) holds executed plans, batch logs, finished reports, and the roadmap's per-phase history. Not current guidance.

## Conventions for these docs

- Each doc opens with a `**Status:**` line: **Current**, **Locked**, **Landed**, **Reference**, or **Archived**, plus what it governs. Status says what kind of doc it is, not where the project is; project status belongs in the roadmap.
- When a slice lands, update the roadmap. Change other docs only when a rule they state changes.
- Batch logs and dated change tables go in `archive/` or in git history, not in live docs.
- Relative links and `#anchors` are checked in CI (`app/src/test/docsLinks.test.ts`).
