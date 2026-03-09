# ThreeGame Animation System

This document describes the comprehensive animation system implemented for ThreeGame, covering movement, combat, status effects, and environmental interactions.

## Overview

The animation system enhances the turn-based tactical gameplay with smooth visual feedback, making actions more engaging and providing clear visual cues for game mechanics.

## Core Components

### 1. AnimationManager (`components/AnimationManager.tsx`)

Central animation coordinator that handles:
- **Movement Animations**: Smooth unit movement between tiles with configurable duration and easing
- **Animation State Management**: Tracks animation progress and prevents input during animations
- **Performance Optimization**: Efficiently manages multiple concurrent animations

**Key Features:**
- Configurable movement duration (default: 600ms)
- Smooth easing functions (easeInOutQuad)
- Automatic cleanup of completed animations
- Integration with game state changes

### 2. Path Visualization (`components/PathVisualizer.tsx`)

Visual feedback for movement planning:
- **PathVisualizer**: Draws continuous lines showing movement paths
- **ArrowVisualizer**: Individual arrow indicators for each path segment
- **PathArrowsVisualizer**: Complete path with animated arrows

**Visual Styles:**
- Player 1: Blue arrows (`#3b82f6`)
- Player 2: Red arrows (`#ef4444`)
- Animated progress indicators
- Configurable line width and opacity

### 3. Projectile Animations (`components/ProjectileAnimation.tsx`)

Dynamic attack animations:
- **ProjectileAnimation**: Moving projectiles with arc trajectories
- **ImpactEffect**: Explosion, spark, and magic impact effects
- **Type-specific Visuals**: Different shapes and behaviors for ranged, melee, and abilities

**Projectile Types:**
- **Ranged**: Spherical projectiles with explosion effects
- **Melee**: Cone-shaped attacks with spark impacts
- **Abilities**: Cubic projectiles with magical effects

**Features:**
- Arc-based trajectories for realism
- Rotation to face movement direction
- Configurable speed and color
- Impact effects with scaling animations

### 4. Status Effects (`components/StatusEffects.tsx`)

Visual indicators for unit conditions:
- **Poison**: Green mist with pulsing torus
- **Armor**: Gray sphere aura
- **Guard**: Orange wireframe ring
- **Aim**: Blue targeting cylinder

**Animation Features:**
- Pulse animations for active effects
- Color-coded visual feedback
- Duration-based fade-out
- Particle system integration

### 5. Camera Controller (`components/CameraController.tsx`)

Dynamic camera movements:
- **Camera Shake**: Impact feedback for attacks
- **Camera Zoom**: Dramatic focus on critical moments
- **Focus Transitions**: Smooth camera movement to units

**Effects:**
- Configurable shake intensity and duration
- Zoom effects for critical hits
- Smooth lerp-based transitions
- Performance-optimized camera updates

### 6. Animation Settings (`components/AnimationSettings.tsx`)

Accessibility and performance controls:
- **Toggle Animations**: Complete animation disable for performance/epilepsy concerns
- **Animation Speed**: 0.5x to 2.0x speed control
- **Quality Settings**: High/Medium/Low performance modes
- **Visual Intensity**: Control over effect strength
- **Camera Shake**: Toggle for motion sensitivity
- **Particle Effects**: Toggle for performance
- **Status Effects**: Toggle for visual clarity

**Features:**
- Persistent settings via localStorage
- Real-time preview of changes
- Reset to defaults functionality
- Accessibility-focused design

## Integration Points

### Board Component Integration

The `Board` component integrates all animation systems:

```tsx
{/* Animation Manager */}
<AnimationManager
    gameState={gameState}
    onMovementComplete={() => { /* handle completion */ }}
    onAttackComplete={() => { /* handle completion */ }}
/>

{/* Path Visualization */}
{gameState.phase === Phase.MOVE_UNIT && gameState.selectedUnitId && (
    <PathArrowsVisualizer
        path={reachableTiles}
        color={gameState.currentPlayer === 'p1' ? '#3b82f6' : '#ef4444'}
        visible={true}
        animationProgress={1}
    />
)}

{/* Status Effects */}
{gameState.units.map((unit) => (
    <StatusEffects
        key={`status-${unit.id}`}
        unit={unit}
        visible={true}
    />
))}

{/* Attack Animations */}
{gameState.lastAction?.type === 'attack' && (
    <ProjectileAnimation
        fromUnit={getUnitById(gameState, gameState.lastAction.attackerId)!}
        toUnit={getUnitById(gameState, gameState.lastAction.targetId)!}
        type="ranged"
        onComplete={() => { /* handle completion */ }}
        color={gameState.currentPlayer === 'p1' ? '#3b82f6' : '#ef4444'}
    />
)}
```

