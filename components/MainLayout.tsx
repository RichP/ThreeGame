import React from 'react'
import NavBar from './NavBar'
import Footer from './Footer'
import { AuthProvider } from './auth/AuthContext'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <AuthProvider>
      <div className="main-layout">
        <NavBar />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default MainLayout
