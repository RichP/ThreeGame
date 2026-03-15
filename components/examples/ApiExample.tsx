import React, { useState, useEffect } from 'react'
import { useApiCall, useValidation, validationRules } from '../../hooks/useApiError'
import { authApi, userApi, friendsApi } from '../../services/api'
import { useToast } from '../ToastContainer'
import styles from './ApiExample.module.css'

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const ApiExample: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [isRegistering, setIsRegistering] = useState(false)
  const [isFetchingProfile, setIsFetchingProfile] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [friends, setFriends] = useState<any[]>([])

  const { showSuccess, showError, showWarning, showInfo } = useToast()

  // API call hooks
  const registerCall = useApiCall(
    (data: FormData) => authApi.register(data.username, data.email, data.password),
    {
      onSuccess: (data) => {
        if (data?.success && data.data) {
          showSuccess('Registration Successful', 'Welcome to the game! Please log in.')
        }
        setIsRegistering(false)
      },
      onError: (error) => {
        showError('Registration Failed', error)
        setIsRegistering(false)
      }
    }
  )

  const loginCall = useApiCall(
    (username: string, password: string) => authApi.login(username, password),
    {
      onSuccess: (data) => {
        if (data?.success && data.data) {
          showSuccess('Login Successful', 'Welcome back!')
          localStorage.setItem('authToken', data.data.token)
          localStorage.setItem('user', JSON.stringify(data.data.user))
        }
      },
      onError: (error) => {
        showError('Login Failed', error)
      }
    }
  )

  const profileCall = useApiCall(
    () => userApi.getProfile(),
    {
      onSuccess: (data) => {
        if (data?.success && data.data) {
          setProfile(data.data)
        }
        setIsFetchingProfile(false)
      },
      onError: (error) => {
        showError('Failed to Load Profile', error)
        setIsFetchingProfile(false)
      }
    }
  )

  const friendsCall = useApiCall(
    () => friendsApi.getFriends(),
    {
      onSuccess: (data) => {
        if (data?.success && data.data) {
          setFriends(data.data.friends)
        }
      },
      onError: (error) => {
        showError('Failed to Load Friends', error)
      }
    }
  )

  // Validation hook
  const { errors, validateForm, clearFieldError } = useValidation()

  const validationRulesSet = {
    username: [validationRules.required(), validationRules.minLength(3)],
    email: [validationRules.required(), validationRules.email()],
    password: [validationRules.required(), validationRules.minLength(6)],
    confirmPassword: [
      validationRules.required(),
      validationRules.custom(
        (value: string) => value === formData.password,
        'Passwords do not match'
      )
    ]
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    clearFieldError(name)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm(formData, validationRulesSet)) {
      showWarning('Validation Error', 'Please check the form fields and try again.')
      return
    }

    setIsRegistering(true)
    await registerCall.execute(formData)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await loginCall.execute(formData.username, formData.password)
  }

  const handleFetchProfile = async () => {
    setIsFetchingProfile(true)
    await profileCall.execute()
  }

  const handleFetchFriends = async () => {
    await friendsCall.execute()
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
      setProfile(null)
      setFriends([])
      showSuccess('Logged Out', 'You have been successfully logged out.')
    } catch (error) {
      showError('Logout Error', 'There was an issue logging you out.')
    }
  }

  return (
    <div className={styles.container}>
      <h1>API Integration Example</h1>
      
      <div className={styles.section}>
        <h2>Authentication</h2>
        
        {/* Registration Form */}
        <div className={styles.formSection}>
          <h3>Register</h3>
          <form onSubmit={handleRegister}>
            <div className={styles.formGroup}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? styles.errorInput : ''}
              />
              {errors.username && <span className={styles.errorText}>{errors.username}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? styles.errorInput : ''}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? styles.errorInput : ''}
              />
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? styles.errorInput : ''}
              />
              {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
            </div>

            <button 
              type="submit" 
              disabled={isRegistering || registerCall.isLoading}
              className={styles.button}
            >
              {isRegistering || registerCall.isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>

        {/* Login Form */}
        <div className={styles.formSection}>
          <h3>Login</h3>
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <button 
              type="submit" 
              disabled={loginCall.isLoading}
              className={styles.button}
            >
              {loginCall.isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={handleLogout} className={styles.button}>
            Logout
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2>User Data</h2>
        
        <div className={styles.buttonGroup}>
          <button 
            onClick={handleFetchProfile} 
            disabled={isFetchingProfile || profileCall.isLoading}
            className={styles.button}
          >
            {isFetchingProfile || profileCall.isLoading ? 'Loading...' : 'Load Profile'}
          </button>
          
          <button 
            onClick={handleFetchFriends}
            className={styles.button}
          >
            Load Friends
          </button>
        </div>

        {/* Profile Display */}
        {profile && (
          <div className={styles.dataSection}>
            <h3>Profile</h3>
            <div className={styles.profileCard}>
              <p><strong>Username:</strong> {profile.username}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Rating:</strong> {profile.rating}</p>
              <p><strong>Level:</strong> {profile.level}</p>
              <p><strong>Status:</strong> {profile.isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        )}

        {/* Friends List */}
        {friends.length > 0 && (
          <div className={styles.dataSection}>
            <h3>Friends ({friends.length})</h3>
            <div className={styles.friendsList}>
              {friends.map(friend => (
                <div key={friend.id} className={styles.friendCard}>
                  <span className={styles.friendName}>{friend.username}</span>
                  <span className={`${styles.status} ${friend.isOnline ? styles.online : styles.offline}`}>
                    {friend.isOnline ? 'Online' : 'Offline'}
                  </span>
                  <span className={styles.rating}>Rating: {friend.rating}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>Error Handling Examples</h2>
        <div className={styles.buttonGroup}>
          <button 
            onClick={() => showError('Example Error', 'This is an example error message.')}
            className={`${styles.button} ${styles.errorButton}`}
          >
            Show Error
          </button>
          
          <button 
            onClick={() => showWarning('Example Warning', 'This is an example warning message.')}
            className={`${styles.button} ${styles.warningButton}`}
          >
            Show Warning
          </button>
          
          <button 
            onClick={() => showInfo('Example Info', 'This is an example info message.')}
            className={`${styles.button} ${styles.infoButton}`}
          >
            Show Info
          </button>
          
          <button 
            onClick={() => showSuccess('Example Success', 'This is an example success message.')}
            className={`${styles.button} ${styles.successButton}`}
          >
            Show Success
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApiExample