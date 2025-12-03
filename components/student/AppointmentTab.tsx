/**
 * AppointmentTab - Private Lesson Booking System
 * 
 * Features:
 * - Calendar grid for day selection
 * - Available time slots
 * - Appointment booking with confirmation
 * - Saved appointments in localStorage
 * - Toast notifications
 */

import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Calendar, Clock, ChevronLeft, ChevronRight, Check, 
  X, CalendarCheck, AlertCircle, User, Video
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { 
  sendEmailNotification, 
  generateAppointmentEmailBody 
} from '../../services/EmailService';

// --- TYPES ---
export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  type: 'online' | 'yuz-yuze';
  status: 'confirmed' | 'pending' | 'cancelled' | 'rejected';
  createdAt: string;
}

interface AppointmentTabProps {
  userId?: string;
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

// --- CONSTANTS ---
const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

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

// --- CALENDAR HELPER ---
const getDaysInMonth = (year: number, month: number): { day: number; isCurrentMonth: boolean; date: Date }[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6;
  
  const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];
  
  // Previous month days
  const prevMonth = new Date(year, month, 0);
  const prevMonthDays = prevMonth.getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    days.push({ 
      day, 
      isCurrentMonth: false, 
      date: new Date(year, month - 1, day) 
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ 
      day: i, 
      isCurrentMonth: true, 
      date: new Date(year, month, i) 
    });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - days.length; // 6 rows x 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ 
      day: i, 
      isCurrentMonth: false, 
      date: new Date(year, month + 1, i) 
    });
  }
  
  return days;
};

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- TIME SLOT COMPONENT ---
interface TimeSlotProps {
  time: string;
  isBooked: boolean;
  isSelected: boolean;
  isPast: boolean;
  onClick: () => void;
}

