/**
 * App.tsx - Main Application Entry Point
 * 
 * Public Static Site - No Authentication Required
 * 
 * Features:
 * - ErrorBoundary (catches React crashes)
 * - Toast notifications
 * - Public landing page with sections
 * - Simple routing for Privacy Policy
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

// Pages & Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Roadmap from './components/Roadmap';

import Contact from './components/Contact';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import FAQ from './components/FAQ';
import CommonMistakes from './components/CommonMistakes';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookieBanner from './components/CookieBanner';
import NotFound from './components/NotFound';
import MathQuiz from './components/MathQuiz';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

// Context Providers
import { ToastProvider } from './contexts/ToastContext';

// --- INNER APP COMPONENT ---
const AppContent: React.FC = () => {
  // State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Listen for navigation changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- BOOKING MODAL ---
  const openBooking = useCallback(() => setIsBookingOpen(true), []);
  const closeBooking = useCallback(() => setIsBookingOpen(false), []);

  // --- PRIVACY POLICY PAGE ---
  if (currentPath === '/privacy-policy' || currentPath === '/gizlilik-politikasi') {
    return <PrivacyPolicy />;
  }

  // --- 404 NOT FOUND PAGE ---
  const validPaths = ['/', '/privacy-policy', '/gizlilik-politikasi'];
  if (!validPaths.includes(currentPath)) {
    return <NotFound />;
  }

  // --- RENDER LANDING PAGE ---
  const renderLandingPage = useMemo(() => (
    <div className="min-h-screen bg-white relative">
      <Navbar
        onBookingClick={openBooking}
      />

      <main>
        <Hero onBookingClick={openBooking} />
        <About />
        <Services onBookingClick={openBooking} />
        <CommonMistakes />
        <Features />
        <Testimonials />
        <FAQ />
        <Roadmap />
        <MathQuiz />

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
  ), [isBookingOpen, openBooking, closeBooking]);

  // --- MAIN RENDER ---
  return renderLandingPage;
};

// --- MAIN APP WITH PROVIDERS ---
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
        <CookieBanner />
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
