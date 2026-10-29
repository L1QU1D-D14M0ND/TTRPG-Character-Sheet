import { useMemo } from 'react'
import { useI18n } from '../../../shared/i18n'
import { Encyclopedia } from '../../../shell/sidebar/tools/encyclopedia/Encyclopedia'
import { buildPf1eEncyclopedia } from './pf1eEncyclopedia'

/**
 * The encyclopedia reads the active locale itself rather than taking it from
 * the tool context, because it is the only tool whose *content* is localized:
 * the other three render numbers the engine computed. Widening
 * `SidebarToolContext` for one tool would make every tool look locale-aware.
 *
 * It lives in its own file so `tools.tsx` keeps exporting only the registry
 * and this file only a component, which is what React Fast Refresh needs.
 */
export function Pf1eEncyclopedia() {
  const { locale } = useI18n()
  const groups = useMemo(() => buildPf1eEncyclopedia(locale), [locale])
  return <Encyclopedia groups={groups} />
}
