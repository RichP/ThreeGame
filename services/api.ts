import { User, Friend, Match, LeaderboardEntry, ShopItem, PurchaseResult } from '../types'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

// API Response interface
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Authentication API
export const authApi = {
  async login(username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Login failed', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error during login', error)
    }
  },

  async register(username: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Registration failed', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error during registration', error)
    }
  },

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Token refresh failed', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error during token refresh', error)
    }
  },

  async logout(): Promise<ApiResponse<void>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        return { success: true } // Already logged out
      }

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Log out anyway even if server fails
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        throw new ApiError(response.status, 'Logout failed', response.statusText)
      }

      localStorage.removeItem('authToken')
      localStorage.removeItem('user')

      return {
        success: true,
      }
    } catch (error) {
      // Always clear local storage on logout
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error during logout', error)
    }
  },
}

// User API
export const userApi = {
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to fetch profile', data)
      }

      return {
        success: true,
        data: data.data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error fetching profile', error)
    }
  },

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to update profile', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error updating profile', error)
    }
  },

  async getMatchHistory(page: number = 1, limit: number = 20): Promise<ApiResponse<{ matches: Match[]; total: number }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/users/matches?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to fetch match history', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error fetching match history', error)
    }
  },

  async getAchievements(): Promise<ApiResponse<{ achievements: any[] }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/users/achievements`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to fetch achievements', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error fetching achievements', error)
    }
  },
}

// Friends API
export const friendsApi = {
  async getFriendsList(): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) throw new ApiError(401, 'No auth token')
      const response = await fetch(`${API_BASE_URL}/community/friends`, {
        method: 'GET',
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new ApiError(response.status, result.error || 'Failed to fetch friends')
      return { success: true, data: result.data }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error', error)
    }
  },

  async sendFriendRequest(targetUserId: number, message?: string): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) throw new ApiError(401, 'No auth token')
      const response = await fetch(`${API_BASE_URL}/community/friends/request`, {
        method: 'POST',
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUserId, message }),
      })
      const result = await response.json()
      if (!response.ok) throw new ApiError(response.status, result.error || 'Failed to send request')
      return { success: true, data: result.data }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error', error)
    }
  },

  async acceptFriendRequest(requestId: number): Promise<ApiResponse<void>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) throw new ApiError(401, 'No auth token')
      const response = await fetch(`${API_BASE_URL}/community/friends/${requestId}/accept`, {
        method: 'POST',
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const result = await response.json()
        throw new ApiError(response.status, result.error || 'Failed to accept')
      }
      return { success: true }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error', error)
    }
  },

  async declineFriendRequest(requestId: number): Promise<ApiResponse<void>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) throw new ApiError(401, 'No auth token')
      const response = await fetch(`${API_BASE_URL}/community/friends/${requestId}/decline`, {
        method: 'POST',
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const result = await response.json()
        throw new ApiError(response.status, result.error || 'Failed to decline')
      }
      return { success: true }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error', error)
    }
  },

  async removeFriend(friendId: number): Promise<ApiResponse<void>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) throw new ApiError(401, 'No auth token')
      const response = await fetch(`${API_BASE_URL}/community/friends/${friendId}`, {
        method: 'DELETE',
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const result = await response.json()
        throw new ApiError(response.status, result.error || 'Failed to remove friend')
      }
      return { success: true }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error', error)
    }
  },

  async searchUsers(query: string, limit?: number): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) throw new ApiError(401, 'No auth token')
      const url = new URL(`${API_BASE_URL}/community/friends/search`)
      url.searchParams.append('query', query)
      if (limit) url.searchParams.append('limit', limit.toString())
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new ApiError(response.status, result.error || 'Failed to search')
      return { success: true, data: result.data }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error', error)
    }
  },

  async getFriendshipStatus(targetUserId: number): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) throw new ApiError(401, 'No auth token')
      const response = await fetch(`${API_BASE_URL}/community/friends/status/${targetUserId}`, {
        method: 'GET',
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new ApiError(response.status, result.error || 'Failed to get status')
      return { success: true, data: result.data }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error', error)
    }
  }
}

// Community API
export const communityApi = {
  async getPlayerStats(userId: number): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/community/stats/${userId}`, {
        method: 'GET',
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new ApiError(response.status, result.error || 'Failed to get stats')
      return { success: true, data: result.data }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error getting stats', error)
    }
  },

  async getLeaderboard(filter: any): Promise<ApiResponse<any>> {
    try {
      const query = new URLSearchParams(filter as any).toString()
      const response = await fetch(`${API_BASE_URL}/community/leaderboard?${query}`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      })
      const result = await response.json()
      if (!response.ok) throw new ApiError(response.status, result.error || 'Failed to get leaderboard')
      return { success: true, data: result.data }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error getting leaderboard', error)
    }
  },

  async getPlayerPosition(userId: number, seasonId?: number): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('authToken')
      const url = new URL(`${API_BASE_URL}/community/leaderboard/${userId}/position`)
      if (seasonId) url.searchParams.append('seasonId', seasonId.toString())
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` }
      })
      const result = await response.json()
      if (!response.ok) throw new ApiError(response.status, result.error || 'Failed to get position')
      return { success: true, data: result.data }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error getting position', error)
    }
  },

  async recordMatchResult(userId: number, matchData: any): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/community/stats/${userId}/record-match`, {
        method: 'POST',
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` },
        body: JSON.stringify(matchData)
      })
      const result = await response.json()
      if (!response.ok) throw new ApiError(response.status, result.error || 'Failed to record match')
      return { success: true, data: result.data }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error recording match', error)
    }
  },

  async getLeaderboardStats(seasonId?: number): Promise<ApiResponse<any>> {
    try {
      const url = seasonId
        ? `${API_BASE_URL}/community/leaderboard/stats?seasonId=${seasonId}`
        : `${API_BASE_URL}/community/leaderboard/stats`
      const response = await fetch(url, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      })
      const result = await response.json()
      if (!response.ok) throw new ApiError(response.status, result.error || 'Failed to get leaderboard stats')
      return { success: true, data: result.data }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Network error getting leaderboard stats', error)
    }
  }
}

// Shop API
export const shopApi = {
  async getShopItems(): Promise<ApiResponse<{ items: ShopItem[] }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/shop/items`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to fetch shop items', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error fetching shop items', error)
    }
  },

  async purchaseItem(itemId: string): Promise<ApiResponse<PurchaseResult>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/shop/purchase`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Purchase failed', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error processing purchase', error)
    }
  },

  async getInventory(): Promise<ApiResponse<{ items: ShopItem[] }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/shop/inventory`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to fetch inventory', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error fetching inventory', error)
    }
  },
}

