import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { APP_DISPLAY_NAME } from '../shared/constants'
import { LOCALES, useI18n } from '../shared/i18n'
import { CharacterSaveError, readTextFile } from '../shared/saveLoad'
import type { SystemId } from '../shared/envelope'
import { pf1eModule } from '../systems/pf1e/module'
import { pf2eModule } from '../systems/pf2e/module'
import {
  parseLoadedSheet,
  type DocumentFor,
  type LoadedSheet,
} from './loadSheet'
import { parseDraft } from './draft'
import { clearDraft, readDraft, writeDraft } from './draftStore'
import {
  createSheet,
  downloadSheet,
  serializeSheet,
  stampSheetLocale,
  SYSTEM_MODULES,
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
  const activeModule = SYSTEM_MODULES[sheet.system]
  const displayNameKey = activeModule.displayNameKey
  const toolsEmpty = activeModule.sidebarTools.length === 0
  const sidebarCollapsed = sidebarOverride ?? (toolsEmpty || isNarrow)

  /**
   * The sidebar toggle is shared by the shell chrome and the sidebar itself,
   * and both must agree on what "collapsed" means, including the derived
   * default before the player has ever touched it.
   */
  const setSidebarCollapsed = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setSidebarOverride((prev) => {
        const current = prev ?? (toolsEmpty || isNarrow)
        return typeof value === 'function' ? value(current) : value
      })
    },
    [toolsEmpty, isNarrow],
  )

  function commitSheet(next: LoadedSheet, message: string) {
    setSheet(next)
    setStatus(message)
    setAutosave(true)
    setDraftGate('ready')
  }

  /**
   * Panel edits are applied only when the loaded system still matches the one
   * the panel was rendered for. A New or Load that swaps systems between a
   * panel's render and its callback would otherwise write a document of one
   * shape into the other system's slot.
   */
  function editCharacter<S extends SystemId>(
    system: S,
    mutator: (character: DocumentFor<S>) => DocumentFor<S>,
  ) {
    setAutosave(true)
    setSheet((prev) => {
      if (prev.system !== system) return prev
      const character = mutator(prev.character as DocumentFor<S>)
      return { system: prev.system, character } as LoadedSheet
    })
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
        {/*
          One branch per system, because each `SheetSession` is instantiated at
          that system's document and derived types; the `key` also discards
          per-session UI state (active tab) when the loaded system changes.
        */}
        {sheet.system === 'pf1e' ? (
          <SheetSession
            key="session-pf1e"
            module={pf1eModule}
            character={sheet.character}
            setCharacter={(mutator) => editCharacter('pf1e', mutator)}
            setStatus={setStatus}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        ) : (
          <SheetSession
            key="session-pf2e"
            module={pf2eModule}
            character={sheet.character}
            setCharacter={(mutator) => editCharacter('pf2e', mutator)}
            setStatus={setStatus}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
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
