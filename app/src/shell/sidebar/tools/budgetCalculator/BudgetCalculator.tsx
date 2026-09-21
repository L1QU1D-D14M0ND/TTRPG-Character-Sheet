import { useMemo, useState } from 'react'
import { useT } from '../../../../shared/i18n'
import { newId } from '../../../../shared/ids'
import type { BudgetItemCalculated, BudgetItemInput, BudgetSummary } from './types'

export interface BudgetCalculatorProps {
  calculate: (items: BudgetItemInput[]) => { items: BudgetItemCalculated[]; summary: BudgetSummary }
  initialItems?: BudgetItemInput[]
}

/**
 * Shopping-list lines are authored by the player, so the planner opens empty.
 * Seeding example items would put purchases on a plan the player never chose
 * and would silently inflate every total. See `docs/sidebar-tools-budget-calculator.md`.
 */
export function BudgetCalculator({ calculate, initialItems }: BudgetCalculatorProps) {
  const t = useT()
  const [items, setItems] = useState<BudgetItemInput[]>(() => initialItems ?? [])

  // New item inputs
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('10')
  const [newQty, setNewQty] = useState('1')
  const [newMode, setNewMode] = useState<'buy' | 'craft'>('buy')
  const [newIsMagic, setNewIsMagic] = useState(false)
  const [newFeat, setNewFeat] = useState('')
  const [newCl, setNewCl] = useState('1')

  const { items: calculatedItems, summary } = useMemo(() => {
    return calculate(items)
  }, [items, calculate])

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return

    const price = Math.max(0, parseFloat(newPrice) || 0)
    const qty = Math.max(1, parseInt(newQty, 10) || 1)
    const cl = Math.max(1, parseInt(newCl, 10) || 1)

    const newItem: BudgetItemInput = {
      // `Date.now()` alone collides for two items added in the same millisecond,
      // which produces duplicate React keys and breaks per-line remove/toggle.
      id: newId('budget-item'),
      name: newName.trim(),
      marketPrice: price,
      quantity: qty,
      mode: newMode,
      isMagic: newIsMagic,
      casterLevelRequired: newIsMagic ? cl : undefined,
      featRequired: newIsMagic && newFeat.trim() ? newFeat.trim() : undefined,
    }

    setItems((prev) => [...prev, newItem])
    setNewName('')
    setNewPrice('10')
    setNewQty('1')
    setNewIsMagic(false)
    setNewFeat('')
  }

  function handleToggleMode(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, mode: item.mode === 'buy' ? 'craft' : 'buy' }
          : item,
      ),
    )
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="budget-calculator-container">
      {/* Totals Summary */}
      <div className="budget-summary-card">
        <h4>{t('shell.budget.summaryTitle')}</h4>
        <div className="budget-summary-grid">
          <div className="summary-stat">
            <span className="stat-label">{t('shell.budget.buyAll')}:</span>
            <span className="stat-value">{t('shell.budget.gold', { amount: summary.buyAllTotal })}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">{t('shell.budget.mixedPlan')}:</span>
            <span className="stat-value highlight">{t('shell.budget.gold', { amount: summary.mixedTotal })}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">{t('shell.budget.craftAll')}:</span>
            <span className="stat-value">{t('shell.budget.gold', { amount: summary.craftAllTotal })}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">{t('shell.budget.craftTime')}:</span>
            <span className="stat-value">{t('shell.budget.days', { days: summary.totalCraftDays })}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">{t('shell.budget.purseGold')}:</span>
            <span className="stat-value">{t('shell.budget.gold', { amount: summary.currentGold })}</span>
          </div>
          <div className={`summary-stat ${summary.isDeficit ? 'deficit' : 'affordable'}`}>
            <span className="stat-label">{t('shell.budget.remaining')}:</span>
            <span className="stat-value">
              {summary.isDeficit
                ? t('shell.budget.short', { amount: Math.abs(summary.remainingGold) })
                : t('shell.budget.gold', { amount: summary.remainingGold })}
            </span>
          </div>
        </div>

        {summary.blockedCraftCount > 0 && (
          <div className="budget-blocked-warning">
            <span>⚠️ {t('shell.budget.blockedCraft', { count: summary.blockedCraftCount })}</span>
          </div>
        )}
      </div>

      {/* Shopping List */}
      <div className="budget-items-list">
        <h4>{t('shell.budget.itemsList')} ({calculatedItems.length})</h4>
        {calculatedItems.length === 0 ? (
          <p className="muted">{t('shell.budget.noItems')}</p>
        ) : (
          <ul className="budget-items">
            {calculatedItems.map((item) => {
              const isCraft = item.mode === 'craft'
              return (
                <li key={item.id} className={`budget-item-card ${isCraft ? 'mode-craft' : 'mode-buy'}`}>
                  <div className="item-header">
                    <div className="item-title">
                      <strong>{item.name}</strong> {item.quantity > 1 && `× ${item.quantity}`}
                      {item.isMagic && <span className="magic-badge">✨ {t('shell.budget.magicBadge')}</span>}
                    </div>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={t('shell.budget.removeItem')}
                    >
                      ×
                    </button>
                  </div>

                  <div className="item-mode-row">
                    <button
                      type="button"
                      className={`btn-mode-toggle ${item.mode}`}
                      onClick={() => handleToggleMode(item.id)}
                    >
                      {t('shell.budget.modeLabel', {
                        mode: t(
                          isCraft ? 'shell.budget.modeCraft' : 'shell.budget.modeBuy',
                        ),
                      })}
                    </button>
                    <span className="item-cost-display">
                      {t('shell.budget.lineCost', { cost: item.lineCost })}
                    </span>
                  </div>

                  {isCraft && (
                    <div className="item-craft-details">
                      <small>
                        {t('shell.budget.craftDetail', {
                          materials: item.craftMaterialsCost,
                          days: item.craftTimeDays,
                        })}
                        {item.craftDc != null &&
                          t('shell.budget.craftDc', { dc: item.craftDc })}
                      </small>
                      {!item.canCraft && item.reasons.length > 0 && (
                        <div className="craft-reasons">
                          {item.reasons.map((r, i) => (
                            <span key={i} className="craft-reason-chip">⛔ {r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Add Item Form */}
      <form className="budget-add-form" onSubmit={handleAddItem}>
        <h4>{t('shell.budget.addItemTitle')}</h4>
        <div className="form-row">
          <input
            type="text"
            aria-label={t('shell.budget.itemName')}
            placeholder={t('shell.budget.itemName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
        </div>
        <div className="form-row-multi">
          <label>
            {t('shell.budget.price')}
            <input
              type="number"
              min="0"
              step="any"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              required
            />
          </label>
          <label>
            {t('shell.budget.quantity')}
            <input
              type="number"
              min="1"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              required
            />
          </label>
          <label>
            {t('shell.budget.mode')}
            <select
              value={newMode}
              onChange={(e) => setNewMode(e.target.value as 'buy' | 'craft')}
            >
              <option value="buy">{t('shell.budget.modeBuy')}</option>
              <option value="craft">{t('shell.budget.modeCraft')}</option>
            </select>
          </label>
        </div>

        <div className="form-row magic-toggle">
          <label>
            <input
              type="checkbox"
              checked={newIsMagic}
              onChange={(e) => setNewIsMagic(e.target.checked)}
            />
            <span>{t('shell.budget.isMagic')}</span>
          </label>
        </div>

        {newIsMagic && (
          <div className="form-row-multi magic-fields">
            <label>
              {t('shell.budget.reqFeat')}
              <input
                type="text"
                placeholder={t('shell.budget.reqFeatPlaceholder')}
                value={newFeat}
                onChange={(e) => setNewFeat(e.target.value)}
              />
            </label>
            <label>
              {t('shell.budget.reqCl')}
              <input
                type="number"
                min="1"
                value={newCl}
                onChange={(e) => setNewCl(e.target.value)}
              />
            </label>
          </div>
        )}

        <button type="submit" className="btn-add-item">
          + {t('shell.budget.addItemButton')}
        </button>
      </form>

      <div className="budget-notice muted">
        <small>🎲 {t('shell.budget.tableDiceReminder')}</small>
      </div>
    </div>
  )
}
