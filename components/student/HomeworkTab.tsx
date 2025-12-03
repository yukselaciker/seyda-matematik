/**
 * HomeworkTab - Homework list and submission component
 * Enhanced with Drag & Drop Upload functionality
 */

import React, { memo, useCallback, useState } from 'react';
import { Upload, CheckCircle, Clock, AlertTriangle, Calendar as CalendarIcon, Loader2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Homework } from '../../types';
import EmptyState from './EmptyState';
import { DragDropUpload } from './DragDropUpload';

interface HomeworkTabProps {
  homeworks: Homework[];
  onSubmit: (homeworkId: string) => Promise<{ success: boolean; xpGained: number }>;
  onXpGained?: (amount: number) => void;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Bekliyor',
    className: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  delivered: {
    label: 'Teslim Edildi',
    className: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  feedback_needed: {
    label: 'Kontrol Ediliyor',
    className: 'bg-blue-100 text-blue-700',
    icon: AlertTriangle,
  },
  revision_needed: {
    label: 'Revizyon Gerekli',
    className: 'bg-red-100 text-red-700',
    icon: AlertTriangle,
  },
};

interface HomeworkItemProps {
  homework: Homework;
  onSubmit: (homeworkId: string) => Promise<{ success: boolean; xpGained: number }>;
}

const HomeworkItem: React.FC<HomeworkItemProps> = memo(({ homework, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const statusConfig = STATUS_CONFIG[homework.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  const handleUploadComplete = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    setUploadComplete(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(homework.id);
      setIsExpanded(false);
      setUploadComplete(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [homework.id, onSubmit, isSubmitting]);

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div className="p-6 hover:bg-slate-50 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h4 className="font-bold text-slate-800">{homework.title}</h4>
              <span className={'px-2 py-0.5 text-[10px] font-bold uppercase rounded-full flex items-center gap-1 ' + statusConfig.className}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              {homework.grade && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                  Not: {homework.grade}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mb-2">
              {homework.description || 'Aciklama yok'}
            </p>
            <div className="flex items-center text-xs text-slate-400 gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <CalendarIcon size={12} /> 
                Son: {homework.dueDate || 'Belirtilmemis'}
              </span>
              {homework.feedback && (
                <span className="text-blue-600">
                  {homework.feedback}
                </span>
              )}
            </div>
          </div>
          
          {homework.status === 'pending' ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={'flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-md ' + (
                isExpanded 
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
              )}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isExpanded ? 'Kapat' : 'Odev Yukle'}
              {isExpanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </button>
          ) : (
            <div className="flex items-center text-green-600 font-bold text-sm">
              <CheckCircle className="w-5 h-5 mr-2" /> Tamamlandi
            </div>
          )}
        </div>
      </div>

      {/* Expandable Upload Section */}
      {isExpanded && homework.status === 'pending' && (
        <div className="px-6 pb-6 animate-fadeIn">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h5 className="font-semibold text-slate-700">Odev Dosyalarini Yukle</h5>
            </div>
            
            <DragDropUpload
              onUploadComplete={handleUploadComplete}
              maxFiles={3}
              acceptedTypes={['application/pdf', 'image/jpeg', 'image/png', 'image/gif']}
              maxSizeMB={10}
            />

            {uploadComplete && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={'flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl ' + (
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-600 hover:to-emerald-700'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gonderiliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Odevi Teslim Et
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

HomeworkItem.displayName = 'HomeworkItem';

export const HomeworkTab: React.FC<HomeworkTabProps> = memo(({ homeworks, onSubmit }) => {
  if (!homeworks || homeworks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn transition-colors">
        <EmptyState type="homework" />
      </div>
    );
  }

  const pendingCount = homeworks.filter(h => h.status === 'pending').length;
  const completedCount = homeworks.filter(h => h.status === 'delivered').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn transition-colors">
      <div className="p-6 border-b border-slate-100">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-lg text-[#1C2A5E]">Odev Listesi</h3>
            <p className="text-sm text-slate-500 mt-1">Odevlerini surukle-birak ile kolayca yukle</p>
          </div>
          <div className="flex gap-2">
            <span className="text-xs font-medium bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full">
              {pendingCount} Bekliyor
            </span>
            <span className="text-xs font-medium bg-green-50 text-green-600 px-3 py-1 rounded-full">
              {completedCount} Tamamlandi
            </span>
          </div>
        </div>
      </div>
      <div>
        {homeworks.map(hw => (
          <HomeworkItem key={hw.id} homework={hw} onSubmit={onSubmit} />
        ))}
      </div>
    </div>
  );
});

HomeworkTab.displayName = 'HomeworkTab';

export default HomeworkTab;
