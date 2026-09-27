import { Link } from 'react-router'
import { motion, type Variants } from 'framer-motion'

interface ContactPerson {
  role: string
  name: string
  designation: string
  phone: string
  email: string
}

const CONTACT_PERSONS: ContactPerson[] = [
  {
    role: 'STUDENT CONVENER',
    name: 'Lead Coordinator',
    designation: 'ISTE FISAT Student Chapter',
    phone: '+91 98460 12345',
    email: 'convener.arcane@fisat.ac.in',
  },
  {
    role: 'TECHNICAL HEAD',
    name: 'Technical Coordinator',
    designation: 'Arcane Tech Operations',
    phone: '+91 98460 67890',
    email: 'tech.arcane@fisat.ac.in',
  },
  {
    role: 'EVENT & LOGISTICS LEAD',
    name: 'Events Coordinator',
    designation: 'Hospitality & Arena Management',
    phone: '+91 98460 54321',
    email: 'events.arcane@fisat.ac.in',
  },
]

export default function Contact() {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  }

  return (
    <footer
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-20 border-t border-dark-red/30 px-4 pt-12 pb-8 font-content sm:px-8 sm:pt-16"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header Tag with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase">
            <span
              className="inline-block h-2 w-2 bg-medium-red"
              aria-hidden="true"
            />
            <span>Communications // Terminal</span>
          </div>

          {/* Section Heading */}
          <div className="mb-10 sm:mb-14">
            <h2
              id="contact-heading"
              className="font-heading text-3xl font-bold tracking-tight text-mist sm:text-4xl md:text-5xl dark:text-mist"
            >
              GET IN{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e05652] via-[#ea6e6b] to-[#f4938f]">
                TOUCH
              </span>
            </h2>
            <p className="mt-2 max-w-2xl font-content text-xs text-mist/70 sm:text-sm md:text-base">
              Have questions regarding registrations, schedule, travel assistance,
              or sponsorships? Reach out to our team directly or connect across
              our official channels.
            </p>
          </div>
        </motion.div>

        {/* Official Social & Direct Channels Grid with Staggered Scroll Motion */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
          className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5"
        >
          {/* Instagram Card */}
          <motion.a
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.015 }}
            href="https://instagram.com/iste_fisat"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between rounded-xl border border-dark-red/30 bg-near-black/80 p-5 transition-colors duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.18)]"
          >
            <div>
              <div className="flex items-center justify-between pb-3">
                <span className="font-mono text-[11px] font-semibold tracking-widest text-mist/60 uppercase">
                  INSTAGRAM
                </span>
                <svg
                  className="h-5 w-5 text-medium-red transition-transform duration-300 group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <p className="font-heading text-xl font-bold tracking-tight text-mist sm:text-2xl">
                @iste_fisat
              </p>
              <p className="mt-2 font-content text-xs leading-relaxed text-mist/70">
                Live stories, announcements, event schedules & teaser drops.
              </p>
            </div>
            <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-dark-red to-medium-red transition-all duration-500 group-hover:w-full" />
            </div>
          </motion.a>

          {/* LinkedIn Card */}
          <motion.a
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.015 }}
            href="https://linkedin.com/company/iste-fisat"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between rounded-xl border border-dark-red/30 bg-near-black/80 p-5 transition-colors duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.18)]"
          >
            <div>
              <div className="flex items-center justify-between pb-3">
                <span className="font-mono text-[11px] font-semibold tracking-widest text-mist/60 uppercase">
                  LINKEDIN
                </span>
                <svg
                  className="h-5 w-5 text-medium-red transition-transform duration-300 group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </div>
              <p className="font-heading text-xl font-bold tracking-tight text-mist sm:text-2xl">
                ISTE FISAT
              </p>
              <p className="mt-2 font-content text-xs leading-relaxed text-mist/70">
                Professional updates, industry sponsors & chapter highlights.
              </p>
            </div>
            <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-dark-red to-medium-red transition-all duration-500 group-hover:w-full" />
            </div>
          </motion.a>

          {/* Email Card */}
          <motion.a
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.015 }}
            href="mailto:iste@fisat.ac.in"
            className="group relative flex flex-col justify-between rounded-xl border border-dark-red/30 bg-near-black/80 p-5 transition-colors duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.18)]"
          >
            <div>
              <div className="flex items-center justify-between pb-3">
                <span className="font-mono text-[11px] font-semibold tracking-widest text-mist/60 uppercase">
                  OFFICIAL EMAIL
                </span>
                <svg
                  className="h-5 w-5 text-medium-red transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="font-heading text-lg font-bold tracking-tight text-mist sm:text-xl break-all">
                iste@fisat.ac.in
              </p>
              <p className="mt-2 font-content text-xs leading-relaxed text-mist/70">
                Official queries, partnership proposals & student support.
              </p>
            </div>
            <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
              <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-dark-red to-medium-red transition-all duration-500 group-hover:w-full" />
            </div>
          </motion.a>

          {/* Venue / Campus Card */}
          <motion.a
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.015 }}
            href="https://maps.google.com/?q=Federal+Institute+of+Science+And+Technology+FISAT+Angamaly"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between rounded-xl border border-dark-red/30 bg-near-black/80 p-5 transition-colors duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.18)]"
          >
            <div>
              <div className="flex items-center justify-between pb-3">
                <span className="font-mono text-[11px] font-semibold tracking-widest text-mist/60 uppercase">
                  VENUE // CAMPUS
                </span>
                <svg
                  className="h-5 w-5 text-medium-red transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="font-heading text-xl font-bold tracking-tight text-mist sm:text-2xl">
                FISAT, Angamaly
              </p>
              <p className="mt-2 font-content text-xs leading-relaxed text-mist/70">
                Hormis Nagar, Mookkannoor, Angamaly, Kerala 683577.
              </p>
            </div>
            <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-dark-red to-medium-red" />
            </div>
          </motion.a>
        </motion.div>

        {/* 3 People Contact Grid with Staggered Scroll Motion */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="mb-4 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-medium-red uppercase"
          >
            <span>// KEY CONTACT PERSONS</span>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid grid-cols-1 gap-4 md:grid-cols-3 sm:gap-5"
          >
            {CONTACT_PERSONS.map((person, idx) => (
              <motion.div
                key={person.role}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.015 }}
                className="group relative flex flex-col justify-between rounded-xl border border-dark-red/30 bg-near-black/80 p-5 transition-colors duration-300 hover:border-medium-red/60 hover:shadow-[0_0_25px_rgba(170,52,48,0.18)]"
              >
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-mono text-[11px] font-semibold tracking-widest text-mist/60 uppercase">
                      {person.role}
                    </span>
                    <span className="font-mono text-xs font-bold text-medium-red">
                      [0{idx + 1}]
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold tracking-wide text-mist transition-colors group-hover:text-white sm:text-2xl">
                    {person.name}
                  </h3>

                  <p className="mt-1 font-content text-xs text-mist/60">
                    {person.designation}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-dark-red/20 pt-4 font-mono text-xs">
                    <div className="flex items-center gap-2 text-mist/80">
                      <svg
                        className="h-3.5 w-3.5 text-medium-red shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <a
                        href={`tel:${person.phone.replace(/\s+/g, '')}`}
                        className="transition-colors hover:text-medium-red"
                      >
                        {person.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-mist/80">
                      <svg
                        className="h-3.5 w-3.5 text-medium-red shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <a
                        href={`mailto:${person.email}`}
                        className="transition-colors hover:text-medium-red break-all"
                      >
                        {person.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-dark-red/30">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-dark-red to-medium-red transition-all duration-500 group-hover:w-full" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="flex flex-col gap-6 border-t border-dark-red/30 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-heading text-lg font-bold tracking-wider text-mist uppercase">
              ARCANE 3.0
            </p>
            <p className="text-xs text-mist/60 font-content">
              © {new Date().getFullYear()} ARCANE 3.0. Organized by ISTE FISAT
              Student Chapter. All rights reserved.
            </p>
          </div>

          {/* Quick Nav Links */}
          <nav className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-xs uppercase text-mist/70">
            <Link
              to="/#home"
              className="rounded-sm px-2.5 py-1 transition-colors hover:text-medium-red hover:bg-medium-red/10"
            >
              Home
            </Link>
            <Link
              to="/#about"
              className="rounded-sm px-2.5 py-1 transition-colors hover:text-medium-red hover:bg-medium-red/10"
            >
              About
            </Link>
            <Link
              to="/#events"
              className="rounded-sm px-2.5 py-1 transition-colors hover:text-medium-red hover:bg-medium-red/10"
            >
              Events
            </Link>
            <Link
              to="/#faq"
              className="rounded-sm px-2.5 py-1 transition-colors hover:text-medium-red hover:bg-medium-red/10"
            >
              FAQ
            </Link>
            <Link
              to="/#contact"
              className="rounded-sm px-2.5 py-1 text-medium-red font-bold"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
