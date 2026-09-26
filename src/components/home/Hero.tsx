import { useLayoutEffect, useRef, useState } from 'react'
import Countdown from './Countdown.tsx'
import HeroLogo3D from './HeroLogo3D.tsx'

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
  // 3D logo can sit exactly halfway between them. Layout effect: measured
  // before first paint, so nothing ever renders at a placeholder spot.
  useLayoutEffect(() => {
    const measure = () => {
      const section = sectionRef.current
      const content = contentRef.current
      if (!section || !content) return
      const navH =
        document.querySelector('header')?.getBoundingClientRect().height ?? 72
      setAnchor({ top: navH, bottom: content.offsetHeight })
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
      className="relative -mx-4 -mt-[4.5rem] flex h-[100svh] min-h-[560px] max-h-[1080px] max-w-none flex-col items-center justify-between overflow-hidden text-center sm:-mx-8 sm:-mt-[5rem]"
    >
      <h1 className="sr-only">Arcane 3.0</h1>
      <HeroLogo3D anchor={anchor} />

      {/* Spacer zone where 3D Logo floats */}
      <div className="flex-1" aria-hidden="true" />

      {/* Hero Foreground Content - guaranteed to fit within first viewport */}
      <div
        ref={contentRef}
        className="relative z-20 flex flex-col items-center px-4 pb-4 sm:pb-6"
      >
        <p className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.3em] text-medium-red uppercase sm:text-xs">
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

        <p className="mt-1 font-content text-3xl font-bold tracking-normal text-mist [text-shadow:0_0_24px_rgba(170,52,48,0.55)] sm:text-5xl lg:text-6xl">
          29<sup className="text-[0.55em]">TH</sup> SEPTEMBER 2026
        </p>

        <p className="mt-1 flex items-center gap-1.5 font-mono text-xs font-semibold tracking-[0.25em] text-mist/80 uppercase sm:text-sm">
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

        <p className="mt-1.5 max-w-xl font-heading text-xs tracking-wide text-mist/85 sm:text-sm">
          Sparks to ignite. Limits to break.{' '}
          <span className="text-medium-red font-semibold">
            One arena, endless ascents.
          </span>
        </p>

        <div className="mt-2.5 sm:mt-3">
          <Countdown />
        </div>
      </div>
    </section>
  )
}
