import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { listRepoFiles, readRepoFile, repoRoot } from './readRepoFile'

/**
 * Every relative Markdown link in the repo docs must point at a file that
 * exists, and every `#anchor` must match a heading in its target. Docs move
 * between `docs/` and `docs/archive/`; this catches the links a move breaks.
 */

const MARKDOWN_ROOTS = ['docs', 'content', 'schemas', 'fixtures']
const ROOT_FILES = [
  'README.md',
  'AGENTS.md',
  'CLAUDE.md',
  'CONTEXT.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'app/README.md',
]

function markdownFiles(): string[] {
  const files = ROOT_FILES.filter((f) => existsSync(path.join(repoRoot, f)))
  for (const dir of MARKDOWN_ROOTS) {
    if (existsSync(path.join(repoRoot, dir))) {
      files.push(...listRepoFiles(dir, '.md'))
    }
  }
  return files
}

/** Drop fenced code blocks and inline code so example links are not checked. */
function stripCode(markdown: string): string {
  return stripFences(markdown).replace(/`[^`\n]*`/g, '')
}

function stripFences(markdown: string): string {
  return markdown.replace(/^```[\s\S]*?^```/gm, '')
}

/** GitHub's heading anchor: lowercase, punctuation dropped, spaces to `-`. */
function slugify(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-')
}

function anchorsOf(markdown: string): Set<string> {
  const anchors = new Set<string>()
  const seen = new Map<string, number>()
  for (const line of stripFences(markdown).split('\n')) {
    const match = /^#{1,6}\s+(.*)$/.exec(line)
    if (!match) continue
    const text = match[1].replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    const base = slugify(text)
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    anchors.add(count === 0 ? base : `${base}-${count}`)
  }
  return anchors
}

function brokenLinks(file: string): string[] {
  const source = readRepoFile(file)
  const problems: string[] = []
  const linkPattern = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  for (const [, target] of stripCode(source).matchAll(linkPattern)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue
    const [rawPath, anchor] = target.split('#') as [string, string?]
    const linkPath = decodeURIComponent(rawPath)
    const resolved = linkPath
      ? path.join(path.dirname(file), linkPath)
      : file
    const absolute = path.join(repoRoot, resolved)
    if (!existsSync(absolute)) {
      problems.push(`${file}: ${target} (missing ${resolved})`)
      continue
    }
    if (anchor && resolved.endsWith('.md') && statSync(absolute).isFile()) {
      if (!anchorsOf(readRepoFile(resolved)).has(anchor)) {
        problems.push(`${file}: ${target} (no heading #${anchor})`)
      }
    }
  }
  return problems
}

describe('docs links', () => {
  it('finds the docs to check', () => {
    expect(markdownFiles()).toContain('docs/ROADMAP.md')
  })

  it('every relative link and anchor resolves', () => {
    expect(markdownFiles().flatMap(brokenLinks)).toEqual([])
  })
})
