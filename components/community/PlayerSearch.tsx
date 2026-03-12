import React, { useState } from 'react'
import styles from './PlayerSearch.module.css'

interface SearchResults {
  username: string
  rating: number
  division: string
  country?: string
  status: 'online' | 'offline' | 'away'
  avatar?: string
}

interface PlayerSearchProps {
  onSearch: (query: string) => void
  onAddFriend: (username: string) => void
  onChallenge: (username: string) => void
}

export const PlayerSearch: React.FC<PlayerSearchProps> = ({
  onSearch,
  onAddFriend,
  onChallenge
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResults[]>([])

  const mockSearchResults: SearchResults[] = [
    {
      username: 'TacticalMaster',
      rating: 1950,
      division: 'Diamond',
      country: 'US',
      status: 'online',
      avatar: '/api/placeholder/36/36'
    },
    {
      username: 'StrategicGenius',
      rating: 1820,
      division: 'Platinum',
      country: 'EU',
      status: 'away',
      avatar: '/api/placeholder/36/36'
    },
    {
      username: 'CombatPro',
      rating: 1750,
      division: 'Gold',
      country: 'APAC',
      status: 'offline',
      avatar: '/api/placeholder/36/36'
    },
    {
      username: 'FieldCommander',
      rating: 1680,
      division: 'Gold',
      country: 'US',
      status: 'online',
      avatar: '/api/placeholder/36/36'
    },
    {
      username: 'BattleTactician',
      rating: 1550,
      division: 'Silver',
      country: 'EU',
      status: 'offline',
      avatar: '/api/placeholder/36/36'
    }
  ]

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    onSearch(searchQuery)

    // Simulate API delay
    setTimeout(() => {
      setSearchResults(mockSearchResults)
      setIsSearching(false)
    }, 800)
  }

  const getDivisionColor = (division: string) => {
    switch (division) {
      case 'Bronze': return '#f59e0b'
      case 'Silver': return '#9ca3af'
      case 'Gold': return '#eab308'
      case 'Platinum': return '#22c55e'
      case 'Diamond': return '#3b82f6'
      case 'Master': return '#a78bfa'
      case 'Grandmaster': return '#ef4444'
      default: return '#ffffff'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981'
      case 'away': return '#f59e0b'
      case 'offline': return '#6b7280'
      default: return '#6b7280'
    }
  }

  return (
    <div className={styles.playerSearch}>
      <div className={styles.searchHeader}>
        <h3 className={styles.searchTitle}>Player Search</h3>
        <p className={styles.searchSubtitle}>
          Find players by username to add friends or send challenges
        </p>
      </div>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchInputContainer}>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter player username..."
            className={styles.searchInput}
            disabled={isSearching}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            name="playerSearch"
            id="playerSearchField"
          />
          <button 
            type="submit" 
            className={styles.searchButton}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {isSearching && (
        <div className={styles.searchingState}>
          <div className={styles.loadingSpinner}></div>
          <span className={styles.loadingText}>Searching for players...</span>
        </div>
      )}

      {searchResults.length > 0 && !isSearching && (
        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            <h4 className={styles.resultsTitle}>Search Results</h4>
            <span className={styles.resultsCount}>{searchResults.length} players found</span>
          </div>
          
          <div className={styles.resultsGrid}>
            {searchResults.map((player, index) => (
              <div key={index} className={`${styles.playerResult} ${player.status === 'online' ? styles.onlineResult : ''}`}>
                <div className={styles.playerInfo}>
                  <div className={styles.avatarSection}>
                    <div className={styles.avatarContainer}>
                      <img 
                        src={player.avatar || '/api/placeholder/36/36'} 
                        alt={player.username}
                        className={styles.resultAvatar}
                      />
                      <span 
                        className={styles.statusIndicator}
                        style={{ backgroundColor: getStatusColor(player.status) }}
                        title={player.status}
                      ></span>
                    </div>
                    
                    <div className={styles.playerDetails}>
                      <span className={styles.playerName}>{player.username}</span>
                      <div className={styles.playerMeta}>
                        <span 
                          className={styles.playerDivision}
                          style={{ color: getDivisionColor(player.division) }}
                        >
                          {player.division}
                        </span>
                        <span className={styles.playerRating}>Rating: {player.rating}</span>
                        {player.country && (
                          <span className={styles.playerCountry} title={player.country}>
                            {getCountryFlag(player.country)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.playerStatus}>
                    <span 
                      className={styles.playerStatusText}
                      style={{ color: getStatusColor(player.status) }}
                    >
                      {player.status === 'online' ? 'Online' : 
                       player.status === 'away' ? 'Away' : 'Offline'}
                    </span>
                  </div>
                </div>
                
                <div className={styles.playerActions}>
                  <button 
                    className={styles.addFriendButton}
                    onClick={() => onAddFriend(player.username)}
                    disabled={player.status === 'offline'}
                  >
                    Add Friend
                  </button>
                  <button 
                    className={styles.challengeButton}
                    onClick={() => onChallenge(player.username)}
                    disabled={player.status === 'offline'}
                  >
                    Challenge
                  </button>
                  <button 
                    className={styles.viewProfileButton}
                    onClick={() => console.log(`View profile: ${player.username}`)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isSearching && searchResults.length === 0 && searchQuery && (
        <div className={styles.noResults}>
          <span className={styles.noResultsIcon}>🔍</span>
          <span className={styles.noResultsText}>No players found</span>
          <span className={styles.noResultsSubtext}>
            Try searching with a different username
          </span>
        </div>
      )}

      {!searchQuery && !isSearching && (
        <div className={styles.emptySearch}>
          <span className={styles.emptyIcon}>👥</span>
          <span className={styles.emptyText}>Search for players</span>
          <span className={styles.emptySubtext}>
            Enter a username above to find and connect with other players
          </span>
        </div>
      )}
    </div>
  )
}

// Helper function to get country flags
const getCountryFlag = (country: string) => {
  const flagMap: Record<string, string> = {
    'US': '🇺🇸', 'UK': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
    'JP': '🇯🇵', 'KR': '🇰🇷', 'BR': '🇧🇷', 'RU': '🇷🇺',
    'AU': '🇦🇺', 'CA': '🇨🇦', 'CN': '🇨🇳', 'IN': '🇮🇳'
  }
  return flagMap[country] || '🌐'
}

export default PlayerSearch