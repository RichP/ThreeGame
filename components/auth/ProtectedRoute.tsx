import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Direct check of localStorage for authentication state
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setIsAuthenticated(!!parsedUser)
        } catch (error) {
          setIsAuthenticated(false)
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
      } else {
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router.pathname])

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #0b1020 100%)',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid #8aa0ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span>Loading...</span>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // If authentication is required but user is not logged in, redirect to auth page
  if (requireAuth && !isAuthenticated) {
    if (typeof window !== 'undefined' && router.pathname !== '/auth') {
      router.push('/auth')
    }
    return null
  }

  // If user is logged in and tries to access auth page, redirect to lobby
  if (!requireAuth && isAuthenticated && router.pathname === '/auth') {
    router.push('/lobby')
    return null
  }

  return <>{children}</>
}
