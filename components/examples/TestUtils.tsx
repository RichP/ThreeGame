import React, { useState } from 'react'
import { useToast } from '../ToastContainer'
import { useApiError } from '../../hooks/useApiError'
import styles from './TestUtils.module.css'

interface TestError {
  message: string
  type: 'network' | 'server' | 'validation' | 'component'
}

const TestUtils: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  const { setError, clearError } = useApiError()
  
  const [testErrors, setTestErrors] = useState<TestError[]>([])
  const [isThrowingError, setIsThrowingError] = useState(false)

  // Test toast notifications
  const testToasts = () => {
    showSuccess('Test Success', 'This is a test success message that should appear in a green toast.')
    setTimeout(() => showInfo('Test Info', 'This is a test info message that should appear in a blue toast.'), 500)
    setTimeout(() => showWarning('Test Warning', 'This is a test warning message that should appear in an orange toast.'), 1000)
    setTimeout(() => showError('Test Error', 'This is a test error message that should appear in a red toast.'), 1500)
  }

  // Test API error handling
  const testApiErrors = () => {
    // Simulate different API error scenarios
    const errors = [
      { message: 'Network connection failed. Please check your internet connection.', type: 'network' as const },
      { message: 'Server returned 500 error. Please try again later.', type: 'server' as const },
      { message: 'Validation failed: Username must be at least 3 characters long.', type: 'validation' as const },
      { message: 'Component render error occurred.', type: 'component' as const }
    ]
    
    setTestErrors(errors)
    
    // Show error for each type
    errors.forEach((error, index) => {
      setTimeout(() => {
        setError(error.message)
      }, index * 500)
    })
  }

  // Test component error (for error boundary)
  const throwError = () => {
    setIsThrowingError(true)
    throw new Error('This is a test component error for the error boundary!')
  }

  // Test loading states
  const testLoadingStates = async () => {
    setError('Simulating API call...')
    
    // Simulate loading
    setTimeout(() => {
      showSuccess('API Call Complete', 'Simulated API call finished successfully.')
      clearError()
    }, 2000)
  }

  // Clear all test errors
  const clearAllErrors = () => {
    setTestErrors([])
    clearError()
  }

  // Test rapid toast creation
  const testRapidToasts = () => {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        showInfo(`Rapid Toast ${i + 1}`, `This is rapid toast number ${i + 1}`)
      }, i * 200)
    }
  }

  // Test validation errors
  const testValidationErrors = () => {
    const validationErrors = [
      'Username is required',
      'Email format is invalid',
      'Password must be at least 6 characters',
      'Passwords do not match',
      'Please accept the terms and conditions'
    ]
    
    validationErrors.forEach((error, index) => {
      setTimeout(() => {
        setError(error)
      }, index * 300)
    })
  }

  return (
    <div className={styles.container}>
      <h2>Testing Utilities</h2>
      <p className={styles.description}>
        Use these buttons to test the error handling and toast notification system.
      </p>

      <div className={styles.section}>
        <h3>Toast Notifications</h3>
        <div className={styles.buttonGrid}>
          <button onClick={() => showSuccess('Success!', 'Operation completed successfully.')} className={`${styles.button} ${styles.success}`}>
            Test Success Toast
          </button>
          <button onClick={() => showError('Error!', 'Something went wrong.')} className={`${styles.button} ${styles.error}`}>
            Test Error Toast
          </button>
          <button onClick={() => showWarning('Warning!', 'Please be careful.')} className={`${styles.button} ${styles.warning}`}>
            Test Warning Toast
          </button>
          <button onClick={() => showInfo('Info!', 'Here is some information.')} className={`${styles.button} ${styles.info}`}>
            Test Info Toast
          </button>
          <button onClick={testToasts} className={`${styles.button} ${styles.primary}`}>
            Test All Toast Types
          </button>
          <button onClick={testRapidToasts} className={`${styles.button} ${styles.secondary}`}>
            Test Rapid Toasts
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Error Handling</h3>
        <div className={styles.buttonGrid}>
          <button onClick={testApiErrors} className={`${styles.button} ${styles.error}`}>
            Test API Errors
          </button>
          <button onClick={testValidationErrors} className={`${styles.button} ${styles.warning}`}>
            Test Validation Errors
          </button>
          <button onClick={testLoadingStates} className={`${styles.button} ${styles.info}`}>
            Test Loading States
          </button>
          <button onClick={clearAllErrors} className={`${styles.button} ${styles.success}`}>
            Clear All Errors
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Error Boundary Testing</h3>
        <div className={styles.warningBox}>
          <p><strong>Warning:</strong> This will throw an error that should be caught by the error boundary.</p>
          <p>The error boundary should display a user-friendly error message instead of crashing the app.</p>
        </div>
        <button onClick={throwError} disabled={isThrowingError} className={`${styles.button} ${styles.danger}`}>
          {isThrowingError ? 'Error Thrown!' : 'Throw Component Error'}
        </button>
      </div>

      <div className={styles.section}>
        <h3>Current Test Errors</h3>
        {testErrors.length > 0 ? (
          <div className={styles.errorList}>
            {testErrors.map((error, index) => (
              <div key={index} className={`${styles.errorItem} ${styles[error.type]}`}>
                <span className={styles.errorType}>{error.type.toUpperCase()}</span>
                <span className={styles.errorMessage}>{error.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noErrors}>No test errors currently active.</p>
        )}
      </div>

      <div className={styles.section}>
        <h3>Testing Instructions</h3>
        <div className={styles.instructions}>
          <ol>
            <li><strong>Toast Testing:</strong> Click the toast buttons to see different toast types and behaviors.</li>
            <li><strong>Error Handling:</strong> Test API errors, validation errors, and loading states.</li>
            <li><strong>Error Boundary:</strong> Click "Throw Component Error" to test the error boundary (this will show the error UI).</li>
            <li><strong>Browser Dev Tools:</strong> Open browser developer tools to monitor network requests and console logs.</li>
            <li><strong>Network Testing:</strong> Disconnect your internet and test API calls to see network error handling.</li>
          </ol>
        </div>
      </div>

      <div className={styles.section}>
        <h3>What to Look For</h3>
        <ul className={styles.checklist}>
          <li>✅ Toasts appear with correct colors and icons</li>
          <li>✅ Toasts auto-dismiss after timeout</li>
          <li>✅ Multiple toasts stack properly</li>
          <li>✅ Error boundary catches component errors gracefully</li>
          <li>✅ Error messages are user-friendly</li>
          <li>✅ Loading states show appropriate feedback</li>
          <li>✅ No JavaScript errors in console (except intentional test errors)</li>
          <li>✅ Toasts are accessible (keyboard navigation, screen reader friendly)</li>
        </ul>
      </div>
    </div>
  )
}

export default TestUtils