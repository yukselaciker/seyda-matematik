/**
 * AdminOverviewTab.tsx - Admin Dashboard Overview
 * 
 * Features:
 * - Fetch real statistics from backend API
 * - Display stats cards with live data
 * - Recent users and messages
 * - Loading and error states
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Users, Mail, TrendingUp, AlertCircle, RefreshCw, 
  Loader2, GraduationCap, UserCheck, BarChart3, Clock
} from 'lucide-react';
import { AdminService, AdminStats, User, ContactMessage } from '../../services/AdminService';
import { User as UserType } from '../../types';

interface AdminOverviewTabProps {
  user: UserType;
}

// --- STAT CARD COMPONENT ---
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = memo(({ title, value, icon, bgColor, iconColor, loading }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
        {loading ? (
          <Loader2 className={`w-6 h-6 ${iconColor} animate-spin`} />
        ) : (
          icon
        )}
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">
          {loading ? '...' : value}
        </p>
      </div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

// --- MAIN COMPONENT ---
export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = memo(({ user }) => {
  // State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📡 Fetching admin dashboard data...');
      
      // Fetch all data in parallel
      const [statsResponse, usersResponse, messagesResponse] = await Promise.all([
        AdminService.getStats(),
        AdminService.getUsers({ limit: 5 }),
        AdminService.getContacts({ limit: 5 }),
      ]);
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      if (usersResponse.success && usersResponse.data) {
        setRecentUsers(usersResponse.data);
      }
      
      if (messagesResponse.success && messagesResponse.data) {
        setRecentMessages(messagesResponse.data);
      }
      
      // Check if any request failed
      if (!statsResponse.success && !usersResponse.success && !messagesResponse.success) {
        setError('Veriler yüklenemedi. Lütfen tekrar deneyin.');
      }
      
      console.log('✅ Dashboard data loaded');
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      teacher: 'bg-purple-100 text-purple-700',
      student: 'bg-blue-100 text-blue-700',
      parent: 'bg-green-100 text-green-700',
    };
    const labels: Record<string, string> = {
      admin: 'Yönetici',
      teacher: 'Öğretmen',
      student: 'Öğrenci',
      parent: 'Veli',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[role] || styles.student}`}>
        {labels[role] || role}
      </span>
    );
  };

  // Get status badge for messages
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      read: 'bg-slate-100 text-slate-700',
      replied: 'bg-green-100 text-green-700',
      email_failed: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      new: 'Yeni',
      read: 'Okundu',
      replied: 'Yanıtlandı',
      email_failed: 'Hata',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.new}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#1C2A5E] to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Hoş geldin, {user?.full_name?.split(' ')[0] || 'Yönetici'}! 👋
            </h1>
            <p className="text-indigo-200">
              Şeyda Açıker Eğitim Platformu - Yönetici Paneli
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
          loading={isLoading}
        />
        <StatCard
          title="Öğrenci Sayısı"
          value={stats?.studentCount || 0}
          icon={<GraduationCap className="w-6 h-6 text-indigo-600" />}
          bgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          loading={isLoading}
        />
        <StatCard
          title="Toplam Mesaj"
          value={stats?.totalContacts || 0}
          icon={<Mail className="w-6 h-6 text-purple-600" />}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
          loading={isLoading}
        />
        <StatCard
          title="Yeni Mesaj"
          value={stats?.newContacts || 0}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          bgColor="bg-green-100"
          iconColor="text-green-600"
          loading={isLoading}
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Son Kayıt Olan Kullanıcılar
            </h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : recentUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Henüz kayıtlı kullanıcı yok.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentUsers.map((u) => (
                <div key={u._id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <img
                    src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=6366f1&color=fff`}
                    alt={u.full_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{u.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getRoleBadge(u.role)}
                    <span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              Son Gelen Mesajlar
            </h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Henüz mesaj yok.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentMessages.map((msg) => (
                <div key={msg._id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium text-slate-800">{msg.name}</p>
                    {getStatusBadge(msg.status)}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-2">{msg.message}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatDate(msg.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

AdminOverviewTab.displayName = 'AdminOverviewTab';

export default AdminOverviewTab;
