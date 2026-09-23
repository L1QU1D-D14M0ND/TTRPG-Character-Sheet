import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  CATALOGS,
  readStoredLocale,
  translate,
  writeStoredLocale,
  type Locale,
  type TranslateFn,
} from './catalog'
import { I18nContext } from './contextValue'

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
