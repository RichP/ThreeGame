import React, { useState } from 'react'
import { useAuth } from './AuthContext'
import styles from './LoginForm.module.css'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onSuccess?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSwitchToRegister, 
  onSuccess 
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Please enter both username and password')
      return
    }

    try {
      await login(username.trim(), password)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    }
  }

  return (
    <div className={styles.loginForm}>
      <div className={styles.formHeader}>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            placeholder="Enter your username"
            disabled={isLoading}
            autoComplete="username"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="Enter your password"
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className={styles.loadingSpinner}></div>
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className={styles.formFooter}>
        <p className={styles.switchText}>
          Don't have an account?{' '}
          <button 
            type="button" 
            className={styles.switchButton}
            onClick={onSwitchToRegister}
            disabled={isLoading}
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  )
}