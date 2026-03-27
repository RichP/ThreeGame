import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '../components/MainLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import CommunityTabs from '../components/community/CommunityTabs'
import PlayerSearch from '../components/community/PlayerSearch'
import FriendsList from '../components/community/FriendsList'
import LeaderboardPreview from '../components/community/LeaderboardPreview'
import { friendsApi, communityApi } from '../services/api'
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
  const [friends, setFriends] = useState<Friend[]>([])
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // Check if user is authenticated before making API calls
      const token = localStorage.getItem('authToken')
      if (!token) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        // Fetch friends
        const friendsResponse = await friendsApi.getFriendsList()
        if (friendsResponse.success && friendsResponse.data) {
          const transformedFriends = friendsResponse.data.friends.map((f: any) => ({
            id: f.id.toString(),
            username: f.username,
            status: 'offline' as const,
            lastSeen: f.lastSeen || 'Recently',
            avatar: f.avatarUrl || '/api/placeholder/32/32',
            rating: 1500,
            division: 'Gold'
          }))
          setFriends(transformedFriends)
        }

        // Fetch leaderboard preview
        const leaderboardResponse = await communityApi.getLeaderboard({ limit: 5 })
        if (leaderboardResponse.success && leaderboardResponse.data) {
          const transformedPlayers = leaderboardResponse.data.entries.map((entry: any) => ({
            rank: entry.rank,
            username: entry.user.username,
            rating: entry.mmr || entry.points,
            division: entry.tier || 'Unranked',
            country: 'US'
          }))
          setTopPlayers(transformedPlayers)
        }
      } catch (err: any) {
        // Only log errors if user is authenticated (token exists)
        if (localStorage.getItem('authToken')) {
          setError(err.message || 'Failed to load data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleTabChange = (tab: 'leaderboards' | 'friends' | 'search') => {
    setActiveTab(tab)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleAddFriend = async (username: string) => {
    try {
      // Search for user first to get their ID
      const searchResponse = await friendsApi.searchUsers(username)
      if (searchResponse.success && searchResponse.data && searchResponse.data.length > 0) {
        const targetUserId = searchResponse.data[0].id
        const response = await friendsApi.sendFriendRequest(targetUserId)
        if (response.success) {
          console.log('Friend request sent successfully')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send friend request')
    }
  }

  const handleChallenge = (username: string) => {
    // Challenge functionality
    console.log(`Challenge sent to ${username}`)
  }

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const response = await friendsApi.removeFriend(parseInt(friendId))
      if (response.success) {
        setFriends(friends.filter(friend => friend.id !== friendId))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove friend')
    }
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