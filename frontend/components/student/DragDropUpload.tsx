/**
 * DragDropUpload.tsx - Drag & Drop File Upload Component
 * 
 * Features:
 * - Large drop zone with dashed border
 * - Drag over highlight effect
 * - File type detection with icons
 * - Upload progress bar simulation
 * - File preview after selection
 * - Multiple file support
 */

import React, { memo, useState, useCallback, useRef } from 'react';
import { 
  UploadCloud, FileText, Image, File, X, 
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';

// --- TYPES ---
interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  preview?: string;
}

interface DragDropUploadProps {
  onUploadComplete?: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

// --- CONSTANTS ---
const FILE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'application/pdf': FileText,
  'image/jpeg': Image,
  'image/png': Image,
  'image/gif': Image,
  'image/webp': Image,
  default: File,
};

const getFileIcon = (type: string) => {
  return FILE_ICONS[type] || FILE_ICONS.default;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// --- DRAG DROP UPLOAD COMPONENT ---
export const DragDropUpload: React.FC<DragDropUploadProps> = memo(({
  onUploadComplete,
  maxFiles = 5,
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'],
  maxSizeMB = 10,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Desteklenmeyen dosya tipi: ' + file.type;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return 'Dosya cok buyuk. Maksimum: ' + maxSizeMB + ' MB';
    }
    return null;
  }, [acceptedTypes, maxSizeMB]);

  // Process files
  const processFiles = useCallback((fileList: FileList | File[]) => {
    setError(null);
    const newFiles: UploadedFile[] = [];
    const fileArray = Array.from(fileList);

    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      setError('Maksimum ' + maxFiles + ' dosya yukleyebilirsiniz');
      return;
    }

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      const uploadedFile: UploadedFile = {
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending',
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      newFiles.push(uploadedFile);
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, maxFiles, validateFile]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  // Simulate upload
  const simulateUpload = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    for (const uploadFile of pendingFiles) {
      // Set to uploading
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'uploading' as const } : f
      ));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress } : f
        ));
      }

      // Mark as success
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'success' as const, progress: 100 } : f
      ));
    }

    // Callback with uploaded files
    if (onUploadComplete) {
      onUploadComplete(pendingFiles.map(f => f.file));
    }
  }, [files, onUploadComplete]);

  // Clear all files
  const clearAllFiles = useCallback(() => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
    setError(null);
  }, [files]);

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const uploadingCount = files.filter(f => f.status === 'uploading').length;
  const successCount = files.filter(f => f.status === 'success').length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ' + (
          isDragOver
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
            : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className={'w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ' + (
          isDragOver ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'
        )}>
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className={'text-lg font-semibold mb-2 transition-colors ' + (
          isDragOver ? 'text-indigo-700' : 'text-slate-700'
        )}>
          {isDragOver ? 'Dosyalari birak!' : 'Dosyalari surukle veya tikla'}
        </h3>
        
        <p className="text-sm text-slate-500 mb-2">
          PDF, JPEG, PNG desteklenir
        </p>
        
        <p className="text-xs text-slate-400">
          Maksimum {maxSizeMB} MB, {maxFiles} dosya
        </p>

        {/* Animated border on drag */}
        {isDragOver && (
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-700">
              Secilen Dosyalar ({files.length})
            </h4>
            <button
              onClick={clearAllFiles}
              className="text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              Tumunu Temizle
            </button>
          </div>

          {files.map(uploadFile => {
            const FileIcon = getFileIcon(uploadFile.file.type);
            
            return (
              <div 
                key={uploadFile.id}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-shadow"
              >
                {/* Preview or Icon */}
                {uploadFile.preview ? (
                  <img 
                    src={uploadFile.preview} 
                    alt={uploadFile.file.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                    <FileIcon className="w-6 h-6 text-slate-500" />
                  </div>
                )}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{uploadFile.file.name}</p>
                  <p className="text-sm text-slate-500">{formatFileSize(uploadFile.file.size)}</p>
                  
                  {/* Progress Bar */}
                  {uploadFile.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                          style={{ width: uploadFile.progress + '%' }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{uploadFile.progress}% yukleniyor...</p>
                    </div>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {uploadFile.status === 'pending' && (
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  )}
                  {uploadFile.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Upload Button */}
          {pendingCount > 0 && uploadingCount === 0 && (
            <button
              onClick={simulateUpload}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-2">
                <UploadCloud className="w-5 h-5" />
                {pendingCount} Dosya Yukle
              </span>
            </button>
          )}

          {/* Success Message */}
          {successCount > 0 && pendingCount === 0 && uploadingCount === 0 && (
            <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{successCount} dosya basariyla yuklendi!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

DragDropUpload.displayName = 'DragDropUpload';

export default DragDropUpload;




