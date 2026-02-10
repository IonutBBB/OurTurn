import { landingT } from '@/lib/landing-t';

const t = (key: string) => landingT(`caregiverApp.landing.${key}`);

export function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ourturn.app';

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OurTurn',
    url: baseUrl,
    logo: `${baseUrl}/icon-512.png`,
    description:
      'OurTurn helps families organize daily routines, coordinate care, and stay connected.',
  };

  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'OurTurn',
    url: baseUrl,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web, iOS, Android',
    description:
      'Daily care coordination for families living with dementia — a calm app for your loved one, a powerful hub for you.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free 14-day trial, no credit card required',
    },
  };

  const faqQuestions = Array.from({ length: 10 }, (_, i) => ({
    '@type': 'Question',
    name: t(`faq.q${i + 1}`),
    acceptedAnswer: {
      '@type': 'Answer',
      text: t(`faq.a${i + 1}`),
    },
  }));

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqQuestions,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}
