import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three/webgpu'
import {
  cos,
  float,
  mix,
  positionWorld,
  select,
  sin,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
} from 'three/tsl'
import logoUrl from '../../assets/arcane-logo.png'
import soilTextureUrl from '../../assets/soil-texture.jpg'
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
 * Organic ground contour defining the soil surface line inside the hero.
 * Sits in the lower ~25% of the viewport and connects seamlessly to the page soil.
 */
function getGroundY(x: number): number {
  return (
    -0.88 +
    Math.sin(x * 0.75) * 0.08 +
    Math.sin(x * 2.1 + 0.8) * 0.04 +
    Math.cos(x * 3.4) * 0.02
  )
}

/**
 * 3D Hero Scene powered by WebGPU (with automatic fallback to WebGL2),
 * featuring TSL node shaders, Organic Curvy Soil Terrain, Rain Physics, Lightning, and 3D Logo Tilt.
 */
export default function HeroLogo3D({ anchor = null }: HeroLogo3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gpuReady, setGpuReady] = useState(false)
  const [gpuFailed, setGpuFailed] = useState(false)
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
    let renderer: THREE.WebGPURenderer | null = null
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

      // --- Lighting ----------------------------------------------------
      const ambientLight = new THREE.AmbientLight(0xd9c8b8, 1.4)
      scene.add(ambientLight)

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.6)
      dirLight.position.set(2, 5, 4)
      scene.add(dirLight)

      // --- Textures ----------------------------------------------------
      let logoTexture: THREE.Texture
      let soilTexture: THREE.Texture
      try {
        const [tex, sTex] = await Promise.all([
          new THREE.TextureLoader().loadAsync(logoUrl),
          new THREE.TextureLoader().loadAsync(soilTextureUrl),
        ])
        logoTexture = tex
        soilTexture = sTex
      } catch {
        if (!cancelled) setGpuFailed(true)
        rendererInstance.dispose()
        rendererInstance.domElement.remove()
        return
      }

      if (cancelled) {
        logoTexture.dispose()
        soilTexture.dispose()
        rendererInstance.dispose()
        return
      }

      logoTexture.colorSpace = THREE.SRGBColorSpace
      // Sharper logo at tilted viewing angles (renderer clamps to HW max).
      logoTexture.anisotropy = 8
      soilTexture.wrapS = THREE.RepeatWrapping
      soilTexture.wrapT = THREE.RepeatWrapping
      soilTexture.colorSpace = THREE.SRGBColorSpace
      soilTexture.needsUpdate = true

      // --- TSL Uniforms ------------------------------------------------
      const uFlash = uniform(0)
      const uTime = uniform(0)

      // --- 3D Logo Node Material (TSL) ---------------------------------
      const logoTexNode = texture(logoTexture, uv())
      const shimmer = sin(uv().y.mul(120).add(uTime.mul(8)))
        .mul(0.5)
        .add(0.5)
      const flashedLogo = mix(logoTexNode.rgb, vec3(1.0), uFlash.mul(0.9))
        .add(uFlash.mul(vec3(0.35, 0.37, 0.48)).mul(shimmer.mul(0.5).add(0.5)))
        .add(
          logoTexNode.rgb.mul(0.07).mul(sin(uTime.mul(2.0)).mul(0.5).add(0.5)),
        )

      const logoOpacity = select(
        logoTexNode.a.greaterThan(0.02),
        logoTexNode.a,
        float(0.0),
      )

      const logoMaterial = new THREE.MeshBasicNodeMaterial({
        transparent: true,
        depthWrite: false,
        alphaTest: 0.02,
      })
      logoMaterial.colorNode = flashedLogo
      logoMaterial.opacityNode = logoOpacity

      disposables.push(logoMaterial, logoTexture, soilTexture)

      const actualAspect =
        (logoTexture.image as { width?: number; height?: number } | undefined)
          ?.width &&
        (logoTexture.image as { width?: number; height?: number } | undefined)
          ?.height
          ? (logoTexture.image as { width: number; height: number }).width /
            (logoTexture.image as { width: number; height: number }).height
          : LOGO_ASPECT

      const BASE_W = 5.5
      const BASE_H = BASE_W / actualAspect
      const logoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(BASE_W, BASE_H),
        logoMaterial,
      )
      logoMesh.position.z = 0.05
      logoMesh.renderOrder = 10
      disposables.push(logoMesh.geometry)
      scene.add(logoMesh)

      // --- Curvy Soil Ground Terrain (TSL Node Material) ---------------
      const surfaceYNode = sin(positionWorld.x.mul(0.75))
        .mul(0.08)
        .add(sin(positionWorld.x.mul(2.1).add(0.8)).mul(0.04))
        .add(cos(positionWorld.x.mul(3.4)).mul(0.02))
        .sub(0.82)

      const isBelowSurface = positionWorld.y.lessThanEqual(surfaceYNode)
      const soilOpacity = select(isBelowSurface, float(1.0), float(0.0))

      const soilUvNode = positionWorld.xy.mul(vec2(0.48, 0.48))
      const soilTexSample = texture(soilTexture, soilUvNode)
      const baseSoilColor = soilTexSample.rgb
        .mul(vec3(0.022, 0.012, 0.011))
        .add(vec3(0.0015, 0.0008, 0.0012))
      const litSoilColor = baseSoilColor.add(uFlash.mul(vec3(0.2, 0.22, 0.28)))

      const soilGeo = new THREE.PlaneGeometry(28, 14, 16, 16)
      const soilMat = new THREE.MeshBasicNodeMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
      })
      soilMat.colorNode = litSoilColor
      soilMat.opacityNode = soilOpacity
      disposables.push(soilGeo, soilMat)

      const soilMesh = new THREE.Mesh(soilGeo, soilMat)
      soilMesh.position.set(0, -5.5, -0.05)
      soilMesh.renderOrder = 2
      scene.add(soilMesh)

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
        let centerY = 0.45
        let maxH = vH * 0.44
        if (a && Hpx > 0) {
          const avail = Math.max(60, Hpx - a.top - a.bottom)
          const midFromTop = a.top + avail * 0.42
          const worldPerPx = vH / Hpx
          centerY = (Hpx / 2 - midFromTop) * worldPerPx
          maxH = avail * worldPerPx * 0.88
        }
        aim.y = centerY
        let s = Math.min((vW * 0.86) / BASE_W, maxH / BASE_H, 0.9)
        // Desktop: never magnify past the texture's native resolution —
        // cap the plane so 1 texel maps to at most 1 device pixel.
        if (!isMobile && Hpx > 0) {
          const texW =
            (logoTexture.image as { width?: number } | undefined)?.width ??
            1835
          const worldPerDevicePx = vH / (Hpx * rendererInstance.getPixelRatio())
          s = Math.min(s, (texW * worldPerDevicePx) / BASE_W)
        }
        logoMesh.scale.setScalar(Math.max(s * (isMobile ? 1 : 0.75), 0.2))
      }
      refreshFitRef.current = updateFit

      // --- Rain Streaks (Atmospheric Thunderstorm Behind Logo) ----------
      const RAIN_COUNT = 300
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

      // Rain Splash Particle Pool
      const SPLASH_POOL_SIZE = isMobile ? 12 : 25
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
        depthWrite: false,
      })
      disposables.push(splashGeometry, splashMaterial)
      const splashSegments = new THREE.LineSegments(splashGeometry, splashMaterial)
      splashSegments.renderOrder = 1
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
        const bottom = getGroundY(strikeX)
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
      window.addEventListener('pointermove', onPointerMove)

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

        uFlash.value = flashVal
        uTime.value = clock.elapsedTime

        // Logo Tilt & Float
        pointer.x += (pointer.tx - pointer.x) * 0.08
        pointer.y += (pointer.ty - pointer.y) * 0.08
        smooth.y += (aim.y - smooth.y) * 0.08
        logoMesh.position.y = smooth.y + Math.sin(clock.elapsedTime * 0.8) * 0.03
        logoMesh.rotation.y = pointer.x * 0.1
        logoMesh.rotation.x = -pointer.y * 0.06

        // Rain simulation across ground contour
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

        // Splash updates
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
      {/* Static fallback: visible until WebGPU takes over */}
      <img
        src={logoUrl}
        alt="Arcane 3.0 pixel logo"
        style={
          anchor ? { top: anchor.top, bottom: anchor.bottom } : undefined
        }
        className={`absolute inset-x-0 m-auto h-auto w-[94%] max-w-5xl object-contain transition-opacity duration-500 pointer-events-auto md:w-[70%] md:max-w-3xl ${
          anchor ? '' : '-translate-y-[10%] '
        }${gpuReady && !gpuFailed ? 'opacity-0' : 'opacity-100'}`}
        draggable={false}
      />
      {!gpuReady && !gpuFailed && (
        <span className="sr-only">Loading underground environment…</span>
      )}
    </div>
  )
}
