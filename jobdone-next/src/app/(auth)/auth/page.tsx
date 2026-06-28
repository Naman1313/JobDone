'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    
    setIsLoading(true);
    try {
      // Use the actual backend API
      const res = await api.post('/api/auth/send-otp', { phone });
      if (res.data.success) {
        setStep('otp');
      }
    } catch (error) {
      console.error("Failed to send OTP", error);
      alert("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) return;
    
    setIsLoading(true);
    try {
      const res = await api.post('/api/auth/verify-otp', { phone, otp });
      if (res.data.success) {
        const { accessToken, user, isNewUser } = res.data;
        login(accessToken, user.role, user);
        
        if (isNewUser || !user.role) {
          router.push('/profile/setup');
        } else if (user.role === 'WORKER') {
          router.push('/worker/home');
        } else {
          router.push('/client/home');
        }
      }
    } catch (error) {
      console.error("Failed to verify OTP", error);
      alert("Invalid or expired OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-primary/10 rounded-b-[4rem] -z-10" />

      <div className="w-full max-w-sm mb-8 text-center animate-in slide-in-from-top-4 fade-in duration-500">
        <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
          <span className="text-white font-black text-2xl">JD</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Welcome to JobDone</h1>
        <p className="text-muted-foreground mt-2 text-sm">Enter your phone number to get started.</p>
      </div>

      <Card className="w-full max-w-sm shadow-premium border-none animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150">
        <CardHeader>
          <CardTitle>{step === 'phone' ? 'Login or Sign up' : 'Verify Phone'}</CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? "We'll send you a 6-digit verification code."
              : `Code sent to ${phone}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <Input 
                    type="text" 
                    value="+91" 
                    disabled 
                    className="w-16 text-center font-medium bg-muted"
                  />
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="99999 99999" 
                    className="flex-1"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full py-6 rounded-xl text-md font-semibold"
                disabled={isLoading || phone.length < 10}
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2 text-center">
                <Label htmlFor="otp">Enter 6-digit Code</Label>
                <Input 
                  id="otp" 
                  type="text" 
                  placeholder="• • • • • •" 
                  className="w-full text-center tracking-[1em] font-bold text-lg"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                className="w-full py-6 rounded-xl text-md font-semibold"
                disabled={isLoading || otp.length < 4}
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  className="text-primary text-sm font-semibold"
                  onClick={() => setStep('phone')}
                >
                  Change Phone Number
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
