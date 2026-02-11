'use client';

import { Component, type ReactNode } from 'react';
import i18next from 'i18next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="card-paper p-8 text-center my-8">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-lg font-display font-bold text-text-primary mb-2">
            {i18next.t('common.somethingWentWrong')}
          </h2>
          <p className="text-sm text-text-muted mb-4">
            {this.state.error?.message || i18next.t('common.unexpectedErrorPage')}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-primary px-4 py-2"
          >
            {i18next.t('common.tryAgain')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
