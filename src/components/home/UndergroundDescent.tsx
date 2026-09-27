import { useEffect, useRef } from 'react'
import soilTextureUrl from '../../assets/soil-texture.jpg'

export default function UndergroundDescent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    let scrollProgress = 0 // 0 when at hero bottom, 1 when inside about

    // High speed upward streaming ember particles during descent
    const EMBER_COUNT = 45
    const embers = Array.from({ length: EMBER_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.2 + Math.random() * 0.8, // depth
      baseSpeed: 0.6 + Math.random() * 1.4,
      size: 2 + Math.random() * 3,
      color: Math.random() > 0.4 ? '#e05652' : Math.random() > 0.5 ? '#f9b282' : '#ffffff',
      alpha: 0.2 + Math.random() * 0.7,
      aspect: 0.6 + Math.random() * 0.8,
    }))

    const resize = () => {
      if (!canvas || !container) return
      const rect = container.getBoundingClientRect()
      width = canvas.width = rect.width || window.innerWidth
      height = canvas.height = rect.height || 360
    }

    resize()
    window.addEventListener('resize', resize)

    const updateScroll = () => {
      if (!container) return
      const rect = container.getBoundingClientRect()
      const vh = window.innerHeight
      // Progress from 0 (approaching transition) to 1 (passed transition)
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height * 0.5)))
      scrollProgress = progress
    }

    window.addEventListener('scroll', updateScroll, { passive: true })
    updateScroll()

    let tick = 0
    const render = () => {
      tick++
      ctx.clearRect(0, 0, width, height)

      // Speed multiplier based on scroll activity / progress
      const speedMultiplier = 1.0 + scrollProgress * 3.5

      // Draw streaming cavern embers rushing upwards as user descends
      for (let i = 0; i < embers.length; i++) {
        const p = embers[i]
        p.y -= (p.baseSpeed * speedMultiplier * 0.005) / p.z

        if (p.y < -0.1) {
          p.y = 1.1
          p.x = Math.random()
        }

        const screenX = p.x * width
        const screenY = p.y * height
        const screenPSize = p.size * (1.2 / p.z)

        ctx.save()
        ctx.globalAlpha = p.alpha * Math.min(1, scrollProgress * 1.8 + 0.2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = p.z < 0.5 ? 8 : 4

        // Draw stretched speed-ember when scrolling fast
        const streakLength = Math.max(screenPSize, screenPSize * (1 + scrollProgress * 2.5))
        ctx.fillRect(screenX, screenY, screenPSize, streakLength)
        ctx.restore()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', updateScroll)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none relative -mx-4 -mt-10 h-32 sm:h-44 sm:-mx-8 overflow-hidden z-20 select-none"
    >
      {/* Dynamic Geological Crust Strata SVG Silhouette */}
      <svg
        className="absolute inset-0 h-full w-full object-cover preserve-3d"
        viewBox="0 0 1440 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="crustGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#040203" stopOpacity="0" />
            <stop offset="30%" stopColor="#040203" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#040203" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#040203" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="magmaGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#831b1c" stopOpacity="0" />
            <stop offset="25%" stopColor="#aa3430" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ff8580" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#aa3430" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#831b1c" stopOpacity="0" />
          </linearGradient>
          <pattern id="soilOverlay" width="260" height="260" patternUnits="userSpaceOnUse">
            <image href={soilTextureUrl} width="260" height="260" opacity="0.45" />
          </pattern>
        </defs>

        {/* Cavern Arch & Jagged Crust Layers */}
        <path
          d="M0 120 C 180 80, 320 140, 520 100 C 720 60, 900 130, 1120 90 C 1280 60, 1380 110, 1440 95 L 1440 280 L 0 280 Z"
          fill="url(#crustGrad)"
        />
        <path
          d="M0 120 C 180 80, 320 140, 520 100 C 720 60, 900 130, 1120 90 C 1280 60, 1380 110, 1440 95 L 1440 280 L 0 280 Z"
          fill="url(#soilOverlay)"
        />

        {/* Glowing Subterranean Seam Line */}
        <path
          d="M0 120 C 180 80, 320 140, 520 100 C 720 60, 900 130, 1120 90 C 1280 60, 1380 110, 1440 95"
          stroke="url(#magmaGlow)"
          strokeWidth="3.5"
          className="animate-pulse"
        />
      </svg>

      {/* Speed Ember Canvas (Upward rushing particle tunnel) */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Atmospheric Cavern Depth Fog */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#040203]/60 to-[#040203]" />
    </div>
  )
}
