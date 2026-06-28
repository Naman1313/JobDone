import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import QueryProvider from "@/providers/QueryProvider";
import BottomNav from "@/components/ui/BottomNav";
import { ActionMenuProvider } from "@/providers/ActionMenuProvider";
import { AuthProvider } from "@/context/AuthContext";
import GlobalModals from "@/components/layout/GlobalModals";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "JobDone | Social Hiring Platform",
  description: "A premium social hiring and gig network.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#F97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className="antialiased min-h-screen bg-background text-foreground flex flex-col pb-20">
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <ActionMenuProvider>
                <main className="flex-1 w-full max-w-lg mx-auto bg-background min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
                  {children}
                <BottomNav />
                <GlobalModals />
                </main>
              </ActionMenuProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
