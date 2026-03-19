'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { GameState } from '../../game/gamestate'
import { Phase } from '../../game/gamestate'
import styles from './TutorialOverlay.module.css'

type TutorialStep =
  | 'welcome'
  | 'select'
  | 'move'
  | 'attack'
  | 'end_turn'
  | 'done'

const STORAGE_KEY = 'threegame:tutorial:dismissed'

function getDismissed(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEY) === '1'
}

function setDismissed(value: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
}

export function TutorialOverlay({ enabled, gameState }: { enabled: boolean; gameState: GameState | null }) {
  const [dismissed, setDismissedState] = useState(false)
  const [step, setStep] = useState<TutorialStep>('welcome')

  const baselineRef = useRef<{
    eventLogLength: number
    turn: number
    currentPlayer: string
    initialised: boolean
  }>({ eventLogLength: 0, turn: 1, currentPlayer: 'p1', initialised: false })

  useEffect(() => {
    setDismissedState(getDismissed())
  }, [])

  useEffect(() => {
    setDismissed(dismissed)
  }, [dismissed])

  // Initialise baseline when tutorial starts.
  useEffect(() => {
    if (!enabled) return
    if (!gameState) return
    if (baselineRef.current.initialised) return

    baselineRef.current = {
      eventLogLength: gameState.eventLog.length,
      turn: gameState.turn,
      currentPlayer: gameState.currentPlayer,
      initialised: true,
    }
  }, [enabled, gameState])

  const progress = useMemo(() => {
    if (!enabled || !gameState || !baselineRef.current.initialised) {
      return {
        moved: false,
        attacked: false,
        turnAdvanced: false,
        hasSelection: false,
      }
    }

    const base = baselineRef.current
    const eventsSince = gameState.eventLog.slice(base.eventLogLength)
    const moved = eventsSince.some((e) => e.type === 'move')
    const attacked = eventsSince.some((e) => e.type === 'attack')
    const turnAdvanced =
      gameState.turn !== base.turn || gameState.currentPlayer !== base.currentPlayer

    return {
      moved,
      attacked,
      turnAdvanced,
      hasSelection: !!gameState.selectedUnitId,
    }
  }, [enabled, gameState])

  // Auto-advance forward only.
  useEffect(() => {
    if (!enabled) return
    if (!gameState) return
    if (step === 'done') return

    if (step === 'welcome' && progress.hasSelection) {
      setStep(gameState.phase === Phase.MOVE_UNIT ? 'move' : gameState.phase === Phase.ATTACK ? 'attack' : 'select')
      return
    }

    if (step === 'select' && progress.hasSelection) {
      setStep('move')
      return
    }

    if (step === 'move' && progress.moved) {
      setStep('attack')
      return
    }

    if (step === 'attack' && progress.attacked) {
      setStep('end_turn')
      return
    }

    if (step === 'end_turn' && progress.turnAdvanced) {
      setStep('done')
    }
  }, [enabled, gameState, progress.attacked, progress.hasSelection, progress.moved, progress.turnAdvanced, step])

  if (!enabled || dismissed) return null

  const content = {
    welcome: {
      title: 'Tutorial — Welcome',
      text: 'This overlay will guide you through one turn: select a unit → move → attack → end turn.',
      hint: 'Tip: You can dismiss this any time and re-enable by clearing localStorage key threegame:tutorial:dismissed.',
    },
    select: {
      title: 'Step 1 — Select a unit',
      text: 'Click one of your units to start.',
      hint: 'Units that still have actions remaining are the best pick.',
    },
    move: {
      title: 'Step 2 — Move',
      text: 'Hover tiles to preview path cost, then click a highlighted tile to move.',
      hint: 'Try to move where you can see an enemy (line-of-sight matters).',
    },
    attack: {
      title: 'Step 3 — Attack',
      text: 'Hover an enemy to see hit/miss/crit odds, then click to attack.',
      hint: 'Targets adjacent to blocked tiles get a cover bonus (harder to hit).',
    },
    end_turn: {
      title: 'Step 4 — End Turn',
      text: 'When you’re done, click Continue Turn to pass control.',
      hint: 'You can also cancel selection if you picked the wrong unit.',
    },
    done: {
      title: 'Tutorial',
      text: 'Done!',
      hint: '',
    },
  }[step]

  const stepIndex = ['welcome', 'select', 'move', 'attack', 'end_turn', 'done'].indexOf(step) + 1
  const stepCount = 5
  const visibleStepNumber = Math.min(stepCount, Math.max(1, stepIndex - 1))

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{content.title}</h3>
          <button
            className={styles.secondary}
            onClick={() => {
              setDismissed(true)
              setDismissedState(true)
            }}
          >
            Dismiss
          </button>
        </div>

        <p className={styles.step}>{content.text}</p>
        {content.hint && <div className={styles.hint}>{content.hint}</div>}

        <div className={styles.actions}>
          <button
            className={styles.primary}
            onClick={() => {
              // Manual progression for when state doesn’t advance (e.g. user exploring).
              const order: TutorialStep[] = ['welcome', 'select', 'move', 'attack', 'end_turn', 'done']
              const i = order.indexOf(step)
              setStep(order[Math.min(order.length - 1, i + 1)])
            }}
            disabled={step === 'done'}
          >
            Next
          </button>

          <button
            className={styles.secondary}
            onClick={() => {
              setDismissed(false)
              setDismissedState(false)
              baselineRef.current.initialised = false
              setStep('welcome')
            }}
          >
            Restart
          </button>
        </div>

        <div className={styles.progress}>
          <span className={styles.pill}>Tutorial</span>
          <span>
            Step {visibleStepNumber} / {stepCount}
          </span>
        </div>
      </div>
    </div>
  )
}
