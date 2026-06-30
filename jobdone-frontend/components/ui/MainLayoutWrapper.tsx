"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function MainLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Routes where BottomNav is hidden
  const hiddenRoutes = ['/', '/splash', '/onboarding', '/auth'];
  const isNavHidden = hiddenRoutes.includes(pathname) || pathname.startsWith('/profile/setup') || pathname.startsWith('/profile/client-setup') || pathname.startsWith('/chat/');

  return (
    <div className={`min-h-screen ${isNavHidden ? '' : 'pb-16'}`}>
      {children}
    </div>
  );
}
