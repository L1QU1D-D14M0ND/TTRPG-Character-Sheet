# PF1e playtest reference — Flare Nightingale

**Status:** Reference only. Source for the [ROADMAP.md](ROADMAP.md) Phase 1x "priority override: playtest character" slice and the [ADR 0003](adr/0003-multi-system-product-direction.md) 2026-09-12 postscript. This is **not** a schema/design doc and does not lock anything; it exists so the priority-override checklist has a concrete target without re-opening the source spreadsheet.

**Source:** a player-provided Excel character sheet (`Ficha_Flare_Nightingale.xlsx`, 7 tabs: Estadísticas base, Habilidades, Dotes, Armas, Armadura e inventario, Libro, Extra), read in-session on 2026-09-12. The file itself is not checked into the repo — this doc is a distilled transcription for engineering reference. Mechanical values are transcribed as-is; standard CRB rules text (feats/spells the sheet copied in full) is **not** reproduced here — only names and a one-line paraphrase, consistent with this repo's mechanics-only content stance ([ADR 0007](adr/0007-content-licensing.md)). Homebrew items are the player's own content and are summarized more fully since no third-party text is involved.

---

## 1. Identity

| Field | Value |
| --- | --- |
| Name | Flare Nightingale |
| Class | Maga (Wizard) 7, single-classed |
| Arcane school | Transmutation (specialist) |
| Opposition schools | Necromancy, Enchantment |
| Alignment | Lawful Good ("Bueno Legal") |
| Race | **Not recorded anywhere on the sheet** — no race field exists in this template at all. The app's `identity.race` is required; pick one when building this character (nothing on the source implies a specific race) |
| Size | Not recorded either; assume Medium unless told otherwise |
| Level / XP | Level 7; 38,875 XP; 51,000 XP to next level |
| Languages | Común (Common), Auralis (custom/homebrew language — not a CRB language, enter as free text) |

## 2. Ability scores

| Ability | Score | Modifier | Temp score | Temp modifier |
| --- | --- | --- | --- | --- |
| Str | 11 | +0 | 11 | +0 |
| Dex | 22 | +6 | 20 (typo/anomaly — see note) | +2 |
| Con | 12 | +1 | 12 | +0 |
| Int | 23 | +6 | 23 | +0 |
| Wis | 12 | +1 | 12 | +0 |
| Cha | 12 | +1 | 12 | +0 |

**Note on Dex:** the sheet's "Ajuste temporal" (temp score) column reads 20 for Dex against a base score of 22, with a separate +2 "Modif. Temporal" — those two columns look transposed on the source (temp score lower than base is unusual). Treat the base Dex 22 (mod +6) as authoritative; the school's own "+2 Destreza" note (§4) is a separate, additive effect. Flag this for the player rather than silently resolving it.

There is a documentary "Bonificadores a dar (+AtB)" column on the sheet (Fue 3, Des 9, Con 4, Int 9, Sab 4, Car 4) — this is **not** a separate homebrew stat, it's a plain `BAB + ability modifier` quick-reference per ability (confirmed from the sheet's own formulas, e.g. `=C6+$B$26` where `B26` is base attack bonus). No modeling needed beyond what `compute()` already derives.

## 3. Combat stats

| Stat | Value | Breakdown (per sheet) |
| --- | --- | --- |
| HP (PG) | 57 / 57 | — |
| Initiative | +10 | Dex +6, misc +4 |
| AC | 17 | 10 base + Dex 6 + deflection 1 |
| Touch AC | 17 | |
| Flat-footed AC | 11 | |
| Fortitude | +3 | Con +1, base +2 |
| Reflex | +8 | Dex +6, base +2 |
| Will | +6 | Wis +1, base +5 |
| Base attack bonus | +3 | |
| CMB | +3 | BAB +3, Str +0 |
| CMD | 19 | 10 + BAB 3 + Str 0 + Dex 6 |
| Spell resistance | Not entered on the sheet | |

**Resources tracked outside HP** (see §6 for how these map to the app):

- Mana: 25 (labeled "Mana" — a homebrew spell-point pool, not a CRB mechanic)
- A second resource, labeled "RD" twice on the sheet with two different values (57, matching current HP exactly, and 17). The second one (17) is almost certainly Damage Reduction; the first (57) duplicating PG total looks like a mislabeled/copy-pasted header rather than a real second stat. Confirm with the player before encoding either as DR.
- Hero Points ("Puntos de Héroe"): 0 currently (official PF1e variant rule, GameMastery Guide)

## 4. Class features (Wizard, Transmutation specialist)

These are CRB Wizard school features, not homebrew. One-line paraphrase only (no reproduced rules text):

