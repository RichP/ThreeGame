import React, { useEffect, useState } from 'react'
import styles from './Toast.module.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  persistent?: boolean
}

interface ToastProps {
  message: ToastMessage
  onRemove: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ message, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Auto-dismiss toast after duration
    if (!message.persistent && message.duration && message.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove()
      }, message.duration)
      return () => clearTimeout(timer)
    }
  }, [message.duration, message.persistent])

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => {
      onRemove(message.id)
    }, 300) // Match CSS transition duration
  }

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12A10 10 0 1 1 5.93 7.35" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
            <path d="M15 9L9 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 9L15 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.29 3.86L1.82 18a1 1 0 0 0 .89 1.5h18.58a1 1 0 0 0 .89-1.5L13.71 3.86a1 1 0 0 0-1.71 0z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2"/>
            <path d="M12 16v-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 8h.01" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )
      default:
        return null
    }
  }

  const getToastClass = (type: ToastType) => {
    switch (type) {
      case 'success':
        return styles.success
      case 'error':
        return styles.error
      case 'warning':
        return styles.warning
      case 'info':
        return styles.info
      default:
        return ''
    }
  }

  return (
    <div 
      className={`${styles.toast} ${styles[getToastClass(message.type)]} ${isVisible ? styles.visible : ''} ${isExiting ? styles.exiting : ''}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={styles.toastContent}>
        <div className={styles.toastIcon}>
          {getToastIcon(message.type)}
        </div>
        <div className={styles.toastText}>
          <div className={styles.toastTitle}>{message.title}</div>
          <div className={styles.toastMessage}>{message.message}</div>
        </div>
        <button 
          className={styles.closeButton}
          onClick={handleRemove}
          aria-label="Close notification"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      {!message.persistent && (
        <div 
          className={styles.progress}
          style={{ animationDuration: `${message.duration || 5000}ms` }}
        />
      )}
    </div>
  )
}

export default Toast