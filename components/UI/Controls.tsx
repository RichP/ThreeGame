'use client'

import React from 'react'
import type { GameState, Phase } from '../../game/gamestate'
import {
  canUnitAttack,
  canUnitMove,
  canUseActiveAbility,
  getActiveAbilityAvailability,
  Phase as PhaseEnum,
  getAttackableEnemies,
  getUnitById,
} from '../../game/gamestate'
import { AbilityTooltip } from './AbilityTooltip'
import styles from './Controls.module.css'

interface ControlsProps {
  gameState: GameState
  onEndTurn: () => void
  onCancelSelection: () => void
  onUndoMove: () => void
  onUseAbility: () => void
  canUndoMove: boolean
  onSetAutoSkipNoTargetAttack: (enabled: boolean) => void
  isBusy?: boolean
}

export const Controls: React.FC<ControlsProps> = ({
  gameState,
  onEndTurn,
  onCancelSelection,
  onUndoMove,
  onUseAbility,
  canUndoMove,
  onSetAutoSkipNoTargetAttack,
  isBusy = false,
}) => {
  const [tooltipVisible, setTooltipVisible] = React.useState(false)
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 })
  const abilityButtonRef = React.useRef<HTMLButtonElement>(null)

  const handleAbilityButtonHover = (e: React.MouseEvent) => {
    if (isBusy) return
    
    const rect = abilityButtonRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltipPosition({
        x: rect.right,
        y: rect.top
      })
      setTooltipVisible(true)
    }
  }

  const handleAbilityButtonLeave = () => {
    setTooltipVisible(false)
  }

  const canCancelSelection = gameState.selectedUnitId !== null
  
  const selectedUnit = getUnitById(gameState, gameState.selectedUnitId)
  const attackableEnemies = selectedUnit ? getAttackableEnemies(gameState, selectedUnit) : []
  const canSelectedUnitAttack = canUnitAttack(selectedUnit)
  const abilityAvailability = getActiveAbilityAvailability(selectedUnit)
  const canSelectedUnitUseAbility = canUseActiveAbility(selectedUnit)
  const mustMoveSelectedUnitFirst = gameState.phase === PhaseEnum.MOVE_UNIT && canUnitMove(selectedUnit)
  const canEndTurn = !mustMoveSelectedUnitFirst
  const isAttackPhaseWithNoEnemies = gameState.phase === PhaseEnum.ATTACK && attackableEnemies.length === 0
  const isAttackPhaseWithoutAction = gameState.phase === PhaseEnum.ATTACK && !canSelectedUnitAttack
  
  const endTurnLabel = isAttackPhaseWithNoEnemies || isAttackPhaseWithoutAction ? 'Continue Turn' : 'End Turn'

  return (
    <div className={styles.controlsContainer}>
       <AbilityTooltip
          unit={selectedUnit ?? null}
          isVisible={tooltipVisible && !!selectedUnit}
          position={tooltipPosition}
        />
      <div className={styles.row}>
        <button
          className={`${styles.button} ${styles.endTurn} ${(!canEndTurn || isBusy) ? styles.disabled : ''}`}
          onClick={onEndTurn}
          disabled={!canEndTurn || isBusy}
          title={isBusy ? 'Resolving attack...' : (canEndTurn ? endTurnLabel : 'Move selected unit before ending turn')}
        >
          {endTurnLabel}
        </button>

        <button
          className={`${styles.button} ${styles.cancel} ${(!canCancelSelection || isBusy) ? styles.disabled : ''}`}
          onClick={onCancelSelection}
          disabled={!canCancelSelection || isBusy}
          title={isBusy ? 'Resolving attack...' : (canCancelSelection ? 'Deselect current unit' : 'No unit selected')}
        >
          Cancel
        </button>

        <button
          className={`${styles.button} ${styles.undo} ${(!canUndoMove || isBusy) ? styles.disabled : ''}`}
          onClick={onUndoMove}
          disabled={!canUndoMove || isBusy}
          title={isBusy ? 'Resolving attack...' : (canUndoMove ? 'Undo last move (pre-attack only)' : 'No move to undo')}
        >
          Undo Move
        </button>

        <button
          ref={abilityButtonRef}
          className={`${styles.button} ${styles.ability} ${(!canSelectedUnitUseAbility || isBusy) ? styles.disabled : ''}`}
          onClick={onUseAbility}
          disabled={!canSelectedUnitUseAbility || isBusy}
          onMouseEnter={handleAbilityButtonHover}
          onMouseLeave={handleAbilityButtonLeave}
          title={
            isBusy
              ? 'Resolving action...'
              : canSelectedUnitUseAbility
                ? 'Use selected unit active ability'
                : (abilityAvailability?.reason ?? 'Ability unavailable')
          }
        >
          Use Ability
        </button>

       
      </div>

      
    </div>
  )
}
