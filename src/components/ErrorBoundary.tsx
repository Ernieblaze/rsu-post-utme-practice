import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="font-sora text-xl font-bold text-school-navy">
            Something went wrong
          </h1>
          <p className="max-w-sm text-sm text-school-muted">
            {this.state.error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="rounded-xl bg-school-green px-5 py-2.5 text-sm font-bold text-white hover:bg-school-green/90"
          >
            Try again
          </button>
          <a href="/" className="text-sm text-school-muted underline">
            Go to home
          </a>
        </main>
      );
    }
    return this.props.children;
  }
}
