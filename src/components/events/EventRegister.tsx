import { useEffect, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import BackgroundParticles from '../BackgroundParticles.tsx'
import type { EventItem } from '../../data/events.ts'
import gpayLogo from '../../assets/gpay-g.svg'
import {
  eventDateLine,
  eventFeeLine,
  eventPrizeLine,
  eventTeamLine,
} from '../../data/eventDetails.ts'
import {
  MAX_UPLOAD_BYTES,
  fileToDataUrl,
  submitRegistration,
} from '../../data/registration.ts'
import type {
  RegisterMember,
  RegistrationSuccess,
} from '../../data/registration.ts'

const STEPS = ['Team', 'Members', 'Payment'] as const

const FISAT_FULL_NAME = 'Federal Institute of Science and Technology'

const SEMESTER_OPTIONS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']

/** Short forms of the B.Tech branches offered at FISAT (see fisat.ac.in/ug-programs). */
const BRANCH_OPTIONS = ['CE', 'CSE', 'CSD', 'ECE', 'EEE', 'EIE', 'ME']

const BATCH_OPTIONS = ['A', 'B', 'C', 'D']

const MEMBER_FIELDS: {
  key: keyof RegisterMember
  label: string
  placeholder: string
  type?: string
  autoComplete?: string
  options?: string[]
}[] = [
  { key: 'name', label: 'Full Name', placeholder: 'e.g. Alex Mercer', autoComplete: 'name' },
  { key: 'semester', label: 'Semester', placeholder: 'Select semester', options: SEMESTER_OPTIONS },
  { key: 'branch', label: 'Branch', placeholder: 'Select branch', options: BRANCH_OPTIONS },
  { key: 'batch', label: 'Batch', placeholder: 'Select batch', options: BATCH_OPTIONS },
  { key: 'phone_no', label: 'Phone Number', placeholder: '+91 98765 43210', type: 'tel', autoComplete: 'tel' },
  { key: 'email', label: 'Email', placeholder: 'name@college.edu', type: 'email', autoComplete: 'email' },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function blankMember(): RegisterMember {
  return { name: '', semester: '', branch: '', batch: '', phone_no: '', email: '' }
}

/* ------------------- persisted registration progress ------------------- */

const STORAGE_VERSION = 1

interface PersistedRegistration {
  version: number
  teamName: string
  collegeName: string
  members: RegisterMember[]
  step: number
  success: RegistrationSuccess | null
}

/** Coerce an unknown stored value into a clean member (never throws). */
function sanitizeMember(value: unknown): RegisterMember {
  const clean = blankMember()
  if (typeof value !== 'object' || value === null) return clean
  const record = value as Record<string, unknown>
  for (const key of Object.keys(clean) as (keyof RegisterMember)[]) {
    if (typeof record[key] === 'string') {
      clean[key] = (record[key] as string).slice(0, 200)
    }
  }
  return clean
}

function sanitizeSuccess(value: unknown): RegistrationSuccess | null {
  if (typeof value !== 'object' || value === null) return null
  const record = value as Record<string, unknown>
  if (typeof record.ticket !== 'string' || !record.ticket) return null
  return {
    ticket: record.ticket,
    registration_id:
      typeof record.registration_id === 'number'
        ? record.registration_id
        : Number(record.registration_id) || 0,
    verification:
      typeof record.verification === 'string' && record.verification
        ? record.verification
        : 'pending',
    whatsapp_group_link:
      typeof record.whatsapp_group_link === 'string'
        ? record.whatsapp_group_link
        : null,
  }
}

/** Read stored progress for one event, normalized to the current team size. */
function loadPersisted(key: string, count: number): PersistedRegistration | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedRegistration>
    if (!parsed || parsed.version !== STORAGE_VERSION) return null
    const stored = Array.isArray(parsed.members) ? parsed.members : []
    const members = stored.slice(0, count).map(sanitizeMember)
    while (members.length < count) members.push(blankMember())
    return {
      version: STORAGE_VERSION,
      teamName:
        typeof parsed.teamName === 'string' ? parsed.teamName.slice(0, 120) : '',
      collegeName:
        typeof parsed.collegeName === 'string'
          ? parsed.collegeName.slice(0, 200)
          : '',
      members,
      step: parsed.step === 2 || parsed.step === 3 ? parsed.step : 1,
      success: sanitizeSuccess(parsed.success),
    }
  } catch {
    return null
  }
}

