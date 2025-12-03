/**
 * CalendarTab - Dynamic Monthly Calendar with Navigation
 * 
 * Features:
 * - Dynamic date generation using JavaScript Date object
 * - Month navigation (Prev/Next)
 * - Distinct markers for exams (red), homework (yellow), lessons (green)
 * - Current day highlighting
 * - Event details on click
 * - Persists events to localStorage
 */

import React, { memo, useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X, Plus, Trash2 } from 'lucide-react';
import EmptyState from './EmptyState';

// --- TYPES ---
export interface CalendarEvent {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  title: string;
  type: 'exam' | 'deadline' | 'lesson';
  description?: string;
}

interface CalendarTabProps {
  events?: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent?: (eventId: string) => void;
}

// --- CONSTANTS ---
const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const EVENT_CONFIG = {
  exam: { 
    color: 'bg-red-500', 
    lightBg: 'bg-red-100',
    text: 'text-red-700',
    label: 'Sınav',
    emoji: '📝'
  },
  deadline: { 
    color: 'bg-yellow-500', 
    lightBg: 'bg-yellow-100',
    text: 'text-yellow-700',
    label: 'Ödev',
    emoji: '📚'
  },
  lesson: { 
    color: 'bg-green-500', 
    lightBg: 'bg-green-100',
    text: 'text-green-700',
    label: 'Ders',
    emoji: '👨‍🏫'
  },
};

// --- STORAGE ---
const CALENDAR_STORAGE_KEY = 'app_calendar_events';

const getStoredEvents = (): CalendarEvent[] => {
  try {
    const stored = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load calendar events', e);
  }
  
  // Default events
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const defaults: CalendarEvent[] = [
    { id: 'e1', date: `${year}-${String(month + 1).padStart(2, '0')}-12`, title: 'Matematik Sınavı', type: 'exam', description: 'Üslü ifadeler ve kökler' },
    { id: 'e2', date: `${year}-${String(month + 1).padStart(2, '0')}-15`, title: 'Geometri Ödevi', type: 'deadline', description: 'Sayfa 45-60 arası' },
    { id: 'e3', date: `${year}-${String(month + 1).padStart(2, '0')}-18`, title: 'Birebir Ders', type: 'lesson', description: 'Konu: Kareköklü sayılar' },
    { id: 'e4', date: `${year}-${String(month + 1).padStart(2, '0')}-22`, title: 'Deneme Sınavı', type: 'exam', description: 'LGS formatında' },
    { id: 'e5', date: `${year}-${String(month + 1).padStart(2, '0')}-25`, title: 'Proje Teslimi', type: 'deadline', description: 'Matematik projesi' },
  ];
  
  localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
};

const saveEvents = (events: CalendarEvent[]): void => {
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save calendar events', e);
  }
};

// --- HELPER FUNCTIONS ---
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday=0 format
  return day === 0 ? 6 : day - 1;
};

const formatDateKey = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// --- EVENT MODAL ---
interface EventModalProps {
  events: CalendarEvent[];
  date: Date;
  onClose: () => void;
  onDelete: (eventId: string) => void;
}

