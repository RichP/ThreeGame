'use client'

import React, { useRef, useEffect, useState } from 'react'
import type { UnitData } from '../../game/gamestate'
import { getActiveAbilityAvailability } from '../../game/gamestate'
import styles from './AbilityTooltip.module.css'

interface AbilityTooltipProps {
  unit: UnitData | null
  isVisible: boolean
  position: { x: number; y: number }
}

export const AbilityTooltip: React.FC<AbilityTooltipProps> = ({ unit, isVisible, position }) => {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipWidth, setTooltipWidth] = useState(300) // fallback width
  const [tooltipHeight, setTooltipHeight] = useState(200) // fallback height

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      // Measure the actual width and height of the rendered tooltip
      const width = tooltipRef.current.offsetWidth
      const height = tooltipRef.current.offsetHeight
      setTooltipWidth(width)
      setTooltipHeight(height)
    }
  }, [isVisible, unit]) // Re-measure when visibility or unit changes

  if (!unit || !isVisible) {
    return null
  }

  const availability = getActiveAbilityAvailability(unit)

  const getAbilityInfo = () => {
    switch (unit.archetype) {
      case 'scout':
        return {
          name: 'Dash',
          description: 'Grants +2 movement for this turn only',
          cooldown: availability?.cooldownRemaining
            ? `${availability.cooldownRemaining} turns`
            : 'Ready',
          effect: 'Movement bonus: +2',
          activation: 'Instant'
        }
      case 'bruiser':
        return {
          name: 'Guard',
          description: 'Reduces incoming damage by 3 for 1 turn',
          cooldown: availability?.cooldownRemaining
            ? `${availability.cooldownRemaining} turns`
            : 'Ready',
          effect: 'Damage reduction: -3',
          activation: 'Instant'
        }
      case 'sniper':
        return {
          name: 'Aim',
          description: 'Increases critical chance by 16% but reduces movement by 2',
          cooldown: availability?.cooldownRemaining
            ? `${availability.cooldownRemaining} turns`
            : 'Ready',
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
        left: position.x - tooltipWidth,
        top: position.y - (tooltipHeight * 1.4),
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
        <span
          className={`${styles.statusIndicator} ${availability?.canUse ? styles.ready : styles.used}`}
          title={availability?.reason}
        >
          {availability?.canUse
            ? 'READY'
            : availability?.cooldownRemaining
              ? `CD ${availability.cooldownRemaining}`
              : 'USED'}
        </span>
      </div>
    </div>
  )
}