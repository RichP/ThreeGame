import React from 'react'
import styles from './RecentActivity.module.css'

interface ActivityItem {
  id: string
  type: 'match' | 'achievement' | 'friend' | 'tournament'
  title: string
  description: string
  time: string
  icon: string
  color: string
}

const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'match',
    title: 'StrategicMaster defeated TacticalGenius',
    description: 'Won in 15 turns on Crossroads map',
    time: '2 minutes ago',
    icon: '🏆',
    color: '#10b981'
  },
  {
    id: '2',
    type: 'achievement',
    title: 'ShadowWarrior unlocked "Master Tactician"',
    description: 'Reached 1000 ELO rating',
    time: '15 minutes ago',
    icon: '🎖️',
    color: '#f59e0b'
  },
  {
    id: '3',
    type: 'friend',
    title: 'IronTactician sent you a friend request',
    description: 'Accept to play together',
    time: '32 minutes ago',
    icon: '👥',
    color: '#3b82f6'
  },
  {
    id: '4',
    type: 'tournament',
    title: 'New tournament starting soon',
    description: 'Spring Championship - 500 players',
    time: '1 hour ago',
    icon: '🎯',
    color: '#8b5cf6'
  },
  {
    id: '5',
    type: 'match',
    title: 'NinjaCommander vs DragonSlayer',
    description: 'Match started on Mountain Pass',
    time: '2 hours ago',
    icon: '⚔️',
    color: '#ef4444'
  }
]

export const RecentActivity: React.FC = () => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match': return '🎮'
      case 'achievement': return '🏆'
      case 'friend': return '👥'
      case 'tournament': return '🎯'
      default: return '📢'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'match': return '#10b981'
      case 'achievement': return '#f59e0b'
      case 'friend': return '#3b82f6'
      case 'tournament': return '#8b5cf6'
      default: return '#6b7280'
    }
  }

  return (
    <div className={styles.recentActivity}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Activity</h3>
        <span className={styles.activityCount}>{mockActivity.length} items</span>
      </div>
      
      <div className={styles.activityList}>
        {mockActivity.map((item) => (
          <div key={item.id} className={styles.activityItem}>
            <div className={styles.activityIcon} style={{ backgroundColor: item.color }}>
              {item.icon}
            </div>
            <div className={styles.activityContent}>
              <h4 className={styles.activityTitle}>{item.title}</h4>
              <p className={styles.activityDescription}>{item.description}</p>
              <span className={styles.activityTime}>{item.time}</span>
            </div>
            <div className={styles.activityActions}>
              {item.type === 'friend' && (
                <button className={styles.acceptButton}>Accept</button>
              )}
              {item.type === 'match' && (
                <button className={styles.viewButton}>View</button>
              )}
              {item.type === 'tournament' && (
                <button className={styles.joinButton}>Join</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.activityFooter}>
        <button className={styles.viewAllButton}>View All Activity</button>
      </div>
    </div>
  )
}

export default RecentActivity