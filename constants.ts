/**
 * Application Constants
 * 
 * Centralized location for all magic numbers, configuration values, and constants
 * used throughout the ThreeGame application. This improves maintainability,
 * consistency, and makes it easier to adjust values across the entire application.
 */

// =============================================================================
// GAME CONFIGURATION CONSTANTS
// =============================================================================

export const GAME_CONFIG = {
  // Grid and Map Settings
  GRID_SIZE: 8,
  DEFAULT_MAP_SEED: 1337,
  DEFAULT_BLOCKED_TILE_COUNT: 8,
  BLOCKED_TILE_MAX_ATTEMPTS: 400,
  EVENT_LOG_LIMIT: 80,
  INITIAL_TURN: 1,
  
  // Map Generation
  MAP_WIDTH: 10,
  MAP_HEIGHT: 8,
  MIN_START_DISTANCE: 6,
  MAX_COVER_TILES: 8,
  MAX_BLOCKING_TILES: 6,
  
  // Game Flow
  MAX_TURNS_PER_MATCH: 15,
  MAX_TURNS_PER_SERIES: 45,
  SERIES_WIN_SCORE: 2,
  TURN_TIME_LIMIT: 60000, // 1 minute in milliseconds
  
  // Unit Scaling
  UNIT_HEALTH_SCALE: 10, // Scale factor for unit health from balance config
} as const;

// =============================================================================
// COMBAT SYSTEM CONSTANTS
// =============================================================================

export const COMBAT = {
  // Base probabilities and multipliers
  BASE_CRIT_CHANCE: 0.15,
  CRIT_MULTIPLIER: 1.5,
  MIN_HIT_CHANCE: 0.05,
  
  // Damage calculations
  DAMAGE_VARIANCE_MIN: -2,
  DAMAGE_VARIANCE_MAX: 3,
  DEFENSE_REDUCTION: 1,
  MAX_DEFENSE_REDUCTION: 4,
  COVER_MITIGATION: 1,
  LOS_BLOCK_CHANCE: 1.0,
  RANGE_PENALTY: 0.1,
  
  // Status effects
  POISON_DAMAGE_PER_TURN: 4,
  POISON_DURATION_TURNS: 2,
  ARMOR_UP_DURATION_TURNS: 1,
  ARMOR_UP_DAMAGE_REDUCTION: 2,
  COVER_MISS_BONUS: 0.3, // Scaled for balance
  
  // Ability effects
  SCOUT_DASH_BONUS_MOVEMENT: 2,
  SNIPER_AIM_CRIT_BONUS: 0.3,
  SNIPER_AIM_MOVE_PENALTY: 1,
  BRUISER_GUARD_DAMAGE_REDUCTION: 2,
} as const;

// =============================================================================
// ABILITY CONFIGURATION CONSTANTS
// =============================================================================

export const ABILITIES = {
  DASH: {
    COOLDOWN: 2,
    RANGE_BONUS: 2,
  },
  GUARD: {
    COOLDOWN: 3,
    MITIGATION: 2,
    DURATION: 1,
  },
  AIM: {
    COOLDOWN: 2,
    CRIT_BONUS: 0.3,
    MOVE_PENALTY: 1,
  },
  SMOKE: {
    COOLDOWN: 4,
    COVER_RADIUS: 2,
    DURATION: 2,
  },
} as const;

// =============================================================================
// UI AND STYLING CONSTANTS
// =============================================================================

export const UI = {
  // Spacing scale (in pixels or rem)
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 20,
    XXL: 24,
    XXXL: 32,
    XXXXL: 40,
  },
  
  // Border radius scale
  BORDER_RADIUS: {
    SM: 8,
    MD: 12,
    LG: 16,
    FULL: 9999,
  },
  
  // Typography scale
  TYPOGRAPHY: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
    XXXXL: 64,
  },
  
  // Animation durations (in milliseconds)
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 600,
    VERY_SLOW: 1000,
  },
  
  // Z-index layers
  Z_INDEX: {
    BACKGROUND: 0,
    BASE: 10,
    NAVBAR: 100,
    MODAL: 1000,
    TOAST: 9999,
  },
  
  // Breakpoints for responsive design
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
  },
} as const;

// =============================================================================
// COLOR CONSTANTS
// =============================================================================

