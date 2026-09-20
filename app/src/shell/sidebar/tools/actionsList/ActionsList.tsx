import { useMemo, useState } from 'react'
import { useT } from '../../../../shared/i18n'
import type { ActionGroup } from './types'

export interface ActionsListProps {
  groups: ActionGroup[]
}

export function ActionsList({ groups }: ActionsListProps) {
  const t = useT()
  const [hideUnavailable, setHideUnavailable] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  function toggleGroup(groupId: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const filteredGroups = useMemo(() => {
    if (!hideUnavailable) return groups
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => item.availability !== 'unavailable'),
      }))
      .filter((g) => g.items.length > 0)
  }, [groups, hideUnavailable])

  return (
    <div className="actions-list-container">
      <div className="actions-list-toolbar">
        <label className="actions-list-filter-label">
          <input
            type="checkbox"
            checked={hideUnavailable}
            onChange={(e) => setHideUnavailable(e.target.checked)}
          />
          <span>{t('shell.actionsList.hideUnavailable')}</span>
        </label>
      </div>

      {filteredGroups.length === 0 ? (
        <p className="muted">{t('shell.actionsList.noActions')}</p>
      ) : (
        <div className="actions-list-groups">
          {filteredGroups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.id)
            return (
              <div key={group.id} className="action-group-card">
                <button
                  type="button"
                  className="action-group-header"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={!isCollapsed}
                >
                  <span className="group-title">
                    <strong>{group.title}</strong> ({group.items.length})
                  </span>
                  <span className="group-arrow">{isCollapsed ? '▸' : '▾'}</span>
                </button>

                {!isCollapsed && (
                  <ul className="action-group-items">
                    {group.items.map((item) => {
                      const isUnavailable = item.availability === 'unavailable'
                      const isHindered = item.availability === 'hindered'

                      return (
                        <li
                          key={item.id}
                          className={`action-item-row ${item.availability}`}
                        >
                          <div className="action-main">
                            <span className="action-label">{item.label}</span>
                            {item.actionCost && (
                              <span className="action-cost-badge">{item.actionCost}</span>
                            )}
                          </div>

                          {item.detail && (
                            <div className="action-detail muted">
                              <small>{item.detail}</small>
                            </div>
                          )}

                          {isUnavailable && item.reason && (
                            <div className="action-reason-chip unavailable">
                              <span>⛔ {item.reason}</span>
                            </div>
                          )}

                          {isHindered && item.reason && (
                            <div className="action-reason-chip hindered">
                              <span>⚠️ {item.reason}</span>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
