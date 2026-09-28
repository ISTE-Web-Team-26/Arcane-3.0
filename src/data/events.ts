export interface EventItem {
  id: string
  code: string
  status: 'SLOTS_LOW' | 'OPEN' | 'LIMITED' | 'FULL' | string
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
  // Raw/detail fields synced from Supabase for the individual event pages.
  dbId?: number
  longDescription?: string
  feeAmount?: number | null
  prizeAmount?: number | null
  paymentImage?: string
  teamMin?: number | null
  teamMax?: number | null
  startsAt?: string
  createdAt?: string
  updatedAt?: string
  guidelines?: string[]
}

export const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'byte-surge',
    code: '•EVT_01 [24H_HACK]',
    status: 'SLOTS_LOW',
    posterTag: 'POSTER::01',
    badgeBottom: 'CRT_SCAN_4X',
    image: '/events/byte-surge.jpg',
    title: 'BYTE_SURGE',
    prize: '★50K',
    description:
      'Autonomous rapid code forge. Build robust decentralized or terminal-level artifacts in 24 continuous hours.',
    track: '01 // CODE',
    squadLabel: 'SQUAD',
    squad: '2-4 DEVS',
    venue: 'LAB_04',
    time: '09:30',
    actionText: 'REGISTER',
    to: '/event1',
  },
  {
    id: 'retro-overdrive',
    code: '•EVT_02 [ARCADE/FPS]',
    status: 'OPEN',
    posterTag: 'POSTER::02',
    badgeBottom: 'VS_CABINET',
    image: '/events/retro-overdrive.jpg',
    title: 'RETRO_OVERDRIVE',
    prize: '★30K',
    description:
      'Competitive zero-latency Valorant brackets chained into brutal legacy Street Fighter coin-op gauntlets.',
    track: '02 // GAME',
    squadLabel: 'SQUAD',
    squad: '5 MAN_RIG',
    venue: 'ARENA_01',
    time: '11:15',
    actionText: 'REGISTER',
    to: '/event2',
  },
  {
    id: 'mecha-clash',
    code: '•EVT_03 [ROBOTICS]',
    status: 'LIMITED',
    posterTag: 'POSTER::03',
    badgeBottom: 'KINETIC_BOT',
    image: '/events/mecha-clash.jpg',
    title: 'MECHA_CLASH',
    prize: '★40K',
    description:
      'High-kinetic 15kg combat bot collisions plus ultra-precise high-speed autonomous infrared line tracers.',
    track: '03 // ROBO',
    squadLabel: 'WEIGHT',
    squad: '< 15.0 KG',
    venue: 'OUTDOOR_PIT',
    time: '13:00',
    actionText: 'REGISTER',
    to: '/event3',
  },
  {
    id: 'cipher-hunt',
    code: '•EVT_04 [CRYPTIC/CTF]',
    status: 'OPEN',
    posterTag: 'POSTER::04',
    badgeBottom: 'HEX_MATRIX',
    image: '/events/cipher-hunt.jpg',
    title: 'CIPHER_HUNT',
    prize: '★25K',
    description:
      'Penetrate air-gapped web targets, analyze memory dumps, and crack cryptic steganographic anomalies.',
    track: '04 // SEC',
    squadLabel: 'SQUAD',
    squad: '1-2 OPER',
    venue: 'LAB_02',
    time: '14:00',
    actionText: 'REGISTER',
    to: '/event1',
  },
  {
    id: 'prompt-war',
    code: '•EVT_05 [AI_SYNTH]',
    status: 'OPEN',
    posterTag: 'POSTER::05',
    badgeBottom: 'NEURAL_SYNTH',
    image: '/events/prompt-war.jpg',
    title: 'PROMPT_WAR',
    prize: '★20K',
    description:
      'Adversarial LLM steering, jailbreaking safety boundaries, and precision generative rendering under pressure.',
    track: '05 // AI',
    squadLabel: 'SQUAD',
    squad: 'SOLO_PILOT',
    venue: 'SEMINAR_03',
    time: '16:30',
    actionText: 'REGISTER',
    to: '/event2',
  },
  {
    id: 'ui-deconstruct',
    code: '•EVT_06 [SPEED_UX]',
    status: 'FULL',
    posterTag: 'POSTER::06',
    badgeBottom: 'TEARDOWN',
    image: '/events/ui-deconstruct.jpg',
    title: 'UI_DECONSTRUCT',
    prize: '★15K',
    description:
      '60-minute hardcore design sprint: teardown legacy enterprise monstrosities into brutal hyper-ergonomic displays.',
    track: '06 // DSGN',
    squadLabel: 'SQUAD',
    squad: '1-2 DESIGN',
    venue: 'DESIGN_HUB',
    time: '10:45',
    actionText: 'LOCKED',
    to: '/event3',
  },
]

