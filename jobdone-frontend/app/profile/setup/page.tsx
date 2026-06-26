'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

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

    const [formData, setFormData] = useState({
        // Step 1 - Basic info
        name: '',
        // Step 2 - Trade + skills
        trade: '',
        skills: [] as string[],
        yearsExp: 0,
        languages: [] as string[],
        bio: '',
        // Step 3 - Location
        lat: 0,
        lng: 0,
        serviceRadius: 10,
        // Step 4 - Pricing
        hourlyRate: 0,
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
        <div className="min-h-screen bg-orange-50 p-4">
            <div className="max-w-md mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-orange-500">Setup Profile</h1>
                    <p className="text-gray-500 text-sm mt-1">Step {step} of 4</p>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow">

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Your full name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateForm('name', e.target.value)}
                                    placeholder="e.g. Ramesh Kumar"
                                    className="w-full border rounded-xl px-4 py-3 outline-none text-gray-800"
                                />
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.name.trim()}
                                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Step 2: Trade + Skills */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">Your Trade & Skills</h2>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Select your trade</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {TRADES.map(trade => (
                                        <button
                                            key={trade}
                                            onClick={() => updateForm('trade', trade)}
                                            className={`py-2 px-3 rounded-xl text-sm font-medium border transition ${formData.trade === trade
                                                ? 'bg-orange-500 text-white border-orange-500'
                                                : 'text-gray-600 border-gray-200'
                                                }`}
                                        >
                                            {trade}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Years of experience</label>
                                <input
                                    type="number"
                                    value={formData.yearsExp}
                                    onChange={(e) => updateForm('yearsExp', parseInt(e.target.value))}
                                    min={0}
                                    className="w-full border rounded-xl px-4 py-3 outline-none text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Languages you speak</label>
                                <div className="flex flex-wrap gap-2">
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => toggleArrayItem('languages', lang)}
                                            className={`py-1 px-3 rounded-full text-sm border transition ${formData.languages.includes(lang)
                                                ? 'bg-orange-500 text-white border-orange-500'
                                                : 'text-gray-600 border-gray-200'
                                                }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Bio (optional)</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => updateForm('bio', e.target.value)}
                                    placeholder="Tell clients about yourself..."
                                    rows={3}
                                    maxLength={500}
                                    className="w-full border rounded-xl px-4 py-3 outline-none text-gray-800 resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold">Back</button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!formData.trade}
                                    className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Location */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">Your Location</h2>
                            <p className="text-gray-500 text-sm">We use this to show you nearby jobs</p>
                            <button
                                onClick={getLocation}
                                className="w-full border-2 border-orange-500 text-orange-500 py-3 rounded-xl font-semibold"
                            >
                                📍 Use My Current Location
                            </button>
                            {formData.lat !== 0 && (
                                <p className="text-green-600 text-sm text-center">
                                    ✓ Location captured: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                                </p>
                            )}
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">
                                    Service radius: {formData.serviceRadius} km
                                </label>
                                <input
                                    type="range"
                                    min={1}
                                    max={50}
                                    value={formData.serviceRadius}
                                    onChange={(e) => updateForm('serviceRadius', parseInt(e.target.value))}
                                    className="w-full accent-orange-500"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold">Back</button>
                                <button
                                    onClick={() => setStep(4)}
                                    disabled={formData.lat === 0}
                                    className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Pricing */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800">Your Pricing</h2>
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Hourly rate (₹)</label>
                                <input
                                    type="number"
                                    value={formData.hourlyRate}
                                    onChange={(e) => updateForm('hourlyRate', parseInt(e.target.value))}
                                    placeholder="e.g. 500"
                                    min={0}
                                    className="w-full border rounded-xl px-4 py-3 outline-none text-gray-800"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex gap-3">
                                <button onClick={() => setStep(3)} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold">Back</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={formData.hourlyRate === 0 || loading}
                                    className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Complete Setup'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}