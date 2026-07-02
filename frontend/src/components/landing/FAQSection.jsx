import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      question: 'How does the Redis queue buffer protect my upload stream?',
      answer: 'When you submit document payloads, they are instantly pushed to a highly optimized Redis queue. Worker nodes pull tasks asynchronously, ensuring that frontend client requests never block or drop, even during sudden spikes in payload traffic.'
    },
    {
      question: 'What encryption standards are used for security?',
      answer: 'All payloads processed through our pipeline are encrypted in transit using TLS 1.3 and at rest using AES-256 GCM. We also support customer-managed encryption key policies for absolute isolation.'
    },
    {
      question: 'Can I configure custom document retention policies?',
      answer: 'Yes. In the preferences panel, users can select retention periods ranging from instantaneous flush (deletion immediately post-analysis), to timed expiration (e.g. 7 days), up to indefinite retention for long-term audit trail history.'
    },
    {
      question: 'What metrics are captured in the summaries?',
      answer: 'InsightStream analyzes text payloads to produce structural executive summaries, entity extraction matrices (identifying organizations, dates, and people), sentiment linkages, and key topic tags grouped by confidence coefficient scores.'
    },
    {
      question: 'Is there support for multi-tenant organizations?',
      answer: 'Absolutely. Enterprise tier access supports organization hierarchies, isolated databases, custom billing structures, and private dedicated worker nodes to guarantee performance SLAs.'
    }
  ];

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="w-full max-w-[850px] mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-lp-secondary">
          Frequently Answered Questions
        </h2>
        <p className="text-sm md:text-base text-lp-muted max-w-xl mx-auto">
          Got questions about pipeline queues, security mechanisms, or billing? We have answers.
        </p>
      </div>

      {/* Accordion Layout */}
      <div className="space-y-4 select-none">
        {faqs.map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl border border-lp-border bg-lp-card/40 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => handleToggle(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer group focus-visible:outline-none focus-visible:bg-white/5"
              >
                <span className="font-bold text-sm md:text-base text-lp-secondary group-hover:text-lp-primary transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-lp-muted group-hover:text-lp-primary transition-all duration-300 ${
                    isExpanded ? 'rotate-180 text-lp-primary' : 'rotate-0'
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    <div className="px-6 pb-6 text-xs md:text-sm text-lp-muted leading-relaxed border-t border-lp-border/20 pt-4 select-text">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
