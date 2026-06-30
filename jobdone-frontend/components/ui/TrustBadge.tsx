import React from 'react';

interface TrustBadgeProps {
  score: number;
}

export default function TrustBadge({ score }: TrustBadgeProps) {
  let tier = 'Bronze';
  let colors = 'bg-primary text-on-primary'; // Bronze

  if (score >= 90) {
    tier = 'Platinum';
    colors = 'bg-inverse-surface text-status-gold shadow-md border border-outline-variant';
  } else if (score >= 80) {
    tier = 'Gold';
    colors = 'bg-status-gold text-white shadow-md';
  } else if (score >= 60) {
    tier = 'Silver';
    colors = 'bg-surface-container-highest text-on-surface';
  }

  return (
    <span className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${colors}`}>
      {tier}
    </span>
  );
}
