/**
 * OverviewTab - Dashboard overview with stats, topics, and AI plan
 */

import React, { memo, useState, useCallback } from 'react';
import { Clock, CheckCircle, Star, Flame, Sparkles, TrendingUp, Target } from 'lucide-react';
import { Homework, ProgressStat, Topic } from '../../types';
import EmptyState from './EmptyState';
import PomodoroTimer from './PomodoroTimer';
import { useToast } from '../../contexts/ToastContext';

interface OverviewTabProps {
  homeworks: Homework[];
  stats: ProgressStat[];
  topics: Topic[];
  pomodoro: {
    isRunning: boolean;
    timeLeft: number;
    mode: 'work' | 'break';
  };
  onStartPomodoro: (duration?: number, mode?: 'work' | 'break') => void;
  onStopPomodoro: () => void;
  onGenerateAiPlan: () => Promise<string>;
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  iconBgColor: string;
  valueColor?: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = memo(({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  valueColor = 'text-[#1C2A5E]',
  trend 
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-colors hover:shadow-md group">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm">{title}</p>
        <h3 className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</h3>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}% bu hafta
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${iconBgColor} transition-transform group-hover:scale-110`}>
        {icon}
      </div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

// Progress Chart Component
interface ProgressChartProps {
  stats: ProgressStat[];
}

const ProgressChart: React.FC<ProgressChartProps> = memo(({ stats }) => {
  if (!stats || stats.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-colors">
        <h3 className="font-bold text-slate-800 mb-6">Haftalık Gelişim</h3>
        <EmptyState type="generic" title="Henüz veri yok" description="Çalışmaya devam et, istatistiklerin burada görünecek!" />
      </div>
    );
  }

  const maxMastery = Math.max(...stats.map(s => s.mastery));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-colors">
      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-500" />
        Haftalık Gelişim (Konu Hakimiyeti)
      </h3>
      <div className="h-64 flex items-end justify-between gap-2 px-2">
        {stats.map((stat, idx) => {
          const isHighest = stat.mastery === maxMastery;
          return (
            <div key={idx} className="w-full flex flex-col items-center gap-2 group">
              <div className="relative w-full bg-indigo-50 rounded-t-lg h-48 flex items-end justify-center overflow-hidden">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-1000 relative ${
                    isHighest 
                      ? 'bg-gradient-to-t from-indigo-600 to-purple-500' 
                      : 'bg-[#1C2A5E] group-hover:bg-indigo-600'
                  }`}
                  style={{ height: `${stat.mastery}%` }}
                >
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    %{stat.mastery}
                  </span>
                </div>
                {isHighest && (
                  <Star className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 text-amber-500 fill-current" />
                )}
              </div>
              <span className="text-xs font-medium text-slate-500">{stat.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ProgressChart.displayName = 'ProgressChart';

// Topics List Component
interface TopicsListProps {
  topics: Topic[];
  onGenerateAiPlan: () => Promise<string>;
}

const TopicsList: React.FC<TopicsListProps> = memo(({ topics, onGenerateAiPlan }) => {
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = useCallback(async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const plan = await onGenerateAiPlan();
      setAiPlan(plan);
    } finally {
      setIsGenerating(false);
    }
  }, [onGenerateAiPlan, isGenerating]);

  const getStatusIndicator = (status: Topic['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
      case 'in_progress':
        return 'bg-yellow-500 animate-pulse';
      case 'missing':
        return 'bg-red-500';
      default:
        return 'bg-slate-400';
    }
  };

  const getStatusLabel = (status: Topic['status']) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'missing':
        return 'Eksik';
      default:
        return '';
    }
  };

  if (!topics || topics.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-colors">
        <h3 className="font-bold text-slate-800 mb-6">Konu Takibi</h3>
        <EmptyState type="topics" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-colors">
      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-500" />
        Konu Takibi
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {topics.map(topic => (
          <div 
            key={topic.id} 
            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${getStatusIndicator(topic.status)}`} />
              <div>
                <span className="text-sm font-medium text-slate-700">
                  {topic.name}
                </span>
                <span className="text-[10px] text-slate-400 ml-2">
                  {getStatusLabel(topic.status)}
                </span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
              {topic.subject}
            </span>
          </div>
        ))}
      </div>
      
      <button 
        onClick={handleGeneratePlan}
        disabled={isGenerating}
        className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analiz Yapılıyor...
          </span>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" /> 
            AI Çalışma Planı Oluştur
          </>
        )}
      </button>
      
      {aiPlan && (
        <div className="mt-4 p-4 bg-gradient-to-br from-slate-800 to-slate-900 text-indigo-100 rounded-xl text-sm whitespace-pre-line animate-fadeIn border border-indigo-500/30">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white">AI Önerisi</span>
          </div>
          {aiPlan}
        </div>
      )}
    </div>
  );
});

TopicsList.displayName = 'TopicsList';

// Main Overview Tab
export const OverviewTab: React.FC<OverviewTabProps> = memo(({
  homeworks,
  stats,
  topics,
  onGenerateAiPlan,
}) => {
  const { showToast } = useToast();
  const pendingHomeworks = homeworks?.filter(h => h.status === 'pending').length || 0;
  const completedTopics = topics?.filter(t => t.status === 'completed').length || 0;
  const totalTopics = topics?.length || 1;
  const completionPercentage = Math.round((completedTopics / totalTopics) * 100);

  const handlePomodoroComplete = useCallback((mode: 'work' | 'break') => {
    if (mode === 'work') {
      showToast('Tebrikler! Çalışma oturumu tamamlandı. +25 XP 🎉', 'xp');
    } else {
      showToast('Mola bitti! Yeniden odaklanma zamanı 💪', 'info');
    }
  }, [showToast]);

  const handleXpGain = useCallback((amount: number) => {
    showToast(`+${amount} XP kazandın! ⭐`, 'xp');
  }, [showToast]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Bekleyen Ödev"
          value={pendingHomeworks}
          icon={<Clock className="text-orange-500 h-6 w-6" />}
          iconBgColor="bg-orange-50"
        />
        <StatCard 
          title="Konu Tamamlama"
          value={`%${completionPercentage}`}
          icon={<CheckCircle className="text-green-500 h-6 w-6" />}
          iconBgColor="bg-green-50"
          valueColor="text-green-600"
          trend={5}
        />
        <StatCard 
          title="Motivasyon"
          value={
            <span className="flex items-center gap-1">
              <Flame className="fill-current" size={24}/> Yüksek
            </span>
          }
          icon={<Star className="text-yellow-500 h-6 w-6 fill-current" />}
          iconBgColor="bg-yellow-50"
          valueColor="text-[#D4AF37]"
        />
      </div>

      {/* Charts and Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart stats={stats} />
        <TopicsList topics={topics} onGenerateAiPlan={onGenerateAiPlan} />
      </div>

      {/* Pomodoro Timer - Now fully standalone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PomodoroTimer 
          onComplete={handlePomodoroComplete}
          onXpGain={handleXpGain}
        />
        
        {/* Quick Tips Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Günün İpuçları
          </h3>
          <ul className="space-y-3 text-sm text-indigo-100">
            <li className="flex items-start gap-2">
              <span className="text-lg">📚</span>
              <span>Her gün en az 15 soru çözmeyi hedefle</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg">⏰</span>
              <span>Pomodoro tekniği ile odaklanmayı artır</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg">✍️</span>
              <span>Yanlış sorularını not al ve tekrar et</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg">🎯</span>
              <span>Önce eksik konularına odaklan</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
});

OverviewTab.displayName = 'OverviewTab';

export default OverviewTab;
