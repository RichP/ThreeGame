import React from 'react'
import styles from './LeaderboardPreview.module.css'

interface LeaderboardEntry {
  rank: number
  username: string
  rating: number
  division: string
  country?: string
}

interface LeaderboardPreviewProps {
  topPlayers: LeaderboardEntry[]
  onViewAll: () => void
}

export const LeaderboardPreview: React.FC<LeaderboardPreviewProps> = ({
  topPlayers,
  onViewAll
}) => {
  const getDivisionColor = (division: string) => {
    switch (division) {
      case 'Bronze': return '#f59e0b'
      case 'Silver': return '#9ca3af'
      case 'Gold': return '#eab308'
      case 'Platinum': return '#22c55e'
      case 'Diamond': return '#3b82f6'
      case 'Master': return '#a78bfa'
      case 'Grandmaster': return '#ef4444'
      default: return '#ffffff'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  return (
    <div className={styles.leaderboardPreview}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>Top Players</h3>
        <button className={styles.viewAllButton} onClick={onViewAll}>
          View Full Leaderboard →
        </button>
      </div>
      
      <div className={styles.leaderboardGrid}>
        {topPlayers.map((player, index) => (
          <div key={player.rank} className={`${styles.playerCard} ${index < 3 ? styles.topPlayer : ''}`}>
            <div className={styles.rankSection}>
              <span className={styles.rankIcon}>{getRankIcon(player.rank)}</span>
              {player.country && (
                <span className={styles.countryFlag} title={player.country}>
                  {getCountryFlag(player.country)}
                </span>
              )}
            </div>
            
            <div className={styles.playerInfo}>
              <span className={styles.username}>{player.username}</span>
              <div className={styles.playerStats}>
                <span 
                  className={styles.divisionBadge}
                  style={{ color: getDivisionColor(player.division) }}
                >
                  {player.division}
                </span>
                <span className={styles.rating}>Rating: {player.rating}</span>
              </div>
            </div>
            
            <div className={styles.playerActions}>
              <button className={styles.challengeButton}>Challenge</button>
              <button className={styles.friendButton}>Add Friend</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.previewFooter}>
        <div className={styles.statsSummary}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Global Players</span>
            <span className={styles.statValue}>15,420</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Your Rank</span>
            <span className={styles.statValue}>#1,234</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Division</span>
            <span className={styles.statValue}>Platinum</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get country flags
const getCountryFlag = (country: string) => {
  const flagMap: Record<string, string> = {
    'US': '🇺🇸', 'UK': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
    'JP': '🇯🇵', 'KR': '🇰🇷', 'BR': '🇧🇷', 'RU': '🇷🇺',
    'AU': '🇦🇺', 'CA': '🇨🇦', 'CN': '🇨🇳', 'IN': '🇮🇳'
  }
  return flagMap[country] || '🌐'
}

export default LeaderboardPreview