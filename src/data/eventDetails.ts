import type { EventItem } from './events.ts'

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'TH'
  switch (day % 10) {
    case 1:
      return 'ST'
    case 2:
      return 'ND'
    case 3:
      return 'RD'
    default:
      return 'TH'
  }
}

/** Raw ISO -> "6TH OCTOBER 2026" in the venue timezone. */
function formatFullDate(iso: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const day = Number(get('day'))
  return `${day}${ordinalSuffix(day)} ${get('month').toUpperCase()} ${get('year')}`
}

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

/** Shared detail lines — used by both the event page and the register page. */
export function eventDateLine(event: EventItem): string {
  return (event.startsAt ? formatFullDate(event.startsAt) : null) ?? 'OCT 6, 7, 8'
}

export function eventFeeLine(event: EventItem): string {
  return event.feeAmount != null && event.feeAmount > 0
    ? formatINR(event.feeAmount)
    : (event.fee ?? 'FREE')
}

export function eventPrizeLine(event: EventItem): string {
  return event.prizeAmount != null && event.prizeAmount > 0
    ? `${formatINR(event.prizeAmount)} POOL`
    : (event.prize ?? '')
}

export function eventTeamLine(event: EventItem): string {
  return event.teamMin != null || event.teamMax != null
    ? event.teamMin === event.teamMax
      ? `${event.teamMin ?? event.teamMax} MEMBER${(event.teamMin ?? event.teamMax) === 1 ? '' : 'S'}`
      : `${event.teamMin ?? '?'} - ${event.teamMax ?? '?'} MEMBERS`
    : (event.team ?? '')
}
