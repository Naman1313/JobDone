import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#f97316',
};
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JobDone - Find Skilled Workers Near You',
  description: 'Connect with verified plumbers, electricians, carpenters and more',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}