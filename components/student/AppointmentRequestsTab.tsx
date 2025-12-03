/**
 * AppointmentRequestsTab.tsx - Admin Appointment Management Dashboard
 * 
 * Features:
 * - Display all appointment requests from students
 * - Approve/Reject functionality
 * - Email notifications on status change
 * - Clean table/card view with filtering
 */

import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  CalendarCheck, Clock, User, CheckCircle, XCircle, 
  Mail, Video, MapPin, Filter, RefreshCcw, AlertCircle
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { Appointment } from './AppointmentTab';
import { 
  sendEmailNotification,
  generateAppointmentApprovalEmailBody,
  generateAppointmentRejectionEmailBody
} from '../../services/EmailService';
import EmptyState from './EmptyState';

// --- STORAGE ---
const APPOINTMENTS_STORAGE_KEY = 'app_appointments';

const getStoredAppointments = (): Appointment[] => {
  try {
    const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load appointments', e);
  }
  return [];
};

const saveAppointments = (appointments: Appointment[]): void => {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  } catch (e) {
    console.error('Failed to save appointments', e);
  }
};

// --- STATUS FILTER TYPE ---
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'rejected' | 'cancelled';

// --- MAIN COMPONENT ---
export const AppointmentRequestsTab: React.FC = memo(() => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Load appointments on mount
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = useCallback(() => {
    const stored = getStoredAppointments();
    setAppointments(stored);
  }, []);

  // Filter appointments by status
  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'all') return appointments;
    return appointments.filter(apt => apt.status === statusFilter);
  }, [appointments, statusFilter]);

  // Count appointments by status
  const statusCounts = useMemo(() => {
    return {
      all: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      rejected: appointments.filter(a => a.status === 'rejected').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
    };
  }, [appointments]);

  // Handle approve appointment
  const handleApprove = useCallback(async (appointment: Appointment) => {
    if (!appointment.studentEmail) {
      showToast('Öğrenci e-posta adresi bulunamadı.', 'error');
      return;
    }

    setIsProcessing(appointment.id);

    try {
      // Update appointment status
      const updated = appointments.map(apt =>
        apt.id === appointment.id
          ? { ...apt, status: 'confirmed' as const }
          : apt
      );

      setAppointments(updated);
      saveAppointments(updated);

      // Send approval email to student
      const emailBody = generateAppointmentApprovalEmailBody(
        appointment.studentName || 'Öğrenci',
        appointment.date,
        appointment.time,
        appointment.type
      );

      await sendEmailNotification(
        appointment.studentEmail,
        'Randevunuz Onaylandı ✅',
        emailBody
      );

      showToast(`Randevu onaylandı ve ${appointment.studentName} adresine e-posta gönderildi. 📧`, 'success');
    } catch (error) {
      console.error('Failed to approve appointment:', error);
      showToast('Randevu onaylanırken bir hata oluştu.', 'error');
    } finally {
      setIsProcessing(null);
    }
  }, [appointments, showToast]);

  // Handle reject appointment
  const handleReject = useCallback(async (appointment: Appointment) => {
    if (!appointment.studentEmail) {
      showToast('Öğrenci e-posta adresi bulunamadı.', 'error');
      return;
    }

    setIsProcessing(appointment.id);

    try {
      // Update appointment status
      const updated = appointments.map(apt =>
        apt.id === appointment.id
          ? { ...apt, status: 'rejected' as const }
          : apt
      );

      setAppointments(updated);
      saveAppointments(updated);

      // Send rejection email to student
      const emailBody = generateAppointmentRejectionEmailBody(
        appointment.studentName || 'Öğrenci',
        appointment.date,
        appointment.time
      );

      await sendEmailNotification(
        appointment.studentEmail,
        'Randevu Talebi - Bilgilendirme',
        emailBody
      );

      showToast(`Randevu reddedildi ve ${appointment.studentName} adresine e-posta gönderildi. 📧`, 'info');
    } catch (error) {
      console.error('Failed to reject appointment:', error);
      showToast('Randevu reddedilirken bir hata oluştu.', 'error');
    } finally {
      setIsProcessing(null);
    }
  }, [appointments, showToast]);

  // Format date for display
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  // Get status badge styles
  const getStatusBadge = (status: Appointment['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      confirmed: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300',
      cancelled: 'bg-slate-100 text-slate-700 border-slate-300',
    };

    const labels = {
      pending: 'Beklemede',
      confirmed: 'Onaylandı',
      rejected: 'Reddedildi',
      cancelled: 'İptal Edildi',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || 'Bilinmiyor'}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            Randevu Talepleri
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Öğrencilerden gelen randevu taleplerini yönetin
          </p>
        </div>
        <button
          onClick={loadAppointments}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Yenile
        </button>
      </div>

      {/* Status Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Durum Filtresi:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all' as StatusFilter, label: 'Tümü', count: statusCounts.all },
            { id: 'pending' as StatusFilter, label: 'Beklemede', count: statusCounts.pending },
            { id: 'confirmed' as StatusFilter, label: 'Onaylandı', count: statusCounts.confirmed },
            { id: 'rejected' as StatusFilter, label: 'Reddedildi', count: statusCounts.rejected },
            { id: 'cancelled' as StatusFilter, label: 'İptal Edildi', count: statusCounts.cancelled },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === filter.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === filter.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
          <EmptyState
            type="generic"
            title={statusFilter === 'all' ? 'Şu an bekleyen randevu talebi yok' : `Bu durumda randevu bulunmuyor`}
            description={
              statusFilter === 'all'
                ? 'Öğrenciler randevu oluşturduğunda burada görünecek.'
                : 'Farklı bir durum filtresi seçmeyi deneyin.'
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Öğrenci</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Tarih & Saat</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Ders Türü</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Durum</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">E-posta</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appointment) => {
                  // Row background color based on status
                  const rowBgColor = 
                    appointment.status === 'confirmed' ? 'bg-green-50/50' :
                    appointment.status === 'rejected' ? 'bg-red-50/50' :
                    appointment.status === 'cancelled' ? 'bg-slate-50' :
                    'bg-white';
                  
                  return (
                  <tr key={appointment.id} className={`${rowBgColor} hover:opacity-80 transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{appointment.studentName || 'Bilinmeyen Öğrenci'}</p>
                          {appointment.studentId && (
                            <p className="text-xs text-slate-500">ID: {appointment.studentId}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-800">{formatDate(appointment.date)}</p>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.time}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {appointment.type === 'online' ? (
                          <Video className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <MapPin className="w-4 h-4 text-green-600" />
                        )}
                        <span className="text-sm text-slate-700">
                          {appointment.type === 'online' ? 'Online Ders' : 'Yüz Yüze Ders'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4">
                      {appointment.studentEmail ? (
                        <a
                          href={`mailto:${appointment.studentEmail}`}
                          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          <Mail className="w-4 h-4" />
                          {appointment.studentEmail}
                        </a>
                      ) : (
                        <span className="text-sm text-slate-400">E-posta yok</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(appointment)}
                              disabled={isProcessing === appointment.id}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Onayla
                            </button>
                            <button
                              onClick={() => handleReject(appointment)}
                              disabled={isProcessing === appointment.id}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-4 h-4" />
                              Reddet
                            </button>
                          </>
                        )}
                        {appointment.status !== 'pending' && (
                          <span className="text-xs text-slate-400 italic">
                            {appointment.status === 'confirmed' ? 'Onaylandı' : 
                             appointment.status === 'rejected' ? 'Reddedildi' : 'İptal Edildi'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredAppointments.map((appointment) => {
              // Card background color based on status
              const cardBgColor = 
                appointment.status === 'confirmed' ? 'bg-green-50/50' :
                appointment.status === 'rejected' ? 'bg-red-50/50' :
                appointment.status === 'cancelled' ? 'bg-slate-50' :
                'bg-white';
              
              return (
              <div key={appointment.id} className={`p-4 ${cardBgColor}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{appointment.studentName || 'Bilinmeyen Öğrenci'}</p>
                      {appointment.studentEmail && (
                        <a
                          href={`mailto:${appointment.studentEmail}`}
                          className="text-xs text-indigo-600 flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          {appointment.studentEmail}
                        </a>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarCheck className="w-4 h-4" />
                    {formatDate(appointment.date)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    {appointment.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    {appointment.type === 'online' ? (
                      <Video className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <MapPin className="w-4 h-4 text-green-600" />
                    )}
                    {appointment.type === 'online' ? 'Online Ders' : 'Yüz Yüze Ders'}
                  </div>
                </div>

                {appointment.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(appointment)}
                      disabled={isProcessing === appointment.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Onayla
                    </button>
                    <button
                      onClick={() => handleReject(appointment)}
                      disabled={isProcessing === appointment.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reddet
                    </button>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

AppointmentRequestsTab.displayName = 'AppointmentRequestsTab';

export default AppointmentRequestsTab;

