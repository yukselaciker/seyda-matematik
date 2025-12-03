/**
 * PracticeExamsTab.tsx - Weekly Practice Exams (Deneme Sınavları)
 * 
 * Features:
 * - Admin: Create exams with title, date, link, difficulty
 * - Student: View and take practice exams
 * - Date-based access control
 * - localStorage persistence
 */

import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  FileCheck, Calendar, Link as LinkIcon, AlertCircle, 
  ExternalLink, Plus, Loader2, CheckCircle, Clock, BookOpen, Trash2
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import EmptyState from './EmptyState';
import { User } from '../../types';

// --- TYPES ---
export interface PracticeExam {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  link: string; // Google Forms or PDF URL
  difficulty: 'kolay' | 'orta' | 'zor';
  createdAt: string;
  createdBy: string; // Admin/Teacher ID
}

interface PracticeExamsTabProps {
  currentUser: User;
}

// --- STORAGE ---
const EXAMS_STORAGE_KEY = 'app_exams';

const getStoredExams = (): PracticeExam[] => {
  try {
    const stored = localStorage.getItem(EXAMS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load exams', e);
  }
  return [];
};

const saveExams = (exams: PracticeExam[]): void => {
  try {
    localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
  } catch (e) {
    console.error('Failed to save exams', e);
  }
};

// --- DIFFICULTY BADGE COMPONENT ---
interface DifficultyBadgeProps {
  difficulty: PracticeExam['difficulty'];
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = memo(({ difficulty }) => {
  const styles = {
    kolay: 'bg-green-100 text-green-700 border-green-300',
    orta: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    zor: 'bg-red-100 text-red-700 border-red-300',
  };

  const labels = {
    kolay: 'Kolay',
    orta: 'Orta',
    zor: 'Zor',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[difficulty]}`}>
      {labels[difficulty]}
    </span>
  );
});

DifficultyBadge.displayName = 'DifficultyBadge';

// --- EXAM CARD COMPONENT (Student View) ---
interface ExamCardProps {
  exam: PracticeExam;
  onTakeExam: (exam: PracticeExam) => void;
  onDelete?: (examId: string) => void;
  isAdmin?: boolean;
}

const ExamCard: React.FC<ExamCardProps> = memo(({ exam, onTakeExam, onDelete, isAdmin = false }) => {
  const examDate = new Date(exam.date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isFuture = examDate > today;
  const isToday = examDate.getTime() === today.getTime();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{exam.title}</h3>
            {isAdmin && onDelete && (
              <button
                onClick={() => onDelete(exam.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sınavı Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(exam.date)}</span>
            </div>
            <DifficultyBadge difficulty={exam.difficulty} />
          </div>
        </div>
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
          <FileCheck className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        {isFuture ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Sınav henüz başlamadı</span>
          </div>
        ) : (
          <button
            onClick={() => onTakeExam(exam)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Sınava Git
          </button>
        )}
        {isToday && (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            Bugün
          </span>
        )}
      </div>
    </div>
  );
});

ExamCard.displayName = 'ExamCard';

// --- CREATE EXAM FORM (Admin View) ---
interface CreateExamFormProps {
  onSubmit: (exam: Omit<PracticeExam, 'id' | 'createdAt' | 'createdBy'>) => void;
  isLoading: boolean;
}

const CreateExamForm: React.FC<CreateExamFormProps> = memo(({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [link, setLink] = useState('');
  const [difficulty, setDifficulty] = useState<PracticeExam['difficulty']>('orta');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date || !link) {
      return;
    }

    onSubmit({ title, date, link, difficulty });
    
    // Reset form
    setTitle('');
    setDate('');
    setLink('');
    setDifficulty('orta');
  }, [title, date, link, difficulty, onSubmit]);

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Plus className="w-6 h-6 text-indigo-600" />
        Yeni Deneme Sınavı Oluştur
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Sınav Başlığı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="Örn: Haftalık Deneme Sınavı #1"
            required
            disabled={isLoading}
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Sınav Tarihi <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            required
            disabled={isLoading}
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Sınav Linki (Google Forms/PDF) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              placeholder="https://forms.google.com/..."
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Zorluk Seviyesi
          </label>
          <div className="flex gap-2">
            {(['kolay', 'orta', 'zor'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  difficulty === diff
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                disabled={isLoading}
              >
                {diff === 'kolay' ? 'Kolay' : diff === 'orta' ? 'Orta' : 'Zor'}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !title || !date || !link}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Oluşturuluyor...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Sınav Oluştur
            </>
          )}
        </button>
      </form>
    </div>
  );
});

CreateExamForm.displayName = 'CreateExamForm';

// --- MAIN COMPONENT ---
export const PracticeExamsTab: React.FC<PracticeExamsTabProps> = memo(({ currentUser }) => {
  const { showToast } = useToast();
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const isAdmin = useMemo(() => {
    return currentUser?.role === 'admin' || currentUser?.role === 'teacher';
  }, [currentUser?.role]);

  // Load exams on mount
  useEffect(() => {
    setExams(getStoredExams());
  }, []);

  // Filter exams
  const filteredExams = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'upcoming') {
      return exams.filter(exam => new Date(exam.date + 'T00:00:00') >= today);
    }
    if (filter === 'past') {
      return exams.filter(exam => new Date(exam.date + 'T00:00:00') < today);
    }
    return exams;
  }, [exams, filter]);

  // Sort exams by date (newest first)
  const sortedExams = useMemo(() => {
    return [...filteredExams].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredExams]);

  // Handle create exam (Admin)
  const handleCreateExam = useCallback(async (examData: Omit<PracticeExam, 'id' | 'createdAt' | 'createdBy'>) => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const newExam: PracticeExam = {
        ...examData,
        id: 'exam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id || 'admin',
      };

      const updatedExams = [...exams, newExam];
      setExams(updatedExams);
      saveExams(updatedExams);

      showToast('Deneme sınavı başarıyla oluşturuldu! 📝', 'success');
    } catch (error) {
      console.error('Failed to create exam:', error);
      showToast('Sınav oluşturulurken bir hata oluştu.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [exams, currentUser?.id, showToast]);

  // Handle take exam (Student)
  const handleTakeExam = useCallback((exam: PracticeExam) => {
    if (!exam.link) {
      showToast('Sınav linki bulunamadı.', 'error');
      return;
    }

    // Open in new tab
    window.open(exam.link, '_blank', 'noopener,noreferrer');
    showToast('Sınav yeni sekmede açılıyor... 📚', 'info');
  }, [showToast]);

  // Handle delete exam (Admin)
  const handleDeleteExam = useCallback((examId: string) => {
    if (!confirm('Bu sınavı silmek istediğinizden emin misiniz?')) {
      return;
    }

    const updatedExams = exams.filter(exam => exam.id !== examId);
    setExams(updatedExams);
    saveExams(updatedExams);
    showToast('Sınav başarıyla silindi.', 'info');
  }, [exams, showToast]);

  // Admin View
  if (isAdmin) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-indigo-600" />
              Deneme Sınavları Yönetimi
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Haftalık deneme sınavları oluşturun ve yönetin
            </p>
          </div>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            {exams.length} Sınav
          </span>
        </div>

        {/* Create Form */}
        <CreateExamForm onSubmit={handleCreateExam} isLoading={isLoading} />

        {/* Existing Exams List */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            Aktif Sınavlar
            {exams.length > 0 && (
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                {exams.length}
              </span>
            )}
          </h3>
          {exams.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12">
              <EmptyState
                type="generic"
                title="Henüz sınav oluşturulmadı"
                description="Yukarıdaki formu kullanarak yeni bir deneme sınavı oluşturun."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map(exam => (
                <ExamCard 
                  key={exam.id} 
                  exam={exam} 
                  onTakeExam={handleTakeExam}
                  onDelete={handleDeleteExam}
                  isAdmin={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Student View
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-indigo-600" />
            Haftalık Deneme Sınavları
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Haftalık deneme sınavlarınızı buradan takip edin ve çözün
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'all' as const, label: 'Tümü' },
            { id: 'upcoming' as const, label: 'Yaklaşan' },
            { id: 'past' as const, label: 'Geçmiş' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === option.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exams Grid */}
      {sortedExams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12">
          <EmptyState
            type="generic"
            title="Sınav bulunamadı"
            description={
              filter === 'all'
                ? 'Henüz deneme sınavı eklenmedi. Öğretmeniniz yeni sınavlar eklediğinde burada görünecek.'
                : filter === 'upcoming'
                  ? 'Yaklaşan sınav bulunmuyor.'
                  : 'Geçmiş sınav bulunmuyor.'
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedExams.map(exam => (
            <ExamCard 
              key={exam.id} 
              exam={exam} 
              onTakeExam={handleTakeExam}
              isAdmin={false}
            />
          ))}
        </div>
      )}
    </div>
  );
});

PracticeExamsTab.displayName = 'PracticeExamsTab';

export default PracticeExamsTab;

