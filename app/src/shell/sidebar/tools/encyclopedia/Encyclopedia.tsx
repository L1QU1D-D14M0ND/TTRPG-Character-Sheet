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
            <p className="muted">
              {t(group.packed === 0
                ? 'shell.encyclopedia.emptyGroup'
                : 'shell.encyclopedia.noMatches')}
            </p>
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
          {group.heldBack > 0 ? (
            <p className="muted">
              {t('shell.encyclopedia.groupOverflow', { count: group.heldBack })}
            </p>
          ) : null}
        </section>
      ))}
      {hidden > 0 ? (
        <p className="muted">{t('shell.encyclopedia.overflow', { count: hidden })}</p>
      ) : null}
      {selected ? (
        <article className="encyclopedia-body">
          <h3>
            {selected.name}
            {selected.altName ? (
              <span className="muted"> ({selected.altName})</span>
            ) : null}
          </h3>
          <p>{selected.body}</p>
        </article>
      ) : null}
    </div>
  )
}

interface VisibleGroup extends EncyclopediaGroup {
  /** Entries this group ships, before search or the row cap narrowed it. */
  packed: number
  /** Matches in this group the row cap held back. */
  heldBack: number
}

/**
 * Share the row cap across groups instead of letting the first group spend it
 * all. A group that matches is always allotted at least one row, so a large
 * Spells group can never make a non-empty Feats group look unpacked.
 */
function allocate(counts: number[], limit: number): number[] {
  const allowed = counts.map(() => 0)
  let remaining = Math.min(
    limit,
    counts.reduce((sum, count) => sum + count, 0),
  )
  // Round-robin one row at a time: naturally fair and starvation-free.
  while (remaining > 0) {
    let progressed = false
    for (let i = 0; i < counts.length && remaining > 0; i += 1) {
      if (allowed[i] >= counts[i]) continue
      allowed[i] += 1
      remaining -= 1
      progressed = true
    }
    if (!progressed) break
  }
  return allowed
}

/**
 * Fold case and accents so a localized catalog is searchable from a keyboard
 * without dead keys: "bola de fuego" finds "Bola de fuego".
 */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function filterGroups(
  groups: EncyclopediaGroup[],
  query: string,
  selectedId: string | null,
): { visible: VisibleGroup[]; hidden: number; selected: EncyclopediaEntry | null } {
  const needle = fold(query.trim())
  const matched = groups.map((group) => ({
    ...group,
    entries: group.entries
      // Match the other name too, so a player who learned the game in
      // English still finds an entry with a translated catalog.
      .filter(
        (entry) =>
          needle.length === 0 ||
          fold(entry.name).includes(needle) ||
          (entry.altName !== undefined && fold(entry.altName).includes(needle)),
      )
      // Entries arrive in content-batch order; players expect them by name.
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name)),
  }))
  const allowed = allocate(
    matched.map((group) => group.entries.length),
    VISIBLE_ROW_LIMIT,
  )
  let hidden = 0
  const visible = matched.map((group, i) => {
    const entries = group.entries.slice(0, allowed[i])
    const heldBack = group.entries.length - entries.length
    hidden += heldBack
    return { ...group, entries, packed: groups[i].entries.length, heldBack }
  })
  const selected =
    groups.flatMap((group) => group.entries).find((entry) => entry.id === selectedId) ??
    null
  return { visible, hidden, selected }
}
