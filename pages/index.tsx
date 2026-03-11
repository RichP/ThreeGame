import React, { useState } from 'react'
import MainLayout from '../components/MainLayout'
import HomeHero from '../components/website/HomeHero'
import FeaturesGrid from '../components/website/FeaturesGrid'
import RecentMatches from '../components/website/RecentMatches'
import styles from './index.module.css'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'matches' | 'leaderboards' | 'news'>('matches')

  const handlePlayNow = () => {
    // Navigate to match page or lobby
    window.location.href = '/match'
  }

  const handleWatchTutorial = () => {
    // Navigate to tutorial page
    alert('Tutorial coming soon!')
  }

  const handleViewFeatures = () => {
    // Scroll to features section
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <MainLayout>
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
    </MainLayout>
  )
}