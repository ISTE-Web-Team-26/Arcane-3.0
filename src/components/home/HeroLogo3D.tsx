import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three/webgpu'
import logoUrl from '../../assets/arcane-logo.png'
import { Line2 } from 'three/addons/lines/webgpu/Line2.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { Line2NodeMaterial } from 'three/webgpu'

// Exact natural aspect ratio of src/assets/arcane-logo.png (1835w x 533h)
const LOGO_ASPECT = 1835 / 533
const RAIN_COLOR = 0x6a88bc
const BOLT_COLOR = 0xffffff

export interface LogoAnchor {
  top: number
  bottom: number
}

interface HeroLogo3DProps {
  anchor?: LogoAnchor | null
}

/**
 * 3D Hero rain-and-lightning environment powered by WebGPU (with automatic
 * fallback to WebGL2). The logo itself stays a flat 2D image with a gentle
 * up-down bob — no 3D tilt — and the page CSS provides the only ground.
 */
export default function HeroLogo3D({ anchor = null }: HeroLogo3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoImgRef = useRef<HTMLImageElement>(null)
  const [gpuReady, setGpuReady] = useState(false)
  const [gpuFailed, setGpuFailed] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let cancelled = false
    let renderer: THREE.WebGPURenderer | null = null
    let raf = 0
    let visible = true
    let observer: IntersectionObserver | null = null
    let resizeObserver: ResizeObserver | null = null
    let removeResizeListener: (() => void) | null = null
    const disposables: { dispose(): void }[] = []

    const start = async () => {
      const container = containerRef.current
      if (!container) return

      const isMobile = window.innerWidth < 768

      let rendererInstance: THREE.WebGPURenderer
      try {
        rendererInstance = new THREE.WebGPURenderer({
          alpha: true,
          antialias: !isMobile,
          powerPreference: 'high-performance',
        })
        await rendererInstance.init()
      } catch (err) {
        console.warn('WebGPU init fallback to WebGL:', err)
        try {
          rendererInstance = new THREE.WebGPURenderer({
            alpha: true,
            antialias: false,
          })
          await rendererInstance.init()
        } catch {
          if (!cancelled) setGpuFailed(true)
          return
        }
      }

      if (cancelled || !containerRef.current) {
        rendererInstance.dispose()
        return
      }

      renderer = rendererInstance
      rendererInstance.setClearColor(0x000000, 0)
      rendererInstance.setPixelRatio(window.devicePixelRatio)
      rendererInstance.domElement.setAttribute('aria-hidden', 'true')
      rendererInstance.domElement.style.position = 'absolute'
      rendererInstance.domElement.style.inset = '0'
      rendererInstance.domElement.style.width = '100%'
      rendererInstance.domElement.style.height = '100%'
      rendererInstance.domElement.style.opacity = '0'
      rendererInstance.domElement.style.transition = 'opacity 700ms ease'
      container.appendChild(rendererInstance.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(34, LOGO_ASPECT, 0.1, 50)
      camera.position.set(0, 0, 5.2)

      // Bounds (rain, bolt and flash rain span the full view)
      const bounds = { halfW: 3.2, halfH: 1.8 }

      const updateFit = () => {
        const vH =
          2 *
          camera.position.z *
          Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
        const vW = vH * camera.aspect
        bounds.halfW = vW / 2
        bounds.halfH = vH / 2
      }

      // --- Rain Streaks (Atmospheric Thunderstorm Behind Logo) ----------
      const RAIN_COUNT = 260
      const randomX = () => (Math.random() * 2 - 1) * (bounds.halfW + 0.4)
      const randomY = () => (Math.random() * 2 - 1) * (bounds.halfH + 0.4)

      const rainDrops = Array.from({ length: RAIN_COUNT }, () => ({
        x: randomX(),
        y: randomY(),
        z: -0.45 - Math.random() * 0.85,
        speed: 1.8 + Math.random() * 2.4,
        len: 0.07 + Math.random() * 0.09,
      }))

      const rainPositions = new Float32Array(RAIN_COUNT * 2 * 3)
      const rainGeometry = new THREE.BufferGeometry()
      rainGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(rainPositions, 3),
      )
      const rainMaterial = new THREE.LineBasicMaterial({
        color: RAIN_COLOR,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      })
      disposables.push(rainGeometry, rainMaterial)
      const rainSegments = new THREE.LineSegments(rainGeometry, rainMaterial)
      rainSegments.renderOrder = 1
      scene.add(rainSegments)

      // --- Flash Rain (Diagonal slants during lightning, behind logo) ---
      const FLASH_COUNT = Math.floor(RAIN_COUNT / 8)
      const flashDrops = Array.from({ length: FLASH_COUNT }, () => ({
        x: randomX(),
        y: randomY(),
        z: -0.45 - Math.random() * 0.85,
        speed: 2.3 + Math.random() * 2.2,
        len: 0.08 + Math.random() * 0.08,
      }))
      const flashPositions = new Float32Array(FLASH_COUNT * 2 * 3)
      const flashGeometry = new THREE.BufferGeometry()
      flashGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(flashPositions, 3),
      )
      const flashMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
      disposables.push(flashGeometry, flashMaterial)
      const flashSegments = new THREE.LineSegments(flashGeometry, flashMaterial)
      flashSegments.renderOrder = 1
      scene.add(flashSegments)

      // --- Lightning Bolt Arc (fat line, 3px) ---------------------------
      const BOLT_SEGMENTS = 14
      const boltGeometry = new LineGeometry()
      const boltMaterial = new Line2NodeMaterial({
        color: BOLT_COLOR,
        linewidth: 3,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
      disposables.push(boltGeometry, boltMaterial)
      const bolt = new Line2(boltGeometry, boltMaterial)
      bolt.position.z = -0.35
      bolt.renderOrder = 1
      bolt.frustumCulled = false
      scene.add(bolt)

      const rebuildBolt = () => {
        const strikeX = (Math.random() * 2 - 1) * bounds.halfW * 0.7
        const top = bounds.halfH + 0.5
        const bottom = -(bounds.halfH + 0.5)
        const pts: number[] = []
        for (let i = 0; i <= BOLT_SEGMENTS; i += 1) {
          const t = i / BOLT_SEGMENTS
          const y = top - t * (top - bottom)
          const jitter =
            i === 0 || i === BOLT_SEGMENTS ? 0 : (Math.random() - 0.5) * 0.36
          pts.push(strikeX + jitter + t * 0.25, y, 0)
        }
        boltGeometry.setPositions(pts)
      }
      rebuildBolt()

      const resize = () => {
        const el = containerRef.current
        if (!el || !renderer) return
        const w = el.clientWidth
        const h = el.clientHeight
        if (w === 0 || h === 0) return
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        updateFit()
      }
      updateFit()
      resize()

      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(container)
      }
      window.addEventListener('resize', resize)
      removeResizeListener = () => window.removeEventListener('resize', resize)

      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
          visible = entries.some((entry) => entry.isIntersecting)
        })
        observer.observe(container)
      }

      setGpuReady(true)
      requestAnimationFrame(() => {
        if (!cancelled) rendererInstance.domElement.style.opacity = '1'
      })

      const clock = new THREE.Clock()
      let flashVal = 0
      let wasFlashing = false

      const tick = () => {
        if (cancelled) return
        raf = requestAnimationFrame(tick)
        if (document.hidden || !visible) {
          clock.getDelta()
          return
        }

        const dt = Math.min(clock.getDelta(), 0.05)
        const elapsedMs = clock.elapsedTime * 1000

        // Lightning Flash Timing
        const flashing = Math.floor(elapsedMs / 110) % 13 === 0
        if (flashing && !wasFlashing) rebuildBolt()
        wasFlashing = flashing

        const targetFlash = flashing ? 1 : 0
        flashVal += (targetFlash - flashVal) * (flashing ? 0.65 : 0.14)

        // Light up the 2D logo on lightning strikes (mirrors the old
        // white-blowout shader). Direct DOM write — no re-render.
        const logoEl = logoImgRef.current
        if (logoEl) {
          const f = Math.round(flashVal * 100) / 100
          const nextFilter =
            f > 0.02
              ? `brightness(${(1 + f * 1.6).toFixed(2)}) drop-shadow(0 0 ${(f * 28).toFixed(1)}px rgba(255,255,255,${(f * 0.9).toFixed(2)}))`
              : ''
          if (logoEl.style.filter !== nextFilter) {
            logoEl.style.filter = nextFilter
          }
        }

        // Rain falls the full height of the hero and exits below the fold
        const topEdge = bounds.halfH + 0.3
        const bottomEdge = -(bounds.halfH + 0.3)
        for (let i = 0; i < RAIN_COUNT; i += 1) {
          const drop = rainDrops[i]
          drop.y -= drop.speed * dt
          if (drop.y <= bottomEdge) {
            drop.y = topEdge
            drop.x = randomX()
          }
          rainPositions[i * 6] = drop.x
          rainPositions[i * 6 + 1] = drop.y
          rainPositions[i * 6 + 2] = drop.z
          rainPositions[i * 6 + 3] = drop.x
          rainPositions[i * 6 + 4] = drop.y + drop.len
          rainPositions[i * 6 + 5] = drop.z
        }
        rainGeometry.attributes.position.needsUpdate = true

        // Flash Rain Updates
        for (let i = 0; i < FLASH_COUNT; i += 1) {
          const drop = flashDrops[i]
          drop.y -= drop.speed * dt
          if (drop.y <= bottomEdge) {
            drop.y = topEdge
            drop.x = randomX()
          }
          flashPositions[i * 6] = drop.x
          flashPositions[i * 6 + 1] = drop.y
          flashPositions[i * 6 + 2] = drop.z
          flashPositions[i * 6 + 3] = drop.x + 0.045
          flashPositions[i * 6 + 4] = drop.y + drop.len
          flashPositions[i * 6 + 5] = drop.z
        }
        flashGeometry.attributes.position.needsUpdate = true
        flashMaterial.opacity = flashVal * 0.95
        rainMaterial.opacity = 0.6 - flashVal * 0.2

        boltMaterial.opacity = flashVal
        bolt.visible = flashVal > 0.03

        renderer?.render(scene, camera)
      }
      tick()
    }

    const section = containerRef.current
    if (section && 'IntersectionObserver' in window) {
      const lazyObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            lazyObserver.disconnect()
            void start()
          }
        },
        { rootMargin: '200px' },
      )
      lazyObserver.observe(section)
      observer = lazyObserver
    } else {
      void start()
    }

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      observer?.disconnect()
      resizeObserver?.disconnect()
      removeResizeListener?.()
      for (const d of disposables) d.dispose()
      renderer?.dispose()
      renderer?.domElement.remove()
      renderer = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none"
      role="img"
      aria-label="Arcane 3.0 Hero Environment"
    >
      {/* 2D logo: gently bobs up and down over the 3D storm.
          The wrapper pins it to the free zone between navbar and content
          so it can never overlap the text or hang off-screen. */}
      <div
        className="absolute inset-x-0 z-10 px-[7.7%] md:px-[6.25%]"
        style={
          anchor
            ? { top: anchor.top, bottom: anchor.bottom }
            : { top: 0, bottom: 0 }
        }
      >
        <img
          ref={logoImgRef}
          src={logoUrl}
          alt="Arcane 3.0 pixel logo"
          className="animate-logo-bob mx-auto h-full w-full object-contain pointer-events-auto md:max-w-[60rem]"
          draggable={false}
        />
      </div>
      {!gpuReady && !gpuFailed && (
        <span className="sr-only">Loading underground environment…</span>
      )}
    </div>
  )
}
