import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { StructuredData } from '@/components/landing/structured-data';
import { LandingNav } from '@/components/landing/landing-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { SocialProofBar } from '@/components/landing/social-proof-bar';
import { ProblemSolution } from '@/components/landing/problem-solution';
import { HowItWorks } from '@/components/landing/how-it-works';
import { FeatureShowcase } from '@/components/landing/feature-showcase';
import { TwoAppsPreview } from '@/components/landing/two-apps-preview';
import { Testimonials } from '@/components/landing/testimonials';
import { PricingPreview } from '@/components/landing/pricing-preview';
import { FaqSection } from '@/components/landing/faq-section';
import { FinalCta } from '@/components/landing/final-cta';
import { LandingFooter } from '@/components/landing/landing-footer';
import { ScrollReveal } from '@/components/landing/scroll-reveal';

export default async function Home() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-surface-background overflow-hidden">
      <StructuredData />
      <LandingNav />

      <main>
        <HeroSection />
        <SocialProofBar />

        <ScrollReveal>
          <ProblemSolution />
        </ScrollReveal>

        <div className="divider-wavy mx-auto max-w-xs" />

        <ScrollReveal>
          <HowItWorks />
        </ScrollReveal>

        <ScrollReveal>
          <FeatureShowcase />
        </ScrollReveal>

        <ScrollReveal>
          <TwoAppsPreview />
        </ScrollReveal>

        <ScrollReveal>
          <Testimonials />
        </ScrollReveal>

        <ScrollReveal>
          <PricingPreview />
        </ScrollReveal>

        <FaqSection />

        <ScrollReveal>
          <FinalCta />
        </ScrollReveal>
      </main>

      <LandingFooter />
    </div>
  );
}
