import React, { useState } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '../components/MainLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import CommunityTabs from '../components/community/CommunityTabs'
import PlayerSearch from '../components/community/PlayerSearch'
import FriendsList from '../components/community/FriendsList'
import LeaderboardPreview from '../components/community/LeaderboardPreview'
import styles from './community.module.css'

interface Friend {
  id: string
  username: string
  status: 'online' | 'offline' | 'away'
  lastSeen: string
  avatar?: string
  rating: number
  division: string
}

interface LeaderboardEntry {
  rank: number
  username: string
  rating: number
  division: string
  country?: string
}

export default function CommunityPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'leaderboards' | 'friends' | 'search'>('leaderboards')
  const [searchQuery, setSearchQuery] = useState('')
  const [friends, setFriends] = useState<Friend[]>([
    {
      id: '1',
      username: 'StrategicMaster',
      status: 'online',
      lastSeen: 'Just now',
      avatar: '/api/placeholder/32/32',
      rating: 1850,
      division: 'Platinum'
    },
    {
      id: '2',
      username: 'TacticalGenius',
      status: 'away',
      lastSeen: '5 minutes ago',
      avatar: '/api/placeholder/32/32',
      rating: 1720,
      division: 'Gold'
    },
    {
      id: '3',
      username: 'ShadowWarrior',
      status: 'offline',
      lastSeen: '2 hours ago',
      avatar: '/api/placeholder/32/32',
      rating: 1680,
      division: 'Gold'
    },
    {
      id: '4',
      username: 'BattleLord',
      status: 'online',
      lastSeen: 'Just now',
      avatar: '/api/placeholder/32/32',
      rating: 1950,
      division: 'Diamond'
    }
  ])

  const topPlayers: LeaderboardEntry[] = [
    { rank: 1, username: 'GrandMaster', rating: 2150, division: 'Master', country: 'US' },
    { rank: 2, username: 'TacticalPro', rating: 1980, division: 'Diamond', country: 'EU' },
    { rank: 3, username: 'StrategicMind', rating: 1920, division: 'Diamond', country: 'APAC' },
    { rank: 4, username: 'CombatGenius', rating: 1850, division: 'Platinum', country: 'US' },
    { rank: 5, username: 'FieldMarshal', rating: 1820, division: 'Platinum', country: 'EU' }
  ]

  const handleTabChange = (tab: 'leaderboards' | 'friends' | 'search') => {
    setActiveTab(tab)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleAddFriend = (username: string) => {
    // Mock friend request functionality
    console.log(`Friend request sent to ${username}`)
  }

  const handleChallenge = (username: string) => {
    // Mock challenge functionality
    console.log(`Challenge sent to ${username}`)
  }

  const handleRemoveFriend = (friendId: string) => {
    setFriends(friends.filter(friend => friend.id !== friendId))
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className={styles.community}>
          <div className={styles.container}>
            {/* Header Section */}
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h1 className={styles.title}>Community Hub</h1>
                <p className={styles.subtitle}>
                  Connect with players, track your friends, and climb the leaderboards
                </p>
              </div>
            </div>

            {/* Community Tabs */}
            <CommunityTabs 
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            {/* Main Content */}
            <div className={styles.content}>
              {activeTab === 'leaderboards' && (
                <LeaderboardPreview 
                  topPlayers={topPlayers}
                  onViewAll={() => router.push('/leaderboards')}
                />
              )}

              {activeTab === 'friends' && (
                <FriendsList 
                  friends={friends}
                  onRemoveFriend={handleRemoveFriend}
                  onChallenge={handleChallenge}
                />
              )}

              {activeTab === 'search' && (
                <PlayerSearch 
                  onSearch={handleSearch}
                  onAddFriend={handleAddFriend}
                  onChallenge={handleChallenge}
                />
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}