// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../shared/i18n'
import { pf1eModule } from '../systems/pf1e/module'
import { pf2eModule } from '../systems/pf2e/module'
import { SheetSession } from './App'
import type { SidebarTool, SidebarToolContext, SystemModule } from './types'

describe('focusTab contract and integration', () => {
  afterEach(cleanup)

  it('wires focusTab into SidebarHost context and switches tabs on call', () => {
    let capturedContext: SidebarToolContext<any, any> | null = null

    const tool: SidebarTool<any, any> = {
      id: 'tab-jumper',
      labelKey: 'tool.tabJumper',
      render: (ctx) => {
        capturedContext = ctx
        return (
          <div>
            <button
              type="button"
              onClick={() => ctx.focusTab?.('spells')}
            >
              Go to Spells
            </button>
            <button
              type="button"
              onClick={() => ctx.focusTab?.('combat')}
            >
              Go to Combat
            </button>
            <button
              type="button"
              onClick={() => ctx.focusTab?.('invalid-tab-id')}
            >
              Go to Invalid
            </button>
          </div>
        )
      },
    }

    const testModule: SystemModule<any, any> = {
      ...pf1eModule,
      sidebarTools: [tool],
    }

    function Harness() {
      const [char, setChar] = useState(testModule.createEmpty)
      const [collapsed, setCollapsed] = useState(false)
      return (
        <I18nProvider>
          <SheetSession
            module={testModule}
            character={char}
            setCharacter={setChar}
            setStatus={() => {}}
            sidebarCollapsed={collapsed}
            setSidebarCollapsed={setCollapsed}
          />
        </I18nProvider>
      )
    }

    render(<Harness />)

    // Initial tab is identity
    expect(screen.getByRole('button', { name: /^identity$/i })).toHaveClass('active')
    expect(capturedContext).not.toBeNull()
    expect(capturedContext?.focusTab).toBeTypeOf('function')

    // Click Go to Spells via the tool
    fireEvent.click(screen.getByRole('button', { name: /go to spells/i }))
    expect(screen.getByRole('button', { name: /^spells$/i })).toHaveClass('active')
    expect(screen.getByRole('button', { name: /^identity$/i })).not.toHaveClass('active')

    // Click Go to Combat via the tool
    fireEvent.click(screen.getByRole('button', { name: /go to combat/i }))
    expect(screen.getByRole('button', { name: /^combat$/i })).toHaveClass('active')
    expect(screen.getByRole('button', { name: /^spells$/i })).not.toHaveClass('active')

    // Click Go to Invalid via the tool: must NOT blank the screen or lose the valid tab
    fireEvent.click(screen.getByRole('button', { name: /go to invalid/i }))
    expect(screen.getByRole('button', { name: /^combat$/i })).toHaveClass('active')

    // Clicking a tab directly in the workspace updates the active tab
    fireEvent.click(screen.getByRole('button', { name: /^inventory$/i }))
    expect(screen.getByRole('button', { name: /^inventory$/i })).toHaveClass('active')
    expect(screen.getByRole('button', { name: /^combat$/i })).not.toHaveClass('active')
  })

  it('works identically with PF2e workspace', () => {
    let capturedContext: SidebarToolContext<any, any> | null = null

    const tool: SidebarTool<any, any> = {
      id: 'pf2e-tab-jumper',
      labelKey: 'tool.pf2eTabJumper',
      render: (ctx) => {
        capturedContext = ctx
        return (
          <div>
            <button
              type="button"
              onClick={() => ctx.focusTab?.('spells')}
            >
              Go to PF2e Spells
            </button>
            <button
              type="button"
              onClick={() => ctx.focusTab?.('unknown-pf2e')}
            >
              Go to PF2e Unknown
            </button>
          </div>
        )
      },
    }

    const testModule: SystemModule<any, any> = {
      ...pf2eModule,
      sidebarTools: [tool],
    }

    function Harness() {
      const [char, setChar] = useState(testModule.createEmpty)
      const [collapsed, setCollapsed] = useState(false)
      return (
        <I18nProvider>
          <SheetSession
            module={testModule}
            character={char}
            setCharacter={setChar}
            setStatus={() => {}}
            sidebarCollapsed={collapsed}
            setSidebarCollapsed={setCollapsed}
          />
        </I18nProvider>
      )
    }

    render(<Harness />)

    expect(screen.getByRole('button', { name: /^identity$/i })).toHaveClass('active')
    expect(capturedContext).not.toBeNull()
    expect(capturedContext?.focusTab).toBeTypeOf('function')

    fireEvent.click(screen.getByRole('button', { name: /go to pf2e spells/i }))
    expect(screen.getByRole('button', { name: /^spells$/i })).toHaveClass('active')

    // Invalid tab keeps current tab active
    fireEvent.click(screen.getByRole('button', { name: /go to pf2e unknown/i }))
    expect(screen.getByRole('button', { name: /^spells$/i })).toHaveClass('active')
  })
})
