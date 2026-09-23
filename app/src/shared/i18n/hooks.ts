import { useContext } from 'react'
import { I18nContext, type I18nContextValue } from './contextValue'
import type { TranslateFn } from './catalog'

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