export const COLORS = {
  // Primary brand colors
  PRIMARY: '#3b82f6',
  PRIMARY_HOVER: '#2563eb',
  
  // Secondary colors
  SECONDARY: '#8aa0ff',
  SECONDARY_DARK: '#a78bfa',
  
  // Status colors
  SUCCESS: '#10b981',
  SUCCESS_DARK: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  
  // UI colors
  TEXT_PRIMARY: '#e6eef8',
  TEXT_SECONDARY: '#94a3b8',
  TEXT_DISABLED: '#6b7280',
  
  // Background colors
  BG_PRIMARY: '#0f172a',
  BG_SECONDARY: '#1a1a2e',
  BG_TERTIARY: '#16213e',
  BG_OVERLAY: 'rgba(15, 23, 42, 0.8)',
  
  // Border colors
  BORDER_DEFAULT: 'rgba(255, 255, 255, 0.1)',
  BORDER_HOVER: 'rgba(255, 255, 255, 0.4)',
  BORDER_ACTIVE: 'rgba(255, 255, 255, 0.2)',
  
  // Shadow colors
  SHADOW_PRIMARY: 'rgba(59, 130, 246, 0.3)',
  SHADOW_SECONDARY: 'rgba(138, 166, 255, 0.3)',
  SHADOW_SUCCESS: 'rgba(16, 185, 129, 0.3)',
  SHADOW_WARNING: 'rgba(245, 158, 11, 0.3)',
  SHADOW_ERROR: 'rgba(239, 68, 68, 0.3)',
  
  // Game-specific colors
  TILE_BASE: '#3b82f6',
  TILE_MOVE_REACHABLE: '#60a5fa',
  TILE_ATTACK_REACHABLE: '#f87171',
  TILE_SELECTED: '#f59e0b',
  TILE_HOVER: '#f97316',
  TILE_BLOCKED: '#0b2f68',
  TILE_BUILDING: '#0b2f68',
  
  // Terrain colors
  TILE_TERRAIN_COVER: '#22c55e',
  TILE_TERRAIN_HIGH_GROUND: '#a78bfa',
  TILE_TERRAIN_POISON: '#ef4444',
  
  // Status effect colors
  POISON: '#22c55e',
  ARMOR: '#94a3b8',
  GUARD: '#ffffff',
  AIM: '#3b82f6',
  DASH: '#ffffff',
  
  // Additional UI colors for components
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#64748b',
  GRAY_600: '#475569',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  GRAY_900: '#0f172a',
  
  // Component-specific colors
  COMPONENT_BORDER: 'rgba(255, 255, 255, 0.1)',
  COMPONENT_HOVER: 'rgba(255, 255, 255, 0.1)',
  COMPONENT_ACTIVE: 'rgba(255, 255, 255, 0.2)',
  
  // Gradient colors
  GRADIENT_START: '#1a1a2e',
  GRADIENT_END: '#16213e',
  
  // Theme colors
  THEME_DEFAULT: '#8aa0ff',
  THEME_DARK: '#a78bfa',
  THEME_CYBERPUNK: '#f59e0b',
  THEME_PASTEL: '#10b981',
  
  // Button colors
  BUTTON_PRIMARY: '#8aa0ff',
  BUTTON_PRIMARY_HOVER: '#a78bfa',
  BUTTON_SUCCESS: '#10b981',
  BUTTON_WARNING: '#f59e0b',
  BUTTON_ERROR: '#ef4444',
  BUTTON_INFO: '#1d4ed8',
  
  // Text colors for different contexts
  TEXT_SUCCESS: '#10b981',
  TEXT_WARNING: '#f59e0b',
  TEXT_ERROR: '#ef4444',
  TEXT_INFO: '#1d4ed8',
  
  // Background colors for different states
  BG_SUCCESS: 'rgba(16, 185, 129, 0.1)',
  BG_WARNING: 'rgba(245, 158, 11, 0.1)',
  BG_ERROR: 'rgba(239, 68, 68, 0.1)',
  BG_INFO: 'rgba(29, 78, 216, 0.1)',
  
  // Win/Loss colors
  WIN_COLOR: '#10b981',
  LOSS_COLOR: '#ef4444',
  NEUTRAL_COLOR: '#64748b',
  
  // Activity colors
  ONLINE_COLOR: '#10b981',
  OFFLINE_COLOR: '#64748b',
  
  // Progress colors
  PROGRESS_SUCCESS: '#10b981',
  PROGRESS_WARNING: '#f59e0b',
  PROGRESS_ERROR: '#ef4444',
  
  // Badge colors
  BADGE_SUCCESS: '#10b981',
  BADGE_WARNING: '#f59e0b',
  BADGE_ERROR: '#ef4444',
  BADGE_INFO: '#1d4ed8',
  BADGE_NEUTRAL: '#94a3b8',
} as const;

// =============================================================================
// GAME MECHANICS CONSTANTS
// =============================================================================

export const MECHANICS = {
  // Movement and positioning
  TILE_SIZE: 1,
  MINIMUM_MOVEMENT: 1,
  MAXIMUM_MOVEMENT: 4,
  
  // Line of sight and range
  MINIMUM_RANGE: 1,
  MAXIMUM_RANGE: 4,
  
  // Unit archetypes base stats
  ARCHETYPES: {
    SCOUT: {
      BASE_HP: 4,
      BASE_MOVE: 3,
      BASE_ATTACK: 2,
      BASE_RANGE: 2,
      BASE_DEFENSE: 1,
    },
    SOLDIER: {
      BASE_HP: 6,
      BASE_MOVE: 2,
      BASE_ATTACK: 3,
      BASE_RANGE: 3,
      BASE_DEFENSE: 2,
    },
    HEAVY: {
      BASE_HP: 8,
      BASE_MOVE: 1,
      BASE_ATTACK: 4,
      BASE_RANGE: 2,
      BASE_DEFENSE: 3,
    },
  },
  
  // Progression and scoring
  XP: {
    KILL: 100,
    ASSIST: 50,
    OBJECTIVE: 75,
    SURVIVAL: 25,
  },
  
  LEVEL_UP: {
    HP_INCREASE: 0.2,
    ATTACK_INCREASE: 0.15,
    DEFENSE_INCREASE: 0.1,
  },
} as const;

// =============================================================================
// COMPONENT-SPECIFIC CONSTANTS
// =============================================================================

export const COMPONENTS = {
  // Toast system
  TOAST: {
    DEFAULT_DURATION: 5000,
    MAX_TOASTS: 5,
    POSITION: {
      TOP_RIGHT: 'top-right',
      TOP_LEFT: 'top-left',
      BOTTOM_RIGHT: 'bottom-right',
      BOTTOM_LEFT: 'bottom-left',
      TOP_CENTER: 'top-center',
      BOTTOM_CENTER: 'bottom-center',
    },
  },
  
  // Game board
  BOARD: {
    HIGHLIGHT_MODE: {
      MOVE: 'move',
      ATTACK: 'attack',
    },
  },
  
  // Match settings
  MATCH: {
    TIME_CONTROL: {
      DAILY: 'daily',
      HOURLY: 'hourly',
      REAL_TIME: 'real-time',
    },
    MAX_TURNS: {
      SHORT: 30,
      MEDIUM: 50,
      LONG: 75,
      VERY_LONG: 100,
      UNLIMITED: 0,
    },
  },
  
  // Leaderboard
  LEADERBOARD: {
    RANK_ICONS: {
      1: '🥇',
      2: '🥈',
      3: '🥉',
    },
    DIVISIONS: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
  },
  
  // Achievements
  ACHIEVEMENTS: {
    RARITY: {
      COMMON: 'common',
      RARE: 'rare',
      EPIC: 'epic',
      LEGENDARY: 'legendary',
    },
  },
} as const;

// =============================================================================
// API AND NETWORK CONSTANTS
// =============================================================================

export const API = {
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
    },
    GAME: {
      MATCH: '/api/game/match',
      LEADERBOARD: '/api/game/leaderboard',
      STATS: '/api/game/stats',
    },
    COMMUNITY: {
      FRIENDS: '/api/community/friends',
      PLAYERS: '/api/community/players',
      RANKINGS: '/api/community/rankings',
    },
    SHOP: {
      ITEMS: '/api/shop/items',
      CART: '/api/shop/cart',
      PURCHASE: '/api/shop/purchase',
    },
  },
  
  // Placeholder image sizes
  PLACEHOLDER: {
    AVATAR_SMALL: '/api/placeholder/32/32',
    AVATAR_MEDIUM: '/api/placeholder/40/40',
    AVATAR_LARGE: '/api/placeholder/64/64',
    ITEM_SMALL: '/api/placeholder/36/36',
    ITEM_MEDIUM: '/api/placeholder/60/60',
    ITEM_LARGE: '/api/placeholder/120/120',
  },
  
  // Request timeouts
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 15000,
    LONG: 30000,
    VERY_LONG: 60000,
  },
} as const;

// =============================================================================
// DEVELOPMENT AND DEBUG CONSTANTS
// =============================================================================

export const DEV = {
  // Debug modes
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  LOG_LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  },
  
  // Feature flags
  FEATURES: {
    TOAST_ANIMATIONS: true,
    STATUS_EFFECTS: true,
    ABILITIES: true,
    REPLAY_SYSTEM: true,
    SAVE_SYSTEM: true,
  },
  
  // Mock data settings
  MOCK: {
    ENABLED: process.env.NODE_ENV === 'development',
    PLAYER_COUNT: 15420,
    ONLINE_COUNT: 1234,
  },
} as const;

// =============================================================================
// EXPORT ALL CONSTANTS
// =============================================================================

export const CONSTANTS = {
  GAME_CONFIG,
  COMBAT,
  ABILITIES,
  UI,
  COLORS,
  MECHANICS,
  COMPONENTS,
  API,
  DEV,
} as const;