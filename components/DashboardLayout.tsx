/**
 * DashboardLayout.tsx - Main Dashboard Layout with RBAC
 * 
 * Security Features:
 * - Role-Based Access Control (RBAC) - NO manual toggle
 * - Admin sees: Video Upload, Appointment Management, Student Overview
 * - Students see: Homework, Library, Flashcards, Videos
 * - Roles determined ONLY by authentication, not UI toggles
 * 
 * Features:
 * - Responsive sidebar navigation
 * - Notification center with badge
 * - Whiteboard quick access
 * - User profile section
 * - Clean sidebar (no decorative logos)
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  LogOut, BookOpen, LayoutDashboard, Calendar, Video, MessageCircle, 
  Menu, X, ChevronRight, User, Layers, FileCheck, FileText, Upload, 
  Users, Settings, Check, Trash2, Bell, CalendarCheck, Mail,
  Loader2, Shield, GraduationCap, PenTool
} from 'lucide-react';
import { User as UserType } from '../types';
import { Whiteboard } from './student/Whiteboard';
import { ActiveClassmates } from './student/ActiveClassmates';

// --- NOTIFICATION TYPES ---
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  readStatus: boolean;
  type?: 'info' | 'success' | 'warning' | 'xp';
}

// --- STORAGE HELPERS ---
const NOTIFICATIONS_KEY = 'app_notifications';

const getStoredNotifications = (): AppNotification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load notifications', e);
  }
  
  // Initialize with welcome notifications
  const defaultNotifications: AppNotification[] = [
    {
      id: 'notif_welcome_1',
      title: 'Hoşgeldiniz!',
      message: 'Şeyda Açıker Eğitim Platformuna hoşgeldiniz. Başarılı bir öğretim yolculuğu dileriz!',
      timestamp: new Date().toISOString(),
      readStatus: false,
      type: 'success',
    },
    {
      id: 'notif_welcome_2',
      title: 'Flashcard Özelliği Yeni!',
      message: 'Yeni Flashcard özelliğimizi keşfetmeyi unutmayın. Kartlarla çalışarak konuları daha iyi öğrenebilirsiniz.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      readStatus: false,
      type: 'info',
    },
  ];
  
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(defaultNotifications));
  return defaultNotifications;
};

const saveNotifications = (notifications: AppNotification[]): void => {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
};

// --- PROPS ---
interface DashboardLayoutProps {
  user: UserType;
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

// --- NOTIFICATION DROPDOWN COMPONENT ---
interface NotificationDropdownProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  notifications, 
  onMarkAllRead, 
  onClearAll,
  onClose 
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return diffMins + ' dk önce';
    if (diffHours < 24) return diffHours + ' saat önce';
    return diffDays + ' gün önce';
  };

  const getTypeStyles = (type?: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-600';
      case 'warning': return 'bg-yellow-100 text-yellow-600';
      case 'xp': return 'bg-purple-100 text-purple-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'xp': return '⭐';
      default: return 'ℹ';
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fadeIn">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
        <div>
          <h3 className="font-bold text-slate-800">Bildirimler</h3>
          <p className="text-xs text-slate-500">{notifications.filter(n => !n.readStatus).length} okunmamış</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onMarkAllRead}
            className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Tümünü okundu işaretle"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onClearAll}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Tümünü temizle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Henüz bildirim yok</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id}
              className={'p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ' + (
                !notif.readStatus ? 'bg-blue-50/30' : ''
              )}
            >
              <div className="flex gap-3">
                <div className={'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + getTypeStyles(notif.type)}>
                  <span className="text-sm">{getTypeIcon(notif.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={'font-semibold text-sm ' + (!notif.readStatus ? 'text-slate-800' : 'text-slate-600')}>
                      {notif.title}
                    </h4>
                    {!notif.readStatus && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{formatTime(notif.timestamp)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={onClose}
            className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Kapat
          </button>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, children, activeTab, onTabChange, onLogout }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  
  // Notification state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // RBAC: Determine if user is admin
  const isAdmin = useMemo(() => {
    return user?.role === 'admin' || user?.role === 'teacher';
  }, [user?.role]);

  // Load notifications on mount
  useEffect(() => {
    setNotifications(getStoredNotifications());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    };

    if (showNotificationsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsDropdown]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.readStatus).length;

  // Handle mark all as read
  const handleMarkAllRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, readStatus: true }));
    setNotifications(updated);
    saveNotifications(updated);
  }, [notifications]);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
    setShowNotificationsDropdown(false);
  }, []);

  // Toggle notifications dropdown
  const toggleNotifications = useCallback(() => {
    setShowNotificationsDropdown(prev => !prev);
  }, []);

  const handleSafeLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      onLogout();
      setIsLoggingOut(false);
    }, 2000);
  };

  // RBAC: Dynamic menu items based on user role
  const menuItems = useMemo(() => {
    if (isAdmin) {
      // ADMIN/TEACHER MENU
      return [
        { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
        { id: 'messages', label: 'Mesajlar', icon: Mail }, // Added messages
        { id: 'students', label: 'Öğrenci Listesi', icon: Users },
        { id: 'upload', label: 'Ders Yönetimi', icon: Upload },
        { id: 'practice-exams', label: 'Sınav Yönetimi', icon: FileCheck },
        { id: 'appointment-requests', label: 'Randevu Talepleri', icon: CalendarCheck },
        { id: 'calendar', label: 'Randevular', icon: Calendar },
        { id: 'library', label: 'Kütüphane', icon: BookOpen },
        { id: 'videos', label: 'Video Dersler', icon: Video },
      ];
    } else {
      // STUDENT MENU
      return [
        { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
        { id: 'homework', label: 'Ödevlerim', icon: FileText },
        { id: 'flashcards', label: 'Flashcards', icon: Layers },
        { id: 'practice-exams', label: 'Deneme Sınavları', icon: FileCheck },
        { id: 'calendar', label: 'Randevu Al', icon: Calendar },
        { id: 'library', label: 'Kütüphane', icon: BookOpen },
        { id: 'videos', label: 'Video Dersler', icon: Video },
        { id: 'chat', label: 'AI Asistan', icon: MessageCircle },
      ];
    }
  }, [isAdmin]);

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  // Get role display text
  const getRoleDisplay = () => {
    if (user?.role === 'admin') return 'Yönetici';
    if (user?.role === 'teacher') return 'Öğretmen';
    if (user?.role === 'parent') return 'Veli';
    return 'Öğrenci';
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    if (user?.role === 'admin') return 'bg-amber-500 text-white';
    if (user?.role === 'teacher') return 'bg-purple-500 text-white';
    return 'bg-indigo-500 text-white';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* LOGOUT OVERLAY */}
      {isLoggingOut && (
         <div className="fixed inset-0 z-[100] bg-[#1C2A5E]/90 backdrop-blur-sm flex items-center justify-center flex-col animate-fadeIn">
            <Loader2 className="w-16 h-16 text-[#D4AF37] animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Çıkış Yapılıyor...</h2>
            <p className="text-indigo-200 text-sm">Oturumunuz güvenli bir şekilde kapatılıyor</p>
         </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-[#1C2A5E] text-white 
        fixed h-full z-40 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:flex md:flex-col
      `}>
        {/* Sidebar Header - Text Only (Clean, No Decorative Logo) */}
        <div className="p-6 border-b border-indigo-900/50 text-center">
          <h2 className="text-xl font-serif font-bold text-[#D4AF37] tracking-wide">ŞEYDA AÇIKER</h2>
          <p className="text-xs text-indigo-200 uppercase tracking-widest mt-2">Eğitim Platformu</p>
        </div>

        {/* RBAC Role Badge (Visual indicator, NOT a toggle) */}
        <div className="px-4 py-3 border-b border-indigo-900/50">
          <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${getRoleBadgeColor()}`}>
            {isAdmin ? (
              <>
                <Shield className="w-4 h-4" />
                {getRoleDisplay()}
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4" />
                {getRoleDisplay()}
              </>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className={'w-full flex items-center px-4 py-3 rounded-xl transition-all ' + (
                            isActive 
                            ? 'bg-[#D4AF37] text-[#1C2A5E] font-bold shadow-lg' 
                            : 'text-indigo-100 hover:bg-white/10'
                        )}
                    >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.label}
                    </button>
                );
            })}
        </nav>

        {/* Active Classmates Widget */}
        <ActiveClassmates currentUserId={user?.id} />

        {/* Sidebar Footer - User Profile & Logout (No decorative logos) */}
        <div className="p-4 border-t border-indigo-900/50">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=D4AF37&color=1C2A5E`} 
                  alt={user?.full_name || 'User'} 
                  className="h-10 w-10 rounded-full border-2 border-[#D4AF37]" 
                />
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{user?.full_name || 'Kullanıcı'}</p>
                    <p className="text-xs text-indigo-300 capitalize">{getRoleDisplay()}</p>
                </div>
            </div>
            <button 
                onClick={handleSafeLogout}
                className="w-full flex items-center px-4 py-3 bg-red-500/10 text-red-200 hover:bg-red-500 hover:text-white rounded-xl text-sm transition-all duration-300 group"
            >
                <LogOut className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Çıkış Yap</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile/Desktop Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 md:px-6 py-4 flex justify-between items-center">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="md:hidden">
                <h2 className="text-sm font-bold text-[#1C2A5E]">ŞEYDA AÇIKER</h2>
            </div>

            <div className="flex items-center gap-2 md:gap-4 md:ml-auto">
                {/* Whiteboard Button */}
                <button 
                  onClick={() => setIsWhiteboardOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  title="Beyaz Tahta"
                >
                  <PenTool className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-medium">Tahta</span>
                </button>

                {/* Notification Bell */}
                <div ref={notificationRef} className="relative">
                  <button 
                    onClick={toggleNotifications}
                    className={'relative p-2 rounded-full transition-colors ' + (
                      showNotificationsDropdown 
                        ? 'bg-indigo-100 text-indigo-600' 
                        : 'text-slate-500 hover:bg-slate-100'
                    )}
                  >
                    <Bell className="h-5 w-5" />
                    {/* Notification Badge */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotificationsDropdown && (
                    <NotificationDropdown
                      notifications={notifications}
                      onMarkAllRead={handleMarkAllRead}
                      onClearAll={handleClearAll}
                      onClose={() => setShowNotificationsDropdown(false)}
                    />
                  )}
                </div>

                <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

                <div className="hidden md:block text-right">
                    <p className="text-xs text-slate-500">Bugün</p>
                    <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
            </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50">
            {children}
        </main>
      </div>

      {/* Whiteboard Modal */}
      <Whiteboard isOpen={isWhiteboardOpen} onClose={() => setIsWhiteboardOpen(false)} />
    </div>
  );
};

export default DashboardLayout;

// Export notification type and helper for use in other components
export { saveNotifications, getStoredNotifications };
