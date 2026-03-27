import React from 'react'
import styles from './UserStats.module.css'

interface UserStatsProps {
  overallStats?: {
    wins: number
    losses: number
    draws: number
    total: number
    winRate: number
  }
  timeStats?: {
    totalHours: number
    avgTurnTime: number
    fastestWin: number
    longestGame: number
  }
  unitStats?: Array<{
    name: string
    wins: number
    losses: number
    winRate: number
    avgDamage: number
    usageCount: number
  }>
  mapStats?: Array<{
    name: string
    wins: number
    losses: number
    winRate: number
    gamesPlayed: number
  }>
  showDetailedStats?: boolean
}

export const UserStats: React.FC<UserStatsProps> = ({
  overallStats,
  timeStats,
  unitStats,
  mapStats,
  showDetailedStats = false
}) => {
  // Use provided props or fall back to defaults
  const stats = overallStats || {
    wins: 156,
    losses: 89,
    draws: 0,
    total: 245,
    winRate: 64
  }
  const time = timeStats || {
    totalHours: 127,
    avgTurnTime: 45,
    fastestWin: 6,
    longestGame: 35
  }
  const units = unitStats
  const maps = mapStats
  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return '#10b981'
    if (winRate >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getUsageColor = (usageCount: number, totalGames: number) => {
    const usagePercent = (usageCount / totalGames) * 100
    if (usagePercent >= 40) return '#10b981'
    if (usagePercent >= 25) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className={styles.userStats}>
      <div className={styles.statsGrid}>
        {/* Overall Performance */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Overall Performance</h3>
          <div className={styles.overallStats}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Total Matches</span>
              <span className={styles.statValue}>{stats.total}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Wins</span>
              <span className={`${styles.statValue} ${styles.winColor}`}>{stats.wins}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Losses</span>
              <span className={`${styles.statValue} ${styles.lossColor}`}>{stats.losses}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Draws</span>
              <span className={styles.statValue}>{stats.draws}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Win Rate</span>
              <span 
                className={styles.statValue}
                style={{ color: getWinRateColor(stats.winRate) }}
              >
                {stats.winRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Time Statistics */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Time Statistics</h3>
          <div className={styles.timeStats}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Total Hours Played</span>
              <span className={styles.statValue}>{time.totalHours}h</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Average Turn Time</span>
              <span className={styles.statValue}>{time.avgTurnTime}s</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Fastest Win</span>
              <span className={styles.statValue}>{time.fastestWin} turns</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Longest Game</span>
              <span className={styles.statValue}>{time.longestGame} turns</span>
            </div>
          </div>
        </div>

        {/* Unit Performance */}
        {units && units.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Unit Performance</h3>
            <div className={styles.unitStatsList}>
              {units.map((unit, index) => (
                <div key={index} className={styles.unitStatRow}>
                  <div className={styles.unitInfo}>
                    <span className={styles.unitName}>{unit.name}</span>
                    <span className={styles.unitUsage}>
                      Used {unit.usageCount} times ({((unit.usageCount / stats.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className={styles.unitMetrics}>
                    <span 
                      className={styles.unitWinRate}
                      style={{ color: getWinRateColor(unit.winRate) }}
                    >
                      {unit.winRate}% WR
                    </span>
                    <span className={styles.unitDamage}>
                      {unit.avgDamage} avg dmg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Performance */}
        {maps && maps.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Map Performance</h3>
            <div className={styles.mapStatsList}>
              {maps.map((map, index) => (
                <div key={index} className={styles.mapStatRow}>
                  <div className={styles.mapInfo}>
                    <span className={styles.mapName}>{map.name}</span>
                    <span className={styles.mapGames}>
                      {map.gamesPlayed} games
                    </span>
                  </div>
                  <div className={styles.mapMetrics}>
                    <span 
                      className={styles.mapWinRate}
                      style={{ color: getWinRateColor(map.winRate) }}
                    >
                      {map.winRate}% WR
                    </span>
                    <span className={styles.mapRecord}>
                      {map.wins}-{map.losses}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Chart */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Performance</h3>
          <div className={styles.performanceChart}>
            <div className={styles.chartHeader}>
              <span className={styles.chartLabel}>Last 10 Games</span>
              <span className={styles.chartLegend}>
                <span className={styles.legendWin}>Win</span>
                <span className={styles.legendLoss}>Loss</span>
              </span>
            </div>
            <div className={styles.chart}>
              {[1, 0, 1, 1, 0, 1, 1, 1, 0, 1].map((result, index) => (
                <div
                  key={index}
                  className={`${styles.chartBar} ${result === 1 ? styles.winBar : styles.lossBar}`}
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                  title={result === 1 ? 'Win' : 'Loss'}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Summary */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Achievements Summary</h3>
          <div className={styles.achievementsGrid}>
            <div className={styles.achievementItem}>
              <span className={styles.achievementIcon}>🎯</span>
              <div className={styles.achievementInfo}>
                <span className={styles.achievementTitle}>Sharpshooter</span>
                <span className={styles.achievementDesc}>100 headshot kills</span>
              </div>
            </div>
            <div className={styles.achievementItem}>
              <span className={styles.achievementIcon}>🏆</span>
              <div className={styles.achievementInfo}>
                <span className={styles.achievementTitle}>Champion</span>
                <span className={styles.achievementDesc}>Reached top 100</span>
              </div>
            </div>
            <div className={styles.achievementItem}>
              <span className={styles.achievementIcon}>🔥</span>
              <div className={styles.achievementInfo}>
                <span className={styles.achievementTitle}>Streaker</span>
                <span className={styles.achievementDesc}>10 game win streak</span>
              </div>
            </div>
            <div className={styles.achievementItem}>
              <span className={styles.achievementIcon}>🎖️</span>
              <div className={styles.achievementInfo}>
                <span className={styles.achievementTitle}>Veteran</span>
                <span className={styles.achievementDesc}>1000 games played</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserStats