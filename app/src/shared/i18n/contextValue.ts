import { createContext } from 'react'
import type { Locale, TranslateFn } from './catalog'

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslateFn
}

/**
 * The context object lives apart from both the provider component and the
 * hooks so that neither file mixes component and non-component exports, which
 * is what React Fast Refresh needs to hot-reload the provider without
 * remounting the tree.
 */
export const I18nContext = createContext<I18nContextValue | null>(null)