const EventModal: React.FC<EventModalProps> = memo(({ events, date, onClose, onDelete }) => {
  const dateStr = date.toLocaleDateString('tr-TR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">Etkinlikler</h3>
            <p className="text-sm text-slate-500 capitalize">{dateStr}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              Bu tarihte etkinlik yok
            </p>
          ) : (
            events.map(event => {
              const config = EVENT_CONFIG[event.type];
              return (
                <div 
                  key={event.id}
                  className={`p-4 rounded-xl ${config.lightBg} border border-slate-100`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{config.emoji}</span>
                      <div>
                        <h4 className={`font-bold ${config.text}`}>{event.title}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.color} text-white`}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(event.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {event.description && (
                    <p className="text-sm text-slate-600 mt-2">
                      {event.description}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});

EventModal.displayName = 'EventModal';

// --- ADD EVENT MODAL ---
interface AddEventModalProps {
  date: Date;
  onClose: () => void;
  onAdd: (event: Omit<CalendarEvent, 'id'>) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = memo(({ date, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('lesson');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const dateStr = formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
    onAdd({
      date: dateStr,
      title: title.trim(),
      type,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Yeni Etkinlik Ekle</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Başlık
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Etkinlik adı"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tür
            </label>
            <div className="flex gap-2">
              {Object.entries(EVENT_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key as CalendarEvent['type'])}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    type === key
                      ? `${config.color} text-white`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {config.emoji} {config.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Açıklama (opsiyonel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Etkinlik detayları..."
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Ekle
          </button>
        </form>
      </div>
    </div>
  );
});

AddEventModal.displayName = 'AddEventModal';

// --- MAIN CALENDAR COMPONENT ---
export const CalendarTab: React.FC<CalendarTabProps> = memo(({ events: propEvents }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<CalendarEvent[]>(() => propEvents || getStoredEvents());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalDate, setAddModalDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days: (number | null)[] = [];
    
    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  }, [year, month]);

  // Create event lookup map
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach(event => {
      const existing = map.get(event.date) || [];
      existing.push(event);
      map.set(event.date, existing);
    });
    return map;
  }, [events]);

  // Navigation handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(new Date(year, month - 1, 1));
  }, [year, month]);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(new Date(year, month + 1, 1));
  }, [year, month]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }, [today]);

  // Event handlers
  const handleDayClick = useCallback((day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
  }, [year, month]);

  const handleDayDoubleClick = useCallback((day: number) => {
    const clickedDate = new Date(year, month, day);
    setAddModalDate(clickedDate);
    setShowAddModal(true);
  }, [year, month]);

  const handleAddEvent = useCallback((newEvent: Omit<CalendarEvent, 'id'>) => {
    const event: CalendarEvent = {
      ...newEvent,
      id: `event_${Date.now()}`,
    };
    const updatedEvents = [...events, event];
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  }, [events]);

  const handleDeleteEvent = useCallback((eventId: string) => {
    const updatedEvents = events.filter(e => e.id !== eventId);
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  }, [events]);

  const isToday = (day: number): boolean => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-fadeIn transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-xl text-[#1C2A5E]">
            {MONTHS_TR[month]} {year}
          </h3>
          <button
            onClick={goToToday}
            className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            Bugün
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 mr-4 text-xs">
            {Object.entries(EVENT_CONFIG).map(([key, config]) => (
              <span key={key} className="flex items-center gap-1 text-slate-600">
                <span className={`w-2 h-2 rounded-full ${config.color}`}></span>
                {config.label}
              </span>
            ))}
          </div>
          
          {/* Navigation */}
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Önceki ay"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Sonraki ay"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map(day => (
          <div 
            key={day} 
            className="text-center text-xs font-medium text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateKey = formatDateKey(year, month, day);
          const dayEvents = eventsByDate.get(dateKey) || [];
          const hasEvents = dayEvents.length > 0;
          const isTodayDate = isToday(day);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              onDoubleClick={() => handleDayDoubleClick(day)}
              className={`
                aspect-square rounded-xl border flex flex-col items-center justify-center relative p-1
                transition-all hover:scale-105 cursor-pointer
                ${isTodayDate 
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                  : hasEvents 
                    ? 'border-slate-200 bg-slate-50 hover:border-indigo-300'
                    : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                }
              `}
              title={`${day} ${MONTHS_TR[month]} - Çift tıkla ekle`}
            >
              <span className={`text-sm font-medium ${
                isTodayDate 
                  ? 'text-indigo-600 font-bold' 
                  : hasEvents 
                    ? 'text-slate-800 font-semibold'
                    : 'text-slate-600'
              }`}>
                {day}
              </span>
              
              {/* Event Indicators */}
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div 
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${EVENT_CONFIG[event.type].color}`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px] text-slate-500">+{dayEvents.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      <p className="text-xs text-center text-slate-400 mt-4">
        💡 Tıkla: Etkinlikleri gör | Çift tıkla: Yeni etkinlik ekle
      </p>

      {/* Upcoming Events */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Yaklaşan Etkinlikler
        </h4>
        
        {events.length === 0 ? (
          <EmptyState type="calendar" />
        ) : (
          <div className="space-y-2">
            {events
              .filter(e => new Date(e.date) >= new Date(today.toDateString()))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map(event => {
                const eventDate = new Date(event.date);
                const config = EVENT_CONFIG[event.type];
                
                return (
                  <div 
                    key={event.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedDate(eventDate)}
                  >
                    <div className={`w-3 h-3 rounded-full ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {eventDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${config.lightBg} ${config.text}`}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedDate && (
        <EventModal
          events={eventsByDate.get(formatDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())) || []}
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Add Event Modal */}
      {showAddModal && addModalDate && (
        <AddEventModal
          date={addModalDate}
          onClose={() => {
            setShowAddModal(false);
            setAddModalDate(null);
          }}
          onAdd={handleAddEvent}
        />
      )}
    </div>
  );
});

CalendarTab.displayName = 'CalendarTab';

export default CalendarTab;
