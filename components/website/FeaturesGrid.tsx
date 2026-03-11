import React from 'react'
import styles from './FeaturesGrid.module.css'

interface Feature {
  id: string
  title: string
  description: string
  icon: string
  color: string
}

const features: Feature[] = [
  {
    id: 'ranked',
    title: 'Ranked Matches',
    description: 'Climb the leaderboards and prove your tactical mastery in competitive ranked play.',
    icon: '🏆',
    color: '#f59e0b'
  },
  {
    id: 'async',
    title: 'Asynchronous Play',
    description: 'Take your time with turns. Play at your own pace with daily or hourly turn options.',
    icon: '⏰',
    color: '#38bdf8'
  },
  {
    id: 'tournaments',
    title: 'Tournaments',
    description: 'Compete in seasonal tournaments with exciting prizes and global recognition.',
    icon: '🎯',
    color: '#a78bfa'
  },
  {
    id: 'ai',
    title: 'AI Opponents',
    description: 'Practice against intelligent AI with multiple difficulty levels.',
    icon: '🤖',
    color: '#10b981'
  },
  {
    id: 'custom',
    title: 'Custom Maps',
    description: 'Create and share your own battlefields with unique terrain and strategies.',
    icon: '🗺️',
    color: '#ef4444'
  },
  {
    id: 'social',
    title: 'Social Features',
    description: 'Challenge friends, join guilds, and build your tactical community.',
    icon: '👥',
    color: '#8b5cf6'
  }
]

export const FeaturesGrid: React.FC = () => {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Why Players Love ThreeGame</h2>
          <p className={styles.subtitle}>
            Experience the perfect blend of strategy, skill, and stunning visuals
          </p>
        </div>
        
        <div className={styles.grid}>
          {features.map((feature) => (
            <div key={feature.id} className={styles.featureCard}>
              <div 
                className={styles.featureIcon}
                style={{ backgroundColor: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesGrid