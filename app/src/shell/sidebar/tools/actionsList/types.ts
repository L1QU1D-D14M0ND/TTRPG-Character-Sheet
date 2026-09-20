export type ActionKind =
  | 'attack'
  | 'maneuver'
  | 'move'
  | 'skill'
  | 'aptitude'
  | 'spell'
  | 'other'

export type ActionAvailability = 'available' | 'hindered' | 'unavailable'

export interface ActionRow {
  id: string
  label: string
  kind: ActionKind
  actionEconomyGroup: string // id of group
  actionCost?: string // e.g. "Standard", "1 Action", "Reaction"
  availability: ActionAvailability
  reason?: string
  detail?: string
}

export interface ActionGroup {
  id: string
  title: string
  items: ActionRow[]
}
