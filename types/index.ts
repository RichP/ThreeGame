// User Types
export interface User {
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
  createdAt: string
  lastLogin: string
  settings: UserSettings
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    gameUpdates: boolean
    friendActivity: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    matchHistoryVisibility: 'public' | 'friends' | 'private'
    showEmail: boolean
  }
  game: {
    soundEffects: boolean
    music: boolean
    animations: boolean
    autoSave: boolean
  }
}

// Friend Types
export interface Friend {
  id: string
  username: string
  status: 'online' | 'offline' | 'away'
  lastSeen: string
  avatar?: string
  rating: number
  division: string
  isOnline: boolean
  isFriend: boolean
  isPending: boolean
  isBlocked: boolean
}

// Match Types
export interface Match {
  id: string
  gameId: string
  mode: 'ranked' | 'casual' | 'tournament'
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
  players: MatchPlayer[]
  startTime: string
  endTime?: string
  winnerId?: string
  turns: MatchTurn[]
  gameState: any
  createdAt: string
  updatedAt: string
}

export interface MatchPlayer {
  userId: string
  username: string
  rating: number
  division: string
  isReady: boolean
  hasWon: boolean
  score: number
  units: Unit[]
  resources: Resources
}

export interface MatchTurn {
  turnNumber: number
  playerId: string
  actions: MatchAction[]
  timestamp: string
}

export interface MatchAction {
  type: 'move' | 'attack' | 'build' | 'upgrade' | 'special'
  target: { x: number; y: number }
  unitId?: string
  actionData: any
}

export interface Unit {
  id: string
  type: string
  level: number
  health: number
  attack: number
  defense: number
  movement: number
  position: { x: number; y: number }
  abilities: Ability[]
  upgrades: Upgrade[]
}

export interface Ability {
  id: string
  name: string
  description: string
  cooldown: number
  range: number
  damage?: number
  effect?: string
}

export interface Upgrade {
  id: string
  name: string
  description: string
  cost: Resources
  requirements: any
}

export interface Resources {
  gold: number
  wood: number
  stone: number
  food: number
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar?: string
  rating: number
  division: string
  wins: number
  losses: number
  winRate: number
  lastUpdated: string
  region?: string
}

export interface LeaderboardStats {
  totalUsers: number
  activeUsers: number
  averageRating: number
  topPlayer: LeaderboardEntry
  regionalStats: RegionalStats[]
}

export interface RegionalStats {
  region: string
  totalUsers: number
  averageRating: number
  topPlayer: LeaderboardEntry
}

// Shop Types
export interface ShopItem {
  id: string
  name: string
  description: string
  type: 'cosmetic' | 'boost' | 'bundle' | 'special'
  category: 'avatar' | 'theme' | 'emote' | 'effect' | 'resource'
  price: number
  currency: 'gold' | 'gems' | 'real'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  image: string
  isAvailable: boolean
  isOwned: boolean
  requirements: any
  metadata: any
}

export interface PurchaseResult {
  success: boolean
  itemId: string
  transactionId: string
  newBalance: {
    gold: number
    gems: number
  }
  itemData: ShopItem
  message: string
}

export interface InventoryItem {
  id: string
  userId: string
  itemId: string
  purchasedAt: string
  expiresAt?: string
  isActive: boolean
  metadata: any
}

export interface ShopBundle {
  id: string
  name: string
  description: string
  items: ShopItem[]
  originalPrice: number
  discountedPrice: number
  discountPercentage: number
  isLimitedTime: boolean
  expiresAt?: string
}

// Game Types
export interface GameConfig {
  boardSize: { width: number; height: number }
  unitTypes: UnitType[]
  resourceTypes: ResourceType[]
  abilities: AbilityType[]
  upgrades: UpgradeType[]
  gameRules: GameRules
}

export interface UnitType {
  id: string
  name: string
  description: string
  baseStats: {
    health: number
    attack: number
    defense: number
    movement: number
    range: number
  }
  cost: Resources
  abilities: string[]
  upgrades: string[]
  requirements: any
}

export interface ResourceType {
  id: string
  name: string
  description: string
  maxCapacity: number
  regenerationRate: number
  isCollectable: boolean
}

export interface AbilityType {
  id: string
  name: string
  description: string
  cooldown: number
  range: number
  targetType: 'unit' | 'area' | 'self'
  effectType: 'damage' | 'heal' | 'buff' | 'debuff' | 'utility'
  baseEffect: any
}

export interface UpgradeType {
  id: string
  name: string
  description: string
  cost: Resources
  requirements: any
  effects: any
}

export interface GameRules {
  winConditions: string[]
  timeLimit?: number
  resourceLimits: any
  unitLimits: any
  specialRules: string[]
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: 'game' | 'social' | 'system' | 'achievement'
  title: string
  message: string
  data: any
  isRead: boolean
  createdAt: string
  readAt?: string
}

// Achievement Types
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress: number
  maxProgress: number
  isUnlocked: boolean
  unlockedAt?: string
  rewards: AchievementReward[]
}

export interface AchievementReward {
  type: 'xp' | 'gold' | 'gems' | 'item' | 'title'
  amount: number
  itemId?: string
}

// Tournament Types
export interface Tournament {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  entryFee: number
  prizePool: number
  maxParticipants: number
  currentParticipants: number
  status: 'registration' | 'active' | 'completed'
  format: 'single_elimination' | 'double_elimination' | 'round_robin'
  matches: Match[]
  leaderboard: LeaderboardEntry[]
  rules: string[]
}

// Chat Types
export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  type: 'text' | 'emote' | 'system'
  timestamp: string
  roomId: string
  isRead: boolean
}

export interface ChatRoom {
  id: string
  name: string
  type: 'global' | 'friend' | 'match' | 'tournament'
  participants: string[]
  messages: ChatMessage[]
  createdAt: string
  lastActivity: string
}

// Analytics Types
export interface GameAnalytics {
  userId: string
  sessionId: string
  gameDuration: number
  actionsPerformed: number
  decisionsMade: number
  winRate: number
  preferredUnits: string[]
  playTimeDistribution: any
  sessionData: SessionData[]
}

export interface SessionData {
  sessionId: string
  startTime: string
  endTime: string
  duration: number
  actions: UserAction[]
  performanceMetrics: any
}

export interface UserAction {
  type: string
  timestamp: string
  data: any
  context: any
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  status: number
  message: string
  details?: any
}

// WebSocket Types
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
  userId?: string
}

export interface MatchUpdate {
  matchId: string
  type: 'turn' | 'move' | 'attack' | 'win' | 'surrender'
  data: any
  timestamp: string
}

export interface UserStatusUpdate {
  userId: string
  status: 'online' | 'offline' | 'away'
  lastSeen: string
  currentMatch?: string
}

// Utility Types
export type UserRole = 'user' | 'moderator' | 'admin'
export type GameMode = 'ranked' | 'casual' | 'tournament' | 'practice'
export type MatchStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled'
export type NotificationType = 'game' | 'social' | 'system' | 'achievement'
export type ShopItemType = 'cosmetic' | 'boost' | 'bundle' | 'special'
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'