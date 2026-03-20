'use client'

import React from 'react'
import type { GameState, Phase } from '../../game/gamestate'
import {
  type MapPresetId,
  MAP_PRESET_LABELS,
  canUnitAttack,
  canUnitMove,
  canUseActiveAbility,
  getActiveAbilityAvailability,
  Phase as PhaseEnum,
  getAttackableEnemies,
  getUnitById,
} from '../../game/gamestate'
import styles from './MapPanel.module.css'

interface MapPanelProps {
  gameState: GameState
  onApplyMapConfig: (mapPresetId: MapPresetId, mapSeed?: number) => void
  onSetAutoSkipNoTargetAttack: (enabled: boolean) => void
  isBusy?: boolean
}

export const MapPanel: React.FC<MapPanelProps> = ({
  gameState,
  onApplyMapConfig,
  onSetAutoSkipNoTargetAttack,
  isBusy = false,
}) => {
  const [mapPresetId, setMapPresetId] = React.useState<MapPresetId>(gameState.config.mapPresetId)
  const [seedInput, setSeedInput] = React.useState<string>(
    gameState.config.mapSeed !== undefined ? String(gameState.config.mapSeed) : '1337'
  )

  React.useEffect(() => {
    setMapPresetId(gameState.config.mapPresetId)
    if (gameState.config.mapSeed !== undefined) {
      setSeedInput(String(gameState.config.mapSeed))
    }
  }, [gameState.config.mapPresetId, gameState.config.mapSeed])

  const applyMapConfig = () => {
    const parsedSeed = Number.parseInt(seedInput, 10)
    const safeSeed = Number.isFinite(parsedSeed) ? parsedSeed : 1337
    onApplyMapConfig(mapPresetId, mapPresetId === 'random-seeded' ? safeSeed : undefined)
  }

  return (
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
  )
}

export default MapPanel