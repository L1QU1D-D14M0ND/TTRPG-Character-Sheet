import type { CharacterDocument } from '../character/types'
import type { DerivedView } from '../engine/types'
import type {
  ActionAvailability,
  ActionGroup,
  ActionRow,
} from '../../../shell/sidebar/tools/actionsList/types'

interface ConditionState {
  isDead: boolean
  isUnconscious: boolean
  isDisabled: boolean
  isParalyzed: boolean
  isPetrified: boolean
  isStunned: boolean
  isDazed: boolean
  isAsleep: boolean
  isNauseated: boolean
  isPinned: boolean
  isGrappled: boolean
  isImmobilized: boolean
  isEntangled: boolean
  isProne: boolean
  isBlinded: boolean
  isShaken: boolean
  isFatigued: boolean
  isExhausted: boolean
}

function getConditionState(character: CharacterDocument, derived: DerivedView): ConditionState {
  const condNames = (character.conditions ?? []).map((c) =>
    (c.condition.name || c.condition.id || '').toLowerCase(),
  )

  const currentHp = character.vitals.currentHp ?? 0
  const deadAt = derived.deadAt ?? -10

  const hasCond = (name: string) => condNames.some((c) => c.includes(name))

  const isDead = currentHp <= deadAt || hasCond('dead')
  const isUnconscious = (currentHp < 0 && !isDead) || hasCond('unconscious') || hasCond('dying')
  const isDisabled = currentHp === 0 || hasCond('disabled')

  return {
    isDead,
    isUnconscious,
    isDisabled,
    isParalyzed: hasCond('paralyz'),
    isPetrified: hasCond('petrif'),
    isStunned: hasCond('stun'),
    isDazed: hasCond('daze'),
    isAsleep: hasCond('sleep') || hasCond('asleep'),
    isNauseated: hasCond('nausea'),
    isPinned: hasCond('pinned'),
    isGrappled: hasCond('grapple') && !hasCond('pinned'),
    isImmobilized: hasCond('immobili'),
    isEntangled: hasCond('entangle'),
    isProne: hasCond('prone'),
    isBlinded: hasCond('blind'),
    isShaken: hasCond('shaken') || hasCond('frighten'),
    isFatigued: hasCond('fatigue'),
    isExhausted: hasCond('exhaust'),
  }
}

