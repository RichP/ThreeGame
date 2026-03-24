import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'
import styles from './auth.module.css'

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true)
  const router = useRouter()

  const handleLoginSuccess = () => {
    // Direct redirect without delay
    router.push('/lobby')
  }

  const handleRegisterSuccess = () => {
    // Direct redirect without delay
    router.push('/lobby')
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          {isLoginView ? (
            <LoginForm
              onSwitchToRegister={() => setIsLoginView(false)}
              onSuccess={handleLoginSuccess}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setIsLoginView(true)}
              onSuccess={handleRegisterSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}
