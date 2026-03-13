import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from './auth/AuthContext'

const NavBar: React.FC = () => {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    // Redirect to home page after logout
    router.push('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link href="/">
            <span className="brand-text">ThreeGame</span>
          </Link>
        </div>
        
        <div className="navbar-menu">
          <Link href="/match">
            <span className="nav-link">Play</span>
          </Link>
          <Link href="/community">
            <span className="nav-link">Community</span>
          </Link>
          <Link href="/leaderboards">
            <span className="nav-link">Leaderboards</span>
          </Link>
          <Link href="/shop">
            <span className="nav-link">Shop</span>
          </Link>
          <Link href="/profile">
            <span className="nav-link">Profile</span>
          </Link>
        </div>
        
        <div className="navbar-actions">
          {user ? (
            <>
              <span className="user-greeting">Welcome, {user.username}!</span>
              <button className="play-btn">Play Now</button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="play-btn">Play Now</button>
              <Link href="/auth">
                <button className="login-btn">Login</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default NavBar
