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

      const res = await fetch('http://localhost:5000/api/posts', {
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
    <div className="max-w-md mx-auto min-h-screen bg-white">
      <header className="p-4 flex items-center justify-between border-b sticky top-0 bg-white z-10">
        <Link href="/home" className="text-gray-500 hover:text-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold">New Post</h1>
        <button 
          onClick={handleSubmit}
          disabled={!content.trim() || loading}
          className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors ${
            !content.trim() || loading 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </header>

      <main className="p-4 flex flex-col h-[calc(100vh-140px)]">
        <div className="flex space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
             <div className="w-full h-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">You</div>
          </div>
          <div className="flex-1">
            <select 
              className="mb-2 text-sm text-orange-600 font-bold outline-none bg-orange-50 px-2 py-1 rounded-md"
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
              className="w-full resize-none outline-none text-lg text-gray-800 placeholder-gray-400 min-h-[150px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
        
        <input 
          type="text"
          placeholder="Add hashtags (e.g. #plumbing #fix)"
          className="w-full outline-none text-sm text-orange-500 placeholder-gray-400 mb-4 px-2"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
        />

        <div className="mt-auto border-t pt-4">
          <label className="flex items-center space-x-2 text-orange-500 font-bold p-2 hover:bg-orange-50 rounded-xl w-full justify-center transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Add Photo / Video</span>
            <input 
              type="file" 
              multiple 
              accept="image/*,video/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
          {files.length > 0 && (
            <div className="flex space-x-2 mt-2 overflow-x-auto hide-scrollbar pb-2">
              {files.map((file, i) => (
                <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <p className="text-center text-xs text-gray-400 mt-2">Media will be uploaded securely</p>
        </div>
      </main>
    </div>
  );
}
