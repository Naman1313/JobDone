import React from 'react';

interface TrustBadgeProps {
  score: number;
}

export default function TrustBadge({ score }: TrustBadgeProps) {
  let tier = 'Bronze';
  let colors = 'bg-amber-700 text-white'; // Bronze

  if (score >= 90) {
    tier = 'Platinum';
    colors = 'bg-slate-800 text-white border border-gray-400 shadow-md';
  } else if (score >= 80) {
    tier = 'Gold';
    colors = 'bg-yellow-500 text-white shadow-md';
  } else if (score >= 60) {
    tier = 'Silver';
    colors = 'bg-gray-300 text-gray-800';
  }

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${colors}`}>
      {tier}
    </span>
  );
}
