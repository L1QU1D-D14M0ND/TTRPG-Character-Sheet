import { useCallback, useId, useMemo, useState } from 'react'
import { useT, type TranslateFn } from '../../../shared/i18n'
import { ModalDialog } from '../../../shared/ui/ModalDialog'
import {
  catalogId,
  catalogName,
  groupsFor,
  setCatalogName,
  showsSearch,
  stamp,
  visibleCatalog,
  type CatalogKind,
  type HostFor,
} from './catalogPicker'

export function CatalogPicker<K extends CatalogKind>({
  kind,
  value,
  catalogLabel,
  nameLabel,
  customLabel,
  onPick,
}: {
  kind: K
  value: HostFor<K>
  catalogLabel: string
  nameLabel: string
  customLabel?: string
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
  const emptyLabel = customLabel ?? t('pf1e.common.custom')

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  function pick(id: string | null) {
    onPick(stamp(kind, value, id))
    close()
  }

  const triggerText = selectedId
    ? selectedName || emptyLabel
    : emptyLabel

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
      <ModalDialog
        open={open}
        onClose={close}
        labelledBy={titleId}
        className="catalog-picker-dialog"
      >
        <h2 id={titleId}>{catalogLabel}</h2>
        {withSearch ? (
          <input
            type="search"
            aria-label={t('pf1e.catalogPicker.search')}
            placeholder={t('pf1e.catalogPicker.search')}
            value={query}
            data-autofocus=""
            onChange={(e) => setQuery(e.target.value)}
          />
        ) : null}
        <CatalogOptions
          groups={groups}
          query={query}
          selectedId={selectedId}
          customLabel={emptyLabel}
          noMatches={t('pf1e.catalogPicker.noMatches')}
          onPick={pick}
          t={t}
        />
        <div className="dialog-actions">
          <button type="button" onClick={close}>
            {t('pf1e.catalogPicker.close')}
          </button>
        </div>
      </ModalDialog>
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
  const visible = useMemo(
    () => visibleCatalog(groups, query, selectedId),
    [groups, query, selectedId],
  )

  return (
    <div className="catalog-picker-list" role="listbox">
      <OptionButton
        selected={!selectedId}
        label={customLabel}
        onClick={() => onPick(null)}
      />
      {visible.empty ? <p className="muted">{noMatches}</p> : null}
      {visible.groups.map((group, index) => (
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
      {visible.hidden > 0 ? (
        <p className="muted catalog-picker-more" role="status">
          {t('pf1e.catalogPicker.more', { count: visible.hidden })}
        </p>
      ) : null}
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
