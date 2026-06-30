"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [trade, setTrade] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('content', content);
      formData.append('trade', trade);
      
      const extractedHashtags = hashtags.split(' ').map(t => t.replace('#', '')).filter(Boolean);
      formData.append('hashtags', JSON.stringify(extractedHashtags));
      
      files.forEach(file => {
        formData.append('media', file);
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // Let fetch handle multipart/form-data boundary
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        router.push('/home');
      } else {
        alert(data.message || 'Failed to create post');
      }
    } catch (err) {
      alert("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto min-h-screen bg-surface-warm font-sans selection:bg-primary selection:text-white flex flex-col">
      <header className="w-full h-16 sticky top-0 z-40 bg-white/40 backdrop-blur-2xl saturate-150 flex justify-center items-center border-b border-white/60 shadow-[0_4px_30px_rgba(93,64,55,0.05)] transition-all">
        <div className="w-full max-w-7xl px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/home" className="text-on-surface hover:text-primary hover:bg-white/50 p-2.5 -ml-2 rounded-full transition-all active:scale-95 shadow-sm border border-transparent hover:border-white/60">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-[20px] font-bold text-primary tracking-tight drop-shadow-sm leading-tight">New Post</h1>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            className={`px-6 py-2 rounded-full font-label-md font-bold transition-all active:scale-[0.98] border ${
              !content.trim() || loading 
                ? 'bg-surface-variant text-on-surface-variant/40 border-transparent cursor-not-allowed' 
                : 'bg-primary text-on-primary border-white/10 hover:bg-primary-container shadow-[0_4px_12px_rgba(93,64,55,0.2)]'
            }`}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </header>

      <div className="w-full max-w-2xl mx-auto md:mt-8 bg-surface-container-lowest md:rounded-[32px] md:shadow-[0px_8px_32px_rgba(0,0,0,0.04)] md:border border-border-subtle/20 flex flex-col flex-1 pb-10">

        <main className="p-4 md:p-6 flex flex-col flex-1">
          <div className="flex space-x-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex-shrink-0 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
               You
            </div>
            
            <div className="flex-1 flex flex-col pt-1">
              <select 
                className="self-start mb-3 text-sm text-primary font-bold outline-none bg-surface-variant/40 border border-border-subtle/50 px-3 py-1.5 rounded-lg hover:bg-surface-variant/60 transition-colors cursor-pointer"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
              >
                <option value="">Public update</option>
                <option value="plumber">Plumber work</option>
                <option value="electrician">Electrician work</option>
                <option value="carpenter">Carpenter work</option>
              </select>
              
              <textarea
                autoFocus
                placeholder="What are you working on today?"
                className="w-full resize-none outline-none text-xl font-body-lg text-on-surface bg-transparent placeholder-on-surface-variant/50 min-h-[160px] leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
          
          <div className="ml-16 mb-6">
            <input 
              type="text"
              placeholder="Add hashtags (e.g. #plumbing #fix)"
              className="w-full outline-none font-body-md text-primary bg-transparent placeholder-on-surface-variant/40 px-1"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
            />
          </div>

          <div className="mt-auto pt-6 border-t border-border-subtle/40">
            <label className="flex flex-col items-center justify-center space-y-2 text-primary font-bold p-8 hover:bg-surface-variant/30 rounded-[24px] w-full transition-all cursor-pointer border-2 border-dashed border-outline-variant hover:border-primary group">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-lg">Add Photo / Video</span>
              <span className="text-sm font-normal text-on-surface-variant">Max size 5MB per file</span>
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
            
            {files.length > 0 && (
              <div className="flex space-x-3 mt-4 overflow-x-auto no-scrollbar pb-2 px-1">
                {files.map((file, i) => (
                  <div key={i} className="w-24 h-24 bg-surface-variant rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-border-subtle/50 relative group">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-center text-xs font-medium text-on-surface-variant/60 mt-4 flex items-center justify-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Media will be uploaded securely
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
