import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function TestimonialsGrid() {
  const containerRef = useRef(null);

  useEffect(() => {
    // GSAP memory leak prevention: wrap all animations in a context
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.testimonial-card',
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const reviews = [
    {
      name: 'Sarah Chen',
      role: 'Staff ML Engineer',
      company: 'Zenith Labs',
      text: 'The Redis queue implementation is rock solid. We process over 50k payloads daily and the queue buffering works flawlessly without losing a single document.',
      avatarInitials: 'SC'
    },
    {
      name: 'Marcus Brody',
      role: 'Director of Compliance',
      company: 'Apex Solutions',
      text: 'Encryption-at-rest keys and configurable data retention made auditing a breeze. We could isolate partitions for different clients with simple configuration settings.',
      avatarInitials: 'MB'
    },
    {
      name: 'Elena Rostova',
      role: 'Full Stack Developer',
      company: 'Sora Cloud',
      text: 'Integrating the document analyzer was incredibly fast. The socket updates are highly responsive, sending entity extraction events in real-time.',
      avatarInitials: 'ER'
    },
    {
      name: 'David Vance',
      role: 'Lead Architect',
      company: 'Aether Data',
      text: 'The sub-second process speeds are not marketing hype. Average summary extraction times consistently hit below 400ms under heavy developer traffic.',
      avatarInitials: 'DV'
    },
    {
      name: 'Tariq Al-Mansoor',
      role: 'Security Engineer',
      company: 'Helix Security',
      text: 'A clean, tech-forward interface that respects data isolation principles. The landing layout fits our aesthetic preferences, and performance is outstanding.',
      avatarInitials: 'TA'
    },
    {
      name: 'Jessica Taylor',
      role: 'Product Manager',
      company: 'Prism Engine',
      text: 'Our operations team relies on the summary dashboards daily. Being able to extract key metrics instantly has saved us countless hours of manual review.',
      avatarInitials: 'JT'
    }
  ];

  return (
    <section ref={containerRef} className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-lp-secondary">
          Loved by Engineers & Architects
        </h2>
        <p className="text-sm md:text-base text-lp-muted max-w-xl mx-auto">
          Read what other technical leaders are saying about the stability and throughput of our pipeline.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="testimonial-card p-6 rounded-2xl border border-lp-border/60 bg-lp-card/40 flex flex-col justify-between hover:border-lp-primary/30 transition-colors duration-300"
          >
            <div className="space-y-4">
              {/* Star Rating */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-lp-primary text-lp-primary" />
                ))}
              </div>
              <p className="text-xs md:text-sm text-lp-secondary/90 leading-relaxed italic">
                &ldquo;{review.text}&rdquo;
              </p>
            </div>

            {/* Profile Avatar & Metadata */}
            <div className="flex items-center gap-3 pt-5 mt-6 border-t border-lp-border/30">
              <div className="w-9 h-9 rounded-lg bg-lp-primary/10 border border-lp-primary/20 flex items-center justify-center text-xs font-bold text-lp-primary font-mono">
                {review.avatarInitials}
              </div>
              <div>
                <span className="text-xs font-bold text-lp-secondary block">{review.name}</span>
                <span className="text-[10px] text-lp-muted font-medium block">
                  {review.role} &bull; <strong className="text-lp-secondary/80">{review.company}</strong>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
