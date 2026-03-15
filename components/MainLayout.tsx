import React, { ErrorInfo } from 'react'
import NavBar from './NavBar'
import Footer from './Footer'
import { AuthProvider } from './auth/AuthContext'
import { ToastProvider } from './ToastContainer'
import ErrorBoundary from './ErrorBoundary'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('MainLayout ErrorBoundary caught an error:', error, errorInfo)
    }
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service
      console.log('Error reported:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      })
    }
  }

  return (
    <ErrorBoundary onError={handleError}>
      <AuthProvider>
        <ToastProvider position="top-right" maxToasts={5}>
          <div className="main-layout">
            <NavBar />
            <main className="main-content">
              {children}
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default MainLayout
