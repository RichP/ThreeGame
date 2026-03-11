import React from 'react'
import HeroPreview from './HeroPreview'
import styles from './HomeHero.module.css'

interface HomeHeroProps {
  onPlayNow?: () => void
  onWatchTutorial?: () => void
  onViewFeatures?: () => void
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onPlayNow,
  onWatchTutorial,
  onViewFeatures
}) => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>
            Master the Art of
            <span className={styles.highlight}> 3D Tactical Combat</span>
          </h1>
          <p className={styles.subtitle}>
            Strategic turn-based warfare meets stunning 3D visuals. 
            Plan your moves, outmaneuver your opponents, and claim victory.
          </p>
          <div className={styles.heroButtons}>
            <button 
              className={styles.primaryButton}
              onClick={onPlayNow}
            >
              Play Now
            </button>
            <button 
              className={styles.secondaryButton}
              onClick={onWatchTutorial}
            >
              Watch Tutorial
            </button>
            <button 
              className={styles.tertiaryButton}
              onClick={onViewFeatures}
            >
              View Features
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.heroPreview}>
        <HeroPreview height={600} />
      </div>
      
      {/* Floating elements for visual interest */}
      <div className={styles.floatingElements}>
        <div className={styles.floatingUnit}>🎯</div>
        <div className={styles.floatingUnit}>⚡</div>
        <div className={styles.floatingUnit}>🛡️</div>
      </div>
    </section>
  )
}

export default HomeHero