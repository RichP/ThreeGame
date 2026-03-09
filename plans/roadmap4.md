# ThreeGame Roadmap 4 (Visuals & Animations)

## Focus A — Core Movement & Path Visualization

- [ ] **Smooth Unit Movement Animation**
  - Implement tweening/lerping for unit movement between tiles
  - Add configurable movement speed and easing functions
  - Ensure movement respects turn-based gameplay (no interrupting animations)
  - Handle pathfinding visualization during movement selection

- [ ] **Path Line/Arrow Visualization**
  - Draw visual path indicator showing unit's intended route
  - Use animated arrows or glowing lines to indicate movement path
  - Update path visualization in real-time as player selects destination
  - Differentiate between valid and invalid path segments

- [ ] **Movement State Management**
  - Add animation state tracking (idle, moving, attacking, etc.)
  - Prevent player input during unit animations
  - Queue animations for multiple actions in a turn
  - Handle animation cancellation and interruption gracefully

## Focus B — Combat & Attack Animations

- [ ] **Projectile Attack Animation**
  - Create projectile visual effects for ranged attacks
  - Implement different projectile types for each unit archetype
  - Add hit/explosion effects at target location
  - Include miss animations for unsuccessful attacks

- [ ] **Melee Attack Animation**
  - Add close-combat animations for melee units
  - Implement attack range indicators and targeting feedback
  - Add impact effects and recoil animations
  - Visualize critical hits with enhanced effects

- [ ] **Ability Animation System**
  - Scout Dash: Speed trail or afterimage effects
  - Bruiser Guard: Shield/aura visual effects
  - Sniper Aim: Scope/crosshair and enhanced projectile effects
  - Ability cooldown visual indicators

## Focus C — Status Effects & Environmental Feedback

- [ ] **Status Effect Visual Indicators**
  - Poison: Green mist/particles around affected units
  - Armor Up: Metallic sheen or shield visual
  - Guard: Protective aura or shield icon
  - Aim: Enhanced targeting reticle or scope effect

- [ ] **Environmental Interaction**
  - Cover system visual feedback (highlighting cover tiles)
  - Line-of-sight visualization during targeting
  - Height advantage indicators
  - Blocked tile highlighting and interaction effects

- [ ] **Damage & Health Visualization**
  - Floating damage numbers above units
  - Health bar animations and updates
  - Critical hit visual emphasis
  - Unit death animations and effects

## Focus D — UI & Interface Enhancements

- [ ] **Enhanced Targeting System**
  - Improved attack range visualization
  - Target preview with hit/miss probabilities
  - Cover bonus indicators in targeting UI
  - Ability range and effect area visualization

- [ ] **Turn & Phase Indicators**
  - Animated turn transition effects
  - Player phase change notifications
  - Unit selection state animations
  - Action availability indicators

- [ ] **Combat Log Visual Enhancement**
  - Animated combat log entries
  - Visual priority for important events
  - Smooth scrolling and entry animations
  - Color-coded event types

## Focus E — Performance & Polish

- [ ] **Animation Performance Optimization**
  - Implement object pooling for projectiles and effects
  - Optimize animation rendering for multiple units
  - Add animation quality settings (high/medium/low)
  - Ensure smooth performance on lower-end devices

- [ ] **Visual Polish & Consistency**
  - Unified animation timing and easing
  - Consistent visual language across all effects
  - Polish transitions between game states
  - Add subtle ambient animations and effects

- [ ] **Accessibility & Options**
  - Animation toggle for performance/epilepsy concerns
  - Animation speed adjustment settings
  - Visual effect intensity controls
  - High contrast mode support

## Focus F — Advanced Visual Features

- [ ] **Camera & Perspective Enhancements**
  - Dynamic camera movement during key actions
  - Zoom effects for dramatic moments
  - Camera shake for explosions/impacts
  - Parallax effects for depth

- [ ] **Particle System Integration**
  - Dust/smoke particles for movement
  - Impact particles for attacks
  - Environmental particles (rain, snow, etc.)
  - Magic/energy particles for abilities

- [ ] **Lighting & Shadows**
  - Dynamic shadows for units
  - Attack impact lighting effects
  - Ability-specific lighting changes
  - Ambient lighting adjustments

## Suggested Implementation Order

1. **Core Movement & Path Visualization** (Foundation)
   - Start with basic unit movement animation
   - Add path visualization for clarity
   - Implement animation state management

2. **Combat & Attack Animations** (Core Gameplay)
   - Projectile system for ranged attacks
   - Melee attack animations
   - Basic ability visual effects

3. **Status Effects & Environmental** (Gameplay Clarity)
   - Status effect indicators
   - Cover and line-of-sight visualization
   - Damage and health feedback

4. **UI & Interface Enhancements** (User Experience)
   - Enhanced targeting system
   - Turn indicators and transitions
   - Combat log improvements

5. **Performance & Polish** (Quality)
   - Optimization and object pooling
   - Visual consistency
   - Accessibility options

6. **Advanced Features** (Polish & Immersion)
   - Camera effects and particle systems
   - Lighting and shadows
   - Final polish and ambient effects

## Technical Considerations

- **Animation Framework**: Use existing Three.js capabilities with GSAP or similar for tweening
- **Performance**: Implement efficient rendering with minimal frame drops
- **Modularity**: Design animation system to be easily extensible
- **Configuration**: Allow players to customize animation preferences
- **Compatibility**: Ensure animations work across different devices and browsers

## Success Metrics

- Smooth 60fps animations during gameplay
- Clear visual feedback for all game actions
- Improved player understanding of game mechanics
- Enhanced immersion and engagement
- Maintainable and extensible animation codebase