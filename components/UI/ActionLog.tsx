'use client'

import React, { useEffect, useState } from 'react'
import type { GameEvent, GameState } from '../../game/gamestate'
import styles from './ActionLog.module.css'

interface ActionLogProps {
  gameState: GameState
}

interface ActionEntry {
  id: string
  text: string
  type: 'move' | 'undo_move' | 'attack' | 'death' | 'turn_end'
}

interface FilterState {
  move: boolean
  undo_move: boolean
  attack: boolean
  death: boolean
  turn_end: boolean
  compact: boolean
}

function toEntry(event: GameEvent): ActionEntry {
  switch (event.type) {
    case 'move':
      return {
        id: `${event.timestamp}-move-${event.unitId}`,
        type: 'move',
        text: `${event.unitId} moved (${event.from.x},${event.from.y}) → (${event.to.x},${event.to.y})`,
      }
    case 'undo_move':
      return {
        id: `${event.timestamp}-undo-${event.unitId}`,
        type: 'undo_move',
        text: `${event.unitId} undid move (${event.to.x},${event.to.y}) → (${event.from.x},${event.from.y})`,
      }
    case 'attack': {
      const baseText = event.outcome === 'miss'
        ? `${event.attackerId} missed ${event.targetId}`
        : event.outcome === 'crit'
          ? `${event.attackerId} critically hit ${event.targetId} for ${event.damage}`
          : `${event.attackerId} hit ${event.targetId} for ${event.damage}`
      const statusSuffix = event.statusesApplied && event.statusesApplied.length > 0
        ? ` (${event.statusesApplied.join(', ')})`
        : ''

      return {
        id: `${event.timestamp}-attack-${event.attackerId}-${event.targetId}`,
        type: 'attack',
        text: `${baseText}${statusSuffix}`,
      }
    }
    case 'death':
      return {
        id: `${event.timestamp}-death-${event.unitId}`,
        type: 'death',
        text: `${event.unitId} was eliminated (${event.byPlayer === 'environment' ? 'environment' : `by ${event.byPlayer}`})`,
      }
    case 'turn_end':
      return {
        id: `${event.timestamp}-turn-end-${event.turn}`,
        type: 'turn_end',
        text: `Turn ${event.turn} started — ${event.nextPlayer.toUpperCase()} to act`,
      }
    default:
      return {
        id: `${Date.now()}-unknown`,
        type: 'attack',
        text: 'Unknown event',
      }
  }
}

export const ActionLog: React.FC<ActionLogProps> = ({ gameState }) => {
  const [entries, setEntries] = useState<ActionEntry[]>([])
  const [filters, setFilters] = useState<FilterState>({
    move: true,
    undo_move: true,
    attack: true,
    death: true,
    turn_end: true,
    compact: false,
  })

  useEffect(() => {
    const nextEntries = gameState.eventLog
      .slice(-10)
      .reverse()
      .map((event) => toEntry(event))

    setEntries(nextEntries)
  }, [gameState.eventLog])

  const filteredEntries = entries.filter(entry => filters[entry.type])
  
  const toggleFilter = (type: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const clearLog = () => {
    // Note: This would need to be implemented in the game state management
    // For now, we'll just clear the local entries display
    setEntries([])
  }

  if (entries.length === 0) {
    return null
  }

  return (
    <div className={styles.logContainer}>
      <div className={styles.header}>
        <span>Combat Log</span>
        <div className={styles.controls}>
          <button 
            className={`${styles.filterBtn} ${filters.compact ? styles.active : ''}`}
            onClick={() => toggleFilter('compact')}
            title="Toggle compact mode"
          >
            Compact
          </button>
          <button 
            className={styles.clearBtn}
            onClick={clearLog}
            title="Clear log"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className={styles.filterBar}>
        <label className={styles.filterLabel}>
          <input
            type="checkbox"
            checked={filters.move}
            onChange={() => toggleFilter('move')}
          />
          Move
        </label>
        <label className={styles.filterLabel}>
          <input
            type="checkbox"
            checked={filters.undo_move}
            onChange={() => toggleFilter('undo_move')}
          />
          Undo
        </label>
        <label className={styles.filterLabel}>
          <input
            type="checkbox"
            checked={filters.attack}
            onChange={() => toggleFilter('attack')}
          />
          Attack
        </label>
        <label className={styles.filterLabel}>
          <input
            type="checkbox"
            checked={filters.death}
            onChange={() => toggleFilter('death')}
          />
          Death
        </label>
        <label className={styles.filterLabel}>
          <input
            type="checkbox"
            checked={filters.turn_end}
            onChange={() => toggleFilter('turn_end')}
          />
          Turn End
        </label>
      </div>

      <div className={`${styles.list} ${filters.compact ? styles.compact : ''}`}>
        {filteredEntries.map((entry) => (
          <div key={entry.id} className={`${styles.entry} ${styles[entry.type]} ${filters.compact ? styles.compactEntry : ''}`}>
            {!filters.compact && <span className={styles.eventType}>{entry.type.replace('_', ' ')}</span>}
            {entry.text}
          </div>
        ))}
        {filteredEntries.length === 0 && (
          <div className={styles.emptyState}>No events matching current filters</div>
        )}
      </div>
    </div>
  )
}
