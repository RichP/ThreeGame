import React, { useState, useEffect } from 'react'
import { communityApi } from '../../services/api'
import styles from './LeaderboardRanking.module.css'

interface LeaderboardEntry {
  rank: number
  username: string
  elo: number
  wins: number
  losses: number
  winRate: number
  country?: string
  avatar?: string
  isCurrentUser?: boolean
}

export const LeaderboardRanking: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('weekly')
  const [gameMode, setGameMode] = useState<'ranked' | 'casual' | 'all'>('ranked')
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [playerPosition, setPlayerPosition] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true)
      try {
        const response = await communityApi.getLeaderboard({ limit: 10 })
        if (response.success && response.data) {
          const transformedData: LeaderboardEntry[] = response.data.entries.map((entry: any) => ({
            rank: entry.rank,
            username: entry.user.username,
            elo: entry.mmr || entry.points,
            wins: entry.wins,
            losses: entry.losses,
            winRate: entry.winRate,
            country: 'US',
            isCurrentUser: false
          }))
          setLeaderboardData(transformedData)
        }

        // Fetch player position
        const positionResponse = await communityApi.getPlayerPosition(1)
        if (positionResponse.success && positionResponse.data) {
          setPlayerPosition(positionResponse.data.position)
        }
      } catch (err: any) {
        console.error('Failed to fetch leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboardData()
  }, [gameMode, timeframe])

  const filteredData = leaderboardData.filter(entry => 
    gameMode === 'all' || (gameMode === 'ranked' && entry.elo >= 1500) || (gameMode === 'casual' && entry.elo < 1500)
  )

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#f59e0b'
      case 2: return '#64748b'
      case 3: return '#b45309'
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

  const getCountryFlag = (country?: string) => {
    if (!country) return ''
    const codePoints = country.split('').map(char => 
      127397 + char.charCodeAt(0)
    )
    return String.fromCodePoint(...codePoints)
  }

  return (
    <div className={styles.leaderboardRanking}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Timeframe:</span>
          <div className={styles.filterButtons}>
            <button 
              className={`${styles.filterButton} ${timeframe === 'daily' ? styles.filterButtonActive : ''}`}
              onClick={() => setTimeframe('daily')}
            >
              Daily
            </button>
            <button 
              className={`${styles.filterButton} ${timeframe === 'weekly' ? styles.filterButtonActive : ''}`}
              onClick={() => setTimeframe('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`${styles.filterButton} ${timeframe === 'monthly' ? styles.filterButtonActive : ''}`}
              onClick={() => setTimeframe('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`${styles.filterButton} ${timeframe === 'alltime' ? styles.filterButtonActive : ''}`}
              onClick={() => setTimeframe('alltime')}
            >
              All Time
            </button>
          </div>
        </div>
        
        <div className={styles.sortGroup}>
          <span className={styles.sortLabel}>Game Mode:</span>
          <select 
            className={styles.sortSelect}
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value as 'ranked' | 'casual' | 'all')}
          >
            <option value="all">All Modes</option>
            <option value="ranked">Ranked</option>
            <option value="casual">Casual</option>
          </select>
        </div>
      </div>

      {/* Your Ranking */}
      <div className={styles.yourRanking}>
        <h3 className={styles.sectionTitle}>Your Current Ranking</h3>
        <div className={styles.currentRank}>
          <div className={styles.rankInfo}>
            <span className={styles.rankLabel}>Global Rank</span>
            <span className={styles.rankValue}>#{playerPosition || '-'}</span>
          </div>
          <div className={styles.eloInfo}>
            <span className={styles.eloLabel}>ELO Rating</span>
            <span className={styles.eloValue}>1850</span>
          </div>
          <div className={styles.winInfo}>
            <span className={styles.winLabel}>Win Rate</span>
            <span className={styles.winValue}>64%</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className={styles.leaderboardTable}>
        <div className={styles.tableHeader}>
          <span className={styles.headerCell}>Rank</span>
          <span className={styles.headerCell}>Player</span>
          <span className={styles.headerCell}>ELO</span>
          <span className={styles.headerCell}>Record</span>
          <span className={styles.headerCell}>Win Rate</span>
        </div>
        
        <div className={styles.tableBody}>
          {filteredData.map((player) => (
            <div 
              key={player.rank} 
              className={`${styles.tableRow} ${player.isCurrentUser ? styles.currentUserRow : ''}`}
            >
              <div className={styles.cell}>
                <span 
                  className={styles.rankDisplay}
                  style={{ color: getRankColor(player.rank) }}
                >
                  {getRankIcon(player.rank)}
                </span>
              </div>
              
              <div className={styles.cell}>
                <div className={styles.playerInfo}>
                  <div className={styles.playerAvatar}>
                    {player.avatar || '👤'}
                  </div>
                  <div className={styles.playerDetails}>
                    <span className={styles.playerName}>{player.username}</span>
                    {player.country && (
                      <span className={styles.playerCountry}>
                        {getCountryFlag(player.country)} {player.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={styles.cell}>
                <span className={styles.eloDisplay}>{player.elo}</span>
              </div>
              
              <div className={styles.cell}>
                <span className={styles.recordDisplay}>
                  {player.wins}-{player.losses}
                </span>
              </div>
              
              <div className={styles.cell}>
                <span 
                  className={styles.winRateDisplay}
                  style={{ color: player.winRate >= 70 ? '#10b981' : player.winRate >= 60 ? '#f59e0b' : '#ef4444' }}
                >
                  {player.winRate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Chart */}
      <div className={styles.progressChart}>
        <h3 className={styles.sectionTitle}>ELO Progress</h3>
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <span className={styles.chartLabel}>Last 30 Days</span>
            <span className={styles.chartChange}>+150 ELO</span>
          </div>
          <div className={styles.chart}>
            {[1700, 1720, 1680, 1750, 1780, 1820, 1850, 1830, 1860, 1890, 1850, 1870, 1900, 1920, 1880, 1850, 1870, 1900, 1930, 1950, 1920, 1890, 1860, 1880, 1910, 1940, 1920, 1890, 1860, 1850].map((value, index) => (
              <div
                key={index}
                className={styles.chartBar}
                style={{ 
                  height: `${((value - 1600) / 400) * 100}%`,
                  background: index === 29 ? '#8aa0ff' : '#3b82f6'
                }}
                title={`${value} ELO`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardRanking