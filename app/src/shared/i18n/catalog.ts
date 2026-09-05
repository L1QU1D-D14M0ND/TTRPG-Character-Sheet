import en from '../../locales/en.json'
import es from '../../locales/es.json'

export type Locale = 'en' | 'es'

export type MessageTree = { [key: string]: string | MessageTree }

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string

export const LOCALES: readonly Locale[] = ['en', 'es']
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_STORAGE_KEY = 'ttrpg-sheet.locale'

export const CATALOGS: Record<Locale, MessageTree> = {
  en: en as MessageTree,
  es: es as MessageTree,
}

function lookup(tree: MessageTree, path: string): string | undefined {
  const parts = path.split('.')
  let node: string | MessageTree | undefined = tree
  for (const part of parts) {
    if (typeof node === 'string' || node == null) return undefined
    node = node[part]
  }
  return typeof node === 'string' ? node : undefined
}

function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name)
      ? String(vars[name])
      : `{${name}}`,
  )
}

/** Resolve `shell.newSheet` (etc.). Fallback: locale → English → key. Interpolation: `{name}`. */
export function translate(
  catalog: MessageTree,
  key: string,
  vars?: Record<string, string | number>,
  fallback: MessageTree = CATALOGS.en,
): string {
  const template = lookup(catalog, key) ?? lookup(fallback, key) ?? key
  return interpolate(template, vars)
}

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'es'
}

export function readStoredLocale(): Locale {
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(raw)) return raw
  } catch {
    // Private mode / missing storage.
  }
  return DEFAULT_LOCALE
}

export function writeStoredLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Ignore quota / private mode.
  }
}
