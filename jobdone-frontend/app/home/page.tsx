'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) router.push('/auth');
    }, [user]);

    return (
        <div className="min-h-screen bg-orange-50 p-6">
            <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-orange-500">JobDone</h1>
                    <button onClick={logout} className="text-gray-500 text-sm">Logout</button>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow">
                    <p className="text-gray-600">Welcome back!</p>
                    <p className="text-xl font-semibold text-gray-800 mt-1">{user?.phone}</p>
                    <p className="text-sm text-orange-500 mt-1 capitalize">{user?.role}</p>
                </div>
            </div>
        </div>
    );
}