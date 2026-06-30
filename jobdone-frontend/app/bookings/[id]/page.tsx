"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageShell from "../../../components/ui/PageShell";
import { useAuth } from "../../../context/AuthContext";

export default function BookingTrackerPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/bookings/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setBooking(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // Simulate real-time polling
    const interval = setInterval(fetchBooking, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchBooking();
    } catch (err) {
      console.error(err);
    }
  };

  const completeJob = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/bookings/${id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBooking();
      alert("Job Completed & Funds Released!");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-10 text-center text-orange-500">Loading Tracker...</div>;
  if (!booking) return <div className="p-10 text-center">Booking not found</div>;

  const isWorker = user?.role === 'worker';
  const steps = ['requested', 'accepted', 'enroute', 'inprogress', 'completed'];
  const currentStepIndex = steps.indexOf(booking.status);

  return (
    <PageShell title="Booking Tracker" showBackButton>
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-lg text-gray-800">{booking.jobId?.title || 'Job Booking'}</h2>
          <p className="text-sm text-gray-500 mb-4">{new Date(booking.scheduledAt).toLocaleString()}</p>
          
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-200 overflow-hidden">
              <img src={isWorker ? booking.clientId?.profilePhoto : booking.workerId?.profilePhoto || "https://ui-avatars.com/api/?name=User"} alt="Avatar" />
            </div>
            <div>
              <p className="text-xs text-orange-600 font-bold uppercase">{isWorker ? 'Client' : 'Worker'}</p>
              <p className="font-medium text-gray-800">{isWorker ? booking.clientId?.name : booking.workerId?.name}</p>
            </div>
            <button className="ml-auto bg-white border border-orange-200 text-orange-500 px-3 py-1 rounded-full text-xs font-bold shadow-sm"
               onClick={() => router.push('/chat')}>
              Message
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-bold">Address:</span> {booking.address}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Status</h3>
          
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step} className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${index <= currentStepIndex ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                    {index <= currentStepIndex && '✓'}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-1 h-10 ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className="pt-1">
                  <p className={`font-bold capitalize ${index <= currentStepIndex ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step === 'inprogress' ? 'In Progress' : step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worker Actions */}
        {isWorker && booking.status !== 'completed' && (
          <div className="mt-6 flex flex-wrap gap-3">
            {booking.status === 'requested' && (
              <button onClick={() => updateStatus('accepted')} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl">Accept Job</button>
            )}
            {booking.status === 'accepted' && (
              <button onClick={() => updateStatus('enroute')} className="flex-1 bg-blue-500 text-white font-bold py-3 rounded-xl">Mark En Route</button>
            )}
            {booking.status === 'enroute' && (
              <button onClick={() => updateStatus('inprogress')} className="flex-1 bg-orange-500 text-white font-bold py-3 rounded-xl">Start Work</button>
            )}
            {booking.status === 'inprogress' && (
              <button onClick={() => updateStatus('completed')} className="flex-1 bg-purple-500 text-white font-bold py-3 rounded-xl">Finish Work (Wait for client release)</button>
            )}
          </div>
        )}

        {/* Client Actions */}
        {!isWorker && booking.status === 'inprogress' && (
          <div className="mt-6">
            <button onClick={completeJob} className="w-full bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg animate-pulse">
              Approve Work & Release Escrow
            </button>
          </div>
        )}

      </div>
    </PageShell>
  );
}
