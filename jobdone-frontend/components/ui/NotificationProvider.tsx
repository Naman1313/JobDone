"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [toast, setToast] = useState<{ title: string; body: string; url?: string; isEmergency?: boolean } | null>(null);

  useEffect(() => {
    // 1. Request Browser Notification Permission
    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }

    // 2. Listen to Socket events
    const socket = io("http://localhost:5000");

    socket.on("push_notification", (data: any) => {
      // Check if notification is meant for this user or is global
      if (data.targetRole === 'all' || data.targetUserId === user?._id) {
        
        // Show In-App Toast
        setToast(data);

        // Clear toast after 5s
        setTimeout(() => setToast(null), 5000);

        // Show Native Browser Notification
        if ("Notification" in window && Notification.permission === "granted") {
          // If the page is hidden/in background, the native notification shines!
          if (document.hidden || data.isEmergency) {
             new Notification(data.title, {
               body: data.body,
               icon: "/icons/icon-192x192.png", // Assuming PWA icon exists
               requireInteraction: data.isEmergency
             });
          }
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <>
      {children}
      
      {/* High-Visibility In-App Toast */}
      {toast && (
        <div className="fixed top-4 left-4 right-4 z-[100] animate-in slide-in-from-top fade-in duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-4 cursor-pointer ${
            toast.isEmergency ? 'bg-red-600 border-red-800 text-white' : 'bg-white border-gray-100 text-gray-800'
          }`}
          onClick={() => {
             if (toast.url) window.location.href = toast.url;
             setToast(null);
          }}>
            <div className={`text-3xl ${toast.isEmergency ? 'animate-pulse' : ''}`}>
              {toast.isEmergency ? '🚨' : '🔔'}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg leading-tight mb-1">{toast.title}</h4>
              <p className={`text-sm leading-snug ${toast.isEmergency ? 'text-red-100' : 'text-gray-600'}`}>
                {toast.body}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
