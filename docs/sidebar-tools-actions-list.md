# Actions List (sidebar tool)

**Status:** **Landed** (2026-09-20). Implemented under `app/src/shell/sidebar/tools/actionsList/`. Host lock: [ADR 0005](adr/0005-sidebar-host.md), [`sidebar-host-design.md`](sidebar-host-design.md).  
**Id:** `shell.actions-list` (shared chrome; per-system action catalog and restriction table).  
**Sequencing:** Shipped as the last character-sheet feature of Phase 1x (alongside [Attack Helper](sidebar-tools-attack-helper.md) and [Budget Calculator](sidebar-tools-budget-calculator.md)). Both PF1e and PF2e supported.

---

## 1. Purpose

Show **what this character can do right now** at the table: attacks, combat maneuvers, movement, skills, class aptitudes, and similar player-facing options.

Each row is one of:

- **Available** — normal presentation.
- **Hindered** — still usable, but restricted or penalized.
- **Unavailable** — **greyed out**; the player can still read it so they know it exists.

Unavailable and hindered rows show a **one-word or short-sentence reason** (examples: `grappled`, `dazed`, `stunned`, `immobilized`, `prone — half speed`).

Example: a trap applies an immobilized condition → the **move** action is greyed out with reason `immobilized`. A grappled character might still attack (hindered: `grappled`) while movement and many maneuvers are unavailable.

This is a **status board for the loaded PC**, not a rules encyclopedia of every action in the game and not a combat AI.

---

## 2. What appears on the list

Build the list from the **sheet**, not from a scraped SRD dump:

| Kind | Source |
| --- | --- |
| Attacks | PF1e `attacks[]` / PF2e `strikes[]` |
| Maneuvers | PF1e CMB options (trip, grapple, disarm, …) as a small engine table; PF2e athletic/maneuver actions from feats/features when present |
| Movement | `vitals.speeds` (land / fly / climb / swim, …) plus the system’s move / step / stride action |
| Skills | Skill rows the player might use in play (at least those with ranks; untrained if the system allows) |
| Aptitudes | Feats, class features, daily resources (rage, channel, panache, focus spells) that are **actions the player takes** |
| Spells (later slice) | Prepared / remaining slots as “cast …” rows; first tools increment may omit spells if Attack Helper also deferred them |

Do **not** list every possible CRB action on a blank sheet. Empty attacks / no fly speed → those rows are absent, not greyed.

Group by the **edition’s action economy** (PF1e standard / move / full / swift / free; PF2e actions / reactions / free). Grouping is chrome; the restriction table is per system.

---

## 3. Availability and reasons

Each row:

```ts
{
  id: string
  label: string
  kind: 'attack' | 'maneuver' | 'move' | 'skill' | 'aptitude' | 'spell' | 'other'
  availability: 'available' | 'hindered' | 'unavailable'
  reason?: string  // required when not available; one word or a short sentence
}
```

**Reason copy (locked):**

- Prefer a **single condition or keyword**: `grappled`, `stunned`, `dazed`, `pinned`, `paralyzed`, `nauseated`, `entangled`, `immobilized`, `prone`, `blinded`.
- If more than one thing applies, use a **short sentence**, not a paragraph: `stunned — no actions`, `grappled — no move`.
- Do not write legal essays (“per CRB p. 562 you cannot…”). The sheet tabs and later encyclopedia tool hold rules text.

**Grey-out:** `unavailable` rows are visually disabled (grey / reduced contrast). They stay on the list. `hindered` stays enabled with the reason beside the label.

**Inputs to the restriction pass:**

- `conditions[]` (id and/or name, case-insensitive).
- Play state that is already on the sheet (negative HP / dying, load category, remaining daily resources, raised shield — **only** if that edition’s `compute()` or Play fields already know it).
- Later: typed `effects[]`. Until then, unknown effect types are ignored (same as the rest of 0.9).

A **per-system table** maps condition → which action kinds are unavailable vs hindered. Custom conditions (the immobilizing trap) match when the player names them `immobilized` / `immobile` or uses a catalog id once a pack exists. Unrecognized conditions do not invent restrictions.

The tool **does not** auto-add conditions from the map. The player records the trap on the Play tab (or a later condition picker); Actions List only **reads**.

---

## 4. Read / write

| Direction | Use |
| --- | --- |
| Read | `character` attacks, skills, speeds, feats/features, conditions, daily resources; `derived` totals (ACP, load, attack bonuses as optional subtitle) |
| Session | Which group is expanded; filter “hide unavailable” |
| Write (`update`) | Optional later: spending a daily resource or marking a spell slot used. First slice can be **read-only** |

Same `SidebarToolContext` as every tool. No parallel combat document, no encounter tracker, no targeting an NPC.

---

## 5. Dice (non-goal, locked)

- **No** in-app dice or “resolve this action” button.
- Optional subtitle math (skill total, to-hit) is display-only, same rule as Attack Helper.
- ADR 0003’s “no dice roller” stays in force.

---

## 6. Editions

Both PF1e and PF2e need this tool; **restriction tables and action names fork**. Share the chrome (list, grey-out, reason chip). Register via `SystemModule.sidebarTools` and/or a shared wrapper.

| | PF1e | PF2e |
| --- | --- | --- |
| Action economy | Standard / move / full / swift / immediate / free | Actions, reactions, free |
| Move grey-out | Immobilized, paralyzed, pinned, grappled (no move), stunned, dazed, … | Immobilized, grabbed/restrained, stunned, … |
| Attacks | `attacks[]` + CMB maneuvers | `strikes[]` + athletic maneuvers from feats |
| Dying | Negative HP / disabled / dead-at | Dying / wounded track |

Do not share one “is this legal?” function across editions.

---

## 7. Relationship to other tools

| Tool | Role |
| --- | --- |
| **Actions List** (this) | “What can I do **now**?” — availability under current conditions |
| **Attack Helper** | “I’m making **this** attack” — to-hit / damage expression, feat toggles |
| **Budget Calculator** | “What does this shopping list **cost** if I buy vs craft?” — downtime, not in-combat actions. Spec: [`sidebar-tools-budget-calculator.md`](sidebar-tools-budget-calculator.md) |
| Encyclopedia (candidate) | Browse **rules** text for spells / afflictions / actions — not the PC’s current menu |

Clicking an attack in Actions List **may** later deep-link into Attack Helper (`focusTab` / shared session). That is optional; do not block the first slice on it.

---

## 8. Out of scope for the first tools increment

- Map, reach, threatened squares, or “the trap is 10 feet away.”
- Auto-applying conditions from an encounter or from unknown `effects[]`.
- Full CRB/Remaster legality (prereqs, “you already used this this turn”) beyond the condition table.
- GM/NPC action lists.
- Dice, VTT, cloud.

---

## Appendix — Document history

| Date | Change |
| --- | --- |
| 2026-08-17 | Named later tool: Actions List; grey-out + short reason from conditions |
| 2026-08-17 | Cross-link Budget Calculator (downtime craft vs this combat menu) |
