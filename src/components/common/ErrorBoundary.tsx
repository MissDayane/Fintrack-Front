import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('FinTrack UI Error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#F5F7FA',
          }}
        >
          <div className="card" style={{ maxWidth: 460, width: '100%' }}>
            <h1 style={{ fontSize: '1.25rem', color: '#2D0B6B', marginBottom: 8 }}>
              Algo inesperado aconteceu
            </h1>
            <p style={{ color: '#5A6275', fontSize: '0.9rem', marginBottom: 16 }}>
              {this.state.error.message}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Recarregar aplicação
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
