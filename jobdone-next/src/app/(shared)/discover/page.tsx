"use client";

import { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, ArrowRight, Briefcase, Users, Building2, GraduationCap, ChevronRight, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const CATEGORIES = [
  { id: 'electrician', label: 'Electrician', icon: '⚡' },
  { id: 'plumber', label: 'Plumber', icon: '🔧' },
  { id: 'carpenter', label: 'Carpenter', icon: '🪵' },
  { id: 'painter', label: 'Painter', icon: '🎨' },
  { id: 'mechanic', label: 'Mechanic', icon: '⚙️' },
  { id: 'driver', label: 'Driver', icon: '🚗' },
  { id: 'cook', label: 'Cook', icon: '🍳' },
  { id: 'developer', label: 'Developer', icon: '💻' },
];

const TRENDING_SEARCHES = ['AC Repair', 'Construction Job', 'Civil Engineer in Delhi', 'Driver Needed'];

import { useRouter } from 'next/navigation';

export default function DiscoverPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter States
  const [selectedDistance, setSelectedDistance] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleToggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleApplyFilters = () => {
    // In a real app we'd stringify these params and push to the router or fetch results directly
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedDistance) params.set('distance', selectedDistance);
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
    if (minBudget) params.set('min', minBudget);
    if (maxBudget) params.set('max', maxBudget);
    if (verifiedOnly) params.set('verified', 'true');
    
    // For now we'll just log them and close the sheet if we had programmatic control, 
    // but the sheet will close automatically if we used a controlled state. 
    // Here we can navigate to search results:
    // router.push(`/discover/search?${params.toString()}`);
    console.log("Applying filters:", params.toString());
    alert("Filters Applied! Check console for URL params.");
  };

  const handleResetFilters = () => {
    setSelectedDistance(null);
    setSelectedCategories([]);
    setSelectedTypes([]);
    setMinBudget('');
    setMaxBudget('');
    setVerifiedOnly(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header & Search Area */}
      <div className="bg-white px-4 pt-6 pb-4 rounded-b-3xl shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-4">
          Discover
        </h1>
        
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
            <Input 
              placeholder="Search professionals, jobs, skills..." 
              className="pl-10 pr-4 h-12 rounded-2xl bg-gray-100/80 border-transparent focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Sheet>
            <SheetTrigger className="w-12 h-12 bg-gray-100/80 hover:bg-gray-200 text-gray-700 rounded-2xl flex items-center justify-center transition-colors">
              <Filter size={20} />
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 flex flex-col bg-white">
              <SheetHeader className="p-4 border-b border-gray-100 flex-row justify-between items-center space-y-0 text-left">
                <SheetTitle className="text-xl font-bold">Advanced Filters</SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Distance */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Distance & Location</h4>
                  <div className="flex flex-wrap gap-2">
                    {['2 km', '5 km', '10 km', '25 km', 'Anywhere'].map(d => (
                      <button 
                        key={d} 
                        onClick={() => setSelectedDistance(d === selectedDistance ? null : d)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                          selectedDistance === d 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Trade & Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Electrician', 'Plumber', 'Developer', 'Cook', 'Driver', 'Mechanic', 'Architect'].map(c => (
                      <button 
                        key={c} 
                        onClick={() => handleToggleCategory(c)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                          selectedCategories.includes(c)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Job Types */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Opportunity Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Full Time', 'Part Time', 'Freelance', 'Remote', 'Government', 'Urgent Hiring'].map(t => (
                      <button 
                        key={t}
                        onClick={() => handleToggleType(t)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                          selectedTypes.includes(t)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget / Salary */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Budget / Salary (₹)</h4>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Min" 
                      type="number" 
                      className="bg-gray-50 rounded-xl border-transparent focus:bg-white" 
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                    />
                    <span className="text-gray-400">-</span>
                    <Input 
                      placeholder="Max" 
                      type="number" 
                      className="bg-gray-50 rounded-xl border-transparent focus:bg-white" 
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                    />
                  </div>
                </div>

                {/* Verified Only */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Verified Only</h4>
                    <p className="text-xs text-gray-500">Show only verified professionals and companies</p>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${verifiedOnly ? 'bg-primary' : 'bg-gray-200'}`}
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${verifiedOnly ? 'left-[26px]' : 'left-0.5'}`}></div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex gap-3 bg-white">
                <button 
                  onClick={handleResetFilters}
                  className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button 
                  onClick={handleApplyFilters}
                  className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-colors shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Trending Searches Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {TRENDING_SEARCHES.map((term, i) => (
            <button key={i} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1">
              <Search size={10} className="text-gray-400" />
              {term}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-6 space-y-8">
        
        {/* Category Explorer */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Explore by Category</h2>
              <p className="text-xs text-gray-500 font-medium">Find the right talent for any trade</p>
            </div>
            <button className="text-primary text-sm font-bold flex items-center gap-0.5">
              See All <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} className="flex flex-col items-center gap-2 group">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-50 flex items-center justify-center text-2xl group-hover:shadow-md group-hover:-translate-y-1 group-active:scale-95 transition-all">
                  {cat.icon}
                </div>
                <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Discovery Sections - Hubs */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/discover/professionals" className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-3xl border border-blue-100/50 relative overflow-hidden group">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-gray-900">Professionals</h3>
            <p className="text-[10px] text-gray-500 font-medium mt-1">Hire verified experts</p>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <Users size={80} />
            </div>
          </Link>
          
          <Link href="/jobs" className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-3xl border border-orange-100/50 relative overflow-hidden group">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Briefcase size={20} />
            </div>
            <h3 className="font-bold text-gray-900">Jobs</h3>
            <p className="text-[10px] text-gray-500 font-medium mt-1">Find your next role</p>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <Briefcase size={80} />
            </div>
          </Link>

          <Link href="/discover/companies" className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-3xl border border-purple-100/50 relative overflow-hidden group">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Building2 size={20} />
            </div>
            <h3 className="font-bold text-gray-900">Companies</h3>
            <p className="text-[10px] text-gray-500 font-medium mt-1">Explore top employers</p>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <Building2 size={80} />
            </div>
          </Link>
          
          <Link href="/discover/learning" className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-3xl border border-emerald-100/50 relative overflow-hidden group">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <GraduationCap size={20} />
            </div>
            <h3 className="font-bold text-gray-900">Learning</h3>
            <p className="text-[10px] text-gray-500 font-medium mt-1">Courses & Upskilling</p>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <GraduationCap size={80} />
            </div>
          </Link>
        </div>

        {/* Nearby Spotlight */}
        <section className="bg-gray-900 rounded-3xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <MapPin size={100} />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 text-white">
              <MapPin size={12} /> Local Opportunities
            </div>
            <h2 className="text-xl font-bold mb-2">Discover what's around you</h2>
            <p className="text-sm text-gray-400 mb-5 max-w-[80%]">Find jobs, professionals, and companies within a 10km radius of your location.</p>
            <Link href="/discover/map" className="mt-4 bg-white text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors inline-block text-center">
              Explore Map
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
