"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import PageShell from "@/components/ui/PageShell";

export default function ReviewPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId');
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: id,
          workerId,
          rating,
          text
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Review submitted successfully! The worker's trust score has been updated.");
        router.push(`/profile/${workerId}`);
      } else {
        alert(data.message || 'Error submitting review');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Rate Worker" showBackButton>
      <div className="p-4 flex flex-col min-h-[85vh]">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">
          <div className="text-center mb-8 mt-4">
            <h2 className="text-2xl font-bold text-gray-800">How was the service?</h2>
            <p className="text-sm text-gray-500 mt-2">Your review helps build trust in the community.</p>
          </div>

          <div className="flex justify-center space-x-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-5xl transition-transform ${star <= (hover || rating) ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(rating)}
              >
                ★
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">Add a comment (optional)</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your experience..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px]"
            />
          </div>
        </div>

        <div className="mt-4">
          <button 
            onClick={handleSubmit} 
            disabled={rating === 0 || loading}
            className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
