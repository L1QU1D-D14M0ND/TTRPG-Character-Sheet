export type EncyclopediaKind =
  | 'spell'
  | 'feat'
  | 'feature'
  | 'affliction'
  | 'action'

export interface EncyclopediaEntry {
  id: string
  name: string
  /**
   * The other name this entry is known by: the English catalog name when
   * `name` is a curated translation. Undefined when the two are the same.
   */
  altName?: string
  body: string
}

export interface EncyclopediaGroup {
  kind: EncyclopediaKind
  entries: EncyclopediaEntry[]
}
