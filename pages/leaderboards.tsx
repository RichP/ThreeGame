import React, { useState, useEffect } from 'react'
import MainLayout from '../components/MainLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import LeaderboardTabs from '../components/leaderboards/LeaderboardTabs'
import LeaderboardFilters from '../components/leaderboards/LeaderboardFilters'
import LeaderboardTable from '../components/leaderboards/LeaderboardTable'
import LeaderboardStats from '../components/leaderboards/LeaderboardStats'
import { communityApi } from '../services/api'
import styles from './leaderboards.module.css'

interface LeaderboardEntry {
  rank: number
  username: string
  wins: number
  losses: number
  winRate: number
  rating: number
  gamesPlayed: number
  lastActive: string
  avatar?: string
  country?: string
  division?: string
  seasonPoints?: number
}

interface LeaderboardStats {
  totalPlayers: number
  averageRating: number
  topPlayer: string
  mostPlayedMap: string
  averageGameLength: string
}

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState<'global' | 'regional' | 'friends' | 'seasonal'>('global')
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'season'>('all')
  const [regionFilter, setRegionFilter] = useState<string>('global')
  const [divisionFilter, setDivisionFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<LeaderboardStats | null>(null)

  // Mock data generation
  const generateMockData = (): LeaderboardEntry[] => {
    const regions = ['NA', 'EU', 'APAC', 'SA', 'AF']
    const divisions = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster']
    const countries = ['US', 'UK', 'DE', 'FR', 'JP', 'KR', 'BR', 'RU', 'AU', 'CA']
    
    return Array.from({ length: 100 }, (_, index) => ({
      rank: index + 1,
      username: `Player${1000 + index}`,
      wins: Math.floor(Math.random() * 300) + 50,
      losses: Math.floor(Math.random() * 200) + 20,
      winRate: Math.floor(Math.random() * 40) + 50,
      rating: Math.floor(Math.random() * 800) + 1200,
      gamesPlayed: Math.floor(Math.random() * 500) + 100,
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
      country: countries[Math.floor(Math.random() * countries.length)],
      division: divisions[Math.floor(Math.random() * divisions.length)],
      seasonPoints: Math.floor(Math.random() * 2000) + 100
    }))
  }

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const filter: any = {
          limit: 100
        }
        
        if (divisionFilter !== 'all') {
          filter.tier = divisionFilter
        }

        const response = await communityApi.getLeaderboard(filter)
        
        if (response.success && response.data) {
          const transformedData: LeaderboardEntry[] = response.data.entries.map((entry: any) => ({
            rank: entry.rank,
            username: entry.user.username,
            wins: entry.wins,
            losses: entry.losses,
            winRate: entry.winRate,
            rating: entry.mmr || entry.points,
            gamesPlayed: entry.wins + entry.losses,
            lastActive: 'Recently',
            avatar: undefined,
            country: 'US',
            division: entry.tier || 'Unranked',
            seasonPoints: entry.points
          }))
          setLeaderboardData(transformedData)

          // Fetch stats
          const statsResponse = await communityApi.getLeaderboardStats()
          if (statsResponse.success && statsResponse.data) {
            setStats({
              totalPlayers: statsResponse.data.totalPlayers,
              averageRating: Math.round(statsResponse.data.averagePoints),
              topPlayer: statsResponse.data.topPlayer.username,
              mostPlayedMap: 'Crossroads',
              averageGameLength: '15 minutes'
            })
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch leaderboard:', err)
        // Fallback to empty data
        setLeaderboardData([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [activeTab, timeFilter, regionFilter, divisionFilter])

  const handleTabChange = (tab: 'global' | 'regional' | 'friends' | 'seasonal') => {
    setActiveTab(tab)
  }

  const handleTimeFilterChange = (filter: 'all' | 'week' | 'month' | 'season') => {
    setTimeFilter(filter)
  }

  const handleRegionFilterChange = (region: string) => {
    setRegionFilter(region)
  }

  const handleDivisionFilterChange = (division: string) => {
    setDivisionFilter(division)
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className={styles.leaderboards}>
          <div className={styles.container}>
            {/* Header Section */}
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h1 className={styles.title}>Global Leaderboards</h1>
                <p className={styles.subtitle}>
                  Compete for glory and track your progress against players worldwide
                </p>
              </div>
              
              <div className={styles.headerActions}>
                <button className={styles.refreshButton}>
                  🔄 Refresh Rankings
                </button>
                <button className={styles.exportButton}>
                  📊 Export Data
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
              <LeaderboardStats stats={stats} />
            )}

            {/* Filters and Tabs */}
            <div className={styles.filtersSection}>
              <LeaderboardTabs 
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
              
              <LeaderboardFilters
                timeFilter={timeFilter}
                regionFilter={regionFilter}
                divisionFilter={divisionFilter}
                onTimeFilterChange={handleTimeFilterChange}
                onRegionFilterChange={handleRegionFilterChange}
                onDivisionFilterChange={handleDivisionFilterChange}
              />
            </div>

            {/* Leaderboard Table */}
            <div className={styles.tableSection}>
              <LeaderboardTable
                data={leaderboardData}
                loading={loading}
                activeTab={activeTab}
              />
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}