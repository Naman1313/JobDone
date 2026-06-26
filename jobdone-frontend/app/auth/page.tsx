'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
} from 'firebase/auth';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [role, setRole] = useState<'worker' | 'client' | null>(null);
    const [step, setStep] = useState<'phone' | 'otp' | 'role'>('phone');
    const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(
                auth,
                'recaptcha-container',
                { size: 'invisible' }
            );
        }
    };

    const sendOTP = async () => {
        try {
            setLoading(true);
            setError('');
            setupRecaptcha();
            const phoneNumber = `+91${phone}`;
            const result = await signInWithPhoneNumber(
                auth,
                phoneNumber,
                (window as any).recaptchaVerifier
            );
            setConfirmation(result);
            setStep('otp');
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        if (!confirmation) return;
        try {
            setLoading(true);
            setError('');
            const result = await confirmation.confirm(otp);
            const idToken = await result.user.getIdToken();
            setStep('role');
            (window as any).firebaseIdToken = idToken;
        } catch (err: any) {
            setError('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectRole = async (selectedRole: 'worker' | 'client') => {
        try {
            setLoading(true);
            setError('');
            const idToken = (window as any).firebaseIdToken;
            const response = await api.post('/api/auth/verify-otp', {
                idToken,
                role: selectedRole,
            });
            const { token, user, isNewUser } = response.data.data;
            login(token, user);
            if (isNewUser && selectedRole === 'worker') {
                router.push('/profile/setup');
            } else {
                router.push('/home');
            }
        } catch (err: any) {
            setError('Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-orange-500">JobDone</h1>
                    <p className="text-gray-500 mt-1">Find skilled workers near you</p>
                </div>

                {/* Step: Phone */}
                {step === 'phone' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Enter your phone number</h2>
                        <div className="flex border rounded-xl overflow-hidden">
                            <span className="bg-gray-100 px-4 flex items-center text-gray-600 font-medium">+91</span>
                            <input
                                type="tel"
                                maxLength={10}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                placeholder="9876543210"
                                className="flex-1 px-4 py-3 outline-none text-gray-800"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            onClick={sendOTP}
                            disabled={phone.length !== 10 || loading}
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-orange-600 transition"
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                        <div id="recaptcha-container" />
                    </div>
                )}

                {/* Step: OTP */}
                {step === 'otp' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Enter OTP</h2>
                        <p className="text-gray-500 text-sm">Sent to +91 {phone}</p>
                        <input
                            type="tel"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 6-digit OTP"
                            className="w-full border px-4 py-3 rounded-xl outline-none text-center text-2xl tracking-widest text-gray-800"
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button
                            onClick={verifyOTP}
                            disabled={otp.length !== 6 || loading}
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-orange-600 transition"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            onClick={() => setStep('phone')}
                            className="w-full text-gray-500 text-sm"
                        >
                            Change number
                        </button>
                    </div>
                )}

                {/* Step: Role */}
                {step === 'role' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">I am a...</h2>
                        <p className="text-gray-500 text-sm">Choose how you want to use JobDone</p>
                        <button
                            onClick={() => selectRole('worker')}
                            disabled={loading}
                            className="w-full border-2 border-orange-500 text-orange-500 py-4 rounded-xl font-semibold hover:bg-orange-50 transition text-lg"
                        >
                            👷 Worker
                            <p className="text-sm font-normal text-gray-500 mt-1">Plumber, electrician, carpenter...</p>
                        </button>
                        <button
                            onClick={() => selectRole('client')}
                            disabled={loading}
                            className="w-full border-2 border-blue-500 text-blue-500 py-4 rounded-xl font-semibold hover:bg-blue-50 transition text-lg"
                        >
                            🏠 Client
                            <p className="text-sm font-normal text-gray-500 mt-1">I need to hire someone</p>
                        </button>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                )}

            </div>
        </div>
    );
}