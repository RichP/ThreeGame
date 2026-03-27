import React, { useState, useEffect } from 'react'
import MainLayout from '../components/MainLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import styles from './profile.module.css'
import { UserProfile } from '../components/profile/UserProfile'
import { UserStats } from '../components/profile/UserStats'
import { MatchHistory } from '../components/profile/MatchHistory'
import { Achievements } from '../components/profile/Achievements'
import { LeaderboardRanking } from '../components/profile/LeaderboardRanking'
import { communityApi, userApi } from '../services/api'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'history' | 'achievements' | 'ranking'>('overview')
  const [playerStats, setPlayerStats] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      // Check if user is authenticated before making API calls
      const token = localStorage.getItem('authToken')
      if (!token) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Fetch profile
        const profileResponse = await userApi.getProfile()
        if (profileResponse.success && profileResponse.data) {
          setProfileData(profileResponse.data)
        }

        // Fetch player stats
        const statsResponse = await communityApi.getPlayerStats(1) // Using default user ID for now
        if (statsResponse.success && statsResponse.data) {
          setPlayerStats(statsResponse.data)
        }
      } catch (err: any) {
        // Only log errors if user is authenticated (token exists)
        if (localStorage.getItem('authToken')) {
          console.error('Failed to fetch profile data:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className={styles.profile}>
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                <img src={profileData?.avatar || "/api/placeholder/120/120"} alt="User Avatar" />
              </div>
              <div className={styles.userInfo}>
                <h1 className={styles.username}>{profileData?.username || 'Player'}</h1>
                <div className={styles.userMeta}>
                  <span className={styles.level}>Level {profileData?.level || 1}</span>
                  <span className={styles.rating}>ELO {playerStats?.rank?.mmr || profileData?.rating || 1500}</span>
                  <span className={styles.winRate}>
                    {playerStats?.winRate?.toFixed(1) || '50'}% Win Rate
                  </span>
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
                <UserStats 
                  overallStats={playerStats ? {
                    wins: playerStats.gamesWon || 0,
                    losses: playerStats.gamesLost || 0,
                    draws: 0,
                    total: playerStats.gamesPlayed || 0,
                    winRate: playerStats.winRate || 0
                  } : undefined}
                  timeStats={playerStats ? {
                    totalHours: Math.round(playerStats.hoursPlayed || 0),
                    avgTurnTime: 45,
                    fastestWin: 6,
                    longestGame: 35
                  } : undefined}
                />
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