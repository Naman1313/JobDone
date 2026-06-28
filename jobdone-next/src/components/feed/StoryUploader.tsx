"use client";

import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface StoryUploaderProps {
  onClose: () => void;
  onSuccess: (newStory: any) => void;
}

export default function StoryUploader({ onClose, onSuccess }: StoryUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      // 1. Upload to Cloudinary
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) throw new Error("Upload failed");

      // 2. Create Story in DB
      const storyRes = await api.post('/api/stories', {
        mediaUrl: uploadData.url,
        mediaType: uploadData.format === 'video' ? 'VIDEO' : 'IMAGE',
        caption: caption
      });

      if (storyRes.data.success) {
        onSuccess(storyRes.data.data);
      }
    } catch (error) {
      console.error("Story upload failed", error);
      alert("Failed to upload story. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10 bg-gradient-to-b from-black/50 to-transparent absolute top-0 w-full">
        <button onClick={onClose} className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md">
          <X size={24} />
        </button>
        <h2 className="text-white font-semibold">New Story</h2>
        <div className="w-10"></div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {preview ? (
          file?.type.startsWith('video/') ? (
            <video src={preview} autoPlay loop muted className="w-full h-full object-cover" />
          ) : (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          )
        ) : (
          <div className="flex flex-col gap-6 items-center">
            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform"
            >
              <Camera size={36} />
            </button>
            <p className="text-gray-400">Take a photo</p>
            
            <div className="w-full flex justify-center mt-8">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors"
              >
                <Upload size={20} /> Upload from Gallery
              </button>
            </div>
          </div>
        )}

        <input 
          type="file" 
          accept="image/*,video/*" 
          capture="environment" 
          ref={cameraInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
        />
        <input 
          type="file" 
          accept="image/*,video/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
        />
      </div>

      {/* Footer / Actions */}
      {preview && (
        <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-4">
          <input 
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full bg-black/40 border border-white/20 rounded-full px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-md text-sm shadow-lg"
          />
          <div className="flex justify-end">
            <button 
              onClick={handleUpload}
              disabled={uploading}
              className="px-8 py-3 bg-primary text-white font-bold rounded-full shadow-[0_4px_14px_0_rgba(255,87,34,0.39)] hover:bg-primary-hover hover:shadow-[0_6px_20px_rgba(255,87,34,0.23)] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <><Loader2 size={20} className="animate-spin" /> Sharing...</>
              ) : (
                "Share Story"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
