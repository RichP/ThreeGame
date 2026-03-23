# ThreeGame

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.162.0-green?style=for-the-badge&logo=three.js)](https://threejs.org/)

A modern turn-based tactical game built with Next.js, React Three Fiber, and TypeScript. Experience strategic combat in a beautifully rendered 3D environment.

## 🎮 Game Overview

ThreeGame is a tactical turn-based strategy game where players command units on a grid-based battlefield. The game features:

- **Strategic Combat**: Plan your moves carefully in this turn-based tactical experience
- **3D Visuals**: Immersive 3D graphics powered by Three.js and React Three Fiber
- **Unit Variety**: Different unit types with unique abilities and stats
- **Real-time Feedback**: Dynamic animations, damage numbers, and visual effects
- **Progressive Gameplay**: Unlock new units and abilities as you play

## 🚀 Features

### Core Gameplay
- ✅ Turn-based tactical combat system
- ✅ Grid-based movement and positioning
- ✅ Unit selection and action management
- ✅ Attack mechanics with hit/miss calculations
- ✅ Status effects (Poison, Armor Up)
- ✅ Unit abilities and cooldowns

### Visual Experience
- ✅ 3D rendered game board with lighting
- ✅ Animated unit movements and attacks
- ✅ Floating damage text and visual feedback
- ✅ Highlighted movement and attack ranges
- ✅ Smooth camera controls and transitions
- ✅ Particle effects for combat actions

### UI/UX Features
- ✅ Real-time game state display
- ✅ Unit information panel
- ✅ Combat log with filters
- ✅ Interactive controls and tooltips
- ✅ Responsive design for all screen sizes
- ✅ Session persistence (localStorage)

### Development Features
- ✅ TypeScript throughout for type safety
- ✅ Modular component architecture
- ✅ Comprehensive test suite
- ✅ ESLint and Prettier configuration
- ✅ Git hooks for code quality
- ✅ Docker support for containerization

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (Pages Router)
- **Language**: TypeScript 5.0+
- **3D Rendering**: Three.js with React Three Fiber
- **UI Framework**: React 19
- **Styling**: CSS Modules with custom properties
- **State Management**: Custom hooks and context

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Testing**: Jest with Node.js built-in test runner
- **Build Tool**: TypeScript compiler (tsc)
- **Environment**: Docker for containerization

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm (or pnpm/yarn)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd ThreeGame
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:3000`

## 🎯 Project Structure

```
ThreeGame/
├── components/              # React components
│   ├── game/               # 3D game components
│   │   ├── Board.tsx       # Game board renderer
│   │   ├── UnitMesh.tsx    # Unit 3D models
│   │   ├── SceneCanvas.tsx # Main 3D scene
│   │   └── AnimationManager.tsx # Animation system
│   ├── UI/                 # User interface components
│   │   ├── GameStatus.tsx  # Game state display
│   │   ├── UnitInfo.tsx    # Unit information panel
│   │   ├── ActionLog.tsx   # Combat log
│   │   └── Controls.tsx    # Game controls
│   └── layout/             # Layout components
├── game/                   # Game logic and state
│   ├── gamestate.ts        # Core game state management
│   ├── rules/              # Game rules and validation
│   ├── pathfinding.ts      # Movement pathfinding
│   └── selectors.ts        # State query functions
├── pages/                  # Next.js pages
│   ├── match.tsx           # Main game page
│   ├── lobby.tsx           # Matchmaking lobby
│   └── index.tsx           # Home page
├── services/               # API clients
├── styles/                 # Global styles
├── tests/                  # Test files
├── plans/                  # Architecture documentation
└── config/                 # Configuration files
```

## 🎮 Game Mechanics

### Unit Types
- **Scout**: Fast movement, moderate attack
- **Brute**: High health, strong melee attack
- **Sniper**: Long range, precision attacks
- **Support**: Healing and buff abilities

### Combat System
- **Turn-based**: Players take turns moving and attacking
- **Action Economy**: Each unit gets one move and one attack per turn
- **Range Mechanics**: Units can only attack within their range
- **Cover System**: Units gain defensive bonuses when behind obstacles
- **Status Effects**: Temporary buffs and debuffs affect combat

### Movement System
- **Grid-based**: Units move on a hexagonal or square grid
- **Pathfinding**: Automatic path calculation with obstacles
- **Movement Points**: Each unit has limited movement per turn
- **Occupancy Rules**: Only one unit per tile

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Docker
```bash
# Build image
docker build -t threegame .

# Run container
docker run -p 3000:3000 threegame
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
- Unit tests for game state management
- Integration tests for game mechanics
- Component tests for UI elements
- E2E tests for user workflows

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Game Settings
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_ANIMATION_SPEED=1.0

# Third-party Services
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Build Configuration
See `next.config.js` for build settings, webpack configuration, and optimization options.

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent naming conventions
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - 3D rendering
- [Three.js](https://threejs.org/) - 3D graphics library
- [Next.js](https://nextjs.org/) - React framework
- [Jest](https://jestjs.io/) - Testing framework


---

**ThreeGame** - Strategic combat meets beautiful 3D visuals. Plan your moves, command your units, and conquer the battlefield!