### SceneCanvas Integration

The main canvas component includes:
- Animation settings UI
- Camera effects integration
- Performance monitoring
- Accessibility controls

## Animation States and Flow

### Movement Animation Flow
1. **Selection**: Unit selected for movement
2. **Path Visualization**: Arrows show possible movement paths
3. **Movement Trigger**: Player clicks destination tile
4. **Animation Start**: AnimationManager creates movement animation
5. **Smooth Movement**: Unit moves along path with easing
6. **Completion**: Animation completes, unit reaches destination

### Attack Animation Flow
1. **Target Selection**: Player selects attack target
2. **Projectile Launch**: Projectile animation begins
3. **Flight Path**: Projectile moves with arc trajectory
4. **Impact**: Impact effect plays at target location
5. **Damage Resolution**: Floating damage numbers appear
6. **Cleanup**: Animations complete and clean up

### Status Effect Flow
1. **Effect Application**: Status applied through abilities or attacks
2. **Visual Indicator**: Appropriate effect visual appears
3. **Duration Tracking**: Effect persists for specified duration
4. **Tick Animation**: Pulse or particle effects during duration
5. **Expiration**: Effect fades out when duration expires

## Performance Considerations

### Optimization Strategies
- **Object Pooling**: Reuse animation objects where possible
- **Conditional Rendering**: Only render active animations
- **Quality Settings**: Allow lower quality modes for performance
- **Animation Limits**: Cap concurrent animations
- **Memory Management**: Automatic cleanup of completed animations

### Performance Monitoring
- Frame rate monitoring
- Animation count tracking
- Memory usage optimization
- GPU load management

## Accessibility Features

### Animation Controls
- **Complete Disable**: Toggle all animations off
- **Speed Control**: Adjust animation speed for comfort
- **Intensity Control**: Reduce visual intensity
- **Camera Shake**: Disable motion effects

### Visual Accessibility
- **High Contrast**: Ensure animations remain visible
- **Color Independence**: Don't rely solely on color
- **Motion Sensitivity**: Provide alternatives to motion
- **Clear Indicators**: Ensure important information is clear

## Future Enhancements

### Planned Features
1. **Particle System**: Advanced particle effects for explosions and magic
2. **Lighting Effects**: Dynamic lighting for dramatic moments
3. **Environmental Effects**: Weather and terrain interactions
4. **Ability Animations**: Unique animations for each unit ability
5. **Death Animations**: Dramatic unit death sequences
6. **UI Animations**: Smooth transitions for menus and panels

### Technical Improvements
1. **WebGL Optimization**: Better GPU utilization
2. **Animation Caching**: Cache complex animations
3. **LOD System**: Level of detail for distant units
4. **Async Loading**: Load animations on demand

## Usage Examples

### Basic Animation Control
```tsx
// Enable/disable all animations
const { settings, setSettings } = useAnimationSettings();
setSettings({ ...settings, enabled: false });

// Adjust animation speed
setSettings({ ...settings, speed: 1.5 });

// Toggle camera shake
setSettings({ ...settings, cameraShake: false });
```

### Custom Animation Integration
```tsx
// Trigger custom camera shake
<CameraController
    gameState={gameState}
    shakeIntensity={0.5}
    shakeDuration={0.3}
/>

// Custom projectile
<ProjectileAnimation
    fromUnit={attacker}
    toUnit={target}
    type="ability"
    color="#a78bfa"
    onComplete={() => console.log('Attack complete')}
/>
```

## Troubleshooting

### Common Issues
1. **Animations not playing**: Check animation settings are enabled
2. **Performance issues**: Lower quality settings or disable particle effects
3. **Camera shake too intense**: Reduce intensity or disable camera shake
4. **Animations out of sync**: Check game state synchronization

### Debug Tools
- Animation state logging
- Performance monitoring
- Frame rate display
- Animation queue inspection

## Conclusion

The ThreeGame animation system provides a rich, engaging visual experience while maintaining performance and accessibility. The modular design allows for easy extension and customization, making it a solid foundation for future enhancements.