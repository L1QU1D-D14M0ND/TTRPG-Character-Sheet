// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { clearDraft, DRAFT_DB, readDraft, writeDraft } from './draftStore'

afterEach(async () => {
  await clearDraft()
  indexedDB.deleteDatabase(DRAFT_DB)
})

describe('draftStore', () => {
  it('writes, reads, and clears the one-key IndexedDB draft', async () => {
    expect(await readDraft()).toBeUndefined()

    await writeDraft('{"system":"pf1e"}')
    expect(await readDraft()).toBe('{"system":"pf1e"}')

    await clearDraft()
    expect(await readDraft()).toBeUndefined()
  })

  /**
   * Regression: every operation used to leave its connection open, so the
   * database could never be deleted or version-upgraded afterwards — the
   * delete request simply sat in `blocked` forever.
   */
  it('leaves no open connection blocking a database delete', async () => {
    await writeDraft('{"system":"pf1e"}')
    await readDraft()

    const deleted = await new Promise<string>((resolve) => {
      const req = indexedDB.deleteDatabase(DRAFT_DB)
      req.onsuccess = () => resolve('deleted')
      req.onblocked = () => resolve('blocked')
      req.onerror = () => resolve('error')
    })

    expect(deleted).toBe('deleted')
  })
})
