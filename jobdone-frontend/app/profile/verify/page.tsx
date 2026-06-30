"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/ui/PageShell";
import { useAuth } from "@/context/AuthContext";

export default function VerifyProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    setLoading(true);

    try {
      // 1. In a real app, upload to Cloudinary and get URL.
      // For this MVP, we simulate upload and verification delay.
      const simulatedUrl = "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate background check

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/workers/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ documentUrl: simulatedUrl })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/profile/me'), 2000);
      } else {
        alert(data.message || 'Verification failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl mb-6 shadow-lg animate-bounce">
          ✓
        </div>
        <h1 className="text-2xl font-black text-green-800 text-center mb-2">Verification Complete!</h1>
        <p className="text-green-600 text-center font-medium">Your trust score has been upgraded. Returning to profile...</p>
      </div>
    );
  }

  return (
    <PageShell title="Verify Identity" showBackButton>
      <div className="flex flex-col min-h-[85vh] max-w-xl mx-auto w-full pb-20">
        <div className="bg-surface-container-lowest rounded-[24px] p-6 sm:p-8 shadow-[0px_8px_24px_rgba(0,0,0,0.03)] border border-border-subtle/20 flex-1">
          <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
            🛡️
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-2 tracking-tight">Get Verified</h2>
          <p className="font-body-md text-on-surface-variant mb-8 leading-relaxed">
            Verified workers get 3x more jobs. Upload your Aadhaar, PAN, or Government ID to instantly upgrade your Trust Score and get the coveted blue tick.
          </p>

          <div className="space-y-6">
            <label className="block w-full border-2 border-dashed border-outline-variant rounded-[20px] p-10 text-center cursor-pointer hover:border-primary hover:bg-surface-variant/30 transition-all group">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="max-h-56 mx-auto rounded-xl shadow-sm" />
                  <p className="mt-4 text-sm text-primary font-bold group-hover:scale-105 transition-transform">Tap to change file</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                  <p className="font-bold text-on-surface text-lg">Tap to upload ID</p>
                  <p className="text-sm text-on-surface-variant mt-1">JPG, PNG, or PDF up to 5MB</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

            <div className="bg-surface-variant/40 p-4 rounded-xl flex gap-3 text-sm border border-border-subtle/50 items-start">
              <span className="text-xl">🔒</span>
              <p className="text-on-surface-variant font-medium leading-relaxed">Your documents are securely encrypted and only used for identity verification.</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={handleVerify} 
            disabled={!file || loading}
            className="w-full h-[60px] bg-primary text-on-primary font-label-lg text-lg rounded-[16px] shadow-[0_8px_24px_rgba(93,64,55,0.2)] disabled:opacity-50 flex justify-center items-center hover:bg-primary-container active:scale-[0.98] transition-all border border-white/10"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white"></span>
            ) : (
              'Submit for Verification'
            )}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
