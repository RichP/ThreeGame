/**
 * Environment Configuration
 * 
 * Centralized configuration management for different environments.
 * This allows for easy switching between development, staging, and production settings.
 */

export interface EnvironmentConfig {
  // Application settings
  appName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  
  // Feature flags
  features: {
    toastAnimations: boolean;
    statusEffects: boolean;
    abilities: boolean;
    replaySystem: boolean;
    saveSystem: boolean;
    themeSwitcher: boolean;
    debugMode: boolean;
  };
  
  // API configuration
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  
  // Game configuration
  game: {
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    enableReplay: boolean;
    enableSaveSlots: boolean;
    maxTurnsPerMatch: number;
    turnTimeLimit: number;
  };
  
  // UI configuration
  ui: {
    animationSpeed: 'fast' | 'normal' | 'slow';
    theme: string;
    enableTooltips: boolean;
    enableAnimations: boolean;
  };
  
  // Development settings
  dev: {
    mockData: boolean;
    enableHotReload: boolean;
    enableSourceMaps: boolean;
    logPerformance: boolean;
  };
}

// Default configuration
const defaultConfig: EnvironmentConfig = {
  appName: 'ThreeGame',
  version: '1.0.0',
  environment: process.env.NODE_ENV as 'development' | 'staging' | 'production' || 'development',
  
  features: {
    toastAnimations: true,
    statusEffects: true,
    abilities: true,
    replaySystem: true,
    saveSystem: true,
    themeSwitcher: true,
    debugMode: process.env.NODE_ENV === 'development',
  },
  
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  game: {
    debugMode: process.env.NODE_ENV === 'development',
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    enableReplay: true,
    enableSaveSlots: true,
    maxTurnsPerMatch: 15,
    turnTimeLimit: 60000,
  },
  
  ui: {
    animationSpeed: 'normal',
    theme: 'default',
    enableTooltips: true,
    enableAnimations: true,
  },
  
  dev: {
    mockData: process.env.NODE_ENV === 'development',
    enableHotReload: process.env.NODE_ENV === 'development',
    enableSourceMaps: process.env.NODE_ENV === 'development',
    logPerformance: process.env.NODE_ENV === 'development',
  },
};

// Environment-specific overrides
const environmentOverrides: Partial<Record<typeof defaultConfig.environment, Partial<EnvironmentConfig>>> = {
  development: {
    api: {
      baseUrl: 'http://localhost:3000',
      timeout: 60000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    game: {
      debugMode: true,
      logLevel: 'debug',
      enableReplay: true,
      enableSaveSlots: true,
      maxTurnsPerMatch: 15,
      turnTimeLimit: 60000,
    },
    dev: {
      mockData: true,
      enableHotReload: true,
      enableSourceMaps: true,
      logPerformance: true,
    },
  },
  
  staging: {
    api: {
      baseUrl: process.env.NEXT_PUBLIC_STAGING_API_URL || 'https://staging-api.threegame.com',
      timeout: 45000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    game: {
      debugMode: false,
      logLevel: 'warn',
      enableReplay: true,
      enableSaveSlots: true,
      maxTurnsPerMatch: 15,
      turnTimeLimit: 60000,
    },
    dev: {
      mockData: false,
      enableHotReload: false,
      enableSourceMaps: false,
      logPerformance: false,
    },
  },
  
  production: {
    api: {
      baseUrl: process.env.NEXT_PUBLIC_PROD_API_URL || 'https://api.threegame.com',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    game: {
      debugMode: false,
      logLevel: 'error',
      enableReplay: true,
      enableSaveSlots: true,
      maxTurnsPerMatch: 15,
      turnTimeLimit: 60000,
    },
    dev: {
      mockData: false,
      enableHotReload: false,
      enableSourceMaps: false,
      logPerformance: false,
    },
  },
};

/**
 * Merge default configuration with environment-specific overrides
 */
function mergeConfig(base: EnvironmentConfig, overrides?: Partial<EnvironmentConfig>): EnvironmentConfig {
  return {
    ...base,
    ...overrides,
    features: {
      ...base.features,
      ...overrides?.features,
    },
    api: {
      ...base.api,
      ...overrides?.api,
    },
    game: {
      ...base.game,
      ...overrides?.game,
    },
    ui: {
      ...base.ui,
      ...overrides?.ui,
    },
    dev: {
      ...base.dev,
      ...overrides?.dev,
    },
  };
}

/**
 * Get the current environment configuration
 */
export function getConfig(): EnvironmentConfig {
  const env = defaultConfig.environment;
  const overrides = environmentOverrides[env];
  return mergeConfig(defaultConfig, overrides);
}

/**
 * Get a specific configuration value
 */
export function getConfigValue<T>(path: string, defaultValue?: T): T {
  const config = getConfig();
  const keys = path.split('.');
  let value: any = config;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue as T;
    }
  }
  
  return value;
}

/**
 * Update configuration at runtime (for development/debugging)
 */
export function updateConfig(updates: Partial<EnvironmentConfig>): void {
  if (process.env.NODE_ENV === 'development') {
    Object.assign(defaultConfig, updates);
  }
}

// Export the current configuration
export const config = getConfig();

// Export for use in components
export default config;