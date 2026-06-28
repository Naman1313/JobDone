"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { ArrowLeft, Search, Filter, BookmarkMinus, MoreVertical, CheckSquare, Square, Trash2, Folder, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SavedContentHub() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  useEffect(() => {
    api.get('/api/saved')
      .then(res => {
        if (res.data?.success) {
          // Dummy data for presentation if DB is empty, otherwise use real data
          if (res.data.data.length === 0) {
            setItems([
              { id: '1', itemType: 'JOB', itemId: 'j1', collection: 'Plumbing Jobs', createdAt: new Date().toISOString() },
              { id: '2', itemType: 'USER', itemId: 'u1', collection: 'Electricians', createdAt: new Date().toISOString() },
              { id: '3', itemType: 'POST', itemId: 'p1', collection: 'General', createdAt: new Date().toISOString() },
            ]);
          } else {
            setItems(res.data.data);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  const handleDelete = async () => {
    if (selected.size === 0) return;
    try {
      await api.delete('/api/saved', { data: { ids: Array.from(selected) } });
      setItems(items.filter(i => !selected.has(i.id)));
      setSelected(new Set());
      setIsSelectMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white px-4 py-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
              <ArrowLeft size={24} className="text-gray-800" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Saved Items</h1>
          </div>
          <button 
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (isSelectMode) setSelected(new Set());
            }}
            className={`text-sm font-bold ${isSelectMode ? 'text-primary' : 'text-gray-600'}`}
          >
            {isSelectMode ? 'Cancel' : 'Select'}
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search saved items..." className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full" />
          </div>
          <button className="bg-gray-100 p-2.5 rounded-xl flex items-center justify-center">
            <Filter size={20} className="text-gray-600" />
          </button>
        </div>
      </header>

      {/* Floating Action Bar (Select Mode) */}
      <AnimatePresence>
        {isSelectMode && selected.size > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 bg-gray-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-xl z-40"
          >
            <span className="font-medium text-sm">{selected.size} selected</span>
            <div className="flex gap-4">
              <button className="flex items-center gap-1 text-sm hover:text-gray-300">
                <Folder size={18} /> Move
              </button>
              <button onClick={handleDelete} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 font-bold">
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-500 flex flex-col items-center">
            <BookmarkMinus size={48} className="mb-4 opacity-50" />
            <p>Your saved items will appear here.</p>
          </div>
        ) : (
          items.map(item => (
            <motion.div 
              layout
              key={item.id}
              onClick={() => isSelectMode ? toggleSelect(item.id) : null}
              className={`bg-white p-4 rounded-2xl border ${selected.has(item.id) ? 'border-primary ring-1 ring-primary' : 'border-gray-100'} shadow-sm flex items-start gap-4 transition-all ${isSelectMode ? 'cursor-pointer active:scale-95' : ''}`}
            >
              {isSelectMode && (
                <div className="mt-1 flex-shrink-0">
                  {selected.has(item.id) ? (
                    <CheckSquare size={20} className="text-primary" />
                  ) : (
                    <Square size={20} className="text-gray-300" />
                  )}
                </div>
              )}
              
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                {/* Placeholder image based on type */}
                <span className="text-2xs font-bold text-gray-400">{item.itemType}</span>
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm mb-1">Saved {item.itemType} Example</h4>
                <p className="text-xs text-gray-500 mb-2">Collection: {item.collection}</p>
                <p className="text-[10px] text-gray-400">Saved on {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
              
              {!isSelectMode && (
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={20} />
                </button>
              )}
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
}