// Match API
export const matchApi = {
  async createMatch(gameMode: string, settings?: any, matchCode?: string): Promise<ApiResponse<{ match: any; participants: any[] }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/matches`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameMode, settings, matchCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to create match', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error creating match', error)
    }
  },

  async findMatch(gameMode: string, region?: string, skillRating?: number): Promise<ApiResponse<{ matchId: string; opponents: any[] }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/matches/find`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameMode, region, skillRating }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to find match', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error finding match', error)
    }
  },

  async getMatch(matchId: string): Promise<ApiResponse<{ match: any; gameState: any; participants: any[] }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to get match', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error getting match', error)
    }
  },

  async executeAction(matchId: string, actionType: string, actionData: any): Promise<ApiResponse<{ gameState: any; event: any }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/action`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matchId, actionType, actionData }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to execute action', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error executing action', error)
    }
  },

  async setMatchReady(matchId: string, isReady: boolean): Promise<ApiResponse<{ participant: any; allReady: boolean }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/ready`, {
        method: 'PUT',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isReady }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to set match ready', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error setting match ready', error)
    }
  },

  async cancelMatch(matchId: string): Promise<ApiResponse<void>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: 'DELETE',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new ApiError(response.status, data.error || 'Failed to cancel match', data)
      }

      return {
        success: true,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error canceling match', error)
    }
  },

  async getMatchReplay(matchId: string): Promise<ApiResponse<{ match: any; events: any[]; states: any[] }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/replay`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to get match replay', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error getting match replay', error)
    }
  },

  async listMatches(filters?: { status?: string; gameMode?: string; page?: number; limit?: number }): Promise<ApiResponse<{ data: { matches: any[]; total: number; page: number; limit: number } }>> {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.gameMode) params.append('gameMode', filters.gameMode)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`${API_BASE_URL}/matches?${params.toString()}`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to list matches', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error listing matches', error)
    }
  },

  async getMatchHistory(page: number = 1, limit: number = 20): Promise<ApiResponse<{ matches: any[]; total: number; page: number; limit: number }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/matches/history?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to get match history', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error getting match history', error)
    }
  },

  async getActiveMatches(): Promise<ApiResponse<{ matches: any[] }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/matches/active`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to get active matches', data)
      }

      // Return data with matches property for consistency
      return {
        success: true,
        data: {
          matches: Array.isArray(data.data) ? data.data : (data.data?.matches || [])
        },
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error getting active matches', error)
    }
  },

  async skipTurn(matchId: string): Promise<ApiResponse<{ gameState: any; event: any }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/skip-turn`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to skip turn', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error skipping turn', error)
    }
  },

  async undoAction(matchId: string): Promise<ApiResponse<{ gameState: any; event: any }>> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new ApiError(401, 'No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/undo`, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Failed to undo action', data)
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, 'Network error undoing action', error)
    }
  },
}

// Utility function to handle common API errors
export const handleApiError = (error: ApiError): string => {
  switch (error.status) {
    case 401:
      return 'Authentication required. Please log in again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 422:
      return error.message || 'Invalid data provided.'
    case 429:
      return 'Too many requests. Please try again later.'
    case 500:
      return 'Server error. Please try again later.'
    case 503:
      return 'Service temporarily unavailable. Please try again later.'
    default:
      return error.message || 'An unexpected error occurred.'
  }
}

// Request interceptor for adding auth headers
const addAuthHeader = (headers: HeadersInit = {}): HeadersInit => {
  const token = localStorage.getItem('authToken')
  return {
    ...headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Response interceptor for handling common responses
const handleResponse = async (response: Response): Promise<any> => {
  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    throw new ApiError(response.status, data?.error || response.statusText, data)
  }

  return data
}
