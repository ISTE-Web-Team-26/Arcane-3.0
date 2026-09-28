/**
 * Build-time events sync.
 *
 * Reads every row from the Supabase `events` table using the privileged
 * service-role key (server-side only, never shipped to the browser),
 * normalizes rows to the frontend `EventItem` shape, downloads remote poster
 * assets into `public/events/`, and writes `public/events.json` for the
 * React home page to render.
 *
 * Runs automatically before every build via the `prebuild` npm script.
 * If credentials are absent (e.g. local dev without a `.env`), it exits 0
 * and the frontend falls back to `DEFAULT_EVENTS` in `src/data/events.ts`.
 *
 * Required env (see `.env.example`):
 *   SUPABASE_URL, SUPABASE_SECRET_KEY
 * (the legacy SUPABASE_SERVICE_ROLE_KEY is still accepted as a fallback)
 *
 * Optional env:
 *   SUPABASE_EVENTS_TABLE  (default: "events")
 *   SUPABASE_EVENTS_FILTER (default: "enabled=eq.true", empty disables)
 *   SUPABASE_EVENTS_ORDER  (default: "time.asc.nullslast", empty disables)
 *   SUPABASE_STORAGE_BUCKET (storage bucket for bare storage paths)
 *   EVENTS_JSON_OUT        (default: "public/events.json")
 *   EVENTS_ASSETS_DIR      (default: "public/events")
 *
 * Expected `events` columns (see schema in repo docs):
 *   id, slug, name, description_short, prize (integer), time (timestamptz),
 *   venue, poster_img, min_team_members, max_team_members, enabled,
 *   registration_fee (integer, 0 = free).
 * Detail-page fields (description_long, payment_img) are
 * intentionally left for the individual event pages.
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import { pipeline } from 'node:stream/promises'

const ROOT = resolve(import.meta.dirname, '..')

// ---------------------------------------------------------------------------
// Minimal `.env` loader (no extra dependency). Real environment variables
// always win over file values; `.env.local` wins over `.env`.
// ---------------------------------------------------------------------------
function loadDotEnvFile(file: string): void {
  const path = join(ROOT, file)
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadDotEnvFile('.env')
loadDotEnvFile('.env.local')

const SUPABASE_URL = (process.env.SUPABASE_URL ?? '')
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '')
const SERVICE_KEY =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const TABLE = process.env.SUPABASE_EVENTS_TABLE ?? 'events'
const FILTER = process.env.SUPABASE_EVENTS_FILTER ?? 'enabled=eq.true'
const ORDER = process.env.SUPABASE_EVENTS_ORDER ?? 'time.asc.nullslast'
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? ''
const JSON_OUT = resolve(ROOT, process.env.EVENTS_JSON_OUT ?? 'public/events.json')
const ASSETS_DIR = resolve(ROOT, process.env.EVENTS_ASSETS_DIR ?? 'public/events')

// Frontend shape (mirrors `EventItem` in src/data/events.ts).
interface EventItem {
  id: string
  code: string
  status: string
  posterTag: string
  badgeBottom: string
  image: string
  title: string
  prize: string
  description: string
  track: string
  squadLabel?: string
  squad: string
  venue: string
  time: string
  fee?: string
  actionText?: string
  to: string
  tag?: string
}

type Row = Record<string, unknown>

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

/** First non-empty string found under any of the candidate column names. */
function pick(row: Row, ...keys: string[]): string {
  for (const key of keys) {
    const value = asString(row[key]).trim()
    if (value) return value
  }
  return ''
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'event'
  )
}

const IMAGE_EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
}

async function downloadImage(url: string, destBasename: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!res.ok || !res.body) {
    throw new Error(`download failed (${res.status}) for ${url}`)
  }
  const mime = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  let ext = IMAGE_EXT_BY_MIME[mime] ?? ''
  if (!ext) {
    const fromUrl = extname(new URL(url).pathname).toLowerCase()
    ext = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg'].includes(fromUrl)
      ? fromUrl === '.jpeg'
        ? '.jpg'
        : fromUrl
      : '.jpg'
  }
  const filename = `${destBasename}${ext}`
  mkdirSync(ASSETS_DIR, { recursive: true })
  const file = createWriteStream(join(ASSETS_DIR, filename))
  await pipeline(res.body, file)
  return `/events/${filename}`
}

/**
 * Resolve the poster for one row:
 * - absolute http(s) URL  -> download into public/events/, rewrite to local path
 * - already-local path (/events/...) -> keep as-is
 * - bare storage path (bucket-relative) -> fetch via public storage URL, download
 */
