import {
  createEmptyFeat,
  createEmptyFeature,
  type CharacterDocument,
} from '../character'
import type { FeatEntry } from '../character/types'
import { applyCrbFeat, applyCrbFeature, CRB_FEATS, CRB_FEATURES } from '../content'
import { useT } from '../../../shared/i18n'
import { appendRow, patchAt, removeAt, updateAt } from '../../../shared/ui/rows'
import type { SheetUpdate } from './update'

const FEAT_CATEGORIES: FeatEntry['category'][] = [
  'general',
  'combat',
  'metamagic',
  'itemCreation',
  'other',
]

export function FeatsPanel({
  character,
  update,
}: {
  character: CharacterDocument
  update: SheetUpdate
}) {
  const t = useT()
  return (
    <div className="panel-stack">
      <div className="table-toolbar">
        <strong>{t('pf1e.feats.feats')}</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({ ...c, feats: appendRow(c.feats, createEmptyFeat()) }))
          }
        >
          {t('pf1e.feats.addFeat')}
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>{t('pf1e.feats.name')}</th>
            <th>{t('pf1e.feats.category')}</th>
            <th>{t('pf1e.feats.level')}</th>
            <th>{t('pf1e.feats.summary')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.feats.length === 0 ? (
            <tr>
              <td colSpan={5} className="muted">
                {t('pf1e.feats.emptyFeats')}
              </td>
            </tr>
          ) : (
            character.feats.map((feat, index) => (
              <tr key={feat.id}>
                <td className="feat-cell">
                  <select
                    aria-label={t('pf1e.feats.catalog')}
                    value={feat.feat.id ?? ''}
                    onChange={(e) => {
                      const id = e.target.value || null
                      update((c) => ({
                        ...c,
                        feats: updateAt(c.feats, index, (row) =>
                          applyCrbFeat(row, id),
                        ),
                      }))
                    }}
                  >
                    <option value="">{t('pf1e.common.custom')}</option>
                    {CRB_FEATS.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label={t('pf1e.feats.featName')}
                    value={feat.feat.name}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        feats: updateAt(c.feats, index, (row) => ({
                          ...row,
                          feat: { ...row.feat, name: e.target.value },
                        })),
                      }))
                    }
                  />
                </td>
                <td>
                  <select
                    aria-label={t('pf1e.feats.category')}
                    value={feat.category}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        feats: patchAt(c.feats, index, {
                          category: e.target.value as FeatEntry['category'],
                        }),
                      }))
                    }
                  >
                    {FEAT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {t(`pf1e.feats.categories.${category}`)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    aria-label={t('pf1e.feats.level')}
                    value={feat.levelGained}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        feats: patchAt(c.feats, index, {
                          levelGained: Math.max(1, Number(e.target.value) || 1),
                        }),
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    aria-label={t('pf1e.feats.summary')}
                    value={feat.summary ?? ''}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        feats: patchAt(c.feats, index, {
                          summary: e.target.value,
                        }),
                      }))
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      update((c) => ({
                        ...c,
                        feats: removeAt(c.feats, index),
                      }))
                    }
                  >
                    {t('pf1e.common.remove')}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="table-toolbar">
        <strong>{t('pf1e.feats.features')}</strong>
        <button
          type="button"
          onClick={() =>
            update((c) => ({
              ...c,
              features: appendRow(c.features, createEmptyFeature()),
            }))
          }
        >
          {t('pf1e.feats.addFeature')}
        </button>
      </div>
      <table className="sheet-table wide">
        <thead>
          <tr>
            <th>{t('pf1e.feats.name')}</th>
            <th>{t('pf1e.feats.level')}</th>
            <th>{t('pf1e.feats.summary')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {character.features.length === 0 ? (
            <tr>
              <td colSpan={4} className="muted">
                {t('pf1e.feats.emptyFeatures')}
              </td>
            </tr>
          ) : (
            character.features.map((feature, index) => (
              <tr key={feature.id}>
                <td className="feat-cell">
                  <select
                    aria-label={t('pf1e.feats.featureCatalog')}
                    value={feature.feature.id ?? ''}
                    onChange={(e) => {
                      const id = e.target.value || null
                      update((c) => ({
                        ...c,
                        features: updateAt(c.features, index, (row) =>
                          applyCrbFeature(row, id),
                        ),
                      }))
                    }}
                  >
                    <option value="">{t('pf1e.common.custom')}</option>
                    {CRB_FEATURES.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label={t('pf1e.feats.featureName')}
                    value={feature.feature.name}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        features: updateAt(c.features, index, (row) => ({
                          ...row,
                          feature: { ...row.feature, name: e.target.value },
                        })),
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    aria-label={t('pf1e.feats.level')}
                    value={feature.levelGained}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        features: patchAt(c.features, index, {
                          levelGained: Math.max(1, Number(e.target.value) || 1),
                        }),
                      }))
                    }
                  />
                </td>
                <td>
                  <input
                    aria-label={t('pf1e.feats.summary')}
                    value={feature.summary ?? ''}
                    onChange={(e) =>
                      update((c) => ({
                        ...c,
                        features: patchAt(c.features, index, {
                          summary: e.target.value,
                        }),
                      }))
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() =>
                      update((c) => ({
                        ...c,
                        features: removeAt(c.features, index),
                      }))
                    }
                  >
                    {t('pf1e.common.remove')}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
