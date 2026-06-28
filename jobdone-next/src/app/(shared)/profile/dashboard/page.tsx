"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { ArrowLeft, Users, Eye, Search, Briefcase, TrendingUp, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfessionalDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    if (user) {
      setLoading(true);
      api.get(`/api/profile/analytics?timeframe=${timeframe}`)
        .then(res => {
          if (res.data?.success) setData(res.data.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, timeframe]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header */}
      <header className="bg-white px-4 py-4 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        </div>
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          className="text-sm border-none bg-gray-100 rounded-lg px-3 py-1.5 text-gray-700 focus:ring-0 cursor-pointer"
        >
          <option value="7d">Past 7 days</option>
          <option value="30d">Past 30 days</option>
          <option value="90d">Past 90 days</option>
        </select>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <main className="p-4 space-y-4">
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard 
              icon={<Eye className="text-blue-500" size={24} />} 
              title="Profile Views" 
              value={data?.profileViews || 0} 
              trend="+12%" 
            />
            <MetricCard 
              icon={<Search className="text-green-500" size={24} />} 
              title="Search Appearances" 
              value={data?.searchAppearances || 0} 
              trend="+5%" 
            />
            <MetricCard 
              icon={<Users className="text-purple-500" size={24} />} 
              title="Recruiter Views" 
              value={data?.recruiterViews || 0} 
              trend="+2" 
            />
            <MetricCard 
              icon={<Briefcase className="text-orange-500" size={24} />} 
              title="Job Applications" 
              value={data?.jobApplications || 0} 
              trend="-" 
            />
          </div>

          {/* Chart Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-gray-500" />
              Engagement Overview
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="views" name="Profile Views" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="searches" name="Searches" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </main>
      )}
    </div>
  );
}

function MetricCard({ icon, title, value, trend }: { icon: React.ReactNode, title: string, value: number, trend: string }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer active:scale-95">
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-gray-50 rounded-xl">
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
          {trend}
        </span>
      </div>
      <div>
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
      </div>
    </div>
  );
}
