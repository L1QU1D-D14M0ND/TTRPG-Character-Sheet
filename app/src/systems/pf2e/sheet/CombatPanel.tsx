import { createEmptyStrike, type CharacterDocument } from '../character'
import type { AttributeKey, ProficiencyRank } from '../character/types'
import { signed, type DerivedView } from '../engine'
import { DerivedCell } from '../../../shared/ui/DerivedCell'
import { patchAt, updateAt } from '../../../shared/ui/rows'

const ATTRS: AttributeKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const RANKS: ProficiencyRank[] = [
  'untrained',
  'trained',
  'expert',
  'master',
  'legendary',
]
const ARMOR_CATS = ['unarmored', 'light', 'medium', 'heavy'] as const
const WEAPON_CATS = ['unarmed', 'simple', 'martial', 'advanced'] as const

type Update = (mutator: (c: CharacterDocument) => CharacterDocument) => void

export function CombatPanel({
  character,
  derived,
  update,
}: {
  character: CharacterDocument
  derived: DerivedView
  update: Update
}) {
  const armorItems = character.inventory.items.filter((item) => item.armor)
  const shieldItems = character.inventory.items.filter((item) => item.shield)

  return (
    <div className="panel-stack">
      <table className="sheet-table">
        <tbody>
          <tr>
            <th>AC</th>
            <td>
              <DerivedCell
                value={derived.ac}
                overridden={derived.overriddenPaths.includes('derived.ac')}
              />
            </td>
          </tr>
          <tr>
            <th>Equipped armor</th>
            <td>
              <select
                value={character.armorClass.equippedArmorItemId ?? ''}
                onChange={(e) => {
                  const id = e.target.value || null
                  update((c) => ({
                    ...c,
                    armorClass: { ...c.armorClass, equippedArmorItemId: id },
                    inventory: {
                      ...c.inventory,
                      items: c.inventory.items.map((item) =>
                        item.armor
                          ? { ...item, equipped: item.id === id }
                          : item,
                      ),
                    },
                  }))
                }}
              >
                <option value="">(unarmored)</option>
                {armorItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item.name || item.id}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <th>Equipped shield</th>
            <td>
              <select
                value={character.armorClass.equippedShieldItemId ?? ''}
                onChange={(e) => {
                  const id = e.target.value || null
                  update((c) => ({
                    ...c,
                    armorClass: { ...c.armorClass, equippedShieldItemId: id },
                    inventory: {
                      ...c.inventory,
                      items: c.inventory.items.map((item) =>
                        item.shield
                          ? { ...item, equipped: item.id === id }
                          : item,
                      ),
                    },
                  }))
                }}
              >
                <option value="">(none)</option>
                {shieldItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item.name || item.id}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <th>Shield raised</th>
            <td>
              <input
                type="checkbox"
                checked={character.armorClass.shieldRaised}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    armorClass: {
                      ...c.armorClass,
                      shieldRaised: e.target.checked,
                    },
                  }))
                }
              />
            </td>
          </tr>
          {(
            [
              ['Perception', 'perception'],
              ['Fortitude', 'fortitude'],
              ['Reflex', 'reflex'],
              ['Will', 'will'],
            ] as const
          ).map(([label, key]) => (
            <tr key={key}>
              <th>{label}</th>
              <td className="inline-triple">
                <select
                  value={character.proficiencies[key].rank}
                  onChange={(e) =>
                    update((c) => ({
                      ...c,
                      proficiencies: {
                        ...c.proficiencies,
                        [key]: {
                          ...c.proficiencies[key],
                          rank: e.target.value as ProficiencyRank,
                        },
                      },
                    }))
                  }
                >
                  {RANKS.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
                <DerivedCell
                  value={signed(derived[key])}
                  overridden={derived.overriddenPaths.includes(`derived.${key}`)}
                />
              </td>
            </tr>
          ))}
          <tr>
            <th>Class DC</th>
            <td className="inline-triple">
              <select
                value={character.proficiencies.classDC.attribute ?? 'str'}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    proficiencies: {
                      ...c.proficiencies,
                      classDC: {
                        ...c.proficiencies.classDC,
                        attribute: e.target.value as AttributeKey,
                      },
                    },
                  }))
                }
              >
                {ATTRS.map((attr) => (
                  <option key={attr} value={attr}>
                    {attr.toUpperCase()}
                  </option>
                ))}
              </select>
              <select
                value={character.proficiencies.classDC.rank}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    proficiencies: {
                      ...c.proficiencies,
                      classDC: {
                        ...c.proficiencies.classDC,
                        rank: e.target.value as ProficiencyRank,
                      },
                    },
                  }))
                }
              >
                {RANKS.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
              <DerivedCell
                value={derived.classDC}
                overridden={derived.overriddenPaths.includes('derived.classDC')}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table className="sheet-table">
        <thead>
          <tr>
            <th>Armor prof</th>
            {ARMOR_CATS.map((cat) => (
              <th key={cat}>{cat}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Rank</th>
            {ARMOR_CATS.map((cat) => (
              <td key={cat}>
                <select
                  value={character.proficiencies.armor[cat]}
                  onChange={(e) =>
                    update((c) => ({
                      ...c,
                      proficiencies: {
                        ...c.proficiencies,
                        armor: {
                          ...c.proficiencies.armor,
                          [cat]: e.target.value as ProficiencyRank,
                        },
                      },
                    }))
                  }
                >
                  {RANKS.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <table className="sheet-table">
        <thead>
          <tr>
            <th>Weapon prof</th>
            {WEAPON_CATS.map((cat) => (
              <th key={cat}>{cat}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Rank</th>
            {WEAPON_CATS.map((cat) => (
              <td key={cat}>
                <select
                  value={character.proficiencies.weapons[cat]}
                  onChange={(e) =>
                    update((c) => ({
                      ...c,
                      proficiencies: {
                        ...c.proficiencies,
                        weapons: {
                          ...c.proficiencies.weapons,
                          [cat]: e.target.value as ProficiencyRank,
                        },
                      },
                    }))
                  }
                >
                  {RANKS.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="table-toolbar">
        <strong>Strikes</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              strikes: [...c.strikes, createEmptyStrike()],
            }))
          }
        >
          Add strike
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Category</th>
            <th>Attr</th>
            <th>Dice</th>
            <th>Damage type</th>
            <th>Item bonus</th>
            <th>Attack</th>
            <th>Damage</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.strikes.length === 0 ? (
            <tr>
              <td colSpan={10} className="muted">
                No strikes yet.
              </td>
            </tr>
          ) : (
            character.strikes.map((strike, index) => {
              const computed = derived.strikes[strike.id]
              return (
                <tr key={strike.id}>
                  <td>
                    <input
                      value={strike.name}
                      onChange={(e) =>
                        update((c) => {
                          const strikes = [...c.strikes]
                          strikes[index] = { ...strikes[index], name: e.target.value }
                          return { ...c, strikes }
                        })
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={strike.strikeType}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          strikes: patchAt(c.strikes, index, {
                            strikeType: e.target.value as typeof strike.strikeType,
                          }),
                        }))
                      }
                    >
                      <option value="melee">melee</option>
                      <option value="ranged">ranged</option>
                      <option value="unarmed">unarmed</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={strike.weaponCategory ?? 'martial'}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          strikes: patchAt(c.strikes, index, {
                            weaponCategory: e.target
                              .value as NonNullable<typeof strike.weaponCategory>,
                          }),
                        }))
                      }
                    >
                      {([...WEAPON_CATS, 'other'] as const).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={strike.attackAttribute ?? 'str'}
                      onChange={(e) =>
                        update((c) => {
                          const attr = e.target.value as AttributeKey
                          const strikes = [...c.strikes]
                          strikes[index] = {
                            ...strikes[index],
                            attackAttribute: attr,
                            damageAttribute: attr,
                          }
                          return { ...c, strikes }
                        })
                      }
                    >
                      {ATTRS.map((attr) => (
                        <option key={attr} value={attr}>
                          {attr.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      value={strike.damageDice}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          strikes: patchAt(c.strikes, index, {
                            damageDice: e.target.value,
                          }),
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={strike.damageType}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          strikes: patchAt(c.strikes, index, {
                            damageType: e.target.value,
                          }),
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={strike.modifiers?.item ?? 0}
                      onChange={(e) =>
                        update((c) => ({
                          ...c,
                          strikes: updateAt(c.strikes, index, (row) => ({
                            ...row,
                            modifiers: {
                              ...row.modifiers,
                              item: Number(e.target.value) || 0,
                            },
                          })),
                        }))
                      }
                    />
                  </td>
                  <td>
                    <DerivedCell
                      value={computed ? signed(computed.attack) : '—'}
                      overridden={derived.overriddenPaths.includes(
                        `derived.strikes.${strike.id}.attack`,
                      )}
                    />
                  </td>
                  <td>
                    <DerivedCell value={computed?.damage ?? '—'} />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        update((c) => ({
                          ...c,
                          strikes: c.strikes.filter((row) => row.id !== strike.id),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
