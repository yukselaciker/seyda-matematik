/**
 * TeacherPanel.tsx - Teacher Dashboard
 * 
 * Features:
 * - Student management
 * - Homework assignment
 * - Video upload CMS
 * - Toast notifications
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Plus, Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import StorageService from '../services/StorageService';
import { User, Homework } from '../types';
import { useToast } from '../contexts/ToastContext';
import { LoadingSpinner, EmptyState, VideoUploadTab } from './student';

interface TeacherPanelProps {
  user: User;
  activeTab: string;
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = memo(({ title, value, icon, bgColor }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-colors">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

const TeacherPanel: React.FC<TeacherPanelProps> = memo(({ user, activeTab }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const allUsers = StorageService.getUsers();
        const studentList = allUsers.filter(u => u.role === 'student');
        const allHomeworks = StorageService.getHomeworks();
        
        setStudents(studentList);
        setHomeworks(allHomeworks);
      } catch (error) {
        console.error('Failed to load teacher data:', error);
        showToast('Veriler yüklenirken bir hata oluştu.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [showToast]);

  // Assign homework to student
  const handleAssignHomework = useCallback((studentId: string, studentName: string) => {
    try {
      const newHomework: Homework = {
        id: `hw_${Date.now()}`,
        studentId,
        teacherId: user.id,
        title: 'Yeni Ödev',
        description: 'Ödev detaylarını kontrol ediniz.',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };

      const currentHomeworks = StorageService.getHomeworks();
      currentHomeworks.push(newHomework);
      StorageService.saveHomeworks(currentHomeworks);
      
      setHomeworks(currentHomeworks);
      showToast(`${studentName} için yeni ödev atandı! 📚`, 'success');
    } catch (error) {
      console.error('Failed to assign homework:', error);
      showToast('Ödev atanırken bir hata oluştu.', 'error');
    }
  }, [user.id, showToast]);

  // Toggle student premium status
  const handleTogglePremium = useCallback((studentId: string, studentName: string, currentStatus: boolean) => {
    try {
      const users = StorageService.getUsers();
      const userIndex = users.findIndex(u => u.id === studentId);
      
      if (userIndex !== -1) {
        users[userIndex].is_premium = !currentStatus;
        StorageService.saveUsers(users);
        setStudents(users.filter(u => u.role === 'student'));
        
        const statusText = !currentStatus ? 'Premium' : 'Standart';
        showToast(`${studentName} artık ${statusText} üye! ⭐`, 'success');
      }
    } catch (error) {
      console.error('Failed to toggle premium:', error);
      showToast('İşlem sırasında bir hata oluştu.', 'error');
    }
  }, [showToast]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Panel yükleniyor..." />
      </div>
    );
  }

  // Calculate stats
  const totalStudents = students.length;
  const premiumStudents = students.filter(s => s.is_premium).length;
  const pendingHomeworks = homeworks.filter(h => h.status === 'pending').length;
  const deliveredHomeworks = homeworks.filter(h => h.status === 'delivered').length;

  const renderOverview = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Öğrenci"
          value={totalStudents}
          icon={<Users className="h-6 w-6 text-indigo-600" />}
          bgColor="bg-indigo-50"
        />
        <StatCard
          title="Premium Üye"
          value={premiumStudents}
          icon={<Award className="h-6 w-6 text-yellow-600" />}
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="Bekleyen Ödev"
          value={pendingHomeworks}
          icon={<BookOpen className="h-6 w-6 text-orange-600" />}
          bgColor="bg-orange-50"
        />
        <StatCard
          title="Teslim Edilen"
          value={deliveredHomeworks}
          icon={<TrendingUp className="h-6 w-6 text-green-600" />}
          bgColor="bg-green-50"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-bold text-lg text-[#1C2A5E]">Öğrenci Listesi</h2>
          <button className="flex items-center text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" /> Yeni Öğrenci
          </button>
        </div>

        {students.length === 0 ? (
          <div className="p-8">
            <EmptyState 
              type="generic" 
              title="Henüz öğrenci yok" 
              description="Yeni öğrenci ekleyerek başlayabilirsiniz."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Öğrenci
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Bekleyen Ödev
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {students.map(student => {
                  const studentHomeworks = homeworks.filter(h => h.studentId === student.id);
                  const pendingCount = studentHomeworks.filter(h => h.status === 'pending').length;
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}`} 
                            alt={student.full_name}
                            className="h-10 w-10 rounded-full mr-3 border-2 border-slate-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}`;
                            }}
                          />
                          <div>
                            <div className="font-medium text-slate-900">
                              {student.full_name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePremium(student.id, student.full_name, !!student.is_premium)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            student.is_premium 
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {student.is_premium ? '⭐ Premium' : 'Standart'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          pendingCount > 0 
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {pendingCount} bekliyor
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleAssignHomework(student.id, student.full_name)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition-colors"
                          >
                            Ödev Ata
                          </button>
                          <button className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
                            Detaylar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Submissions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-colors">
        <h3 className="font-bold mb-4 text-slate-800">Son Ödev Teslimleri</h3>
        
        {homeworks.filter(h => h.status === 'delivered').length === 0 ? (
          <EmptyState 
            type="homework" 
            title="Henüz teslim yok" 
            description="Öğrenciler ödev teslim ettiğinde burada görünecek."
          />
        ) : (
          <div className="space-y-3">
            {homeworks
              .filter(h => h.status === 'delivered')
              .slice(0, 5)
              .map(hw => {
                const student = students.find(s => s.id === hw.studentId);
                
                return (
                  <div 
                    key={hw.id} 
                    className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={student?.avatar || `https://ui-avatars.com/api/?name=Student`}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {hw.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student?.full_name || 'Öğrenci'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Teslim Edildi
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      
      case 'upload':
        return <VideoUploadTab teacherName={user.full_name} />;
      
      default:
        return (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-100 transition-colors">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚧</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Geliştirme Aşamasında
              </h3>
              <p className="text-slate-600">
                Bu modül yakında aktif olacak.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-fadeIn">
      {renderContent()}
    </div>
  );
});

TeacherPanel.displayName = 'TeacherPanel';

export default TeacherPanel;
