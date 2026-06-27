"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "Build Your Identity",
      description: "Create a verified profile showcasing your skills, past work, and customer trust score.",
      icon: "🏗️",
      color: "bg-blue-500"
    },
    {
      title: "Find Local Work",
      description: "Get matched with jobs in your area instantly. Clients can find you directly through the map.",
      icon: "📍",
      color: "bg-green-500"
    },
    {
      title: "Get Paid Securely",
      description: "No more haggling or unpaid work. Get your money securely deposited upon completion.",
      icon: "💸",
      color: "bg-orange-500"
    }
  ];

  const nextStep = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto">
      {/* Top Bar */}
      <div className="flex justify-end p-4">
        <button 
          onClick={() => router.push('/auth')} 
          className="text-gray-500 font-medium hover:text-gray-800"
        >
          Skip
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className={`w-32 h-32 rounded-full ${slides[step].color} text-white flex items-center justify-center shadow-lg transition-colors duration-500 mb-8`}>
          <span className="text-6xl">{slides[step].icon}</span>
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
          {slides[step].title}
        </h2>
        
        <p className="text-gray-600 text-lg leading-relaxed mb-12">
          {slides[step].description}
        </p>

        {/* Indicators */}
        <div className="flex space-x-3 mb-8">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-orange-500' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="p-6">
        <button 
          onClick={nextStep}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 hover:scale-[1.02] transition-all active:scale-95"
        >
          {step === slides.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
}
