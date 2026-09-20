// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { I18nProvider } from '../../shared/i18n'
import { SidebarHost } from './SidebarHost'
import type { SidebarTool, SidebarToolContext } from '../types'

describe('SidebarHost', () => {
  afterEach(cleanup)

  const mockContext: SidebarToolContext<any, any> = {
    system: 'pf1e',
    character: {},
    derived: {},
    update: vi.fn(),
    focusTab: vi.fn(),
  }

  it('renders collapsed state when collapsed is true', () => {
    const onToggle = vi.fn()
    render(
      <I18nProvider>
        <SidebarHost
          tools={[]}
          context={mockContext}
          collapsed={true}
          onToggle={onToggle}
        />
      </I18nProvider>,
    )

    const aside = screen.getByLabelText('Sheet tools')
    expect(aside).toHaveClass('collapsed')
    const button = screen.getByRole('button', { name: 'Tools' })
    fireEvent.click(button)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('renders empty message when no tools available', () => {
    render(
      <I18nProvider>
        <SidebarHost
          tools={[]}
          context={mockContext}
          collapsed={false}
          onToggle={vi.fn()}
        />
      </I18nProvider>,
    )

    expect(
      screen.getByText(/No tools yet/i),
    ).toBeInTheDocument()
  })

  it('switches between active tools when multiple tools are registered', () => {
    const toolA: SidebarTool<any, any> = {
      id: 'tool.a',
      labelKey: 'shell.toolAttackHelper',
      render: () => <div data-testid="body-a">Body of Tool A</div>,
    }
    const toolB: SidebarTool<any, any> = {
      id: 'tool.b',
      labelKey: 'shell.toolActionsList',
      render: () => <div data-testid="body-b">Body of Tool B</div>,
    }

    render(
      <I18nProvider>
        <SidebarHost
          tools={[toolA, toolB]}
          context={mockContext}
          collapsed={false}
          onToggle={vi.fn()}
        />
      </I18nProvider>,
    )

    // Initially, first tool is active
    expect(screen.getByTestId('body-a')).toBeInTheDocument()
    expect(screen.queryByTestId('body-b')).not.toBeInTheDocument()

    // Switch to second tool
    const tabB = screen.getByRole('button', { name: 'Actions List' })
    fireEvent.click(tabB)

    expect(screen.queryByTestId('body-a')).not.toBeInTheDocument()
    expect(screen.getByTestId('body-b')).toBeInTheDocument()
  })
})
