import { useState, useCallback } from 'react'
import { ApiError, handleApiError } from '../services/api'

export interface ErrorState {
  error: string | null
  isLoading: boolean
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  clearError: () => void
}

export interface UseApiErrorOptions {
  onError?: (error: string) => void
  onLoadingChange?: (loading: boolean) => void
  defaultErrorMessage?: string
}

export const useApiError = (options: UseApiErrorOptions = {}): ErrorState => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState<boolean>(false)

  const handleError = useCallback((error: any) => {
    let errorMessage = options.defaultErrorMessage || 'An unexpected error occurred.'

    if (error instanceof ApiError) {
      errorMessage = handleApiError(error)
    } else if (error?.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    setError(errorMessage)
    
    if (options.onError) {
      options.onError(errorMessage)
    }
  }, [options])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    isLoading,
    setError: (error: string | null) => {
      setError(error)
      if (error && options.onError) {
        options.onError(error)
      }
    },
    setLoading: (loading: boolean) => {
      setLoading(loading)
      if (options.onLoadingChange) {
        options.onLoadingChange(loading)
      }
    },
    clearError
  }
}

// Hook for handling API calls with error management
export const useApiCall = <T,>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiErrorOptions & {
    onSuccess?: (data: T) => void
    showSuccessMessage?: boolean
    successMessage?: string
  } = {}
) => {
  const errorState = useApiError(options)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      errorState.setLoading(true)
      errorState.clearError()
      
      const result = await apiFunction(...args)
      
      setData(result)
      
      if (options.onSuccess) {
        options.onSuccess(result)
      }
      
      if (options.showSuccessMessage && options.successMessage) {
        // You could integrate with a toast notification system here
        console.log('Success:', options.successMessage)
      }
      
      return result
    } catch (error) {
      errorState.setError(error as any)
      return null
    } finally {
      errorState.setLoading(false)
    }
  }, [apiFunction, errorState, options])

  return {
    ...errorState,
    data,
    execute
  }
}

// Hook for handling form submissions with error management
export const useFormError = (options: UseApiErrorOptions & {
  onSuccess?: () => void
  resetOnSuccess?: boolean
} = {}) => {
  const errorState = useApiError(options)
  
  const handleSubmit = useCallback(async (submitFunction: () => Promise<void>) => {
    try {
      errorState.setLoading(true)
      errorState.clearError()
      
      await submitFunction()
      
      if (options.onSuccess) {
        options.onSuccess()
      }
      
      if (options.resetOnSuccess) {
        errorState.clearError()
      }
    } catch (error) {
      errorState.setError(error as any)
    } finally {
      errorState.setLoading(false)
    }
  }, [errorState, options])

  return {
    ...errorState,
    handleSubmit
  }
}

// Hook for handling validation errors
export const useValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = useCallback((name: string, value: any, rules: ValidationRule[]): string | null => {
    for (const rule of rules) {
      const error = rule.validator(value)
      if (error) {
        return `${name} ${error}`
      }
    }
    return null
  }, [])

  const validateForm = useCallback((data: Record<string, any>, rules: Record<string, ValidationRule[]>): boolean => {
    const newErrors: Record<string, string> = {}
    
    Object.keys(rules).forEach(field => {
      const error = validateField(field, data[field], rules[field])
      if (error) {
        newErrors[field] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [validateField])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError
  }
}

// Validation rule types
export interface ValidationRule {
  validator: (value: any) => string | null
  message?: string
}

// Common validation rules
export const validationRules = {
  required: (message = 'is required'): ValidationRule => ({
    validator: (value: any) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return message
      }
      return null
    }
  }),

  email: (message = 'must be a valid email'): ValidationRule => ({
    validator: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (value && !emailRegex.test(value)) {
        return message
      }
      return null
    }
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (value && value.length < min) {
        return message || `must be at least ${min} characters long`
      }
      return null
    }
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validator: (value: string) => {
      if (value && value.length > max) {
        return message || `must be no more than ${max} characters long`
      }
      return null
    }
  }),

  pattern: (regex: RegExp, message = 'format is invalid'): ValidationRule => ({
    validator: (value: string) => {
      if (value && !regex.test(value)) {
        return message
      }
      return null
    }
  }),

  custom: (validator: (value: any) => boolean, message: string): ValidationRule => ({
    validator: (value: any) => {
      if (!validator(value)) {
        return message
      }
      return null
    }
  })
}

// Hook for displaying user-friendly error messages in components
export const useErrorMessage = () => {
  const [message, setMessage] = useState<string | null>(null)
  const [type, setType] = useState<'error' | 'warning' | 'info' | 'success'>('error')

  const showError = useCallback((error: string) => {
    setMessage(error)
    setType('error')
  }, [])

  const showWarning = useCallback((warning: string) => {
    setMessage(warning)
    setType('warning')
  }, [])

  const showInfo = useCallback((info: string) => {
    setMessage(info)
    setType('info')
  }, [])

  const showSuccess = useCallback((success: string) => {
    setMessage(success)
    setType('success')
  }, [])

  const clearMessage = useCallback(() => {
    setMessage(null)
  }, [])

  return {
    message,
    type,
    showError,
    showWarning,
    showInfo,
    showSuccess,
    clearMessage
  }
}