/**
 * StudentPanel.tsx - Enhanced Dashboard with RBAC
 * 
 * Security Features:
 * - Role-Based Access Control (RBAC)
 * - NO manual role switching - roles determined by authentication
 * - Admin/Teacher: Video Upload, Student Management, Appointments
 * - Students: Homework, Library, Flashcards, XP/Gamification
 * 
 * Production-grade implementation with:
 * - Custom hook for logic separation (useStudentSystem)
 * - Memoized modular components
 * - Null-safe property access
 * - Empty state handling
 * - Toast notifications for user feedback
 */

import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import AdminMessages from './AdminMessages';
import { User } from '../types';
import { useToast } from '../contexts/ToastContext';
import useStudentSystem from '../hooks/useStudentSystem';
import { 
  Users, Video, FileCheck, Calendar, Trash2, 
  LayoutDashboard, CheckCircle, X, AlertCircle
} from 'lucide-react';

// Modular Components - All fully functional
import { 
  LoadingSpinner,
  GamificationHeader,
  OverviewTab,
  HomeworkTab,
  CalendarTab,
  LibraryTab,
  ChatTab,
  FlashcardGame,
  VideosTab,
  VideoUploadTab,
  AppointmentTab,
  AppointmentRequestsTab,
  PracticeExamsTab,
} from './student';
import { VideoManagementTab } from './student/VideoManagementTab';

// --- INTERFACES ---
interface StudentPanelProps {
  user: User;
  activeTab: string;
  onLogout?: () => void;
}

// --- DATA INITIALIZATION (Prevent Crashes) ---
// This function initializes localStorage with safe defaults if data is missing
const initializeAdminData = (): void => {
  try {
    // Initialize videos if empty
    const videosStr = localStorage.getItem('app_videos');
    if (!videosStr || videosStr === 'null' || videosStr === 'undefined') {
      const mockVideos = [
        {
          id: 'demo_video_1',
          title: 'Matematik 101 - Giriş',
          subject: 'Matematik',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Şeyda Açıker',
        },
      ];
      localStorage.setItem('app_videos', JSON.stringify(mockVideos));
    }

    // Initialize exams if empty
    const examsStr = localStorage.getItem('app_exams');
    if (!examsStr || examsStr === 'null' || examsStr === 'undefined') {
      const mockExams: any[] = [];
      localStorage.setItem('app_exams', JSON.stringify(mockExams));
    }

    // Initialize appointments if empty
    const appointmentsStr = localStorage.getItem('app_appointments');
    if (!appointmentsStr || appointmentsStr === 'null' || appointmentsStr === 'undefined') {
      const mockAppointments: any[] = [];
      localStorage.setItem('app_appointments', JSON.stringify(mockAppointments));
    }
  } catch (error) {
    console.error('Failed to initialize admin data:', error);
  }
};

