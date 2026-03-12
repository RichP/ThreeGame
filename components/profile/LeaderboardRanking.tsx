import React, { useState } from 'react'
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

  const leaderboardData: LeaderboardEntry[] = [
    {
      rank: 1,
      username: 'GrandMaster',
      elo: 2450,
      wins: 342,
      losses: 89,
      winRate: 79,
      country: 'US',
      isCurrentUser: false
    },
    {
      rank: 2,
      username: 'TacticalGenius',
      elo: 2380,
      wins: 567,
      losses: 156,
      winRate: 79,
      country: 'DE',
      isCurrentUser: false
    },
    {
      rank: 3,
      username: 'ShadowWarrior',
      elo: 2320,
      wins: 423,
      losses: 134,
      winRate: 76,
      country: 'JP',
      isCurrentUser: false
    },
    {
      rank: 4,
      username: 'IronTactician',
      elo: 2280,
      wins: 678,
      losses: 234,
      winRate: 74,
      country: 'FR',
      isCurrentUser: false
    },
    {
      rank: 5,
      username: 'NinjaCommander',
      elo: 2240,
      wins: 345,
      losses: 123,
      winRate: 74,
      country: 'BR',
      isCurrentUser: false
    },
    {
      rank: 6,
      username: 'StrategicMaster',
      elo: 1850,
      wins: 156,
      losses: 89,
      winRate: 64,
      country: 'GB',
      isCurrentUser: true
    },
    {
      rank: 7,
      username: 'BattleLord',
      elo: 2180,
      wins: 456,
      losses: 178,
      winRate: 72,
      country: 'RU',
      isCurrentUser: false
    },
    {
      rank: 8,
      username: 'WarTactician',
      elo: 2150,
      wins: 234,
      losses: 98,
      winRate: 70,
      country: 'AU',
      isCurrentUser: false
    },
    {
      rank: 9,
      username: 'MasterStrategist',
      elo: 2120,
      wins: 789,
      losses: 345,
      winRate: 69,
      country: 'CA',
      isCurrentUser: false
    },
    {
      rank: 10,
      username: 'EliteCommander',
      elo: 2090,
      wins: 123,
      losses: 56,
      winRate: 69,
      country: 'KR',
      isCurrentUser: false
    }
  ]

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
            <span className={styles.rankValue}>#6</span>
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