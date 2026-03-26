import React, { useState } from 'react'
import { useRouter } from 'next/router'
import HomeHero from '../components/website/HomeHero'
import FeaturesGrid from '../components/website/FeaturesGrid'
import RecentMatches from '../components/website/RecentMatches'
import styles from './index.module.css'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'matches' | 'leaderboards' | 'news'>('matches')
  const router = useRouter()

  const handlePlayNow = () => {
    // Navigate to match page or lobby
    router.push('/match')
  }

  const handleWatchTutorial = () => {
    // Navigate to tutorial page
    router.push('/tutorial')
  }

  const handleViewFeatures = () => {
    // Scroll to features section
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <HomeHero
        onPlayNow={handlePlayNow}
        onWatchTutorial={handleWatchTutorial}
        onViewFeatures={handleViewFeatures}
      />

      {/* Features Grid */}
      <div id="features">
        <FeaturesGrid />
      </div>

      {/* Recent Matches, Leaderboards & News */}
      <RecentMatches />
    </div>
  )
}
