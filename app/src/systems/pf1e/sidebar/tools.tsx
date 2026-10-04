import type { SidebarTool } from '../../../shell/types'
import { AttackHelper } from '../../../shell/sidebar/tools/attackHelper/AttackHelper'
import { ActionsList } from '../../../shell/sidebar/tools/actionsList/ActionsList'
import { BudgetCalculator } from '../../../shell/sidebar/tools/budgetCalculator/BudgetCalculator'
import { Encyclopedia } from '../../../shell/sidebar/tools/encyclopedia/Encyclopedia'
import type { CharacterDocument } from '../character/types'
import type { DerivedView } from '../engine/types'
import {
  computePf1eAttackHelper,
  getPf1eAttackOptions,
  getPf1eAvailableToggles,
} from './pf1eAttackHelper'
import { buildPf1eActions } from './pf1eActionsList'
import { calculatePf1eBudget } from './pf1eBudgetCalculator'
import { buildPf1eEncyclopedia } from './pf1eEncyclopedia'

export const pf1eSidebarTools: SidebarTool<CharacterDocument, DerivedView>[] = [
  {
    id: 'shell.attack-helper',
    labelKey: 'shell.toolAttackHelper',
    systems: ['pf1e'],
    render: ({ character, derived }) => (
      <AttackHelper
        options={getPf1eAttackOptions(character)}
        getToggles={(atkId) => getPf1eAvailableToggles(character, atkId)}
        compute={(atkId, toggles) => computePf1eAttackHelper(character, derived, atkId, toggles)}
      />
    ),
  },
  {
    id: 'shell.actions-list',
    labelKey: 'shell.toolActionsList',
    systems: ['pf1e'],
    render: ({ character, derived }) => (
      <ActionsList groups={buildPf1eActions(character, derived)} />
    ),
  },
  {
    id: 'shell.budget-calculator',
    labelKey: 'shell.toolBudgetCalculator',
    systems: ['pf1e'],
    render: ({ character, derived }) => (
      <BudgetCalculator
        calculate={(items) => calculatePf1eBudget(character, derived, items)}
      />
    ),
  },
  {
    id: 'shell.encyclopedia',
    labelKey: 'shell.toolEncyclopedia',
    systems: ['pf1e'],
    render: () => <Encyclopedia groups={buildPf1eEncyclopedia()} />,
  },
]
