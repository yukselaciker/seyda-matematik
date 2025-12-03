/**
 * EmptyState - Reusable component for empty list states
 */

import React, { memo } from 'react';
import { FileQuestion, BookOpen, Calendar, MessageCircle, Video, Inbox } from 'lucide-react';

type EmptyStateType = 'homework' | 'topics' | 'calendar' | 'chat' | 'videos' | 'generic';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, { icon: React.ElementType; defaultTitle: string; defaultDesc: string }> = {
  homework: {
    icon: FileQuestion,
    defaultTitle: 'Henüz ödev yok',
    defaultDesc: 'Yeni ödevler atandığında burada görünecek.',
  },
  topics: {
    icon: BookOpen,
    defaultTitle: 'Konu bulunamadı',
    defaultDesc: 'Çalışma konuları yakında eklenecek.',
  },
  calendar: {
    icon: Calendar,
    defaultTitle: 'Etkinlik yok',
    defaultDesc: 'Bu ay için planlanmış etkinlik bulunmuyor.',
  },
  chat: {
    icon: MessageCircle,
    defaultTitle: 'Henüz mesaj yok',
    defaultDesc: 'Matematik asistanına bir soru sorarak başla!',
  },
  videos: {
    icon: Video,
    defaultTitle: 'Video bulunamadı',
    defaultDesc: 'Video dersler yakında eklenecek.',
  },
  generic: {
    icon: Inbox,
    defaultTitle: 'Veri bulunamadı',
    defaultDesc: 'Gösterilecek içerik bulunmuyor.',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = memo(({ type, title, description, action }) => {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm">
        {description || config.defaultDesc}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;




