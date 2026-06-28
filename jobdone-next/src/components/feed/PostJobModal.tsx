"use client";

import { useState } from 'react';
import { X, Briefcase, MapPin, DollarSign, Calendar, Upload, Loader2, Globe } from 'lucide-react';
import { useActionMenu } from '@/providers/ActionMenuProvider';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function PostJobModal() {
  const { isPostJobOpen, setPostJobOpen } = useActionMenu();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    trade: "",
    description: "",
    budget: "",
    budgetType: "FIXED",
    location: "",
    isRemote: false,
    deadline: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isPostJobOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.trade) {
      alert("Please fill in the required fields (Title, Description, Trade).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/api/jobs/create', formData);
      if (res.data.success) {
        setPostJobOpen(false);
        // Optionally redirect to jobs tab
        router.push('/jobs');
      } else {
        throw new Error(res.data.message || "Failed to create job");
      }
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status !== 401) {
        alert("Failed to post job. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex flex-col justify-end sm:justify-center sm:items-center animate-in fade-in">
      <div className="bg-white w-full sm:max-w-lg h-[90vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <button onClick={() => setPostJobOpen(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
            <X size={20} />
          </button>
          <h2 className="font-bold text-gray-900 text-lg">Post a Job</h2>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-24">
          <form id="post-job-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Job Title *</label>
              <input 
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Need a Master Plumber for kitchen remodel"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                required
              />
            </div>

            {/* Trade Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category / Trade *</label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <select 
                  name="trade"
                  value={formData.trade}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
                  required
                >
                  <option value="" disabled>Select trade category</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Landscaping">Landscaping</option>
                  <option value="Painting">Painting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job in detail..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[120px] resize-none"
                required
              />
            </div>

            {/* Budget */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Budget</label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Budget Type</label>
                <select 
                  name="budgetType"
                  value={formData.budgetType}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
                >
                  <option value="FIXED">Fixed Price</option>
                  <option value="HOURLY">Hourly Rate</option>
                </select>
              </div>
            </div>

            {/* Location & Remote */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="isRemote"
                  checked={formData.isRemote}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex items-center gap-1"><Globe size={16}/> This is a remote/consulting job</span>
              </label>

              {!formData.isRemote && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-3.5 text-gray-400" />
                    <input 
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. 123 Main St, New York, NY"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deadline</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input 
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-700"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white pb-safe shrink-0 mt-auto">
          <button 
            type="submit"
            form="post-job-form"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-hover active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Publishing...</> : 'Publish Job'}
          </button>
        </div>

      </div>
    </div>
  );
}
