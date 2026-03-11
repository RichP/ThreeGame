import React from 'react'
import Link from 'next/link'

const NavBar: React.FC = () => {
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
          <button className="play-btn">Play Now</button>
          <button className="login-btn">Login</button>
        </div>
      </div>
    </nav>
  )
}

export default NavBar