import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import GameLayout from '../components/GameLayout'
import SceneCanvas from '../components/game/SceneCanvas'
import { TutorialOverlay } from '../components/UI/TutorialOverlay'
import type { GameState } from '../game/gamestate'
import styles from './match.module.css'

export default function MatchPage() {
  const [isDebugMode, setIsDebugMode] = useState(false)
  const router = useRouter()
  const [latestGameState, setLatestGameState] = useState<GameState | null>(null)

  const tutorialEnabled = useMemo(() => {
    const q = router.query.tutorial
    if (!q) return false
    const value = Array.isArray(q) ? q[0] : q
    return value === '1' || value === 'true'
  }, [router.query.tutorial])

  return (
    <GameLayout>
      <div className={styles.matchInterface}>
        <TutorialOverlay enabled={tutorialEnabled} gameState={latestGameState} />

        {/* Game Canvas */}
        <SceneCanvas 
          onGameStateChange={setLatestGameState}
          saveKey={tutorialEnabled ? 'threegame:save:tutorial:v1' : undefined}
          canvasProps={{
            style: {
              width: '100%',
              height: '100%',
              position: 'relative',
              zIndex: 1
            }
          }}
        />

        {/* Debug Toggle */}
        <div className={styles.debugToggle}>
          Debug Mode: 
          <button
            className={`${styles.debugToggleButton} ${isDebugMode ? styles.debugToggleButtonActive : styles.debugToggleButtonInactive}`}
            onClick={() => setIsDebugMode(!isDebugMode)}
          >
            {isDebugMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </GameLayout>
  )
}