const TimeSlot: React.FC<TimeSlotProps> = memo(({ time, isBooked, isSelected, isPast, onClick }) => {
  const disabled = isBooked || isPast;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all
        ${disabled 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
          : isSelected
            ? 'bg-indigo-600 text-white shadow-lg scale-105'
            : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
        }
      `}
    >
      <Clock className="w-4 h-4" />
      {time}
      {isBooked && <span className="text-xs">(Dolu)</span>}
    </button>
  );
});

TimeSlot.displayName = 'TimeSlot';

// --- CONFIRMATION MODAL ---
interface ConfirmationModalProps {
  date: Date;
  time: string;
  lessonType: 'online' | 'yuz-yuze';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = memo(({ 
  date, time, lessonType, onConfirm, onCancel, isLoading 
}) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onClick={onCancel}
  >
    <div 
      className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn"
      onClick={e => e.stopPropagation()}
    >
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Randevu Onayı</h3>
            <p className="text-sm text-slate-500">Aşağıdaki detayları kontrol edin</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <div>
            <p className="text-xs text-slate-500">Tarih</p>
            <p className="font-semibold text-slate-800">
              {date.toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
          <Clock className="w-5 h-5 text-indigo-600" />
          <div>
            <p className="text-xs text-slate-500">Saat</p>
            <p className="font-semibold text-slate-800">{time}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
          {lessonType === 'online' ? (
            <Video className="w-5 h-5 text-indigo-600" />
          ) : (
            <User className="w-5 h-5 text-indigo-600" />
          )}
          <div>
            <p className="text-xs text-slate-500">Ders Türü</p>
            <p className="font-semibold text-slate-800">
              {lessonType === 'online' ? 'Online Ders' : 'Yüz Yüze Ders'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6 border-t border-slate-100 flex gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          İptal
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              Onayla
            </>
          )}
        </button>
      </div>
    </div>
  </div>
));

ConfirmationModal.displayName = 'ConfirmationModal';

// --- MAIN COMPONENT ---
export const AppointmentTab: React.FC<AppointmentTabProps> = memo(({ userId, userName, userEmail, isAdmin = false }) => {
  const { showToast } = useToast();
  const today = new Date();
  
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [lessonType, setLessonType] = useState<'online' | 'yuz-yuze'>('online');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Load appointments
  useEffect(() => {
    setAppointments(getStoredAppointments());
  }, []);

  // Calendar days
  const calendarDays = useMemo(() => 
    getDaysInMonth(currentYear, currentMonth), 
    [currentYear, currentMonth]
  );

  // Get booked slots for selected date
  const bookedSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = formatDateKey(selectedDate);
    return appointments
      .filter(a => a.date === dateKey && a.status !== 'cancelled')
      .map(a => a.time);
  }, [selectedDate, appointments]);

  // User's appointments
  const myAppointments = useMemo(() => 
    appointments.filter(a => a.studentId === userId && a.status !== 'cancelled'),
    [appointments, userId]
  );

  // Navigation
  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }, [currentMonth]);

  // Date selection
  const handleDateSelect = useCallback((date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    
    // Can't select past dates
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date < todayStart) return;
    
    setSelectedDate(date);
    setSelectedTime(null);
  }, [today]);

  // Time selection
  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  // Book appointment
  const handleBookAppointment = useCallback(async () => {
    if (!selectedDate || !selectedTime || !userName) return;

    setIsBooking(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newAppointment: Appointment = {
      id: 'apt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      date: formatDateKey(selectedDate),
      time: selectedTime,
      studentId: userId,
      studentName: userName,
      studentEmail: userEmail,
      type: lessonType,
      status: 'pending', // Default to pending - requires teacher approval
      createdAt: new Date().toISOString(),
    };

    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    saveAppointments(updatedAppointments);

    // Send email notification to teacher
    if (userEmail && userName) {
      try {
        // Console log for email simulation
        console.log(`Sending email to seyda@aciker.com regarding ${userName}`);
        
        const emailBody = generateAppointmentEmailBody(
          userName,
          formatDateKey(selectedDate),
          selectedTime,
          lessonType
        );
        
        await sendEmailNotification(
          'seyda@aciker.com', // Teacher email
          `Yeni Randevu Talebi - ${userName}`,
          emailBody
        );
      } catch (error) {
        console.error('Failed to send email notification:', error);
      }
    }

    setIsBooking(false);
    setShowConfirmation(false);
    setSelectedTime(null);

    showToast('Randevu talebiniz iletildi. 📧', 'success');
  }, [selectedDate, selectedTime, lessonType, userId, userName, userEmail, appointments, showToast]);

  // Check if time slot is in the past
  const isTimePast = useCallback((time: string): boolean => {
    if (!selectedDate) return false;
    
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedDateStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    if (selectedDateStart > todayStart) return false;
    if (selectedDateStart < todayStart) return true;
    
    // Same day - check time
    const [hours] = time.split(':').map(Number);
    return hours <= today.getHours();
  }, [selectedDate, today]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            Özel Ders Randevusu
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Şeyda Açıker ile birebir ders için randevu alın
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={goToPrevMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800">
              {MONTHS_TR[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayInfo, index) => {
              const dateKey = formatDateKey(dayInfo.date);
              const isToday = dateKey === formatDateKey(today);
              const isSelected = selectedDate && dateKey === formatDateKey(selectedDate);
              const isPast = dayInfo.date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const hasAppointment = appointments.some(a => a.date === dateKey && a.status !== 'cancelled');
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(dayInfo.date, dayInfo.isCurrentMonth)}
                  disabled={!dayInfo.isCurrentMonth || isPast}
                  className={`
                    aspect-square p-2 rounded-lg text-sm font-medium transition-all relative
                    ${!dayInfo.isCurrentMonth 
                      ? 'text-slate-300 cursor-default' 
                      : isPast
                        ? 'text-slate-300 cursor-not-allowed'
                        : isSelected
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : isToday
                            ? 'bg-indigo-100 text-indigo-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                    }
                  `}
                >
                  {dayInfo.day}
                  {hasAppointment && dayInfo.isCurrentMonth && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-3 h-3 bg-indigo-100 rounded" />
              Bugün
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-3 h-3 bg-indigo-600 rounded" />
              Seçili
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Randevulu
            </div>
          </div>
        </div>

        {/* Time Slots & Booking */}
        <div className="space-y-6">
          {/* Lesson Type */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-bold text-slate-800 mb-4">Ders Türü</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setLessonType('online')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  lessonType === 'online'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Video className="w-4 h-4" />
                Online
              </button>
              <button
                onClick={() => setLessonType('yuz-yuze')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  lessonType === 'yuz-yuze'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <User className="w-4 h-4" />
                Yüz Yüze
              </button>
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h4 className="font-bold text-slate-800 mb-4">
              {selectedDate 
                ? `${selectedDate.getDate()} ${MONTHS_TR[selectedDate.getMonth()]} - Uygun Saatler`
                : 'Önce bir tarih seçin'
              }
            </h4>
            
            {selectedDate ? (
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map(time => (
                  <TimeSlot
                    key={time}
                    time={time}
                    isBooked={bookedSlots.includes(time)}
                    isSelected={selectedTime === time}
                    isPast={isTimePast(time)}
                    onClick={() => handleTimeSelect(time)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Takvimden bir gün seçin</p>
              </div>
            )}

            {/* Book Button */}
            {selectedDate && selectedTime && (
              <button
                onClick={() => setShowConfirmation(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                <CalendarCheck className="w-5 h-5" />
                Randevu Al
              </button>
            )}
          </div>

          {/* My Appointments */}
          {myAppointments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h4 className="font-bold text-slate-800 mb-4">Randevularım</h4>
              <div className="space-y-3">
                {myAppointments.slice(0, 3).map(apt => (
                  <div 
                    key={apt.id}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {new Date(apt.date).toLocaleDateString('tr-TR', { 
                          day: 'numeric', 
                          month: 'long' 
                        })} - {apt.time}
                      </p>
                      <p className="text-xs text-slate-500">
                        {apt.type === 'online' ? 'Online' : 'Yüz Yüze'} Ders
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedDate && selectedTime && (
        <ConfirmationModal
          date={selectedDate}
          time={selectedTime}
          lessonType={lessonType}
          onConfirm={handleBookAppointment}
          onCancel={() => setShowConfirmation(false)}
          isLoading={isBooking}
        />
      )}
    </div>
  );
});

AppointmentTab.displayName = 'AppointmentTab';

export default AppointmentTab;

