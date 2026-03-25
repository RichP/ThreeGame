import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../components/auth/AuthContext'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import { matchApi } from '../../services/api'
import GameLayout from '../../components/GameLayout'
import SceneCanvas from '../../components/game/SceneCanvas'
import { TutorialOverlay } from '../../components/UI/TutorialOverlay'
import type { GameState } from '../../game/gamestate'

export default function MatchPage() {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated, isLoading } = useAuth()
  const [matchData, setMatchData] = useState<any>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isLoadingMatch, setIsLoadingMatch] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [isMapPanelOpen, setIsMapPanelOpen] = useState(false)

  useEffect(() => {
    if (id && isAuthenticated) {
      loadMatch()
    }
  }, [id, isAuthenticated])

  const loadMatch = async () => {
    try {
      setIsLoadingMatch(true)
      setError(null)
      
      const response = await matchApi.getMatch(id as string)
      
      if (response.success && response.data) {
        setMatchData(response.data)
        // Initialize game state from match data if available
        if (response.data.gameState) {
          setGameState(response.data.gameState as any)
        }
      } else {
        setError(response.error || 'Failed to load match')
      }
    } catch (error) {
      console.error('Error loading match:', error)
      setError('Failed to load match')
    } finally {
      setIsLoadingMatch(false)
    }
  }

  // Handle loading state during SSR
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#fff'
        }}>
          <div>Loading...</div>
        </div>
      </ProtectedRoute>
    )
  }

  // This should not happen due to ProtectedRoute, but added for safety
  if (!isAuthenticated || !user) {
    return null
  }

  if (isLoadingMatch) {
    return (
      <ProtectedRoute>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#fff'
        }}>
          <div>Loading match...</div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#fff'
        }}>
          <div>Error: {error}</div>
          <button 
            onClick={() => router.push('/lobby')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Back to Lobby
          </button>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <GameLayout 
        isDebugMode={isDebugMode} 
        onDebugModeChange={setIsDebugMode}
        isMapPanelOpen={isMapPanelOpen}
        onMapPanelOpenChange={setIsMapPanelOpen}
      >
        <div>
          <TutorialOverlay enabled={false} gameState={gameState} />

          {/* Game Canvas */}
          <SceneCanvas 
            onGameStateChange={setGameState}
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
    </ProtectedRoute>
  )
}