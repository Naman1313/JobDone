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
    <div className="w-full mx-auto flex-grow flex flex-col bg-surface-warm min-h-screen selection:bg-primary selection:text-white">
      <header className="w-full h-16 sticky top-0 z-40 bg-white/40 backdrop-blur-2xl saturate-150 flex items-center border-b border-white/60 shadow-[0_4px_30px_rgba(93,64,55,0.05)] transition-all">
        <div className="w-full max-w-7xl px-4 md:px-8 mx-auto flex items-center">
          {showBackButton && (
            <Link href={backHref} onClick={onBack} className="mr-4 text-on-surface hover:text-primary hover:bg-white/50 p-2 -ml-2 rounded-full transition-all active:scale-95 shadow-sm border border-transparent hover:border-white/60">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
          )}
          <div>
            <h1 className="font-headline-md text-[20px] font-bold text-primary tracking-tight drop-shadow-sm leading-tight">{title}</h1>
            {subtitle && <p className="font-label-sm text-label-sm text-on-surface-variant drop-shadow-sm">{subtitle}</p>}
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col w-full max-w-7xl mx-auto px-4 md:px-8 pb-6 pt-6">
        {children}
      </main>
    </div>
  );
}
