# Legal review report

**Status:** Informational report, not an ADR.
**Date:** 2026-08-28
**Addendum (2026-08-28):** §4's repo/package-name gap is closed — the stakeholder
triggered the rename to `ttrpg-character-sheet`; see [ADR 0008](adr/0008-repo-package-rename.md).
The body below is left as the dated snapshot that motivated that decision.
**Addendum (2026-09-29):** the live GitHub repository is
[`TTRPG-Character-Sheet`](https://github.com/L1QU1D-D14M0ND/TTRPG-Character-Sheet).
The npm package name remains `ttrpg-character-sheet`.  
**Addendum (2026-10-03):** Phase 5 is the current app phase ([`phase-5.md`](phase-5.md)). The first rules-text change is still the OGL trigger in §3 / ADR 0007. Trademark and hygiene gaps in the body below are closed: the repo and npm package are renamed, the non-affiliation disclaimer is in the README and About dialog, and `CONTRIBUTING.md`, `NOTICE`, and `SECURITY.md` exist. Section 7 is the current summary. Sections 4 and 6 remain the 2026-08-28 snapshot.
**Not legal advice.** This is an engineering-level inventory of where the
project touches licensing, trademark, and privacy law, written to help a
maintainer or an actual lawyer decide what (if anything) needs review before
a wider release. It does not change any product lock; where it touches
decisions already made in an ADR, it says so and defers to the ADR.

## 1. Scope

Four areas were checked:

1. The software license for the app itself and its dependencies.
2. The content-licensing posture for game data drawn from Pathfinder
   rulebooks (OGL 1.0a / Product Identity).
3. Trademark exposure from using "Pathfinder" in the product and repo name.
4. Privacy / data-handling exposure from how the app stores player data.

## 2. Software license

**App code:** MIT ([`LICENSE`](../LICENSE)), copyright L1QU1D-D14M0ND, 2026.
Standard, permissive, no copyleft obligations. This is fine for a project
that also wants to keep some content mechanics-only rather than open-sourcing
book text (see §3) — MIT covers only the code, not the rulebook-derived data.

**Dependencies** ([`app/package.json`](../app/package.json)): every direct
dependency and devDependency is a well-known permissively-licensed package —
`react`/`react-dom` (MIT), `ajv`/`ajv-formats` (MIT), `vite`/`vite-plugin-pwa`
(MIT), `workbox-window` (MIT), `vitest`/`@vitest/coverage-v8` (MIT), `oxlint`
(MIT), `jsdom` (MIT), `fake-indexeddb` (MIT), `@testing-library/*` (MIT), and
`typescript` (Apache-2.0, also compatible with MIT and only used as a build
tool, never distributed). None of these are copyleft (no GPL/AGPL/LGPL in the
tree), so there is no license obligation triggered by shipping the built
app. This check is based on the direct dependency list and each package's
well-known license, not a transitive-tree SBOM scan; if the project ever
needs a formal audit trail (e.g. before a commercial release), running
`npx license-checker` (or similar) over the full lockfile would produce one,
but nothing here suggests a problem is waiting to be found.

**Verdict:** no action needed. This is the cleanest of the four areas.

## 3. Content licensing (OGL / Product Identity)

This is already covered in depth by [ADR 0007](adr/0007-content-licensing.md)
and its supporting inventory, [`content-licensing.md`](content-licensing.md),
so this report doesn't re-litigate it — it summarizes the current posture and
flags what to watch.

- `content/pf1e/crb/` and `content/pf1e/apg/` are curated **mechanics-only**
  catalogs (ids, names, numeric tags: HD, BAB, saves, weight, spell level).
  No rules-text prose, no Product Identity (Golarion place names, Paizo
  branding, adventure/NPC names). This is enforced mechanically, not just by
  convention: [`licenseGate.test.ts`](../app/src/systems/pf1e/content/licenseGate.test.ts)
  scans every pack JSON file for a forbidden-key list (`description`,
  `summary`, `benefit`, `flavor`, `text`, etc.) and a Product Identity word
  list (`golarion`, `absalom`, `cheliax`, `paizo`, `pathfinder society`, …),
  and fails the suite if either shows up, or if `class.summoner` ever lands
  in the CRB pack instead of the APG pack.
- Bare game statistics (hit dice, bonus progressions, carrying capacity in
  pounds) are generally treated as uncopyrightable facts/rules under U.S. law
  (the *Feist* "facts and rules aren't protected, only original expression
  is" principle that OGC licensing itself relies on) — which is the
  reasoning basis for why a mechanics-only pack is lower-risk than a prose
  reprint. That's a defensible engineering position, not a guarantee; it's
  exactly the class of judgment call ADR 0007 flags as needing a lawyer
  before the project starts shipping OGC **prose** (a feat benefit
  paragraph, a spell description, a class feature block).
- The trigger for adding OGL 1.0a text + a Section 15 notice is already
  defined precisely in ADR 0007 §Decision item 3 and `content-licensing.md`
  §4: the same PR that first adds copied rules-text prose, not before. As of
  this report, no such PR exists — the gate is doing its job.
- **Recommendation:** no change. Keep running `licenseGate.test.ts` as a
  hard CI gate (it already is, via `npm test`), and keep it in mind as a
  precondition — not a formality — the moment anyone proposes adding feat
  benefit text, spell descriptions, or a bestiary/adventure excerpt.

## 4. Trademark exposure ("Pathfinder" naming)

This is the one area that has **not** had an explicit review, and where the
project's own ADRs are candid that a lawyer, not an engineer, should make the
final call.

**Pathfinder** and **Pathfinder Roleplaying Game** are trademarks of Paizo
Inc. Trademark law is separate from the OGL/copyright analysis in §3 — a
mechanics-only data pack can be perfectly clean on copyright/OGC grounds and
still raise a trademark question if the *product itself* is named or
presented in a way that implies Paizo affiliation, endorsement, or
compatibility certification.

Current state, as actually observed in the repo:

- The **GitHub repository name** is `Pathfinder-2E-Card`, and the **npm
  package name** in [`app/package.json`](../app/package.json) is
  `pathfinder-2e-character-sheet`. Both predate the multi-system pivot and
  are explicitly called out as unchanged-for-now in
  [ADR 0003](adr/0003-multi-system-product-direction.md) ("GitHub repository
  name `Pathfinder-2E-Card` is unchanged until a later rename decision") and
  the README ("The GitHub repository name is unchanged").
- The **working product title** is deliberately genericized to **"TTRPG
  Character Sheet"** rather than a Pathfinder-branded name — see ADR 0003's
  defaults table and ADR 0007 §Decision item 7 ("Chrome may identify the
  system as Pathfinder First / Second Edition. Working title remains TTRPG
  Character Sheet.").
- No Paizo logo, no "Pathfinder compatible" badge, and no Community Use
  Policy artwork are present anywhere in the app (`app/public/` contains only
  a generic favicon/icon set with no third-party marks) or in the docs. ADR
  0007 explicitly defers that: "No official Paizo compatibility logo or
  Community Use artwork in 0.9/1.0 unless a later ADR says so."
- In-app UI text referring to "Pathfinder First Edition" / "Pathfinder
  Second Edition" as system names is naming what the tool computes for
  (nominative use — "this sheet supports the Pathfinder ruleset," not "this
  is an official Pathfinder product"), which is the standard low-risk pattern
  fan/community tools use. It is not, on its own, the same class of exposure
  as the repo/package name, which functions more like a product name.

**What's not yet in place:** there is no visible non-affiliation disclaimer
anywhere in the repo (README, LICENSE, or in-app) stating that this is an
unofficial, fan-made tool with no affiliation to or endorsement by Paizo
Inc. That's a one-paragraph addition, standard practice for community tools
in this space, and it's the kind of thing worth adding *before* any public
release/store listing — independent of the repo-rename question, which ADR
0003 has already correctly identified as a deliberate, deferred decision
rather than an oversight.

**Recommendation:**
1. Add a short non-affiliation / no-endorsement disclaimer to the README
   (and ideally somewhere visible in the app itself, e.g. an About/Settings
   panel) before any public-facing release. This is cheap, standard, and
   doesn't require resolving the rename question first.
2. Treat the repo-name/package-name rename as already tracked (it is, in
   ADR 0003) rather than re-opening it here — but note that a lawyer
   reviewing trademark exposure would likely flag the current name as the
   highest-leverage single change available, since "Pathfinder-2E-Card" as a
   product/repo name reads more like a branded product than a UI label does.
3. If the project ever pursues Paizo's Community Use Policy or a paid
   compatibility license, that supersedes points 1–2 for whatever it
   explicitly covers — but that's a business decision, not a code change.

## 5. Privacy / data handling

Low exposure, by design (ADR 0003's persistence model):

- The app is local-first: one active sheet in memory, explicit Save/Load to
  a local `.json` file, and a single autosaved IndexedDB draft for
  refresh-restore. No server-side storage, no accounts, no character
  library sync.
- No analytics, telemetry, or tracking code was found anywhere in
  `app/src` (checked for `analytics`/`tracking`/`telemetry` and any
  `fetch`/`XMLHttpRequest` calls — there are none).
- Because no personal data is transmitted anywhere, GDPR/CCPA-style
  "processing" obligations largely don't attach to the app as it exists
  today — there's no data controller-vs-processor question when nothing
  leaves the user's device.
- Caveat: this changes the moment the project adds anything that leaves the
  browser — a hosted save-sync feature, crash reporting, or even
  self-hosted analytics on a marketing site. None of that exists today, so
  there's nothing to remediate now; it's just the trigger condition to
  remember if/when that scope is proposed.

**Recommendation:** no action needed today. Revisit if/when any
network-connected feature (cloud save, telemetry, crash reporting) is
proposed — that's the point at which a privacy policy or GDPR/CCPA analysis
would first become relevant.

## 6. Open-source project hygiene (minor, non-blocking)

Not legal risk exactly, but adjacent: the repo has no `CONTRIBUTING.md`,
`NOTICE`, or `SECURITY.md`. None of these are required — MIT doesn't demand
a NOTICE file the way Apache-2.0 does, and there's no indication the project
is soliciting outside contributions yet. Flagging only so it's a conscious
omission rather than an accidental one; not a recommendation to add them now.

## 7. Summary

| Area | Risk today | Action needed now? |
| --- | --- | --- |
| App code license (MIT) + dependencies | Low | No |
| Content licensing (OGL / Product Identity) | Low, actively gated by ADR 0007 + CI test | No empty notice. Revisit in the Phase 5.1 PR that first adds rules-text prose |
| Trademark ("Pathfinder" naming) | Low — disclaimer is in the README and About dialog; repo and npm package renamed ([ADR 0008](adr/0008-repo-package-rename.md)) | No |
| Privacy / data handling | Low — local-first, no telemetry | No — revisit only if a networked feature is proposed |
| OSS project hygiene | Closed — `CONTRIBUTING.md`, `NOTICE`, and `SECURITY.md` exist | No |

The actionable gap that remains is the one ADR 0007 already tracks: **do not add rules-text prose without OGL 1.0a and Section 15 in that same change.** That change is Phase 5.1, not a hygiene follow-up. The §4 disclaimer and §6 hygiene files described as missing in the body have landed; those sections are the 2026-08-28 snapshot.
