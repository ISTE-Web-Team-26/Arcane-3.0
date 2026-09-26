import { useEffect, useRef, useState } from 'react'
import logoUrl from '../../assets/arcane-logo.png'
import soilTextureUrl from '../../assets/soil-texture.jpg'

const LOGO_ASPECT = 2400 / 1023
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
 * Organic ground contour defining the soil surface line inside the hero.
 * Sits in the lower ~25-30% of the viewport and connects seamlessly to the page soil.
 */
function getGroundY(x: number): number {
  return (
    -0.82 +
    Math.sin(x * 0.75) * 0.08 +
    Math.sin(x * 2.1 + 0.8) * 0.04 +
    Math.cos(x * 3.4) * 0.02
  )
}

/**
 * Enhanced 3D Hero Scene with Thunderstorm, Rain Impact Splashes,
 * Soil Foundation inside Hero, and 3D Logo Pointer Tilt.
 */
export default function HeroLogo3D({
  anchor = null,
}: HeroLogo3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [webglReady, setWebglReady] = useState(false)
  const [webglFailed, setWebglFailed] = useState(false)
  const anchorRef = useRef(anchor)
  const refreshFitRef = useRef<() => void>(() => {})

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

      const isMobile = window.innerWidth < 768

      const rendererInstance = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance',
      })
      renderer = rendererInstance
      rendererInstance.setClearColor(0x000000, 0)
      rendererInstance.setPixelRatio(
        Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
      )
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

      // --- Lighting ----------------------------------------------------
      const ambientLight = new THREE.AmbientLight(0xd9c8b8, 1.4)
      scene.add(ambientLight)

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.6)
      dirLight.position.set(2, 5, 4)
      scene.add(dirLight)

      // --- 3D Logo plane & Soil Texture Loading ------------------------
      let texture: import('three').Texture
      let soilTexture: import('three').Texture
      try {
        const [tex, sTex] = await Promise.all([
          new THREE.TextureLoader().loadAsync(logoUrl),
          new THREE.TextureLoader().loadAsync(soilTextureUrl),
        ])
        texture = tex
        soilTexture = sTex
      } catch {
        if (!cancelled) setWebglFailed(true)
        rendererInstance.dispose()
        rendererInstance.domElement.remove()
        return
      }
      if (cancelled) {
        texture.dispose()
        soilTexture.dispose()
        rendererInstance.dispose()
        return
      }
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = rendererInstance.capabilities.getMaxAnisotropy()

      soilTexture.wrapS = THREE.RepeatWrapping
      soilTexture.wrapT = THREE.RepeatWrapping
      soilTexture.colorSpace = THREE.SRGBColorSpace
      soilTexture.anisotropy = rendererInstance.capabilities.getMaxAnisotropy()

      const logoUniforms = {
        uMap: { value: texture },
        uFlash: { value: 0 },
        uTime: { value: 0 },
        uOpacity: { value: 1.0 },
      }
      const logoMaterial = new THREE.ShaderMaterial({
        uniforms: logoUniforms,
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
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            vec4 tex = texture2D(uMap, vUv);
            if (tex.a < 0.02) discard;
            float shimmer = sin(vUv.y * 120.0 + uTime * 8.0) * 0.5 + 0.5;
            vec3 flashed = mix(tex.rgb, vec3(1.0), uFlash * 0.9);
            flashed += uFlash * vec3(0.35, 0.37, 0.48) * (0.5 + 0.5 * shimmer);
            flashed += tex.rgb * 0.07 * (0.5 + 0.5 * sin(uTime * 2.0));
            gl_FragColor = vec4(flashed, tex.a * uOpacity);
          }
        `,
      })
      disposables.push(logoMaterial, texture, soilTexture)

      const BASE_W = 5.5
      const BASE_H = BASE_W / LOGO_ASPECT
      const logoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(BASE_W, BASE_H),
        logoMaterial,
      )
      disposables.push(logoMesh.geometry)
      scene.add(logoMesh)

      // Bounds & sizing
      const bounds = { halfW: 3.2, halfH: 1.8 }
      const aim = { y: 0.38 }
      const smooth = { y: 0.38 }

      const updateFit = () => {
        const vH =
          2 *
          camera.position.z *
          Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
        const vW = vH * camera.aspect
        bounds.halfW = vW / 2
        bounds.halfH = vH / 2

        const Hpx = containerRef.current?.clientHeight ?? 0
        const a = anchorRef.current
        let centerY = 0.38
        let maxH = vH * 0.58
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

      // --- Soil Ground Foundation inside the Hero ----------------------
      const soilUniforms = {
        uSoilMap: { value: soilTexture },
        uTime: { value: 0 },
        uFlash: { value: 0 },
      }

      const soilVertexShader = /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `

      const soilFragmentShader = /* glsl */ `
        uniform sampler2D uSoilMap;
        uniform float uTime;
        uniform float uFlash;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;

        void main() {
          float surfaceY = -0.82 + sin(vWorldPos.x * 0.75) * 0.08 + sin(vWorldPos.x * 2.1 + 0.8) * 0.04 + cos(vWorldPos.x * 3.4) * 0.02;
          
          if (vWorldPos.y > surfaceY) {
            discard;
          }

          vec2 texUv = vWorldPos.xy * vec2(0.48, 0.48);
          vec4 texSample = texture2D(uSoilMap, texUv);
          vec3 soil = mix(vec3(0.015, 0.008, 0.012), texSample.rgb, 0.24);

          // Lightning flash illumination
          soil += uFlash * vec3(0.28, 0.3, 0.36);

          gl_FragColor = vec4(soil, 1.0);
        }
      `

      const soilGeo = new THREE.PlaneGeometry(24, 12, 32, 32)
      const soilMat = new THREE.ShaderMaterial({
        uniforms: soilUniforms,
        vertexShader: soilVertexShader,
        fragmentShader: soilFragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
      })
      disposables.push(soilGeo, soilMat)
      const soilMesh = new THREE.Mesh(soilGeo, soilMat)
      soilMesh.position.set(0, -5.5, -0.05)
      scene.add(soilMesh)

      // --- Rain streaks (atmospheric thunderstorm) --------------------
      const RAIN_COUNT = isMobile ? 120 : 280
      const randomX = () => (Math.random() * 2 - 1) * (bounds.halfW + 0.4)
      const randomY = () => (Math.random() * 2 - 1) * (bounds.halfH + 0.4)

      const rainDrops = Array.from({ length: RAIN_COUNT }, () => ({
        x: randomX(),
        y: randomY(),
        z: -0.8 + Math.random() * 1.2,
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
      })
      disposables.push(rainGeometry, rainMaterial)
      scene.add(new THREE.LineSegments(rainGeometry, rainMaterial))

      // Rain Splash Particle Pool
      const SPLASH_POOL_SIZE = isMobile ? 25 : 50
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
        splash.y = y + 0.02
        splash.z = z
        splash.vx = (Math.random() - 0.5) * 0.5
        splash.vy = 0.45 + Math.random() * 0.5
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
        color: 0x9ec0e6,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      })
      disposables.push(splashGeometry, splashMaterial)
      scene.add(new THREE.LineSegments(splashGeometry, splashMaterial))

      // --- Flash rain (diagonal slants during lightning) ---------------
      const FLASH_COUNT = Math.floor(RAIN_COUNT / 8)
      const flashDrops = Array.from({ length: FLASH_COUNT }, () => ({
        x: randomX(),
        y: randomY(),
        z: -0.5 + Math.random() * 0.8,
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
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      disposables.push(flashGeometry, flashMaterial)
      scene.add(new THREE.LineSegments(flashGeometry, flashMaterial))

      // --- Lightning bolt ----------------------------------------------
      const BOLT_SEGMENTS = 14
      const boltGeometry = new LineGeometry()
      const boltMaterial = new LineMaterial({
        color: BOLT_COLOR,
        linewidth: isMobile ? 2.5 : 3.5,
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
        const bottom = getGroundY(strikeX)
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

      const updateResolutions = () => {
        const size = rendererInstance.getDrawingBufferSize(
          new THREE.Vector2(),
        )
        boltMaterial.resolution.copy(size)
      }

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
        if (document.hidden) {
          clock.getDelta()
          return
        }

        const elapsedMs = clock.elapsedTime * 1000

        // --- Lightning Flash Calculation -------------------------------
        const flashing = Math.floor(elapsedMs / 110) % 13 === 0
        if (flashing && !wasFlashing && visible) rebuildBolt()
        wasFlashing = flashing

        const targetFlash = flashing ? 1 : 0
        flashValue += (targetFlash - flashValue) * (flashing ? 0.65 : 0.14)

        if (!visible) {
          clock.getDelta()
          return
        }

        const dt = Math.min(clock.getDelta(), 0.05)

        camera.position.set(0, 0, 5.2)
        camera.lookAt(0, 0, 0)

        logoUniforms.uFlash.value = flashValue
        logoUniforms.uTime.value = clock.elapsedTime
        soilUniforms.uFlash.value = flashValue
        soilUniforms.uTime.value = clock.elapsedTime

        logoUniforms.uOpacity.value = 1.0
        pointer.x += (pointer.tx - pointer.x) * 0.08
        pointer.y += (pointer.ty - pointer.y) * 0.08
        smooth.y += (aim.y - smooth.y) * 0.08
        logoMesh.position.y =
          smooth.y + Math.sin(clock.elapsedTime * 0.8) * 0.03

        // Tilt effect ONLY on the hero logo
        logoMesh.rotation.y = pointer.x * 0.12
        logoMesh.rotation.x = -pointer.y * 0.08

        // --- Rain Physics & Ground Impacts -----------------------------
        const topEdge = bounds.halfH + 0.3
        for (let i = 0; i < RAIN_COUNT; i += 1) {
          const drop = rainDrops[i]
          drop.y -= drop.speed * dt
          const groundY = getGroundY(drop.x)
          if (drop.y <= groundY) {
            spawnSplash(drop.x, groundY, drop.z)
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

        // Update Splash Particles
        for (let i = 0; i < SPLASH_POOL_SIZE; i += 1) {
          const s = splashes[i]
          if (s.active) {
            s.x += s.vx * dt
            s.y += s.vy * dt
            s.vy -= 4.0 * dt // gravity
            s.life -= dt * 3.8
            if (s.life <= 0) s.active = false
          }
          const base = i * 6
          splashPositions[base] = s.x
          splashPositions[base + 1] = s.y
          splashPositions[base + 2] = s.z
          splashPositions[base + 3] = s.x + s.vx * 0.03
          splashPositions[base + 4] = s.y + s.vy * 0.03
          splashPositions[base + 5] = s.z
        }
        splashGeometry.attributes.position.needsUpdate = true

        // Flash Rain Updates
        for (let i = 0; i < FLASH_COUNT; i += 1) {
          const drop = flashDrops[i]
          drop.y -= drop.speed * dt
          const groundY = getGroundY(drop.x)
          if (drop.y <= groundY) {
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
        flashMaterial.opacity = flashValue * 0.95
        rainMaterial.opacity = 0.6 - flashValue * 0.2

        boltMaterial.opacity = flashValue
        bolt.visible = flashValue > 0.03

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
      className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none"
      role="img"
      aria-label="Arcane 3.0 Hero Environment"
    >
      {/* Static fallback: visible until WebGL takes over */}
      <img
        src={logoUrl}
        alt="Arcane 3.0 pixel logo"
        style={
          anchor ? { top: anchor.top, bottom: anchor.bottom } : undefined
        }
        className={`absolute inset-x-0 m-auto h-auto w-[94%] max-w-5xl object-contain transition-opacity duration-500 pointer-events-auto ${
          anchor ? '' : '-translate-y-[10%] '
        }${webglReady && !webglFailed ? 'opacity-0' : 'opacity-100'}`}
        draggable={false}
      />
      {!webglReady && !webglFailed && (
        <span className="sr-only">Loading underground environment…</span>
      )}
    </div>
  )
}
