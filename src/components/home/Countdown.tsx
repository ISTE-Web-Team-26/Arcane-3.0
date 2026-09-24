import { useEffect, useState } from 'react'

// Arcane 3.0 goes down on 29th September 2026 (local midnight).
const TARGET = new Date(2026, 8, 29, 0, 0, 0)

const pad = (n: number) => String(n).padStart(2, '0')

function getParts(now: number) {
  const total = TARGET.getTime() - now
  if (total <= 0) return null
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor(total / 3_600_000) % 24,
    minutes: Math.floor(total / 60_000) % 60,
    seconds: Math.floor(total / 1_000) % 60,
  }
}

export default function Countdown() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const parts = getParts(now)

  if (!parts) {
    return (
      <p
        role="status"
        className="inline-flex items-center gap-2 rounded-md border border-medium-red bg-medium-red/15 px-5 py-2.5 font-heading text-xl font-bold tracking-widest text-medium-red uppercase shadow-[0_0_24px_rgba(170,52,48,0.5)] backdrop-blur-sm sm:text-2xl dark:text-mist"
      >
        <span
          className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-medium-red"
          aria-hidden="true"
        />
        We are live
      </p>
    )
  }

  const units = [
    { label: 'Days', value: pad(parts.days) },
    { label: 'Hours', value: pad(parts.hours) },
    { label: 'Mins', value: pad(parts.minutes) },
    { label: 'Secs', value: pad(parts.seconds) },
  ]

  return (
    <div
      role="timer"
      aria-label={`${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes and ${parts.seconds} seconds remaining until Arcane 3.0`}
      className="flex items-stretch justify-center gap-2 sm:gap-3"
    >
      {units.map((unit) => (
        <div
          key={unit.label}
          className="min-w-[4.25rem] rounded-md border border-medium-red/60 bg-near-black/70 px-3 py-2 shadow-[0_0_18px_rgba(170,52,48,0.35)] backdrop-blur-sm sm:min-w-[5.5rem] sm:px-4 sm:py-3"
        >
          <div className="font-heading text-2xl font-bold tabular-nums text-mist sm:text-4xl">
            {unit.value}
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.2em] text-mist/60 uppercase sm:text-xs">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  )
}
