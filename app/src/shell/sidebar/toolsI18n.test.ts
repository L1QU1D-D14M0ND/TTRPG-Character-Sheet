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

/** `placeholder="Item name"` / `aria-label="Remove item"` and friends. */
const USER_FACING_ATTRIBUTE =
  /\b(?:placeholder|aria-label|title|alt)\s*=\s*"([^"]+)"/g

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
  for (const [, value] of source.matchAll(USER_FACING_ATTRIBUTE)) {
    if (prose(value)) found.push(value)
  }
  return found
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
      ]

      expect(
        violations,
        `${file} has user-facing strings outside the message catalog. ` +
          `Add keys to src/locales/en.json and es.json and render them with t().`,
      ).toEqual([])
    },
  )
})
