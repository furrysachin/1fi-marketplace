import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Catches any rendering error in the component tree and shows a branded
 * recovery screen instead of a blank white page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle size={26} />
          </span>
          <h1 className="mt-4 text-xl font-extrabold text-ink-900">Something went wrong</h1>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            An unexpected error occurred. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary mt-6 flex items-center gap-2"
          >
            <RotateCcw size={15} />
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
