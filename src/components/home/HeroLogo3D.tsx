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
        } catch (err2) {
          console.error('Hero storm disabled: WebGPU unavailable.', err2)
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

      // --- Logo plane -------------------------------------------------
      let texture: import('three').Texture
      try {
        texture = await new THREE.TextureLoader().loadAsync(logoUrl)
      } catch {
        if (!cancelled) setWebglFailed(true)
        rendererInstance.dispose()
        rendererInstance.domElement.remove()
        return
      }
      if (cancelled) {
        texture.dispose()
        rendererInstance.dispose()
        return
      }
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = rendererInstance.capabilities.getMaxAnisotropy()

      const uniforms = {
        uMap: { value: texture },
        uFlash: { value: 0 },
        uTime: { value: 0 },
      }
      const logoMaterial = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        // Drawn last, ignoring depth: the logo always sits above the
        // rain and lightning. Transparent texels are discarded in-shader,
        // so the storm still shows through around the artwork.
        depthTest: false,
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap;
          uniform float uFlash;
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vec4 tex = texture2D(uMap, vUv);
            if (tex.a < 0.02) discard;
            // Subtle electric shimmer so the logo never looks dead flat.
            float shimmer = sin(vUv.y * 120.0 + uTime * 8.0) * 0.5 + 0.5;
            vec3 flashed = mix(tex.rgb, vec3(1.0), uFlash * 0.9);
            flashed += uFlash * vec3(0.35, 0.37, 0.48) * (0.5 + 0.5 * shimmer);
            flashed += tex.rgb * 0.07 * (0.5 + 0.5 * sin(uTime * 2.0));
            gl_FragColor = vec4(flashed, tex.a);
          }
        `,
      })
      disposables.push(logoMaterial, texture)
      // Slightly bigger than before: 5.5 world units wide.
      // `updateFit` below scales it down on narrow/tall screens so it never
      // overflows, and caps its height so the date/countdown block keeps clear space.
      const BASE_W = 5.5
      const BASE_H = BASE_W / LOGO_ASPECT
      const logoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(BASE_W, BASE_H),
        logoMaterial,
      )
      disposables.push(logoMesh.geometry)
      logoMesh.renderOrder = 2
      scene.add(logoMesh)

      // Visible-world bounds, refreshed on resize so rain + bolt always
      // cover the full viewport on both landscape (PC) and portrait (mobile).
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
      const rainLines = new THREE.LineSegments(rainGeometry, rainMaterial)
      rainLines.renderOrder = 0
      scene.add(rainLines)

      // Rain Splash Particle Pool (bursts where drops hit the ground strip)
      const SPLASH_POOL_SIZE = 60
      const splashes = Array.from({ length: SPLASH_POOL_SIZE }, () => ({
        active: false,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        life: 0,
      }))
      let splashIdx = 0

      const spawnSplash = (x: number, y: number, z: number) => {
        const splash = splashes[splashIdx]
        splash.active = true
        splash.x = x
        splash.y = y
        splash.z = z
        splash.vx = (Math.random() - 0.5) * 1.1
        splash.vy = 0.7 + Math.random() * 0.6
        splash.life = 1.0
        splashIdx = (splashIdx + 1) % SPLASH_POOL_SIZE
      }

      const splashPositions = new Float32Array(SPLASH_POOL_SIZE * 2 * 3)
      const splashGeometry = new THREE.BufferGeometry()
      splashGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(splashPositions, 3),
      )
      const splashMaterial = new THREE.LineBasicMaterial({
        color: 0xcfe4ff,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      })
      disposables.push(splashGeometry, splashMaterial)
      const splashSegments = new THREE.LineSegments(splashGeometry, splashMaterial)
      splashSegments.renderOrder = 1
      splashSegments.frustumCulled = false
      scene.add(splashSegments)

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
      const flashLines = new THREE.LineSegments(flashGeometry, flashMaterial)
      flashLines.renderOrder = 0
      scene.add(flashLines)

      // --- Lightning Bolt Arc (fat line, 3px) ---------------------------
      const BOLT_SEGMENTS = 14
      const boltGeometry = new LineGeometry()
      const boltMaterial = new Line2NodeMaterial({
        color: BOLT_COLOR,
        linewidth: 4,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
      disposables.push(boltGeometry, boltMaterial)
      const bolt = new Line2(boltGeometry, boltMaterial)
      bolt.position.z = -0.35
      bolt.renderOrder = 1
      bolt.frustumCulled = false
      bolt.renderOrder = 1
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
        // Bolt width steps up past the mobile breakpoint: 4px below, 6px at/above.
        boltMaterial.linewidth = w < 768 ? 4 : 6
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

        // Strike light-up adapted from the original 3D shader: the logo
        // mixes toward white through the envelope, then slams to pure
        // white for a few frames at the peak. Direct DOM writes.
        const f = Math.round(flashVal * 100) / 100
        const logoEl = logoImgRef.current
        if (logoEl) {
          let nextFilter = ''
          if (f > 0.02) {
            const peak = Math.max(0, (f - 0.55) / 0.45)
            const sat = Math.max(0, 1 - f * 1.6)
            const bri = 1 + f * 1.8 + peak * peak * 28
            nextFilter = `saturate(${sat.toFixed(2)}) brightness(${bri.toFixed(1)})`
          }
          if (logoEl.style.filter !== nextFilter) {
            logoEl.style.filter = nextFilter
          }
        }

        // Rain falls the full height of the hero and exits below the fold
        const topEdge = bounds.halfH + 0.3
        const bottomEdge = -(bounds.halfH + 0.3)
        const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
        for (let i = 0; i < RAIN_COUNT; i += 1) {
          const drop = rainDrops[i]
          drop.y -= drop.speed * dt
          if (drop.y <= bottomEdge) {
            // Splash exactly at the fold for this drop's depth: farther
            // drops need a lower world-Y to land on the same screen line.
            const halfHAtDrop = (camera.position.z - drop.z) * tanHalfFov
            spawnSplash(drop.x, -halfHAtDrop, drop.z)
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

        // Splash updates
        for (let i = 0; i < SPLASH_POOL_SIZE; i += 1) {
          const s = splashes[i]
          if (s.active) {
            s.x += s.vx * dt
            s.y += s.vy * dt
            s.vy -= 4.0 * dt // gravity
            s.life -= dt * 3.2
            if (s.life <= 0) s.active = false
          }
          const base = i * 6
          splashPositions[base] = s.x
          splashPositions[base + 1] = s.y
          splashPositions[base + 2] = s.z
          splashPositions[base + 3] = s.x + s.vx * 0.08
          splashPositions[base + 4] = s.y + s.vy * 0.08
          splashPositions[base + 5] = s.z
        }
        splashGeometry.attributes.position.needsUpdate = true

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
      {/* 2D logo: gently bobs up and down over the storm.
          The wrapper pins it to the free zone between navbar and content
          so it can never overlap the text or hang off-screen. */}
      <div
        className="hero-logo-frame absolute inset-x-0 z-10 px-[7.7%] md:px-[6.25%]"
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
