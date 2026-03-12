import React from 'react'
import styles from './LeaderboardStats.module.css'

interface LeaderboardStatsProps {
  stats: {
    totalPlayers: number
    averageRating: number
    topPlayer: string
    mostPlayedMap: string
    averageGameLength: string
  }
}

export const LeaderboardStats: React.FC<LeaderboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Players',
      value: stats.totalPlayers.toLocaleString(),
      icon: '👥',
      color: '#8aa0ff'
    },
    {
      label: 'Average Rating',
      value: stats.averageRating,
      icon: '📊',
      color: '#a78bfa'
    },
    {
      label: 'Top Player',
      value: stats.topPlayer,
      icon: '👑',
      color: '#f59e0b'
    },
    {
      label: 'Most Played Map',
      value: stats.mostPlayedMap,
      icon: '🗺️',
      color: '#10b981'
    },
    {
      label: 'Avg Game Length',
      value: stats.averageGameLength,
      icon: '⏱️',
      color: '#ef4444'
    }
  ]

  return (
    <div className={styles.stats}>
      <div className={styles.statsHeader}>
        <h3 className={styles.statsTitle}>Global Statistics</h3>
        <p className={styles.statsSubtitle}>
          Real-time data from competitive matches worldwide
        </p>
      </div>
      
      <div className={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.statsFooter}>
        <div className={styles.statTrend}>
          <span className={styles.trendLabel}>Rating Distribution</span>
          <div className={styles.trendChart}>
            <div className={styles.trendBar}>
              <div className={styles.trendSegment} style={{ width: '35%', backgroundColor: '#ef4444' }}></div>
              <div className={styles.trendSegment} style={{ width: '25%', backgroundColor: '#f59e0b' }}></div>
              <div className={styles.trendSegment} style={{ width: '20%', backgroundColor: '#10b981' }}></div>
              <div className={styles.trendSegment} style={{ width: '15%', backgroundColor: '#8aa0ff' }}></div>
              <div className={styles.trendSegment} style={{ width: '5%', backgroundColor: '#a78bfa' }}></div>
            </div>
            <div className={styles.trendLegend}>
              <span>Bronze</span>
              <span>Silver</span>
              <span>Gold</span>
              <span>Platinum</span>
              <span>Diamond+</span>
            </div>
          </div>
        </div>
        
        <div className={styles.statActivity}>
          <span className={styles.activityLabel}>Active Players</span>
          <div className={styles.activityIndicator}>
            <span className={styles.activityDot}></span>
            <span className={styles.activityCount}>1,234 online</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardStats