import React, { useState } from 'react'
import MainLayout from '../components/MainLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import styles from './profile.module.css'
import { UserProfile } from '../components/profile/UserProfile'
import { UserStats } from '../components/profile/UserStats'
import { MatchHistory } from '../components/profile/MatchHistory'
import { Achievements } from '../components/profile/Achievements'
import { LeaderboardRanking } from '../components/profile/LeaderboardRanking'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'history' | 'achievements' | 'ranking'>('overview')

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className={styles.profile}>
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                <img src="/api/placeholder/120/120" alt="User Avatar" />
              </div>
              <div className={styles.userInfo}>
                <h1 className={styles.username}>StrategicMaster</h1>
                <div className={styles.userMeta}>
                  <span className={styles.level}>Level 25</span>
                  <span className={styles.rating}>ELO 1850</span>
                  <span className={styles.winRate}>68% Win Rate</span>
                </div>
              </div>
            </div>
            
            <div className={styles.profileActions}>
              <button className={styles.editProfileButton}>Edit Profile</button>
              <button className={styles.settingsButton}>Settings</button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={styles.profileNav}>
            <button 
              className={`${styles.navButton} ${activeTab === 'overview' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'stats' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Statistics
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'history' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Match History
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'achievements' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'ranking' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveTab('ranking')}
            >
              Ranking
            </button>
          </div>

          {/* Content Area */}
          <div className={styles.profileContent}>
            {activeTab === 'overview' && (
              <div className={styles.tabContent}>
                <UserProfile />
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div className={styles.tabContent}>
                <UserStats />
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className={styles.tabContent}>
                <MatchHistory />
              </div>
            )}
            
            {activeTab === 'achievements' && (
              <div className={styles.tabContent}>
                <Achievements />
              </div>
            )}
            
            {activeTab === 'ranking' && (
              <div className={styles.tabContent}>
                <LeaderboardRanking />
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}