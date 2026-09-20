import { useState } from 'react'
import { useT } from '../../shared/i18n'
import type { SidebarTool, SidebarToolContext } from '../types'

export function SidebarHost<Doc, Derived>({
  tools,
  context,
  collapsed,
  onToggle,
}: {
  tools: SidebarTool<Doc, Derived>[]
  context: SidebarToolContext<Doc, Derived>
  collapsed: boolean
  onToggle: () => void
}) {
  const t = useT()
  const [activeToolId, setActiveToolId] = useState<string | null>(null)

  const available = tools.filter(
    (tool) => !tool.systems || tool.systems.includes(context.system),
  )

  const currentActiveId =
    activeToolId && available.some((tool) => tool.id === activeToolId)
      ? activeToolId
      : available[0]?.id

  const activeTool = available.find((tool) => tool.id === currentActiveId)

  if (collapsed) {
    return (
      <aside className="sidebar-host collapsed" aria-label={t('shell.toolsAria')}>
        <button type="button" onClick={onToggle}>
          {t('shell.tools')}
        </button>
      </aside>
    )
  }

  return (
    <aside className="sidebar-host" aria-label={t('shell.toolsAria')}>
      <div className="sidebar-header">
        <strong>{t('shell.tools')}</strong>
        <button type="button" onClick={onToggle}>
          {t('shell.hide')}
        </button>
      </div>
      {available.length === 0 ? (
        <p className="muted sidebar-empty">{t('shell.toolsEmpty')}</p>
      ) : (
        <div className="sidebar-content">
          {available.length > 1 && (
            <nav className="sidebar-tool-tabs" aria-label={t('shell.toolsAria')}>
              {available.map((tool) => {
                const isActive = tool.id === currentActiveId
                return (
                  <button
                    key={tool.id}
                    type="button"
                    className={`sidebar-tool-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveToolId(tool.id)}
                    aria-selected={isActive}
                  >
                    {t(tool.labelKey)}
                  </button>
                )
              })}
            </nav>
          )}
          <div className="sidebar-tool-body">
            {activeTool ? activeTool.render(context) : null}
          </div>
        </div>
      )}
    </aside>
  )
}
