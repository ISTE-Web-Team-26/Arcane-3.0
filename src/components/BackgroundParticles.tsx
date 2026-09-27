import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  baseAlpha: number
  alpha: number
  alphaSpeed: number
  color: string
  aspectRatio: number
}

const PARTICLE_COLORS = [
  '#f5938f', // warm coral/pink ember
  '#e05652', // medium red ember
  '#f9b282', // warm amber ember
  '#ffd8b8', // bright highlight speck
  '#c7413d', // deep crimson speck
  '#ffffff', // pure white hot spark
]

interface BackgroundParticlesProps {
  density?: number // particles per 100,000 px^2
  className?: string
}

export default function BackgroundParticles({
  density = 16,
  className = '',
}: BackgroundParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    let particles: Particle[] = []
    let lastTime = 0
    const TARGET_INTERVAL = 1000 / 30 // Cap at 30fps for perf

    const initParticles = () => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      // Use CSS pixel dimensions — no need for devicePixelRatio scaling on
      // simple particle effects. Halves GPU fill cost on retina screens.
      width = canvas.width = rect.width || window.innerWidth
      height = canvas.height = rect.height || window.innerHeight

      const area = (width * height) / 100000
      const count = Math.max(25, Math.floor(area * density))

      particles = Array.from({ length: count }, () => {
        const baseAlpha = 0.25 + Math.random() * 0.65
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size:
            Math.random() < 0.7
              ? 2 + Math.random() * 1.8
              : 3.8 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -(0.25 + Math.random() * 0.55), // gentle upward float
          baseAlpha,
          alpha: baseAlpha,
          alphaSpeed: 0.008 + Math.random() * 0.02,
          color:
            PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          aspectRatio: 0.8 + Math.random() * 0.4,
        }
      })
    }

    initParticles()

    // Debounce resize to avoid thrashing
    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(initParticles, 200)
    }

    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    }
    window.addEventListener('resize', handleResize)

    let tick = 0
    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render)

      // Throttle to ~30fps
      if (now - lastTime < TARGET_INTERVAL) return
      lastTime = now

      tick++
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Update position — simplified drift (one sin instead of per-frame)
        p.x += p.vx + Math.sin(tick * 0.02 + i) * 0.15
        p.y += p.vy

        // Alpha twinkle
        p.alpha = p.baseAlpha + Math.sin(tick * p.alphaSpeed + i * 2) * 0.25
        if (p.alpha < 0.1) p.alpha = 0.1
        else if (p.alpha > 0.95) p.alpha = 0.95

        // Wrap around boundaries
        if (p.y < -10) {
          p.y = height + 5
          p.x = Math.random() * width
        }
        if (p.x < -10) p.x = width + 5
        if (p.x > width + 10) p.x = -5

        // Draw simple filled rect — NO shadowBlur (massive perf savings)
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, p.size, p.size * p.aspectRatio)
      }

      // Reset globalAlpha
      ctx.globalAlpha = 1
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
      if (resizeTimer) clearTimeout(resizeTimer)
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full select-none z-0 ${className}`}
    />
  )
}
