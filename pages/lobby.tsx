import React, { useState, useEffect } from 'react'
import MainLayout from '../components/MainLayout'
import styles from './lobby.module.css'
import { QuickMatch } from '../components/lobby/QuickMatch'
import { CustomMatch } from '../components/lobby/CustomMatch'
import { ActiveMatches } from '../components/lobby/ActiveMatches'
import { RecentActivity } from '../components/lobby/RecentActivity'
import { MatchQueue } from '../components/lobby/MatchQueue'

export default function LobbyPage() {
  const [activeTab, setActiveTab] = useState<'quick' | 'custom' | 'queue'>('quick')
  const [showQueue, setShowQueue] = useState(false)

  return (
    <MainLayout>
      <div className={styles.lobby}>
        {/* Main Actions */}
        <div className={styles.quickActions}>
          <h1 className={styles.title}>ThreeGame Lobby</h1>
          <div className={styles.actionButtons}>
            <button 
              className={`${styles.primaryButton} ${activeTab === 'quick' ? styles.active : ''}`}
              onClick={() => setActiveTab('quick')}
            >
              Quick Match
            </button>
            <button 
              className={`${styles.secondaryButton} ${activeTab === 'custom' ? styles.active : ''}`}
              onClick={() => setActiveTab('custom')}
            >
              Create Custom
            </button>
            <button 
              className={`${styles.secondaryButton} ${showQueue ? styles.active : ''}`}
              onClick={() => setShowQueue(!showQueue)}
            >
              {showQueue ? 'Hide Queue' : 'View Queue'}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={styles.content}>
          <div className={styles.leftPanel}>
            {/* Active Matches */}
            <ActiveMatches />
            
            {/* Recent Activity */}
            <RecentActivity />
          </div>

          <div className={styles.rightPanel}>
            {/* Matchmaking Interface */}
            {showQueue && (
              <MatchQueue />
            )}
            
            {/* Quick Match or Custom Match */}
            {activeTab === 'quick' && <QuickMatch />}
            {activeTab === 'custom' && <CustomMatch />}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}