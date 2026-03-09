'use client'

import React from 'react'
import type { GameState, TargetingPreview } from '../../game/gamestate'
import {
  canUnitAttack,
  canUnitMove,
  hasUnitFinishedTurn,
  Phase as PhaseEnum,
  getAttackableEnemies,
  getUnitById,
} from '../../game/gamestate'
import styles from './GameStatus.module.css'

interface GameStatusProps {
  gameState: GameState
  targetingPreview?: TargetingPreview | null
}

const phaseLabels: Record<string, string> = {
  [PhaseEnum.SELECT_UNIT]: 'SELECT UNIT',
  [PhaseEnum.MOVE_UNIT]: 'MOVE UNIT',
  [PhaseEnum.ATTACK]: 'ATTACK',
  [PhaseEnum.END_TURN]: 'END TURN',
}

const toPercent = (value: number): string => `${Math.round(value * 100)}%`

export const GameStatus: React.FC<GameStatusProps> = ({ gameState, targetingPreview = null }) => {
  const currentPhase = phaseLabels[gameState.phase]
  const isPlayerOneTurn = gameState.currentPlayerIndex === 0
  const currentPlayer = isPlayerOneTurn ? 'Player 1' : 'Player 2'
  const playerColor = isPlayerOneTurn ? '#3b82f6' : '#ef4444'
  
  const selectedUnit = getUnitById(gameState, gameState.selectedUnitId)
  const attackableEnemies = selectedUnit ? getAttackableEnemies(gameState, selectedUnit) : []
  const showNoEnemiesWarning = gameState.phase === PhaseEnum.ATTACK && attackableEnemies.length === 0
  const unitsRemaining = gameState.units.filter(
    unit => unit.playerId === gameState.currentPlayer && !hasUnitFinishedTurn(unit)
  ).length

  let actionHint = 'Select a unit to begin.'

  switch (gameState.phase) {
    case PhaseEnum.SELECT_UNIT:
      actionHint = unitsRemaining > 0
        ? 'Select a unit with actions remaining.'
        : 'No actions left. Continue turn to pass control.'
      break
    case PhaseEnum.MOVE_UNIT:
      if (!selectedUnit) {
        actionHint = 'Select a unit to move.'
      } else if (canUnitMove(selectedUnit)) {
        actionHint = 'Click a highlighted tile to move.'
      } else {
        actionHint = 'Move already used. Proceed to attack or continue turn.'
      }
      break
    case PhaseEnum.ATTACK:
      if (!selectedUnit) {
        actionHint = 'Select a unit to attack.'
      } else if (!canUnitAttack(selectedUnit)) {
        actionHint = 'Attack already used. Continue turn.'
      } else if (attackableEnemies.length === 0) {
        actionHint = 'No enemies in line-of-sight. Continue turn to skip attack.'
      } else {
        actionHint = 'Click an enemy unit in highlighted attack range.'
      }
      break
    case PhaseEnum.END_TURN:
      actionHint = 'End turn to switch to the next player.'
      break
    default:
      break
  }

  return (
    <div className={styles.statusContainer}>
      <div
        key={`${gameState.currentPlayer}-${gameState.turn}`}
        className={`${styles.statusBox} ${styles.turnPulse} ${isPlayerOneTurn ? styles.playerOneTheme : styles.playerTwoTheme}`}
      >
        <h2 className={styles.title}>Game Status</h2>
        
        <div className={styles.playerInfo}>
          <div className={styles.label}>Current Player</div>
          <div className={styles.playerName} style={{ color: playerColor }}>
            {currentPlayer}
          </div>
        </div>

        <div className={styles.phaseInfo}>
          <div className={styles.label}>Phase</div>
          <div className={styles.phase}>{currentPhase}</div>
        </div>

        <div className={styles.turnInfo}>
          <div className={styles.label}>Turn</div>
          <div className={styles.turn}>{gameState.turn}</div>
        </div>

        <div className={styles.remainingInfo}>
          <div className={styles.label}>Units Remaining</div>
          <div className={`${styles.remaining} ${unitsRemaining === 0 ? styles.noneRemaining : ''}`}>
            {unitsRemaining}
          </div>
        </div>

        <div className={styles.hintBox}>
          <div className={styles.hintLabel}>Next Action</div>
          <div className={styles.hintText}>{actionHint}</div>
        </div>

        {showNoEnemiesWarning && (
          <div className={styles.warningBox}>
            <div className={styles.warningText}>No enemies in range</div>
          </div>
        )}

        {targetingPreview && (
          <div className={styles.previewBox}>
            <div className={styles.previewTitle}>Target Preview</div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Miss</span>
              <span className={styles.previewValue}>{toPercent(targetingPreview.missChance)}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Hit</span>
              <span className={styles.previewValue}>{toPercent(targetingPreview.hitChance)}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Crit</span>
              <span className={styles.previewValue}>{toPercent(targetingPreview.critChance)}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Cover</span>
              <span className={styles.previewValue}>
                {targetingPreview.coverBonus > 0 ? `+${toPercent(targetingPreview.coverBonus)} miss` : 'None'}
              </span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Damage</span>
              <span className={styles.previewValue}>{targetingPreview.minDamage}–{targetingPreview.maxDamage}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Crit Dmg</span>
              <span className={styles.previewValue}>{targetingPreview.minCritDamage}–{targetingPreview.maxCritDamage}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Formula</span>
              <span className={styles.previewValue}>
                {`${targetingPreview.breakdown.baseAttack} + ${targetingPreview.breakdown.varianceRange[0]}..${targetingPreview.breakdown.varianceRange[1]}`}
              </span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Mitigation</span>
              <span className={styles.previewValue}>
                {`Armor -${targetingPreview.breakdown.armorReduction}, Guard -${targetingPreview.breakdown.guardReduction}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
