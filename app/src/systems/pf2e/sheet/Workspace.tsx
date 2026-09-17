import { useEffect, useState } from 'react'
import type { CharacterDocument } from '../character'
import type { AttributeKey, ProficiencyRank } from '../character/types'
import { signed } from '../../../shared/format'
import { useT } from '../../../shared/i18n'
import { NotesPanel } from '../../../shared/ui/NotesPanel'
import type { DerivedView } from '../engine'
import { DerivedCell } from '../../../shared/ui/DerivedCell'
import { CombatPanel } from './CombatPanel'
import { FeatsPanel } from './FeatsPanel'
import { IdentityPanel } from './IdentityPanel'
import { InventoryPanel } from './InventoryPanel'
import { PlayPanel } from './PlayPanel'
import { SpellsPanel } from './SpellsPanel'
import { patchAt } from '../../../shared/ui/rows'
import type { SheetUpdate } from './update'

type TabId =
  | 'identity'
  | 'attributes'
  | 'skills'
  | 'combat'
  | 'feats'
  | 'spells'
  | 'inventory'
  | 'play'
  | 'notes'

const TAB_IDS: TabId[] = [
  'identity',
  'attributes',
  'skills',
  'combat',
  'feats',
  'spells',
  'inventory',
  'play',
  'notes',
]

const ATTRS: AttributeKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const RANKS: ProficiencyRank[] = [
  'untrained',
  'trained',
  'expert',
  'master',
  'legendary',
]

