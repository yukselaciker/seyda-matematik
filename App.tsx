/**
 * App.tsx - Main Application Entry Point
 * 
 * Production-grade implementation with 3-Layer Protection System:
 * - Layer 1: ErrorBoundary (catches React crashes)
 * - Layer 2: useSystemMonitor (continuous health monitoring)
 * - Layer 3: StorageService (safe data access)
 * 
 * Additional features:
 * - Robust authentication with duplicate prevention
 * - Safe hydration (no flash of wrong content)
 * - Clean logout flow
 * - Context providers properly ordered
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle } from 'lucide-react';

// Pages & Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import MathAssistant from './components/MathAssistant';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import AuthPage from './components/AuthPage';
import DashboardLayout from './components/DashboardLayout';
import StudentPanel from './components/StudentPanel';
import TeacherPanel from './components/TeacherPanel';
import { LoadingSpinner } from './components/student';
import FAQ from './components/FAQ';
import CommonMistakes from './components/CommonMistakes';

// Error Boundary (Layer 1)
import ErrorBoundary from './components/ErrorBoundary';

// Context Providers
import { ToastProvider, useToast } from './contexts/ToastContext';

// System Monitor Hook (Layer 2)
import { useSystemMonitor } from './hooks/useSystemMonitor';
import { useSystemHealth } from './hooks/useSystemHealth';

// Services & Types (Layer 3)
import StorageService from './services/StorageService';
import { User } from './types';

// --- VIEW TYPES ---
type AppView = 'landing' | 'login' | 'register' | 'dashboard';

// --- SYSTEM HEALTH INDICATOR COMPONENT ---
const SystemHealthIndicator: React.FC<{ isHealthy: boolean }> = ({ isHealthy }) => {
  if (isHealthy) return null;
  
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-amber-500 text-white px-3 py-2 rounded-lg shadow-lg text-xs flex items-center gap-2 animate-pulse">
      <span className="w-2 h-2 bg-white rounded-full animate-ping" />
      Sistem onarılıyor...
    </div>
  );
};

// --- INNER APP COMPONENT ---
const AppContent: React.FC = () => {
  // State
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [systemHealthy, setSystemHealthy] = useState(true);

  // Hooks
  const { showToast } = useToast();

  // --- PRODUCTION: Self-Healing System Health (runs on mount) ---
  useSystemHealth();

  // --- LAYER 2: System Health Monitor ---
  useSystemMonitor({
    enabled: true,
    intervalMs: 10000, // Check every 10 seconds
    onHealthCheck: (result) => {
      setSystemHealthy(result.isHealthy);
      
      // Notify user if repairs were made
      if (result.repairedKeys.length > 0 && isHydrated) {
        console.log('🔧 System auto-repaired:', result.repairedKeys);
      }
    },
    onRepair: (key, reason) => {
      console.warn(`🔧 Auto-repaired "${key}": ${reason}`);
    },
  });

  // --- INITIALIZE DEFAULT DATA ON MOUNT ---
  useEffect(() => {
    // Ensure default data exists before loading user
    StorageService.initializeDefaults();
  }, []);

  // --- HYDRATION: Load user from localStorage on mount ---
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = StorageService.getCurrentUser();
        if (savedUser?.id && savedUser?.email) {
          // Validate user still exists in users list
          const userExists = StorageService.findUserByEmail(savedUser.email);
          if (userExists) {
            setUser(savedUser);
            setCurrentView('dashboard');
          } else {
            // User was deleted, clear session
            StorageService.setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
        StorageService.setCurrentUser(null);
      } finally {
        setIsHydrated(true);
      }
    };

    // Small delay to ensure localStorage is ready
    const timer = setTimeout(loadUser, 50);
    return () => clearTimeout(timer);
  }, []);

  // --- AUTH HANDLERS ---
  const handleLoginSuccess = useCallback((userData: User) => {
    if (!userData?.id || !userData?.email) {
      showToast('Giriş başarısız: Geçersiz kullanıcı bilgisi.', 'error');
      return;
    }

    setUser(userData);
    StorageService.setCurrentUser(userData);
    setCurrentView('dashboard');
    setDashboardTab('overview');
    
    // Welcome toast
    const firstName = userData.full_name?.split(' ')[0] || 'Öğrenci';
    showToast(`Hoş geldin, ${firstName}! 👋`, 'success');
  }, [showToast]);

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    
    // Simulate cleanup delay for better UX
    setTimeout(() => {
      setUser(null);
      StorageService.setCurrentUser(null);
      setCurrentView('landing');
      setDashboardTab('overview');
      setIsLoggingOut(false);
      showToast('Güvenli bir şekilde çıkış yaptınız.', 'info');
    }, 1000);
  }, [showToast]);

  // --- NAVIGATION ---
  const handleNavigate = useCallback((view: string) => {
    setCurrentView(view as AppView);
  }, []);

  // --- BOOKING MODAL ---
  const openBooking = useCallback(() => setIsBookingOpen(true), []);
  const closeBooking = useCallback(() => setIsBookingOpen(false), []);

  // --- RENDER HELPERS ---
  const renderDashboard = useMemo(() => {
    if (!user) {
      return <AuthPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} initialMode="login" />;
    }

    return (
      <DashboardLayout 
        user={user} 
        activeTab={dashboardTab} 
        onTabChange={setDashboardTab}
        onLogout={handleLogout}
      >
        {user.role === 'student' && (
          <StudentPanel 
            user={user} 
            activeTab={dashboardTab}
            onLogout={handleLogout}
          />
        )}
        {user.role === 'teacher' && (
          <TeacherPanel 
            user={user} 
            activeTab={dashboardTab} 
          />
        )}
        {user.role === 'parent' && (
          <div className="text-center p-10 bg-white rounded-2xl border border-slate-100">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Veli Paneli
              </h3>
              <p className="text-slate-600">
                Geliştirme aşamasında. Yakında öğrenci grafikleri ve ilerleme raporlarını buradan takip edebileceksiniz.
              </p>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }, [user, dashboardTab, handleNavigate, handleLoginSuccess, handleLogout]);

  const renderLandingPage = useMemo(() => (
    <div className="min-h-screen bg-white relative">
      <Navbar 
        onBookingClick={openBooking} 
        onNavigate={handleNavigate} 
        currentView={currentView}
        isLoggedIn={!!user}
      />
      
      <main>
        <Hero onBookingClick={openBooking} />
        <About />
        <Services onBookingClick={openBooking} />
        <CommonMistakes />
        <Features />
        <Testimonials />
        <FAQ />
        <MathAssistant />
        <Contact />
      </main>

      <Footer />
      <BookingModal isOpen={isBookingOpen} onClose={closeBooking} />

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/905337652071"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 flex items-center justify-center"
        aria-label="WhatsApp ile iletişime geç"
      >
        <MessageCircle className="h-8 w-8" />
      </a>
    </div>
  ), [currentView, user, isBookingOpen, openBooking, closeBooking, handleNavigate]);

  // --- LOADING STATE (Pre-hydration) ---
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Yükleniyor..." />
      </div>
    );
  }

  // --- LOGOUT OVERLAY ---
  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#1C2A5E]/90 backdrop-blur-sm flex items-center justify-center flex-col">
        <LoadingSpinner size="lg" />
        <h2 className="text-2xl font-bold text-white mt-4 mb-2">Çıkış Yapılıyor...</h2>
        <p className="text-indigo-200 text-sm">
          Oturumunuz güvenli bir şekilde kapatılıyor
        </p>
      </div>
    );
  }

  // --- MAIN ROUTING ---
  return (
    <>
      {/* System Health Indicator */}
      <SystemHealthIndicator isHealthy={systemHealthy} />
      
      {/* Main Content */}
      {(() => {
        switch (currentView) {
          case 'dashboard':
            return renderDashboard;
          case 'login':
            return <AuthPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} initialMode="login" />;
          case 'register':
            return <AuthPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} initialMode="register" />;
          case 'landing':
          default:
            return renderLandingPage;
        }
      })()}
    </>
  );
};

// --- MAIN APP WITH PROVIDERS ---
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
