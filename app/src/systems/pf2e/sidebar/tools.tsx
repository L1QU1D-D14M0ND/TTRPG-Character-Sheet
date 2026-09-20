import type { SidebarTool } from '../../../shell/types'
import { AttackHelper } from '../../../shell/sidebar/tools/attackHelper/AttackHelper'
import { ActionsList } from '../../../shell/sidebar/tools/actionsList/ActionsList'
import { BudgetCalculator } from '../../../shell/sidebar/tools/budgetCalculator/BudgetCalculator'
import type { CharacterDocument } from '../character/types'
import type { DerivedView } from '../engine/types'
import {
  computePf2eAttackHelper,
  getPf2eAttackOptions,
  getPf2eAvailableToggles,
} from './pf2eAttackHelper'
import { buildPf2eActions } from './pf2eActionsList'
import { calculatePf2eBudget } from './pf2eBudgetCalculator'

export const pf2eSidebarTools: SidebarTool<CharacterDocument, DerivedView>[] = [
  {
    id: 'shell.attack-helper',
    labelKey: 'shell.toolAttackHelper',
    systems: ['pf2e'],
    render: ({ character, derived }) => (
      <AttackHelper
        options={getPf2eAttackOptions(character)}
        getToggles={(atkId) => getPf2eAvailableToggles(character, atkId)}
        compute={(atkId, toggles) => computePf2eAttackHelper(character, derived, atkId, toggles)}
      />
    ),
  },
  {
    id: 'shell.actions-list',
    labelKey: 'shell.toolActionsList',
    systems: ['pf2e'],
    render: ({ character, derived }) => (
      <ActionsList groups={buildPf2eActions(character, derived)} />
    ),
  },
  {
    id: 'shell.budget-calculator',
    labelKey: 'shell.toolBudgetCalculator',
    systems: ['pf2e'],
    render: ({ character, derived }) => (
      <BudgetCalculator
        calculate={(items) => calculatePf2eBudget(character, derived, items)}
      />
    ),
  },
]
