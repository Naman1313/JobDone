"use client";

import { useEffect, useState } from 'react';
import { ChevronLeft, Search, Building2, MapPin, Users, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CompanyDirectoryPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Top Employers', 'Startups', 'MSME', 'Hiring Now'];

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('/api/discover/companies');
        const data = await res.json();
        
        if (data && data.length > 0) {
          setCompanies(data);
        } else {
          // Fallback mock data if DB is empty
          setCompanies([
            { id: '1', name: 'Tech Mahindra', industry: 'Information Technology', location: 'Pune, Maharashtra', isVerified: true, logoUrl: 'https://logo.clearbit.com/techmahindra.com', description: 'Leading provider of digital transformation, consulting and business re-engineering services.' },
            { id: '2', name: 'Urban Company', industry: 'Home Services', location: 'Gurugram, Haryana', isVerified: true, logoUrl: 'https://logo.clearbit.com/urbancompany.com', description: 'Asia\'s largest home services platform delivering trusted services at home.' },
            { id: '3', name: 'Larsen & Toubro', industry: 'Construction', location: 'Mumbai, Maharashtra', isVerified: true, logoUrl: 'https://logo.clearbit.com/larsentoubro.com', description: 'Indian multinational conglomerate with business interests in engineering, construction, and manufacturing.' },
            { id: '4', name: 'Zomato', industry: 'Food Delivery Startup', location: 'Gurugram, Haryana', isVerified: true, logoUrl: 'https://logo.clearbit.com/zomato.com', description: 'Indian multinational restaurant aggregator and food delivery company.' },
            { id: '5', name: 'Sharma Electricals', industry: 'MSME', location: 'Delhi, India', isVerified: false, logoUrl: '', description: 'Local electrical contractors providing commercial and residential wiring services.' },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch companies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-700">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Companies</h1>
        </div>
        <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-700">
          <Search size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar border-b border-gray-100 shadow-sm">
        {tabs.map((tab, i) => (
          <button 
            key={i} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-primary text-white shadow-sm' : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Directory List */}
      <main className="p-4 space-y-4">
        {loading ? (
          // Skeleton loaders
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
              <div className="flex gap-4 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-100 rounded-xl mt-3"></div>
            </div>
          ))
        ) : companies.filter(c => activeTab === 'All' || c.industry?.toLowerCase().includes(activeTab.toLowerCase()) || (activeTab === 'Startups' && c.industry?.includes('Startup')) || (activeTab === 'MSME' && c.industry === 'MSME')).length > 0 ? (
          companies.filter(c => activeTab === 'All' || c.industry?.toLowerCase().includes(activeTab.toLowerCase()) || (activeTab === 'Startups' && c.industry?.includes('Startup')) || (activeTab === 'MSME' && c.industry === 'MSME')).map((company) => (
            <div key={company.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center flex-shrink-0 border border-purple-100">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Building2 className="text-purple-500" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                    {company.name}
                    {company.isVerified && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">Verified</span>}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {company.location || 'India'}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {company.industry || 'Technology'}</span>
                  </div>
                  {company.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{company.description}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/discover/companies/${company.id}`} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 text-sm font-bold h-10 rounded-xl flex items-center justify-center transition-colors">
                  View Profile
                </Link>
                <button className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-bold h-10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-purple-600 group-hover:text-white">
                  See Open Jobs <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No companies found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or search criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