async function resolveImage(raw: string, slug: string): Promise<string> {
  const fallback = `/events/${slug}.jpg`
  if (!raw) return fallback
  if (/^https?:\/\//i.test(raw)) {
    try {
      return await downloadImage(raw, slug)
    } catch (error) {
      console.warn(`[fetch-events] poster download failed for "${slug}", keeping remote URL:`, error)
      return raw
    }
  }
  if (raw.startsWith('/')) return raw
  if (STORAGE_BUCKET) {
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${raw.replace(/^\//, '')}`
    try {
      return await downloadImage(publicUrl, slug)
    } catch (error) {
      console.warn(`[fetch-events] storage download failed for "${slug}", keeping local path:`, error)
      return `/events/${basename(raw)}`
    }
  }
  return `/events/${basename(raw)}`
}

/** Map one Supabase `events` row to the frontend shape. */
function formatPrize(prize: unknown): string {
  const n = typeof prize === 'number' ? prize : Number(prize)
  if (!Number.isFinite(n) || n <= 0) return ''
  const magnitude = n >= 1000 ? n / 1000 : n
  const label = Number.isInteger(magnitude)
    ? String(magnitude)
    : String(Math.round(magnitude * 10) / 10)
  return `★${label}${n >= 1000 ? 'K' : ''}`
}

function toTeamCount(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(n) && n >= 1 ? n : null
}

function formatSquad(min: unknown, max: unknown): string {
  // A missing side falls back to the other one, so NULLs never render as 0.
  const low = toTeamCount(min) ?? toTeamCount(max)
  const high = toTeamCount(max) ?? toTeamCount(min)
  if (low == null || high == null) return ''
  if (low === high) return low === 1 ? '1 MEMBER' : `${low} MEMBERS`
  const [a, b] = low < high ? [low, high] : [high, low]
  return `${a}-${b} MEMBERS`
}

/** registration_fee integer -> "₹300", 0/NULL -> "FREE". */
function formatFee(fee: unknown): string {
  const n = typeof fee === 'number' ? fee : Number(fee)
  if (!Number.isFinite(n) || n <= 0) return 'FREE'
  return `₹${n.toLocaleString('en-IN')}`
}

/** timestamptz -> "HH:MM" in the venue timezone (FISAT, Kerala). */
function formatTime(value: unknown): string {
  const raw = asString(value)
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).format(date)
}

function mapRow(row: Row, index: number): Omit<EventItem, 'image'> & { imageSrc: string } {
  const numericId = asString(row['id'])
  const slug = slugify(
    pick(row, 'slug') || (numericId ? `event-${numericId}` : `event-${index + 1}`),
  )
  const name = pick(row, 'name', 'title') || slug.toUpperCase().replace(/-/g, '_')
  return {
    id: slug,
    code: `•EVT_${String(index + 1).padStart(2, '0')}`,
    // Query already filters enabled=eq.true, so everything here is open.
    status: pick(row, 'status') || 'OPEN',
    posterTag: `POSTER::${String(index + 1).padStart(2, '0')}`,
    badgeBottom: '',
    title: name,
    prize: formatPrize(row['prize']),
    description: pick(row, 'description_short', 'description'),
    // No track column in the schema — pills collapse to ALL until one exists.
    track: pick(row, 'track', 'category'),
    squadLabel: 'SQUAD',
    squad: formatSquad(row['min_team_members'], row['max_team_members']),
    venue: pick(row, 'venue', 'location'),
    time: formatTime(row['time']),
    fee: formatFee(row['registration_fee']),
    actionText: 'REGISTER',
    // Individual event pages land later; route per-event until then.
    to: `/events/${slug}`,
    tag: undefined,
    imageSrc: pick(row, 'poster_img', 'image_url'),
  }
}

async function fetchAllRows(): Promise<Row[]> {
  const rows: Row[] = []
  const PAGE = 1000
  const extra = [
    FILTER,
    ORDER ? `order=${ORDER}` : '',
  ].filter(Boolean).join('&')
  for (let offset = 0; ; offset += PAGE) {
    const url =
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=*` +
      `${extra ? `&${extra}` : ''}&limit=${PAGE}&offset=${offset}`
    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      let hint = ''
      if (res.status === 404 && body.includes('PGRST125')) {
        hint =
          ' (table not exposed: check the table name, its schema is exposed via ' +
          'PostgREST, and SUPABASE_URL has no /rest/v1 suffix)'
      }
      throw new Error(`Supabase query failed (${res.status})${hint}: ${body.slice(0, 300)}`)
    }
    const page = (await res.json()) as Row[]
    rows.push(...page)
    if (page.length < PAGE) break
  }
  return rows
}

async function main(): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn(
      '[fetch-events] SUPABASE_URL / SUPABASE_SECRET_KEY not set — skipping sync. ' +
        'Frontend will use built-in DEFAULT_EVENTS.',
    )
    return
  }
  if (SERVICE_KEY.startsWith('sb_publishable_')) {
    console.warn(
      '[fetch-events] WARNING: using a publishable key, which is subject to ' +
        'RLS and may not see all rows. Use the sb_secret_* key instead.',
    )
  }

  console.log(`[fetch-events] querying table "${TABLE}" …`)
  const rows = await fetchAllRows()
  console.log(`[fetch-events] ${rows.length} row(s) received`)

  const events: EventItem[] = []
  for (let i = 0; i < rows.length; i++) {
    const mapped = mapRow(rows[i] ?? {}, i)
    const { imageSrc, ...rest } = mapped
    const image = await resolveImage(imageSrc, mapped.id)
    events.push({ ...rest, image })
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    count: events.length,
    events,
  }
  mkdirSync(join(JSON_OUT, '..'), { recursive: true })
  writeFileSync(JSON_OUT, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(`[fetch-events] wrote ${events.length} event(s) to ${JSON_OUT}`)
}

main().catch((error) => {
  console.error('[fetch-events] FAILED:', error)
  process.exit(1)
})
