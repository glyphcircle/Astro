import React, { Component, ErrorInfo, ReactNode } from 'react';
import Card from './Card';
import Button from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Standard React Error Boundary component.
 */
// Fix: Changed to extend Component directly and imported it explicitly to resolve 'setState' and 'props' resolution issues in TypeScript.
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🌌 Cosmic Interruption Caught:", error, errorInfo);
  }

  // Use arrow function for class property to correctly bind 'this'
  public handleRetry = () => {
    // Fix: Accessing setState from the inherited Component class.
    this.setState({ hasError: false, error: null });
    window.location.reload(); 
  }

  public handleForceReset = () => {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('glyph_admin_session');
      sessionStorage.clear();
      window.location.href = '/';
  }

  public render(): ReactNode {
    const { hasError, error } = this.state;
    // Fix: Accessing props from the inherited Component class.
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 animate-fade-in-up">
          <Card className="max-w-md w-full border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.2)] bg-[#0A0A1A]">
            <div className="p-8 text-center">
              <div className="mb-6 inline-block p-4 rounded-full bg-red-900/20 border border-red-500/40 relative">
                <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-cinzel font-bold text-amber-100 mb-2 uppercase tracking-widest">
                Cosmic anomaly detected
              </h2>
              
              <p className="text-amber-200/60 font-lora mb-6 italic text-xs">
                "A signal was aborted or the database loop timed out. The stars require a realignment."
              </p>

              {error && (
                <div className="bg-black/60 p-3 rounded mb-6 text-[10px] text-red-300 font-mono text-left overflow-auto max-h-24 border border-red-900/30 custom-scrollbar">
                  {error.message || "Unknown anomaly"}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button onClick={this.handleRetry} className="w-full bg-gradient-to-r from-red-900 to-maroon-800 border-red-500/50 shadow-lg">
                    Realign & Retry ✦
                </Button>
                <button onClick={this.handleForceReset} className="text-[9px] text-gray-600 hover:text-white uppercase tracking-widest font-bold underline">
                    Clear Session Locks & Reset
                </button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;