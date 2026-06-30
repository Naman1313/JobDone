import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Zap, CreditCard, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-warm font-sans selection:bg-primary selection:text-white">
      {/* Navbar Area (Simplified for Landing) */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center max-w-container-max-width mx-auto left-0 right-0 z-10">
        <div className="text-2xl font-bold text-primary tracking-tight">
          JobDone<span className="text-status-gold">.</span>
        </div>
        <Link 
          href="/auth" 
          className="text-primary font-label-lg hover:bg-surface-variant px-4 py-2 rounded-lg transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6 sm:pt-40 sm:pb-24 lg:pb-32 flex flex-col items-center text-center max-w-container-max-width mx-auto">

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-bold text-on-surface leading-[1.1] tracking-tight max-w-4xl mb-6">
          Find skilled workers you can <span className="text-primary italic">actually trust.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-on-surface-variant max-w-2xl mb-10 leading-relaxed font-body-lg">
          Whether you need a plumber, electrician, or carpenter, connect instantly with verified professionals in your local area. 
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/splash"
            className="flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-primary-container px-8 py-4 rounded-xl font-label-lg text-lg transition-all shadow-[0px_8px_24px_rgba(93,64,55,0.2)] hover:shadow-[0px_12px_32px_rgba(93,64,55,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            Find a Worker Now <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/auth"
            className="flex items-center justify-center bg-surface-container-lowest text-primary border border-border-subtle hover:bg-surface-variant px-8 py-4 rounded-xl font-label-lg text-lg transition-colors"
          >
            I am a Worker
          </Link>
        </div>
      </main>

      {/* Value Proposition Section */}
      <section className="bg-surface-container-lowest py-20 px-6 border-y border-border-subtle">
        <div className="max-w-container-max-width mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mb-4">
              Why choose JobDone?
            </h2>
            <p className="text-on-surface-variant font-body-lg">
              We bring transparency and reliability to informal labor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-surface-warm p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-border-subtle/50 transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Verified Trust</h3>
              <p className="text-on-surface-variant font-body-md">
                Every worker undergoes identity verification and builds a transparent TrustScore based on real community feedback.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-warm p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-border-subtle/50 transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Instant Booking</h3>
              <p className="text-on-surface-variant font-body-md">
                No more waiting for callbacks. See real-time availability and book workers immediately when emergencies strike.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-warm p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-border-subtle/50 transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">Secure Escrow</h3>
              <p className="text-on-surface-variant font-body-md">
                Funds are held securely in escrow until the job is completed to your satisfaction, protecting both parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-surface-warm text-center">
        <div className="max-w-container-max-width mx-auto flex flex-col items-center">
          <div className="text-2xl font-bold text-primary opacity-50 mb-4">JobDone</div>
          <p className="text-on-surface-variant text-sm font-medium">
            © {new Date().getFullYear()} Jobdone. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
