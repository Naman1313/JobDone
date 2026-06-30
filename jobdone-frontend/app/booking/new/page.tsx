"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageShell from "@/components/ui/PageShell";

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId');
  const jobId = searchParams.get('jobId');
  
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [amount, setAmount] = useState(500); // Dummy default
  const [loading, setLoading] = useState(false);

  const handleNext = () => setStep(s => s + 1);

  const handlePayment = async () => {
    setLoading(true);
    // Simulate Razorpay popup
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            workerId,
            jobId,
            address,
            scheduledAt,
            amount
          })
        });

        const data = await res.json();
        if (data.success) {
          router.push(`/bookings/${data.data._id}`);
        } else {
          alert('Booking failed');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <PageShell title="Book Worker" showBackButton>
      <div className="p-4 flex flex-col min-h-[80vh]">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8">
          {[1,2,3].map(i => (
            <div key={i} className={`flex items-center ${i < 3 ? 'flex-1' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= i ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i}
              </div>
              {i < 3 && <div className={`flex-1 h-1 mx-2 ${step > i ? 'bg-orange-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">When do you need them?</h2>
              <input 
                type="datetime-local" 
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button onClick={handleNext} disabled={!scheduledAt} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 mt-4">
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Where should they go?</h2>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter full address"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
              />
              <button onClick={handleNext} disabled={!address} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 mt-4">
                Continue
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Payment Escrow</h2>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Job Amount</span>
                  <span>₹{amount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee (10%)</span>
                  <span>₹{amount * 0.1}</span>
                </div>
                <hr className="border-orange-200" />
                <div className="flex justify-between font-bold text-orange-600 text-lg">
                  <span>Total to pay</span>
                  <span>₹{amount + (amount * 0.1)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">Your money is held safely in escrow and only released to the worker when you mark the job as complete.</p>
              
              <button onClick={handlePayment} disabled={loading} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl flex justify-center items-center">
                {loading ? (
                   <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                ) : 'Simulate Razorpay Payment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
