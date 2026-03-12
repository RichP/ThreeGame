import React from 'react'
import styles from './LeaderboardTable.module.css'

interface LeaderboardEntry {
  rank: number
  username: string
  wins: number
  losses: number
  winRate: number
  rating: number
  gamesPlayed: number
  lastActive: string
  avatar?: string
  country?: string
  division?: string
  seasonPoints?: number
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[]
  loading: boolean
  activeTab: 'global' | 'regional' | 'friends' | 'seasonal'
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  data,
  loading,
  activeTab
}) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#f59e0b' // Gold
      case 2: return '#9ca3af' // Silver
      case 3: return '#f97316' // Bronze
      default: return '#ffffff'
    }
  }

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

  const formatWinRate = (winRate: number) => {
    return `${winRate}%`
  }

  const formatRating = (rating: number) => {
    return rating.toLocaleString()
  }

  const formatGamesPlayed = (games: number) => {
    return games.toLocaleString()
  }

  if (loading) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <span className={styles.loadingText}>Loading leaderboard data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h3 className={styles.tableTitle}>
          {activeTab === 'global' && 'Global Rankings'}
          {activeTab === 'regional' && 'Regional Leaderboard'}
          {activeTab === 'friends' && 'Friends Leaderboard'}
          {activeTab === 'seasonal' && 'Seasonal Rankings'}
        </h3>
        <div className={styles.tableActions}>
          <button className={styles.exportButton}>Export CSV</button>
          <button className={styles.refreshButton}>Refresh</button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.leaderboardTable}>
          <thead>
            <tr>
              <th className={styles.rankColumn}>Rank</th>
              <th className={styles.playerColumn}>Player</th>
              <th className={styles.ratingColumn}>Rating</th>
              <th className={styles.winRateColumn}>Win Rate</th>
              <th className={styles.gamesColumn}>Games</th>
              <th className={styles.divisionColumn}>Division</th>
              {activeTab === 'seasonal' && (
                <th className={styles.seasonColumn}>Season Points</th>
              )}
              <th className={styles.lastActiveColumn}>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {data.map((player, index) => (
              <tr key={player.rank} className={`${styles.tableRow} ${index < 3 ? styles.topThree : ''}`}>
                <td className={styles.rankCell}>
                  <span 
                    className={styles.rankNumber}
                    style={{ color: getRankColor(player.rank) }}
                  >
                    #{player.rank}
                  </span>
                  {index < 3 && (
                    <span className={styles.rankIcon}>
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                    </span>
                  )}
                </td>
                
                <td className={styles.playerCell}>
                  <div className={styles.playerInfo}>
                    <div className={styles.avatarContainer}>
                      <img 
                        src={player.avatar || '/api/placeholder/32/32'} 
                        alt={player.username}
                        className={styles.playerAvatar}
                      />
                      {player.country && (
                        <span className={styles.countryFlag} title={player.country}>
                          {getCountryFlag(player.country)}
                        </span>
                      )}
                    </div>
                    <div className={styles.playerDetails}>
                      <span className={styles.username}>{player.username}</span>
                      <span className={styles.winsLosses}>
                        {player.wins}W {player.losses}L
                      </span>
                    </div>
                  </div>
                </td>
                
                <td className={styles.ratingCell}>
                  <span className={styles.ratingValue}>{formatRating(player.rating)}</span>
                </td>
                
                <td className={styles.winRateCell}>
                  <span 
                    className={`${styles.winRateValue} ${
                      player.winRate >= 60 ? styles.highWinRate : 
                      player.winRate >= 50 ? styles.mediumWinRate : styles.lowWinRate
                    }`}
                  >
                    {formatWinRate(player.winRate)}
                  </span>
                </td>
                
                <td className={styles.gamesCell}>
                  <span className={styles.gamesValue}>{formatGamesPlayed(player.gamesPlayed)}</span>
                </td>
                
                <td className={styles.divisionCell}>
                  <span 
                    className={styles.divisionBadge}
                    style={{ color: getDivisionColor(player.division || 'Unknown') }}
                  >
                    {player.division || 'Unknown'}
                  </span>
                </td>
                
                {activeTab === 'seasonal' && (
                  <td className={styles.seasonCell}>
                    <span className={styles.seasonPoints}>{player.seasonPoints || 0}</span>
                  </td>
                )}
                
                <td className={styles.lastActiveCell}>
                  <span className={styles.lastActiveValue}>{player.lastActive}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.tableFooter}>
        <div className={styles.pagination}>
          <button className={styles.pageButton} disabled>Previous</button>
          <span className={styles.pageInfo}>Page 1 of 10</span>
          <button className={styles.pageButton}>Next</button>
        </div>
        <div className={styles.tableInfo}>
          Showing {data.length} of {data.length} players
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

export default LeaderboardTable