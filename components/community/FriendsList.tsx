import React from 'react'
import styles from './FriendsList.module.css'

interface Friend {
  id: string
  username: string
  status: 'online' | 'offline' | 'away'
  lastSeen: string
  avatar?: string
  rating: number
  division: string
}

interface FriendsListProps {
  friends: Friend[]
  onRemoveFriend: (friendId: string) => void
  onChallenge: (username: string) => void
}

export const FriendsList: React.FC<FriendsListProps> = ({
  friends,
  onRemoveFriend,
  onChallenge
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981'
      case 'away': return '#f59e0b'
      case 'offline': return '#6b7280'
      default: return '#6b7280'
    }
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

  return (
    <div className={styles.friendsList}>
      <div className={styles.listHeader}>
        <h3 className={styles.listTitle}>Friends List</h3>
        <span className={styles.friendCount}>{friends.length} friends</span>
      </div>
      
      <div className={styles.friendsGrid}>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <div key={friend.id} className={`${styles.friendCard} ${friend.status === 'online' ? styles.onlineFriend : ''}`}>
              <div className={styles.friendInfo}>
                <div className={styles.avatarSection}>
                  <div className={styles.avatarContainer}>
                    <img 
                      src={friend.avatar || '/api/placeholder/40/40'} 
                      alt={friend.username}
                      className={styles.friendAvatar}
                    />
                    <span 
                      className={styles.statusIndicator}
                      style={{ backgroundColor: getStatusColor(friend.status) }}
                      title={friend.status}
                    ></span>
                  </div>
                  
                  <div className={styles.friendDetails}>
                    <span className={styles.friendName}>{friend.username}</span>
                    <div className={styles.friendMeta}>
                      <span 
                        className={styles.friendDivision}
                        style={{ color: getDivisionColor(friend.division) }}
                      >
                        {friend.division}
                      </span>
                      <span className={styles.friendRating}>Rating: {friend.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.friendStatus}>
                  <span className={styles.statusText}>
                    {friend.status === 'online' ? 'Online now' : 
                     friend.status === 'away' ? 'Away' : 
                     `Last seen ${friend.lastSeen}`}
                  </span>
                </div>
              </div>
              
              <div className={styles.friendActions}>
                <button 
                  className={styles.challengeButton}
                  onClick={() => onChallenge(friend.username)}
                  disabled={friend.status === 'offline'}
                >
                  Challenge
                </button>
                <button 
                  className={styles.messageButton}
                  onClick={() => console.log(`Message ${friend.username}`)}
                >
                  Message
                </button>
                <button 
                  className={styles.removeButton}
                  onClick={() => onRemoveFriend(friend.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>👥</span>
            <span className={styles.emptyText}>No friends yet</span>
            <span className={styles.emptySubtext}>Search for players to add friends</span>
          </div>
        )}
      </div>
      
      <div className={styles.listFooter}>
        <div className={styles.statusSummary}>
          <div className={styles.statusItem}>
            <span className={styles.statusDot} style={{ backgroundColor: '#10b981' }}></span>
            <span className={styles.statusText}>Online: {friends.filter(f => f.status === 'online').length}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusDot} style={{ backgroundColor: '#f59e0b' }}></span>
            <span className={styles.statusText}>Away: {friends.filter(f => f.status === 'away').length}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusDot} style={{ backgroundColor: '#6b7280' }}></span>
            <span className={styles.statusText}>Offline: {friends.filter(f => f.status === 'offline').length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FriendsList