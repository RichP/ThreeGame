import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from './AuthContext'
import styles from './ProtectedRoute.module.css'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth' 
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // Store the intended destination
      const intendedDestination = router.asPath
      router.push(`${redirectTo}?redirect=${encodeURIComponent(intendedDestination)}`)
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router])

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}

export default ProtectedRoute