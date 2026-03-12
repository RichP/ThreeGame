import React, { useState } from 'react'
import styles from './Achievements.module.css'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress?: number
  maxProgress?: number
  unlocked: boolean
  unlockedAt?: string
}

export const Achievements: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'date'>('name')

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Blood',
      description: 'Win your first match',
      icon: '🎯',
      rarity: 'common',
      unlocked: true,
      unlockedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sharpshooter',
      description: 'Get 100 headshot kills',
      icon: '🎯',
      rarity: 'rare',
      progress: 75,
      maxProgress: 100,
      unlocked: false
    },
    {
      id: '3',
      name: 'Tactician',
      description: 'Win 50 matches with different units',
      icon: '🧠',
      rarity: 'rare',
      progress: 50,
      maxProgress: 50,
      unlocked: true,
      unlockedAt: '2024-02-20'
    },
    {
      id: '4',
      name: 'Map Conqueror',
      description: 'Win at least one match on every map',
      icon: '🗺️',
      rarity: 'epic',
      progress: 3,
      maxProgress: 5,
      unlocked: false
    },
    {
      id: '5',
      name: 'Win Streak',
      description: 'Win 10 matches in a row',
      icon: '🔥',
      rarity: 'rare',
      progress: 7,
      maxProgress: 10,
      unlocked: false
    },
    {
      id: '6',
      name: 'Veteran',
      description: 'Play 1000 matches',
      icon: '🎖️',
      rarity: 'epic',
      progress: 245,
      maxProgress: 1000,
      unlocked: false
    },
    {
      id: '7',
      name: 'Champion',
      description: 'Reach top 100 in rankings',
      icon: '🏆',
      rarity: 'legendary',
      unlocked: false
    },
    {
      id: '8',
      name: 'Team Player',
      description: 'Win 25 matches with friends',
      icon: '🤝',
      rarity: 'common',
      progress: 12,
      maxProgress: 25,
      unlocked: false
    },
    {
      id: '9',
      name: 'Damage Dealer',
      description: 'Deal 50000 total damage',
      icon: '💥',
      rarity: 'rare',
      progress: 32000,
      maxProgress: 50000,
      unlocked: false
    },
    {
      id: '10',
      name: 'Survivor',
      description: 'Survive for 30+ turns in a single match',
      icon: '🛡️',
      rarity: 'common',
      unlocked: true,
      unlockedAt: '2024-03-01'
    }
  ]

  const filteredAchievements = achievements
    .filter(ach => filter === 'all' || (filter === 'unlocked' ? ach.unlocked : !ach.unlocked))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rarity':
          const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 }
          return rarityOrder[b.rarity] - rarityOrder[a.rarity]
        case 'date':
          if (!a.unlockedAt && !b.unlockedAt) return 0
          if (!a.unlockedAt) return 1
          if (!b.unlockedAt) return -1
          return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
        default:
          return 0
      }
    })

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#a0a0a0'
      case 'rare': return '#3b82f6'
      case 'epic': return '#8b5cf6'
      case 'legendary': return '#f59e0b'
      default: return '#ffffff'
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'rgba(160, 160, 160, 0.2)'
      case 'rare': return 'rgba(59, 130, 246, 0.2)'
      case 'epic': return 'rgba(139, 92, 246, 0.2)'
      case 'legendary': return 'rgba(245, 158, 11, 0.2)'
      default: return 'rgba(255, 255, 255, 0.1)'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'rgba(160, 160, 160, 0.4)'
      case 'rare': return 'rgba(59, 130, 246, 0.6)'
      case 'epic': return 'rgba(139, 92, 246, 0.6)'
      case 'legendary': return 'rgba(245, 158, 11, 0.8)'
      default: return 'rgba(255, 255, 255, 0.3)'
    }
  }

  const getProgressPercentage = (ach: Achievement) => {
    if (!ach.progress || !ach.maxProgress) return 0
    return Math.min((ach.progress / ach.maxProgress) * 100, 100)
  }

  return (
    <div className={styles.achievements}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Filter:</span>
          <div className={styles.filterButtons}>
            <button 
              className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'unlocked' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilter('unlocked')}
            >
              Unlocked
            </button>
            <button 
              className={`${styles.filterButton} ${filter === 'locked' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilter('locked')}
            >
              Locked
            </button>
          </div>
        </div>
        
        <div className={styles.sortGroup}>
          <span className={styles.sortLabel}>Sort by:</span>
          <select 
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'rarity' | 'date')}
          >
            <option value="name">Name</option>
            <option value="rarity">Rarity</option>
            <option value="date">Date Unlocked</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Achievements</span>
          <span className={styles.statValue}>{achievements.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Unlocked</span>
          <span className={styles.statValue}>{achievements.filter(a => a.unlocked).length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completion</span>
          <span className={styles.statValue}>
            {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className={styles.achievementGrid}>
        {filteredAchievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`${styles.achievementCard} ${achievement.unlocked ? styles.unlocked : styles.locked}`}
            style={{
              borderColor: getRarityBorder(achievement.rarity),
              background: getRarityBg(achievement.rarity)
            }}
          >
            <div className={styles.achievementHeader}>
              <div className={styles.achievementIcon} style={{ color: getRarityColor(achievement.rarity) }}>
                {achievement.unlocked ? achievement.icon : '🔒'}
              </div>
              <div className={styles.achievementInfo}>
                <h3 className={styles.achievementName}>{achievement.name}</h3>
                <span className={styles.achievementRarity} style={{ color: getRarityColor(achievement.rarity) }}>
                  {achievement.rarity.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className={styles.achievementBody}>
              <p className={styles.achievementDescription}>{achievement.description}</p>
              
              {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
                <div className={styles.progressContainer}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Progress</span>
                    <span className={styles.progressValue}>
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${getProgressPercentage(achievement)}%`,
                        background: getRarityColor(achievement.rarity)
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              {achievement.unlocked && achievement.unlockedAt && (
                <div className={styles.unlockInfo}>
                  <span className={styles.unlockLabel}>Unlocked:</span>
                  <span className={styles.unlockDate}>{achievement.unlockedAt}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🏆</span>
          <span className={styles.emptyText}>
            {filter === 'unlocked' ? 'No achievements unlocked yet' : 'No locked achievements'}
          </span>
        </div>
      )}
    </div>
  )
}

export default Achievements