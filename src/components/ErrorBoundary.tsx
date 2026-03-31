import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-[#0B0B0D] flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Something went wrong.
          </h2>
          <p className="text-white/60 mb-8 max-w-md">
            The application encountered an unexpected error. This is often caused by animation conflicts or state mismatches.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#D4A24F] text-black font-medium rounded-full hover:bg-[#c49345] transition-colors"
          >
            Reload Application
          </button>
          {import.meta.env.DEV && (
            <pre className="mt-8 p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-500 text-xs text-left max-w-xl overflow-auto">
              {this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

