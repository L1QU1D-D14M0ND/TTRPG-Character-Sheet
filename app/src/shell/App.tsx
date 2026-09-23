import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { APP_DISPLAY_NAME } from '../shared/constants'
import { LOCALES, useI18n } from '../shared/i18n'
import { CharacterSaveError, readTextFile } from '../shared/saveLoad'
import type { SystemId } from '../shared/envelope'
import { pf1eModule } from '../systems/pf1e/module'
import { pf2eModule } from '../systems/pf2e/module'
import { parseLoadedSheet, type LoadedSheet } from './loadSheet'
import { parseDraft } from './draft'
import { clearDraft, readDraft, writeDraft } from './draftStore'
import {
  createSheet,
  downloadSheet,
  serializeSheet,
  stampSheetLocale,
} from './registry'
import { NewSheetDialog } from './NewSheetDialog'
import { RestoreDraftDialog } from './RestoreDraftDialog'
import { AboutDialog } from './AboutDialog'
import { SidebarHost } from './sidebar/SidebarHost'
import type { SystemModule } from './types'
import { usePrefersNarrow } from './usePrefersNarrow'
import './App.css'

function touchMeta<T extends { meta: { updatedAt: string } }>(character: T): T {
  return {
    ...character,
    meta: { ...character.meta, updatedAt: new Date().toISOString() },
  }
}

export function SheetSession<Doc extends { meta: { updatedAt: string } }, Derived>({
  module,
  character,
  setCharacter,
  setStatus,
  sidebarCollapsed,
  setSidebarCollapsed,
}: {
  module: SystemModule<Doc, Derived>
  character: Doc
  setCharacter: (mutator: (c: Doc) => Doc) => void
  setStatus: (message: string) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void
}) {
  const [activeTab, setActiveTab] = useState<string>('identity')
  const derived = useMemo(() => module.compute(character), [character, module])
  const update = (mutator: (c: Doc) => Doc) => {
    setCharacter((c) => touchMeta(mutator(c)))
  }
  const focusTab = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [])
  const Workspace = module.Workspace
  return (
    <>
      <div className="workspace-main">
        <Workspace
          character={character}
          derived={derived}
          update={update}
          setStatus={setStatus}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      <SidebarHost
        tools={module.sidebarTools}
        context={{
          system: module.id,
          character,
          derived,
          update,
          focusTab,
        }}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />
    </>
  )
}

