import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Countdown from './Countdown.tsx'

const HeroLogo3D = lazy(() => import('./HeroLogo3D.tsx'))

export interface LogoAnchor {
  /** Free-zone inset from the viewport top (below the navbar), in px. */
  top: number
  /** Free-zone inset from the viewport bottom (the text block height), in px. */
  bottom: number
}


export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState<LogoAnchor | null>(null)

  // Measure the free zone between the navbar and the text block so the
  // 3D logo can sit exactly halfway between them.
  useLayoutEffect(() => {
    const measure = () => {
      const section = sectionRef.current
      const content = contentRef.current
      if (!section || !content) return
      const navH =
        document.querySelector('header')?.getBoundingClientRect().height ?? 72
      setAnchor({ top: navH, bottom: content.offsetHeight + 12 })
    }
    measure()
    window.addEventListener('resize', measure)
    const ro = new ResizeObserver(measure)
    if (sectionRef.current) ro.observe(sectionRef.current)
    if (contentRef.current) ro.observe(contentRef.current)
    return () => {
      window.removeEventListener('resize', measure)
      ro.disconnect()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative -mx-4 -mt-[4.5rem] flex max-w-none flex-col items-center justify-end overflow-x-clip bg-mist text-center sm:-mx-8 sm:-mt-[5rem] min-h-[calc(100svh-4.5rem)] sm:min-h-[calc(100svh-5rem)] dark:bg-near-black"
    >
      <h1 className="sr-only">Arcane 3.0</h1>
      <HeroLogo3D anchor={anchor} />
      {/* Compacted topsoil lip the rain sinks into. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-12 bg-gradient-to-b from-transparent to-[#9a7a53] dark:to-[#120b06]"
      />
      <div
        ref={contentRef}
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative z-20 flex flex-col items-center px-4 pb-18 sm:pb-20 md:pb-24"
      >
        <p className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.3em] text-medium-red uppercase sm:text-xs">
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse bg-medium-red"
            aria-hidden="true"
          />
          Save the date
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse bg-medium-red"
            aria-hidden="true"
          />
        </p>

        <p className="mt-2 font-content text-3xl font-bold tracking-normal text-mist [text-shadow:0_0_28px_rgba(170,52,48,0.55)] sm:text-5xl md:text-6xl leading-tight">
          6<sup className="text-[0.55em]">TH</sup> – 8<sup className="text-[0.55em]">TH</sup> OCTOBER 2026
        </p>

        <p className="mt-2 flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.25em] text-mist/80 uppercase sm:text-sm">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="text-medium-red"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          FISAT, Angamaly
        </p>

        <p className="mt-2 max-w-xl font-heading text-xs tracking-wide text-mist/85 sm:text-sm">
          Sparks to ignite. Limits to break.{' '}
          <span className="text-medium-red font-semibold">
            One arena, endless ascents.
          </span>
        </p>

        <div className="mt-4">
          <Countdown />
        </div>
      </motion.div>
    </section>
  )
}
