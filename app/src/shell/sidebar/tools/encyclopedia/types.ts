export type EncyclopediaKind =
  | 'spell'
  | 'feat'
  | 'feature'
  | 'affliction'
  | 'action'

export interface EncyclopediaEntry {
  id: string
  name: string
  body: string
}

export interface EncyclopediaGroup {
  kind: EncyclopediaKind
  entries: EncyclopediaEntry[]
}
