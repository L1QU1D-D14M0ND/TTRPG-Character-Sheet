import { describe, expect, it } from 'vitest'
import { pf1eModule } from '../module'
import { pf2eModule } from '../../pf2e/module'
import { buildPf1eEncyclopedia } from './pf1eEncyclopedia'

describe('PF1e encyclopedia tool', () => {
  it('registers the encyclopedia on PF1e only', () => {
    expect(pf1eModule.sidebarTools.map((tool) => tool.id)).toContain('shell.encyclopedia')
    expect(pf2eModule.sidebarTools.map((tool) => tool.id)).not.toContain('shell.encyclopedia')
  })

  it('shows the smoke set under spells, feats, and features, with empty groups', () => {
    const groups = buildPf1eEncyclopedia()
    const names = (kind: string) =>
      groups.find((group) => group.kind === kind)?.entries.map((entry) => entry.name)
    expect(names('spell')).toEqual(['Fireball', 'Evolution Surge'])
    expect(names('feat')).toEqual([
      'Power Attack',
      'Agile Maneuvers',
      'Arcane Armor Mastery',
      'Arcane Armor Training',
      'Arcane Strike',
      'Armor Proficiency, Heavy',
      'Armor Proficiency, Light',
      'Armor Proficiency, Medium',
      'Bleeding Critical',
      'Blind-Fight',
      'Blinding Critical',
      'Catch Off-Guard',
      'Channel Smite',
      'Cleave',
      'Combat Expertise',
      'Combat Reflexes',
      'Critical Focus',
      'Critical Mastery',
      'Dazzling Display',
      'Deadly Aim',
      'Deadly Stroke',
      'Deafening Critical',
      'Defensive Combat Training',
      'Deflect Arrows',
      'Disruptive',
      'Dodge',
      'Double Slice',
      'Exhausting Critical',
      'Exotic Weapon Proficiency',
      'Far Shot',
      "Gorgon's Fist",
      'Great Cleave',
      'Greater Bull Rush',
      'Greater Disarm',
      'Greater Feint',
      'Greater Grapple',
      'Greater Overrun',
    ])
    expect(names('feature')).toEqual([
      'Arcane Bond',
      'Physical Enhancement',
      'Telekinetic Fist',
    ])
    expect(names('affliction')).toEqual([])
    expect(names('action')).toEqual([])
  })
})
