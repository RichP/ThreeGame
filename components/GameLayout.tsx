import React, { ErrorInfo, useState } from 'react'
import { AuthProvider } from './auth/AuthContext'
import { ToastProvider } from './ToastContainer'
import { ThemeProvider } from './theme/ThemeContext'
import ErrorBoundary from './ErrorBoundary'
import GameDropdown from './UI/GameDropdown'
import Link from 'next/link'
import styles from './GameLayout.module.css'

interface GameLayoutProps {
  children: React.ReactNode
}

const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
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
    window.location.href = '/lobby'
  }

  return (
    <ErrorBoundary onError={handleError}>
      <AuthProvider>
        <ToastProvider position="top-right" maxToasts={5}>
          <ThemeProvider>
            <div className={styles.gameLayout}>
              {/* Game Canvas Area */}
              <main className={styles.gameCanvas}>
                {children}
              </main>
              
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
              </GameDropdown>
            </div>
          </ThemeProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default GameLayout
