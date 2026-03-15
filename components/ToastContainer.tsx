import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import Toast, { ToastMessage, ToastType } from './Toast'
import styles from './ToastContainer.module.css'

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
  showSuccess: (title: string, message: string, options?: ToastOptions) => void
  showError: (title: string, message: string, options?: ToastOptions) => void
  showWarning: (title: string, message: string, options?: ToastOptions) => void
  showInfo: (title: string, message: string, options?: ToastOptions) => void
}

interface ToastOptions {
  duration?: number
  persistent?: boolean
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
  maxToasts?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5,
  position = 'top-right'
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 5000,
      persistent: toast.persistent || false
    }

    setToasts(prevToasts => {
      const newToasts = [newToast, ...prevToasts]
      // Limit the number of toasts
      if (newToasts.length > maxToasts) {
        return newToasts.slice(0, maxToasts)
      }
      return newToasts
    })
  }, [maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((type: ToastType, title: string, message: string, options: ToastOptions = {}) => {
    addToast({
      type,
      title,
      message,
      duration: options.duration,
      persistent: options.persistent
    })
  }, [addToast])

  const showSuccess = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast('success', title, message, options)
  }, [showToast])

  const showError = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast('error', title, message, options)
  }, [showToast])

  const showWarning = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast('warning', title, message, options)
  }, [showToast])

  const showInfo = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast('info', title, message, options)
  }, [showToast])

  const contextValue: ToastContextType = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className={`${styles.toastContainer} ${styles[position]}`}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Standalone toast container component (for use without context)
interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  onRemove, 
  position = 'top-right' 
}) => {
  return (
    <div className={`${styles.toastContainer} ${styles[position]}`}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

export default ToastContainer