function Field({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] font-semibold tracking-wider text-mist/70 uppercase">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-lg border border-dark-red/40 bg-black/60 px-3.5 py-2.5 font-mono text-sm text-mist placeholder:text-mist/30 focus:border-medium-red focus:outline-none"
      />
    </label>
  )
}

function Select({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] font-semibold tracking-wider text-mist/70 uppercase">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-lg border border-dark-red/40 bg-black/60 px-3.5 py-2.5 font-mono text-sm text-mist focus:border-medium-red focus:outline-none [&>option]:bg-black"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function EventRegister({ event }: { event: EventItem }) {
  const minCount = event.teamMin ?? 1
  const maxCount = event.teamMax ?? minCount

  // Wizard progress is persisted per event so a reload never loses it.
  // The File object itself can't survive storage — only the fields do.
  const storageKey = `arcane:registration:${event.id}`
  const [initial] = useState(() => loadPersisted(storageKey, maxCount))

  const [step, setStep] = useState(initial?.step ?? 1)
  const [teamName, setTeamName] = useState(initial?.teamName ?? '')
  const [collegeName, setCollegeName] = useState(
    initial?.collegeName.trim() ? initial.collegeName : FISAT_FULL_NAME,
  )
  const [members, setMembers] = useState<RegisterMember[]>(
    () => initial?.members ?? Array.from({ length: maxCount }, blankMember),
  )
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<RegistrationSuccess | null>(
    () => initial?.success ?? null,
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Persist every change; a stored ticket keeps showing until closed.
  useEffect(() => {
    try {
      const payload: PersistedRegistration = {
        version: STORAGE_VERSION,
        teamName,
        collegeName,
        members,
        step: success ? 3 : step,
        success,
      }
      localStorage.setItem(storageKey, JSON.stringify(payload))
    } catch {
      // Storage full or unavailable — the form keeps working in memory.
    }
  }, [storageKey, teamName, collegeName, members, step, success])

  function handleCloseTicket() {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // Ignore — nothing persisted anyway.
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
    setError(null)
    setSuccess(null)
    setTeamName('')
    setCollegeName(FISAT_FULL_NAME)
    setMembers(Array.from({ length: maxCount }, blankMember))
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const feeLine = eventFeeLine(event)
  const dateLine = eventDateLine(event)
  const teamLine = eventTeamLine(event)
  const prizeLine = eventPrizeLine(event)

  // UPI intent for the "Open in Google Pay" button (mobile only behavior —
  // desktop browsers can't handle upi://). Amount is prefilled when known.
  const upiId = 'mini.p.r.@federal'
  const upiLink =
    `upi://pay?pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent(`ARCANE 3.0 ${event.title}`)}` +
    '&cu=INR' +
    (event.feeAmount != null && event.feeAmount > 0
      ? `&am=${event.feeAmount}`
      : '') +
    `&tn=${encodeURIComponent(`Registration ${event.code || event.title}`)}`

  function updateMember(index: number, key: keyof RegisterMember, value: string) {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [key]: value } : m)))
  }

  function validateStep1(): string | null {
    if (!teamName.trim() || !collegeName.trim()) {
      return 'Enter your team name and college name to continue.'
    }
    return null
  }

  /** Returns the members payload, or an error message. */
  function buildMembers(): { payload: RegisterMember[]; error: string | null } {
    const payload: RegisterMember[] = []
    for (let i = 0; i < members.length; i++) {
      const m = members[i]
      if (!m) continue
      const values = [m.name, m.semester, m.branch, m.batch, m.phone_no, m.email]
      const filled = values.filter((v) => v.trim() !== '').length
      const required = i < minCount
      const label = `Member ${String(i + 1).padStart(2, '0')}`
      if (filled === 0 && !required) continue
      if (filled > 0 && filled < values.length) {
        return {
          payload: [],
          error: required
            ? `${label} is incomplete — fill all fields.`
            : `${label} is incomplete — fill all fields or leave it empty.`,
        }
      }
      if (filled === 0) {
        return { payload: [], error: `${label} is incomplete — fill all fields.` }
      }
      if (!SEMESTER_OPTIONS.includes(m.semester.trim())) {
        return { payload: [], error: `${label} has an invalid semester.` }
      }
      if (!BRANCH_OPTIONS.includes(m.branch.trim())) {
        return { payload: [], error: `${label} has an invalid branch.` }
      }
      if (!BATCH_OPTIONS.includes(m.batch.trim())) {
        return { payload: [], error: `${label} has an invalid batch.` }
      }
      if (!EMAIL_PATTERN.test(m.email.trim())) {
        return { payload: [], error: `${label} has an invalid email address.` }
      }
      payload.push({
        name: m.name.trim(),
        semester: m.semester.trim(),
        branch: m.branch.trim(),
        batch: m.batch.trim(),
        phone_no: m.phone_no.trim(),
        email: m.email.trim(),
      })
    }
    return { payload, error: null }
  }

  function goNext() {
    setError(null)
    if (step === 1) {
      const err = validateStep1()
      if (err) {
        setError(err)
        return
      }
      setStep(2)
    } else if (step === 2) {
      const { error: err } = buildMembers()
      if (err) {
        setError(err)
        return
      }
      setStep(3)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    setError(null)
    setStep((s) => Math.max(1, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleFileChange(chosen: File | undefined) {
    setError(null)
    if (!chosen) return
    if (chosen.size > MAX_UPLOAD_BYTES) {
      setFile(null)
      setError(
        `“${chosen.name}” is ${(chosen.size / 1024 / 1024).toFixed(1)}MB — payment proof must be 10MB or less.`,
      )
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(chosen)
    setPreviewUrl(chosen.type.startsWith('image/') ? URL.createObjectURL(chosen) : null)
  }

  async function handleRegister() {
    setError(null)
    if (event.dbId == null) {
      setError('Online registration is not open for this event yet.')
      return
    }
    const step1Error = validateStep1()
    if (step1Error) {
      setError(step1Error)
      setStep(1)
      return
    }
    const { payload, error: membersError } = buildMembers()
    if (membersError) {
      setError(membersError)
      setStep(2)
      return
    }
    if (!file) {
      setError('Payment proof is required — upload your payment screenshot or receipt to complete registration.')
      return
    }
    setSubmitting(true)
    try {
      const attachedImg = file ? await fileToDataUrl(file) : null
      const result = await submitRegistration(
        event.dbId,
        {
          team_name: teamName.trim(),
          college_name: collegeName.trim(),
          members: payload,
        },
        attachedImg,
      )
      setSuccess(result)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ------------------------------ success view ----------------------------- */
  if (success) {
    return (
      <div className="relative -mx-4 -mt-[4.5rem] -mb-8 overflow-hidden soil-bg-layer px-4 pt-[calc(4.5rem+2rem)] pb-16 sm:-mx-8 sm:-mt-[5rem] sm:px-8 sm:pt-[calc(5rem+3rem)]">
        <BackgroundParticles density={10} className="z-0" />
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative z-10 mx-auto w-full max-w-xl"
        >
          <p className="text-center font-mono text-xs font-semibold tracking-[0.25em] text-emerald-400 uppercase">
            Registration confirmed
          </p>
          <h1 className="mt-2 text-center font-heading text-3xl font-bold tracking-tight text-mist uppercase sm:text-4xl">
            You&apos;re in, {teamName.trim() || 'team'}
          </h1>

          {/* Ticket */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-medium-red/50 bg-near-black shadow-[0_0_40px_rgba(170,52,48,0.25)]">
            <div className="flex items-center justify-between bg-medium-red/15 px-5 py-3 sm:px-7">
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-mist uppercase">
                Event ticket
              </span>
              <span className="flex items-center gap-3">
                <span className="font-mono text-[11px] font-semibold tracking-wider text-mist/60 uppercase">
                  {event.code || 'ARCANE'}
                </span>
                <button
                  type="button"
                  onClick={handleCloseTicket}
                  aria-label="Close ticket and start a new registration"
                  title="Close"
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-dark-red/40 text-xs text-mist/60 transition-colors hover:border-medium-red hover:text-mist"
                >
                  ✕
                </button>
              </span>
            </div>

            <div className="px-5 py-6 text-center sm:px-7">
              <p className="font-mono text-[11px] tracking-[0.25em] text-mist/50 uppercase">
                {event.title}
              </p>
              <p className="mt-2 font-mono text-4xl font-extrabold tracking-[0.2em] text-transparent sm:text-5xl bg-clip-text bg-gradient-to-r from-[#e05652] to-[#f4938f]">
                {success.ticket}
              </p>
              <p className="mt-2 font-mono text-[11px] text-mist/50">
                Show this ticket at the verification desk on event day.
              </p>
            </div>

            <div aria-hidden="true" className="border-t-2 border-dashed border-dark-red/50" />

            <dl className="space-y-2 px-5 py-5 font-mono text-xs sm:px-7 sm:text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-mist/50 uppercase">Team</dt>
                <dd className="text-right font-bold text-mist">{teamName.trim()}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mist/50 uppercase">College</dt>
                <dd className="text-right font-bold text-mist">{collegeName.trim()}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mist/50 uppercase">Registration ID</dt>
                <dd className="text-right font-bold text-mist">#{success.registration_id}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-mist/50 uppercase">Verification</dt>
                <dd className="text-right font-bold text-amber-300 uppercase">
                  {success.verification}
                </dd>
              </div>
            </dl>

            <div aria-hidden="true" className="border-t-2 border-dashed border-dark-red/50" />

            <div className="flex flex-col gap-3 px-5 py-5 sm:px-7">
              {success.whatsapp_group_link ? (
                <a
                  href={success.whatsapp_group_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-mono text-sm font-bold tracking-wider text-white uppercase transition-all duration-200 hover:bg-emerald-500 active:scale-[0.98]"
                >
                  Join WhatsApp group
                </a>
              ) : null}
              <Link
                to={`/events/${event.id}`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-dark-red/40 bg-black/40 px-6 py-3 font-mono text-xs font-semibold tracking-wider text-mist/75 uppercase hover:border-medium-red/60 hover:text-mist"
              >
                Back to event
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* --------------------------------- wizard -------------------------------- */
  return (
    <div className="relative -mx-4 -mt-[4.5rem] -mb-8 overflow-hidden soil-bg-layer px-4 pt-[calc(4.5rem+2rem)] pb-16 sm:-mx-8 sm:-mt-[5rem] sm:px-8 sm:pt-[calc(5rem+3rem)]">
      <BackgroundParticles density={10} className="z-0" />
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative z-10 mx-auto w-full max-w-3xl"
      >
        <p className="font-mono text-xs font-semibold tracking-[0.25em] text-medium-red uppercase">
          Registration // {event.code || 'ARCANE'}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-mist uppercase sm:text-5xl">
          Register for {event.title}
        </h1>

        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px] sm:text-xs">
          <span className="rounded-md border border-dark-red/40 bg-near-black/80 px-3 py-1.5 text-mist">
            Date: <strong>{dateLine}</strong>
          </span>
          <span className="rounded-md border border-dark-red/40 bg-near-black/80 px-3 py-1.5 text-mist">
            Time: <strong>{event.time}</strong>
          </span>
          {teamLine ? (
            <span className="rounded-md border border-dark-red/40 bg-near-black/80 px-3 py-1.5 text-mist">
              Team: <strong>{teamLine}</strong>
            </span>
          ) : null}
          <span className="rounded-md border border-dark-red/40 bg-near-black/80 px-3 py-1.5 text-mist">
            Fee: <strong className="text-medium-red">{feeLine}</strong>
          </span>
          {prizeLine ? (
            <span className="rounded-md border border-dark-red/40 bg-near-black/80 px-3 py-1.5 text-mist">
              Prize: <strong className="text-medium-red">{prizeLine}</strong>
            </span>
          ) : null}
          <span className="rounded-md border border-dark-red/40 bg-near-black/80 px-3 py-1.5 text-mist">
            Venue: <strong>{event.venue}</strong>
          </span>
        </div>

        {/* Stepper */}
        <ol className="mt-6 flex items-center gap-1.5 sm:gap-2">
          {STEPS.map((label, i) => {
            const n = i + 1
            const active = step === n
            const done = step > n
            return (
              <li key={label} className="flex flex-1 items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  disabled={!done || submitting}
                  onClick={() => {
                    setError(null)
                    setStep(n)
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-2 py-2.5 font-mono text-[11px] font-bold tracking-wider uppercase transition-all sm:text-xs ${
                    active
                      ? 'border-medium-red bg-medium-red/20 text-mist shadow-[0_0_16px_rgba(170,52,48,0.35)]'
                      : done
                        ? 'cursor-pointer border-dark-red/40 bg-near-black/70 text-mist/80 hover:border-medium-red/50'
                        : 'cursor-default border-dark-red/25 bg-near-black/50 text-mist/40'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                      active ? 'bg-medium-red text-mist' : done ? 'bg-emerald-600 text-white' : 'bg-dark-red/30 text-mist/50'
                    }`}
                  >
                    {done ? '✓' : n}
                  </span>
                  {label}
                </button>
                {n < STEPS.length && (
                  <span aria-hidden="true" className={`h-px w-2 shrink-0 sm:w-4 ${done ? 'bg-emerald-600' : 'bg-dark-red/40'}`} />
                )}
              </li>
            )
          })}
        </ol>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-500/50 bg-red-950/60 px-4 py-3 font-mono text-xs text-red-200 sm:text-sm"
          >
            {error}
          </div>
        )}

        {/* Step 1 — team */}
        {step === 1 && (
          <div className="mt-5 rounded-2xl border border-dark-red/35 bg-near-black/75 p-5 sm:p-7">
            <h2 className="font-heading text-xl font-bold tracking-tight text-mist uppercase sm:text-2xl">
              Team details
            </h2>
            <p className="mt-1 font-content text-xs text-mist/60 sm:text-sm">
              Step 1 of 3 — tell us who is registering.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Team Name *"
                value={teamName}
                maxLength={60}
                placeholder="e.g. Circuit Breakers"
                onChange={(e) => setTeamName(e.target.value)}
              />
              <Field
                label="College Name *"
                value={collegeName}
                maxLength={120}
                placeholder="e.g. FISAT"
                onChange={(e) => setCollegeName(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2 — members */}
        {step === 2 && (
          <div className="mt-5 space-y-4">
            <p className="font-content text-xs text-mist/60 sm:text-sm">
              Step 2 of 3 — {minCount === maxCount ? (
                <>this event needs exactly <strong className="text-mist">{maxCount} {maxCount === 1 ? 'member' : 'members'}</strong>.</>
              ) : (
                <><strong className="text-mist">{minCount} {minCount === 1 ? 'member' : 'members'}</strong> required, up to <strong className="text-mist">{maxCount}</strong> — extra members are optional.</>
              )}
            </p>
            {members.map((m, i) => {
              const optional = i >= minCount
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-dark-red/35 bg-near-black/75 p-5 sm:p-6"
                >
                  <p className="mb-4 font-mono text-xs font-bold tracking-wider text-mist uppercase sm:text-sm">
                    Member {String(i + 1).padStart(2, '0')}
                    {i === 0 ? (
                      <span className="text-medium-red"> (Team Leader)</span>
                    ) : optional ? (
                      <span className="text-mist/50"> (Optional)</span>
                    ) : null}
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {MEMBER_FIELDS.map((f) =>
                      f.options ? (
                        <Select
                          key={f.key}
                          label={`${f.label} ${optional ? '' : '*'}`.trim()}
                          value={m[f.key]}
                          options={f.options}
                          placeholder={f.placeholder}
                          onChange={(v) => updateMember(i, f.key, v)}
                        />
                      ) : (
                        <Field
                          key={f.key}
                          label={`${f.label} ${optional ? '' : '*'}`.trim()}
                          type={f.type}
                          autoComplete={f.autoComplete}
                          value={m[f.key]}
                          maxLength={120}
                          placeholder={f.placeholder}
                          onChange={(e) => updateMember(i, f.key, e.target.value)}
                        />
                      ),
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Step 3 — payment */}
        {step === 3 && (
          <div className="mt-5 rounded-2xl border border-dark-red/35 bg-near-black/75 p-5 sm:p-7">
            <h2 className="font-heading text-xl font-bold tracking-tight text-mist uppercase sm:text-2xl">
              Payment
            </h2>
            <p className="mt-1 font-content text-xs text-mist/60 sm:text-sm">
              Step 3 of 3 — entry fee <strong className="text-medium-red">{feeLine}</strong>. Upload your payment proof below to complete registration.
            </p>

            {event.paymentImage && (
              <>
                <img
                  src={event.paymentImage}
                  alt="Payment QR code"
                  loading="lazy"
                  className="mt-5 max-h-[60vh] w-full rounded-xl border border-dark-red/30 bg-black/60 object-contain"
                />
                <a
                  href={upiLink}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-mono text-sm font-bold tracking-wider text-[#1a73e8] uppercase transition-all duration-200 hover:bg-mist active:scale-[0.98]"
                >
                  <img
                    src={gpayLogo}
                    alt=""
                    aria-hidden="true"
                    className="h-5 w-5 object-contain"
                  />
                  Open in Google Pay ↗
                </a>
                <p className="mt-1.5 text-center font-mono text-[11px] text-mist/50">
                  UPI ID: {upiId}
                </p>
              </>
            )}

            <div className="mt-5">
              <span className="mb-1.5 block font-mono text-[11px] font-semibold tracking-wider text-mist/70 uppercase">
                Payment proof (1 file, max 10MB) *
              </span>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label
                  htmlFor="payment-proof"
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-medium-red/60 bg-medium-red/15 px-5 py-2.5 font-mono text-xs font-bold tracking-wider text-mist uppercase transition-all hover:bg-medium-red/30"
                >
                  {file ? 'Change file' : 'Choose file'}
                </label>
                <input
                  id="payment-proof"
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
                {file ? (
                  <span className="flex items-center gap-2 font-mono text-xs text-mist/80">
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-mist/50">
                      ({(file.size / 1024 / 1024).toFixed(1)}MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (previewUrl) URL.revokeObjectURL(previewUrl)
                        setFile(null)
                        setPreviewUrl(null)
                      }}
                      className="shrink-0 rounded-md border border-dark-red/40 px-2 py-0.5 text-[11px] text-mist/60 hover:border-medium-red hover:text-mist"
                    >
                      Remove
                    </button>
                  </span>
                ) : (
                  <span className="font-mono text-xs text-mist/40">No file chosen</span>
                )}
              </div>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Payment proof preview"
                  className="mt-4 max-h-48 w-auto rounded-xl border border-dark-red/30"
                />
              )}
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              className="rounded-xl border border-dark-red/40 bg-near-black/80 px-6 py-3 font-mono text-xs font-bold tracking-wider text-mist/75 uppercase hover:border-medium-red/60 hover:text-mist disabled:opacity-50"
            >
              ← Back
            </button>
          ) : (
            <Link
              to={`/events/${event.id}`}
              className="rounded-xl border border-dark-red/40 bg-near-black/80 px-6 py-3 text-center font-mono text-xs font-bold tracking-wider text-mist/75 uppercase hover:border-medium-red/60 hover:text-mist"
            >
              ← Event
            </Link>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-xl border border-medium-red bg-medium-red px-8 py-3 font-mono text-sm font-bold tracking-wider text-mist uppercase transition-all duration-200 hover:bg-dark-red hover:shadow-[0_0_24px_rgba(170,52,48,0.6)] active:scale-[0.98] cursor-pointer"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRegister}
              disabled={submitting}
              className="rounded-xl border border-medium-red bg-medium-red px-8 py-3 font-mono text-sm font-bold tracking-wider text-mist uppercase transition-all duration-200 hover:bg-dark-red hover:shadow-[0_0_24px_rgba(170,52,48,0.6)] active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Registering…' : 'Register ▶'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
