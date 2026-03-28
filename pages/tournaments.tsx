import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../components/auth/AuthContext'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { tournamentApi } from '../services/api'
import styles from './tournaments.module.css'

interface Tournament {
  id: number
  name: string
  description?: string
  gameMode: string
  startTime: string
  endTime: string
  status: string
  prizePool: number
  maxParticipants?: number
  participantCount: number
}

export default function TournamentsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'registration' | 'active' | 'completed'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    gameMode: 'classic',
    startTime: '',
    endTime: '',
    prizePool: 0,
    maxParticipants: 16
  })

  useEffect(() => {
    fetchTournaments()
  }, [filter])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const filterObj: any = {}
      if (filter !== 'all') {
        filterObj.status = filter
      }
      const response = await tournamentApi.listTournaments(filterObj)
      if (response.success && response.data) {
        setTournaments(response.data.tournaments || [])
      } else {
        setTournaments([])
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      setTournaments([])
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (tournamentId: number) => {
    try {
      const response = await tournamentApi.registerForTournament(tournamentId)
      if (response.success) {
        fetchTournaments()
        alert('Successfully registered for tournament!')
      }
    } catch (error) {
      console.error('Error registering for tournament:', error)
      alert('Failed to register for tournament')
    }
  }

  const handleUnregister = async (tournamentId: number) => {
    try {
      const response = await tournamentApi.unregisterFromTournament(tournamentId)
      if (response.success) {
        fetchTournaments()
        alert('Successfully unregistered from tournament')
      }
    } catch (error) {
      console.error('Error unregistering from tournament:', error)
      alert('Failed to unregister from tournament')
    }
  }

  const handleCreateTournament = async () => {
    try {
      const response = await tournamentApi.createTournament({
        name: newTournament.name,
        description: newTournament.description,
        gameMode: newTournament.gameMode,
        startTime: new Date(newTournament.startTime).toISOString(),
        endTime: new Date(newTournament.endTime).toISOString(),
        prizePool: newTournament.prizePool,
        maxParticipants: newTournament.maxParticipants
      })
      if (response.success) {
        setShowCreateModal(false)
        setNewTournament({
          name: '',
          description: '',
          gameMode: 'classic',
          startTime: '',
          endTime: '',
          prizePool: 0,
          maxParticipants: 16
        })
        fetchTournaments()
        alert('Tournament created successfully!')
      }
    } catch (error) {
      console.error('Error creating tournament:', error)
      alert('Failed to create tournament')
    }
  }

  const handleViewDetails = async (tournamentId: number) => {
    try {
      const response = await tournamentApi.getTournament(tournamentId)
      if (response.success && response.data) {
        setSelectedTournament(response.data)
      }
    } catch (error) {
      console.error('Error fetching tournament details:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration': return '#22c55e'
      case 'active': return '#3b82f6'
      case 'completed': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registration': return 'Registration Open'
      case 'active': return 'In Progress'
      case 'completed': return 'Completed'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className={styles.tournaments}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading tournaments...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className={styles.tournaments}>
        <div className={styles.tournamentsHeader}>
          <h1 className={styles.title}>Tournaments</h1>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            Create Tournament
          </button>
        </div>

        <div className={styles.filters}>
          <button 
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'registration' ? styles.active : ''}`}
            onClick={() => setFilter('registration')}
          >
            Registration Open
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'active' ? styles.active : ''}`}
            onClick={() => setFilter('active')}
          >
            In Progress
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        <div className={styles.tournamentsList}>
          {loading ? (
            <div className={styles.loadingSpinner}></div>
          ) : tournaments.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏆</div>
              <h3>No Tournaments Found</h3>
              <p>Check back later for upcoming tournaments or create your own!</p>
            </div>
          ) : (
            tournaments.map((tournament) => (
              <div key={tournament.id} className={styles.tournamentCard}>
                <div className={styles.tournamentHeader}>
                  <h3 className={styles.tournamentName}>{tournament.name}</h3>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(tournament.status) }}
                  >
                    {getStatusText(tournament.status)}
                  </span>
                </div>
                
                {tournament.description && (
                  <p className={styles.tournamentDescription}>{tournament.description}</p>
                )}
                
                <div className={styles.tournamentInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Game Mode:</span>
                    <span className={styles.infoValue}>{tournament.gameMode}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Start:</span>
                    <span className={styles.infoValue}>{formatDate(tournament.startTime)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>End:</span>
                    <span className={styles.infoValue}>{formatDate(tournament.endTime)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Prize Pool:</span>
                    <span className={styles.infoValue}>{tournament.prizePool.toLocaleString()} coins</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Participants:</span>
                    <span className={styles.infoValue}>
                      {tournament.participantCount}
                      {tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ''}
                    </span>
                  </div>
                </div>
                
                <div className={styles.tournamentActions}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewDetails(tournament.id)}
                  >
                    View Details
                  </button>
                  
                  {tournament.status === 'registration' && (
                    <button 
                      className={styles.registerButton}
                      onClick={() => handleRegister(tournament.id)}
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tournament Details Modal */}
        {selectedTournament && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>{selectedTournament.name}</h3>
              {selectedTournament.description && (
                <p className={styles.modalDescription}>{selectedTournament.description}</p>
              )}
              
              <div className={styles.modalInfo}>
                <div className={styles.modalInfoItem}>
                  <span className={styles.modalInfoLabel}>Status:</span>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(selectedTournament.status) }}
                  >
                    {getStatusText(selectedTournament.status)}
                  </span>
                </div>
                <div className={styles.modalInfoItem}>
                  <span className={styles.modalInfoLabel}>Game Mode:</span>
                  <span>{selectedTournament.gameMode}</span>
                </div>
                <div className={styles.modalInfoItem}>
                  <span className={styles.modalInfoLabel}>Start Time:</span>
                  <span>{formatDate(selectedTournament.startTime)}</span>
                </div>
                <div className={styles.modalInfoItem}>
                  <span className={styles.modalInfoLabel}>End Time:</span>
                  <span>{formatDate(selectedTournament.endTime)}</span>
                </div>
                <div className={styles.modalInfoItem}>
                  <span className={styles.modalInfoLabel}>Prize Pool:</span>
                  <span>{selectedTournament.prizePool.toLocaleString()} coins</span>
                </div>
                <div className={styles.modalInfoItem}>
                  <span className={styles.modalInfoLabel}>Participants:</span>
                  <span>
                    {selectedTournament.participantCount}
                    {selectedTournament.maxParticipants ? ` / ${selectedTournament.maxParticipants}` : ''}
                  </span>
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button onClick={() => setSelectedTournament(null)}>Close</button>
                {selectedTournament.status === 'registration' && (
                  <button onClick={() => {
                    handleRegister(selectedTournament.id)
                    setSelectedTournament(null)
                  }}>
                    Register
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Tournament Modal */}
        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Create New Tournament</h3>
              
              <input
                type="text"
                placeholder="Tournament name"
                value={newTournament.name}
                onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
              />
              
              <textarea
                placeholder="Description (optional)"
                value={newTournament.description}
                onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
              />
              
              <select
                value={newTournament.gameMode}
                onChange={(e) => setNewTournament({...newTournament, gameMode: e.target.value})}
              >
                <option value="classic">Classic</option>
                <option value="ranked">Ranked</option>
                <option value="casual">Casual</option>
              </select>
              
              <label>Start Time:</label>
              <input
                type="datetime-local"
                value={newTournament.startTime}
                onChange={(e) => setNewTournament({...newTournament, startTime: e.target.value})}
              />
              
              <label>End Time:</label>
              <input
                type="datetime-local"
                value={newTournament.endTime}
                onChange={(e) => setNewTournament({...newTournament, endTime: e.target.value})}
              />
              
              <input
                type="number"
                placeholder="Prize Pool (coins)"
                value={newTournament.prizePool}
                onChange={(e) => setNewTournament({...newTournament, prizePool: parseInt(e.target.value) || 0})}
              />
              
              <input
                type="number"
                placeholder="Max Participants"
                value={newTournament.maxParticipants}
                onChange={(e) => setNewTournament({...newTournament, maxParticipants: parseInt(e.target.value) || 16})}
              />
              
              <div className={styles.modalActions}>
                <button onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button 
                  onClick={handleCreateTournament}
                  disabled={!newTournament.name || !newTournament.startTime || !newTournament.endTime}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}