import { describe, expect, it } from 'vitest'
import { pf1eModule } from '../../systems/pf1e/module'
import { pf2eModule } from '../../systems/pf2e/module'

/**
 * Lives in the shell because it needs both systems; `systems/pf1e` may not
 * import `systems/pf2e` (ADR 0004, enforced by `systemIsolation.test.ts`).
 */
describe('encyclopedia registration', () => {
  it('registers the encyclopedia on PF1e only', () => {
    expect(pf1eModule.sidebarTools.map((tool) => tool.id)).toContain('shell.encyclopedia')
    expect(pf2eModule.sidebarTools.map((tool) => tool.id)).not.toContain('shell.encyclopedia')
  })
})