export function Pf2eWorkspace({
  character,
  derived,
  update,
  setStatus,
  activeTab,
  onTabChange,
}: {
  character: CharacterDocument
  derived: DerivedView
  update: SheetUpdate
  setStatus?: (message: string) => void
  activeTab?: string
  onTabChange?: (tab: string) => void
}) {
  const t = useT()
  const [internalTab, setInternalTab] = useState<TabId>('identity')
  const validActiveTab =
    activeTab !== undefined && TAB_IDS.includes(activeTab as TabId)
      ? (activeTab as TabId)
      : null
  const tab: TabId = validActiveTab ?? internalTab

  useEffect(() => {
    if (validActiveTab) {
      setInternalTab(validActiveTab)
    }
  }, [validActiveTab])

  const handleTabChange = (next: TabId) => {
    setInternalTab(next)
    onTabChange?.(next)
  }

  function addLore() {
    const raw = window.prompt('Lore topic (e.g. Warfare)')
    if (!raw?.trim()) return
    const topic = raw.trim()
    const key = `lore:${topic.toLowerCase().replace(/\s+/g, '-')}`
    if (character.skills.some((skill) => skill.key === key)) {
      setStatus?.(`Lore already exists: ${key}`)
      return
    }
    update((c) => ({
      ...c,
      skills: [
        ...c.skills,
        {
          key,
          name: `${topic} Lore`,
          attribute: 'int',
          rank: 'untrained',
          isLore: true,
          armorPenaltyApplies: false,
          modifiers: {},
          notes: '',
          effects: [],
        },
      ],
    }))
  }

  return (
    <div className="pf2e-workspace">
      <section className="identity-strip sheet-grid">
        <label>
          Character
          <input
            value={character.identity.characterName}
            onChange={(e) =>
              update((c) => ({
                ...c,
                identity: { ...c.identity, characterName: e.target.value },
              }))
            }
          />
        </label>
        <label>
          Level
          <input
            type="number"
            min={1}
            value={character.identity.level}
            onChange={(e) =>
              update((c) => ({
                ...c,
                identity: {
                  ...c.identity,
                  level: Math.max(1, Number(e.target.value) || 1),
                },
              }))
            }
          />
        </label>
        <label>
          Class
          <input
            value={character.identity.class.name}
            onChange={(e) =>
              update((c) => ({
                ...c,
                identity: {
                  ...c.identity,
                  class: { ...c.identity.class, name: e.target.value },
                },
              }))
            }
          />
        </label>
        <label>
          HP
          <span className="hp-pair">
            <input
              type="number"
              value={character.vitals.currentHp}
              onChange={(e) =>
                update((c) => ({
                  ...c,
                  vitals: {
                    ...c.vitals,
                    currentHp: Number(e.target.value) || 0,
                  },
                }))
              }
            />
            <DerivedCell
              value={`/ ${derived.maxHp}`}
              overridden={derived.overriddenPaths.includes('derived.maxHp')}
            />
          </span>
        </label>
        <label>
          AC
          <DerivedCell
            value={derived.ac}
            overridden={derived.overriddenPaths.includes('derived.ac')}
          />
        </label>
        <label>
          Hero points
          <input
            type="number"
            min={0}
            max={3}
            value={character.play.heroPoints}
            onChange={(e) =>
              update((c) => ({
                ...c,
                play: {
                  ...c.play,
                  heroPoints: Math.min(
                    3,
                    Math.max(0, Number(e.target.value) || 0),
                  ),
                },
              }))
            }
          />
        </label>
      </section>

      <nav className="tabs" aria-label="Sheet tabs">
        {TAB_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'active' : ''}
            onClick={() => handleTabChange(id)}
          >
            {t(`pf2e.tabs.${id}`)}
          </button>
        ))}
      </nav>

      <main className="sheet-panel">
        {tab === 'identity' && (
          <IdentityPanel character={character} update={update} />
        )}

        {tab === 'attributes' && (
          <table className="sheet-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Boost count (user-entered)</th>
                <th>Modifier</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {ATTRS.map((key) => {
                const block = character.attributes[key]
                const boostTotal = block.boosts.reduce(
                  (sum, b) => sum + b.amount,
                  0,
                )
                return (
                  <tr key={key}>
                    <th>{key.toUpperCase()}</th>
                    <td>
                      <input
                        type="number"
                        value={boostTotal}
                        onChange={(e) => {
                          const amount = Number(e.target.value) || 0
                          update((c) => ({
                            ...c,
                            attributes: {
                              ...c.attributes,
                              [key]: {
                                ...c.attributes[key],
                                boosts:
                                  amount === 0
                                    ? []
                                    : [
                                        {
                                          kind: 'free',
                                          attribute: key,
                                          amount,
                                          label: 'User-entered total',
                                        },
                                      ],
                              },
                            },
                          }))
                        }}
                      />
                    </td>
                    <td>
                      <DerivedCell
                        value={signed(derived.attributeModifiers[key])}
                        overridden={derived.overriddenPaths.includes(
                          `derived.attributeModifiers.${key}`,
                        )}
                      />
                    </td>
                    <td className="muted">Final boosts only (no partial pairing)</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {tab === 'skills' && (
          <>
            <div className="table-toolbar">
              <button type="button" onClick={addLore}>
                Add lore
              </button>
            </div>
            <table className="sheet-table">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Attr</th>
                  <th>Rank</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {character.skills.map((skill, index) => (
                  <tr key={skill.key}>
                    <th>{skill.name}</th>
                    <td>{skill.attribute.toUpperCase()}</td>
                    <td>
                      <select
                        value={skill.rank}
                        onChange={(e) =>
                          update((c) => ({
                            ...c,
                            skills: patchAt(c.skills, index, {
                              rank: e.target.value as ProficiencyRank,
                            }),
                          }))
                        }
                      >
                        {RANKS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <DerivedCell
                        value={signed(derived.skillTotals[skill.key] ?? 0)}
                        overridden={derived.overriddenPaths.includes(
                          `derived.skillTotals.${skill.key}`,
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {tab === 'combat' && (
          <CombatPanel
            character={character}
            derived={derived}
            update={update}
          />
        )}

        {tab === 'feats' && (
          <FeatsPanel character={character} update={update} />
        )}

        {tab === 'spells' && (
          <SpellsPanel
            character={character}
            derived={derived}
            update={update}
          />
        )}

        {tab === 'inventory' && (
          <InventoryPanel
            character={character}
            derived={derived}
            update={update}
          />
        )}

        {tab === 'play' && (
          <PlayPanel
            character={character}
            derived={derived}
            update={update}
          />
        )}

        {tab === 'notes' && (
          <NotesPanel
            notes={character.notes}
            onChange={(key, value) =>
              update((c) => ({
                ...c,
                notes: { ...c.notes, [key]: value },
              }))
            }
          />
        )}
      </main>
    </div>
  )
}
