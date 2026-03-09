'use client'

import React from 'react'
import type { PlayerId } from '../../game/gamestate'
import styles from './SessionHud.module.css'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface SessionHudProps {
  bestOf: 3 | 5
  wins: Record<PlayerId, number>
  saveState: SaveState
  lastSavedAt: number | null
}

function formatTime(timestamp: number | null): string {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleTimeString()
}

function getSaveStateLabel(saveState: SaveState): { text: string; className: string } {
  if (saveState === 'saving') {
    return { text: 'Saving…', className: styles.saving }
  }
  if (saveState === 'saved') {
    return { text: 'Saved', className: styles.saved }
  }
  if (saveState === 'error') {
    return { text: 'Save failed', className: styles.error }
  }
  return { text: 'Idle', className: '' }
}

export const SessionHud: React.FC<SessionHudProps> = ({
  bestOf,
  wins,
  saveState,
  lastSavedAt,
}) => {
  const saveStateLabel = getSaveStateLabel(saveState)
  const neededWins = Math.ceil(bestOf / 2)
  const seriesChampion: PlayerId | null =
    wins.p1 >= neededWins ? 'p1' : wins.p2 >= neededWins ? 'p2' : null

  return (
    <div className={styles.hudContainer}>
      <div className={styles.hudBox}>
        <p className={styles.title}>Session HUD</p>

        <div className={styles.row}>
          <span className={styles.label}>Mode</span>
          <span className={styles.value}>Best of {bestOf}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Series Score</span>
          <span className={styles.value}>P1 {wins.p1} - {wins.p2} P2</span>
        </div>

        {seriesChampion && (
          <div className={styles.row}>
            <span className={styles.label}>Champion</span>
            <span className={`${styles.value} ${styles.champion}`}>{seriesChampion === 'p1' ? 'Player 1' : 'Player 2'}</span>
          </div>
        )}

        <div className={styles.row}>
          <span className={styles.label}>Autosave</span>
          <span className={`${styles.value} ${saveStateLabel.className}`.trim()}>{saveStateLabel.text}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Last saved</span>
          <span className={styles.value}>{formatTime(lastSavedAt)}</span>
        </div>

        <div className={styles.progress}>
          <span className={styles.progressLabel}>Progress</span>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ 
                width: `${Math.min(100, ((wins.p1 + wins.p2) / bestOf) * 100)}%`,
                background: seriesChampion ? '#86efac' : '#38bdf8'
              }}
            />
          </div>
          <span className={styles.progressText}>{wins.p1 + wins.p2}/{bestOf} matches</span>
        </div>
      </div>
    </div>
  )
}
