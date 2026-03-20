import React, { ErrorInfo, useState, useEffect } from 'react'
import { AuthProvider } from './auth/AuthContext'
import { ToastProvider } from './ToastContainer'
import { ThemeProvider } from './theme/ThemeContext'
import ErrorBoundary from './ErrorBoundary'
import GameDropdown from './UI/GameDropdown'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AnimationSettings, useAnimationSettings } from './game/AnimationSettings'
import styles from './GameLayout.module.css'

// Helper function to get SFX settings from localStorage
const getSfxSettings = () => {
  if (typeof window === 'undefined') {
    return { muted: false, volume: 1.0 };
  }
  const saved = localStorage.getItem('threegame:sfx-settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { muted: false, volume: 1.0 };
    }
  }
  return { muted: false, volume: 1.0 };
}

interface GameLayoutProps {
  children: React.ReactNode
  isDebugMode?: boolean
  onDebugModeChange?: (isDebugMode: boolean) => void
  isMapPanelOpen?: boolean
  onMapPanelOpenChange?: (isMapPanelOpen: boolean) => void
}

const GameLayout: React.FC<GameLayoutProps> = ({ children, isDebugMode: externalDebugMode, onDebugModeChange, isMapPanelOpen: externalMapPanelOpen, onMapPanelOpenChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [internalDebugMode, setInternalDebugMode] = useState(false)
  const [isAnimationSettingsOpen, setIsAnimationSettingsOpen] = useState(false)
  const [internalMapPanelOpen, setInternalMapPanelOpen] = useState(false)
  const router = useRouter()
  
  // Use external debug mode if provided, otherwise use internal state
  const currentDebugMode = externalDebugMode !== undefined ? externalDebugMode : internalDebugMode
  
  // Use external map panel open state if provided, otherwise use internal state
  const currentMapPanelOpen = externalMapPanelOpen !== undefined ? externalMapPanelOpen : internalMapPanelOpen
  
  // Animation settings
  const { settings, setSettings } = useAnimationSettings()
  const [sfxMuted, setSfxMuted] = useState<boolean>(getSfxSettings().muted)
  const [sfxVolume, setSfxVolume] = useState<number>(getSfxSettings().volume)
  
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('GameLayout ErrorBoundary caught an error:', error, errorInfo)
    }
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service
      console.log('Game Error reported:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      })
    }
  }

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleMenuClose = () => {
    setIsMenuOpen(false)
  }

  const handleExitGame = () => {
    // Navigate back to lobby or home page
    router.push('/lobby')
  }

  return (
    <ErrorBoundary onError={handleError}>
      <AuthProvider>
        <ToastProvider position="top-right" maxToasts={5}>
          <ThemeProvider>
            <div className={styles.gameLayout}>
              {/* Game Canvas Area */}
              <main className={styles.gameCanvas}>
                {React.Children.map(children, (child) => {
                  if (React.isValidElement(child)) {
                    // Check if this is a SceneCanvas component by checking for known props
                    const childProps = child.props as any;
                    if (childProps && childProps.onGameStateChange) {
                      console.log('GameLayout: Passing props to SceneCanvas:', {
                        isDebugMode: currentDebugMode,
                        isMapPanelOpen: currentMapPanelOpen
                      });
                      return React.cloneElement(child, { 
                        isDebugMode: currentDebugMode,
                        isMapPanelOpen: currentMapPanelOpen
                      } as any);
                    }
                  }
                  return child;
                })}
              </main>
              
              {/* Animation Settings */}
              <AnimationSettings
                settings={settings}
                onChange={setSettings}
                sfxMuted={sfxMuted}
                sfxVolume={sfxVolume}
                onSfxMutedChange={setSfxMuted}
                onSfxVolumeChange={setSfxVolume}
                isOpen={isAnimationSettingsOpen}
                onToggle={() => setIsAnimationSettingsOpen(!isAnimationSettingsOpen)}
              />
              
              {/* Minimal Game HUD */}
              <div className={styles.gameHud}>
                <div className={styles.gameControls}>
                  <button 
                    className={styles.menuButton} 
                    aria-label="Game Menu"
                    onClick={handleMenuToggle}
                    aria-expanded={isMenuOpen}
                  >
                    <span className={styles.menuIcon}>☰</span>
                  </button>
                  <div className={styles.gameTitle}>ThreeGame</div>
                  
                </div>
              </div>

              {/* Game Dropdown Menu */}
              <GameDropdown isOpen={isMenuOpen} onClose={handleMenuClose}>
                <div className={styles.dropdownSection}>
                  <span className={styles.dropdownSectionTitle}>Navigation</span>
                  <Link href="/" onClick={handleMenuClose}>
                    Home
                  </Link>
                  <Link href="/lobby" onClick={handleMenuClose}>
                    Lobby
                  </Link>
                  <Link href="/community" onClick={handleMenuClose}>
                    Community
                  </Link>
                  <Link href="/leaderboards" onClick={handleMenuClose}>
                    Leaderboards
                  </Link>
                  <Link href="/profile" onClick={handleMenuClose}>
                    Profile
                  </Link>
                </div>
                
                <div className={styles.dropdownDivider} />
                
                <div className={styles.dropdownSection}>
                  <span className={styles.dropdownSectionTitle}>Game Actions</span>
                  <button onClick={() => {
                    handleMenuClose()
                    // Add surrender functionality here
                    console.log('Surrender game')
                  }}>
                    Surrender
                  </button>
                  <button onClick={() => {
                    handleMenuClose()
                    // Add pause functionality here
                    console.log('Pause game')
                  }}>
                    Pause
                  </button>
                </div>
                
                <div className={styles.dropdownDivider} />
                
                <div className={styles.dropdownSection}>
                  <span className={styles.dropdownSectionTitle}>Settings</span>
                  <button onClick={() => {
                    handleMenuClose()
                    // Add settings functionality here
                    console.log('Open settings')
                  }}>
                    Game Settings
                  </button>
                  <button onClick={() => {
                    handleMenuClose()
                    // Add audio settings functionality here
                    console.log('Audio Settings')
                  }}>
                    Audio Settings
                  </button>
                </div>
                
                <div className={styles.dropdownDivider} />
                
                <div className={styles.dropdownSection}>
                  <span className={styles.dropdownSectionTitle}>Game Settings</span>
                  <button onClick={() => {
                    if (onMapPanelOpenChange) {
                      // Use external callback if provided
                      onMapPanelOpenChange( !currentMapPanelOpen)
                    } else {
                      // Use internal state
                      setInternalMapPanelOpen( !currentMapPanelOpen)
                    }
                    handleMenuClose()
                  }}>
                    Map Settings: {currentMapPanelOpen ? 'ON' : 'OFF'}
                  </button>
                  <button onClick={() => {
                    setIsAnimationSettingsOpen(!isAnimationSettingsOpen)
                    handleMenuClose()
                  }}>
                    Animation Settings
                  </button>
                </div>
                
                <div className={styles.dropdownDivider} />
                
                <div className={styles.dropdownSection}>
                  <span className={styles.dropdownSectionTitle}>Development</span>
                  <button onClick={() => {
                    if (onDebugModeChange) {
                      // Use external callback if provided
                      onDebugModeChange(!currentDebugMode)
                    } else {
                      // Use internal state
                      setInternalDebugMode(!internalDebugMode)
                    }
                    handleMenuClose()
                  }}>
                    Debug Mode: {currentDebugMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              </GameDropdown>
            </div>
          </ThemeProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default GameLayout