export default function App() {
  const { t, locale, setLocale } = useI18n()
  const [sheet, setSheet] = useState<LoadedSheet>(() => createSheet('pf2e'))
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [draftGate, setDraftGate] = useState<'boot' | 'prompt' | 'ready'>(
    'boot',
  )
  const [restoreSheet, setRestoreSheet] = useState<LoadedSheet | null>(null)
  const [autosave, setAutosave] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const isNarrow = usePrefersNarrow()
  const displayNameKey =
    sheet.system === 'pf1e'
      ? pf1eModule.displayNameKey
      : pf2eModule.displayNameKey
  const toolsEmpty =
    (sheet.system === 'pf1e'
      ? pf1eModule.sidebarTools
      : pf2eModule.sidebarTools
    ).length === 0
  const sidebarCollapsed = sidebarOverride ?? (toolsEmpty || isNarrow)

  function commitSheet(next: LoadedSheet, message: string) {
    setSheet(next)
    setStatus(message)
    setAutosave(true)
    setDraftGate('ready')
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const restored = parseDraft(await readDraft())
      if (cancelled) return
      if (!restored) {
        setDraftGate('ready')
        return
      }
      setRestoreSheet(restored)
      setDraftGate('prompt')
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (draftGate !== 'ready' || !autosave) return
    const handle = window.setTimeout(() => {
      try {
        void writeDraft(serializeSheet(stampSheetLocale(sheet, locale)))
      } catch {
        // Invalid in-memory sheet: keep the last good draft.
      }
    }, 400)
    return () => window.clearTimeout(handle)
  }, [sheet, draftGate, autosave, locale])

  useEffect(() => {
    setSheet((prev) => stampSheetLocale(prev, locale))
  }, [locale])

  function onChooseNew(system: SystemId) {
    setNewOpen(false)
    const next = stampSheetLocale(createSheet(system), locale)
    commitSheet(
      next,
      t('shell.newCreated', { system: t(activeNameKey(system)) }),
    )
  }

  async function onLoadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const loaded = parseLoadedSheet(await readTextFile(file))
      commitSheet(
        loaded,
        t('shell.loaded', { name: file.name, system: loaded.system }),
      )
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t('shell.loadFailed'))
    }
  }

  function onSave() {
    try {
      downloadSheet(stampSheetLocale(sheet, locale))
      setStatus(t('shell.saved'))
    } catch (err) {
      setStatus(
        err instanceof CharacterSaveError
          ? err.message
          : err instanceof Error
            ? err.message
            : t('shell.saveFailed'),
      )
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>{APP_DISPLAY_NAME}</h1>
          <p className="tagline">
            {t('shell.tagline', {
              system: t(displayNameKey),
              version: sheet.character.schemaVersion,
            })}
          </p>
        </div>
        <div className="toolbar">
          <button type="button" onClick={() => setNewOpen(true)}>
            {t('shell.newSheet')}
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}>
            {t('shell.loadSheet')}
          </button>
          <button type="button" className="primary" onClick={onSave}>
            {t('shell.saveSheet')}
          </button>
          <button
            type="button"
            onClick={() => setSidebarOverride(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? t('shell.showTools') : t('shell.hideTools')}
          </button>
          <button type="button" onClick={() => setAboutOpen(true)}>
            {t('shell.about')}
          </button>
          <label className="locale-picker">
            {t('shell.language')}
            <select
              aria-label={t('shell.language')}
              value={locale}
              onChange={(event) => {
                const next = event.target.value
                if (next !== 'en' && next !== 'es') return
                setLocale(next)
                setSheet((prev) => stampSheetLocale(prev, next))
                setAutosave(true)
              }}
            >
              {LOCALES.map((id) => (
                <option key={id} value={id}>
                  {t(id === 'en' ? 'shell.localeEn' : 'shell.localeEs')}
                </option>
              ))}
            </select>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={onLoadFile}
          />
        </div>
      </header>

      <div className="workspace-layout">
        {sheet.system === 'pf1e' ? (
          <SheetSession
            key="session-pf1e"
            module={pf1eModule}
            character={sheet.character}
            setCharacter={(mutator) => {
              setAutosave(true)
              setSheet((prev) =>
                prev.system === 'pf1e'
                  ? { system: 'pf1e', character: mutator(prev.character) }
                  : prev,
              )
            }}
            setStatus={setStatus}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={(value) => {
              const next =
                typeof value === 'function' ? value(sidebarCollapsed) : value
              setSidebarOverride(next)
            }}
          />
        ) : (
          <SheetSession
            key="session-pf2e"
            module={pf2eModule}
            character={sheet.character}
            setCharacter={(mutator) => {
              setAutosave(true)
              setSheet((prev) =>
                prev.system === 'pf2e'
                  ? { system: 'pf2e', character: mutator(prev.character) }
                  : prev,
              )
            }}
            setStatus={setStatus}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={(value) => {
              const next =
                typeof value === 'function' ? value(sidebarCollapsed) : value
              setSidebarOverride(next)
            }}
          />
        )}
      </div>

      <footer className="status" role="status" aria-live="polite">{status ?? t('shell.newReady')}</footer>
      <NewSheetDialog
        open={newOpen}
        onCancel={() => setNewOpen(false)}
        onChoose={onChooseNew}
      />
      <AboutDialog
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />
      <RestoreDraftDialog
        open={draftGate === 'prompt'}
        onRestore={() => {
          if (!restoreSheet) return
          commitSheet(restoreSheet, t('shell.draftRestored'))
          setRestoreSheet(null)
        }}
        onDiscard={() => {
          void clearDraft()
          setRestoreSheet(null)
          setDraftGate('ready')
          setStatus(t('shell.draftDiscarded'))
        }}
      />
    </div>
  )
}

function activeNameKey(system: SystemId): string {
  return system === 'pf1e' ? pf1eModule.displayNameKey : pf2eModule.displayNameKey
}
