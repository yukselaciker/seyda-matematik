/**
 * ErrorBoundary.tsx - Global Error Boundary (Layer 1: The Safety Net)
 * 
 * Catches any React tree crashes and displays a friendly recovery UI
 * instead of the dreaded "White Screen of Death"
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console for debugging
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('📍 Component Stack:', errorInfo.componentStack);
    
    this.setState({ errorInfo });

    // Optionally send to error tracking service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo): void => {
    // In production, you would send this to an error tracking service
    // For now, we'll store it in localStorage for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      const existingLogs = JSON.parse(localStorage.getItem('app_error_logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 10 errors
      const recentLogs = existingLogs.slice(-10);
      localStorage.setItem('app_error_logs', JSON.stringify(recentLogs));
    } catch (e) {
      // Silent fail - don't cause another error
    }
  };

  handleReload = (): void => {
    this.setState({ isRecovering: true });
    
    // Small delay for UX feedback
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  handleClearAndReload = (): void => {
    this.setState({ isRecovering: true });
    
    // Clear potentially corrupt data
    try {
      // Only clear app-specific data, not everything
      const keysToPreserve = ['app_users']; // Keep user accounts
      const appKeys = Object.keys(localStorage).filter(key => key.startsWith('app_'));
      
      appKeys.forEach(key => {
        if (!keysToPreserve.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('🧹 Cleared potentially corrupt app data');
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }

    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  handleGoHome = (): void => {
    this.setState({ isRecovering: true });
    
    // Clear current user to force re-login
    try {
      localStorage.removeItem('mockUser');
    } catch (e) {
      // Silent fail
    }

    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            {/* Recovery Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                  </div>
                  {this.state.isRecovering && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className="w-10 h-10 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-white text-center mb-2">
                {this.state.isRecovering ? 'Sistem Kurtarılıyor...' : 'Bir Şeyler Ters Gitti'}
              </h1>
              
              <p className="text-indigo-200 text-center mb-6">
                {this.state.isRecovering 
                  ? 'Lütfen bekleyin, sayfa yeniden yükleniyor...'
                  : 'Endişelenmeyin, verileriniz güvende. Sistemi kurtarmak için aşağıdaki seçeneklerden birini kullanın.'
                }
              </p>

              {/* Action Buttons */}
              {!this.state.isRecovering && (
                <div className="space-y-3">
                  <button
                    onClick={this.handleReload}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Sayfayı Yenile
                  </button>

                  <button
                    onClick={this.handleClearAndReload}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Bug className="w-5 h-5" />
                    Önbelleği Temizle ve Yenile
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/20"
                  >
                    <Home className="w-5 h-5" />
                    Ana Sayfaya Dön
                  </button>
                </div>
              )}

              {/* Error Details (Collapsed) */}
              {!this.state.isRecovering && this.state.error && (
                <details className="mt-6">
                  <summary className="text-xs text-indigo-300 cursor-pointer hover:text-indigo-200 transition-colors">
                    Teknik Detaylar (Geliştiriciler İçin)
                  </summary>
                  <div className="mt-2 p-3 bg-black/30 rounded-lg overflow-auto max-h-32">
                    <code className="text-xs text-red-300 whitespace-pre-wrap break-all">
                      {this.state.error.message}
                      {this.state.error.stack && (
                        <>
                          {'\n\n'}
                          {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                        </>
                      )}
                    </code>
                  </div>
                </details>
              )}
            </div>

            {/* Branding */}
            <p className="text-center text-indigo-300/50 text-xs mt-6">
              Şeyda Açıker Eğitim Platformu • Sistem Koruma Aktif
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;




