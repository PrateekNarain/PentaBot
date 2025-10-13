// src/components/ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo); // Log error details
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-500 bg-gray-800">
          <h1>Something went wrong: {this.state.error.message}</h1>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;