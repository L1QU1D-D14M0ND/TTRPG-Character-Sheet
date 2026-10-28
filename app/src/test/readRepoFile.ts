import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
)

export function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

export function readRepoJson(relativePath: string): unknown {
  return JSON.parse(readRepoFile(relativePath))
}

/**
 * Repo-relative paths of every file under `relativeDir` (recursively) ending in
 * `extension`, sorted. Guard tests use this instead of a hand-kept list so a
 * newly added pack file or fixture cannot silently escape them.
 */
export function listRepoFiles(
  relativeDir: string,
  extension = '.json',
): string[] {
  const found: string[] = []
  const walk = (dir: string): void => {
    const entries = readdirSync(path.join(repoRoot, dir), {
      withFileTypes: true,
    })
    for (const entry of entries) {
      const child = `${dir}/${entry.name}`
      if (entry.isDirectory()) walk(child)
      else if (entry.name.endsWith(extension)) found.push(child)
    }
  }
  walk(relativeDir)
  return found.sort()
}
