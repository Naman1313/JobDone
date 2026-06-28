"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { ArrowLeft, Plus, ExternalLink, Code, Loader2, Calendar, GripVertical } from 'lucide-react';
import { Reorder, motion } from 'framer-motion';

export default function PortfolioProjects() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/profile/projects')
      .then(res => {
        if (res.data?.success) setProjects(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleReorder = (newOrder: any[]) => {
    setProjects(newOrder);
    // In a real app, send the new order to the backend here
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white px-4 py-4 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Portfolio & Projects</h1>
        </div>
        <button 
          className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <Plus size={20} />
        </button>
      </header>

      <main className="p-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Plus size={40} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Build your Portfolio</h3>
            <p className="text-sm text-gray-500 mb-6">Add projects, case studies, or code repositories to showcase your skills.</p>
            <button className="px-6 py-3 bg-primary text-white font-bold rounded-full shadow-lg">
              Add First Project
            </button>
          </div>
        ) : (
          <Reorder.Group axis="y" values={projects} onReorder={handleReorder} className="space-y-4">
            {projects.map((project) => (
              <Reorder.Item key={project.id} value={project}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                  
                  {/* Image Header */}
                  <div className="h-40 w-full bg-gray-200 relative">
                    {project.mediaUrls && JSON.parse(project.mediaUrls).length > 0 ? (
                      <img src={JSON.parse(project.mediaUrls)[0]} alt="Project" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-gray-100 to-gray-200">
                        <GripVertical size={32} className="text-gray-300" />
                      </div>
                    )}
                    {project.isFeatured && (
                      <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                        Featured
                      </div>
                    )}
                    <div className="absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-sm rounded-lg text-white cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={16} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{project.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>
                    
                    {/* Tags */}
                    {project.techStack && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {JSON.parse(project.techStack).slice(0, 3).map((tech: string, i: number) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                      {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                          <ExternalLink size={16} /> Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-black">
                          <Code size={16} /> Source
                        </a>
                      )}
                    </div>
                  </div>

                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </main>
    </div>
  );
}
