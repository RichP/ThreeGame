import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { matchApi } from '../../services/api'
import styles from './RecentMatches.module.css'

interface Match {
  id: string
  player1: string
  player2: string
  winner: string
  turns: number
  duration: string
  map: string
  timestamp: string
}

interface LeaderboardEntry {
  rank: number
  username: string
  wins: number
  losses: number
  winRate: number
  rating: number
}

// Mock data
const recentMatches: Match[] = [
  {
    id: 'match1',
    player1: 'StrategicMaster',
    player2: 'TacticalGenius',
    winner: 'StrategicMaster',
    turns: 18,
    duration: '2 days ago',
    map: 'Crossroads',
    timestamp: '2024-01-15 14:30'
  },
  {
    id: 'match2',
    player1: 'ShadowWarrior',
    player2: 'IronTactician',
    winner: 'IronTactician',
    turns: 12,
    duration: '3 days ago',
    map: 'Forest Ambush',
    timestamp: '2024-01-14 18:45'
  },
  {
    id: 'match3',
    player1: 'NinjaCommander',
    player2: 'DragonSlayer',
    winner: 'NinjaCommander',
    turns: 24,
    duration: '4 days ago',
    map: 'Mountain Pass',
    timestamp: '2024-01-13 09:15'
  },
  {
    id: 'match4',
    player1: 'CyberPunk',
    player2: 'MedievalKnight',
    winner: 'MedievalKnight',
    turns: 15,
    duration: '5 days ago',
    map: 'Cyber City',
    timestamp: '2024-01-12 22:30'
  },
  {
    id: 'match5',
    player1: 'SniperElite',
    player2: 'TankCommander',
    winner: 'SniperElite',
    turns: 10,
    duration: '6 days ago',
    map: 'Urban Warfare',
    timestamp: '2024-01-11 16:20'
  }
]

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'GrandMaster', wins: 156, losses: 34, winRate: 82, rating: 2150 },
  { rank: 2, username: 'TacticalPro', wins: 203, losses: 78, winRate: 72, rating: 1980 },
  { rank: 3, username: 'StrategicMind', wins: 187, losses: 65, winRate: 74, rating: 1920 },
  { rank: 4, username: 'BattleLord', wins: 245, losses: 123, winRate: 67, rating: 1850 },
  { rank: 5, username: 'WarTactician', wins: 167, losses: 58, winRate: 74, rating: 1820 },
  { rank: 6, username: 'MasterPlanner', wins: 198, losses: 89, winRate: 69, rating: 1780 },
  { rank: 7, username: 'CombatGenius', wins: 145, losses: 67, winRate: 68, rating: 1750 },
  { rank: 8, username: 'FieldMarshal', wins: 223, losses: 145, winRate: 61, rating: 1720 },
  { rank: 9, username: 'TournamentKing', wins: 178, losses: 82, winRate: 69, rating: 1690 },
  { rank: 10, username: 'VictorySeeker', wins: 156, losses: 98, winRate: 61, rating: 1650 }
]