// --- MAIN COMPONENT ---
const StudentPanel: React.FC<StudentPanelProps> = memo(({ user, activeTab, onLogout }) => {
  const { showToast } = useToast();
  
  // Initialize admin data on mount
  useEffect(() => {
    initializeAdminData();
  }, []);

  // RBAC: Determine if user is admin/teacher
  // seyda@aciker.com is always admin, everyone else is student
  const isAdmin = useMemo(() => {
    const email = user?.email?.toLowerCase();
    return email === 'seyda@aciker.com' || user?.role === 'admin' || user?.role === 'teacher';
  }, [user?.email, user?.role]);

  // Use custom hook for all business logic
  const [state, actions] = useStudentSystem(user);

  // Destructure state for cleaner code
  const {
    homeworks,
    stats,
    topics,
    materials,
    chatMessages,
    xp,
    level,
    streak,
    isLoading,
    error,
    pomodoro,
    pomodoroTimeLeft,
  } = state;

  // --- HANDLERS WITH TOAST FEEDBACK ---
  const handleHomeworkSubmit = useCallback(async (homeworkId: string) => {
    const result = await actions.submitHomework(homeworkId);
    
    if (result.success) {
      showToast(`Ödev başarıyla yüklendi! +${result.xpGained} XP 🎉`, 'xp');
    } else {
      showToast('Ödev yüklenirken bir hata oluştu.', 'error');
    }
    
    return result;
  }, [actions, showToast]);

  const handleSendMessage = useCallback((text: string) => {
    actions.sendMessage(text);
  }, [actions]);

  const handleStartPomodoro = useCallback((duration?: number, mode?: 'work' | 'break') => {
    actions.startPomodoro(duration, mode);
    const modeText = mode === 'break' ? 'Mola' : 'Çalışma';
    showToast(`${modeText} zamanlayıcısı başladı! ⏱️`, 'info');
  }, [actions, showToast]);

  const handleStopPomodoro = useCallback(() => {
    actions.stopPomodoro();
    showToast('Zamanlayıcı durduruldu.', 'info');
  }, [actions, showToast]);

  const handleGenerateAiPlan = useCallback(async () => {
    const plan = await actions.generateAiPlan();
    showToast('AI çalışma planınız hazır! 🤖', 'success');
    return plan;
  }, [actions, showToast]);

  const handleXpGain = useCallback((amount: number) => {
    actions.addXp(amount);
    showToast(`+${amount} XP kazandın! ⭐`, 'xp');
  }, [actions, showToast]);

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Veriler yükleniyor..." />
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl border border-red-200 max-w-md transition-colors">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Bir Hata Oluştu
          </h3>
          <p className="text-slate-600 mb-4">{error}</p>
           <button 
            onClick={actions.refreshData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
           >
            Tekrar Dene
           </button>
        </div>
      </div>
    );
  }

  // --- RENDER TAB CONTENT (RBAC-based) ---
  const renderTabContent = () => {
    // ADMIN-ONLY TABS
    if (isAdmin) {
      switch (activeTab) {
        case 'overview':
          return (
            <AdminOverview 
              user={user}
              homeworks={homeworks || []}
            />
          );

        case 'students':
          return <StudentManagement />;

        case 'upload':
        case 'video-management':
          return <VideoManagementTab teacherName={user?.full_name || 'Şeyda Açıker'} />;

        case 'calendar':
          return <AppointmentTab userId={user?.id} userName={user?.full_name} userEmail={user?.email} isAdmin={true} />;

        case 'appointment-requests':
          return <AppointmentRequestsTab />;

        case 'messages':
          return <AdminMessages onSessionExpired={onLogout} />;

        case 'practice-exams':
        case 'exam-management':
          return <PracticeExamsTab currentUser={user} />;

        case 'library':
          return (
            <LibraryTab 
              materials={materials || []}
              onXpGain={handleXpGain}
            />
          );

        case 'videos':
          return <VideosTab onXpGain={handleXpGain} />;

        default:
          // CRITICAL FIX: Always return overview for admin if tab doesn't match
          console.warn(`Admin tab "${activeTab}" not found, defaulting to overview`);
          return (
            <AdminOverview 
              user={user}
              homeworks={homeworks || []}
            />
          );
      }
    }

    // STUDENT TABS
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            homeworks={homeworks || []}
            stats={stats || []}
            topics={topics || []}
            pomodoro={{
              isRunning: pomodoro?.isRunning || false,
              timeLeft: pomodoroTimeLeft || 0,
              mode: pomodoro?.mode || 'work',
            }}
            onStartPomodoro={handleStartPomodoro}
            onStopPomodoro={handleStopPomodoro}
            onGenerateAiPlan={handleGenerateAiPlan}
          />
        );

      case 'homework':
        return (
          <HomeworkTab
            homeworks={homeworks || []}
            onSubmit={handleHomeworkSubmit}
          />
        );

      case 'flashcards':
        return <FlashcardGame />;

      case 'practice-exams':
        return <PracticeExamsTab currentUser={user} />;

      case 'calendar':
        return <AppointmentTab userId={user?.id} userName={user?.full_name} userEmail={user?.email} isAdmin={false} />;

      case 'library':
        return (
          <LibraryTab 
            materials={materials || []}
            onXpGain={handleXpGain}
          />
        );

      case 'videos':
        return <VideosTab onXpGain={handleXpGain} />;

      case 'chat':
        return (
          <ChatTab
            userId={user?.id}
            onXpGain={handleXpGain}
          />
        );

      default:
        return (
          <OverviewTab
            homeworks={homeworks || []}
            stats={stats || []}
            topics={topics || []}
            pomodoro={{
              isRunning: pomodoro?.isRunning || false,
              timeLeft: pomodoroTimeLeft || 0,
              mode: pomodoro?.mode || 'work',
            }}
            onStartPomodoro={handleStartPomodoro}
            onStopPomodoro={handleStopPomodoro}
            onGenerateAiPlan={handleGenerateAiPlan}
          />
        );
    }
  };

  // PRODUCTION: Error-safe tab content rendering with fallbacks
  const tabContent = useMemo(() => {
    try {
      const content = renderTabContent();
      // If content is undefined or null, return a safe fallback
      if (!content) {
        console.error('renderTabContent returned null/undefined');
        return isAdmin ? (
          <AdminOverview user={user} homeworks={homeworks || []} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-500">İçerik yükleniyor...</p>
          </div>
        );
      }
      return content;
    } catch (error) {
      // PRODUCTION: Graceful error handling - never crash the whole app
      console.error('❌ Tab render error:', error);
      return (
        <div className="p-8 text-center bg-amber-50 rounded-2xl border border-amber-200">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-amber-800 mb-2">Bu modülde hata oluştu</h3>
          <p className="text-amber-600 mb-4">Lütfen sayfayı yenileyin veya farklı bir sekme deneyin.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
  }, [isAdmin, activeTab, user?.id, user?.full_name, user?.email, homeworks, stats, topics, materials, pomodoro?.isRunning, pomodoro?.mode, pomodoroTimeLeft]);

  return (
    <div className="animate-fadeIn">
      {/* Gamification Header - Only for students */}
      {!isAdmin && (
        <GamificationHeader
          user={user}
          xp={xp || 0}
          level={level || 1}
          streak={streak || 0}
          onLogout={onLogout}
        />
      )}

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {tabContent}
      </div>
    </div>
  );
});

