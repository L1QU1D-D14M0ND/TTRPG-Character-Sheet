import { useMemo, useState } from 'react'
import { useT } from '../../../../shared/i18n'
import type { EncyclopediaEntry, EncyclopediaGroup } from './types'

const VISIBLE_ROW_LIMIT = 60

export interface EncyclopediaProps {
  groups: EncyclopediaGroup[]
}

export function Encyclopedia({ groups }: EncyclopediaProps) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { visible, hidden, selected } = useMemo(
    () => filterGroups(groups, query, selectedId),
    [groups, query, selectedId],
  )

  return (
    <div className="encyclopedia">
      <label className="encyclopedia-search">
        <span>{t('shell.encyclopedia.search')}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {visible.map((group) => (
        <section key={group.kind} className="encyclopedia-group">
          <h3>{t(`shell.encyclopedia.kind.${group.kind}`)}</h3>
          {group.entries.length === 0 ? (
            <p className="muted">{t('shell.encyclopedia.emptyGroup')}</p>
          ) : (
            <ul>
              {group.entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={entry.id === selectedId ? 'active' : undefined}
                    aria-pressed={entry.id === selectedId}
                    onClick={() => setSelectedId(entry.id)}
                  >
                    {entry.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      {hidden > 0 ? (
        <p className="muted">{t('shell.encyclopedia.overflow', { count: hidden })}</p>
      ) : null}
      {selected ? (
        <article className="encyclopedia-body">
          <h3>{selected.name}</h3>
          <p>{selected.body}</p>
        </article>
      ) : null}
    </div>
  )
}

function filterGroups(
  groups: EncyclopediaGroup[],
  query: string,
  selectedId: string | null,
): { visible: EncyclopediaGroup[]; hidden: number; selected: EncyclopediaEntry | null } {
  const needle = query.trim().toLowerCase()
  const matched = groups.map((group) => ({
    ...group,
    entries: group.entries.filter(
      (entry) => needle.length === 0 || entry.name.toLowerCase().includes(needle),
    ),
  }))
  const total = matched.reduce((sum, group) => sum + group.entries.length, 0)
  let budget = VISIBLE_ROW_LIMIT
  const visible = matched.map((group) => {
    const entries = group.entries.slice(0, budget)
    budget -= entries.length
    return { ...group, entries }
  })
  const selected =
    groups.flatMap((group) => group.entries).find((entry) => entry.id === selectedId) ??
    null
  return { visible, hidden: Math.max(0, total - VISIBLE_ROW_LIMIT), selected }
}
