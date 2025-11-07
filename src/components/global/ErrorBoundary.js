// components/global/ErrorBoundary.js - FIXED
'use client';
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 ErrorBoundary caught an error:', error);
    console.error('🔥 Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-red-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong</h2>
            <div className="mb-4">
              <p className="mb-2 text-gray-700">
                A component failed to render. This is usually caused by:
              </p>
              <ul className="ml-4 list-inside list-disc text-gray-600">
                <li>Missing component export</li>
                <li>Wrong import path</li>
                <li>Component returning undefined</li>
              </ul>
            </div>
            <details className="mb-4 whitespace-pre-wrap">
              <summary className="mb-2 cursor-pointer font-semibold">Error Details</summary>
              <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm">
                {this.state.error?.toString() || 'Unknown error'}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
