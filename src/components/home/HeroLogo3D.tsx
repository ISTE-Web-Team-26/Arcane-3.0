import { useEffect, useRef, useState } from 'react'
import logoUrl from '../../assets/arcane-logo.png'

const LOGO_ASPECT = 2400 / 1023
const RAIN_COLOR = 0x5876a8
const BOLT_COLOR = 0xffffff // white bolt, fat line for extra width

/**
 * Thunderstorm logo rendered with Three.js.
 *
 * Faithful port of the tte-js `thunderstorm` ASCII effect:
 * - blue-grey rain streaks falling in front of the logo
 * - periodic lightning flash every 13 x 110ms tick that blows the logo
 *   out to white (glow 20 in the ASCII renderer) and turns every 8th
 *   drop into a white diagonal (`╱`)
 * - a jagged white thunderbolt (fat line, 3px) only visible on flash frames
 *
 * Three.js is dynamically imported so it stays off the critical path.
 * A static <img> is rendered until WebGL is ready (and as a fallback).
 */
export default function HeroLogo3D({
  anchor = null,
}: {
  /** Free zone (px from container top/bottom) the logo should center in. */
  anchor?: { top: number; bottom: number } | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [webglReady, setWebglReady] = useState(false)
  const [webglFailed, setWebglFailed] = useState(false)
  const anchorRef = useRef(anchor)
  const refreshFitRef = useRef<() => void>(() => {})

  // Mirror the measured free zone and re-fit the logo when it changes.
  useEffect(() => {
    anchorRef.current = anchor
    refreshFitRef.current()
  }, [anchor])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let cancelled = false
    let renderer: import('three').WebGLRenderer | null = null
    let raf = 0
    let visible = true
    let observer: IntersectionObserver | null = null
    let resizeObserver: ResizeObserver | null = null
    let removeResizeListener: (() => void) | null = null
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const disposables: { dispose(): void }[] = []

    const onPointerMove = (e: PointerEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      pointer.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      pointer.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }

    const start = async () => {
      const container = containerRef.current
      if (!container) return

      let THREE: typeof import('three')
      let Line2: typeof import('three/examples/jsm/lines/Line2.js').Line2
      let LineGeometry: typeof import('three/examples/jsm/lines/LineGeometry.js').LineGeometry
      let LineMaterial: typeof import('three/examples/jsm/lines/LineMaterial.js').LineMaterial
      try {
        THREE = await import('three')
        const [line2Mod, lineGeoMod, lineMatMod] = await Promise.all([
          import('three/examples/jsm/lines/Line2.js'),
          import('three/examples/jsm/lines/LineGeometry.js'),
          import('three/examples/jsm/lines/LineMaterial.js'),
        ])
        Line2 = line2Mod.Line2
        LineGeometry = lineGeoMod.LineGeometry
        LineMaterial = lineMatMod.LineMaterial
      } catch {
        if (!cancelled) setWebglFailed(true)
        return
      }
      if (cancelled || !containerRef.current) return

      const testCanvas = document.createElement('canvas')
      const gl =
        testCanvas.getContext('webgl2') ?? testCanvas.getContext('webgl')
      if (!gl) {
        setWebglFailed(true)
        return
      }

      const rendererInstance = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer = rendererInstance
      rendererInstance.setClearColor(0x000000, 0)
      rendererInstance.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      rendererInstance.domElement.setAttribute('aria-hidden', 'true')
      rendererInstance.domElement.style.position = 'absolute'
      rendererInstance.domElement.style.inset = '0'
      rendererInstance.domElement.style.width = '100%'
      rendererInstance.domElement.style.height = '100%'
      // Fade in once ready so the canvas never pops over the fallback image.
      rendererInstance.domElement.style.opacity = '0'
      rendererInstance.domElement.style.transition = 'opacity 700ms ease'
      container.appendChild(rendererInstance.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(32, LOGO_ASPECT, 0.1, 50)
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
      scene.add(logoMesh)

      // Visible-world bounds, refreshed on resize so rain + bolt always
      // cover the full viewport on both landscape (PC) and portrait (mobile).
      const bounds = { halfW: 3.2, halfH: 1.8 }
      // Vertical center for the logo mesh, recomputed by updateFit.
      const aim = { y: 0.32 }
      // Smoothed copy the mesh actually follows — glides instead of jumping
      // when measurements land or the layout reflows.
      const smooth = { y: 0.32 }
      const updateFit = () => {
        const vH =
          2 *
          camera.position.z *
          Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
        const vW = vH * camera.aspect
        bounds.halfW = vW / 2
        bounds.halfH = vH / 2
        // Center the logo halfway between the navbar and the text block.
        // Without measurements yet, fall back to a slight lift above center.
        const Hpx = containerRef.current?.clientHeight ?? 0
        const a = anchorRef.current
        let centerY = 0.32
        let maxH = vH * 0.62
        if (a && Hpx > 0) {
          const avail = Math.max(80, Hpx - a.top - a.bottom)
          const midFromTop = a.top + avail / 2
          const worldPerPx = vH / Hpx
          centerY = (Hpx / 2 - midFromTop) * worldPerPx
          maxH = avail * worldPerPx * 0.9
        }
        aim.y = centerY
        const s = Math.min((vW * 0.92) / BASE_W, maxH / BASE_H, 1.15)
        logoMesh.scale.setScalar(Math.max(s, 0.25))
      }
      refreshFitRef.current = updateFit

      const updateResolutions = () => {
        const size = rendererInstance.getDrawingBufferSize(
          new THREE.Vector2(),
        )
        boltMaterial.resolution.copy(size)
      }

      // --- Rain streaks (thin blue-grey lines) ---------------------------
      const RAIN_COUNT = 300
      const randomX = () => (Math.random() * 2 - 1) * (bounds.halfW + 0.3)
      const randomY = () => (Math.random() * 2 - 1) * (bounds.halfH + 0.3)
      const rainDrops = Array.from({ length: RAIN_COUNT }, () => ({
        x: randomX(),
        y: randomY(),
        z: -1 + Math.random() * 1.4,
        speed: 1.6 + Math.random() * 2.2,
        len: 0.06 + Math.random() * 0.09,
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
        opacity: 0.55,
      })
      disposables.push(rainGeometry, rainMaterial)
      scene.add(new THREE.LineSegments(rainGeometry, rainMaterial))

      // --- Flash rain (every 8th drop becomes a white `╱` on flash) ----
      const FLASH_COUNT = Math.floor(RAIN_COUNT / 8)
      const flashDrops = Array.from({ length: FLASH_COUNT }, () => ({
        x: randomX(),
        y: randomY(),
        z: -0.6 + Math.random() * 1.0,
        speed: 2.2 + Math.random() * 2.4,
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
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      disposables.push(flashGeometry, flashMaterial)
      scene.add(new THREE.LineSegments(flashGeometry, flashMaterial))

      // --- Lightning bolt (visible only on flash frames, fat line 3px) --
      const BOLT_SEGMENTS = 14
      const boltGeometry = new LineGeometry()
      const boltMaterial = new LineMaterial({
        color: BOLT_COLOR,
        linewidth: 3,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      disposables.push(boltGeometry, boltMaterial)
      const bolt = new Line2(boltGeometry, boltMaterial)
      bolt.position.z = -0.3
      bolt.frustumCulled = false
      scene.add(bolt)

      const rebuildBolt = () => {
        const strikeX = (Math.random() * 2 - 1) * bounds.halfW * 0.7
        const top = bounds.halfH + 0.5
        const bottom = -bounds.halfH - 0.5
        const pts: number[] = []
        for (let i = 0; i <= BOLT_SEGMENTS; i += 1) {
          const t = i / BOLT_SEGMENTS
          const y = top - t * (top - bottom)
          const jitter =
            i === 0 || i === BOLT_SEGMENTS
              ? 0
              : (Math.random() - 0.5) * 0.36
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
        updateResolutions()
      }
      updateFit()
      resize()

      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(container)
      }
      window.addEventListener('resize', resize)
      removeResizeListener = () => window.removeEventListener('resize', resize)
      window.addEventListener('pointermove', onPointerMove)

      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
          visible = entries.some((entry) => entry.isIntersecting)
        })
        observer.observe(container)
      }

      setWebglReady(true)
      requestAnimationFrame(() => {
        if (!cancelled) rendererInstance.domElement.style.opacity = '1'
      })

      const clock = new THREE.Clock()
      let flashValue = 0
      let wasFlashing = false

      const tick = () => {
        if (cancelled) return
        raf = requestAnimationFrame(tick)
        if (!visible || document.hidden) {
          clock.getDelta()
          return
        }
        const dt = Math.min(clock.getDelta(), 0.05)
        const elapsedMs = clock.elapsedTime * 1000

        // Same cadence as tte-js thunderstorm:
        // Math.floor(elapsed / 110) % 13 === 0
        const flashing = Math.floor(elapsedMs / 110) % 13 === 0
        if (flashing && !wasFlashing) rebuildBolt()
        wasFlashing = flashing

        const target = flashing ? 1 : 0
        flashValue += (target - flashValue) * (flashing ? 0.65 : 0.14)
        uniforms.uFlash.value = flashValue
        uniforms.uTime.value = clock.elapsedTime

        // Rain falls and wraps across the full viewport.
        const topEdge = bounds.halfH + 0.3
        const bottomEdge = -bounds.halfH - 0.3
        for (let i = 0; i < RAIN_COUNT; i += 1) {
          const drop = rainDrops[i]
          drop.y -= drop.speed * dt
          if (drop.y < bottomEdge) {
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

        for (let i = 0; i < FLASH_COUNT; i += 1) {
          const drop = flashDrops[i]
          drop.y -= drop.speed * dt
          if (drop.y < bottomEdge) {
            drop.y = topEdge
            drop.x = randomX()
          }
          // Diagonal slant -> the ASCII `╱`.
          flashPositions[i * 6] = drop.x
          flashPositions[i * 6 + 1] = drop.y
          flashPositions[i * 6 + 2] = drop.z
          flashPositions[i * 6 + 3] = drop.x + 0.045
          flashPositions[i * 6 + 4] = drop.y + drop.len
          flashPositions[i * 6 + 5] = drop.z
        }
        flashGeometry.attributes.position.needsUpdate = true
        flashMaterial.opacity = flashValue * 0.95
        rainMaterial.opacity = 0.55 - flashValue * 0.2

        boltMaterial.opacity = flashValue
        bolt.visible = flashValue > 0.03

        // Gentle float around the measured halfway point between the
        // navbar and the text block. Eased so reflows glide, never jump.
        pointer.x += (pointer.tx - pointer.x) * 0.06
        pointer.y += (pointer.ty - pointer.y) * 0.06
        smooth.y += (aim.y - smooth.y) * 0.08
        logoMesh.position.y = smooth.y + Math.sin(clock.elapsedTime * 0.8) * 0.03
        logoMesh.rotation.y = pointer.x * 0.08
        logoMesh.rotation.x = -pointer.y * 0.05

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
      window.removeEventListener('pointermove', onPointerMove)
      for (const d of disposables) d.dispose()
      renderer?.dispose()
      renderer?.domElement.remove()
      renderer = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full overflow-hidden"
      role="img"
      aria-label="Arcane 3.0"
    >
      {/* Static fallback: visible until WebGL takes over or if it fails. */}
      <img
        src={logoUrl}
        alt="Arcane 3.0 pixel logo"
        style={
          anchor ? { top: anchor.top, bottom: anchor.bottom } : undefined
        }
        className={`absolute inset-x-0 m-auto h-auto w-[94%] max-w-5xl object-contain transition-opacity duration-500 ${
          anchor ? '' : '-translate-y-[10%] '
        }${webglReady && !webglFailed ? 'opacity-0' : 'opacity-100'}`}
        draggable={false}
      />
      {!webglReady && !webglFailed && (
        <span className="sr-only">Loading lightning effect…</span>
      )}
    </div>
  )
}
