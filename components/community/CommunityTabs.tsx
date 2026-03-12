import React from 'react'
import styles from './CommunityTabs.module.css'

interface CommunityTabsProps {
  activeTab: 'leaderboards' | 'friends' | 'search'
  onTabChange: (tab: 'leaderboards' | 'friends' | 'search') => void
}

export const CommunityTabs: React.FC<CommunityTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { key: 'leaderboards', label: 'Leaderboards', icon: '🏆' },
    { key: 'friends', label: 'Friends', icon: '👥' },
    { key: 'search', label: 'Player Search', icon: '🔍' }
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

export default CommunityTabs