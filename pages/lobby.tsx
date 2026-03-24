import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../components/auth/AuthContext'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import styles from './lobby.module.css'

interface MatchQueueData {
  status: 'waiting' | 'finding' | 'found'
  estimatedWaitTime?: number
  opponents?: any[]
}

export default function LobbyPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [queueData, setQueueData] = useState<MatchQueueData>({ status: 'waiting' })
  const [isFindingMatch, setIsFindingMatch] = useState(false)

  const handleFindMatch = async (mode: string = 'ranked') => {
    try {
      setIsFindingMatch(true)
      setQueueData({ status: 'finding', estimatedWaitTime: 30 })

      // Simulate match finding process
      const response = await fetch('/api/matches/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ mode }),
      })

      const data = await response.json()

      if (response.ok) {
        setQueueData({ 
          status: 'found', 
          opponents: data.opponents 
        })
        
        // Redirect to match page after a short delay
        setTimeout(() => {
          router.push(`/match/${data.matchId}`)
        }, 2000)
      } else {
        throw new Error(data.error || 'Failed to find match')
      }
    } catch (error) {
      console.error('Match finding error:', error)
      setQueueData({ status: 'waiting' })
    } finally {
      setIsFindingMatch(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Handle loading state during SSR
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className={styles.lobby}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading lobby...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // This should not happen due to ProtectedRoute, but added for safety
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className={styles.lobby}>
          <div className={styles.lobbyHeader}>
            <h1 className={styles.title}>ThreeGame Lobby</h1>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.userDetails}>
                <h2>{user.username}</h2>
                <p className={styles.email}>{user.email}</p>
                <div className={styles.stats}>
                  <span className={styles.stat}>Level: 1</span>
                  <span className={styles.stat}>Rating: 1200</span>
                  <span className={styles.stat}>Division: Bronze</span>
                </div>
              </div>
              <button 
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>

          <div className={styles.lobbyContent}>
            <div className={styles.matchSection}>
              <h2>Find a Match</h2>
              
              {queueData.status === 'waiting' && (
                <div className={styles.matchControls}>
                  <button 
                    className={styles.findMatchButton}
                    onClick={() => handleFindMatch('ranked')}
                    disabled={isFindingMatch}
                  >
                    {isFindingMatch ? 'Finding Match...' : 'Find Ranked Match'}
                  </button>
                  <button 
                    className={styles.findMatchButton}
                    onClick={() => handleFindMatch('casual')}
                    disabled={isFindingMatch}
                  >
                    {isFindingMatch ? 'Finding Match...' : 'Find Casual Match'}
                  </button>
                </div>
              )}

              {queueData.status === 'finding' && (
                <div className={styles.queueStatus}>
                  <div className={styles.loadingSpinner}></div>
                  <h3>Finding Opponent...</h3>
                  <p>Estimated wait time: {queueData.estimatedWaitTime}s</p>
                </div>
              )}

              {queueData.status === 'found' && (
                <div className={styles.matchFound}>
                  <h3>Match Found!</h3>
                  <p>Preparing game...</p>
                  <div className={styles.opponents}>
                    {queueData.opponents?.map((opponent, index) => (
                      <div key={index} className={styles.opponent}>
                        <span>{opponent.username}</span>
                        <span className={styles.opponentRating}>{opponent.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.quickActions}>
              <h3>Quick Actions</h3>
              <div className={styles.actionButtons}>
                <button 
                  className={styles.actionButton}
                  onClick={() => router.push('/community')}
                >
                  Community
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => router.push('/leaderboards')}
                >
                  Leaderboards
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => router.push('/shop')}
                >
                  Shop
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => router.push('/tutorial')}
                >
                  Tutorial
                </button>
              </div>
            </div>
          </div>
        </div>
    </ProtectedRoute>
  )
}