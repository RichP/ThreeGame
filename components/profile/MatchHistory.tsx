import React, { useState } from 'react'
import styles from './MatchHistory.module.css'

interface MatchHistoryProps {
  matches?: Array<{
    id: string
    date: string
    opponent: string
    result: 'win' | 'loss' | 'draw'
    score: string
    map: string
    duration: string
    mode: string
    unitsUsed: string[]
    ratingChange: number
  }>
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  matches = [
    {
      id: '1',
      date: '2024-03-12 14:30',
      opponent: 'TacticalGenius',
      result: 'win',
      score: '15-8',
      map: 'Crossroads',
      duration: '12:45',
      mode: 'Ranked',
      unitsUsed: ['Sniper', 'Bruiser', 'Medic'],
      ratingChange: +25
    },
    {
      id: '2',
      date: '2024-03-12 13:15',
      opponent: 'ShadowWarrior',
      result: 'loss',
      score: '6-15',
      map: 'Forest Ambush',
      duration: '18:22',
      mode: 'Casual',
      unitsUsed: ['Scout', 'Engineer'],
      ratingChange: -15
    },
    {
      id: '3',
      date: '2024-03-11 20:45',
      opponent: 'IronTactician',
      result: 'win',
      score: '15-12',
      map: 'Mountain Pass',
      duration: '22:15',
      mode: 'Ranked',
      unitsUsed: ['Sniper', 'Bruiser', 'Scout', 'Medic'],
      ratingChange: +18
    },
    {
      id: '4',
      date: '2024-03-11 19:30',
      opponent: 'NinjaCommander',
      result: 'win',
      score: '15-4',
      map: 'Cyber City',
      duration: '8:30',
      mode: 'Casual',
      unitsUsed: ['Sniper'],
      ratingChange: +12
    },
    {
      id: '5',
      date: '2024-03-11 18:15',
      opponent: 'StrategicMaster',
      result: 'loss',
      score: '9-15',
      map: 'Desert Outpost',
      duration: '15:40',
      mode: 'Ranked',
      unitsUsed: ['Bruiser', 'Medic', 'Engineer'],
      ratingChange: -22
    }
  ]
}) => {
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'draw'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'duration'>('date')

  const filteredMatches = matches
    .filter(match => filter === 'all' || match.result === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'rating':
          return b.ratingChange - a.ratingChange
        case 'duration':
          return parseDuration(b.duration) - parseDuration(a.duration)
        default:
          return 0
      }
    })

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return '#10b981'
      case 'loss': return '#ef4444'
      case 'draw': return '#f59e0b'
      default: return '#ffffff'
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return '🏆'
      case 'loss': return '💀'
      case 'draw': return '🤝'
      default: return '🎮'
    }
  }

  const parseDuration = (duration: string): number => {
    const [minutes, seconds] = duration.split(':').map(Number)
    return minutes * 60 + seconds
  }

  const formatDuration = (duration: string): string => {
    const [minutes, seconds] = duration.split(':')
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className={styles.matchHistory}>
      {/* Filters and Controls */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Filter:</span>
          <div className={styles.filterButtons}>
            <button 
              className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'win' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilter('win')}
            >
              Wins
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'loss' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilter('loss')}
            >
              Losses
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'draw' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilter('draw')}
            >
              Draws
            </button>
          </div>
        </div>
        
        <div className={styles.sortGroup}>
          <span className={styles.sortLabel}>Sort by:</span>
          <select 
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'rating' | 'duration')}
          >
            <option value="date">Date</option>
            <option value="rating">Rating Change</option>
            <option value="duration">Duration</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.summary}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Matches</span>
          <span className={styles.statValue}>{matches.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Wins</span>
          <span className={`${styles.statValue} ${styles.winColor}`}>
            {matches.filter(m => m.result === 'win').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Losses</span>
          <span className={`${styles.statValue} ${styles.lossColor}`}>
            {matches.filter(m => m.result === 'loss').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Win Rate</span>
          <span className={styles.statValue}>
            {((matches.filter(m => m.result === 'win').length / matches.length) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Match List */}
      <div className={styles.matchList}>
        {filteredMatches.map((match) => (
          <div key={match.id} className={styles.matchItem}>
            <div className={styles.matchHeader}>
              <div className={styles.matchInfo}>
                <span className={styles.matchDate}>{match.date}</span>
                <span className={`${styles.matchResult} ${match.result}`} style={{ color: getResultColor(match.result) }}>
                  {getResultIcon(match.result)} {match.result.toUpperCase()}
                </span>
                <span className={styles.matchScore}>{match.score}</span>
              </div>
              <div className={styles.matchMeta}>
                <span className={styles.matchMode}>{match.mode}</span>
                <span className={styles.matchMap}>{match.map}</span>
                <span className={styles.matchDuration}>{formatDuration(match.duration)}</span>
              </div>
            </div>
            
            <div className={styles.matchDetails}>
              <div className={styles.opponentInfo}>
                <span className={styles.opponentLabel}>Opponent:</span>
                <span className={styles.opponentName}>{match.opponent}</span>
              </div>
              
              <div className={styles.unitsInfo}>
                <span className={styles.unitsLabel}>Units Used:</span>
                <div className={styles.unitsList}>
                  {match.unitsUsed.map((unit, index) => (
                    <span key={index} className={styles.unitTag}>{unit}</span>
                  ))}
                </div>
              </div>
              
              <div className={styles.ratingInfo}>
                <span className={styles.ratingLabel}>Rating Change:</span>
                <span className={`${styles.ratingChange} ${match.ratingChange >= 0 ? styles.positive : styles.negative}`}>
                  {match.ratingChange >= 0 ? '+' : ''}{match.ratingChange}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMatches.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📊</span>
          <span className={styles.emptyText}>No matches found with current filters</span>
        </div>
      )}
    </div>
  )
}

export default MatchHistory