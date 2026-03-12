import React, { useState } from 'react'
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

const mockActiveMatches: ActiveMatch[] = [
  {
    id: 'match1',
    player1: 'StrategicMaster',
    player2: 'TacticalGenius',
    status: 'your-turn',
    map: 'Crossroads',
    turn: 12,
    timeLeft: '18h 23m'
  },
  {
    id: 'match2',
    player1: 'ShadowWarrior',
    player2: 'IronTactician',
    status: 'waiting',
    map: 'Forest Ambush',
    turn: 8,
    timeLeft: '2d 4h 12m'
  },
  {
    id: 'match3',
    player1: 'NinjaCommander',
    player2: 'DragonSlayer',
    status: 'ready',
    map: 'Mountain Pass',
    turn: 15,
    timeLeft: 'Ready to start'
  },
  {
    id: 'match4',
    player1: 'CyberPunk',
    player2: 'MedievalKnight',
    status: 'completed',
    map: 'Cyber City',
    turn: 20,
    winner: 'MedievalKnight'
  }
]

export const ActiveMatches: React.FC = () => {
  const [matches, setMatches] = useState<ActiveMatch[]>(mockActiveMatches)

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
    console.log('Joining match:', matchId)
    // Navigate to match page
  }

  const handleViewMatch = (matchId: string) => {
    console.log('Viewing match:', matchId)
    // Navigate to match page
  }

  const handleCancelMatch = (matchId: string) => {
    console.log('Cancelling match:', matchId)
    setMatches(prev => prev.filter(match => match.id !== matchId))
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