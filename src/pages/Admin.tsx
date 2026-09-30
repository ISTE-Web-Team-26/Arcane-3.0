import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import BackgroundParticles from '../components/BackgroundParticles.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import {
  adminCall,
  clearAdminPassword,
  collegeNameOf,
  getAdminPassword,
  membersOf,
  setAdminPassword,
  teamNameOf,
  AdminError,
} from '../data/admin.ts'
import type {
  AdminEventStat,
  AdminRow,
  AdminTotals,
} from '../data/admin.ts'

const PAGE_SIZE = 50
const STATUSES = ['pending', 'good', 'bad'] as const

function statusClasses(status: string): string {
  if (status === 'good') return 'border-emerald-600/60 bg-emerald-950/60 text-emerald-300'
  if (status === 'bad') return 'border-red-600/60 bg-red-950/60 text-red-300'
  return 'border-amber-600/60 bg-amber-950/60 text-amber-300'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).format(d)
}

function memberText(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value : '—'
}

type EventSortKey = 'total' | 'pending' | 'good' | 'bad'
interface EventSort {
  key: EventSortKey
  dir: 'asc' | 'desc'
}

function SortHeader({
  label,
  sortKey,
  sort,
  onToggle,
}: {
  label: string
  sortKey: EventSortKey
  sort: EventSort | null
  onToggle: (key: EventSortKey) => void
}) {
  const active = sort?.key === sortKey
  return (
    <button
      type="button"
      onClick={() => onToggle(sortKey)}
      aria-sort={active ? (sort.dir === 'desc' ? 'descending' : 'ascending') : 'none'}
      className="cursor-pointer uppercase transition-colors hover:text-mist"
    >
      {label} {active ? (sort.dir === 'desc' ? '▼' : '▲') : ''}
    </button>
  )
}

