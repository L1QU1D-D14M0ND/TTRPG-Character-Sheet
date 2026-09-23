/**
 * Split so React Fast Refresh works, since it only refreshes a module whose
 * exports are all components: `context.tsx` holds the provider component,
 * `hooks.ts` the hooks, `contextValue.ts` the context object, and `catalog.ts`
 * the message catalogs, `translate`, and locale storage that non-component
 * code imports. Import sites keep using `shared/i18n`.
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
export { I18nProvider } from './context'
export { useI18n, useT } from './hooks'
export { type I18nContextValue } from './contextValue'
