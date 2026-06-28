import React from 'react';
import Link from 'next/link';

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  backHref?: string;
}

export default function PageShell({ 
  title, subtitle, children, showBackButton = false, onBack, backHref = '/home' 
}: PageShellProps) {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white p-4 sticky top-0 z-20 shadow-sm border-b flex items-center">
        {showBackButton && (
          <Link href={backHref} onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-6">
        {children}
      </main>
    </div>
  );
}
