'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { GameState, PlayerId } from '../../game/gamestate'
import styles from './MatchSummaryModal.module.css'
import { buildMatchSummaryText, renderMatchShareCard } from './matchShareCard'

interface MatchSummaryModalProps {
  isOpen: boolean
  winner: PlayerId | null
  gameState: GameState
  seriesBestOf?: 3 | 5
  seriesWins?: { p1: number; p2: number }
  mapPresetId?: string
  mapSeed?: number
  onRematch: () => void
  onNewMap: () => void
  onToggleBestOf: () => void
  onSwapFirstPlayer: () => void
}

export function MatchSummaryModal(props: MatchSummaryModalProps) {
  const {
    isOpen,
    winner,
    gameState,
    seriesBestOf,
    seriesWins,
    mapPresetId,
    mapSeed,
    onRematch,
    onNewMap,
    onToggleBestOf,
    onSwapFirstPlayer,
  } = props

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  const summaryText = useMemo(() => {
    return buildMatchSummaryText({
      gameState,
      winner,
      seriesBestOf,
      seriesWins,
    })
  }, [gameState, seriesBestOf, seriesWins, winner])

  useEffect(() => {
    if (!isOpen) return
    const canvas = canvasRef.current
    if (!canvas) return
    renderMatchShareCard(canvas, {
      gameState,
      winner,
      seriesBestOf,
      seriesWins,
      seed: mapSeed,
    })
  }, [gameState, isOpen, mapSeed, seriesBestOf, seriesWins, winner])

  if (!isOpen) return null

  const winnerLabel = winner === 'p1' ? 'Player 1' : winner === 'p2' ? 'Player 2' : 'Draw'

  const downloadPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `threegame-match-${Date.now()}.png`
    a.click()
  }

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText)
      setCopyStatus('Copied!')
      window.setTimeout(() => setCopyStatus(null), 1200)
    } catch {
      setCopyStatus('Copy failed')
      window.setTimeout(() => setCopyStatus(null), 1200)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Game Over</h2>
            <p className={styles.subtitle}>
              {winnerLabel} wins{mapPresetId ? ` · Map: ${mapPresetId}` : ''}{mapSeed !== undefined ? ` · Seed: ${mapSeed}` : ''}
            </p>
          </div>
          <div className={styles.subtitle}>
            Turns: <b>{gameState.matchStats.turnsPlayed}</b>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.statsBox}>
            <div className={styles.statsBoxTitle}>Match Stats</div>

            {seriesBestOf && seriesWins && (
              <div className={styles.row}>
                <span className={styles.label}>Series (BO{seriesBestOf})</span>
                <span className={styles.value}>P1 {seriesWins.p1} - P2 {seriesWins.p2}</span>
              </div>
            )}

            <div className={styles.row}>
              <span className={styles.label}>Hits / Misses / Crits</span>
              <span className={styles.value}>
                {gameState.matchStats.hits} / {gameState.matchStats.misses} / {gameState.matchStats.crits}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Damage (P1)</span>
              <span className={styles.value}>{gameState.matchStats.damageByPlayer.p1}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Damage (P2)</span>
              <span className={styles.value}>{gameState.matchStats.damageByPlayer.p2}</span>
            </div>

            <div className={styles.perUnit}>
              <div className={styles.statsBoxTitle} style={{ marginBottom: 0 }}>Per-unit</div>
              {Object.entries(gameState.matchStats.perUnit).map(([unitId, stats]) => (
                <div key={unitId} className={styles.row}>
                  <span className={styles.label}>{unitId}</span>
                  <span className={styles.value}>
                    K {stats.kills} · DT {stats.damageTaken} · AL {stats.attacksLanded} · TS {stats.turnsSurvived}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.cardBox}>
            <h3 className={styles.cardTitle}>Share Card (PNG)</h3>
            <canvas ref={canvasRef} className={styles.previewCanvas} />
            <div className={styles.muted}>
              Tip: Use “Copy summary” for Discord/text. PNG is great for socials.
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={`${styles.button} ${styles.primary}`} onClick={onRematch}>
            Rematch
          </button>
          <button className={`${styles.button} ${styles.warn}`} onClick={onNewMap}>
            New Map
          </button>
          <button className={`${styles.button} ${styles.secondary}`} onClick={onSwapFirstPlayer}>
            Swap First Player
          </button>
          <button className={`${styles.button} ${styles.secondary}`} onClick={onToggleBestOf}>
            Toggle BO{(seriesBestOf ?? 3) === 3 ? '5' : '3'}
          </button>

          <button className={`${styles.button} ${styles.secondary}`} onClick={copySummary}>
            {copyStatus ? copyStatus : 'Copy summary'}
          </button>
          <button className={`${styles.button} ${styles.secondary}`} onClick={downloadPng}>
            Download PNG
          </button>
        </div>
      </div>
    </div>
  )
}
