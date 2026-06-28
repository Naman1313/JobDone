"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ArrowLeft, X, Clock, MapPin, Briefcase, User } from 'lucide-react';
import api from '@/lib/api';

interface SearchOverlayProps {
  onClose: () => void;
  initialQuery?: string;
}

export default function SearchOverlay({ onClose, initialQuery = "" }: SearchOverlayProps) {
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState<string[]>([]);
  const [results, setResults] = useState<{users: any[], jobs: any[], posts: any[]}>({ users: [], jobs: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce helper
  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setResults({ users: [], jobs: [], posts: [] });
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.data?.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
    
    // Fetch history
    api.get('/api/search/history').then(res => {
      if (res.data?.success) setHistory(res.data.data);
    }).catch(console.error);

    if (initialQuery) {
      debouncedSearch(initialQuery);
    }
  }, [initialQuery, debouncedSearch]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQ = e.target.value;
    setQuery(newQ);
    debouncedSearch(newQ);
  };

  const handleHistoryClick = (q: string) => {
    setQuery(q);
    debouncedSearch(q);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search professionals, jobs, posts..."
            className="w-full bg-transparent border-none outline-none text-gray-800 text-sm"
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults({ users: [], jobs: [], posts: [] }); }} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4">
        {loading ? (
          <div className="flex justify-center p-8 text-gray-400">Searching...</div>
        ) : !query ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Recent Searches</h3>
            {history.length > 0 ? history.map((h, i) => (
              <div key={i} onClick={() => handleHistoryClick(h)} className="flex items-center gap-3 py-3 text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg px-2">
                <Clock size={16} className="text-gray-400" />
                <span className="flex-1 text-sm">{h}</span>
                <button className="text-gray-400 p-1"><X size={14} /></button>
              </div>
            )) : <p className="text-sm text-gray-400">No recent searches.</p>}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Users */}
            {results.users.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Professionals</h3>
                <div className="space-y-3">
                  {results.users.map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-primary/30">
                      <img src={u.profile?.avatarUrl || "https://randomuser.me/api/portraits/lego/1.jpg"} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{u.profile?.firstName} {u.profile?.lastName}</p>
                        <p className="text-xs text-gray-500">{u.profile?.trades}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Jobs */}
            {results.jobs.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Jobs</h3>
                <div className="space-y-3">
                  {results.jobs.map((j: any) => (
                    <div key={j.id} className="flex flex-col p-3 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-primary/30">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-gray-900">{j.title}</h4>
                        <span className="text-xs font-bold text-primary">${j.budget}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">{j.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {results.users.length === 0 && results.jobs.length === 0 && results.posts.length === 0 && (
              <div className="text-center p-8">
                <Search size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No results found for "{query}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple debounce function
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
