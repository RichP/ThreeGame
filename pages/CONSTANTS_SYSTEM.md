# Constants System Documentation

## Overview

The ThreeGame application now features a comprehensive constants system that centralizes all magic numbers, configuration values, and constants used throughout the application. This system improves maintainability, consistency, and makes it easier to adjust values across the entire application.

## Table of Contents

1. [Architecture](#architecture)
2. [Constants Categories](#constants-categories)
3. [Usage Examples](#usage-examples)
4. [Theme System](#theme-system)
5. [Configuration Management](#configuration-management)
6. [Migration Guide](#migration-guide)
7. [Best Practices](#best-practices)

## Architecture

The constants system is organized into several layers:

### 1. Core Constants (`constants.ts`)
- **Location**: `/constants.ts`
- **Purpose**: Central repository for all application constants
- **Structure**: Organized by functional areas

### 2. CSS Variables (`styles/globals.css`)
- **Location**: `/styles/globals.css`
- **Purpose**: CSS custom properties for consistent theming
- **Integration**: Maps to TypeScript constants

### 3. Theme System (`components/theme/`)
- **Location**: `/components/theme/`
- **Purpose**: Dynamic theme switching capability
- **Features**: Multiple predefined themes with runtime switching

### 4. Configuration Management (`config/environment.ts`)
- **Location**: `/config/environment.ts`
- **Purpose**: Environment-specific configuration
- **Features**: Development, staging, and production configurations

## Constants Categories

### Game Configuration (`CONSTANTS.GAME_CONFIG`)
```typescript
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
  TURN_TIME_LIMIT: 60000,
  
  // Unit Scaling
  UNIT_HEALTH_SCALE: 10,
};
```

### Combat System (`CONSTANTS.COMBAT`)
```typescript
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
  COVER_MISS_BONUS: 0.3,
  
  // Ability effects
  SCOUT_DASH_BONUS_MOVEMENT: 2,
  SNIPER_AIM_CRIT_BONUS: 0.3,
  SNIPER_AIM_MOVE_PENALTY: 1,
  BRUISER_GUARD_DAMAGE_REDUCTION: 2,
};
```

### UI and Styling (`CONSTANTS.UI`)
```typescript
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
};
```

### Colors (`CONSTANTS.COLORS`)
```typescript
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
  
  // Status effect colors
  POISON: '#22c55e',
  ARMOR: '#94a3b8',
  GUARD: '#ffffff',
  AIM: '#3b82f6',
  DASH: '#ffffff',
};
```

## Usage Examples

### TypeScript Usage

```typescript
import { CONSTANTS } from '../constants';

// Game configuration
const gridSize = CONSTANTS.GAME_CONFIG.GRID_SIZE;
const maxTurns = CONSTANTS.GAME_CONFIG.MAX_TURNS_PER_MATCH;

// Combat calculations
const critChance = CONSTANTS.COMBAT.BASE_CRIT_CHANCE;
const damageVariance = CONSTANTS.COMBAT.DAMAGE_VARIANCE_MAX;

// UI styling
const spacing = CONSTANTS.UI.SPACING.MD;
const borderRadius = CONSTANTS.UI.BORDER_RADIUS.LG;
```

### CSS Usage

```css
/* Before (hardcoded values) */
.component {
  padding: 16px;
  border-radius: 12px;
  background: #0f172a;
  color: #e6eef8;
}

/* After (using CSS variables) */
.component {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### React Component Usage

```tsx
import React from 'react';
import { CONSTANTS } from '../../constants';

const GameBoard: React.FC = () => {
  return (
    <div 
      style={{
        gridTemplateColumns: `repeat(${CONSTANTS.GAME_CONFIG.GRID_SIZE}, 1fr)`,
        gap: CONSTANTS.UI.SPACING.MD,
      }}
    >
      {/* Board content */}
    </div>
  );
};
```

## Theme System

### Overview

The theme system allows for dynamic theme switching with predefined themes:

- **Default**: Standard dark theme
- **Dark**: Enhanced dark theme
- **Cyberpunk**: Neon cyberpunk theme
- **Pastel**: Soft pastel theme

### Usage

```tsx
import { useTheme } from '../components/theme/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, themeNames } = useTheme();
  
  return (
    <select value={theme.name} onChange={(e) => setTheme(e.target.value)}>
      {themeNames.map(name => (
        <option key={name} value={name}>{themes[name].name}</option>
      ))}
    </select>
  );
};
```

### Creating Custom Themes

```typescript
// Add to components/theme/ThemeContext.tsx
export const themes = {
  // ... existing themes
  custom: {
    name: 'Custom Theme',
    colors: {
      // Define all color values
      primary: '#your-color',
      // ...
    },
  },
};
```

## Configuration Management

### Environment Configuration

The configuration system supports different environments:

```typescript
import { config, getConfigValue } from '../config/environment';

// Get current configuration
const currentConfig = config;

// Get specific values
const apiTimeout = getConfigValue('api.timeout', 30000);
const isDebugMode = getConfigValue('game.debugMode', false);

// Update configuration (development only)
if (process.env.NODE_ENV === 'development') {
  updateConfig({
    game: {
      debugMode: true,
      logLevel: 'debug',
    },
  });
}
```

### Environment Variables

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Staging
NEXT_PUBLIC_STAGING_API_URL=https://staging-api.threegame.com

# Production
NEXT_PUBLIC_PROD_API_URL=https://api.threegame.com
```

## Migration Guide

### Step 1: Identify Magic Numbers

Search for hardcoded values in your code:

```bash
# Find hardcoded numbers
grep -r "\b[0-9]\{2,\}\b" src/ --include="*.ts" --include="*.tsx"

# Find hardcoded colors
grep -r "#[0-9a-fA-F]\{6\}" src/ --include="*.css" --include="*.module.css"
```

### Step 2: Add to Constants

```typescript
// Add to appropriate section in constants.ts
export const NEW_CATEGORY = {
  NEW_CONSTANT: 42,
  ANOTHER_CONSTANT: '#ff0000',
};
```

### Step 3: Update Usage

```typescript
// Before
const value = 42;

// After
import { CONSTANTS } from '../constants';
const value = CONSTANTS.NEW_CATEGORY.NEW_CONSTANT;
```

### Step 4: Update CSS

```css
/* Before */
.component {
  padding: 16px;
}

/* After */
.component {
  padding: var(--spacing-md);
}
```

## Best Practices

### 1. Naming Conventions

- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that explain the purpose
- Group related constants in logical categories

```typescript
// Good
export const GAME_CONFIG = {
  MAX_TURNS_PER_MATCH: 15,
  TURN_TIME_LIMIT_MS: 60000,
};

// Avoid
export const CONFIG = {
  MAX_TURNS: 15,
  TIME_LIMIT: 60000,
};
```

### 2. Organization

- Keep constants organized by functional area
- Use consistent structure within categories
- Document complex constants with comments

```typescript
export const COMBAT = {
  // Base probabilities and multipliers
  BASE_CRIT_CHANCE: 0.15,
  CRIT_MULTIPLIER: 1.5,
  
  // Damage calculations
  DAMAGE_VARIANCE_MIN: -2,
  DAMAGE_VARIANCE_MAX: 3,
};
```

### 3. CSS Variables

- Use semantic variable names
- Maintain consistent naming patterns
- Map CSS variables to TypeScript constants

```css
:root {
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  
  /* Colors */
  --text-primary: #e6eef8;
  --text-secondary: #94a3b8;
}
```

### 4. Type Safety

- Use TypeScript interfaces for complex configurations
- Export type definitions for external use
- Validate configuration values

```typescript
export interface EnvironmentConfig {
  appName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  // ...
}
```

### 5. Performance

- Import only the constants you need
- Avoid importing the entire constants object
- Use tree-shaking friendly exports

```typescript
// Good - selective import
import { CONSTANTS } from '../constants';
const gridSize = CONSTANTS.GAME_CONFIG.GRID_SIZE;

// Better - named import
import { GAME_CONFIG } from '../constants';
const gridSize = GAME_CONFIG.GRID_SIZE;
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Ensure proper imports and type definitions
2. **CSS Variables Not Working**: Check that CSS variables are defined in `:root`
3. **Theme Switching Not Working**: Verify ThemeProvider is wrapping your components
4. **Configuration Not Updating**: Check environment variable names and values

### Debugging

```typescript
// Log current configuration
console.log('Current config:', config);

// Check theme values
const { theme } = useTheme();
console.log('Current theme colors:', theme.colors);
```

## Future Enhancements

1. **Runtime Configuration**: Allow users to customize settings
2. **Theme Editor**: UI for creating custom themes
3. **Configuration Validation**: Runtime validation of configuration values
4. **Feature Flags**: Dynamic feature toggling system
5. **Performance Monitoring**: Track configuration impact on performance

## Contributing

When adding new constants:

1. Choose the appropriate category
2. Follow naming conventions
3. Add TypeScript types if needed
4. Update CSS variables if applicable
5. Update documentation
6. Test in different environments

For theme contributions:

1. Follow existing theme structure
2. Ensure color accessibility
3. Test across different components
4. Update theme switcher options