export function buildPf1eActions(
  character: CharacterDocument,
  derived: DerivedView,
): ActionGroup[] {
  const c = getConditionState(character, derived)

  function evaluate(
    kind: ActionRow['kind'],
    actionCost: 'standard' | 'move' | 'full' | 'swift' | 'free',
    extra?: { isRanged?: boolean; isCrossbow?: boolean; isTwoHanded?: boolean },
  ): { availability: ActionAvailability; reason?: string } {
    if (c.isDead) return { availability: 'unavailable', reason: 'dead' }
    if (c.isUnconscious) return { availability: 'unavailable', reason: 'unconscious' }
    if (c.isPetrified) return { availability: 'unavailable', reason: 'petrified' }
    if (c.isAsleep) return { availability: 'unavailable', reason: 'asleep' }
    if (c.isStunned) return { availability: 'unavailable', reason: 'stunned' }
    if (c.isDazed) return { availability: 'unavailable', reason: 'dazed' }

    if (c.isParalyzed) {
      if (kind === 'move' || kind === 'attack' || kind === 'maneuver') {
        return { availability: 'unavailable', reason: 'paralyzed' }
      }
      return { availability: 'hindered', reason: 'mental only' }
    }

    if (c.isNauseated) {
      if (actionCost !== 'move') {
        return { availability: 'unavailable', reason: 'nauseated (single move action only)' }
      }
    }

    if (c.isPinned) {
      if (kind === 'move') return { availability: 'unavailable', reason: 'pinned' }
      if (kind === 'attack' || actionCost === 'full') return { availability: 'unavailable', reason: 'pinned' }
      if (kind === 'maneuver') return { availability: 'hindered', reason: 'escape grapple only' }
    }

    if (c.isGrappled) {
      if (kind === 'move') return { availability: 'unavailable', reason: 'grappled (cannot move)' }
      if (actionCost === 'full') return { availability: 'unavailable', reason: 'grappled (no full-round action)' }
      if (extra?.isTwoHanded) return { availability: 'unavailable', reason: 'grappled (no two-handed weapons)' }
      if (kind === 'attack') return { availability: 'hindered', reason: 'grappled (-2 attack)' }
    }

    if (c.isImmobilized && kind === 'move') {
      return { availability: 'unavailable', reason: 'immobilized' }
    }

    if (c.isProne) {
      if (kind === 'attack') {
        if (extra?.isRanged && !extra?.isCrossbow) {
          return { availability: 'unavailable', reason: 'prone (cannot fire bow)' }
        }
        return { availability: 'hindered', reason: 'prone (-4 melee attack)' }
      }
      if (actionCost === 'full' && kind === 'move') {
        return { availability: 'unavailable', reason: 'prone (cannot run/charge)' }
      }
    }

    if (c.isEntangled) {
      if (kind === 'attack' || kind === 'maneuver') {
        return { availability: 'hindered', reason: 'entangled (-2 attack)' }
      }
      if (kind === 'move') {
        return { availability: 'hindered', reason: 'entangled (half speed)' }
      }
    }

    if (c.isBlinded) {
      if (kind === 'attack' || kind === 'maneuver') {
        return { availability: 'hindered', reason: 'blinded (50% miss chance)' }
      }
      if (kind === 'move') {
        return { availability: 'hindered', reason: 'blinded (half speed)' }
      }
    }

    if (c.isFatigued && (kind === 'move' && actionCost === 'full')) {
      return { availability: 'unavailable', reason: 'fatigued (cannot run/charge)' }
    }

    if (c.isExhausted) {
      if (kind === 'move') {
        if (actionCost === 'full') return { availability: 'unavailable', reason: 'exhausted (cannot run/charge)' }
        return { availability: 'hindered', reason: 'exhausted (half speed)' }
      }
      if (kind === 'attack' || kind === 'maneuver') {
        return { availability: 'hindered', reason: 'exhausted (-3 attack)' }
      }
    }

    if (c.isShaken && (kind === 'attack' || kind === 'skill' || kind === 'maneuver')) {
      return { availability: 'hindered', reason: 'shaken (-2 penalty)' }
    }

    if (c.isDisabled && actionCost === 'standard') {
      return { availability: 'hindered', reason: 'disabled (taking standard action deals 1 damage)' }
    }

    return { availability: 'available' }
  }

  // 1. Standard Actions
  const standardItems: ActionRow[] = []
  for (const atk of character.attacks) {
    const isRanged = atk.attackType === 'ranged'
    const isCrossbow = atk.name.toLowerCase().includes('crossbow')
    const st = evaluate('attack', 'standard', { isRanged, isCrossbow })
    const derivedAtk = derived.attacks[atk.id]
    standardItems.push({
      id: `atk-${atk.id}`,
      label: `Attack: ${atk.name}`,
      kind: 'attack',
      actionEconomyGroup: 'standard',
      actionCost: 'Standard',
      availability: st.availability,
      reason: st.reason,
      detail: derivedAtk ? `${derivedAtk.attack >= 0 ? '+' : ''}${derivedAtk.attack} (${derivedAtk.damage})` : undefined,
    })
  }

  const maneuvers = [
    { name: 'Trip', key: 'trip' },
    { name: 'Disarm', key: 'disarm' },
    { name: 'Grapple', key: 'grapple' },
    { name: 'Bull Rush', key: 'bull-rush' },
    { name: 'Overrun', key: 'overrun' },
    { name: 'Sunder', key: 'sunder' },
    { name: 'Feint', key: 'feint' },
  ]
  for (const m of maneuvers) {
    const st = evaluate('maneuver', 'standard')
    standardItems.push({
      id: `maneuver-${m.key}`,
      label: `Maneuver: ${m.name}`,
      kind: 'maneuver',
      actionEconomyGroup: 'standard',
      actionCost: 'Standard',
      availability: st.availability,
      reason: st.reason,
      detail: `CMB ${derived.cmb >= 0 ? '+' : ''}${derived.cmb}`,
    })
  }

  if (character.spellcasting && character.spellcasting.length > 0) {
    const st = evaluate('spell', 'standard')
    standardItems.push({
      id: 'cast-spell-standard',
      label: 'Cast a Spell',
      kind: 'spell',
      actionEconomyGroup: 'standard',
      actionCost: 'Standard',
      availability: st.availability,
      reason: st.reason,
    })
  }

  const td = evaluate('other', 'standard')
  standardItems.push({
    id: 'total-defense',
    label: 'Total Defense (+4 Dodge AC)',
    kind: 'other',
    actionEconomyGroup: 'standard',
    actionCost: 'Standard',
    availability: td.availability,
    reason: td.reason,
  })

  // 2. Move Actions
  const moveItems: ActionRow[] = []
  const speeds = character.vitals.speeds ?? [{ kind: 'land', feet: 30 }]
  for (const spd of speeds) {
    const st = evaluate('move', 'move')
    moveItems.push({
      id: `move-${spd.kind}`,
      label: `Move: ${spd.kind.charAt(0).toUpperCase() + spd.kind.slice(1)} (${spd.feet} ft)`,
      kind: 'move',
      actionEconomyGroup: 'move',
      actionCost: 'Move',
      availability: st.availability,
      reason: st.reason,
    })
  }
  const standUp = evaluate('move', 'move')
  moveItems.push({
    id: 'move-stand-up',
    label: 'Stand Up from Prone',
    kind: 'move',
    actionEconomyGroup: 'move',
    actionCost: 'Move',
    availability: c.isProne ? standUp.availability : 'available',
    reason: standUp.reason,
  })
  moveItems.push({
    id: 'move-draw-weapon',
    label: 'Draw Weapon',
    kind: 'move',
    actionEconomyGroup: 'move',
    actionCost: 'Move',
    availability: evaluate('move', 'move').availability,
    reason: evaluate('move', 'move').reason,
    detail: 'No AoO',
  })
  moveItems.push({
    id: 'move-sheathe-weapon',
    label: 'Sheathe Weapon',
    kind: 'move',
    actionEconomyGroup: 'move',
    actionCost: 'Move',
    availability: evaluate('move', 'move').availability,
    reason: evaluate('move', 'move').reason,
    detail: 'Provokes AoO',
  })

  // 3. Full-Round Actions
  const fullItems: ActionRow[] = []
  if (character.attacks.length > 0) {
    const st = evaluate('attack', 'full')
    fullItems.push({
      id: 'full-attack',
      label: 'Full Attack',
      kind: 'attack',
      actionEconomyGroup: 'full',
      actionCost: 'Full-Round',
      availability: st.availability,
      reason: st.reason,
      detail: derived.babIteratives.map((b) => (b >= 0 ? `+${b}` : `${b}`)).join(' / '),
    })
  }
  const chargeSt = evaluate('attack', 'full')
  fullItems.push({
    id: 'charge-action',
    label: 'Charge (Double move, +2 attack, -2 AC)',
    kind: 'attack',
    actionEconomyGroup: 'full',
    actionCost: 'Full-Round',
    availability: chargeSt.availability,
    reason: chargeSt.reason,
  })
  const runSt = evaluate('move', 'full')
  fullItems.push({
    id: 'run-action',
    label: 'Run (4× speed in a straight line)',
    kind: 'move',
    actionEconomyGroup: 'full',
    actionCost: 'Full-Round',
    availability: runSt.availability,
    reason: runSt.reason,
  })
  const withdrawSt = evaluate('move', 'full')
  fullItems.push({
    id: 'withdraw-action',
    label: 'Withdraw (Double move, first square safe)',
    kind: 'move',
    actionEconomyGroup: 'full',
    actionCost: 'Full-Round',
    availability: withdrawSt.availability,
    reason: withdrawSt.reason,
  })

  // 4. Swift & Immediate Actions
  const swiftItems: ActionRow[] = []
  if (character.play?.dailyResources) {
    for (const res of character.play.dailyResources) {
      const st = evaluate('aptitude', 'swift')
      swiftItems.push({
        id: `res-${res.id}`,
        label: `Use: ${res.name}`,
        kind: 'aptitude',
        actionEconomyGroup: 'swift',
        actionCost: 'Swift/Varies',
        availability: res.remaining <= 0 ? 'unavailable' : st.availability,
        reason: res.remaining <= 0 ? 'no uses remaining' : st.reason,
        detail: `${res.remaining} / ${res.max} uses`,
      })
    }
  }

  // 5. Free Actions
  const freeItems: ActionRow[] = [
    {
      id: 'free-5-foot-step',
      label: '5-Foot Step',
      kind: 'move',
      actionEconomyGroup: 'free',
      actionCost: 'None',
      availability: evaluate('move', 'free').availability,
      reason: evaluate('move', 'free').reason,
      detail: 'No AoO; only if no other movement taken',
    },
    {
      id: 'free-drop-item',
      label: 'Drop Item',
      kind: 'other',
      actionEconomyGroup: 'free',
      actionCost: 'Free',
      availability: evaluate('other', 'free').availability,
      reason: evaluate('other', 'free').reason,
    },
    {
      id: 'free-drop-prone',
      label: 'Drop Prone',
      kind: 'other',
      actionEconomyGroup: 'free',
      actionCost: 'Free',
      availability: c.isProne ? 'unavailable' : evaluate('other', 'free').availability,
      reason: c.isProne ? 'already prone' : evaluate('other', 'free').reason,
    },
    {
      id: 'free-speak',
      label: 'Speak a few sentences',
      kind: 'other',
      actionEconomyGroup: 'free',
      actionCost: 'Free',
      availability: evaluate('other', 'free').availability,
      reason: evaluate('other', 'free').reason,
    },
  ]

  return [
    { id: 'standard', title: 'Standard Actions', items: standardItems },
    { id: 'move', title: 'Move Actions', items: moveItems },
    { id: 'full', title: 'Full-Round Actions', items: fullItems },
    { id: 'swift', title: 'Swift & Immediate Actions', items: swiftItems },
    { id: 'free', title: 'Free Actions', items: freeItems },
  ]
}