- **Physical Enhancement** ("Mejora física") — a scaling enhancement bonus to Str, Dex, or Con, reassignable when spells are prepared.
- **Telekinetic Fist** ("Puño telecinético") — a limited-use ranged touch attack dealing force damage, usable a few times per day based on Int modifier.
- **Arcane Bond** ("Vínculo arcano") — a bonded item usable once/day to cast an unprepared spell from the spellbook.
- **Arcane School** ("Escuela arcana") — grants the above plus a bonus spell slot per level in the specialized school (Transmutation).
- **Cantrips / Trucos** — standard Wizard 0-level spell access.
- **Bonus feats** ("Dotes adicionales") — extra item creation/metamagic/spell mastery feats at 5th/10th/15th/20th (she's 7th level, so one has been taken already; see feat list).
- **Spellbooks** ("Libros de conjuros") — standard Wizard spellbook rules.

None of this is auto-computed anywhere in the engine today — see §8 for the gap this doc backs.

## 5. Skills

Class skills (marked on the sheet) with nonzero ranks; ability, ranks, and total bonus as recorded. Skills at rank 0 with only an ability modifier are omitted here (full list mirrors the standard PF1e Wizard skill list — Knowledge ×10, Appraise, Fly, Linguistics, Spellcraft, Profession, etc.).

| Skill | Ability | Ranks | Total |
| --- | --- | --- | --- |
| Craft: Armas y Armaduras (Weaponsmithing) | Int | 7 | 16 |
| Conocimiento de conjuros (Spellcraft) | Int | 7 | 16 |
| Escapismo (Escape Artist) | Dex | 6 | 12 |
| Lingüística (Linguistics) | Int | — | 6 |
| Percepción (Perception) | Wis | 7 | 10 |
| Profesión: Ingeniería | Wis | 6 | 10 |
| Saber (Arcano) | Int | 5 | 14 |
| Saber (Ingeniería) | Int | 5 | 14 |
| Saber (Dungeons), (Geografía), (Los planos), (Naturaleza) | Int | 1 each | 10 each |
| Sigilo (Stealth) | Dex | 1 | 9 |
| Tasación (Appraise) | Int | 1 | 10 |
| Volar (Fly) | Dex | 7 | 18 |

Skill points/level: 8 (2 base + Int 6, per the sheet's own tally). All Knowledge subskills, Craft, Profession, Linguistics, and Spellcraft are marked as Wizard class skills, matching CRB.

## 6. Feats

| Feat | In CRB catalog today? | One-line gist |
| --- | --- | --- |
| Scribe Scroll (Inscribir Pergamino) | Yes | Wizard bonus feat; write spells to scrolls |
| Improved Initiative (Iniciativa Mejorada) | Yes | +4 initiative |
| Eschew Materials (Abstención de materiales) | No | Ignore cheap material components |
| Heighten Spell (Intensificar conjuro) | No | Metamagic: cast a spell as if higher level |
| Craft Wondrous Item (Fabricar objeto maravilloso) | No | Item creation: wondrous items |
| Craft Magic Arms and Armor (Fabricar armas y armaduras mágicas) | No | Item creation: magic weapons/armor/shields |
| Craft Construct (Fabricar constructo) | No | Item creation: constructs |
| Point Blank Shot (Disparo a bocajarro) | No | +1 attack/damage at close range with ranged weapons |

5 of 8 feats aren't packed yet — these are exactly the ones the ROADMAP priority-override slice targets for a "targeted feat catalog fill" ahead of the alphabetical F1–F4 order.

## 7. Spellbook

Levels 0–4 populated (level 5+ empty — she hasn't reached those slots yet at level 7 with this build, or they're simply unfilled on the sheet). Names only; **not** reproduced descriptions.

- **Level 0:** Detectar magia, Detectar veneno, Leer magia, Resistencia, Salpicadura de ácido, Chispa, Llamarada, Luces danzantes, Luz, Rayo de escarcha, Sonido fantasma, Abrir/Cerrar, Cuchichear mensaje, Mano del mago, Remendar, Marca arcana, Prestidigitación
- **Level 1:** Alarma, Comprensión idiomática, Detectar puertas secretas, Impacto verdadero, Armadura de mago, Niebla de obscurecimiento, Desvanecer, Excavación expeditiva, Disco flotante, Munición abundante, Montura, Manos ardientes, Ilusión de calma, Sirviente invisible, Escudo, Protección contra el mal, Arma sombría
- **Level 2:** Cerradura arcana, Detectar pensamientos, Ver lo invisible, Crear foso, Rayo abrasador, Invisibilidad, Partículas rutilantes (Glitterdust)
- **Level 3:** Disipar magia, Acelerar (Haste), Intermitencia (Blink), Encoger objeto, Clarividencia, Respirar bajo el agua
- **Level 4:** Invisibilidad mayor, Globo menor de invulnerabilidad, **Named Bullet** (homebrew, not CRB), **Shadowform** (homebrew, not CRB)

Everything above except the two flagged level-4 entries is a standard CRB Wizard-list spell. The current CRB spell pack only has 4 spells cataloged (`fireball`, `magic missile`, `light`, `detect magic` — English ids), so essentially this whole list would need packing or entry as custom rows. The ROADMAP priority-override slice scopes a **targeted** pack of this list (levels 0–4) ahead of the full alphabetical S1–S5 fill; the two homebrew spells stay custom `ContentRef` rows regardless (never packed).

## 8. Modeling gaps this doc backs (cross-ref)

These map 1:1 to the ROADMAP.md Phase 1x "priority override" checklist — see that file for the actual work items. Listed here just so the "why" traces back to this character without re-reading the spreadsheet:

1. No arcane school / opposition school field anywhere in the PF1e schema or engine (§4).
2. No bonus school spell slot in `compute()` (§4, §7).
3. School powers (Physical Enhancement, Telekinetic Fist, Arcane Bond) have no catalog rows (§4).
4. CRB spell/feat catalogs are far short of what this spellbook/feat list needs (§6, §7).
5. `vitals.resistances` / `senses` / `speeds` are in the schema but no PF1e panel reads or writes them (§3 — relevant to the "RD 17" resource once its meaning is confirmed with the player).
6. Mana pool and Hero Points need **no** schema change — both fit `play.dailyResources` as-is (§3). Listed here as a *non*-gap so it isn't accidentally rebuilt.

## 9. Equipment

### Weapons

| Name | Type | Attack | Damage | Crit | Notes |
| --- | --- | --- | --- | --- | --- |
| Hoja Oscura Indivisible 19/22 | Dagger, melee | Dex-based | 1d6 cortante | 19-20 ×2 | +2 quality weapon (+2 atk/dmg); "Letal": on a crit, deals double damage then an *additional* weapon damage roll (1d6×2+1d6); "Mordisco de la Sombra": once/hour, +1d6 damage and a Will save (DC 10+damage) or the target's shadow is pinned, capping their movement to 10 ft until the end of their next turn |
| Soulshard | Dagger, melee | Dex-based | 1d6 cortante + 1d6 necrótico | 19-20 ×2 | Wielder gains half the necrotic damage dealt as temp HP; reducing a creature to 0 HP kills it outright and absorbs its soul into one of 3 gems; a full gem (after a short/long rest) turns red and grants +1 atk/+1 dmg and +1d6 necrotic, stacking up to all 3 gems; each absorbed soul is consumed permanently after 1d4 days |
| Ballista de Asedio +1 | Siege weapon, ranged | Dex-based | 3d8 | 19-20 ×2 | Range 120 ft, uses ballista bolts |

### Armor / worn items

| Item | Notes |
| --- | --- |
| Ropa formal | No AC bonus recorded |
| Anillo de plata | +1 on saves vs. undead and lycanthropes |

### Other inventory

- Libro de Mago ("Grimorio de los Black Armored Knights") — her spellbook, 250 gp value noted
- 175 gp worth of wood (crafting material, unclear for what)
- Medalla del Renacer de Lindelhold — named trinket, no mechanical text given
- Martillo (hammer), Pala (shovel), Ración de comida ×3 (rations)
- **Triceratops, Tiranosaurio** — listed as inventory rows, not as `companions[]` entries; likely summoned/figurine creatures rather than a Druid-style animal companion (she's a Wizard). Treat as documentary items unless the player clarifies a mechanism (e.g., a figurine of wondrous power)
- Scrolls: Partículas rutilantes, Invisibilidad mayor, Globo de invulnerabilidad, Arma sombría, Escudo, Protección contra el mal, Caminar sobre el agua, Respirar bajo el agua
- Prótesis con Elemental de Fuego — a prosthetic housing a fire elemental; no mechanical text given, narrative/homebrew
- Poción "Goldie Marie Gold Energy Elixir" — custom potion: Haste, 1d6 mana, removes fatigued and exhausted (grogui) conditions

All of the above are representable today as generic `ItemEntry`/`AttackEntry` rows with the mechanical gist in `notes` — no schema change needed. The narrative on-hit effects (Mordisco de la Sombra, Soulshard's soul-absorption) are documentary only; nothing in `compute()` applies them automatically, matching how the app already treats feat text and weapon Special tags.

## 10. Misc

- Extra tab: a combat theme song link (flavor only, not game data).
