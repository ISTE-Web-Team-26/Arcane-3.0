export interface EventItem {
  id: string | number
  title: string
  description: string
  image: string
  to: string
  tag?: string
}

export const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'hackathon',
    title: 'HACKATHON',
    description:
      'Next-generation game previews, sensory cyberware prototypes, and indie masterclasses.',
    image: '/events/cyberspace-expo.jpg',
    to: '/event1',
    tag: '10/10/26',
  },
  {
    id: 'perplexit',
    title: 'PERPLEXIT',
    description:
      'Deep-dive neural interface architectures, rogue AI protocols, and hardware tearing.',
    image: '/events/neo-tokyo-symposium.jpg',
    to: '/event2',
    tag: '10/10/26',
  },
  {
    id: 'synthwave-arcade',
    title: 'SYNTHWAVE ARCADE SHOWDOWN',
    description:
      'High-octane retro gaming tournament, holographic speedrunning, and subterranean beat battles.',
    image: '/events/synthwave-arcade.jpg',
    to: '/event3',
    tag: 'TOURNAMENT // 2026',
  },
]
