'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function OnboardingPage() {
  const router = useRouter();

  const slides = [
    {
      title: "Find Work Instantly",
      description: "Connect with clients in your local area in real-time.",
      icon: "⚡️",
    },
    {
      title: "Showcase Your Skills",
      description: "Upload reels and portfolio images to prove your expertise.",
      icon: "📸",
    },
    {
      title: "Get Paid Faster",
      description: "Secure payments and direct client communication.",
      icon: "💰",
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6">
      <div className="w-full max-w-sm mt-12 flex justify-end">
        <Button variant="ghost" className="text-muted-foreground" onClick={() => router.push('/auth')}>
          Skip
        </Button>
      </div>

      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center">
        <Carousel className="w-full">
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index}>
                <Card className="border-none shadow-none bg-transparent">
                  <CardContent className="flex flex-col items-center text-center p-6 space-y-6">
                    <div className="text-8xl mb-4">{slide.icon}</div>
                    <h2 className="text-2xl font-bold text-foreground">{slide.title}</h2>
                    <p className="text-muted-foreground">{slide.description}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="w-full max-w-sm pb-12">
        <Button 
          className="w-full py-6 text-lg rounded-2xl shadow-premium hover:shadow-premium-hover transition-all"
          onClick={() => router.push('/auth')}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
