import React from 'react'
import styles from './UserProfile.module.css'

interface UserProfileProps {
  username?: string
  level?: number
  elo?: number
  winRate?: number
  totalMatches?: number
  recentActivity?: string[]
}

export const UserProfile: React.FC<UserProfileProps> = ({
  username = 'StrategicMaster',
  level = 25,
  elo = 1850,
  winRate = 68,
  totalMatches = 245,
  recentActivity = [
    'Won against TacticalGenius in 15 turns',
    'Reached Level 25 milestone',
    'Unlocked Master Tactician achievement',
    'Played 100 matches on Crossroads map'
  ]
}) => {
  return (
    <div className={styles.userProfile}>
      <div className={styles.profileGrid}>
        {/* Personal Info */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Personal Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Username</span>
              <span className={styles.infoValue}>{username}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Level</span>
              <span className={styles.infoValue}>{level}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Member Since</span>
              <span className={styles.infoValue}>January 2024</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Last Online</span>
              <span className={styles.infoValue}>2 hours ago</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Quick Stats</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏆</div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>ELO Rating</span>
                <span className={styles.statValue}>{elo}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎮</div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Matches</span>
                <span className={styles.statValue}>{totalMatches}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📈</div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Win Rate</span>
                <span className={styles.statValue}>{winRate}%</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔥</div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Win Streak</span>
                <span className={styles.statValue}>5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <div className={styles.activityList}>
            {recentActivity.map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <span className={styles.activityIcon}>•</span>
                <span className={styles.activityText}>{activity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Units */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Favorite Units</h3>
          <div className={styles.unitGrid}>
            <div className={styles.unitCard}>
              <div className={styles.unitIcon}>🎯</div>
              <div className={styles.unitInfo}>
                <span className={styles.unitName}>Sniper</span>
                <span className={styles.unitStats}>45 wins • 65% accuracy</span>
              </div>
            </div>
            <div className={styles.unitCard}>
              <div className={styles.unitIcon}>🛡️</div>
              <div className={styles.unitInfo}>
                <span className={styles.unitName}>Bruiser</span>
                <span className={styles.unitStats}>68 wins • 45% accuracy</span>
              </div>
            </div>
            <div className={styles.unitCard}>
              <div className={styles.unitIcon}>⚡</div>
              <div className={styles.unitInfo}>
                <span className={styles.unitName}>Scout</span>
                <span className={styles.unitStats}>32 wins • 78% accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Progress</h3>
          <div className={styles.progressGrid}>
            <div className={styles.progressItem}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Level Progress</span>
                <span className={styles.progressValue}>25 / 100</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '25%' }}></div>
              </div>
            </div>
            <div className={styles.progressItem}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Season Progress</span>
                <span className={styles.progressValue}>68% Complete</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Badges</h3>
          <div className={styles.badgeGrid}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>🎖️</span>
              <span className={styles.badgeName}>Master Tactician</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>🏆</span>
              <span className={styles.badgeName}>1000 ELO</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>🔥</span>
              <span className={styles.badgeName}>Win Streak</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>🎯</span>
              <span className={styles.badgeName}>Sharpshooter</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile