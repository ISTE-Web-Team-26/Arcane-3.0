import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { TextEffectController } from '@external/tte-js/src/index.js'
import art from '../../assets/arcane-3.0.txt?raw'
import { themePalette } from '../../helpers/theme.ts'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const controllerRef = useRef<TextEffectController | null>(null)

  useEffect(() => {
    let cancelled = false
    let observer: IntersectionObserver | null = null

    const start = async () => {
      // Dynamic import: tte-js loads as a separate chunk after first paint,
      // so it stays off the critical path for initial page load.
      const { createTextEffect } = await import(
        '@external/tte-js/src/index.js'
      )
      if (cancelled || !preRef.current) return
      controllerRef.current = createTextEffect(preRef.current, {
        effect: 'thunderstorm',
        duration: 1200,
        fps: 60,
        loop: true,
        colors: themePalette(),
      })
    }

    const section = sectionRef.current
    if (section && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer?.disconnect()
          void start()
        }
      })
      observer.observe(section)
    } else {
      void start()
    }

    return () => {
      cancelled = true
      observer?.disconnect()
      controllerRef.current?.destroy()
      controllerRef.current = null
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="home"
      className="flex min-h-[62svh] w-full scroll-mt-20 flex-col items-center justify-center text-center"
    >
      <h1 className="sr-only">Arcane 3.0</h1>
      <pre
        ref={preRef}
        aria-label="Arcane 3.0"
        className="mx-auto w-fit max-w-full overflow-x-auto font-mono text-xs leading-[1.4] text-transparent sm:text-sm md:text-base"
      >
        {art}
      </pre>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/event1"
          className="rounded-lg bg-medium-red px-4 py-2 text-sm font-medium text-mist transition-colors hover:bg-dark-red"
        >
          Explore events
        </Link>
        <a
          href="#about"
          className="rounded-lg border border-dark-red/30 bg-near-black/5 px-4 py-2 text-sm font-medium text-near-black transition-shadow hover:shadow-lg dark:border-mist/20 dark:bg-mist/10 dark:text-mist"
        >
          Learn more
        </a>
      </div>
    </section>
  )
}
