// src/app/components/ImageUpload.tsx
import React, { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  existingUrl?: string;
  folder?: string;
  aspectRatio?: 'square' | 'cover' | 'free';
  className?: string;
  buttonText?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  onUploadError,
  existingUrl,
  folder = 'uploads',
  aspectRatio = 'square',
  className = '',
  buttonText = 'Upload Image',
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(existingUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Please select an image file');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.('Image must be less than 5MB');
      return;
    }

    // Show local preview
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // Upload to Firebase Storage
    setUploading(true);
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(percent);
      },
      (error) => {
        console.error('Upload error:', error);
        onUploadError?.('Failed to upload image');
        setUploading(false);
        setPreview(existingUrl || '');
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setPreview(downloadUrl);
        onUploadComplete(downloadUrl);
        setUploading(false);
        setProgress(0);
      }
    );
  };

  const removeImage = () => {
    setPreview('');
    onUploadComplete('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'cover' ? 'h-32' : '';

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {preview ? (
        <div className={`relative ${aspectClass} rounded-xl overflow-hidden bg-gray-100`}>
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          {!uploading && (
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
              <Loader2 size={24} className="animate-spin mb-1" />
              <span className="text-xs">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-primary hover:bg-gray-100 transition-colors ${aspectClass || 'h-32'}`}
        >
          {uploading ? (
            <Loader2 size={24} className="animate-spin text-gray-400" />
          ) : (
            <>
              <Camera size={24} className="text-gray-400" />
              <span className="text-xs text-gray-500">{buttonText}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};