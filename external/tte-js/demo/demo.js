import { createTextEffect, effectCatalog } from '../src/index.js'

const palettes = {
  aurora: ['#8a5cff', '#00d1ff', '#ffffff'],
  fire: ['#ff3d1f', '#ffb02e', '#fff4b0'],
  ice: ['#1256a0', '#5de0ff', '#ffffff'],
  matrix: ['#087f3f', '#00df68', '#c7ffd8'],
}

const gallery = document.querySelector('#gallery')
const template = document.querySelector('#effect-card')
const speed = document.querySelector('#speed')
const palette = document.querySelector('#palette')
const animations = new Map()
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
let seed = 1

for (const entry of effectCatalog()) {
  const card = template.content.firstElementChild.cloneNode(true)
  const title = card.querySelector('h2')
  const description = card.querySelector('p')
  const pre = card.querySelector('pre')
  const replay = card.querySelector('[data-replay]')

  title.textContent = entry.name
  description.textContent = entry.description
  pre.id = `effect-${entry.name}`
  pre.setAttribute('aria-label', `${entry.name} effect`)
  pre.textContent = sampleText(entry.name)
  replay.dataset.replay = entry.name
  gallery.append(card)

  const duration = effectDuration(entry.name)
  const animation = createTextEffect(pre, {
    autoplay: false,
    colors: palettes.aurora,
    duration,
    effect: entry.name,
    hotColors: palettes.fire,
    laserColors: palettes.ice,
    respectReducedMotion: false,
    seed: `${entry.name}:${seed}`,
  })

  animation.render(1, duration)
  animations.set(entry.name, { animation, card, duration })

  replay.addEventListener('click', () => {
    applyOptions(entry.name)
    void animation.restart()
  })
}

if (!reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const name = entry.target.querySelector('h2').textContent
      applyOptions(name)
      void animations.get(name).animation.restart()
      observer.unobserve(entry.target)
    }
  }, { rootMargin: '120px' })

  animations.forEach(({ card }) => observer.observe(card))
}

document.querySelector('#replay-all').addEventListener('click', () => {
  animations.forEach(({ animation }, name) => {
    applyOptions(name)
    void animation.restart()
  })
})

document.querySelector('#new-seed').addEventListener('click', () => {
  seed += 1
  replayVisible()
})

speed.addEventListener('change', replayVisible)
palette.addEventListener('change', replayVisible)

function applyOptions(name) {
  const item = animations.get(name)
  item.animation.options = {
    ...item.animation.options,
    colors: palettes[palette.value],
    duration: item.duration / Number(speed.value),
    hotColors: palettes.fire,
    laserColors: palettes.ice,
    seed: `${name}:${seed}`,
  }
}

function replayVisible() {
  animations.forEach(({ animation, card }, name) => {
    const box = card.getBoundingClientRect()
    if (box.bottom < 0 || box.top > window.innerHeight) return
    applyOptions(name)
    void animation.restart()
  })
}

function effectDuration(name) {
  if (['colorshift', 'highlight', 'vhstape'].includes(name)) return 1800
  if (['laseretch', 'matrix', 'thunderstorm'].includes(name)) return 2800
  return 2200
}

function sampleText(name) {
  const label = name.toUpperCase().padEnd(18)
  return [
    '┌──────────────────────┐',
    `│ ${label}   │`,
    '│  PURE JAVASCRIPT     │',
    '└──────────────────────┘',
  ].join('\n')
}
