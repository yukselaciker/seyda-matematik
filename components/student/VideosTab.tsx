/**
 * VideosTab - Dynamic Video Library from localStorage
 * 
 * Features:
 * - Reads videos from localStorage ('app_videos')
 * - Shows friendly empty state if no videos
 * - Embedded YouTube player
 * - Teacher-uploaded videos appear here
 */

import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { Play, X, Video, Clock, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';
import EmptyState from './EmptyState';

// --- TYPES ---
export interface UploadedVideo {
  id: string;
  title: string;
  subject: 'Matematik' | 'Geometri' | 'LGS Hazırlık' | 'Diğer';
  youtubeUrl: string;
  description?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

interface VideosTabProps {
  onXpGain?: (amount: number) => void;
}

// --- STORAGE ---
const VIDEOS_STORAGE_KEY = 'app_videos';

const getStoredVideos = (): UploadedVideo[] => {
  try {
    const stored = localStorage.getItem(VIDEOS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load videos', e);
  }
  return [];
};

// Extract YouTube video ID from various URL formats
const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Already just an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  
  // Standard watch URL
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  
  // Embed URL
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  
  return null;
};

// --- VIDEO PLAYER MODAL ---
interface VideoPlayerModalProps {
  video: UploadedVideo;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = memo(({ video, onClose }) => {
  const videoId = getYoutubeVideoId(video.youtubeUrl);

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
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                <p className="text-slate-400">Video yüklenemedi</p>
                <p className="text-xs text-slate-500 mt-2">URL: {video.youtubeUrl}</p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="p-6 bg-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{video.title}</h3>
              <p className="text-slate-400 text-sm">{video.subject}</p>
              {video.description && (
                <p className="text-slate-300 text-sm mt-3">{video.description}</p>
              )}
            </div>
            <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
              Video
            </span>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(video.uploadedAt).toLocaleDateString('tr-TR')}
            </span>
            {video.uploadedBy && (
              <span>Yükleyen: {video.uploadedBy}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

VideoPlayerModal.displayName = 'VideoPlayerModal';

// --- VIDEO CARD ---
interface VideoCardProps {
  video: UploadedVideo;
  onClick: () => void;
}

const VideoCard: React.FC<VideoCardProps> = memo(({ video, onClick }) => {
  const videoId = getYoutubeVideoId(video.youtubeUrl);
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null;

  const subjectColors: Record<string, string> = {
    'Matematik': 'bg-blue-100 text-blue-700',
    'Geometri': 'bg-purple-100 text-purple-700',
    'LGS Hazırlık': 'bg-green-100 text-green-700',
    'Diğer': 'bg-slate-100 text-slate-700',
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-slate-100 relative overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={video.title} 
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
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${subjectColors[video.subject] || subjectColors['Diğer']}`}>
            {video.subject}
          </span>
          <span className="text-[10px] text-slate-400">
            {new Date(video.uploadedAt).toLocaleDateString('tr-TR')}
          </span>
        </div>
        <h3 className="font-bold text-slate-800 leading-tight mb-2 group-hover:text-indigo-700 transition-colors">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-xs text-slate-500 line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
});

VideoCard.displayName = 'VideoCard';

// --- MAIN COMPONENT ---
export const VideosTab: React.FC<VideosTabProps> = memo(({ onXpGain }) => {
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<UploadedVideo | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Load videos on mount and listen for changes
  useEffect(() => {
    setVideos(getStoredVideos());

    // Listen for storage changes (when teacher uploads)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === VIDEOS_STORAGE_KEY) {
        setVideos(getStoredVideos());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const refreshVideos = useCallback(() => {
    setVideos(getStoredVideos());
  }, []);

  const filteredVideos = useMemo(() => {
    if (filter === 'all') return videos;
    return videos.filter(v => v.subject === filter);
  }, [videos, filter]);

  const handleVideoClick = useCallback((video: UploadedVideo) => {
    setSelectedVideo(video);
    onXpGain?.(15); // Gain XP for watching video
  }, [onXpGain]);

  const handleCloseModal = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  const subjects = ['all', 'Matematik', 'Geometri', 'LGS Hazırlık', 'Diğer'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Video className="w-6 h-6 text-indigo-600" />
            Video Dersler
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Öğretmen tarafından yüklenen video dersler
          </p>
        </div>
        <button
          onClick={refreshVideos}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Yenile
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {subjects.map((subject) => (
          <button 
            key={subject}
            onClick={() => setFilter(subject)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === subject 
                ? 'bg-[#1C2A5E] text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {subject === 'all' ? 'Tümü' : subject}
          </button>
        ))}
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Henüz video yüklenmedi
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Öğretmeniniz yakında video dersler yükleyecek. Yeni videolar eklendiğinde burada görünecekler.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map(video => (
            <VideoCard 
              key={video.id} 
              video={video} 
              onClick={() => handleVideoClick(video)}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {videos.length > 0 && (
        <div className="flex justify-center gap-8 p-4 bg-slate-50 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{videos.length}</p>
            <p className="text-xs text-slate-500">Toplam Video</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {videos.filter(v => v.subject === 'Matematik').length}
            </p>
            <p className="text-xs text-slate-500">Matematik</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {videos.filter(v => v.subject === 'Geometri').length}
            </p>
            <p className="text-xs text-slate-500">Geometri</p>
          </div>
        </div>
      )}

      {/* Tip */}
      <p className="text-xs text-center text-slate-400">
        💡 Her video izlemek +15 XP kazandırır!
      </p>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal 
          video={selectedVideo} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
});

VideosTab.displayName = 'VideosTab';

export default VideosTab;




