import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  const tiers = [
    {
      name: 'Starter',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Ideal for small text payloads and developers testing the Redis queue system.',
      features: [
        'Up to 1,000 requests / month',
        'Redis queue latency buffer (up to 3s)',
        '3 days data storage retention',
        'Standard entity linkage logs',
        'Community support channel'
      ],
      cta: 'Start for Free',
      popular: false,
      link: '/register'
    },
    {
      name: 'Pro',
      priceMonthly: 29,
      priceAnnual: 19,
      description: 'Optimized for high-volume pipelines requiring zero queue delay and persistent history.',
      features: [
        'Up to 100,000 requests / month',
        'Prioritized sub-second Redis routing',
        'Infinite data storage retention policy',
        'Advanced NLP sentiment linkages',
        'API keys configuration dashboard',
        'Email & Discord priority support'
      ],
      cta: 'Go Pro Now',
      popular: true,
      link: '/register'
    },
    {
      name: 'Enterprise',
      priceMonthly: 'Custom',
      priceAnnual: 'Custom',
      description: 'For companies processing large document datastores under strict compliance rules.',
      features: [
        'Unlimited monthly payload requests',
        'Custom private Redis worker cluster',
        'Custom data retention SLAs',
        'Dedicated decryption keys (kms)',
        'Dedicated Account Manager',
        '24/7/365 phone support'
      ],
      cta: 'Contact Architecture Team',
      popular: false,
      link: '/register'
    }
  ];

  return (
    <section id="pricing" className="space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-lp-secondary">
          Predictable Cloud Pricing
        </h2>
        <p className="text-sm md:text-base text-lp-muted max-w-xl mx-auto">
          Scale your pipeline smoothly as your processing needs grow. Cancel or change plans anytime.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="flex items-center justify-center gap-4 pt-4 select-none">
          <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-lp-primary' : 'text-lp-muted'}`}>
            Monthly Billing
          </span>
          
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 bg-lp-card border border-lp-border hover:border-lp-primary/60 rounded-full p-1 transition-all cursor-pointer flex items-center"
            aria-label="Toggle billing plan"
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-5.5 h-5.5 rounded-full bg-lp-primary shadow-md"
              style={{ alignSelf: isAnnual ? 'flex-end' : 'flex-start', marginLeft: isAnnual ? 'auto' : '0' }}
            />
          </button>

          <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${isAnnual ? 'text-lp-primary' : 'text-lp-muted'}`}>
            Annual Billing
            <span className="text-[10px] font-bold text-lp-bg bg-lp-primary border border-lp-primary px-1.5 py-0.5 rounded-full">
              Save 35%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {tiers.map((tier, index) => (
          <motion.div
            layout
            key={tier.name}
            whileHover={{
              y: -8,
              boxShadow: tier.popular
                ? '0 20px 40px rgba(168, 85, 247, 0.08)'
                : '0 12px 30px rgba(0, 0, 0, 0.4)',
            }}
            transition={{ duration: 0.3 }}
            className={`p-8 rounded-3xl flex flex-col justify-between relative border overflow-hidden ${
              tier.popular
                ? 'bg-gradient-to-b from-[#1b1624] to-[#0a0b10] border-lp-primary shadow-[0_0_30px_rgba(168, 85, 247, 0.05)] md:-translate-y-4'
                : 'bg-lp-card/75 border-lp-border/60'
            }`}
          >
            {/* Ambient visual badge on Popular card */}
            {tier.popular && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-lp-primary/10 border border-lp-primary/20 text-[10px] font-bold text-lp-primary uppercase">
                <Sparkles className="w-3 h-3" />
                Most Popular
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-lp-secondary">{tier.name}</h3>
                <p className="text-xs text-lp-muted mt-2 leading-relaxed min-h-[40px]">
                  {tier.description}
                </p>
              </div>

              {/* Price display with Framer Motion AnimatePresence for smooth morphing */}
              <div className="flex items-baseline gap-1 py-2">
                <span className="text-4xl md:text-5xl font-black text-lp-secondary tracking-tight">
                  {typeof tier.priceMonthly === 'string' ? (
                    tier.priceMonthly
                  ) : (
                    <>
                      $
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={isAnnual ? 'annual' : 'monthly'}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block"
                        >
                          {isAnnual ? tier.priceAnnual : tier.priceMonthly}
                        </motion.span>
                      </AnimatePresence>
                    </>
                  )}
                </span>
                {typeof tier.priceMonthly !== 'string' && (
                  <span className="text-sm font-semibold text-lp-muted">/month</span>
                )}
              </div>

              {/* Tier features checklist */}
              <ul className="space-y-3.5 text-xs text-lp-secondary/90 border-t border-lp-border/40 pt-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="p-0.5 rounded-full bg-lp-primary/10 border border-lp-primary/20 text-lp-primary flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA action button */}
            <div className="pt-8 mt-auto">
              <Link
                to={tier.link}
                className={`w-full group py-3.5 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 border transition-all duration-300 ${
                  tier.popular
                    ? 'bg-lp-primary hover:bg-lp-hover text-lp-bg border-lp-primary shadow-[0_0_15px_rgba(120,252,214,0.2)] hover:shadow-[0_0_25px_rgba(0,255,182,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-lp-secondary hover:text-lp-primary border-lp-border hover:border-lp-primary/40'
                }`}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
