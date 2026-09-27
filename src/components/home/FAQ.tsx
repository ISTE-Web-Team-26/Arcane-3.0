import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItem {
  id: string
  question: string
  answer: string
  category?: string
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Who can participate in ARCANE 3.0?',
    answer:
      'ARCANE 3.0 is open to all undergraduate and postgraduate students from any recognized college or university across India. Tech enthusiasts, coders, designers, and gamers across all disciplines are welcome to participate.',
    category: 'ELIGIBILITY',
  },
  {
    id: 'faq-2',
    question: 'How do I register for events and competitions?',
    answer:
      'You can register directly through our website by navigating to the Events section and clicking the REGISTER button on your desired event card. Follow the instructions to enter your team/individual details and lock in your slot.',
    category: 'REGISTRATION',
  },
  {
    id: 'faq-3',
    question: 'Is there a registration fee?',
    answer:
      'Registration fees vary depending on the specific event track. Some flagship hackathons and workshops have nominal entry fees, while select events are completely free. Exact fee details are listed on individual event registration pages.',
    category: 'PAYMENTS',
  },
  {
    id: 'faq-4',
    question: 'Can I participate in multiple events?',
    answer:
      'Yes! You are encouraged to participate in multiple technical hackathons, coding contests, workshops, and gaming tournaments, provided their schedules and time slots do not clash.',
    category: 'SCHEDULE',
  },
  {
    id: 'faq-5',
    question: 'What are the prizes and certificates provided?',
    answer:
      'ARCANE 3.0 features a prize pool of ₹100K+ in cash rewards, sponsor bounties, certificates, and trophies. All verified participants will receive official certificates of participation recognized by ISTE FISAT.',
    category: 'REWARDS',
  },
  {
    id: 'faq-6',
    question: 'Where is ARCANE 3.0 being hosted?',
    answer:
      'ARCANE 3.0 is conducted on-campus at Federal Institute of Science And Technology (FISAT), Hormis Nagar, Mookkannoor, Angamaly, Kerala. Select preliminary rounds for specific coding tracks may be conducted online.',
    category: 'VENUE',
  },
  {
    id: 'faq-7',
    question: 'Will accommodation and travel assistance be provided?',
    answer:
      'Accommodation facilities can be arranged for participants traveling from distant institutions upon prior request during registration. Please reach out to our hospitality team via the Contact section for arrangements.',
    category: 'LOGISTICS',
  },
]

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>('faq-1')

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative w-full scroll-mt-20 py-12 sm:py-16"
    >
      {/* Header with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
      >
        {/* Top Header Tag */}
        <div className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
          <span
            className="inline-block h-2 w-2 bg-medium-red"
            aria-hidden="true"
          />
          <span>Knowledge Base // FAQ</span>
        </div>

        {/* Main Section Header */}
        <div className="mb-8 sm:mb-12">
          <h2
            id="faq-heading"
            className="font-heading text-3xl font-bold tracking-tight text-mist sm:text-4xl md:text-5xl dark:text-mist"
          >
            FREQUENTLY ASKED{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] via-[#ea6e6b] to-[#f4938f]">
              QUESTIONS
            </span>
          </h2>
          <p className="mt-2 max-w-3xl font-content text-xs text-mist/70 sm:text-sm md:text-base">
            Got questions? We have answers. If you can&apos;t find what you are
            looking for, feel free to reach out to our team via the contact
            channels below.
          </p>
        </div>
      </motion.div>

      {/* Accordion List with Staggered Scroll Entrance */}
      <div className="space-y-3 sm:space-y-4">
        {FAQS.map((faq, index) => {
          const isOpen = openId === faq.id
          const formattedIndex = String(index + 1).padStart(2, '0')

          return (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{
                duration: 0.45,
                delay: index * 0.06,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
              className={`overflow-hidden rounded-xl border transition-colors duration-300 ${
                isOpen
                  ? 'border-medium-red/70 bg-near-black/90 shadow-[0_0_25px_rgba(170,52,48,0.2)]'
                  : 'border-dark-red/30 bg-near-black/70 hover:border-medium-red/50 hover:bg-near-black/80'
              }`}
            >
              {/* Accordion Trigger Header */}
              <button
                type="button"
                onClick={() => toggleAccordion(faq.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${faq.id}`}
                className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-medium-red"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-medium-red">
                    [{formattedIndex}]
                  </span>
                  <span className="font-content text-sm sm:text-base font-semibold tracking-wide text-mist transition-colors">
                    {faq.question}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {faq.category && (
                    <span className="hidden sm:inline-block rounded-xs border border-dark-red/40 bg-dark-red/10 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-mist/60 uppercase">
                      {faq.category}
                    </span>
                  )}
                  {/* Chevron Toggle Icon */}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                      isOpen
                        ? 'border-medium-red bg-medium-red text-mist shadow-[0_0_12px_rgba(170,52,48,0.6)]'
                        : 'border-dark-red/40 bg-near-black/50 text-mist/70 hover:border-medium-red/60 hover:text-mist'
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </div>
              </button>

              {/* Accordion Content Panel with Framer Motion AnimatePresence */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    aria-labelledby={faq.id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-dark-red/20 px-4 pt-3 pb-5 sm:px-5 sm:pb-6">
                      <p className="font-content text-xs sm:text-sm leading-relaxed text-mist/80">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
