/**
 * AdminUsersTab.tsx - Admin Users Management
 * 
 * Features:
 * - Fetch users from backend API
 * - Display users in a table
 * - Delete users with confirmation
 * - Update user roles
 * - Loading and error states
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Users, Trash2, RefreshCw, AlertCircle, Search, 
  Shield, GraduationCap, UserCheck, Loader2, Mail
} from 'lucide-react';
import { AdminService, User } from '../../services/AdminService';
import { useToast } from '../../contexts/ToastContext';

// --- ROLE BADGE COMPONENT ---
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const styles: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 border-red-200',
    teacher: 'bg-purple-100 text-purple-700 border-purple-200',
    student: 'bg-blue-100 text-blue-700 border-blue-200',
    parent: 'bg-green-100 text-green-700 border-green-200',
  };

  const labels: Record<string, string> = {
    admin: 'Yönetici',
    teacher: 'Öğretmen',
    student: 'Öğrenci',
    parent: 'Veli',
  };

  const icons: Record<string, React.ReactNode> = {
    admin: <Shield className="w-3 h-3" />,
    teacher: <UserCheck className="w-3 h-3" />,
    student: <GraduationCap className="w-3 h-3" />,
    parent: <Users className="w-3 h-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[role] || styles.student}`}>
      {icons[role]}
      {labels[role] || role}
    </span>
  );
};

// --- MAIN COMPONENT ---
export const AdminUsersTab: React.FC = memo(() => {
  const { showToast } = useToast();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📡 Fetching users from API...');
      const response = await AdminService.getUsers({ limit: 100 });
      
      if (response.success && response.data) {
        setUsers(response.data);
        console.log('✅ Loaded', response.data.length, 'users');
      } else {
        setError(response.message || 'Kullanıcılar yüklenemedi.');
      }
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle delete user
  const handleDelete = useCallback(async (user: User) => {
    const confirmed = window.confirm(
      `"${user.full_name}" kullanıcısını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`
    );
    
    if (!confirmed) return;
    
    setDeletingId(user._id);
    
    try {
      const response = await AdminService.deleteUser(user._id);
      
      if (response.success) {
        setUsers(prev => prev.filter(u => u._id !== user._id));
        showToast(`${user.full_name} başarıyla silindi.`, 'success');
      } else {
        showToast(response.message || 'Silme işlemi başarısız.', 'error');
      }
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      showToast('Silme işlemi sırasında hata oluştu.', 'error');
    } finally {
      setDeletingId(null);
    }
  }, [showToast]);

  // Handle role change
  const handleRoleChange = useCallback(async (user: User, newRole: string) => {
    try {
      const response = await AdminService.updateUserRole(user._id, newRole);
      
      if (response.success && response.data) {
        setUsers(prev => prev.map(u => u._id === user._id ? response.data! : u));
        showToast(`${user.full_name} rolü güncellendi.`, 'success');
      } else {
        showToast(response.message || 'Rol güncellenemedi.', 'error');
      }
    } catch (err) {
      console.error('❌ Error updating role:', err);
      showToast('Rol güncellenirken hata oluştu.', 'error');
    }
  }, [showToast]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Hata Oluştu</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Kullanıcı Yönetimi
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Toplam {users.length} kayıtlı kullanıcı
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Yenile
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="İsim veya e-posta ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tüm Roller</option>
            <option value="student">Öğrenciler</option>
            <option value="teacher">Öğretmenler</option>
            <option value="parent">Veliler</option>
            <option value="admin">Yöneticiler</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              {searchTerm || roleFilter !== 'all' ? 'Sonuç bulunamadı' : 'Henüz kullanıcı yok'}
            </h3>
            <p className="text-slate-500 text-sm">
              {searchTerm || roleFilter !== 'all' 
                ? 'Farklı bir arama veya filtre deneyin.'
                : 'Kullanıcılar kayıt olduğunda burada görünecek.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Kullanıcı</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Rol</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Kayıt Tarihi</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Durum</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=6366f1&color=fff`}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=6366f1&color=fff`;
                            }}
                          />
                          <div>
                            <p className="font-medium text-slate-800">{user.full_name}</p>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="student">Öğrenci</option>
                          <option value="teacher">Öğretmen</option>
                          <option value="parent">Veli</option>
                          <option value="admin">Yönetici</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {user.is_premium ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            ⭐ Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Standart
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={deletingId === user._id}
                            className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deletingId === user._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            <span className="text-sm">Sil</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <div key={user._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=6366f1&color=fff`}
                        alt={user.full_name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-slate-800">{user.full_name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <RoleBadge role={user.role} />
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Kayıt: {formatDate(user.createdAt)}
                    </span>
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user._id}
                      className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      {deletingId === user._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

AdminUsersTab.displayName = 'AdminUsersTab';

export default AdminUsersTab;
