import { useEffect, useId, useMemo, useState } from 'react'
import { useT, type TranslateFn } from '../../../shared/i18n'
import {
  catalogId,
  catalogName,
  groupsFor,
  matchesName,
  setCatalogName,
  showsSearch,
  stamp,
  type CatalogKind,
  type HostFor,
} from './catalogPicker'

export function CatalogPicker<K extends CatalogKind>({
  kind,
  value,
  catalogLabel,
  nameLabel,
  onPick,
}: {
  kind: K
  value: HostFor<K>
  catalogLabel: string
  nameLabel: string
  onPick: (next: HostFor<K>) => void
}) {
  const t = useT()
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selectedId = catalogId(kind, value)
  const selectedName = catalogName(kind, value)
  const withSearch = showsSearch(kind)
  const groups = useMemo(() => groupsFor(kind), [kind])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function close() {
    setOpen(false)
    setQuery('')
  }

  function pick(id: string | null) {
    onPick(stamp(kind, value, id))
    close()
  }

  const triggerText = selectedId
    ? selectedName || t('pf1e.common.custom')
    : t('pf1e.common.custom')

  return (
    <>
      <button
        type="button"
        aria-label={catalogLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {triggerText}
      </button>
      <input
        aria-label={nameLabel}
        value={selectedName}
        onChange={(e) => onPick(setCatalogName(kind, value, e.target.value))}
      />
      {open ? (
        <div
          className="dialog-backdrop"
          role="presentation"
          onClick={close}
        >
          <div
            className="dialog-card catalog-picker-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={titleId}>{catalogLabel}</h2>
            {withSearch ? (
              <input
                type="search"
                aria-label={t('pf1e.catalogPicker.search')}
                placeholder={t('pf1e.catalogPicker.search')}
                value={query}
                autoFocus
                onChange={(e) => setQuery(e.target.value)}
              />
            ) : null}
            <CatalogOptions
              groups={groups}
              query={query}
              selectedId={selectedId}
              customLabel={t('pf1e.common.custom')}
              noMatches={t('pf1e.catalogPicker.noMatches')}
              onPick={pick}
              t={t}
            />
            <div className="dialog-actions">
              <button type="button" onClick={close}>
                {t('pf1e.catalogPicker.close')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function CatalogOptions({
  groups,
  query,
  selectedId,
  customLabel,
  noMatches,
  onPick,
  t,
}: {
  groups: ReturnType<typeof groupsFor>
  query: string
  selectedId: string | null
  customLabel: string
  noMatches: string
  onPick: (id: string | null) => void
  t: TranslateFn
}) {
  const filtered = groups
    .map((group) => ({
      ...group,
      rows: group.rows.filter((row) => matchesName(row.name, query)),
    }))
    .filter((group) => group.rows.length > 0)
  const anyRows = filtered.some((group) => group.rows.length > 0)

  return (
    <div className="catalog-picker-list" role="listbox">
      <OptionButton
        selected={!selectedId}
        label={customLabel}
        onClick={() => onPick(null)}
      />
      {!anyRows ? <p className="muted">{noMatches}</p> : null}
      {filtered.map((group, index) => (
        <div key={group.labelKey ?? index}>
          {group.labelKey ? (
            <p className="catalog-picker-group">{t(group.labelKey)}</p>
          ) : null}
          {group.rows.map((row) => (
            <OptionButton
              key={row.id}
              selected={selectedId === row.id}
              label={row.name}
              detail={row.detail}
              onClick={() => onPick(row.id)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function OptionButton({
  selected,
  label,
  detail,
  onClick,
}: {
  selected: boolean
  label: string
  detail?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
    >
      <span>{label}</span>
      {detail ? (
        <span className="muted" aria-hidden="true">
          {detail}
        </span>
      ) : null}
    </button>
  )
}
