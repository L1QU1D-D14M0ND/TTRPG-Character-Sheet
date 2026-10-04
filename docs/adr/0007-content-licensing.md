# ADR 0007 — Content licensing (OGL / Product Identity gate)

**Status:** Accepted  
**Date:** 2026-08-18  
**Depends on:** [ADR 0003](0003-multi-system-product-direction.md)  
**Inventory:** [`../content-licensing.md`](../content-licensing.md)

**This is a product lock, not legal advice.** A lawyer should review before shipping copyrighted **rules text**, Paizo logos, or a claimed compatibility mark.

## Context

The app is MIT. Phase 3c shipped a PF1e Core Rulebook **player catalog** of ids, display names, and numeric tags. Design docs deferred a full OGL 1.0a Section 15 / Product Identity review until **before any rules text**. That review is this ADR. It does **not** add spell descriptions, feat benefits, or class flavor. It does **not** start the 1.0 APG Synthesist pack.

## Decision

1. **App code** stays MIT ([`../../LICENSE`](../../LICENSE)).
2. **`content/pf1e/crb/` is mechanics-only.** Ids, names, and numbers the sheet already uses (HD, BAB/saves, pounds, armor/weapon stats, spell level). No `description` / `summary` / flavor / spell text in pack JSON. Pack `source.book` is `"CRB"`; **page numbers stay omitted**.
3. **That pack is not a distribution of Open Game Content prose.** Do **not** add OGL 1.0a or a Section 15 to the repo until the first pack row that copies OGC **rules text** (feat benefit, spell description, class feature paragraph).
4. **Product Identity stays out of packs.** No Golarion place names, unique NPCs, adventure titles, Paizo logos, or bestiary/adventure dumps. Mechanical names already on the goldens (Fighter, Fireball, Human, Longsword) are catalog labels, not setting gazetteer.
5. **Do not scrape** d20pfsrd, Archives of Nethys, Hero Lab, or Foundry dumps into `content/`.
6. **Player sheets** (Save files, goldens, IndexedDB draft) may contain campaign words the player typed. That is not the ship pack. Do not treat a golden `homeRegion` as catalog PI.
7. **Chrome** may identify the system as Pathfinder First / Second Edition. Working title remains **TTRPG Character Sheet**. No official Paizo compatibility logo or Community Use artwork in 0.9/1.0 unless a later ADR says so.
8. **1.0 APG pack** (`content/pf1e/apg/`) follows the same mechanics-only bar first: Synthesist / Summoner **ids and numeric tags**, documentary evolution names. **No** class flavor, eidolon prose, or spell text until the OGL notice in (3) is actually added. **Never** put `class.summoner` in the CRB folder. Slice 1 (Summoner tags + Synthesist name) landed 2026-08-18.
9. **PF2e Remaster packs** wait. Optional ORC import is still post-PF1e-1.0 and needs its own review.

## Consequences

- Adding spell/feat **summaries** copied from a book is a **new increment** that includes the OGL 1.0a text plus a Section 15 that lists the sources used, and a designation of which pack fields are Open Game Content.
- Vitest scans the CRB pack for forbidden prose keys and a short Product Identity word list.
- Encyclopedia sidebar tools remain license-gated ([ADR 0005](0005-sidebar-host.md)).

**Postscript (2026-10-03):** Phase 5.1 keeps this decision. The first prose pack is `content/pf1e/ogc/`, with `body` as the designated Open Game Content field. `content/pf1e/crb/` and `content/pf1e/apg/` stay mechanics-only. Spec: [`../sidebar-tools-encyclopedia.md`](../sidebar-tools-encyclopedia.md).

## References

- [`../content-licensing.md`](../content-licensing.md)
- [`../../content/pf1e/crb/`](../../content/pf1e/crb/)
- [`../pf1e-crb-pack-design.md`](../pf1e-crb-pack-design.md)
- [`0003-multi-system-product-direction.md`](0003-multi-system-product-direction.md)
