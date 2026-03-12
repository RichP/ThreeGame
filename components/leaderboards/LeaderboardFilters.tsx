import React from 'react'
import styles from './LeaderboardFilters.module.css'

interface LeaderboardFiltersProps {
  timeFilter: 'all' | 'week' | 'month' | 'season'
  regionFilter: string
  divisionFilter: string
  onTimeFilterChange: (filter: 'all' | 'week' | 'month' | 'season') => void
  onRegionFilterChange: (region: string) => void
  onDivisionFilterChange: (division: string) => void
}

export const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({
  timeFilter,
  regionFilter,
  divisionFilter,
  onTimeFilterChange,
  onRegionFilterChange,
  onDivisionFilterChange
}) => {
  const timeFilters = [
    { key: 'all', label: 'All Time', icon: '⏰' },
    { key: 'week', label: 'This Week', icon: '📅' },
    { key: 'month', label: 'This Month', icon: '📆' },
    { key: 'season', label: 'This Season', icon: '🏆' }
  ]

  const regions = [
    { key: 'global', label: 'Global', icon: '🌍' },
    { key: 'na', label: 'North America', icon: '🇺🇸' },
    { key: 'eu', label: 'Europe', icon: '🇪🇺' },
    { key: 'apac', label: 'APAC', icon: '🌏' },
    { key: 'sa', label: 'South America', icon: '🌎' },
    { key: 'af', label: 'Africa', icon: '🗺️' }
  ]

  const divisions = [
    { key: 'all', label: 'All Divisions', icon: '📊' },
    { key: 'bronze', label: 'Bronze', icon: '🥉' },
    { key: 'silver', label: 'Silver', icon: '🥈' },
    { key: 'gold', label: 'Gold', icon: '🥇' },
    { key: 'platinum', label: 'Platinum', icon: '💎' },
    { key: 'diamond', label: 'Diamond', icon: '✨' },
    { key: 'master', label: 'Master', icon: '👑' },
    { key: 'grandmaster', label: 'Grandmaster', icon: '🏆' }
  ]

  return (
    <div className={styles.filters}>
      {/* Time Filter */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Time Period</label>
        <div className={styles.filterButtons}>
          {timeFilters.map((filter) => (
            <button
              key={filter.key}
              className={`${styles.filterButton} ${
                timeFilter === filter.key ? styles.filterActive : ''
              }`}
              onClick={() => onTimeFilterChange(filter.key as any)}
            >
              <span className={styles.filterIcon}>{filter.icon}</span>
              <span className={styles.filterText}>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Region Filter */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Region</label>
        <div className={styles.filterButtons}>
          {regions.map((region) => (
            <button
              key={region.key}
              className={`${styles.filterButton} ${
                regionFilter === region.key ? styles.filterActive : ''
              }`}
              onClick={() => onRegionFilterChange(region.key)}
            >
              <span className={styles.filterIcon}>{region.icon}</span>
              <span className={styles.filterText}>{region.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Division Filter */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Division</label>
        <div className={styles.filterButtons}>
          {divisions.map((division) => (
            <button
              key={division.key}
              className={`${styles.filterButton} ${
                divisionFilter === division.key ? styles.filterActive : ''
              }`}
              onClick={() => onDivisionFilterChange(division.key)}
            >
              <span className={styles.filterIcon}>{division.icon}</span>
              <span className={styles.filterText}>{division.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardFilters