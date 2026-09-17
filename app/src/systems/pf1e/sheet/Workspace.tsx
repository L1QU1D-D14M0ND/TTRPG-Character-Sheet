import { useEffect, useState } from 'react'
import {
  skillKeyFromName,
  type CharacterDocument,
} from '../character'
import type { AbilityKey } from '../character/types'
import { signed } from '../../../shared/format'
import { useT, type TranslateFn } from '../../../shared/i18n'
import { NotesPanel } from '../../../shared/ui/NotesPanel'
import { formatIteratives, ranksExceedLevel, type DerivedView } from '../engine'
import { DerivedCell } from '../../../shared/ui/DerivedCell'
import { CombatPanel } from './CombatPanel'
import { FeatsPanel } from './FeatsPanel'
import { HpBreakdownDialog } from './HpBreakdownDialog'
import { IdentityPanel } from './IdentityPanel'
import { InventoryPanel } from './InventoryPanel'
import { PlayPanel } from './PlayPanel'
import { SpellsPanel } from './SpellsPanel'
import { patchAt } from '../../../shared/ui/rows'
import type { SheetUpdate } from './update'

type TabId =
  | 'identity'
  | 'abilities'
  | 'skills'
  | 'combat'
  | 'feats'
  | 'spells'
  | 'inventory'
  | 'play'
  | 'notes'

const TAB_IDS: TabId[] = [
  'identity',
  'abilities',
  'skills',
  'combat',
  'feats',
  'spells',
  'inventory',
  'play',
  'notes',
]

const ATTRS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

function classSummary(
  character: CharacterDocument,
  t: TranslateFn,
): string {
  if (character.classes.length === 0) return t('pf1e.strip.noClass')
  return character.classes
    .map((row) => `${row.class.name || t('pf1e.common.classFallback')} ${row.levels}`)
    .join(' / ')
}

export function Pf1eWorkspace({
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

  const [hpOpen, setHpOpen] = useState(false)

  function addWildcardSkill(kind: 'craft' | 'perform' | 'profession') {
    const raw = window.prompt(t('pf1e.skills.specialtyPrompt', { kind }))
    if (!raw?.trim()) return
    const topic = raw.trim()
    const key = skillKeyFromName(topic, kind)
    if (character.skills.some((skill) => skill.key === key)) {
      setStatus?.(t('pf1e.skills.alreadyExists', { key }))
      return
    }
    const ability: AbilityKey =
      kind === 'perform' ? 'cha' : kind === 'profession' ? 'wis' : 'int'
    update((c) => ({
      ...c,
      skills: [
        ...c.skills,
        {
          key,
          name: `${kind[0].toUpperCase()}${kind.slice(1)} (${topic})`,
          ability,
          ranks: 0,
          classSkill: false,
          armorPenaltyApplies: false,
          misc: 0,
          notes: '',
          effects: [],
        },
      ],
    }))
  }

  return (
    <div className="pf1e-workspace">
      <section className="identity-strip sheet-grid">
        <label>
          {t('pf1e.strip.character')}
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
          {t('pf1e.strip.level')}
          <DerivedCell
            value={derived.level}
            overridden={derived.overriddenPaths.includes('derived.level')}
          />
        </label>
        <label>
          {t('pf1e.strip.class')}
          <span className="derived">{classSummary(character, t)}</span>
        </label>
        <label>
          {t('pf1e.strip.hp')}
          <span className="hp-pair">
            <input
              type="number"
              aria-label={t('pf1e.strip.currentHp')}
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
            <button
              type="button"
              className={
                derived.overriddenPaths.includes('derived.maxHp')
                  ? 'derived overridden hp-max-button'
                  : 'derived hp-max-button'
              }
              title={t('pf1e.strip.openHpBreakdown')}
              aria-label={t('pf1e.strip.maxHpBreakdown', { max: derived.maxHp })}
              onClick={() => setHpOpen(true)}
            >
              / {derived.maxHp}
            </button>
          </span>
        </label>
        <label>
          {t('pf1e.strip.ac')}
          <DerivedCell
            value={derived.ac}
            overridden={derived.overriddenPaths.includes('derived.ac')}
          />
        </label>
        <label>
          {t('pf1e.strip.bab')}
          <DerivedCell
            value={formatIteratives(derived.babIteratives)}
            overridden={derived.overriddenPaths.includes(
              'derived.babIteratives',
            )}
          />
        </label>
      </section>

      <nav className="tabs" aria-label={t('pf1e.tabs.nav')}>
        {TAB_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'active' : ''}
            onClick={() => handleTabChange(id)}
          >
            {t(`pf1e.tabs.${id}`)}
          </button>
        ))}
      </nav>

      <main className="sheet-panel">
        {tab === 'identity' && (
          <IdentityPanel
            character={character}
            derived={derived}
            update={update}
          />
        )}

        {tab === 'abilities' && (
          <>
            <p className="muted">{t('pf1e.abilities.help')}</p>
            {derived.fusedActive ? (
              <p className="muted">{t('pf1e.abilities.fusedNote')}</p>
            ) : null}
            <table className="sheet-table">
            <thead>
              <tr>
                <th>{t('pf1e.abilities.ability')}</th>
                <th>{t('pf1e.abilities.score')}</th>
                <th>{t('pf1e.abilities.tempScore')}</th>
                <th>{t('pf1e.abilities.tempMod')}</th>
                <th>{t('pf1e.abilities.modifier')}</th>
              </tr>
            </thead>
            <tbody>
              {ATTRS.map((key) => {
                const block = character.abilities[key]
                return (
                  <tr key={key}>
                    <th>{key.toUpperCase()}</th>
                    <td>
                      <input
                        type="number"
                        aria-label={`${key.toUpperCase()} ${t('pf1e.abilities.score')}`}
                        value={block.score}
                        onChange={(e) =>
                          update((c) => ({
                            ...c,
                            abilities: {
                              ...c.abilities,
                              [key]: {
                                ...c.abilities[key],
                                score: Number(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        aria-label={`${key.toUpperCase()} ${t('pf1e.abilities.tempScore')}`}
                        value={block.tempScore ?? 0}
                        onChange={(e) =>
                          update((c) => ({
                            ...c,
                            abilities: {
                              ...c.abilities,
                              [key]: {
                                ...c.abilities[key],
                                tempScore: Number(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        aria-label={`${key.toUpperCase()} ${t('pf1e.abilities.tempMod')}`}
                        value={block.tempModifier ?? 0}
                        onChange={(e) =>
                          update((c) => ({
                            ...c,
                            abilities: {
                              ...c.abilities,
                              [key]: {
                                ...c.abilities[key],
                                tempModifier: Number(e.target.value) || 0,
                              },
                            },
                          }))
                        }
                      />
                    </td>
                    <td>
                      <DerivedCell
                        value={signed(derived.abilityModifiers[key])}
                        overridden={derived.overriddenPaths.includes(
                          `derived.abilityModifiers.${key}`,
                        )}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </>
        )}

        {tab === 'skills' && (
          <>
            <div className="table-toolbar">
              <div>
                <strong>
                  {t('pf1e.skills.ranksBudget', {
                    spent: derived.skillRanksSpent,
                    budget: derived.skillRanksBudget,
                  })}
                </strong>
                {derived.skillRanksSpent > derived.skillRanksBudget &&
                derived.skillRanksBudget > 0 ? (
                  <div className="rank-warning">
                    {t('pf1e.skills.ranksBudgetOver')}
                  </div>
                ) : null}
                <p className="muted">{t('pf1e.skills.ranksBudgetHelp')}</p>
              </div>
              <button type="button" onClick={() => addWildcardSkill('craft')}>
                {t('pf1e.skills.addCraft')}
              </button>
              <button type="button" onClick={() => addWildcardSkill('perform')}>
                {t('pf1e.skills.addPerform')}
              </button>
              <button
                type="button"
                onClick={() => addWildcardSkill('profession')}
              >
                {t('pf1e.skills.addProfession')}
              </button>
            </div>
            <table className="sheet-table">
              <thead>
                <tr>
                  <th>{t('pf1e.skills.skill')}</th>
                  <th>{t('pf1e.skills.ability')}</th>
                  <th>{t('pf1e.skills.ranks')}</th>
                  <th>{t('pf1e.skills.class')}</th>
                  <th>{t('pf1e.skills.misc')}</th>
                  <th>{t('pf1e.skills.total')}</th>
                </tr>
              </thead>
              <tbody>
                {character.skills.map((skill, index) => {
                  const total = derived.skillTotals[skill.key]
                  const overCap = ranksExceedLevel(skill.ranks, derived.level)
                  return (
                  <tr key={skill.key}>
                    <th>{skill.name}</th>
                    <td>{skill.ability.toUpperCase()}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        aria-label={`${skill.name} ${t('pf1e.skills.ranks')}`}
                        value={skill.ranks}
                        aria-invalid={overCap || undefined}
                        onChange={(e) =>
                          update((c) => ({
                            ...c,
                            skills: patchAt(c.skills, index, {
                              ranks: Math.max(0, Number(e.target.value) || 0),
                            }),
                          }))
                        }
                      />
                      {overCap ? (
                        <div className="rank-warning">
                          {t('pf1e.skills.rankCapWarning', { level: derived.level })}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`${skill.name} ${t('pf1e.skills.class')}`}
                        checked={skill.classSkill}
                        onChange={(e) =>
                          update((c) => ({
                            ...c,
                            skills: patchAt(c.skills, index, {
                              classSkill: e.target.checked,
                            }),
                          }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        aria-label={`${skill.name} ${t('pf1e.skills.misc')}`}
                        value={skill.misc ?? 0}
                        onChange={(e) =>
                          update((c) => ({
                            ...c,
                            skills: patchAt(c.skills, index, {
                              misc: Number(e.target.value) || 0,
                            }),
                          }))
                        }
                      />
                    </td>
                    <td>
                      <DerivedCell
                        value={
                          total == null
                            ? t('pf1e.skills.unusable')
                            : signed(total)
                        }
                        overridden={derived.overriddenPaths.includes(
                          `derived.skillTotals.${skill.key}`,
                        )}
                      />
                    </td>
                  </tr>
                  )
                })}
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
            onOpenHpBreakdown={() => setHpOpen(true)}
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
      <HpBreakdownDialog
        open={hpOpen}
        onClose={() => setHpOpen(false)}
        character={character}
        update={update}
      />
    </div>
  )
}
