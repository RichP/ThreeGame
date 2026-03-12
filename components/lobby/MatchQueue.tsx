import React, { useState, useEffect } from 'react'
import styles from './MatchQueue.module.css'

interface QueueEntry {
  id: string
  username: string
  rating: number
  timeInQueue: string
  mode: 'ranked' | 'casual' | 'ai'
  mapPreference: string
}

const mockQueue: QueueEntry[] = [
  {
    id: '1',
    username: 'StrategicMaster',
    rating: 1850,
    timeInQueue: '2m 15s',
    mode: 'ranked',
    mapPreference: 'Any'
  },
  {
    id: '2',
    username: 'TacticalGenius',
    rating: 1720,
    timeInQueue: '1m 42s',
    mode: 'ranked',
    mapPreference: 'Crossroads'
  },
  {
    id: '3',
    username: 'ShadowWarrior',
    rating: 1680,
    timeInQueue: '3m 08s',
    mode: 'casual',
    mapPreference: 'Forest'
  },
  {
    id: '4',
    username: 'IronTactician',
    rating: 1940,
    timeInQueue: '45s',
    mode: 'ranked',
    mapPreference: 'Any'
  },
  {
    id: '5',
    username: 'NinjaCommander',
    rating: 1560,
    timeInQueue: '5m 22s',
    mode: 'casual',
    mapPreference: 'Mountain'
  }
]

export const MatchQueue: React.FC = () => {
  const [queue, setQueue] = useState<QueueEntry[]>(mockQueue)
  const [isSearching, setIsSearching] = useState(false)
  const [searchProgress, setSearchProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSearching) {
      interval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 100) {
            // Simulate match found
            setIsSearching(false)
            setSearchProgress(0)
            return 0
          }
          return prev + 1
        })
      }, 50)
    }
    return () => clearInterval(interval)
  }, [isSearching])

  const startSearch = () => {
    setIsSearching(true)
    setSearchProgress(0)
  }

  const cancelSearch = () => {
    setIsSearching(false)
    setSearchProgress(0)
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'ranked': return '#f59e0b'
      case 'casual': return '#10b981'
      case 'ai': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'ranked': return '🏆'
      case 'casual': return '🎯'
      case 'ai': return '🤖'
      default: return '🎮'
    }
  }

  return (
    <div className={styles.matchQueue}>
      <div className={styles.header}>
        <h3 className={styles.title}>Match Queue</h3>
        <span className={styles.queueCount}>{queue.length} players waiting</span>
      </div>

      {/* Search Controls */}
      <div className={styles.searchControls}>
        {!isSearching ? (
          <button className={styles.searchButton} onClick={startSearch}>
            <span className={styles.searchIcon}>🔍</span>
            <span className={styles.searchText}>Start Search</span>
          </button>
        ) : (
          <button className={styles.cancelButton} onClick={cancelSearch}>
            <span className={styles.cancelIcon}>❌</span>
            <span className={styles.cancelText}>Cancel Search</span>
          </button>
        )}
      </div>

      {/* Search Progress */}
      {isSearching && (
        <div className={styles.searchProgress}>
          <div className={styles.progressInfo}>
            <span className={styles.progressLabel}>Finding Match</span>
            <span className={styles.progressPercent}>{searchProgress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${searchProgress}%` }}
            ></div>
          </div>
          <div className={styles.progressEstimate}>
            Estimated wait time: 2-5 minutes
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className={styles.queueList}>
        <div className={styles.queueHeader}>
          <span className={styles.headerItem}>Player</span>
          <span className={styles.headerItem}>Rating</span>
          <span className={styles.headerItem}>Mode</span>
          <span className={styles.headerItem}>Map</span>
          <span className={styles.headerItem}>Time</span>
        </div>
        
        {queue.map((entry) => (
          <div key={entry.id} className={styles.queueItem}>
            <div className={styles.playerInfo}>
              <span className={styles.username}>{entry.username}</span>
            </div>
            <div className={styles.ratingInfo}>
              <span className={styles.rating}>{entry.rating}</span>
            </div>
            <div className={styles.modeInfo}>
              <span 
                className={styles.modeBadge}
                style={{ backgroundColor: getModeColor(entry.mode) }}
              >
                {getModeIcon(entry.mode)} {entry.mode}
              </span>
            </div>
            <div className={styles.mapInfo}>
              <span className={styles.mapTag}>{entry.mapPreference}</span>
            </div>
            <div className={styles.timeInfo}>
              <span className={styles.time}>{entry.timeInQueue}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Queue Stats */}
      <div className={styles.queueStats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Average Wait Time</span>
          <span className={styles.statValue}>3 minutes</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Active Players</span>
          <span className={styles.statValue}>1,234</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Matches/Hour</span>
          <span className={styles.statValue}>156</span>
        </div>
      </div>
    </div>
  )
}

export default MatchQueue