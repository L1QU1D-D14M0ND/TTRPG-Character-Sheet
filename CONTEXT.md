# Character sheet

A local sheet for one player character. Pathfinder First Edition and Pathfinder Second Edition each keep their own sheet.

## Language

**Content pack**:
A mechanics-only catalog of rows the sheet can stamp, such as the Core Rulebook pack or the Advanced Player's Guide pack.
_Avoid_: book, sourcebook, dataset

**Catalog kind**:
One of feat, feature, spell, item, evolution, race, class, or archetype.
_Avoid_: category, type

**Catalog row**:
One named entry in a content pack, addressed by an id unique within its catalog kind.
_Avoid_: option, record

**Host**:
The sheet object a catalog pick stamps: a feat row, a feature row, a spell entry, an item, an evolution, a class row, or the character's identity.
_Avoid_: target, document path

**Catalog index**:
The single record of every catalog row the loaded content packs have registered.
_Avoid_: registry, catalog list

**Magic overlay**:
Masterwork and enhancement on one weapon, second head, armor, or shield.
_Avoid_: magic item, bonus
