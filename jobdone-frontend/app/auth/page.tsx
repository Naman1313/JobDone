'use client';

import { useState, useEffect } from 'react';
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

    useEffect(() => {
        // Clear any stale reCAPTCHA instances on mount (especially useful after logout or hot reload)
        if ((window as any).recaptchaVerifier) {
            try {
                (window as any).recaptchaVerifier.clear();
            } catch (e) {}
            (window as any).recaptchaVerifier = null;
        }

        return () => {
            if ((window as any).recaptchaVerifier) {
                try {
                    (window as any).recaptchaVerifier.clear();
                    (window as any).recaptchaVerifier = null;
                } catch (e) {}
            }
        };
    }, []);

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
            (window as any).firebaseIdToken = idToken;

            // Check if user exists on the backend
            const response = await api.post('/api/auth/verify-otp', { idToken });
            const { token, user, roleRequired } = response.data.data;

            if (roleRequired) {
                // New user needs to choose a role
                setStep('role');
            } else {
                // Existing user, log them in directly
                login(token, user);
                router.push('/home');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Invalid OTP. Please try again.');
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
            } else if (isNewUser && selectedRole === 'client') {
                router.push('/profile/client-setup');
            } else {
                router.push('/home');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Authentication failed. Please try again.');
            console.error('Auth Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-warm flex items-center justify-center p-4 font-sans selection:bg-primary selection:text-white">
            <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-8 w-full max-w-md border border-border-subtle/30">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary tracking-tight">
                        JobDone<span className="text-status-gold">.</span>
                    </h1>
                    <p className="text-on-surface-variant font-body-md mt-2">Find the Right Labour for you.</p>
                </div>

                {/* Step: Phone */}
                {step === 'phone' && (
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-on-surface">Welcome back</h2>
                            <p className="text-on-surface-variant font-body-sm">Enter your phone number to sign in or create an account</p>
                        </div>
                        <div className="flex border border-border-subtle rounded-lg overflow-hidden h-[56px] bg-surface-warm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                            <span className="bg-surface-variant px-4 flex items-center text-on-surface-variant font-label-lg border-r border-border-subtle">+91</span>
                            <input
                                type="tel"
                                maxLength={10}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                placeholder="9876543210"
                                className="flex-1 px-4 outline-none bg-transparent text-on-surface font-body-lg placeholder:text-on-surface-variant/50"
                            />
                        </div>
                        {error && <p className="text-error text-sm font-medium">{error}</p>}
                        <button
                            onClick={sendOTP}
                            disabled={phone.length !== 10 || loading}
                            className="w-full bg-primary text-on-primary h-[56px] rounded-xl font-label-lg disabled:opacity-50 hover:bg-primary-container transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(93,64,55,0.15)]"
                        >
                            {loading ? 'Sending Code...' : 'Continue'}
                        </button>
                    </div>
                )}

                {/* Step: OTP */}
                {step === 'otp' && (
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-on-surface">Verify it's you</h2>
                            <p className="text-on-surface-variant font-body-sm">We sent a secure code to +91 {phone}</p>
                        </div>
                        <input
                            type="tel"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="• • • • • •"
                            className="w-full border border-border-subtle h-[56px] rounded-lg outline-none text-center text-2xl tracking-[0.3em] text-on-surface bg-surface-warm focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:tracking-normal placeholder:text-on-surface-variant/40"
                        />
                        {error && <p className="text-error text-sm font-medium">{error}</p>}
                        <button
                            onClick={verifyOTP}
                            disabled={otp.length !== 6 || loading}
                            className="w-full bg-primary text-on-primary h-[56px] rounded-xl font-label-lg disabled:opacity-50 hover:bg-primary-container transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(93,64,55,0.15)]"
                        >
                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>
                        <button
                            onClick={() => setStep('phone')}
                            className="w-full text-on-surface-variant text-sm font-medium hover:text-primary transition-colors py-2"
                        >
                            Use a different number
                        </button>
                    </div>
                )}

                {/* Step: Role */}
                {step === 'role' && (
                    <div className="space-y-6">
                        <div className="space-y-1 text-center">
                            <h2 className="text-2xl font-bold text-on-surface">Choose your path</h2>
                            <p className="text-on-surface-variant font-body-sm">How would you like to use JobDone today?</p>
                        </div>
                        <div className="space-y-4 mt-8">
                            <button
                                onClick={() => selectRole('worker')}
                                disabled={loading}
                                className="w-full border-2 border-outline-variant text-on-surface p-5 rounded-xl text-left hover:border-primary hover:bg-surface-variant transition-all flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">👷</div>
                                <div>
                                    <div className="font-bold text-lg">I am a Worker</div>
                                    <div className="text-sm text-on-surface-variant mt-1">Plumber, electrician, carpenter...</div>
                                </div>
                            </button>
                            <button
                                onClick={() => selectRole('client')}
                                disabled={loading}
                                className="w-full border-2 border-outline-variant text-on-surface p-5 rounded-xl text-left hover:border-primary hover:bg-surface-variant transition-all flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏠</div>
                                <div>
                                    <div className="font-bold text-lg">I am a Client</div>
                                    <div className="text-sm text-on-surface-variant mt-1">I need to hire someone</div>
                                </div>
                            </button>
                        </div>
                        {error && <p className="text-error text-sm font-medium text-center">{error}</p>}
                    </div>
                )}

            </div>
            {/* Always mount recaptcha-container outside conditional renders to prevent React from destroying it and causing 'Cannot read properties of null (reading style)' errors */}
            <div id="recaptcha-container" className="fixed bottom-4 left-4" />
        </div>
    );
}