export default function Admin() {
  useDocumentTitle('Admin | Arcane 3.0')

  const [authed, setAuthed] = useState(() => getAdminPassword() !== null)
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  const [totals, setTotals] = useState<AdminTotals | null>(null)
  const [eventStats, setEventStats] = useState<AdminEventStat[]>([])
  const [eventId, setEventId] = useState<number | 'all'>('all')
  const [status, setStatus] = useState<string>('')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(0)
  const [eventSort, setEventSort] = useState<EventSort | null>({
    key: 'total',
    dir: 'desc',
  })
  const [rows, setRows] = useState<AdminRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [proofState, setProofState] = useState<'idle' | 'loading' | 'error' | 'done'>('idle')
  const [verifyingId, setVerifyingId] = useState<number | null>(null)

  const logout = useCallback(() => {
    clearAdminPassword()
    setAuthed(false)
    setPasswordInput('')
    setRows([])
    setTotals(null)
    setEventStats([])
    setExpandedId(null)
  }, [])

  const handleAuthError = useCallback(
    (e: unknown) => {
      if (e instanceof AdminError && e.status === 401) {
        logout()
        setLoginError('Wrong password.')
      }
    },
    [logout],
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordInput.trim() || loggingIn) return
    setLoggingIn(true)
    setLoginError(null)
    setAdminPassword(passwordInput)
    try {
      // A stats call both verifies the password and warms the dashboard.
      await adminCall<{ totals: AdminTotals; events: AdminEventStat[] }>('stats')
      setAuthed(true)
      setPasswordInput('')
    } catch (err) {
      clearAdminPassword()
      setLoginError(
        err instanceof AdminError && err.status === 401
          ? 'Wrong password.'
          : err instanceof Error
            ? err.message
            : 'Login failed. Try again.',
      )
    } finally {
      setLoggingIn(false)
    }
  }

  const refreshStats = useCallback(async () => {
    try {
      const res = await adminCall<{ totals: AdminTotals; events: AdminEventStat[] }>('stats')
      setTotals(res.totals)
      setEventStats(res.events)
    } catch (e) {
      handleAuthError(e)
    }
  }, [handleAuthError])

  const refreshList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminCall<{ total: number; items: AdminRow[] }>('list', {
        ...(eventId === 'all' ? {} : { event_id: eventId }),
        ...(status ? { status } : {}),
        ...(debouncedQuery.trim() ? { q: debouncedQuery.trim() } : {}),
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      })
      setRows(res.items)
      setTotal(res.total)
    } catch (e) {
      if (e instanceof AdminError && e.status === 401) {
        handleAuthError(e)
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load registrations.')
      }
    } finally {
      setLoading(false)
    }
  }, [eventId, status, debouncedQuery, page, handleAuthError])

  useEffect(() => {
    if (authed) void refreshStats()
  }, [authed, refreshStats])

  useEffect(() => {
    if (authed) void refreshList()
  }, [authed, refreshList])

  // Close the proof lightbox with Escape.
  useEffect(() => {
    if (!lightboxUrl) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxUrl(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxUrl])

  // Debounce the search box so we don't hammer the function per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query)
      setPage(0)
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  function changeEventFilter(value: number | 'all') {
    setEventId(value)
    setPage(0)
    setExpandedId(null)
  }

  function changeStatusFilter(value: string) {
    setStatus(value)
    setPage(0)
    setExpandedId(null)
  }

  async function toggleExpand(row: AdminRow) {
    if (expandedId === row.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(row.id)
    setProofUrl(null)
    setProofState('loading')
    try {
      const res = await adminCall<{ url: string | null }>('proof', { id: row.id })
      setProofUrl(res.url)
      setProofState('done')
    } catch (e) {
      if (e instanceof AdminError && e.status === 401) {
        handleAuthError(e)
      } else {
        setProofState('error')
      }
    }
  }

  async function setVerification(row: AdminRow, verified: string) {
    setVerifyingId(row.id)
    try {
      const res = await adminCall<{ registration: { verified: string } }>('verify', {
        id: row.id,
        verified,
      })
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, verified: res.registration.verified } : r,
        ),
      )
      void refreshStats()
    } catch (e) {
      if (e instanceof AdminError && e.status === 401) {
        handleAuthError(e)
      } else {
        setError(e instanceof Error ? e.message : 'Failed to update status.')
      }
    } finally {
      setVerifyingId(null)
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const eventNameOf = (id: number) =>
    eventStats.find((e) => e.event_id === id)?.name ?? `Event ${id}`

  function toggleEventSort(key: EventSortKey) {
    setEventSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { key, dir: 'desc' },
    )
  }

  const sortedEvents = useMemo(() => {
    if (!eventSort) return eventStats
    const { key, dir } = eventSort
    return [...eventStats].sort(
      (a, b) =>
        (dir === 'desc' ? b[key] - a[key] : a[key] - b[key]) ||
        a.event_id - b.event_id,
    )
  }, [eventStats, eventSort])

  /* --------------------------------- login --------------------------------- */
  if (!authed) {
    return (
      <div className="relative -mx-4 -mt-[4.5rem] -mb-8 flex min-h-svh flex-col items-center justify-center overflow-hidden soil-bg-layer px-4 py-8 sm:-mx-8 sm:-mt-[5rem] sm:px-8">
        <BackgroundParticles density={10} className="z-0" />
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative z-10 mx-auto w-full max-w-md"
        >
          <p className="font-mono text-xs font-semibold tracking-[0.25em] text-medium-red uppercase">
            Restricted // Organizers only
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-mist uppercase sm:text-4xl">
            Admin login
          </h1>
          <form
            onSubmit={handleLogin}
            className="mt-6 rounded-2xl border border-dark-red/35 bg-near-black/75 p-5 sm:p-7"
          >
            {loginError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-500/50 bg-red-950/60 px-4 py-3 font-mono text-xs text-red-200"
              >
                {loginError}
              </div>
            )}
            <label className="block">
              <span className="mb-1.5 block font-mono text-[11px] font-semibold tracking-wider text-mist/70 uppercase">
                Admin password
              </span>
              <input
                type="password"
                value={passwordInput}
                autoComplete="current-password"
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter the organizer password"
                className="w-full rounded-lg border border-dark-red/40 bg-black/60 px-3.5 py-2.5 font-mono text-sm text-mist placeholder:text-mist/30 focus:border-medium-red focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={loggingIn || !passwordInput.trim()}
              className="mt-4 w-full cursor-pointer rounded-xl border border-medium-red bg-medium-red px-8 py-3 font-mono text-sm font-bold tracking-wider text-mist uppercase transition-all duration-200 hover:bg-dark-red disabled:opacity-60"
            >
              {loggingIn ? 'Checking…' : 'Unlock ▶'}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  /* -------------------------------- dashboard ------------------------------- */
  return (
    <div className="relative -mx-4 -mt-[4.5rem] -mb-8 min-h-svh overflow-hidden soil-bg-layer px-4 pt-16 pb-16 sm:-mx-8 sm:-mt-[5rem] sm:px-8">
      <BackgroundParticles density={10} className="z-0" />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.25em] text-medium-red uppercase">
              Admin // Registrations
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-mist uppercase sm:text-4xl">
              Dashboard
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                void refreshStats()
                void refreshList()
              }}
              className="cursor-pointer rounded-xl border border-dark-red/40 bg-near-black/80 px-4 py-2 font-mono text-xs font-bold tracking-wider text-mist/75 uppercase hover:border-medium-red/60 hover:text-mist"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={logout}
              className="cursor-pointer rounded-xl border border-dark-red/40 bg-near-black/80 px-4 py-2 font-mono text-xs font-bold tracking-wider text-mist/75 uppercase hover:border-medium-red/60 hover:text-mist"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total', value: totals?.total ?? 0, tone: 'text-mist' },
            { label: 'Pending', value: totals?.pending ?? 0, tone: 'text-amber-300' },
            { label: 'Good', value: totals?.good ?? 0, tone: 'text-emerald-300' },
            { label: 'Bad', value: totals?.bad ?? 0, tone: 'text-red-300' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-dark-red/35 bg-near-black/80 p-4"
            >
              <p className="font-mono text-[10px] font-semibold tracking-wider text-mist/50 uppercase">
                {s.label}
              </p>
              <p className={`mt-1 font-heading text-3xl font-bold ${s.tone}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Per-event stats */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-dark-red/35 bg-near-black/80">
          <table className="w-full min-w-[560px] font-mono text-xs">
            <thead>
              <tr className="text-left text-[10px] tracking-wider text-mist/50 uppercase">
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3 text-right">
                  <SortHeader label="Total" sortKey="total" sort={eventSort} onToggle={toggleEventSort} />
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader label="Pending" sortKey="pending" sort={eventSort} onToggle={toggleEventSort} />
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader label="Good" sortKey="good" sort={eventSort} onToggle={toggleEventSort} />
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader label="Bad" sortKey="bad" sort={eventSort} onToggle={toggleEventSort} />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                onClick={() => changeEventFilter('all')}
                className={`cursor-pointer border-t border-dark-red/25 font-bold transition-colors hover:bg-medium-red/10 ${
                  eventId === 'all' ? 'bg-medium-red/15 text-mist' : 'text-mist/80'
                }`}
              >
                <td className="px-4 py-2.5">All events</td>
                <td className="px-4 py-2.5 text-right">{totals?.total ?? 0}</td>
                <td className="px-4 py-2.5 text-right text-amber-300">{totals?.pending ?? 0}</td>
                <td className="px-4 py-2.5 text-right text-emerald-300">{totals?.good ?? 0}</td>
                <td className="px-4 py-2.5 text-right text-red-300">{totals?.bad ?? 0}</td>
              </tr>
              {sortedEvents.map((e) => (
                <tr
                  key={e.event_id}
                  onClick={() => changeEventFilter(e.event_id)}
                  className={`cursor-pointer border-t border-dark-red/25 transition-colors hover:bg-medium-red/10 ${
                    eventId === e.event_id ? 'bg-medium-red/15' : ''
                  }`}
                >
                  <td className="px-4 py-2.5 font-bold text-mist">{e.name}</td>
                  <td className="px-4 py-2.5 text-right text-mist">{e.total}</td>
                  <td className="px-4 py-2.5 text-right text-amber-300">{e.pending}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-300">{e.good}</td>
                  <td className="px-4 py-2.5 text-right text-red-300">{e.bad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <select
            value={eventId === 'all' ? 'all' : String(eventId)}
            onChange={(e) =>
              changeEventFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="cursor-pointer rounded-xl border border-dark-red/40 bg-black/60 px-3.5 py-2.5 font-mono text-xs text-mist focus:border-medium-red focus:outline-none [&>option]:bg-black"
          >
            <option value="all">All events</option>
            {eventStats.map((e) => (
              <option key={e.event_id} value={e.event_id}>
                {e.name} ({e.total})
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => changeStatusFilter(e.target.value)}
            className="cursor-pointer rounded-xl border border-dark-red/40 bg-black/60 px-3.5 py-2.5 font-mono text-xs text-mist focus:border-medium-red focus:outline-none [&>option]:bg-black"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticket, team, name, email, phone…"
            className="w-full rounded-xl border border-dark-red/40 bg-black/60 px-3.5 py-2.5 font-mono text-xs text-mist placeholder:text-mist/30 focus:border-medium-red focus:outline-none sm:flex-1"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-500/50 bg-red-950/60 px-4 py-3 font-mono text-xs text-red-200"
          >
            {error}
          </div>
        )}

        {/* Registrations */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-dark-red/35 bg-near-black/80">
          <table className="w-full min-w-[720px] font-mono text-xs">
            <thead>
              <tr className="text-left text-[10px] tracking-wider text-mist/50 uppercase">
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3 text-right">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const expanded = expandedId === row.id
                return (
                  <Fragment key={row.id}>
                    <tr
                      onClick={() => void toggleExpand(row)}
                      className="cursor-pointer border-t border-dark-red/25 transition-colors hover:bg-medium-red/5"
                    >
                      <td className="px-4 py-2.5 font-bold tracking-widest text-mist">
                        {row.ticket ?? `#${row.id}`}
                      </td>
                      <td className="px-4 py-2.5 text-mist/80">
                        {teamNameOf(row)}
                        <span className="text-mist/40">
                          {' '}
                          ({membersOf(row).length})
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-mist/80">
                        {eventNameOf(row.event_id)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase ${statusClasses(row.verified)}`}
                        >
                          {row.verified}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-mist/60">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            void toggleExpand(row)
                          }}
                          className="cursor-pointer rounded-lg border border-dark-red/40 px-3 py-1 text-[11px] font-bold uppercase hover:border-medium-red/60 hover:text-mist"
                        >
                          {expanded ? 'Hide' : 'Open'}
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="border-t border-dark-red/25 bg-black/40">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div>
                              <p className="font-mono text-[10px] tracking-wider text-mist/50 uppercase">
                                Members
                              </p>
                              <div className="mt-2 space-y-2">
                                {membersOf(row).map((m, i) => (
                                  <div
                                    key={i}
                                    className="rounded-lg border border-dark-red/30 bg-near-black/70 p-3 text-[11px] leading-relaxed"
                                  >
                                    <p className="font-bold text-mist">
                                      {memberText(m.name)}
                                    </p>
                                    <p className="text-mist/70">
                                      {memberText(m.semester)} · {memberText(m.branch)} ·
                                      Batch {memberText(m.batch)}
                                    </p>
                                    <p className="text-mist/60">
                                      {memberText(m.phone_no)} · {memberText(m.email)}
                                    </p>
                                  </div>
                                ))}
                                {membersOf(row).length === 0 && (
                                  <p className="text-mist/50">No member data.</p>
                                )}
                              </div>
                              <p className="mt-3 font-mono text-[10px] tracking-wider text-mist/50 uppercase">
                                College
                              </p>
                              <p className="mt-1 text-xs text-mist/80">
                                {collegeNameOf(row)}
                              </p>
                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[10px] tracking-wider text-mist/50 uppercase">
                                  Mark:
                                </span>
                                {STATUSES.map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    disabled={verifyingId === row.id}
                                    onClick={() => void setVerification(row, s)}
                                    className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase transition-all disabled:opacity-50 ${statusClasses(s)} ${
                                      row.verified === s ? 'ring-2 ring-mist/40' : ''
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                                {verifyingId === row.id && (
                                  <span className="text-[11px] text-mist/50">Saving…</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="font-mono text-[10px] tracking-wider text-mist/50 uppercase">
                                Payment proof
                              </p>
                              <div className="mt-2">
                                {proofState === 'loading' && (
                                  <p className="text-[11px] text-mist/50">Loading proof…</p>
                                )}
                                {proofState === 'error' && (
                                  <p className="text-[11px] text-red-300">
                                    Could not load proof. Try again.
                                  </p>
                                )}
                                {proofState === 'done' && !proofUrl && (
                                  <p className="text-[11px] text-mist/50">
                                    No proof uploaded for this registration.
                                  </p>
                                )}
                                {proofState === 'done' && proofUrl && (
                                  /\.pdf($|\?)/i.test(proofUrl.split('?')[0]) ? (
                                    <a
                                      href={proofUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 rounded-xl border border-medium-red/60 bg-medium-red/15 px-5 py-2.5 font-mono text-xs font-bold tracking-wider text-mist uppercase hover:bg-medium-red/30"
                                    >
                                      Open proof PDF ↗
                                    </a>
                                  ) : (
                                    <img
                                      src={proofUrl}
                                      alt={`Payment proof for ticket ${row.ticket ?? row.id}`}
                                      onClick={() => setLightboxUrl(proofUrl)}
                                      title="Click to expand"
                                      className="max-h-96 w-auto cursor-zoom-in rounded-xl border border-dark-red/30 transition-transform hover:scale-[1.01]"
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
              {!loading && rows.length === 0 && (
                <tr className="border-t border-dark-red/25">
                  <td colSpan={6} className="px-4 py-8 text-center text-mist/50">
                    No registrations match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between font-mono text-xs text-mist/60">
          <span>
            Page {page + 1} of {pageCount} · {total} total
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="cursor-pointer rounded-xl border border-dark-red/40 bg-near-black/80 px-4 py-2 font-bold uppercase disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              type="button"
              disabled={page + 1 >= pageCount || loading}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer rounded-xl border border-dark-red/40 bg-near-black/80 px-4 py-2 font-bold uppercase disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
        {loading && (
          <p className="mt-2 font-mono text-xs text-mist/50">Loading…</p>
        )}
      </div>

      {/* Proof lightbox */}
      {lightboxUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Expanded payment proof"
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close expanded proof"
            className="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/20 text-lg text-white/80 hover:border-white/50 hover:text-white"
          >
            ✕
          </button>
          <img
            src={lightboxUrl}
            alt="Expanded payment proof"
            className="max-h-[90vh] max-w-[92vw] rounded-xl border border-white/15 object-contain"
          />
        </div>
      )}
    </div>
  )
}
