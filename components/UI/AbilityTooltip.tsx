'use client'

import React from 'react'
import type { UnitData } from '../../game/gamestate'
import styles from './AbilityTooltip.module.css'

interface AbilityTooltipProps {
  unit: UnitData | null
  isVisible: boolean
  position: { x: number; y: number }
}

export const AbilityTooltip: React.FC<AbilityTooltipProps> = ({ unit, isVisible, position }) => {
  if (!unit || !isVisible) {
    return null
  }

  const getAbilityInfo = () => {
    switch (unit.archetype) {
      case 'scout':
        return {
          name: 'Dash',
          description: 'Grants +2 movement for this turn only',
          cooldown: 'Ready',
          effect: 'Movement bonus: +2',
          activation: 'Instant'
        }
      case 'bruiser':
        return {
          name: 'Guard',
          description: 'Reduces incoming damage by 3 for 1 turn',
          cooldown: 'Ready',
          effect: 'Damage reduction: -3',
          activation: 'Instant'
        }
      case 'sniper':
        return {
          name: 'Aim',
          description: 'Increases critical chance by 16% but reduces movement by 2',
          cooldown: 'Ready',
          effect: 'Crit chance: +16%, Movement: -2',
          activation: 'Instant'
        }
      default:
        return null
    }
  }

  const info = getAbilityInfo()
  if (!info) return null

  return (
    <div 
      className={styles.tooltip}
      style={{
        left: position.x,
        top: position.y,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      <div className={styles.header}>
        <h4 className={styles.abilityName}>{info.name}</h4>
        <span className={styles.archetypeBadge}>{unit.archetype.toUpperCase()}</span>
      </div>
      
      <div className={styles.description}>
        {info.description}
      </div>

      <div className={styles.effects}>
        <div className={styles.effectRow}>
          <span className={styles.effectLabel}>Effect:</span>
          <span className={styles.effectValue}>{info.effect}</span>
        </div>
        <div className={styles.effectRow}>
          <span className={styles.effectLabel}>Activation:</span>
          <span className={styles.effectValue}>{info.activation}</span>
        </div>
        <div className={styles.effectRow}>
          <span className={styles.effectLabel}>Cooldown:</span>
          <span className={styles.effectValue}>{info.cooldown}</span>
        </div>
      </div>

      <div className={styles.usage}>
        <span className={styles.usageLabel}>Usage:</span>
        <span className={styles.usageText}>
          {unit.archetype === 'scout' && 'Click "Use Ability" then move to activate dash'}
          {unit.archetype === 'bruiser' && 'Click "Use Ability" to activate guard before enemy attacks'}
          {unit.archetype === 'sniper' && 'Click "Use Ability" to aim before attacking'}
        </span>
      </div>

      <div className={styles.status}>
        <span className={`${styles.statusIndicator} ${unit.hasUsedAbility ? styles.used : styles.ready}`}>
          {unit.hasUsedAbility ? 'USED' : 'READY'}
        </span>
      </div>
    </div>
  )
}