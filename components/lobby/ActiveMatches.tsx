import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { matchApi } from '../../services/api'
import styles from './ActiveMatches.module.css'

interface ActiveMatch {
  id: string
  player1: string
  player2: string
  status: 'your-turn' | 'waiting' | 'ready' | 'completed'
  map: string
  turn: number
  timeLeft?: string
  winner?: string
}

export const ActiveMatches: React.FC = () => {
  const router = useRouter()
  const [matches, setMatches] = useState<ActiveMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActiveMatches()
  }, [])

  const fetchActiveMatches = async () => {
    try {
      setIsLoading(true)
      const response = await matchApi.getActiveMatches()
      if (response.success && response.data) {
        // Transform the API response to match our ActiveMatch interface
        const transformedMatches: ActiveMatch[] = response.data.matches.map((match: any) => {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
          const isPlayer1 = match.participants?.[0]?.userId === currentUser.id
          const opponent = isPlayer1 ? match.participants?.[1] : match.participants?.[0]
          
          // Determine status based on match state
          let status: 'your-turn' | 'waiting' | 'ready' | 'completed' = 'waiting'
          if (match.status === 'completed') {
            status = 'completed'
          } else if (match.currentPlayerId === (isPlayer1 ? 1 : 2)) {
            status = 'your-turn'
          } else if (match.status === 'waiting') {
            status = 'ready'
          }
          
          return {
            id: match.id.toString(),
            player1: isPlayer1 ? currentUser.username : (opponent?.user?.username || 'Opponent'),
            player2: isPlayer1 ? (opponent?.user?.username || 'Opponent') : currentUser.username,
            status,
            map: match.settings?.map || 'Random',
            turn: match.turnNumber || 0,
            timeLeft: undefined, // Backend doesn't provide this yet
            winner: match.winnerId ? (match.winnerId === currentUser.id ? 'You' : 'Opponent') : undefined
          }
        })
        setMatches(transformedMatches)
      }
    } catch (error) {
      console.error('Error fetching active matches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'your-turn': return '#10b981'
      case 'waiting': return '#f59e0b'
      case 'ready': return '#3b82f6'
      case 'completed': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'your-turn': return 'Your Turn'
      case 'waiting': return 'Waiting'
      case 'ready': return 'Ready'
      case 'completed': return 'Completed'
      default: return status
    }
  }

  const handleJoinMatch = (matchId: string) => {
    router.push(`/match/${matchId}`)
  }

  const handleViewMatch = (matchId: string) => {
    router.push(`/match/${matchId}`)
  }

  const handleCancelMatch = async (matchId: string) => {
    try {
      // Note: This would need a cancelMatch endpoint in the API
      // For now, we'll just remove from local state
      setMatches(prev => prev.filter(match => match.id !== matchId))
    } catch (error) {
      console.error('Error cancelling match:', error)
    }
  }

  return (
    <div className={styles.activeMatches}>
      <div className={styles.header}>
        <h3 className={styles.title}>Active Matches</h3>
        <span className={styles.matchCount}>{matches.length} matches</span>
      </div>
      
      <div className={styles.matchesList}>
        {matches.map((match) => (
          <div key={match.id} className={styles.matchCard}>
            <div className={styles.matchHeader}>
              <div className={styles.players}>
                <span className={styles.playerName}>{match.player1}</span>
                <span className={styles.vs}>vs</span>
                <span className={styles.playerName}>{match.player2}</span>
              </div>
              <div className={styles.matchInfo}>
                <span className={styles.mapTag}>{match.map}</span>
                <span className={styles.turnInfo}>Turn {match.turn}</span>
              </div>
            </div>

            <div className={styles.matchStatus}>
              <span 
                className={styles.statusBadge}
                style={{ backgroundColor: getStatusColor(match.status) }}
              >
                {getStatusText(match.status)}
              </span>
              {match.timeLeft && (
                <span className={styles.timeLeft}>{match.timeLeft}</span>
              )}
              {match.winner && (
                <span className={styles.winner}>Winner: {match.winner}</span>
              )}
            </div>

            <div className={styles.matchActions}>
              {match.status === 'your-turn' && (
                <button 
                  className={styles.actionButton}
                  onClick={() => handleJoinMatch(match.id)}
                >
                  Join Match
                </button>
              )}
              {match.status === 'waiting' && (
                <button 
                  className={styles.actionButton}
                  onClick={() => handleViewMatch(match.id)}
                >
                  View Match
                </button>
              )}
              {match.status === 'ready' && (
                <button 
                  className={styles.actionButton}
                  onClick={() => handleJoinMatch(match.id)}
                >
                  Start Match
                </button>
              )}
              {match.status === 'completed' && (
                <button 
                  className={styles.actionButton}
                  onClick={() => handleViewMatch(match.id)}
                >
                  View Replay
                </button>
              )}
              {match.status !== 'completed' && (
                <button 
                  className={styles.cancelButton}
                  onClick={() => handleCancelMatch(match.id)}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎮</div>
          <h4 className={styles.emptyTitle}>No Active Matches</h4>
          <p className={styles.emptyDesc}>Start a new match to see it here</p>
        </div>
      )}
    </div>
  )
}

export default ActiveMatches