import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  CATALOGS,
  readStoredLocale,
  translate,
  writeStoredLocale,
  type Locale,
  type TranslateFn,
} from './catalog'

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslateFn
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(
    () => initialLocale ?? readStoredLocale(),
  )
  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    writeStoredLocale(next)
  }, [])
  const t = useCallback<TranslateFn>(
    (key, vars) => translate(CATALOGS[locale], key, vars),
    [locale],
  )
  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used inside I18nProvider')
  }
  return ctx
}

export function useT(): TranslateFn {
  return useI18n().t
}
