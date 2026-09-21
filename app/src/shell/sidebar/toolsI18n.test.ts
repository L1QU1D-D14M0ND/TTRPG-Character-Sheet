import { describe, expect, it } from 'vitest'
import { listRepoFiles, readRepoFile } from '../../test/readRepoFile'

/**
 * The locale lock (0.9 English catalog, 1.0 Spanish) says user-facing strings
 * are externalized from the start, but nothing enforced it: the Budget
 * Calculator shipped with ~20 hardcoded English literals and stayed half
 * English under `es` until 2026-09-21. oxlint has no rule for this, so the
 * sidebar tools — the newest and most literal-prone UI surface — get a guard
 * test in the same spirit as `systemIsolation.test.ts`.
 *
 * Scope is deliberately narrow (`shell/sidebar/tools`, the shared tool UIs).
 * The older per-system panels predate the lock and are not retrofitted here.
 */
const TOOLS_DIR = 'app/src/shell/sidebar/tools'

/**
 * `placeholder="Item name"`, `aria-label={'Remove item'}` and friends. Both
 * the quoted and the braced-string forms render identically to the user.
 */
const USER_FACING_ATTRIBUTE =
  /\b(?:placeholder|aria-label|title|alt)\s*=\s*(?:"([^"]*)"|\{\s*'([^']*)'\s*\}|\{\s*"([^"]*)"\s*\})/g

/**
 * String literals in JSX expression position: `{'Hello'}`, `{cond ? 'Yes' :
 * 'No'}`, and `const label = 'Hello'` feeding a `{label}`. These render to the
 * user exactly like a JSX text node, so they belong in the catalog too.
 *
 * Import specifiers, catalog keys passed to `t(...)`, and the css/testid-style
 * strings that never reach the screen are excluded below.
 */
const STRING_LITERAL = /'([^'\\\n]{4,})'|"([^"\\\n]{4,})"/g

/**
 * Fragments that mean the `>...<` span is TypeScript, not JSX text — most
 * often a generic such as `useState<Set<string>>(...)` or a fat arrow.
 */
const CODE_HINT = /[=;(){}[\]]|\b(?:const|let|return|function|import|type)\b/

function toolSourceFiles(): string[] {
  return [
    ...listRepoFiles(TOOLS_DIR, '.tsx'),
    ...listRepoFiles(TOOLS_DIR, '.ts'),
  ]
    .filter((file) => !file.endsWith('.test.tsx') && !file.endsWith('.test.ts'))
    .sort()
}

function prose(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 4) return false
  // Needs at least two letters in a row plus a lowercase letter to be prose.
  return /[A-Za-z]{2}/.test(trimmed) && /[a-z]/.test(trimmed)
}

/**
 * A string that is machinery rather than copy: a catalog key, a module path,
 * a className / test id, or a union-type member. Prose destined for the screen
 * contains a space; these do not.
 */
function machinery(value: string): boolean {
  if (!value.includes(' ')) return true
  // `t('shell.budget.price')` arguments are keys, not copy.
  return /^[a-z0-9]+(?:[.-][a-z0-9]+)+$/i.test(value.trim())
}

/**
 * Strip the spans that legitimately hold multi-word non-copy strings before
 * scanning: `className="math-row crit"` is styling, and comments are prose
 * aimed at the next maintainer rather than the player.
 */
function withoutNonCopySpans(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\bclassName\s*=\s*"[^"]*"/g, '')
    .replace(/\bclassName\s*=\s*\{`[^`]*`\}/g, '')
}

/**
 * JSX text nodes sitting directly between tags, e.g. `<span>Cost: 5 gp</span>`.
 * A JSX text node is prose on one line with no braces (anything in `{...}` is
 * an expression, and `t(...)` output lives there), so multi-line or
 * code-shaped spans are skipped as TypeScript rather than copy.
 */
function jsxTextLiterals(source: string): string[] {
  const found: string[] = []
  for (const [, between] of source.matchAll(/>([^<>{}]+)</g)) {
    if (between.includes('\n')) continue
    if (CODE_HINT.test(between)) continue
    if (prose(between)) found.push(between.trim())
  }
  return found
}

function attributeLiterals(source: string): string[] {
  const found: string[] = []
  for (const match of source.matchAll(USER_FACING_ATTRIBUTE)) {
    const value = match[1] ?? match[2] ?? match[3] ?? ''
    if (prose(value)) found.push(value)
  }
  return found
}

/**
 * Prose string literals anywhere in the module, minus the lines that are
 * imports or `t(...)` catalog lookups.
 */
function expressionLiterals(source: string): string[] {
  const found: string[] = []
  for (const line of withoutNonCopySpans(source).split('\n')) {
    const code = line.trim()
    if (code.startsWith('import ') || code.startsWith('*') || code.startsWith('//')) {
      continue
    }
    for (const match of code.matchAll(STRING_LITERAL)) {
      const value = match[1] ?? match[2] ?? ''
      if (!prose(value) || machinery(value)) continue
      // `t('...')` and `useT()` lookups are catalog keys by construction.
      if (new RegExp(`\\bt\\(\\s*['"]${escapeRegExp(value)}`).test(code)) continue
      found.push(value)
    }
  }
  return found
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

describe('sidebar tool i18n lock', () => {
  it('found tool source files to scan', () => {
    expect(toolSourceFiles().length).toBeGreaterThanOrEqual(3)
  })

  it.each(toolSourceFiles())(
    '%s renders no hardcoded user-facing English',
    (file) => {
      const source = readRepoFile(file)
      const violations = [
        ...jsxTextLiterals(source),
        ...attributeLiterals(source),
        ...expressionLiterals(source),
      ]

      expect(
        violations,
        `${file} has user-facing strings outside the message catalog. ` +
          `Add keys to src/locales/en.json and es.json and render them with t().`,
      ).toEqual([])
    },
  )
})
