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
  movePreview?: {
    from: { x: number; y: number }
    to: { x: number; y: number }
    steps: number
    budget: number
    remaining: number
  } | null
}

const phaseLabels: Record<string, string> = {
  [PhaseEnum.SELECT_UNIT]: 'SELECT UNIT',
  [PhaseEnum.MOVE_UNIT]: 'MOVE UNIT',
  [PhaseEnum.ATTACK]: 'ATTACK',
  [PhaseEnum.END_TURN]: 'END TURN',
}

const toPercent = (value: number): string => `${Math.round(value * 100)}%`

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function average(min: number, max: number): number {
  return (min + max) / 2
}

/**
 * Probability that a uniformly random integer in [min, max] is >= threshold.
 */
function chanceAtLeastUniformInt(min: number, max: number, threshold: number): number {
  if (threshold <= min) return 1
  if (threshold > max) return 0
  const total = Math.max(1, max - min + 1)
  const favorable = Math.max(0, max - threshold + 1)
  return clamp01(favorable / total)
}

export const GameStatus: React.FC<GameStatusProps> = ({ gameState, targetingPreview = null, movePreview = null }) => {
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

        {movePreview && (
          <div className={styles.previewBox}>
            <div className={styles.previewTitle}>Move Preview</div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Path</span>
              <span className={styles.previewValue}>
                ({movePreview.from.x},{movePreview.from.y}) → ({movePreview.to.x},{movePreview.to.y})
              </span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Cost</span>
              <span className={styles.previewValue}>{movePreview.steps} / {movePreview.budget}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Remain</span>
              <span className={styles.previewValue}>{movePreview.remaining}</span>
            </div>
          </div>
        )}

        {targetingPreview && (
          <div className={styles.previewBox}>
            <div className={styles.previewTitle}>Target Preview</div>
            {(() => {
              const targetUnit = getUnitById(gameState, targetingPreview.targetId)
              const mitigation = (targetingPreview.breakdown.armorReduction ?? 0) + (targetingPreview.breakdown.guardReduction ?? 0)

              const hitMin = Math.max(1, targetingPreview.minDamage - mitigation)
              const hitMax = Math.max(1, targetingPreview.maxDamage - mitigation)
              const critMin = Math.max(1, targetingPreview.minCritDamage - mitigation)
              const critMax = Math.max(1, targetingPreview.maxCritDamage - mitigation)

              const expectedDamage =
                targetingPreview.hitChance * average(hitMin, hitMax) +
                targetingPreview.critChance * average(critMin, critMax)

              const killChance = targetUnit
                ? (
                    targetingPreview.hitChance * chanceAtLeastUniformInt(hitMin, hitMax, targetUnit.health) +
                    targetingPreview.critChance * chanceAtLeastUniformInt(critMin, critMax, targetUnit.health)
                  )
                : null

              const likelyKill = killChance !== null ? killChance >= 0.5 : null
              const killTone = killChance === null
                ? null
                : killChance >= 0.75
                  ? styles.killHigh
                  : killChance >= 0.35
                    ? styles.killMid
                    : styles.killLow
              const showSkull = killChance !== null && killChance >= 0.8

              return (
                <>
                  <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>Expected (net)</span>
                    <span className={styles.previewValue}>{expectedDamage.toFixed(1)}</span>
                  </div>
                  {killChance !== null && (
                    <>
                      <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Kill</span>
                        <span className={`${styles.previewValue} ${killTone ?? ''}`}>
                          {toPercent(killChance)}
                          {showSkull && <span className={styles.skull}>☠</span>}
                        </span>
                      </div>
                      <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Likely</span>
                        <span className={`${styles.previewValue} ${killTone ?? ''}`}>{likelyKill ? 'YES' : 'NO'}</span>
                      </div>
                    </>
                  )}
                </>
              )
            })()}
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
