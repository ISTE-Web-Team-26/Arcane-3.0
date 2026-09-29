/** Registration wiring for the Supabase Edge Function (`register-event`).
 *
 * The public anon key is safe to bundle (VITE_ prefix). The secret key must
 * never leave `scripts/fetch-events.ts`.
 */

const PROD_ENDPOINT =
  'https://lukyeppvpetjilkfxaxo.supabase.co/functions/v1/register-event'

export function registerEndpoint(): string {
  const override = import.meta.env.VITE_REGISTER_ENDPOINT
  return typeof override === 'string' && override.trim()
    ? override.trim()
    : PROD_ENDPOINT
}

/** Single member as the Edge Function expects it. */
export interface RegisterMember {
  name: string
  semester: string
  branch: string
  batch: string
  phone_no: string
  email: string
}

export interface RegistrationData {
  team_name: string
  college_name: string
  members: RegisterMember[]
}

export interface RegistrationSuccess {
  ticket: string
  registration_id: number
  verification: string
  whatsapp_group_link: string | null
}

/** Uploads larger than this are rejected client-side (the API caps at 10MB). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

/** Validate size and read a file as a base64 data-URL for `attached_img`. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      reject(
        new Error(
          `File is ${(file.size / 1024 / 1024).toFixed(1)}MB — it must be 10MB or less.`,
        ),
      )
      return
    }
    const reader = new FileReader()
    reader.onerror = () =>
      reject(new Error('Could not read the selected file. Try again.'))
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

interface ApiReply {
  success?: boolean
  ticket?: unknown
  registration_id?: unknown
  verification?: unknown
  whatsapp_group_link?: unknown
  error?: unknown
}

/** POST the registration; resolves with the ticket or throws the API error. */
export async function submitRegistration(
  eventId: number,
  data: RegistrationData,
  attachedImg: string | null,
): Promise<RegistrationSuccess> {
  // The Edge Function is deployed with verify_jwt=false (public), so the
  // anon key is optional — it is sent when configured, otherwise the request
  // goes out unauthenticated and the gateway still routes it.
  const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const key =
    typeof rawKey === 'string' && rawKey.trim() ? rawKey.trim() : null

  let res: Response
  try {
    res = await fetch(registerEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { Authorization: `Bearer ${key}`, apikey: key } : {}),
      },
      body: JSON.stringify({
        event_id: eventId,
        data,
        attached_img: attachedImg,
      }),
    })
  } catch {
    throw new Error('Network error — check your connection and try again.')
  }

  const body = (await res.json().catch(() => null)) as ApiReply | null
  if (res.ok && body?.success === true) {
    return {
      ticket: String(body.ticket ?? ''),
      registration_id: Number(body.registration_id ?? 0),
      verification:
        typeof body.verification === 'string' && body.verification.trim()
          ? body.verification.trim()
          : 'pending',
      whatsapp_group_link:
        typeof body.whatsapp_group_link === 'string' &&
        body.whatsapp_group_link.trim()
          ? body.whatsapp_group_link.trim()
          : null,
    }
  }
  const message =
    body && typeof body.error === 'string' && body.error.trim()
      ? body.error.trim()
      : `Registration failed (HTTP ${res.status}). Please try again.`
  throw new Error(message)
}
