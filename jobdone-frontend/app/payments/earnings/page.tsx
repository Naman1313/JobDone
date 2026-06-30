"use client";

import { useEffect, useState } from "react";
import PageShell from "../../../components/ui/PageShell";

export default function EarningsDashboard() {
  const [earnings, setEarnings] = useState({ pending: 0, withdrawn: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/bookings/earnings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setEarnings(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <PageShell title="Earnings" showBackButton>
        <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Earnings & Escrow" showBackButton>
      <div className="p-4 space-y-6">
        
        {/* Total Earned */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">₹</div>
          <p className="text-orange-100 mb-1 font-medium">Total Lifetime Earnings</p>
          <h1 className="text-4xl font-black">₹{earnings.total.toLocaleString()}</h1>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-2">
              ⏳
            </div>
            <p className="text-xs text-gray-500 font-medium">In Escrow (Pending)</p>
            <p className="text-xl font-bold text-gray-800">₹{earnings.pending.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-2">
              🏦
            </div>
            <p className="text-xs text-gray-500 font-medium">Withdrawn to Bank</p>
            <p className="text-xl font-bold text-gray-800">₹{earnings.withdrawn.toLocaleString()}</p>
          </div>
        </div>

        {/* Withdrawal CTA */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2">Withdraw Funds</h3>
          <p className="text-sm text-gray-500 mb-4">
            Funds in Escrow cannot be withdrawn until the client marks the job as complete. Once released, they will automatically move to your bank account.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center mb-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏦</div>
              <div>
                <p className="text-sm font-bold text-gray-800">HDFC Bank</p>
                <p className="text-xs text-gray-500">**** 4911</p>
              </div>
            </div>
            <button className="text-orange-500 text-sm font-bold">Edit</button>
          </div>

          <button disabled className="w-full bg-gray-200 text-gray-400 font-bold py-3 rounded-xl">
            Manual Withdrawal (Auto-enabled)
          </button>
        </div>

      </div>
    </PageShell>
  );
}
