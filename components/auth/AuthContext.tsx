import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  username: string
  email: string
  displayName?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
  isVerified: boolean
  emailVerifiedAt?: string
  friends?: Friend[]
  isOnline: boolean
}

interface Friend {
  id: string
  username: string
  status: 'online' | 'offline' | 'away'
  lastSeen: string
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  addFriend: (friend: Friend) => void
  removeFriend: (friendId: string) => void
  updateFriendStatus: (friendId: string, status: 'online' | 'offline' | 'away') => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError)
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      const userData = {
        ...data.data.user,
        isOnline: true,
        friends: []
      }

      setUser(userData)
      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      console.log('Registration successful, user set:', userData)
      console.log('Token stored:', data.data.token)
      console.log('Auth state after registration:', { user: userData, isAuthenticated: !!userData })
      
      // Set up real-time updates
      setupRealTimeUpdates(userData.id.toString())
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      console.log('Registration response status:', response.status)
      console.log('Response ok:', response.ok)

      const data = await response.json()
      console.log('Registration response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Check if data structure is what we expect
      if (!data.data || !data.data.user || !data.data.token) {
        console.error('Unexpected response structure:', data)
        throw new Error('Invalid response from server')
      }

      const userData = {
        ...data.data.user,
        isOnline: true,
        friends: []
      }

      setUser(userData)
      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Set up real-time updates
      setupRealTimeUpdates(userData.id.toString())
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      cleanupRealTimeUpdates()
      // Force redirect to auth page to clear any cached state
      if (typeof window !== 'undefined') {
        window.location.href = '/auth'
      }
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const addFriend = (friend: Friend) => {
    if (user) {
      setUser({
        ...user,
        friends: [...(user.friends || []), friend]
      })
    }
  }

  const removeFriend = (friendId: string) => {
    if (user) {
      setUser({
        ...user,
        friends: (user.friends || []).filter(friend => friend.id !== friendId)
      })
    }
  }

  const updateFriendStatus = (friendId: string, status: 'online' | 'offline' | 'away') => {
    if (user) {
      setUser({
        ...user,
        friends: (user.friends || []).map(friend =>
          friend.id === friendId ? { ...friend, status } : friend
        )
      })
    }
  }

  const setupRealTimeUpdates = (userId: string) => {
    // Set up WebSocket or other real-time connections
    console.log(`Setting up real-time updates for user: ${userId}`)
  }

  const cleanupRealTimeUpdates = () => {
    // Clean up WebSocket connections
    console.log('Cleaning up real-time updates')
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    addFriend,
    removeFriend,
    updateFriendStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
