import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../components/auth/AuthContext'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { matchApi } from '../services/api'
import { QuickMatch } from '../components/lobby/QuickMatch'
import { CustomMatch } from '../components/lobby/CustomMatch'
import { ActiveMatches } from '../components/lobby/ActiveMatches'
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

  const handleFindMatch = async (gameMode: string = 'classic') => {
    try {
      setIsFindingMatch(true)
      setQueueData({ status: 'finding', estimatedWaitTime: 30 })

      console.log('Finding match with game mode:', gameMode)
      const response = await matchApi.findMatch(gameMode)
      console.log('Find match response:', response)

      if (response.success && response.data) {
        console.log('Match data:', response.data)
        console.log('Response data keys:', Object.keys(response.data))
        
        // The response structure is: { success: true, data: { matchId: string, opponents: [...] } }
        // So we need to access response.data.data.matchId
        const responseData = response.data as any
        console.log('Response data.data:', responseData.data)
        console.log('Response data.data.matchId:', responseData.data?.matchId)
        
        setQueueData({ 
          status: 'found', 
          opponents: responseData.data?.opponents || []
        })
        
        // Redirect to match page after a short delay
        setTimeout(() => {
          const matchId = responseData.data?.matchId
          console.log('Redirecting to match:', matchId)
          if (matchId) {
            router.push(`/match/${matchId}`)
          } else {
            console.error('Match ID is undefined!')
            setQueueData({ status: 'waiting' })
          }
        }, 2000)
      } else {
        throw new Error(response.error || 'Failed to find match')
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

            {/* Quick Match Component */}
            <QuickMatch onJoinMatch={() => handleFindMatch('ranked')} />

            {/* Custom Match Component */}
            <CustomMatch onCreateMatch={(settings) => {
              console.log('Creating custom match with settings:', settings)
              // Navigation is handled by the CustomMatch component itself
            }} />

            {/* Active Matches Component */}
            <ActiveMatches />

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