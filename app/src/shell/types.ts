import type { ComponentType, ReactNode } from 'react'
import type { SystemId } from '../shared/envelope'

export interface SidebarToolContext<Doc, Derived> {
  system: SystemId
  character: Doc
  derived: Derived
  update: (mutator: (c: Doc) => Doc) => void
  focusTab?: (tabId: string) => void
}

export interface SidebarTool<Doc, Derived> {
  id: string
  labelKey: string
  systems?: SystemId[]
  render: (ctx: SidebarToolContext<Doc, Derived>) => ReactNode
}

export interface SheetWorkspaceProps<Doc, Derived> {
  character: Doc
  derived: Derived
  update: (mutator: (c: Doc) => Doc) => void
  setStatus: (message: string) => void
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export interface SystemModule<Doc, Derived> {
  id: SystemId
  displayNameKey: string
  validate(data: unknown): Doc
  createEmpty(): Doc
  compute(doc: Doc): Derived
  parse(text: string): Doc
  serialize(doc: Doc): string
  download(doc: Doc): void
  readFile(file: File): Promise<Doc>
  suggestedFilename(doc: Doc): string
  Workspace: ComponentType<SheetWorkspaceProps<Doc, Derived>>
  sidebarTools: SidebarTool<Doc, Derived>[]
}
