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
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                A component failed to render. This is usually caused by:
              </p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Missing component export</li>
                <li>Wrong import path</li>
                <li>Component returning undefined</li>
              </ul>
            </div>
            <details className="whitespace-pre-wrap mb-4">
              <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {this.state.error?.toString() || 'Unknown error'}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
