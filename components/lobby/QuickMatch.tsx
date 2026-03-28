import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { matchApi, matchmakingApi } from '../../services/api'
import styles from './QuickMatch.module.css'

interface QuickMatchProps {
  onJoinMatch?: () => void
}

export const QuickMatch: React.FC<QuickMatchProps> = ({ onJoinMatch }) => {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<'ranked' | 'casual' | 'ai'>('ranked')
  const [selectedMap, setSelectedMap] = useState<'random' | 'crossroads' | 'forest' | 'mountain'>('random')
  const [selectedTimeControl, setSelectedTimeControl] = useState<'daily' | '3days' | 'realtime'>('daily')
  const [isLoading, setIsLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)
  const [queueStats, setQueueStats] = useState<{
    averageWaitTime: number
    totalInQueue: number
    averageSkillRating: number
  } | null>(null)

  useEffect(() => {
    fetchQueueStats()
  }, [selectedMode])

  const fetchQueueStats = async () => {
    try {
      setStatsLoading(true)
      const gameMode = selectedMode === 'ai' ? 'ranked' : selectedMode
      const response = await matchmakingApi.getQueueStats(gameMode)
      if (response.success && response.data) {
        setQueueStats(response.data)
      }
    } catch (error) {
      console.error('Error fetching queue stats:', error)
      // Set default values on error
      setQueueStats({
        averageWaitTime: 0,
        totalInQueue: 0,
        averageSkillRating: 0
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const handleJoinMatch = async () => {
    if (isLoading) return
    
    try {
      setIsLoading(true)
      
      const gameMode = selectedMode === 'ai' ? 'ai' : selectedMode
      const response = await matchApi.findMatch(gameMode, undefined, undefined)
      
      if (response.success && response.data) {
        // Redirect to match page
        router.push(`/match/${response.data.matchId}`)
        onJoinMatch?.()
      } else {
        throw new Error(response.error || 'Failed to find match')
      }
    } catch (error) {
      console.error('Match finding error:', error)
      // You could add a toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.quickMatch}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quick Match</h2>
        <p className={styles.subtitle}>Jump into a match quickly with automatic matchmaking</p>
      </div>

      <div className={styles.settings}>
        {/* Game Mode Selection */}
        <div className={styles.settingGroup}>
          <label className={styles.label}>Game Mode</label>
          <div className={styles.modeButtons}>
            <button 
              className={`${styles.modeButton} ${selectedMode === 'ranked' ? styles.modeButtonActive : ''}`}
              onClick={() => setSelectedMode('ranked')}
            >
              <span className={styles.modeIcon}>🏆</span>
              <span className={styles.modeText}>Ranked</span>
              <span className={styles.modeDesc}>Competitive play</span>
            </button>
            <button 
              className={`${styles.modeButton} ${selectedMode === 'casual' ? styles.modeButtonActive : ''}`}
              onClick={() => setSelectedMode('casual')}
            >
              <span className={styles.modeIcon}>🎯</span>
              <span className={styles.modeText}>Casual</span>
              <span className={styles.modeDesc}>Relaxed gameplay</span>
            </button>
            <button 
              className={`${styles.modeButton} ${selectedMode === 'ai' ? styles.modeButtonActive : ''}`}
              onClick={() => setSelectedMode('ai')}
            >
              <span className={styles.modeIcon}>🤖</span>
              <span className={styles.modeText}>AI Opponent</span>
              <span className={styles.modeDesc}>Practice mode</span>
            </button>
          </div>
        </div>

        {/* Map Selection */}
        <div className={styles.settingGroup}>
          <label className={styles.label}>Map Selection</label>
          <div className={styles.mapButtons}>
            <button 
              className={`${styles.mapButton} ${selectedMap === 'random' ? styles.mapButtonActive : ''}`}
              onClick={() => setSelectedMap('random')}
            >
              <span className={styles.mapIcon}>🎲</span>
              <span className={styles.mapText}>Random</span>
            </button>
            <button 
              className={`${styles.mapButton} ${selectedMap === 'crossroads' ? styles.mapButtonActive : ''}`}
              onClick={() => setSelectedMap('crossroads')}
            >
              <span className={styles.mapIcon}>🛣️</span>
              <span className={styles.mapText}>Crossroads</span>
            </button>
            <button 
              className={`${styles.mapButton} ${selectedMap === 'forest' ? styles.mapButtonActive : ''}`}
              onClick={() => setSelectedMap('forest')}
            >
              <span className={styles.mapIcon}>🌲</span>
              <span className={styles.mapText}>Forest</span>
            </button>
            <button 
              className={`${styles.mapButton} ${selectedMap === 'mountain' ? styles.mapButtonActive : ''}`}
              onClick={() => setSelectedMap('mountain')}
            >
              <span className={styles.mapIcon}>⛰️</span>
              <span className={styles.mapText}>Mountain</span>
            </button>
          </div>
        </div>

        {/* Time Control */}
        <div className={styles.settingGroup}>
          <label className={styles.label}>Time Control</label>
          <div className={styles.timeButtons}>
            <button 
              className={`${styles.timeButton} ${selectedTimeControl === 'daily' ? styles.timeButtonActive : ''}`}
              onClick={() => setSelectedTimeControl('daily')}
            >
              <span className={styles.timeIcon}>⏰</span>
              <span className={styles.timeText}>Daily</span>
              <span className={styles.timeDesc}>24 hours per turn</span>
            </button>
            <button 
              className={`${styles.timeButton} ${selectedTimeControl === '3days' ? styles.timeButtonActive : ''}`}
              onClick={() => setSelectedTimeControl('3days')}
            >
              <span className={styles.timeIcon}>📅</span>
              <span className={styles.timeText}>3 Days</span>
              <span className={styles.timeDesc}>72 hours per turn</span>
            </button>
            <button 
              className={`${styles.timeButton} ${selectedTimeControl === 'realtime' ? styles.timeButtonActive : ''}`}
              onClick={() => setSelectedTimeControl('realtime')}
            >
              <span className={styles.timeIcon}>⚡</span>
              <span className={styles.timeText}>Real-time</span>
              <span className={styles.timeDesc}>60 seconds per turn</span>
            </button>
          </div>
        </div>
      </div>

      {/* Join Match Button */}
      <div className={styles.joinSection}>
        <button className={styles.joinButton} onClick={handleJoinMatch}>
          <span className={styles.joinIcon}>🎮</span>
          <span className={styles.joinText}>Join Match</span>
        </button>
        <p className={styles.joinDesc}>
          {selectedMode === 'ranked' && "Competitive matchmaking - ELO rating affected"}
          {selectedMode === 'casual' && "Relaxed gameplay - No rating changes"}
          {selectedMode === 'ai' && "Practice against AI - No waiting for opponents"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Average Wait Time</span>
          <span className={styles.statValue}>
            {statsLoading ? '...' : queueStats ? `${Math.round(queueStats.averageWaitTime)} min` : 'N/A'}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Average Rating</span>
          <span className={styles.statValue}>
            {statsLoading ? '...' : queueStats ? queueStats.averageSkillRating.toLocaleString() : 'N/A'}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Queue Size</span>
          <span className={styles.statValue}>
            {statsLoading ? '...' : queueStats ? queueStats.totalInQueue.toLocaleString() : '0'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default QuickMatch