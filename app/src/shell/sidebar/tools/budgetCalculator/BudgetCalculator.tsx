import { useMemo, useState } from 'react'
import { useT } from '../../../../shared/i18n'
import type { BudgetItemCalculated, BudgetItemInput, BudgetSummary } from './types'

export interface BudgetCalculatorProps {
  calculate: (items: BudgetItemInput[]) => { items: BudgetItemCalculated[]; summary: BudgetSummary }
  initialItems?: BudgetItemInput[]
}

const DEFAULT_ITEMS: BudgetItemInput[] = [
  {
    id: 'item-1',
    name: 'Longsword',
    marketPrice: 15,
    quantity: 1,
    mode: 'buy',
    isMagic: false,
  },
  {
    id: 'item-2',
    name: 'Cloak of Resistance +1',
    marketPrice: 1000,
    quantity: 1,
    mode: 'craft',
    isMagic: true,
    casterLevelRequired: 3,
    featRequired: 'Craft Wondrous Item',
  },
]

export function BudgetCalculator({ calculate, initialItems }: BudgetCalculatorProps) {
  const t = useT()
  const [items, setItems] = useState<BudgetItemInput[]>(() => initialItems ?? DEFAULT_ITEMS)

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
      id: `item-${Date.now()}`,
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
            <span className="stat-value">{summary.buyAllTotal} gp</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">{t('shell.budget.mixedPlan')}:</span>
            <span className="stat-value highlight">{summary.mixedTotal} gp</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">{t('shell.budget.craftAll')}:</span>
            <span className="stat-value">{summary.craftAllTotal} gp</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">{t('shell.budget.craftTime')}:</span>
            <span className="stat-value">{summary.totalCraftDays} days</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">{t('shell.budget.purseGold')}:</span>
            <span className="stat-value">{summary.currentGold} gp</span>
          </div>
          <div className={`summary-stat ${summary.isDeficit ? 'deficit' : 'affordable'}`}>
            <span className="stat-label">{t('shell.budget.remaining')}:</span>
            <span className="stat-value">
              {summary.isDeficit
                ? `short ${Math.abs(summary.remainingGold)} gp`
                : `${summary.remainingGold} gp`}
            </span>
          </div>
        </div>

        {summary.blockedCraftCount > 0 && (
          <div className="budget-blocked-warning">
            <span>⚠️ {summary.blockedCraftCount} craft item(s) blocked by requirements</span>
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
                      {item.isMagic && <span className="magic-badge">✨ Magic</span>}
                    </div>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label="Remove item"
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
                      Mode: <strong>{item.mode.toUpperCase()}</strong> (click to switch)
                    </button>
                    <span className="item-cost-display">
                      Cost: <strong>{item.lineCost} gp</strong>
                    </span>
                  </div>

                  {isCraft && (
                    <div className="item-craft-details">
                      <small>
                        Materials: {item.craftMaterialsCost} gp | Time: {item.craftTimeDays} days
                        {item.craftDc != null && ` | DC: ${item.craftDc}`}
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
            placeholder="Item name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
        </div>
        <div className="form-row-multi">
          <label>
            Price (gp):
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
            Qty:
            <input
              type="number"
              min="1"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              required
            />
          </label>
          <label>
            Mode:
            <select
              value={newMode}
              onChange={(e) => setNewMode(e.target.value as 'buy' | 'craft')}
            >
              <option value="buy">Buy</option>
              <option value="craft">Craft</option>
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
            <span>Is Magic Item?</span>
          </label>
        </div>

        {newIsMagic && (
          <div className="form-row-multi magic-fields">
            <label>
              Req. Feat:
              <input
                type="text"
                placeholder="e.g. Craft Wondrous Item"
                value={newFeat}
                onChange={(e) => setNewFeat(e.target.value)}
              />
            </label>
            <label>
              Req. CL:
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
