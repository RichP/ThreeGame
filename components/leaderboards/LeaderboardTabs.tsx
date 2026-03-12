import React from 'react'
import styles from './LeaderboardTabs.module.css'

interface LeaderboardTabsProps {
  activeTab: 'global' | 'regional' | 'friends' | 'seasonal'
  onTabChange: (tab: 'global' | 'regional' | 'friends' | 'seasonal') => void
}

export const LeaderboardTabs: React.FC<LeaderboardTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { key: 'global', label: 'Global Rankings', icon: '🌍' },
    { key: 'regional', label: 'Regional', icon: '📍' },
    { key: 'friends', label: 'Friends', icon: '👥' },
    { key: 'seasonal', label: 'Seasonal', icon: '🏆' }
  ]

  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${
            activeTab === tab.key ? styles.tabActive : ''
          }`}
          onClick={() => onTabChange(tab.key as any)}
        >
          <span className={styles.tabIcon}>{tab.icon}</span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

export default LeaderboardTabs