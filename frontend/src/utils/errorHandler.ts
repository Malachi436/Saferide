import { Alert } from 'react-native';

export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
}

export class ErrorHandler {
  /**
   * Parse and format API errors
   */
  static parseApiError(error: any): ApiError {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        message: error.response.data?.message || 'An error occurred. Please try again.',
        statusCode: error.response.status,
        code: error.response.data?.code,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        message: error.message || 'An unexpected error occurred.',
        code: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Show user-friendly error alert
   */
  static showError(error: any, title: string = 'Error') {
    const parsedError = this.parseApiError(error);
    Alert.alert(title, parsedError.message, [{ text: 'OK' }]);
  }

  /**
   * Show error with retry option
   */
  static showErrorWithRetry(
    error: any,
    onRetry: () => void,
    title: string = 'Error'
  ) {
    const parsedError = this.parseApiError(error);
    Alert.alert(
      title,
      parsedError.message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: onRetry },
      ]
    );
  }

  /**
   * Get user-friendly error message based on status code
   */
  static getErrorMessage(statusCode?: number): string {
    switch (statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  /**
   * Log error for debugging
   */
  static logError(error: any, context: string) {
    if (__DEV__) {
      console.error(`[${context}]`, error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  }
}

/**
 * Hook-friendly error state
 */
export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
}

export const initialErrorState: ErrorState = {
  hasError: false,
  message: '',
};

/**
 * Convert error to error state
 */
export function toErrorState(error: any): ErrorState {
  const parsed = ErrorHandler.parseApiError(error);
  return {
    hasError: true,
    message: parsed.message,
    code: parsed.code,
  };
}

/**
 * Clear error state
 */
export function clearErrorState(): ErrorState {
  return initialErrorState;
}
