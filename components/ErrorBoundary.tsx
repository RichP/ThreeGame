import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ApiError } from '../services/api'
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId: string
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      errorId: this.generateErrorId()
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo)
    }
  }

  private generateErrorId = (): string => {
    return 'error_' + Math.random().toString(36).substr(2, 9)
  }

  private reportErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error reporting service
    // like Sentry, LogRocket, or a custom endpoint
    console.log('Reporting error to service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: this.generateErrorId()
    })
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Otherwise, render the default error UI
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L1 21H23L12 2Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 16H12.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            <h1 className={styles.errorTitle}>Oops! Something went wrong</h1>
            
            <div className={styles.errorMessage}>
              <p>We're sorry, but something unexpected happened. Don't worry, this isn't your fault!</p>
              
              {this.state.error && (
                <details className={styles.errorDetails}>
                  <summary>Error Details (for technical users)</summary>
                  <div className={styles.errorContent}>
                    <p><strong>Error ID:</strong> {this.state.errorId}</p>
                    <p><strong>Error:</strong> {this.state.error.name}</p>
                    <p><strong>Message:</strong> {this.state.error.message}</p>
                    {this.state.error.stack && (
                      <div className={styles.stackTrace}>
                        <strong>Stack Trace:</strong>
                        <pre>{this.state.error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className={styles.errorActions}>
              <button 
                className={styles.retryButton}
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              
              <button 
                className={styles.homeButton}
                onClick={this.handleGoHome}
              >
                Go Home
              </button>
            </div>

            <div className={styles.errorHelp}>
              <p>If this problem persists, please contact our support team with the error ID above.</p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary