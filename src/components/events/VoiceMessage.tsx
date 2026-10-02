import { useEffect, useMemo, useRef, useState } from 'react'

const SPEEDS = [1, 1.5, 2] as const
const BAR_COUNT = 42

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** WhatsApp-style voice note player for the organizer voice message. */
export default function VoiceMessage({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speedIndex, setSpeedIndex] = useState(0)
  const [failed, setFailed] = useState(false)

  // Stable pseudo-random waveform so it doesn't reshuffle on re-render.
  const bars = useMemo(() => {
    const hashStr = (s: string): number => {
      const h = [...s].reduce(
        (acc, c) => Math.imul(acc ^ c.charCodeAt(0), 16777619),
        2166136261,
      )
      return h >>> 0
    }
    const base = hashStr(src)
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      const v = (hashStr(`${base}:${i}`) % 100) / 100
      return 6 + Math.abs(Math.sin(i * 0.7) * 0.5 + v * 0.5) * 22
    })
  }, [src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = SPEEDS[speedIndex] ?? 1
  }, [speedIndex])

  function toggle() {
    const audio = audioRef.current
    if (!audio || failed) return
    if (playing) {
      audio.pause()
    } else {
      void audio.play().catch(() => setFailed(true))
    }
  }

  const progress = duration > 0 ? Math.min(1, current / duration) : 0
  const playedBars = Math.round(progress * BAR_COUNT)

  return (
    <div className="flex items-center gap-3 rounded-2xl rounded-tl-md border border-dark-red/35 bg-near-black/80 px-4 py-3">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setPlaying(false)
          setCurrent(0)
        }}
        onError={() => setFailed(true)}
      />
      <button
        type="button"
        onClick={toggle}
        disabled={failed}
        aria-label={playing ? 'Pause voice message' : 'Play voice message'}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-medium-red text-base text-mist transition-all hover:bg-dark-red active:scale-95 disabled:cursor-default disabled:opacity-50"
      >
        {playing ? (
          <span aria-hidden="true" className="flex gap-1">
            <span className="h-3.5 w-1 rounded-sm bg-current" />
            <span className="h-3.5 w-1 rounded-sm bg-current" />
          </span>
        ) : (
          <span aria-hidden="true" className="pl-0.5 text-lg leading-none">
            ▶
          </span>
        )}
      </button>

      <div
        aria-hidden="true"
        className="flex h-8 min-w-0 flex-1 items-center gap-[2px] overflow-hidden"
      >
        {bars.map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}px` }}
            className={`w-[3px] shrink-0 rounded-full transition-colors ${
              i < playedBars ? 'bg-mist' : 'bg-mist/25'
            }`}
          />
        ))}
      </div>

      <span className="shrink-0 font-mono text-[11px] text-mist/70">
        {formatClock(current)} / {formatClock(duration)}
      </span>

      <button
        type="button"
        onClick={() => setSpeedIndex((i) => (i + 1) % SPEEDS.length)}
        aria-label="Playback speed"
        className="shrink-0 cursor-pointer rounded-md border border-dark-red/40 px-1.5 py-1 font-mono text-[11px] font-bold text-mist/75 transition-colors hover:border-medium-red/60 hover:text-mist"
      >
        {(SPEEDS[speedIndex] ?? 1).toFixed(1).replace(/\.0$/, '')}x
      </button>

      {failed && (
        <span className="sr-only">Voice message failed to load.</span>
      )}
    </div>
  )
}
