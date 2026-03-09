'use client'

import React, { useRef } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Group, Material } from 'three'
import type { AttackOutcome } from '../game/gamestate'

interface FloatingDamageTextProps {
  damage: number
  outcome: AttackOutcome
  position: [number, number, number]
}

const DURATION_SECONDS = 0.8

function colorForOutcome(damage: number, outcome: AttackOutcome): string {
  if (outcome === 'miss') return '#cbd5e1'
  if (outcome === 'crit') return '#f43f5e'
  if (damage >= 18) return '#ef4444'
  if (damage >= 14) return '#f59e0b'
  return '#f8fafc'
}

function textForOutcome(damage: number, outcome: AttackOutcome): string {
  if (outcome === 'miss') return 'MISS'
  if (outcome === 'crit') return `CRIT ${damage}`
  return `-${damage}`
}

export const FloatingDamageText: React.FC<FloatingDamageTextProps> = ({ damage, outcome, position }) => {
  const groupRef = useRef<Group>(null)
  const textRef = useRef<any>(null)
  const startedAtRef = useRef<number>(performance.now())

  useFrame(() => {
    const group = groupRef.current
    const text = textRef.current
    if (!group || !text) return

    const elapsed = (performance.now() - startedAtRef.current) / 1000
    const progress = Math.min(elapsed / DURATION_SECONDS, 1)

    // Floating animation with arc
    const floatOffset = Math.sin(progress * Math.PI) * 0.6
    group.position.set(position[0], position[1] + floatOffset, position[2])

    const material = text.material as Material & { opacity?: number; transparent?: boolean }
    if (material) {
      material.transparent = true
      material.opacity = 1 - progress
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <Text
        ref={textRef}
        fontSize={0.35}
        color={colorForOutcome(damage, outcome)}
        anchorX="center"
        anchorY="middle"
        outlineColor="#111827"
        outlineWidth={0.04}
      >
        {textForOutcome(damage, outcome)}
      </Text>
    </group>
  )
}

export default FloatingDamageText