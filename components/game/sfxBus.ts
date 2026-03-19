import type { SfxEvent } from './sfx'
import { playSfx } from './sfx'

/**
 * Tiny decoupled bus so gameplay components can emit SFX without needing to
 * coordinate prop drilling.
 */

export function emitSfx(event: SfxEvent) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('threegame:sfx', { detail: { event } }))
}

export function installSfxBusListener() {
  if (typeof window === 'undefined') return () => {}

  const handler = (raw: Event) => {
    const event = raw as CustomEvent<{ event: SfxEvent }>
    if (!event.detail?.event) return
    playSfx(event.detail.event)
  }

  window.addEventListener('threegame:sfx', handler)
  return () => window.removeEventListener('threegame:sfx', handler)
}