StudentPanel.displayName = 'StudentPanel';

// --- ADMIN OVERVIEW COMPONENT ---
interface AdminOverviewProps {
  user: User;
  homeworks: any[];
}

const AdminOverview: React.FC<AdminOverviewProps> = memo(({ user, homeworks }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalVideos: 0,
    totalExams: 0,
    pendingAppointments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentStudents, setRecentStudents] = useState<User[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);

  // Load stats from localStorage
  useEffect(() => {
    const loadStats = () => {
      try {
        setIsLoading(true);
        
        // Initialize data if needed
        initializeAdminData();
        
        // Students - SAFE ACCESS
        const usersStr = localStorage.getItem('app_users');
        let users: any[] = [];
        try {
          users = usersStr && usersStr !== 'null' && usersStr !== 'undefined' 
            ? JSON.parse(usersStr) 
            : [];
        } catch {
          users = [];
        }
        const students = Array.isArray(users) ? users.filter((u: User) => u && u.role === 'student') : [];
        setRecentStudents(students.slice(0, 5));

        // Videos - SAFE ACCESS
        const videosStr = localStorage.getItem('app_videos');
        let videos: any[] = [];
        try {
          videos = videosStr && videosStr !== 'null' && videosStr !== 'undefined'
            ? JSON.parse(videosStr)
            : [];
        } catch {
          videos = [];
        }
        const videosArray = Array.isArray(videos) ? videos : [];

        // Exams - SAFE ACCESS
        const examsStr = localStorage.getItem('app_exams');
        let exams: any[] = [];
        try {
          exams = examsStr && examsStr !== 'null' && examsStr !== 'undefined'
            ? JSON.parse(examsStr)
            : [];
        } catch {
          exams = [];
        }
        const examsArray = Array.isArray(exams) ? exams : [];

        // Appointments - SAFE ACCESS
        const appointmentsStr = localStorage.getItem('app_appointments');
        let appointments: any[] = [];
        try {
          appointments = appointmentsStr && appointmentsStr !== 'null' && appointmentsStr !== 'undefined'
            ? JSON.parse(appointmentsStr)
            : [];
        } catch {
          appointments = [];
        }
        const appointmentsArray = Array.isArray(appointments) ? appointments : [];
        const pending = appointmentsArray.filter((a: any) => a && a.status === 'pending');
        
        // Today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = appointmentsArray.filter((a: any) => a && a.date === today);
        setRecentAppointments(todayAppts.slice(0, 5));

        setStats({
          totalStudents: students.length,
          totalVideos: videosArray.length,
          totalExams: examsArray.length,
          pendingAppointments: pending.length,
        });
        
        console.log('✅ AdminOverview Stats Loaded:', {
          totalStudents: students.length,
          totalVideos: videosArray.length,
          totalExams: examsArray.length,
          pendingAppointments: pending.length,
        });
      } catch (error) {
        console.error('❌ Failed to load stats:', error);
        // Set safe defaults
        setStats({
          totalStudents: 0,
          totalVideos: 0,
          totalExams: 0,
          pendingAppointments: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Load immediately
    loadStats();
    
    // Refresh stats every 5 seconds
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // PRODUCTION: Loading state with spinner - prevents white screen
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#1C2A5E] to-indigo-700 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Hoş geldin, {user?.full_name?.split(' ')[0] || 'Öğretmen'}! 👋
          </h1>
          <p className="text-indigo-200">
            Şeyda Açıker Eğitim Platformu - Yönetici Paneli
          </p>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#1C2A5E] to-indigo-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Hoş geldin, {user?.full_name?.split(' ')[0] || 'Öğretmen'}! 👋
        </h1>
        <p className="text-indigo-200">
          Şeyda Açıker Eğitim Platformu - Yönetici Paneli
        </p>
      </div>

      {/* Stats Grid - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Öğrenci */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
                </div>
            <div>
              <p className="text-sm text-slate-500">Toplam Öğrenci</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalStudents}</p>
             </div>
          </div>
                </div>

        {/* Yüklü Dersler */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-purple-600" />
                </div>
            <div>
              <p className="text-sm text-slate-500">Yüklü Dersler</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalVideos}</p>
             </div>
          </div>
                </div>

        {/* Aktif Sınavlar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-amber-600" />
                </div>
            <div>
              <p className="text-sm text-slate-500">Aktif Sınavlar</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalExams}</p>
             </div>
          </div>
      </div>

        {/* Bekleyen Randevular */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
                         </div>
            <div>
              <p className="text-sm text-slate-500">Bekleyen Randevular</p>
              <p className="text-2xl font-bold text-slate-800">{stats.pendingAppointments}</p>
             </div>
          </div>
                      </div>
                   </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Son Öğrenciler
          </h3>
          {/* PRODUCTION: Zero-data safe rendering */}
          {(!recentStudents || recentStudents.length === 0) ? (
            <p className="text-slate-500 text-sm">Henüz veri yok</p>
          ) : (
            <div className="space-y-3">
              {(recentStudents || []).map((student: User) => (
                <div key={student?.id || Math.random()} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <img 
                    src={student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.full_name || '')}`}
                    alt={student?.full_name || 'Öğrenci'}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Student&background=1C2A5E&color=fff`;
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{student?.full_name || 'Öğrenci'}</p>
                    <p className="text-xs text-slate-500">{student?.email || 'E-posta yok'}</p>
                  </div>
                  {student?.is_premium && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      Premium
                    </span>
                  )}
                   </div>
                ))}
             </div>
          )}
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Bugünkü Randevular
          </h3>
          {/* PRODUCTION: Zero-data safe rendering */}
          {(!recentAppointments || recentAppointments.length === 0) ? (
            <p className="text-slate-500 text-sm">Henüz veri yok</p>
          ) : (
            <div className="space-y-3">
              {(recentAppointments || []).map((appt: any) => (
                <div key={appt?.id || Math.random()} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">{appt?.time || '--:--'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{appt?.studentName || 'Öğrenci'}</p>
                    <p className="text-xs text-slate-500">{appt?.type === 'online' ? 'Online Ders' : 'Yüz Yüze'}</p>
                  </div>
                </div>
              ))}
               </div>
             )}
                        </div>
                    </div>
                    
      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-sm font-medium text-indigo-800 mb-1">Video Yükle</p>
            <p className="text-xs text-indigo-600">Yeni ders videoları ekleyin</p>
                          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-sm font-medium text-amber-800 mb-1">Sınav Oluştur</p>
            <p className="text-xs text-amber-600">Haftalık deneme sınavları ekleyin</p>
                       </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-sm font-medium text-green-800 mb-1">Randevuları Yönet</p>
            <p className="text-xs text-green-600">Öğrenci randevularını onaylayın</p>
                </div>
        </div>
        </div>
    </div>
  );
});

AdminOverview.displayName = 'AdminOverview';

// --- STUDENT MANAGEMENT COMPONENT ---
const StudentManagement: React.FC = memo(() => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<User[]>([]);

  // Load students from localStorage
  useEffect(() => {
    const loadStudents = () => {
      try {
        const users = JSON.parse(localStorage.getItem('app_users') || '[]');
        const studentList = users.filter((u: User) => u.role === 'student');
        setStudents(studentList);
      } catch {
        setStudents([]);
      }
    };

    loadStudents();
    // Listen for storage changes
    window.addEventListener('storage', loadStudents);
    return () => window.removeEventListener('storage', loadStudents);
  }, []);

  // Get student XP/Level from gamification data
  const getStudentStats = useCallback((studentId: string) => {
    try {
      const gamification = JSON.parse(localStorage.getItem('app_gamification') || '{}');
      // In a real app, this would be per-student, but for now return default
      return { xp: 0, level: 1 };
    } catch {
      return { xp: 0, level: 1 };
    }
  }, []);

  // Handle delete/ban student
  const handleDeleteStudent = useCallback((studentId: string, studentName: string) => {
    if (!confirm(`${studentName} adlı öğrenciyi sistemden kaldırmak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      const updatedUsers = users.filter((u: User) => u.id !== studentId);
      localStorage.setItem('app_users', JSON.stringify(updatedUsers));
      
      setStudents(updatedUsers.filter((u: User) => u.role === 'student'));
      showToast(`${studentName} sistemden kaldırıldı.`, 'info');
    } catch (error) {
      console.error('Failed to delete student:', error);
      showToast('Öğrenci silinirken bir hata oluştu.', 'error');
    }
  }, [showToast]);

    return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Öğrenci Listesi
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Kayıtlı öğrencileri görüntüleyin ve yönetin
          </p>
        </div>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
          {students.length} Öğrenci
        </span>
        </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Henüz Öğrenci Yok</h3>
          <p className="text-slate-500">Öğrenciler kayıt olduğunda burada görünecek.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Öğrenci</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">E-posta</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">XP / Seviye</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Durum</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student: User) => {
                  const stats = getStudentStats(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name || '')}`}
                            alt={student.full_name}
                            className="w-10 h-10 rounded-full border-2 border-slate-200"
                          />
          <div>
                            <p className="font-medium text-slate-800">{student.full_name}</p>
                            <p className="text-xs text-slate-500">ID: {student.id}</p>
          </div>
       </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">{student.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800">{stats.xp} XP</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                            Seviye {stats.level}
                          </span>
                </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.is_premium ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                            ⭐ Premium
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                            Standart
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
             <button 
                          onClick={() => handleDeleteStudent(student.id, student.full_name || 'Öğrenci')}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                          title="Öğrenciyi Kaldır"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Kaldır</span>
             </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
         </div>
       )}
    </div>
  );
});

StudentManagement.displayName = 'StudentManagement';

export default StudentPanel;
