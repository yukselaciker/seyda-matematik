/**
 * VideoUploadTab - Teacher CMS for uploading video lessons
 * 
 * Features:
 * - Form to add video title, subject, YouTube URL
 * - Saves to localStorage ('app_videos')
 * - Preview of uploaded videos
 * - Delete functionality
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import { 
  Upload, Video, Play, Trash2, Plus, Link, BookOpen, 
  CheckCircle, AlertCircle, Eye, X
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

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

interface VideoUploadTabProps {
  teacherName?: string;
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

const saveVideos = (videos: UploadedVideo[]): void => {
  try {
    localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(videos));
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: VIDEOS_STORAGE_KEY,
      newValue: JSON.stringify(videos),
    }));
  } catch (e) {
    console.error('Failed to save videos', e);
  }
};

// Extract YouTube video ID
const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  
  return null;
};

// --- VIDEO PREVIEW CARD ---
interface VideoPreviewCardProps {
  video: UploadedVideo;
  onDelete: (id: string) => void;
  onPreview: (video: UploadedVideo) => void;
}

const VideoPreviewCard: React.FC<VideoPreviewCardProps> = memo(({ video, onDelete, onPreview }) => {
  const videoId = getYoutubeVideoId(video.youtubeUrl);
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="aspect-video bg-slate-100 relative">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={video.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
            <Video className="w-8 h-8 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onPreview(video)}
            className="p-2 bg-white rounded-full text-indigo-600 hover:bg-indigo-50 mr-2"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(video.id)}
            className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-3">
        <span className="text-[10px] font-bold text-indigo-600 uppercase">{video.subject}</span>
        <h4 className="font-semibold text-slate-800 text-sm mt-1 truncate">{video.title}</h4>
        <p className="text-[10px] text-slate-400 mt-1">
          {new Date(video.uploadedAt).toLocaleDateString('tr-TR')}
        </p>
      </div>
    </div>
  );
});

VideoPreviewCard.displayName = 'VideoPreviewCard';

// --- PREVIEW MODAL ---
interface PreviewModalProps {
  video: UploadedVideo;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = memo(({ video, onClose }) => {
  const videoId = getYoutubeVideoId(video.youtubeUrl);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-slate-800">{video.title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="aspect-video bg-black">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={video.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <p>Video önizleme kullanılamıyor</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PreviewModal.displayName = 'PreviewModal';

// --- MAIN COMPONENT ---
export const VideoUploadTab: React.FC<VideoUploadTabProps> = memo(({ teacherName = 'Şeyda Açıker' }) => {
  const { showToast } = useToast();
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [previewVideo, setPreviewVideo] = useState<UploadedVideo | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<UploadedVideo['subject']>('Matematik');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load videos on mount
  useEffect(() => {
    setVideos(getStoredVideos());
  }, []);

  // Validate YouTube URL
  const isValidYoutubeUrl = getYoutubeVideoId(youtubeUrl) !== null;
  const canSubmit = title.trim().length >= 3 && isValidYoutubeUrl;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;

    setIsSubmitting(true);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newVideo: UploadedVideo = {
      id: 'video_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      subject,
      youtubeUrl: youtubeUrl.trim(),
      description: description.trim() || undefined,
      uploadedAt: new Date().toISOString(),
      uploadedBy: teacherName,
    };

    const updatedVideos = [newVideo, ...videos];
    setVideos(updatedVideos);
    saveVideos(updatedVideos);

    // Reset form
    setTitle('');
    setYoutubeUrl('');
    setDescription('');
    setIsSubmitting(false);

    showToast('Video başarıyla yüklendi! 🎬', 'success');
  }, [canSubmit, title, subject, youtubeUrl, description, teacherName, videos, showToast]);

  const handleDelete = useCallback((videoId: string) => {
    const updatedVideos = videos.filter(v => v.id !== videoId);
    setVideos(updatedVideos);
    saveVideos(updatedVideos);
    showToast('Video silindi.', 'info');
  }, [videos, showToast]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 rounded-xl">
          <Upload className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Video Yükle</h2>
          <p className="text-slate-500 text-sm">Öğrencileriniz için video ders ekleyin</p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Video Başlığı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Üslü İfadeler - Konu Anlatımı"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Konu <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Matematik', 'Geometri', 'LGS Hazırlık', 'Diğer'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    subject === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  disabled={isSubmitting}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* YouTube URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              YouTube URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Link className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  youtubeUrl && !isValidYoutubeUrl 
                    ? 'border-red-300 bg-red-50' 
                    : youtubeUrl && isValidYoutubeUrl
                      ? 'border-green-300 bg-green-50'
                      : 'border-slate-300'
                }`}
                disabled={isSubmitting}
              />
              {youtubeUrl && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {isValidYoutubeUrl ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {youtubeUrl && !isValidYoutubeUrl && (
              <p className="mt-1 text-xs text-red-500">Geçerli bir YouTube URL'si girin</p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Desteklenen formatlar: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video hakkında kısa bir açıklama..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Video Ekle
              </>
            )}
          </button>
        </form>
      </div>

      {/* Uploaded Videos Library */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-indigo-600" />
          Yüklü Videolar (Library)
          {videos.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {videos.length}
            </span>
          )}
        </h3>
        
        {videos.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-8 text-center">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Henüz video yüklenmedi</p>
            <p className="text-xs text-slate-400 mt-1">Yukarıdaki formu kullanarak video ekleyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map(video => (
              <VideoPreviewCard
                key={video.id}
                video={video}
                onDelete={handleDelete}
                onPreview={setPreviewVideo}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewVideo && (
        <PreviewModal video={previewVideo} onClose={() => setPreviewVideo(null)} />
      )}
    </div>
  );
});

VideoUploadTab.displayName = 'VideoUploadTab';

export default VideoUploadTab;

