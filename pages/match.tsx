import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import GameLayout from '../components/GameLayout'
import SceneCanvas from '../components/game/SceneCanvas'
import { TutorialOverlay } from '../components/UI/TutorialOverlay'
import type { GameState } from '../game/gamestate'

export default function MatchPage() {
  const router = useRouter()
  const [latestGameState, setLatestGameState] = useState<GameState | null>(null)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [isMapPanelOpen, setIsMapPanelOpen] = useState(false)

  const tutorialEnabled = useMemo(() => {
    const q = router.query.tutorial
    if (!q) return false
    const value = Array.isArray(q) ? q[0] : q
    return value === '1' || value === 'true'
  }, [router.query.tutorial])

  return (
    <GameLayout 
      isDebugMode={isDebugMode} 
      onDebugModeChange={setIsDebugMode}
      isMapPanelOpen={isMapPanelOpen}
      onMapPanelOpenChange={setIsMapPanelOpen}
    >
      <div>
        <TutorialOverlay enabled={tutorialEnabled} gameState={latestGameState} />

        {/* Game Canvas */}
        <SceneCanvas 
          onGameStateChange={setLatestGameState}
          saveKey={tutorialEnabled ? 'threegame:save:tutorial:v1' : undefined}
          isDebugMode={isDebugMode}
          isMapPanelOpen={isMapPanelOpen}
          canvasProps={{
            style: {
              width: '100%',
              height: '100%',
              position: 'relative',
              zIndex: 1
            }
          }}
        />
      </div>
    </GameLayout>
  )
}
