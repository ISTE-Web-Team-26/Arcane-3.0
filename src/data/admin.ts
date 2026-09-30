/** Admin API client for the `admin` Edge Function.
 *
 * The shared organizer password is kept in localStorage with a 30-day
 * expiry (falls back to sessionStorage when local persistence is blocked).
 * The function enforces everything server-side — the browser key alone can
 * read nothing.
 */

const PROD_ENDPOINT =
  'https://lukyeppvpetjilkfxaxo.supabase.co/functions/v1/admin'

export function adminEndpoint(): string {
  const override = import.meta.env.VITE_ADMIN_ENDPOINT
  return typeof override === 'string' && override.trim()
    ? override.trim()
    : PROD_ENDPOINT
}

const SESSION_KEY = 'arcane:admin-pw'

/** Admin sessions live for 30 days, then require a fresh login. */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

export function getAdminPassword(): string | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    // Legacy plain-password entries (pre-expiry) are adopted with a fresh TTL.
    let password = raw
    let expires = 0
    try {
      const parsed = JSON.parse(raw) as { v?: unknown; e?: unknown }
      if (parsed && typeof parsed === 'object') {
        password = typeof parsed.v === 'string' ? parsed.v : ''
        expires = typeof parsed.e === 'number' ? parsed.e : 0
      }
    } catch {
      // Not JSON — treat the raw value as the password.
    }
    if (!password.trim()) {
      clearAdminPassword()
      return null
    }
    if (expires && Date.now() > expires) {
      clearAdminPassword()
      return null
    }
    if (!expires) setAdminPassword(password)
    return password
  } catch {
    return null
  }
}

export function setAdminPassword(password: string): void {
  const payload = JSON.stringify({ v: password, e: Date.now() + SESSION_TTL_MS })
  try {
    localStorage.setItem(SESSION_KEY, payload)
  } catch {
    // Storage full/blocked — fall back to this tab only.
    try {
      sessionStorage.setItem(SESSION_KEY, payload)
    } catch {
      // Private mode etc. — login still works for this page view.
    }
  }
}

export function clearAdminPassword(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // Ignore.
  }
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Ignore.
  }
}

export class AdminError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export interface AdminMember {
  name?: unknown
  semester?: unknown
  branch?: unknown
  batch?: unknown
  phone_no?: unknown
  email?: unknown
}

export interface AdminRow {
  id: number
  event_id: number
  ticket: string | null
  verified: string
  created_at: string
  data: {
    team_name?: unknown
    college_name?: unknown
    members?: AdminMember[]
  } | null
}

export interface AdminEventStat {
  event_id: number
  name: string
  slug: string
  total: number
  pending: number
  good: number
  bad: number
}

export interface AdminTotals {
  total: number
  pending: number
  good: number
  bad: number
}

/** POST one admin action; throws AdminError on failure (401 when logged out). */
export async function adminCall<T>(
  action: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const password = getAdminPassword()
  if (!password) {
    throw new AdminError('Not logged in.', 401)
  }
  let res: Response
  try {
    res = await fetch(adminEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, action, ...params }),
    })
  } catch {
    throw new AdminError('Network error — check your connection.', 0)
  }
  const body = (await res.json().catch(() => null)) as {
    success?: boolean
    error?: unknown
  } & Record<string, unknown> | null
  if (res.ok && body?.success === true) {
    return body as T
  }
  if (res.status === 401) {
    clearAdminPassword()
    throw new AdminError('Wrong password.', 401)
  }
  const message =
    body && typeof body.error === 'string' && body.error.trim()
      ? body.error.trim()
      : `Request failed (HTTP ${res.status}).`
  throw new AdminError(message, res.status)
}

export function memberName(m: AdminMember): string {
  return typeof m.name === 'string' ? m.name : ''
}

export function teamNameOf(row: AdminRow): string {
  const v = row.data?.team_name
  return typeof v === 'string' && v.trim() ? v : '—'
}

export function collegeNameOf(row: AdminRow): string {
  const v = row.data?.college_name
  return typeof v === 'string' && v.trim() ? v : '—'
}

export function membersOf(row: AdminRow): AdminMember[] {
  const v = row.data?.members
  return Array.isArray(v) ? v : []
}
