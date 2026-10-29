import { useCallback, useId, useMemo, useState } from 'react'
import { useI18n, type TranslateFn } from '../../../shared/i18n'
import { ModalDialog } from '../../../shared/ui/ModalDialog'
import {
  catalogId,
  catalogName,
  displayName,
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
  const { locale, t } = useI18n()
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selectedId = catalogId(kind, value)
  const selectedName = catalogName(kind, value)
  const withSearch = showsSearch(kind)
  const groups = useMemo(() => groupsFor(kind, locale), [kind, locale])
  const emptyLabel = customLabel ?? t('pf1e.common.custom')

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  function pick(id: string | null) {
    onPick(stamp(kind, value, id))
    close()
  }

  /**
   * The trigger shows the localized name, but the editable name field below
   * keeps the document's own value: the sheet stores what the player will
   * read back on another machine, in another locale, so translating it
   * silently would change the saved character rather than its presentation.
   */
  const triggerText = selectedId
    ? displayName(selectedId, selectedName, locale) || emptyLabel
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
              altName={row.altName}
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
  altName,
  detail,
  onClick,
}: {
  selected: boolean
  label: string
  altName?: string
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
      {altName ? (
        <span className="muted catalog-picker-alt" aria-hidden="true">
          {altName}
        </span>
      ) : null}
      {detail ? (
        <span className="muted" aria-hidden="true">
          {detail}
        </span>
      ) : null}
    </button>
  )
}
