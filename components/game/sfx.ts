/*
  Lightweight SFX module for ThreeGame.

  Goals:
  - No external assets required (procedural oscillator sounds)
  - Works in browsers with autoplay restrictions (AudioContext starts on first user gesture)
  - Decoupled from components via a small event API
*/

export type SfxEvent =
  | 'ui_click'
  | 'invalid'
  | 'select'
  | 'move'
  | 'attack'
  | 'hit'
  | 'crit'
  | 'miss'
  | 'death'

export interface SfxSettings {
  muted: boolean
  volume: number // 0..1
}

let audioContext: AudioContext | null = null
let currentSettings: SfxSettings = { muted: false, volume: 0.7 }

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined
  if (!Ctx) return null

  if (!audioContext) {
    audioContext = new Ctx()
  }

  return audioContext
}

export function setSfxSettings(settings: Partial<SfxSettings>) {
  currentSettings = {
    ...currentSettings,
    ...settings,
    muted: settings.muted ?? currentSettings.muted,
    volume: settings.volume ?? currentSettings.volume,
  }
}

export function getSfxSettings(): SfxSettings {
  return currentSettings
}

export async function ensureSfxReady(): Promise<void> {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      // ignore
    }
  }
}

type Envelope = {
  attack: number
  decay: number
  sustain: number
  release: number
}

function playBeep(options: {
  type?: OscillatorType
  frequency: number
  duration: number
  gain: number
  detune?: number
  envelope?: Envelope
  filter?: { type: BiquadFilterType; frequency: number; q?: number }
}) {
  const ctx = getAudioContext()
  if (!ctx) return
  if (currentSettings.muted) return

  const now = ctx.currentTime
  const duration = Math.max(0.01, options.duration)
  const baseGain = Math.max(0, options.gain) * currentSettings.volume

  const osc = ctx.createOscillator()
  osc.type = options.type ?? 'sine'
  osc.frequency.setValueAtTime(options.frequency, now)
  if (options.detune) osc.detune.setValueAtTime(options.detune, now)

  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0.0001, now)

  let output: AudioNode = gainNode
  if (options.filter) {
    const filter = ctx.createBiquadFilter()
    filter.type = options.filter.type
    filter.frequency.setValueAtTime(options.filter.frequency, now)
    if (options.filter.q) filter.Q.setValueAtTime(options.filter.q, now)
    gainNode.connect(filter)
    output = filter
  }

  output.connect(ctx.destination)
  osc.connect(gainNode)

  const env: Envelope = options.envelope ?? {
    attack: 0.005,
    decay: 0.06,
    sustain: 0.2,
    release: 0.08,
  }

  const attackEnd = now + env.attack
  const decayEnd = attackEnd + env.decay
  const releaseStart = now + duration
  const end = releaseStart + env.release

  gainNode.gain.linearRampToValueAtTime(baseGain, attackEnd)
  gainNode.gain.linearRampToValueAtTime(baseGain * env.sustain, decayEnd)
  gainNode.gain.setValueAtTime(baseGain * env.sustain, releaseStart)
  gainNode.gain.linearRampToValueAtTime(0.0001, end)

  osc.start(now)
  osc.stop(end)
}

export function playSfx(event: SfxEvent) {
  // Attempt to resume context on first usage; if autoplay restrictions block it,
  // it will succeed after the next user gesture.
  void ensureSfxReady()

  switch (event) {
    case 'ui_click':
      playBeep({ type: 'triangle', frequency: 420, duration: 0.05, gain: 0.08 })
      break
    case 'invalid':
      playBeep({ type: 'sawtooth', frequency: 140, duration: 0.08, gain: 0.14, filter: { type: 'lowpass', frequency: 700, q: 1 } })
      break
    case 'select':
      playBeep({ type: 'triangle', frequency: 520, duration: 0.07, gain: 0.11 })
      break
    case 'move':
      playBeep({ type: 'sine', frequency: 260, duration: 0.12, gain: 0.09 })
      playBeep({ type: 'sine', frequency: 340, duration: 0.12, gain: 0.06, detune: 8 })
      break
    case 'attack':
      playBeep({ type: 'square', frequency: 260, duration: 0.06, gain: 0.12, filter: { type: 'highpass', frequency: 180, q: 0.8 } })
      break
    case 'hit':
      playBeep({ type: 'triangle', frequency: 360, duration: 0.08, gain: 0.13 })
      break
    case 'crit':
      playBeep({ type: 'square', frequency: 520, duration: 0.09, gain: 0.14 })
      playBeep({ type: 'square', frequency: 660, duration: 0.09, gain: 0.08, detune: -6 })
      break
    case 'miss':
      playBeep({ type: 'sine', frequency: 210, duration: 0.06, gain: 0.08, detune: -24 })
      break
    case 'death':
      playBeep({ type: 'sawtooth', frequency: 120, duration: 0.18, gain: 0.14, filter: { type: 'lowpass', frequency: 480, q: 1.2 } })
      break
    default:
      break
  }
}
