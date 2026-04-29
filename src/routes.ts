export type RouteKey = '/' | '/example-1' | '/example-2' | '/example-3' | '/fyou' | '/rotary-dial'

export const pageCards: Array<{
  path: Exclude<RouteKey, '/'>
  title: string
  blurb: string
}> = [
  {
    path: '/example-1',
    title: 'Example 1: Stagger Grid',
    blurb: 'Staggered cards with spring entrance and hover amplification.',
  },
  {
    path: '/example-2',
    title: 'Example 2: Morphing Deck',
    blurb: 'Shared layout transitions, drag gestures, and animated detail panel.',
  },
  {
    path: '/example-3',
    title: 'Example 3: Scroll Story',
    blurb: 'Scroll-linked progress and section reveals for narrative landing pages.',
  },
  {
    path: '/fyou',
    title: 'Fyou: Sticky Emoji',
    blurb: 'One emoji appears from far away, follows pointer/touch, and returns center.',
  },
  {
    path: '/rotary-dial',
    title: 'Rotary Dial Phone',
    blurb: 'Interactive simulation of a rotary dial telephone with pulse visualization.',
  },
]

export function normalizeHash(hash: string): RouteKey {
  const raw = hash.replace(/^#/, '')
  if (!raw || raw === '/') return '/'
  const normalized = raw.startsWith('/') ? raw : `/${raw}`
  if (normalized === '/example-1') return '/example-1'
  if (normalized === '/example-2') return '/example-2'
  if (normalized === '/example-3') return '/example-3'
  if (normalized === '/fyou') return '/fyou'
  if (normalized === '/rotary-dial') return '/rotary-dial'
  return '/'
}

export function updateHash(path: RouteKey) {
  window.location.hash = path
}
