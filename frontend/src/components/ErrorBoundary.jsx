import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[⚠️ React ErrorBoundary] Caught crash:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-main p-6 tech-grid">
          <div className="glass-panel neon-glow max-w-lg w-full p-8 rounded-2xl border border-rose-500/20 text-center">
            <div className="inline-flex p-4 rounded-full bg-rose-500/10 text-rose-500 mb-6">
              <AlertCircle className="w-12 h-12" />
            </div>
            
            <h1 className="text-2xl font-bold text-txt-primary mb-3">
              Application Error Encountered
            </h1>
            
            <p className="text-txt-secondary text-sm mb-6 leading-relaxed">
              React rendering crashed. This is commonly caused by concurrent DOM manipulations between animation engines or API issues. The stack has been logged safely.
            </p>

            <div className="bg-black/40 rounded-xl p-4 text-left font-mono text-xs text-rose-300 overflow-auto max-h-40 mb-6 border border-rose-500/10">
              {this.state.error?.toString() || 'Unknown error'}
            </div>

            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/80 transition-all cursor-pointer shadow-lg hover:shadow-brand-primary/20"
            >
              <RefreshCw className="w-4 h-4" />
              Reset & Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
