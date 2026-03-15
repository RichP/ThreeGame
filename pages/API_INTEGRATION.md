# API Integration and Error Handling Guide

This document provides comprehensive guidance on using the API integration layer and error handling system in the ThreeGame project.

## Table of Contents

1. [API Service Layer](#api-service-layer)
2. [Error Handling](#error-handling)
3. [Toast Notifications](#toast-notifications)
4. [Error Boundaries](#error-boundaries)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

## API Service Layer

The API service layer provides a centralized way to communicate with the backend server. It's located in `services/api.ts`.

### Available API Modules

- **authApi**: Authentication operations (login, register, logout, refresh token)
- **userApi**: User profile and data management
- **friendsApi**: Friend management and social features
- **leaderboardApi**: Leaderboard and ranking data
- **shopApi**: Shop and inventory management
- **matchApi**: Match and game session management

### Basic Usage

```typescript
import { authApi, userApi } from '../services/api'

// Login example
try {
  const response = await authApi.login('username', 'password')
  if (response.success) {
    console.log('Login successful:', response.data)
  }
} catch (error) {
  console.error('Login failed:', error)
}
```

### API Response Structure

All API responses follow a consistent structure:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### Error Handling

The API layer includes automatic error handling with user-friendly messages:

```typescript
import { ApiError, handleApiError } from '../services/api'

try {
  await someApiCall()
} catch (error) {
  if (error instanceof ApiError) {
    const userMessage = handleApiError(error)
    console.log('User-friendly error:', userMessage)
  }
}
```

## Error Handling

### Global Error Boundaries

Error boundaries catch JavaScript errors anywhere in the component tree:

```typescript
import ErrorBoundary from '../components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <YourAppComponents />
    </ErrorBoundary>
  )
}
```

### Custom Error Handler

You can provide a custom error handler:

```typescript
const handleError = (error: Error, errorInfo: ErrorInfo) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error caught:', error, errorInfo)
  }
  
  // Send to error reporting service in production
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
  }
}

<ErrorBoundary onError={handleError}>
  <YourApp />
</ErrorBoundary>
```

## Toast Notifications

Toast notifications provide user-friendly feedback for various operations.

### Using Toast Context

```typescript
import { useToast } from '../components/ToastContainer'

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast()

  const handleAction = () => {
    showSuccess('Operation completed', 'Your changes have been saved.')
  }

  return <button onClick={handleAction}>Save</button>
}
```

### Toast Provider Setup

Wrap your app with the ToastProvider:

```typescript
import { ToastProvider } from '../components/ToastContainer'

function App() {
  return (
    <ToastProvider position="top-right" maxToasts={5}>
      <YourApp />
    </ToastProvider>
  )
}
```

### Toast Types

- **success**: Green background, success icon
- **error**: Red background, error icon
- **warning**: Orange background, warning icon
- **info**: Blue background, info icon

## Error Boundaries

### Main Layout Integration

The MainLayout component includes error boundary and toast provider:

```typescript
import ErrorBoundary from './ErrorBoundary'
import { ToastProvider } from './ToastContainer'

function MainLayout({ children }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="main-layout">
          <NavBar />
          <main>{children}</main>
          <Footer />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  )
}
```

### Custom Error Boundary

Create custom error boundaries for specific components:

```typescript
import React, { Component } from 'react'
import ErrorBoundary from './ErrorBoundary'

class MyComponent extends Component {
  render() {
    return (
      <ErrorBoundary fallback={<div>Loading failed</div>}>
        <YourContent />
      </ErrorBoundary>
    )
  }
}
```

## Usage Examples

### 1. Authentication Flow

```typescript
import { useApiCall } from '../hooks/useApiError'
import { authApi } from '../services/api'
import { useToast } from '../components/ToastContainer'

function LoginForm() {
  const { showSuccess, showError } = useToast()
  
  const loginCall = useApiCall(
    (username, password) => authApi.login(username, password),
    {
      onSuccess: (data) => {
        if (data?.success && data.data) {
          showSuccess('Login Successful', 'Welcome back!')
          localStorage.setItem('authToken', data.data.token)
        }
      },
      onError: (error) => {
        showError('Login Failed', error)
      }
    }
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    await loginCall.execute('username', 'password')
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={loginCall.isLoading}>
        {loginCall.isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### 2. Data Fetching with Error Handling

```typescript
import { useApiCall } from '../hooks/useApiError'
import { userApi } from '../services/api'
import { useToast } from '../components/ToastContainer'

function UserProfile() {
  const { showError } = useToast()
  
  const profileCall = useApiCall(
    () => userApi.getProfile(),
    {
      onError: (error) => {
        showError('Failed to Load Profile', error)
      }
    }
  )

  const loadProfile = async () => {
    await profileCall.execute()
  }

  return (
    <div>
      <button onClick={loadProfile} disabled={profileCall.isLoading}>
        {profileCall.isLoading ? 'Loading...' : 'Load Profile'}
      </button>
      
      {profileCall.data && (
        <div>
          <h3>{profileCall.data.username}</h3>
          <p>{profileCall.data.email}</p>
        </div>
      )}
    </div>
  )
}
```

### 3. Form Validation

```typescript
import { useValidation, validationRules } from '../hooks/useApiError'
import { useToast } from '../components/ToastContainer'

function RegistrationForm() {
  const { showWarning } = useToast()
  const { errors, validateForm, clearFieldError } = useValidation()

  const validationRulesSet = {
    username: [validationRules.required(), validationRules.minLength(3)],
    email: [validationRules.required(), validationRules.email()],
    password: [validationRules.required(), validationRules.minLength(6)],
    confirmPassword: [
      validationRules.required(),
      validationRules.custom(
        (value) => value === formData.password,
        'Passwords do not match'
      )
    ]
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm(formData, validationRulesSet)) {
      showWarning('Validation Error', 'Please check the form fields.')
      return
    }
    
    // Proceed with form submission
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        onChange={(e) => {
          setFormData({...formData, username: e.target.value})
          clearFieldError('username')
        }}
        className={errors.username ? 'error' : ''}
      />
      {errors.username && <span className="error">{errors.username}</span>}
      
      {/* Other form fields */}
    </form>
  )
}
```

## Best Practices

### 1. Always Handle Errors

```typescript
// Good: Handle errors explicitly
try {
  const result = await apiCall()
  if (result.success) {
    // Handle success
  } else {
    // Handle API error
    showError('Operation failed', result.error)
  }
} catch (error) {
  // Handle network/other errors
  showError('Network Error', 'Please check your connection.')
}
```

### 2. Use Loading States

```typescript
// Good: Show loading states
const { execute, isLoading } = useApiCall(apiFunction)

<button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

### 3. Provide User-Friendly Messages

```typescript
// Good: Use user-friendly error messages
catch (error) {
  if (error instanceof ApiError) {
    const message = handleApiError(error)
    showError('Something went wrong', message)
  }
}
```

### 4. Use Toast Notifications Appropriately

```typescript
// Success operations
showSuccess('Saved', 'Your changes have been saved.')

// Errors that user should know about
showError('Save Failed', 'Could not save your changes.')

// Warnings that need attention
showWarning('Warning', 'This action cannot be undone.')

// Informational messages
showInfo('Info', 'New features available.')
```

### 5. Clean Up Resources

```typescript
useEffect(() => {
  // Set up listeners, subscriptions, etc.
  
  return () => {
    // Clean up to prevent memory leaks
  }
}, [])
```

### 6. Handle Authentication State

```typescript
// Check authentication before API calls
const token = localStorage.getItem('authToken')
if (!token) {
  showError('Authentication Required', 'Please log in to continue.')
  return
}
```

## Troubleshooting

### Common Issues

1. **API calls failing silently**: Check if you're handling both success and error cases
2. **Toasts not showing**: Ensure ToastProvider is properly set up in your component tree
3. **Errors not caught**: Make sure ErrorBoundary is wrapping the components that might throw
4. **Validation not working**: Check that validation rules are properly defined and applied

### Debugging Tips

1. **Enable development logging**: Errors are logged to console in development mode
2. **Check network requests**: Use browser dev tools to inspect API calls
3. **Test error scenarios**: Simulate network failures and API errors
4. **Monitor toast notifications**: Ensure they appear and disappear correctly

## Migration Guide

### From Direct Fetch to API Service

```typescript
// Before: Direct fetch
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username, password })
})

// After: Using API service
const response = await authApi.login(username, password)
```

### From Manual Error Handling to useApiCall

```typescript
// Before: Manual error handling
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

const handleSubmit = async () => {
  setLoading(true)
  try {
    const result = await apiCall()
    // Handle success
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

// After: Using useApiCall hook
const { execute, isLoading, error } = useApiCall(apiCall, {
  onSuccess: (data) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  }
})

const handleSubmit = async () => {
  await execute()
}
```

This API integration and error handling system provides a robust foundation for building reliable, user-friendly applications with proper error management and feedback mechanisms.