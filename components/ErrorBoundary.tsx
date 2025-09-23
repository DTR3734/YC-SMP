import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logService } from '../services/logService';
import { AlertTriangleIcon } from './IconComponents';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    logService.error(`Uncaught application error: ${error.message}`);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg">
                <div className="flex justify-center items-center mb-4">
                    <AlertTriangleIcon className="w-16 h-16 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Something went wrong.</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    An unexpected error occurred. Please try refreshing the page. If the problem persists, please contact support.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Refresh Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
