'use client'

import React from 'react'
import type { GameState, Phase } from '../../game/gamestate'
import {
  type MapPresetId,
  MAP_PRESET_LABELS,
  canUnitAttack,
  canUnitMove,
  canUseActiveAbility,
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
  onApplyMapConfig: (mapPresetId: MapPresetId, mapSeed?: number) => void
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
  onApplyMapConfig,
  onSetAutoSkipNoTargetAttack,
  isBusy = false,
}) => {
  const [mapPresetId, setMapPresetId] = React.useState<MapPresetId>(gameState.config.mapPresetId)
  const [seedInput, setSeedInput] = React.useState<string>(
    gameState.config.mapSeed !== undefined ? String(gameState.config.mapSeed) : '1337'
  )
  const [tooltipVisible, setTooltipVisible] = React.useState(false)
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 })
  const abilityButtonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    setMapPresetId(gameState.config.mapPresetId)
    if (gameState.config.mapSeed !== undefined) {
      setSeedInput(String(gameState.config.mapSeed))
    }
  }, [gameState.config.mapPresetId, gameState.config.mapSeed])

  const handleAbilityButtonHover = (e: React.MouseEvent) => {
    if (isBusy) return
    
    const rect = abilityButtonRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltipPosition({
        x: rect.left - 10,
        y: rect.top - 160
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
  const canSelectedUnitUseAbility = canUseActiveAbility(selectedUnit)
  const mustMoveSelectedUnitFirst = gameState.phase === PhaseEnum.MOVE_UNIT && canUnitMove(selectedUnit)
  const canEndTurn = !mustMoveSelectedUnitFirst
  const isAttackPhaseWithNoEnemies = gameState.phase === PhaseEnum.ATTACK && attackableEnemies.length === 0
  const isAttackPhaseWithoutAction = gameState.phase === PhaseEnum.ATTACK && !canSelectedUnitAttack
  
  const endTurnLabel = isAttackPhaseWithNoEnemies || isAttackPhaseWithoutAction ? 'Continue Turn' : 'End Turn'

  const applyMapConfig = () => {
    const parsedSeed = Number.parseInt(seedInput, 10)
    const safeSeed = Number.isFinite(parsedSeed) ? parsedSeed : 1337
    onApplyMapConfig(mapPresetId, mapPresetId === 'random-seeded' ? safeSeed : undefined)
  }

  return (
    <div className={styles.controlsContainer}>
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
          title={isBusy ? 'Resolving action...' : (canSelectedUnitUseAbility ? 'Use selected unit active ability' : 'Ability already used or no unit selected')}
        >
          Use Ability
        </button>

        <AbilityTooltip
          unit={selectedUnit ?? null}
          isVisible={tooltipVisible && !!selectedUnit}
          position={tooltipPosition}
        />
      </div>

      <div className={styles.mapPanel}>
        <div className={styles.mapTitle}>Map Setup</div>
        <label className={styles.mapLabel}>
          Preset
          <select
            className={styles.select}
            value={mapPresetId}
            onChange={(event) => setMapPresetId(event.target.value as MapPresetId)}
            disabled={isBusy}
          >
            {(Object.keys(MAP_PRESET_LABELS) as MapPresetId[]).map((presetId) => (
              <option key={presetId} value={presetId}>
                {MAP_PRESET_LABELS[presetId]}
              </option>
            ))}
          </select>
        </label>

        {mapPresetId === 'random-seeded' && (
          <label className={styles.mapLabel}>
            Seed
            <input
              className={styles.seedInput}
              type="number"
              value={seedInput}
              onChange={(event) => setSeedInput(event.target.value)}
              disabled={isBusy}
            />
          </label>
        )}

        <button
          className={`${styles.button} ${styles.applyMap} ${isBusy ? styles.disabled : ''}`}
          onClick={applyMapConfig}
          disabled={isBusy}
          title={isBusy ? 'Resolving action...' : 'Start a new match with selected map settings'}
        >
          Apply Map
        </button>

        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={gameState.autoSkipNoTargetAttack}
            onChange={(event) => onSetAutoSkipNoTargetAttack(event.target.checked)}
            disabled={isBusy}
          />
          Auto-skip attack if no targets
        </label>
      </div>
    </div>
  )
}
