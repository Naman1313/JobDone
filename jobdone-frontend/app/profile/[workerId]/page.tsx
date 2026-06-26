'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

interface WorkerData {
    user: {
        _id: string;
        name: string;
        profilePhoto: string;
        trustScore: number;
        trustTier: string;
        isVerified: boolean;
        phone: string;
    };
    workerProfile: {
        trade: string;
        yearsExp: number;
        hourlyRate: number;
        languages: string[];
        availability: string;
        bio: string;
        serviceRadius: number;
        skills: string[];
    };
    portfolio: {
        _id: string;
        mediaUrl: string;
        mediaType: string;
        caption: string;
        category: string;
    }[];
    reviews: {
        _id: string;
        rating: number;
        text: string;
        reviewerId: { name: string; profilePhoto: string };
        createdAt: string;
    }[];
}

const TIER_COLORS: Record<string, string> = {
    Bronze: 'text-orange-600 bg-orange-100',
    Silver: 'text-gray-600 bg-gray-100',
    Gold: 'text-yellow-600 bg-yellow-100',
    Platinum: 'text-blue-600 bg-blue-100',
};

const AVAILABILITY_COLORS: Record<string, string> = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-gray-400',
};

export default function WorkerProfilePage() {
    const { workerId } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<WorkerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'history'>('portfolio');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/api/profile/${workerId}`);
                setData(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (workerId) fetchProfile();
    }, [workerId]);

    if (loading) return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center">
            <div className="text-orange-500 font-semibold">Loading profile...</div>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center">
            <div className="text-gray-500">Worker not found</div>
        </div>
    );

    const { user: worker, workerProfile, portfolio, reviews } = data;
    const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 'No ratings';

    return (
        <div className="min-h-screen bg-orange-50">
            {/* Header */}
            <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
                <button onClick={() => router.back()} className="text-gray-500 text-xl">←</button>
                <h1 className="font-semibold text-gray-800">Worker Profile</h1>
            </div>

            {/* Profile Card */}
            <div className="bg-white mx-4 mt-4 rounded-2xl p-5 shadow">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl overflow-hidden">
                            {worker.profilePhoto
                                ? <img src={worker.profilePhoto} alt={worker.name} className="w-full h-full object-cover" />
                                : '👷'
                            }
                        </div>
                        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${AVAILABILITY_COLORS[workerProfile?.availability || 'offline']}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold text-gray-800">{worker.name || 'Worker'}</h2>
                            {worker.isVerified && <span className="text-blue-500 text-sm">✓ Verified</span>}
                        </div>
                        <p className="text-orange-500 font-medium">{workerProfile?.trade}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TIER_COLORS[worker.trustTier] || ''}`}>
                                {worker.trustTier}
                            </span>
                            <span className="text-sm text-gray-500">⭐ {avgRating}</span>
                            <span className="text-sm text-gray-500">· {workerProfile?.yearsExp} yrs exp</span>
                        </div>
                    </div>
                </div>

                {/* Rate + Languages */}
                <div className="mt-4 flex flex-wrap gap-3">
                    <div className="bg-orange-50 rounded-xl px-4 py-2">
                        <p className="text-xs text-gray-500">Hourly Rate</p>
                        <p className="font-bold text-orange-500">₹{workerProfile?.hourlyRate}/hr</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl px-4 py-2">
                        <p className="text-xs text-gray-500">Service Area</p>
                        <p className="font-bold text-gray-800">{workerProfile?.serviceRadius} km</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl px-4 py-2">
                        <p className="text-xs text-gray-500">Languages</p>
                        <p className="font-bold text-gray-800">{workerProfile?.languages?.join(', ') || 'N/A'}</p>
                    </div>
                </div>

                {/* Bio */}
                {workerProfile?.bio && (
                    <p className="mt-4 text-gray-600 text-sm">{workerProfile.bio}</p>
                )}

                {/* Skills */}
                {workerProfile?.skills?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {workerProfile.skills.map(skill => (
                            <span key={skill} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {/* CTAs */}
                {user?._id !== workerId && (
                    <div className="mt-5 flex gap-3">
                        <button className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold">
                            Book Now
                        </button>
                        <button className="flex-1 border-2 border-orange-500 text-orange-500 py-3 rounded-xl font-semibold">
                            Message
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="mx-4 mt-4 bg-white rounded-2xl shadow overflow-hidden">
                <div className="flex border-b">
                    {(['portfolio', 'reviews', 'history'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-medium capitalize transition ${activeTab === tab
                                    ? 'text-orange-500 border-b-2 border-orange-500'
                                    : 'text-gray-500'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                    <div className="p-4">
                        {portfolio.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No portfolio items yet</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {portfolio.map(item => (
                                    <div key={item._id} className="rounded-xl overflow-hidden bg-gray-100 aspect-square">
                                        {item.mediaType === 'video' ? (
                                            <video src={item.mediaUrl} className="w-full h-full object-cover" controls />
                                        ) : (
                                            <img src={item.mediaUrl} alt={item.caption} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <div className="p-4 space-y-4">
                        {reviews.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No reviews yet</p>
                        ) : (
                            reviews.map(review => (
                                <div key={review._id} className="border-b pb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm">
                                            {review.reviewerId?.name?.[0] || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{review.reviewerId?.name}</p>
                                            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className="ml-auto text-yellow-500 font-semibold">{'⭐'.repeat(review.rating)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{review.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Work History Tab */}
                {activeTab === 'history' && (
                    <div className="p-4">
                        <p className="text-gray-400 text-center py-8">Work history map coming in Phase 3</p>
                    </div>
                )}
            </div>

            <div className="h-8" />
        </div>
    );
}