import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright-core'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = join(root, 'demo', 'tte-effects.gif')
const frames = join(tmpdir(), `tte-js-gif-${process.pid}`)
const progressSteps = [0.04, 0.16, 0.32, 0.52, 0.72, 0.9, 1]
const chrome = findChrome()
const server = createStaticServer(root)

await mkdir(frames, { recursive: true })
await new Promise((resolveListening) => server.listen(0, '127.0.0.1', resolveListening))

const address = server.address()
const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
})

try {
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    viewport: { height: 450, width: 800 },
  })

  await page.goto(`http://127.0.0.1:${address.port}/demo/capture.html`)
  await page.waitForFunction(() => window.capture?.effects?.length > 0)

  const effects = await page.evaluate(() => window.capture.effects)
  let frame = 0
  const captureFrame = async () => {
    const filename = `frame-${String(frame).padStart(4, '0')}.png`
    await page.screenshot({
      animations: 'disabled',
      path: join(frames, filename),
      type: 'png',
    })
    frame += 1
  }

  await page.evaluate(() => window.capture.intro())
  for (let index = 0; index < 12; index += 1) {
    await captureFrame()
  }

  for (let effectIndex = 0; effectIndex < effects.length; effectIndex += 1) {
    const effectName = effects[effectIndex]

    for (const progress of progressSteps) {
      await page.evaluate(
        ({ effectName, effectIndex, progress }) => {
          window.capture.render(effectName, effectIndex, progress)
        },
        { effectName, effectIndex, progress },
      )
      await captureFrame()
    }
  }

  await page.evaluate(() => window.capture.intro())
  for (let index = 0; index < 6; index += 1) {
    await captureFrame()
  }

  encodeGif(800, 128)

  if ((await stat(output)).size > 14_000_000) {
    encodeGif(720, 96)
  }

  const megabytes = ((await stat(output)).size / 1_000_000).toFixed(1)
  console.log(`Created demo/tte-effects.gif (${megabytes} MB)`)
} finally {
  await browser.close()
  server.close()
  await rm(frames, { force: true, recursive: true })
}

function encodeGif(width, colors) {
  execFileSync('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-framerate',
    '20',
    '-i',
    join(frames, 'frame-%04d.png'),
    '-filter_complex',
    `fps=20,scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=${colors}:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`,
    '-loop',
    '0',
    output,
  ])
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean)

  const executable = candidates.find(existsSync)
  if (!executable) {
    throw new Error('Chrome was not found. Set CHROME_PATH and run npm run gif again.')
  }

  return executable
}

function createStaticServer(directory) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost')
      const pathname = url.pathname === '/' ? '/demo/capture.html' : url.pathname
      const filename = resolve(directory, `.${decodeURIComponent(pathname)}`)

      if (!filename.startsWith(`${directory}/`)) {
        response.writeHead(403)
        response.end('Forbidden')
        return
      }

      const body = await readFile(filename)
      const contentTypes = {
        '.css': 'text/css',
        '.html': 'text/html',
        '.js': 'text/javascript',
      }

      response.writeHead(200, {
        'Content-Type': contentTypes[extname(filename)] ?? 'application/octet-stream',
      })
      response.end(body)
    } catch {
      response.writeHead(404)
      response.end('Not found')
    }
  })
}
