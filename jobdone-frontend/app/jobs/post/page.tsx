"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PostJob() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    trade: '',
    description: '',
    budget: '',
    urgency: 'medium',
    expiryDays: '7',
  });
  
  // Hardcoded location for MVP (Mumbai) - in a real app, use Geolocation API here
  const location = {
    coordinates: [72.8777, 19.0760],
    address: 'Mumbai, Maharashtra'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        ...formData,
        budget: Number(formData.budget),
        coordinates: location.coordinates,
        address: location.address,
      };

      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (data.success) {
        alert("Job posted successfully!");
        router.push('/jobs');
      } else {
        alert("Error: " + (data.message || 'Failed to post job'));
      }
    } catch (err) {
      alert("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white p-4 sticky top-0 z-10 shadow-sm border-b flex items-center">
        <Link href="/jobs" className="mr-4 text-gray-500 hover:text-gray-900 font-bold text-xl">
          &larr;
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-sm text-gray-500">Find a worker near you</p>
        </div>
      </header>

      {/* Form */}
      <main className="p-4 flex-1">
        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Job Title</label>
            <input 
              type="text" 
              name="title"
              required
              placeholder="e.g. Fix leaking pipe in kitchen"
              className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Trade Category</label>
            <select 
              name="trade"
              required
              className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.trade}
              onChange={handleChange}
            >
              <option value="">Select a trade...</option>
              <option value="plumber">Plumber</option>
              <option value="electrician">Electrician</option>
              <option value="carpenter">Carpenter</option>
              <option value="painter">Painter</option>
              <option value="mechanic">Mechanic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Budget (₹)</label>
            <input 
              type="number" 
              name="budget"
              required
              min="0"
              placeholder="e.g. 1500"
              className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.budget}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Urgency</label>
            <div className="flex space-x-2">
              {['low', 'medium', 'high', 'emergency'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: level })}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize border ${
                    formData.urgency === level 
                      ? level === 'emergency' ? 'bg-red-500 text-white border-red-500' : 'bg-orange-500 text-white border-orange-500' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Job Description</label>
            <textarea 
              name="description"
              required
              rows={4}
              placeholder="Describe the issue in detail..."
              className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-md transition-transform active:scale-95 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
          
        </form>
      </main>
    </div>
  );
}
