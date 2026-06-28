"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, MapPin, Tag, Loader2 } from 'lucide-react';
import { useActionMenu } from '@/providers/ActionMenuProvider';
import api from '@/lib/api';

export default function CreatePostModal() {
  const { isShareWorkOpen, setShareWorkOpen } = useActionMenu();
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [trade, setTrade] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drafts
  useEffect(() => {
    if (isShareWorkOpen) {
      const draft = localStorage.getItem('post_draft_content');
      if (draft) setContent(draft);
    }
  }, [isShareWorkOpen]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    localStorage.setItem('post_draft_content', e.target.value);
  };

  if (!isShareWorkOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && files.length === 0) return;
    
    setIsUploading(true);
    try {
      const mediaUrls: string[] = [];

      // 1. Upload files
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          mediaUrls.push(data.url);
        }
      }

      // 2. Create Post
      const postRes = await api.post('/api/posts/create', {
        content,
        mediaUrls,
        location,
        trade
      });

      if (postRes.data.success) {
        // Success cleanup
        localStorage.removeItem('post_draft_content');
        setContent("");
        setFiles([]);
        setPreviews([]);
        setShareWorkOpen(false);
        // Force refresh feed (simplest way without global state management for feed)
        window.location.reload(); 
      }
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status !== 401) {
        alert('Failed to post. Try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex flex-col justify-end sm:justify-center sm:items-center animate-in fade-in">
      <div className="bg-white w-full sm:max-w-lg h-[90vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button onClick={() => setShareWorkOpen(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
            <X size={20} />
          </button>
          <h2 className="font-bold text-gray-900">Share Work</h2>
          <button 
            onClick={handlePost}
            disabled={isUploading || (!content.trim() && files.length === 0)}
            className="px-4 py-1.5 bg-primary text-white font-semibold rounded-full disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading && <Loader2 size={16} className="animate-spin" />}
            Post
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          <div className="flex gap-3 mb-4">
            <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0" />
            <textarea
              placeholder="What are you working on?"
              className="w-full resize-none border-none focus:ring-0 text-gray-800 text-lg pt-1 placeholder:text-gray-400 min-h-[120px]"
              value={content}
              onChange={handleContentChange}
            />
          </div>

          {/* Media Previews */}
          {previews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
              {previews.map((src, i) => (
                <div key={i} className="relative w-32 h-32 shrink-0 rounded-xl overflow-hidden border border-gray-200">
                  <img src={src} className="w-full h-full object-cover" />
                  <button onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Metadata Inputs */}
          <div className="mt-auto border-t border-gray-100 pt-4 space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl">
              <MapPin size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Add location (e.g. Downtown)" 
                className="bg-transparent border-none focus:ring-0 text-sm w-full text-gray-700"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl">
              <Tag size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Tag a trade (e.g. Electrician)" 
                className="bg-transparent border-none focus:ring-0 text-sm w-full text-gray-700"
                value={trade}
                onChange={e => setTrade(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-t border-gray-100 flex items-center gap-4 bg-white pb-safe">
          <button onClick={() => fileInputRef.current?.click()} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors flex items-center gap-2">
            <ImageIcon size={24} />
            <span className="font-semibold text-sm">Add Media</span>
          </button>
          <input 
            type="file" 
            multiple 
            accept="image/*,video/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
        </div>

      </div>
    </div>
  );
}
