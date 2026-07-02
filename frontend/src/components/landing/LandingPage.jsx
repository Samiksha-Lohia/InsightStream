import { useEffect } from 'react';
import LandingHeader from './LandingHeader';
import HeroSection from './HeroSection';
import SocialProof from './SocialProof';
import FeatureGrid from './FeatureGrid';
import PricingSection from './PricingSection';
import TestimonialsGrid from './TestimonialsGrid';
import FAQSection from './FAQSection';
import CTAFooter from './CTAFooter';
import LandingFooter from './LandingFooter';

export default function LandingPage() {
  // Lock body color and apply landing-theme class on mount, cleanup on unmount
  useEffect(() => {
    const body = document.body;
    const originalBg = body.style.backgroundColor;
    const originalClasses = [...body.classList];

    body.classList.add('landing-theme', 'bg-lp-bg');
    body.style.backgroundColor = '#0a0b10';

    return () => {
      body.style.backgroundColor = originalBg;
      body.classList.remove('landing-theme', 'bg-lp-bg');
      // restore original classes if they were wiped
      originalClasses.forEach(cls => {
        if (!body.classList.contains(cls)) {
          body.classList.add(cls);
        }
      });
    };
  }, []);

  return (
    <div className="landing-theme min-h-screen bg-lp-bg text-lp-secondary font-sans overflow-x-hidden selection:bg-lp-primary selection:text-lp-bg relative landing-grid">
      {/* Dynamic ambient background glow layers */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-lp-primary/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 -z-10" />
      <div className="absolute top-[1200px] right-1/4 w-[600px] h-[600px] bg-lp-hover/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-[800px] left-10 w-[400px] h-[400px] bg-lp-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Landing Sticky Navigation Header */}
      <LandingHeader />

      {/* Main Container */}
      <main className="max-w-[1320px] mx-auto px-4 md:px-6 xl:px-8 space-y-24 md:space-y-36 pb-20">
        <HeroSection />
        <SocialProof />
        <FeatureGrid />
        <PricingSection />
        <TestimonialsGrid />
        <FAQSection />
        <CTAFooter />
      </main>

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
}
