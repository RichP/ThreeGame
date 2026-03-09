'use client'

import React from 'react'
import type { GameState } from '../../game/gamestate'
import { canUnitAttack, canUnitMove, getUnitById, getAttackableEnemies, UNIT_ARCHETYPES } from '../../game/gamestate'
import styles from './UnitInfo.module.css'

interface UnitInfoProps {
  gameState: GameState
}

export const UnitInfo: React.FC<UnitInfoProps> = ({ gameState }) => {
  const selectedUnit = gameState.selectedUnitId 
    ? getUnitById(gameState, gameState.selectedUnitId)
    : null

  const attackableEnemies = selectedUnit ? getAttackableEnemies(gameState, selectedUnit) : []

  if (!selectedUnit) {
    return (
      <div className={styles.infoContainer}>
        <div className={styles.infoBox}>
          <div className={styles.noSelection}>No unit selected</div>
        </div>
      </div>
    )
  }

  const playerName = selectedUnit.playerId === 'p1' ? 'Player 1' : 'Player 2'
  const archetypeStats = UNIT_ARCHETYPES[selectedUnit.archetype]
  const healthPercent = (selectedUnit.health / selectedUnit.maxHealth) * 100
  const moveReady = canUnitMove(selectedUnit)
  const attackReady = canUnitAttack(selectedUnit)
  const activeEffects: string[] = []

  if (selectedUnit.statusEffects.armorUpTurns > 0) {
    activeEffects.push(`Armor Up (${selectedUnit.statusEffects.armorUpTurns})`)
  }
  if (selectedUnit.statusEffects.poisonTurns > 0) {
    activeEffects.push(`Poison (${selectedUnit.statusEffects.poisonTurns})`)
  }

  return (
    <div className={styles.infoContainer}>
      <div className={styles.infoBox}>
        <h3 className={styles.unitName}>Unit {selectedUnit.id}</h3>
        <div className={styles.archetypeBadge}>{archetypeStats.displayName}</div>
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Owner:</span>
          <span className={styles.value}>{playerName}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Position:</span>
          <span className={styles.value}>
            ({selectedUnit.position.x}, {selectedUnit.position.y})
          </span>
        </div>

        <div className={styles.healthSection}>
          <span className={styles.label}>Health:</span>
          <div className={styles.healthBar}>
            <div 
              className={styles.healthFill} 
              style={{ 
                width: `${healthPercent}%`,
                backgroundColor: healthPercent > 50 ? '#10b981' : healthPercent > 25 ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>
          <span className={styles.healthText}>{selectedUnit.health}/{selectedUnit.maxHealth}</span>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Move</span>
            <span className={styles.statValue}>{selectedUnit.movement}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Attack</span>
            <span className={styles.statValue}>{selectedUnit.attack}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Range</span>
            <span className={styles.statValue}>{selectedUnit.range}</span>
          </div>
        </div>

        <div className={styles.actionEconomySection}>
          <div className={styles.actionRow}>
            <span className={styles.label}>Move Action</span>
            <span className={`${styles.actionValue} ${moveReady ? styles.actionReady : styles.actionSpent}`}>
              {moveReady ? 'READY' : 'USED'}
            </span>
          </div>
          <div className={styles.actionRow}>
            <span className={styles.label}>Attack Action</span>
            <span className={`${styles.actionValue} ${attackReady ? styles.actionReady : styles.actionSpent}`}>
              {attackReady ? 'READY' : 'USED'}
            </span>
          </div>
        </div>

        <div className={styles.effectsSection}>
          <span className={styles.label}>Effects:</span>
          {activeEffects.length > 0 ? (
            <div className={styles.effectsList}>
              {activeEffects.map((effect) => (
                <span
                  key={effect}
                  className={`${styles.effectBadge} ${effect.startsWith('Poison') ? styles.effectPoison : styles.effectArmor}`}
                >
                  {effect}
                </span>
              ))}
            </div>
          ) : (
            <div className={styles.noEffects}>None</div>
          )}
        </div>

        {attackableEnemies.length > 0 && (
          <div className={styles.enemiesSection}>
            <span className={styles.label}>Enemies in Range:</span>
            <div className={styles.enemiesList}>
              {attackableEnemies.map(enemy => (
                <div key={enemy.id} className={styles.enemyItem}>
                  <span className={styles.enemyId}>{enemy.id}</span>
                  <span className={styles.enemyHealth}>{enemy.health}/{enemy.maxHealth} HP</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
