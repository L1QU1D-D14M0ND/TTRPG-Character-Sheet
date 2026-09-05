/**
 * Split so React Fast Refresh works: `context.tsx` exports only the provider
 * and its hooks, while message catalogs, `translate`, and locale storage live
 * in `catalog.ts` and can be imported by non-component code. Import sites keep
 * using `shared/i18n`.
 */
export {
  CATALOGS,
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_STORAGE_KEY,
  isLocale,
  readStoredLocale,
  translate,
  writeStoredLocale,
  type Locale,
  type MessageTree,
  type TranslateFn,
} from './catalog'
export { I18nProvider, useI18n, useT, type I18nContextValue } from './context'
