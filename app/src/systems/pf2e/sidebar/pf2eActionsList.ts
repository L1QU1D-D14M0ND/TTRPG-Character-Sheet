import type { CharacterDocument } from '../character/types'
import type { DerivedView } from '../engine/types'
import type {
  ActionAvailability,
  ActionGroup,
  ActionRow,
} from '../../../shell/sidebar/tools/actionsList/types'

export function buildPf2eActions(
  character: CharacterDocument,
  derived: DerivedView,
): ActionGroup[] {
  const condNames = (character.conditions ?? []).map((c) =>
    (c.condition.name || c.condition.id || '').toLowerCase(),
  )

  const hasCond = (name: string) => condNames.some((c) => c.includes(name))

  const isDying =
    (character.vitals.currentHp ?? 10) <= 0 ||
    (character.vitals.dying ?? 0) > 0 ||
    hasCond('dying') ||
    hasCond('unconscious')
  const isDead = hasCond('dead')
  const isParalyzed = hasCond('paralyz') || hasCond('petrif')
  const isStunned = hasCond('stun')
  const isGrabbed = hasCond('grab') || hasCond('restrain')
  const isImmobilized = hasCond('immobili') || isGrabbed
  const isProne = hasCond('prone')
  const isBlinded = hasCond('blind')
  const isFrightened = hasCond('frighten') || hasCond('sicken')

  function evaluate(kind: ActionRow['kind']): { availability: ActionAvailability; reason?: string } {
    if (isDead) return { availability: 'unavailable', reason: 'dead' }
    if (isDying) return { availability: 'unavailable', reason: 'unconscious' }
    if (isParalyzed) return { availability: 'unavailable', reason: 'paralyzed' }
    if (isStunned) return { availability: 'unavailable', reason: 'stunned' }

    if (kind === 'move') {
      if (isImmobilized) return { availability: 'unavailable', reason: isGrabbed ? 'grabbed' : 'immobilized' }
      if (isProne) return { availability: 'unavailable', reason: 'prone (must Stand first)' }
    }

    if (kind === 'attack') {
      if (isProne) return { availability: 'hindered', reason: 'prone (-2 attack)' }
      if (isBlinded) return { availability: 'hindered', reason: 'blinded (DC 11 flat check)' }
      if (isGrabbed) return { availability: 'hindered', reason: 'grabbed (DC 5 flat check for manipulate)' }
    }

    if (isFrightened) {
      return { availability: 'hindered', reason: 'frightened / status penalty' }
    }

    return { availability: 'available' }
  }

  // 1. Single Actions (1-Action)
  const singleActions: ActionRow[] = []
  for (const str of character.strikes) {
    const st = evaluate('attack')
    const derivedStr = derived.strikes[str.id]
    singleActions.push({
      id: `strike-${str.id}`,
      label: `Strike: ${str.name}`,
      kind: 'attack',
      actionEconomyGroup: 'actions',
      actionCost: '1 Action',
      availability: st.availability,
      reason: st.reason,
      detail: derivedStr ? `${derivedStr.attack >= 0 ? '+' : ''}${derivedStr.attack} (${derivedStr.damage})` : undefined,
    })
  }

  const speed = character.vitals.speeds?.[0]?.feet ?? 25
  const strideSt = evaluate('move')
  singleActions.push({
    id: 'stride-action',
    label: `Stride (${speed} ft)`,
    kind: 'move',
    actionEconomyGroup: 'actions',
    actionCost: '1 Action',
    availability: strideSt.availability,
    reason: strideSt.reason,
  })

  const stepSt = evaluate('move')
  singleActions.push({
    id: 'step-action',
    label: 'Step (5 ft, no reactions)',
    kind: 'move',
    actionEconomyGroup: 'actions',
    actionCost: '1 Action',
    availability: stepSt.availability,
    reason: stepSt.reason,
  })

  singleActions.push({
    id: 'stand-action',
    label: 'Stand Up from Prone',
    kind: 'move',
    actionEconomyGroup: 'actions',
    actionCost: '1 Action',
    availability: isDead || isDying || isParalyzed || isStunned ? 'unavailable' : 'available',
    reason: isDead || isDying || isParalyzed || isStunned ? 'incapacitated' : undefined,
  })

  singleActions.push({
    id: 'raise-shield',
    label: 'Raise a Shield (+2 circumstance AC)',
    kind: 'other',
    actionEconomyGroup: 'actions',
    actionCost: '1 Action',
    availability: evaluate('other').availability,
    reason: evaluate('other').reason,
  })

  singleActions.push({
    id: 'escape-action',
    label: 'Escape (vs Athletics / Acrobatics / Thievery DC)',
    kind: 'maneuver',
    actionEconomyGroup: 'actions',
    actionCost: '1 Action',
    availability: evaluate('maneuver').availability,
    reason: evaluate('maneuver').reason,
  })

  // 2. Activities (2-Action / 3-Action)
  const activities: ActionRow[] = [
    {
      id: 'activity-cast-spell',
      label: 'Cast a Spell',
      kind: 'spell',
      actionEconomyGroup: 'activities',
      actionCost: '2 Actions',
      availability: evaluate('spell').availability,
      reason: evaluate('spell').reason,
    },
    {
      id: 'activity-ready',
      label: 'Ready an Action',
      kind: 'other',
      actionEconomyGroup: 'activities',
      actionCost: '2 Actions',
      availability: evaluate('other').availability,
      reason: evaluate('other').reason,
    },
  ]

  // 3. Reactions
  const reactions: ActionRow[] = [
    {
      id: 'reaction-reactive-strike',
      label: 'Reactive Strike / AoO (Trigger: enemy manipulates or moves)',
      kind: 'attack',
      actionEconomyGroup: 'reactions',
      actionCost: 'Reaction',
      availability: evaluate('attack').availability,
      reason: evaluate('attack').reason,
    },
    {
      id: 'reaction-shield-block',
      label: 'Shield Block (Trigger: you take physical damage while shield raised)',
      kind: 'other',
      actionEconomyGroup: 'reactions',
      actionCost: 'Reaction',
      availability: evaluate('other').availability,
      reason: evaluate('other').reason,
    },
  ]

  // 4. Free Actions
  const freeActions: ActionRow[] = [
    {
      id: 'free-drop-prone',
      label: 'Drop Prone',
      kind: 'other',
      actionEconomyGroup: 'free',
      actionCost: 'Free Action',
      availability: isProne ? 'unavailable' : evaluate('other').availability,
      reason: isProne ? 'already prone' : evaluate('other').reason,
    },
    {
      id: 'free-release',
      label: 'Release Grip',
      kind: 'other',
      actionEconomyGroup: 'free',
      actionCost: 'Free Action',
      availability: evaluate('other').availability,
      reason: evaluate('other').reason,
    },
  ]

  return [
    { id: 'actions', title: 'Single Actions (◆)', items: singleActions },
    { id: 'activities', title: 'Activities (◆◆ / ◆◆◆)', items: activities },
    { id: 'reactions', title: 'Reactions (↺)', items: reactions },
    { id: 'free', title: 'Free Actions (◇)', items: freeActions },
  ]
}
