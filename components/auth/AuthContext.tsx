import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  rating: number
  division: string
  level: number
  xp: number
  friends: Friend[]
  isOnline: boolean
}

interface Friend {
  id: string
  username: string
  status: 'online' | 'offline' | 'away'
  lastSeen: string
  avatar?: string
  rating: number
  division: string
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check if user is logged in (could be from localStorage, cookies, or API)
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
      
      // Mock API call - replace with actual API
      const response = await mockLoginAPI(username, password)
      
      if (response.success) {
        const userData = response.user
        // Force immediate state update
        setUser(prevUser => {
          const newUser = { ...userData }
          // Store in localStorage immediately
          localStorage.setItem('authToken', response.token)
          localStorage.setItem('user', JSON.stringify(newUser))
          return newUser
        })
        
        // Set up real-time updates
        setupRealTimeUpdates(userData.id)
      } else {
        throw new Error(response.error || 'Login failed')
      }
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
      
      // Mock API call - replace with actual API
      const response = await mockRegisterAPI(username, email, password)
      
      if (response.success) {
        const userData = response.user
        setUser(userData)
        localStorage.setItem('authToken', response.token)
        
        // Set up real-time updates
        setupRealTimeUpdates(userData.id)
      } else {
        throw new Error(response.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('authToken')
    // Clean up real-time connections
    cleanupRealTimeUpdates()
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const addFriend = (friend: Friend) => {
    if (user) {
      setUser({
        ...user,
        friends: [...user.friends, friend]
      })
    }
  }

  const removeFriend = (friendId: string) => {
    if (user) {
      setUser({
        ...user,
        friends: user.friends.filter(friend => friend.id !== friendId)
      })
    }
  }

  const updateFriendStatus = (friendId: string, status: 'online' | 'offline' | 'away') => {
    if (user) {
      setUser({
        ...user,
        friends: user.friends.map(friend =>
          friend.id === friendId ? { ...friend, status } : friend
        )
      })
    }
  }

  // Mock API functions (replace with actual API calls)
  const mockLoginAPI = async (username: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock successful login
    return {
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 'user-123',
        username,
        email: `${username}@example.com`,
        avatar: `/api/placeholder/64/64`,
        rating: 1650,
        division: 'Gold',
        level: 15,
        xp: 2500,
        friends: [
          {
            id: 'friend-1',
            username: 'StrategicMaster',
            status: 'online' as const,
            lastSeen: 'Just now',
            avatar: '/api/placeholder/32/32',
            rating: 1850,
            division: 'Platinum'
          },
          {
            id: 'friend-2',
            username: 'TacticalGenius',
            status: 'away' as const,
            lastSeen: '5 minutes ago',
            avatar: '/api/placeholder/32/32',
            rating: 1720,
            division: 'Gold'
          }
        ],
        isOnline: true
      },
      error: undefined
    }
  }

  const mockRegisterAPI = async (username: string, email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock successful registration
    return {
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 'user-new',
        username,
        email,
        avatar: `/api/placeholder/64/64`,
        rating: 1200,
        division: 'Bronze',
        level: 1,
        xp: 0,
        friends: [],
        isOnline: true
      },
      error: undefined
    }
  }

  const verifyToken = async (token: string) => {
    // Mock token verification
    return {
      id: 'user-123',
      username: 'player123',
      email: 'player123@example.com',
      avatar: `/api/placeholder/64/64`,
      rating: 1650,
      division: 'Gold',
      level: 15,
      xp: 2500,
      friends: [],
      isOnline: true
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