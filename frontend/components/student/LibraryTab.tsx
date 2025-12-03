/**
 * LibraryTab - Interactive Learning Materials Library
 * 
 * Features:
 * - Clickable PDF and Video items
 * - Modal viewer for content
 * - Video player with mock playback
 * - PDF viewer with page navigation
 * - Filter by type
 * - Persists recently viewed items
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import { 
  FileText, Play, X, Download, ExternalLink, 
  ChevronLeft, ChevronRight, Eye, Clock, Star,
  Filter, Grid, List as ListIcon
} from 'lucide-react';
import EmptyState from './EmptyState';

// --- TYPES ---
export interface LearningMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video';
  subject: string;
  thumbnail?: string;
  duration?: string;
  pages?: number;
  description?: string;
  url?: string;
}

interface LibraryTabProps {
  materials?: LearningMaterial[];
  onXpGain?: (amount: number) => void;
}

type FilterType = 'all' | 'pdf' | 'video';
type ViewMode = 'grid' | 'list';

// --- CONSTANTS ---
const STORAGE_KEY = 'app_library_recent';

const DEFAULT_MATERIALS: LearningMaterial[] = [
  { 
    id: 'm1', 
    title: 'LGS Çıkmış Sorular 2023', 
    type: 'pdf', 
    subject: 'LGS Hazırlık', 
    pages: 24,
    description: '2023 yılı LGS matematik soruları ve çözümleri'
  },
  { 
    id: 'm2', 
    title: 'Üçgenlerde Benzerlik', 
    type: 'video', 
    subject: 'Geometri', 
    duration: '14:20', 
    thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=300',
    description: 'Benzer üçgenlerin özellikleri ve problem çözümleri'
  },
  { 
    id: 'm3', 
    title: 'Kareköklü Sayılar Özeti', 
    type: 'pdf', 
    subject: 'Matematik', 
    pages: 5,
    description: 'Kareköklü sayıların temel özellikleri ve işlemleri'
  },
  { 
    id: 'm4', 
    title: 'Veri Analizi Giriş', 
    type: 'video', 
    subject: 'Matematik', 
    duration: '08:45', 
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=300',
    description: 'Ortalama, medyan, mod kavramları'
  },
  { 
    id: 'm5', 
    title: 'Üslü İfadeler Formülleri', 
    type: 'pdf', 
    subject: 'Matematik', 
    pages: 8,
    description: 'Üslü ifadelerle ilgili tüm formüller ve örnekler'
  },
  { 
    id: 'm6', 
    title: 'Denklem Çözümleri', 
    type: 'video', 
    subject: 'Cebir', 
    duration: '18:30', 
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=300',
    description: '1. ve 2. dereceden denklem çözüm teknikleri'
  },
];

// --- STORAGE HELPERS ---
const getRecentlyViewed = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return [];
};

const addToRecentlyViewed = (materialId: string): void => {
  try {
    let recent = getRecentlyViewed();
    recent = [materialId, ...recent.filter(id => id !== materialId)].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch (e) {}
};

// --- VIDEO PLAYER MODAL ---
interface VideoPlayerModalProps {
  material: LearningMaterial;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = memo(({ material, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Parse duration to seconds
  const totalSeconds = useMemo(() => {
    if (!material.duration) return 0;
    const [mins, secs] = material.duration.split(':').map(Number);
    return mins * 60 + secs;
  }, [material.duration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate playback
  React.useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= totalSeconds) {
          setIsPlaying(false);
          return totalSeconds;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, totalSeconds]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Video Area */}
        <div className="relative aspect-video bg-black">
          {material.thumbnail ? (
            <img 
              src={material.thumbnail} 
              alt={material.title}
              className={`w-full h-full object-cover transition-opacity ${isPlaying ? 'opacity-50' : 'opacity-100'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
              <Play className="w-20 h-20 text-white/50" />
            </div>
          )}
          
          {/* Play/Pause Overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {!isPlaying && (
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
              </div>
            )}
            {isPlaying && (
              <div className="text-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                  <div className="flex gap-1">
                    <div className="w-2 h-8 bg-white rounded" />
                    <div className="w-2 h-8 bg-white rounded" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-3 text-white text-sm">
              <span className="font-mono">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${(currentTime / totalSeconds) * 100}%` }}
                />
              </div>
              <span className="font-mono">{material.duration}</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-6 bg-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{material.title}</h3>
              <p className="text-slate-400 text-sm">{material.subject}</p>
              {material.description && (
                <p className="text-slate-300 text-sm mt-3">{material.description}</p>
              )}
            </div>
            <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
              Video
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoPlayerModal.displayName = 'VideoPlayerModal';

// --- PDF VIEWER MODAL ---
interface PdfViewerModalProps {
  material: LearningMaterial;
  onClose: () => void;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = memo(({ material, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = material.pages || 1;

  const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800">{material.title}</h3>
            <p className="text-sm text-slate-500">{material.subject}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"
              title="İndir"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"
              title="Yeni sekmede aç"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Content (Mock) */}
        <div className="flex-1 overflow-auto p-8 bg-slate-100">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 min-h-[600px]">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {material.title}
              </h2>
              <p className="text-slate-500">
                Sayfa {currentPage} / {totalPages}
              </p>
            </div>
            
            <div className="space-y-4 text-slate-600">
              <p>
                Bu bir PDF önizlemesidir. Gerçek uygulamada burada PDF içeriği görüntülenecektir.
              </p>
              {material.description && (
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm font-medium text-indigo-800">
                    📝 {material.description}
                  </p>
                </div>
              )}
              <div className="border-t border-slate-200 pt-4 mt-8">
                <p className="text-xs text-slate-400">
                  💡 İpucu: PDF dosyasını indirmek için sağ üstteki indirme butonunu kullanabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Navigation */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Önceki
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {page}
              </button>
            ))}
            {totalPages > 5 && (
              <span className="text-slate-400">...</span>
            )}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sonraki
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

PdfViewerModal.displayName = 'PdfViewerModal';

// --- MATERIAL CARD ---
interface MaterialCardProps {
  material: LearningMaterial;
  onClick: () => void;
  isRecent?: boolean;
}

const MaterialCard: React.FC<MaterialCardProps> = memo(({ material, onClick, isRecent }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
  >
    {/* Thumbnail */}
    <div className="aspect-video bg-slate-100 relative overflow-hidden">
      {material.type === 'video' ? (
        <>
          {material.thumbnail ? (
            <img 
              src={material.thumbnail} 
              alt={material.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
              <Play className="w-12 h-12 text-white/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
              <Play fill="currentColor" className="ml-1 w-5 h-5" />
            </div>
          </div>
          {material.duration && (
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {material.duration}
            </span>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <FileText size={48} className="text-red-400" />
          {material.pages && (
            <span className="text-xs text-red-500 mt-1 font-medium">
              {material.pages} sayfa
            </span>
          )}
        </div>
      )}
      
      {/* Recent Badge */}
      {isRecent && (
        <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Son görüntülenen
        </span>
      )}
    </div>

    {/* Content */}
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
          {material.subject}
        </span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
          material.type === 'video' 
            ? 'bg-purple-100 text-purple-600'
            : 'bg-red-100 text-red-600'
        }`}>
          {material.type === 'video' ? 'Video' : 'PDF'}
        </span>
      </div>
      <h3 className="font-bold text-slate-800 leading-tight mb-2 group-hover:text-indigo-700 transition-colors">
        {material.title}
      </h3>
      {material.description && (
        <p className="text-xs text-slate-500 line-clamp-2">
          {material.description}
        </p>
      )}
    </div>
  </div>
));

MaterialCard.displayName = 'MaterialCard';

// --- MAIN LIBRARY COMPONENT ---
export const LibraryTab: React.FC<LibraryTabProps> = memo(({ materials: propMaterials, onXpGain }) => {
  const materials = propMaterials || DEFAULT_MATERIALS;
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
  const [recentIds] = useState<string[]>(() => getRecentlyViewed());

  const filteredMaterials = useMemo(() => {
    if (filter === 'all') return materials;
    return materials.filter(m => m.type === filter);
  }, [materials, filter]);

  const handleMaterialClick = useCallback((material: LearningMaterial) => {
    setSelectedMaterial(material);
    addToRecentlyViewed(material.id);
    onXpGain?.(10); // Gain XP for viewing content
  }, [onXpGain]);

  const handleCloseModal = useCallback(() => {
    setSelectedMaterial(null);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {[
            { id: 'all' as FilterType, label: 'Tümü' },
            { id: 'pdf' as FilterType, label: 'PDF Dokümanlar' },
            { id: 'video' as FilterType, label: 'Video Dersler' },
          ].map((option) => (
            <button 
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === option.id 
                  ? 'bg-[#1C2A5E] text-white' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {filteredMaterials.length} içerik
          </span>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Materials Grid/List */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <EmptyState 
            type="videos" 
            title={filter === 'all' ? 'İçerik bulunamadı' : filter === 'pdf' ? 'PDF bulunamadı' : 'Video bulunamadı'}
          />
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredMaterials.map(material => (
            <MaterialCard 
              key={material.id} 
              material={material} 
              onClick={() => handleMaterialClick(material)}
              isRecent={recentIds.includes(material.id)}
            />
          ))}
        </div>
      )}

      {/* Tip */}
      <p className="text-xs text-center text-slate-400">
        💡 Her içeriği görüntülemek +10 XP kazandırır!
      </p>

      {/* Modal Viewers */}
      {selectedMaterial && selectedMaterial.type === 'video' && (
        <VideoPlayerModal 
          material={selectedMaterial} 
          onClose={handleCloseModal} 
        />
      )}
      {selectedMaterial && selectedMaterial.type === 'pdf' && (
        <PdfViewerModal 
          material={selectedMaterial} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
});

LibraryTab.displayName = 'LibraryTab';

export default LibraryTab;
