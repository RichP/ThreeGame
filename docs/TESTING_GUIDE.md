# Testing Guide for API Integration and Error Handling

This guide provides comprehensive instructions on how to test the API integration layer and error handling system in the ThreeGame project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up Test Environment](#setting-up-test-environment)
3. [Testing API Integration](#testing-api-integration)
4. [Testing Error Handling](#testing-error-handling)
5. [Testing Toast Notifications](#testing-toast-notifications)
6. [Manual Testing Scenarios](#manual-testing-scenarios)
7. [Automated Testing](#automated-testing)
8. [Debugging Tips](#debugging-tips)

## Prerequisites

Before testing, ensure you have:

- Node.js and npm installed
- The ThreeGame project set up and running
- A backend API server (or mock server) available
- Browser with developer tools

## Setting Up Test Environment

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Set Up API Endpoint

Update the API base URL in `services/api.ts`:

```typescript
// For development with local backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// For testing with mock server
const API_BASE_URL = 'http://localhost:3001/api'
```

### 3. Create Test Data

You'll need test data for:
- User accounts (test users)
- Friends data
- Match history
- Leaderboard entries
- Shop items

## Testing API Integration

### 1. Test Authentication Flow

**File**: `components/examples/ApiExample.tsx`

Navigate to the API example page and test:

1. **Registration**:
   - Fill in valid registration form
   - Submit and verify success toast appears
   - Check for validation errors with invalid data

2. **Login**:
   - Test with valid credentials
   - Test with invalid credentials
   - Verify error messages appear correctly

3. **Token Management**:
   - Check if tokens are stored in localStorage after login
   - Test logout functionality

### 2. Test User Data Operations

1. **Profile Loading**:
   - Click "Load Profile" button
   - Verify profile data displays correctly
   - Test error handling when no authentication

2. **Friends Loading**:
   - Click "Load Friends" button
   - Verify friends list displays
   - Test with empty friends list

### 3. Test API Error Scenarios

**Manual Error Testing**:

1. **Network Errors**:
   - Disconnect from internet
   - Try API calls and verify error messages

2. **Server Errors**:
   - Use incorrect API endpoints
   - Test 404, 500 error responses

3. **Authentication Errors**:
   - Clear localStorage tokens
   - Try authenticated API calls

## Testing Error Handling

### 1. JavaScript Error Testing

**Intentional Errors**:

1. **Component Errors**:
   ```typescript
   // Add this to any component to test error boundary
   useEffect(() => {
     throw new Error('Test error for error boundary')
   }, [])
   ```

2. **Render Errors**:
   ```typescript
   // In render method
   const data = null
   return <div>{data.nonExistentProperty}</div>
   ```

### 2. Error Boundary Testing

1. **Global Error Boundary**:
   - The MainLayout includes an error boundary
   - Test by throwing errors in child components
   - Verify error boundary UI appears

2. **Custom Error Boundary**:
   - Wrap components with ErrorBoundary
   - Test fallback UI rendering

### 3. API Error Handling

1. **HTTP Error Codes**:
   - Test 401 (Unauthorized)
   - Test 403 (Forbidden)
   - Test 404 (Not Found)
   - Test 500 (Internal Server Error)

2. **Network Issues**:
   - Test offline scenarios
   - Test slow network responses
   - Test timeout scenarios

## Testing Toast Notifications

### 1. Toast Types Testing

**File**: `components/examples/ApiExample.tsx`

Test all toast types:

1. **Success Toasts**:
   - Click "Show Success" button
   - Verify green styling and success icon
   - Check auto-dismissal timing

2. **Error Toasts**:
   - Click "Show Error" button
   - Verify red styling and error icon
   - Test manual dismissal

3. **Warning Toasts**:
   - Click "Show Warning" button
   - Verify orange styling and warning icon

4. **Info Toasts**:
   - Click "Show Info" button
   - Verify blue styling and info icon

### 2. Toast Behavior Testing

1. **Multiple Toasts**:
   - Trigger multiple toasts rapidly
   - Verify they stack correctly
   - Test max toast limit

2. **Position Testing**:
   - Change ToastProvider position prop
   - Test all positions: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center

3. **Accessibility**:
   - Test keyboard navigation
   - Verify screen reader announcements
   - Check ARIA attributes

## Manual Testing Scenarios

### Scenario 1: Complete User Flow

1. **Registration**:
   - Register new account
   - Verify success message
   - Check localStorage for tokens

2. **Login**:
   - Login with new account
   - Verify success message
   - Check profile data loads

3. **Data Operations**:
   - Load friends list
   - Load match history
   - Navigate between pages

4. **Logout**:
   - Logout and verify tokens cleared
   - Try accessing protected data

### Scenario 2: Error Handling

1. **Network Issues**:
   - Turn off internet
   - Try API calls
   - Verify error messages

2. **Invalid Data**:
   - Submit invalid forms
   - Verify validation errors
   - Test error clearing

3. **Component Errors**:
   - Trigger JavaScript errors
   - Verify error boundary catches them
   - Test recovery

### Scenario 3: Edge Cases

1. **Empty Data**:
   - Test with empty friends list
   - Test with no match history
   - Verify graceful handling

2. **Large Data**:
   - Test with many friends
   - Test long toast messages
   - Verify performance

3. **Rapid Actions**:
   - Click buttons rapidly
   - Test loading states
   - Verify no duplicate requests

## Automated Testing

### 1. Unit Tests

Create test files for API services:

```typescript
// __tests__/api.test.ts
import { authApi } from '../services/api'

describe('API Integration', () => {
  test('login should return success for valid credentials', async () => {
    const result = await authApi.login('testuser', 'testpass')
    expect(result.success).toBe(true)
  })

  test('login should return error for invalid credentials', async () => {
    await expect(authApi.login('invalid', 'invalid'))
      .rejects.toThrow()
  })
})
```

### 2. Integration Tests

Test component integration:

```typescript
// __tests__/components.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import ApiExample from '../components/examples/ApiExample'

describe('API Example Component', () => {
  test('should show validation errors for invalid input', () => {
    render(<ApiExample />)
    
    const usernameInput = screen.getByLabelText('Username')
    fireEvent.change(usernameInput, { target: { value: 'ab' } })
    
    expect(screen.getByText(/must be at least 3 characters/i)).toBeInTheDocument()
  })
})
```

### 3. E2E Tests

Using Playwright or Cypress:

```typescript
// e2e/auth.spec.ts
describe('Authentication Flow', () => {
  it('should register and login successfully', async () => {
    await page.goto('/auth')
    
    // Fill registration form
    await page.fill('[name="username"]', 'testuser')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    
    await page.click('button[type="submit"]')
    
    // Verify success toast
    await expect(page.locator('.toast')).toContainText('Registration Successful')
  })
})
```

## Debugging Tips

### 1. Browser Developer Tools

1. **Network Tab**:
   - Monitor API requests
   - Check request/response headers
   - Verify status codes

2. **Console Tab**:
   - Check for JavaScript errors
   - Monitor console logs
   - Verify error boundary catches

3. **Application Tab**:
   - Check localStorage for tokens
   - Monitor session storage
   - Verify data persistence

### 2. Logging

Enable debug logging:

```typescript
// In development, errors are logged to console
if (process.env.NODE_ENV === 'development') {
  console.error('Error caught:', error, errorInfo)
}
```

### 3. Error Simulation

Create test utilities for error simulation:

```typescript
// utils/testHelpers.ts
export const simulateNetworkError = () => {
  // Mock fetch to throw network errors
  global.fetch = jest.fn(() => Promise.reject(new Error('Network error')))
}

export const simulateServerError = (status: number) => {
  global.fetch = jest.fn(() => 
    Promise.resolve(new Response('', { status }))
  )
}
```

### 4. Common Issues

1. **CORS Errors**:
   - Check backend CORS configuration
   - Verify API endpoint URL

2. **Authentication Issues**:
   - Check token storage
   - Verify token format
   - Test token expiration

3. **Toast Not Appearing**:
   - Verify ToastProvider is in component tree
   - Check for CSS conflicts
   - Verify z-index values

4. **Error Boundary Not Catching**:
   - Ensure ErrorBoundary wraps components
   - Check for async errors (not caught by boundaries)
   - Verify error is thrown in render

## Performance Testing

### 1. Load Testing

Test with multiple concurrent requests:

```typescript
// Test multiple API calls
const promises = Array.from({ length: 10 }, (_, i) => 
  userApi.getProfile()
)

await Promise.all(promises)
```

### 2. Memory Testing

Monitor memory usage:
- Check for memory leaks in toast components
- Verify proper cleanup in error boundaries
- Monitor component unmounting

### 3. Network Testing

Test various network conditions:
- Slow network simulation
- Intermittent connectivity
- High latency scenarios

This comprehensive testing guide ensures your API integration and error handling system works reliably across all scenarios and edge cases.