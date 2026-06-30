'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface-variant/30 animate-pulse flex items-center justify-center rounded-2xl"><span className="font-bold text-primary">Loading Map...</span></div>
});

const TRADES = [
    'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Mason',
    'Welder', 'AC Technician', 'Locksmith', 'Gardener', 'Cleaner',
    'Driver', 'Cook', 'Security Guard', 'Pest Control', 'Other'
];

const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada'];

export default function ProfileSetupPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showMapModal, setShowMapModal] = useState(false);
    const [tempCoords, setTempCoords] = useState<[number, number]>([19.0760, 72.8777]);

    const [formData, setFormData] = useState({
        // Step 1 - Basic info
        name: '',
        // Step 2 - Trade + skills
        trade: '',
        skills: [] as string[],
        yearsExp: 0 as number | string,
        languages: [] as string[],
        bio: '',
        // Step 3 - Location
        lat: 0,
        lng: 0,
        serviceRadius: 10,
        // Step 4 - Pricing
        hourlyRate: 0 as number | string,
    });

    const updateForm = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleArrayItem = (field: string, value: string) => {
        const arr = formData[field as keyof typeof formData] as string[];
        const updated = arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value];
        updateForm(field, updated);
    };

    const getLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                updateForm('lat', pos.coords.latitude);
                updateForm('lng', pos.coords.longitude);
            },
            () => setError('Could not get location. Please enable location access.')
        );
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            // Update user name
            await api.put(`/api/profile/${user?._id}`, { name: formData.name });

            // Create worker profile
            await api.post('/api/profile/worker', {
                trade: formData.trade,
                yearsExp: formData.yearsExp,
                hourlyRate: formData.hourlyRate,
                languages: formData.languages,
                skills: formData.skills,
                bio: formData.bio,
                serviceRadius: formData.serviceRadius,
                location: {
                    type: 'Point',
                    coordinates: [formData.lng, formData.lat],
                },
            });

            router.push('/home');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-warm p-4 font-sans selection:bg-primary selection:text-white">
            <div className="max-w-md mx-auto pt-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Setup Profile</h1>
                    <p className="text-on-surface-variant font-body-md mt-2">Step {step} of 4</p>
                    {/* Progress bar */}
                    <div className="w-full bg-surface-variant rounded-full h-2 mt-4 overflow-hidden">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-border-subtle/30">

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-on-surface">Basic Information</h2>
                            <div className="space-y-2">
                                <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider">Your full name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateForm('name', e.target.value)}
                                    placeholder="e.g. Ramesh Kumar"
                                    className="w-full border border-border-subtle rounded-lg px-4 h-[56px] outline-none text-on-surface bg-surface-warm font-body-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                                />
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.name.trim()}
                                className="w-full bg-primary text-on-primary h-[56px] rounded-xl font-label-lg disabled:bg-surface-variant disabled:text-on-surface-variant disabled:cursor-not-allowed hover:bg-primary-container transition-all active:scale-[0.98] mt-4 shadow-[0px_4px_12px_rgba(93,64,55,0.15)] disabled:shadow-none"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 2: Trade + Skills */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-on-surface">Trade & Skills</h2>
                            
                            <div className="space-y-3">
                                <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider">Select your trade</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {TRADES.map(trade => (
                                        <button
                                            key={trade}
                                            onClick={() => updateForm('trade', trade)}
                                            className={`py-3 px-2 rounded-xl text-sm font-label-sm border transition-all ${formData.trade === trade
                                                ? 'bg-primary text-on-primary border-primary shadow-md'
                                                : 'text-on-surface border-border-subtle hover:border-primary/50 hover:bg-surface-warm'
                                                }`}
                                        >
                                            {trade}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider">Years of experience</label>
                                <input
                                    type="number"
                                    value={formData.yearsExp}
                                    onChange={(e) => updateForm('yearsExp', e.target.value === '' ? '' : parseInt(e.target.value))}
                                    min={0}
                                    className="w-full border border-border-subtle rounded-lg px-4 h-[56px] outline-none text-on-surface bg-surface-warm font-body-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider">Languages you speak</label>
                                <div className="flex flex-wrap gap-2">
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => toggleArrayItem('languages', lang)}
                                            className={`py-2 px-4 rounded-full text-sm font-medium border transition-all ${formData.languages.includes(lang)
                                                ? 'bg-primary-container text-on-primary-container border-primary-container'
                                                : 'text-on-surface-variant border-border-subtle hover:bg-surface-warm'
                                                }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider">Bio (optional)</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => updateForm('bio', e.target.value)}
                                    placeholder="Tell clients about your expertise..."
                                    rows={3}
                                    maxLength={500}
                                    className="w-full border border-border-subtle rounded-lg p-4 outline-none text-on-surface bg-surface-warm font-body-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none placeholder:text-on-surface-variant/50"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setStep(1)} className="w-1/3 border border-outline-variant text-on-surface h-[56px] rounded-xl font-label-lg hover:bg-surface-variant transition-colors">Back</button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!formData.trade}
                                    className="w-2/3 bg-primary text-on-primary h-[56px] rounded-xl font-label-lg disabled:bg-surface-variant disabled:text-on-surface-variant disabled:cursor-not-allowed hover:bg-primary-container transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(93,64,55,0.15)] disabled:shadow-none"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Location */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-on-surface">Your Location</h2>
                            <p className="text-on-surface-variant font-body-sm">We use this to connect you with nearby clients and emergencies.</p>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={getLocation}
                                    className="flex-1 border-2 border-primary text-primary h-[56px] rounded-xl font-label-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                                >
                                    📍 Use Current Location
                                </button>
                                <button
                                    onClick={() => setShowMapModal(true)}
                                    className="flex-1 bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary transition-all h-[56px] rounded-xl font-bold border border-border-subtle/30 flex items-center justify-center gap-2"
                                >
                                    🗺️ Pick on Map
                                </button>
                            </div>
                            
                            {formData.lat !== 0 && (
                                <div className="bg-surface-warm border border-border-subtle p-3 rounded-lg text-center">
                                    <p className="text-status-gold font-label-sm">
                                        ✓ Location locked successfully
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4 pt-4">
                                <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider text-center">
                                    Service Radius: <span className="text-primary font-bold">{formData.serviceRadius} km</span>
                                </label>
                                <input
                                    type="range"
                                    min={1}
                                    max={50}
                                    value={formData.serviceRadius}
                                    onChange={(e) => updateForm('serviceRadius', parseInt(e.target.value))}
                                    className="w-full accent-primary h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                                    <span>1 km</span>
                                    <span>50 km</span>
                                </div>
                            </div>
                            
                            {error && <p className="text-error font-medium text-sm text-center">{error}</p>}
                            
                            <div className="flex gap-3 pt-6">
                                <button onClick={() => setStep(2)} className="w-1/3 border border-outline-variant text-on-surface h-[56px] rounded-xl font-label-lg hover:bg-surface-variant transition-colors">Back</button>
                                <button
                                    onClick={() => setStep(4)}
                                    disabled={formData.lat === 0}
                                    className="w-2/3 bg-primary text-on-primary h-[56px] rounded-xl font-label-lg disabled:bg-surface-variant disabled:text-on-surface-variant disabled:cursor-not-allowed hover:bg-primary-container transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(93,64,55,0.15)] disabled:shadow-none"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Pricing */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-on-surface">Your Pricing</h2>
                            <p className="text-on-surface-variant font-body-sm">Set your base hourly rate. You can always negotiate with clients per job.</p>
                            
                            <div className="space-y-2 pt-4">
                                <label className="font-label-sm text-on-surface-variant block uppercase tracking-wider">Hourly rate (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-lg">₹</span>
                                    <input
                                        type="number"
                                        value={formData.hourlyRate}
                                        onChange={(e) => updateForm('hourlyRate', e.target.value === '' ? '' : parseInt(e.target.value))}
                                        placeholder="500"
                                        min={0}
                                        className="w-full border border-border-subtle rounded-lg pl-10 pr-4 h-[56px] outline-none text-on-surface bg-surface-warm font-body-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all text-lg font-bold"
                                    />
                                </div>
                            </div>
                            
                            {error && <p className="text-error text-sm font-medium">{error}</p>}
                            
                            <div className="flex gap-3 pt-6">
                                <button onClick={() => setStep(3)} className="w-1/3 border border-outline-variant text-on-surface h-[56px] rounded-xl font-label-lg hover:bg-surface-variant transition-colors">Back</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={formData.hourlyRate === 0 || loading}
                                    className="w-2/3 bg-primary text-on-primary h-[56px] rounded-xl font-label-lg disabled:bg-surface-variant disabled:text-on-surface-variant disabled:cursor-not-allowed hover:bg-primary-container transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(93,64,55,0.15)] disabled:shadow-none"
                                >
                                    {loading ? 'Saving...' : 'Complete Setup'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Map Picker Modal */}
            {showMapModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-surface-container-lowest w-full max-w-2xl h-[70vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-border-subtle/20 animate-in zoom-in-95 duration-200">
                    
                    <div className="p-5 border-b border-border-subtle/30 flex justify-between items-center bg-surface-variant/10">
                      <h3 className="font-bold text-lg text-on-surface tracking-tight">Select Work Location</h3>
                      <button 
                        onClick={() => setShowMapModal(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface hover:bg-error/10 hover:text-error transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex-grow p-4 relative z-0">
                      <MapPicker 
                        initialPosition={tempCoords} 
                        onSelect={(pos) => setTempCoords(pos)} 
                      />
                    </div>

                    <div className="p-5 border-t border-border-subtle/30 bg-surface-variant/10 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Selected Coordinates</span>
                        <span className="text-sm font-mono text-primary font-bold">
                          {tempCoords[0].toFixed(4)}, {tempCoords[1].toFixed(4)}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          updateForm('lat', tempCoords[0]);
                          updateForm('lng', tempCoords[1]);
                          setShowMapModal(false);
                        }}
                        className="bg-primary text-on-primary px-6 py-3 rounded-[14px] font-bold shadow-md hover:bg-primary-container transition-colors active:scale-95 border border-white/10"
                      >
                        Confirm Location
                      </button>
                    </div>
                  </div>
                </div>
            )}
        </div>
    );
}