export const RecentMatches: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matches' | 'leaderboards' | 'news'>('matches')
  const [matches, setMatches] = useState<Match[]>(recentMatches)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchRecentMatches()
  }, [])

  const fetchRecentMatches = async () => {
    try {
      setIsLoading(true)
      console.log('[RecentMatches] Fetching matches...')
      const response = await matchApi.listMatches({ 
        //status: 'completed', 
        limit: 5 
      })
      console.log('[RecentMatches] API Response:', response)
      console.log('[RecentMatches] Response success:', response.success)
      console.log('[RecentMatches] Response data:', response.data)
      console.log('[RecentMatches] Matches array:', response.data?.data?.matches)
      
      if (response.success && response.data && response.data.data && response.data.data.matches) {
        console.log('[RecentMatches] Number of matches:', response.data.data.matches.length)
        console.log('[RecentMatches] First match raw data:', response.data.data.matches[0])
        const transformedMatches = response.data.data.matches.map((match: any) => {
          const participant1 = match.participants?.[0]?.user?.username || 'Player 1'
          const participant2 = match.participants?.[1]?.user?.username || 'Player 2'
          const winnerName = match.winnerId 
            ? (match.winnerId === match.participants?.[0]?.userId 
              ? participant1 
              : participant2)
            : 'Unknown'
          
          return {
            id: match.id.toString(),
            player1: participant1,
            player2: participant2,
            winner: winnerName,
            turns: match.turnNumber || 0,
            duration: formatTimeAgo(match.createdAt),
            map: match.settings?.map || 'Random',
            timestamp: match.createdAt
          }
        })
        setMatches(transformedMatches)
      }
    } catch (err) {
      console.error('Error fetching matches:', err)
      // On error, keep using mock data (already set in initial state)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <section className={styles.recentMatches}>
      <div className={styles.container}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'matches' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            Recent Matches
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'leaderboards' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('leaderboards')}
          >
            Leaderboards
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.tabbedView}>
            {activeTab === 'matches' && (
              <div className={styles.matchesSection}>
                <h3 className={styles.sectionTitle}>Latest Battles</h3>
                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    Loading matches...
                  </div>
                ) : (
                <div className={styles.matchesList}>
                  {matches.map((match) => (
                    <div key={match.id} className={styles.matchCard}>
                      <div className={styles.matchHeader}>
                        <span className={styles.mapTag}>{match.map}</span>
                        <span className={styles.timeAgo}>{match.duration}</span>
                      </div>
                      <div className={styles.matchPlayers}>
                        <div className={styles.player}>
                          <span className={styles.playerName}>{match.player1}</span>
                          <span className={styles.vs}>vs</span>
                        </div>
                        <div className={styles.player}>
                          <span className={styles.vs}>vs</span>
                          <span className={styles.playerName}>{match.player2}</span>
                        </div>
                      </div>
                      <div className={styles.matchResult}>
                        <span className={styles.winner}>Winner: {match.winner}</span>
                        <span className={styles.turns}>{match.turns} turns</span>
                      </div>
                    </div>
                  ))}
                </div>
                )}
                <Link href="/leaderboards" className={`${styles.viewAllButton} ${styles.linkButton}`}>
                  View All Matches
                </Link>
              </div>
            )}
            
            {activeTab === 'leaderboards' && (
              <div className={styles.leaderboardSection}>
                <h3 className={styles.sectionTitle}>Global Leaderboard</h3>
                <div className={styles.leaderboardList}>
                  {leaderboard.map((entry) => (
                    <div key={entry.rank} className={styles.leaderboardRow}>
                      <div className={styles.rankColumn}>
                        <span className={`${styles.rank} ${entry.rank <= 3 ? styles.topRank : ''}`}>
                          #{entry.rank}
                        </span>
                      </div>
                      <div className={styles.playerColumn}>
                        <span className={styles.leaderboardUsername}>{entry.username}</span>
                        <span className={styles.leaderboardStats}>
                          {entry.wins}W {entry.losses}L • {entry.winRate}%
                        </span>
                      </div>
                      <div className={styles.ratingColumn}>
                        <span className={styles.rating}>{entry.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/leaderboards" className={`${styles.viewAllButton} ${styles.linkButton}`}>
                  View Full Leaderboard
                </Link>
              </div>
            )}
            
          </div>
          
          <div className={styles.newsSection}>
            <h3 className={styles.sectionTitle}>Latest News</h3>
            <div className={styles.newsList}>
              <div className={styles.newsCard}>
                <div className={styles.newsHeader}>
                  <span className={styles.newsTag}>Update</span>
                  <span className={styles.newsDate}>Jan 15</span>
                </div>
                <h4 className={styles.newsTitle}>Season 3: Cyber Frontier Launches</h4>
                <p className={styles.newsExcerpt}>
                  New cyberpunk maps, units, and abilities are now available. Join the futuristic warfare today!
                </p>
              </div>
              
              <div className={styles.newsCard}>
                <div className={styles.newsHeader}>
                  <span className={styles.newsTag}>Event</span>
                  <span className={styles.newsDate}>Jan 10</span>
                </div>
                <h4 className={styles.newsTitle}>Winter Tournament Series Begins</h4>
                <p className={styles.newsExcerpt}>
                  Compete for exclusive rewards and global recognition in our seasonal tournament.
                </p>
              </div>
              
              <div className={styles.newsCard}>
                <div className={styles.newsHeader}>
                  <span className={styles.newsTag}>Balance</span>
                  <span className={styles.newsDate}>Jan 5</span>
                </div>
                <h4 className={styles.newsTitle}>Balance Changes Patch Notes</h4>
                <p className={styles.newsExcerpt}>
                  We've adjusted several units and abilities to improve game balance and variety.
                </p>
              </div>
            </div>
            <Link href="/news" className={`${styles.viewAllButton} ${styles.linkButton}`}>
              Read All News
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RecentMatches
