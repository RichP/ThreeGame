'use client'

import React from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshStandardMaterial } from 'three'
import type { GameState, Position } from '../../game/gamestate'
import { getUnitById } from '../../game/gamestate'

interface StatusVisualizerProps {
  gameState: GameState
  isVisible: boolean
}

interface StatusIndicator {
  id: string
  position: Position
  type: 'poison' | 'armor_up' | 'guard' | 'aim' | 'dash'
  duration: number
  maxDuration: number
}

export const StatusVisualizer: React.FC<StatusVisualizerProps> = ({
  gameState,
  isVisible,
}) => {
  const statusIndicators = React.useMemo(() => {
    if (!isVisible) return []

    const indicators: StatusIndicator[] = []

    gameState.units.forEach((unit) => {
      const basePosition: Position = { x: unit.position.x, y: unit.position.y }

      // Poison status
      if (unit.statusEffects.poisonTurns > 0) {
        indicators.push({
          id: `poison-${unit.id}`,
          position: basePosition,
          type: 'poison',
          duration: unit.statusEffects.poisonTurns,
          maxDuration: 2,
        })
      }

      // Armor Up status
      if (unit.statusEffects.armorUpTurns > 0) {
        indicators.push({
          id: `armor-${unit.id}`,
          position: basePosition,
          type: 'armor_up',
          duration: unit.statusEffects.armorUpTurns,
          maxDuration: 1,
        })
      }

      // Guard status
      if (unit.statusEffects.guardTurns > 0) {
        indicators.push({
          id: `guard-${unit.id}`,
          position: basePosition,
          type: 'guard',
          duration: unit.statusEffects.guardTurns,
          maxDuration: 1,
        })
      }

      // Aim status
      if (unit.statusEffects.aimTurns > 0) {
        indicators.push({
          id: `aim-${unit.id}`,
          position: basePosition,
          type: 'aim',
          duration: unit.statusEffects.aimTurns,
          maxDuration: 1,
        })
      }

      // Dash bonus movement
      if (unit.statusEffects.dashBonusMovement > 0) {
        indicators.push({
          id: `dash-${unit.id}`,
          position: basePosition,
          type: 'dash',
          duration: 1, // Dash is consumed immediately
          maxDuration: 1,
        })
      }
    })

    return indicators
  }, [gameState, isVisible])

  if (!isVisible || statusIndicators.length === 0) {
    return null
  }

  return (
    <>
      {statusIndicators.map((indicator) => (
        <StatusIndicatorMesh
          key={indicator.id}
          position={indicator.position}
          type={indicator.type}
          duration={indicator.duration}
          maxDuration={indicator.maxDuration}
        />
      ))}
    </>
  )
}

interface StatusIndicatorMeshProps {
  position: Position
  type: 'poison' | 'armor_up' | 'guard' | 'aim' | 'dash'
  duration: number
  maxDuration: number
}

const StatusIndicatorMesh: React.FC<StatusIndicatorMeshProps> = ({ 
  position, 
  type, 
  duration, 
  maxDuration 
}) => {
  const meshRef = React.useRef<Mesh>(null)
  const materialRef = React.useRef<MeshStandardMaterial>(null)

  useFrame(() => {
    const mesh = meshRef.current
    const material = materialRef.current
    if (!mesh || !material) return

    // Pulse animation based on remaining duration
    const time = Date.now() * 0.008
    const pulse = (Math.sin(time * 2) + 1) * 0.5
    const durationRatio = duration / maxDuration
    const opacity = 0.6 + (pulse * 0.4) * durationRatio

    material.opacity = opacity
    material.transparent = true
    
    // Scale based on duration (fading out as duration decreases)
    const scale = 0.8 + (durationRatio * 0.4) + (pulse * 0.1)
    mesh.scale.set(scale, scale, scale)
  })

  const { color, height, geometryArgs } = getStatusVisualConfig(type)
  const yPosition = height + (duration / maxDuration) * 0.1 // Float higher for longer duration

  return (
    <mesh
      ref={meshRef}
      position={[position.x, yPosition, position.y]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={geometryArgs} />
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={2} // AdditiveBlending
      />
    </mesh>
  )
}

function getStatusVisualConfig(type: string) {
  switch (type) {
    case 'poison':
      return {
        color: '#22c55e',
        height: 0.5,
        geometryArgs: [0.25, 0.35, 16] as [number, number, number]
      }
    case 'armor_up':
      return {
        color: '#60a5fa',
        height: 0.45,
        geometryArgs: [0.28, 0.38, 20] as [number, number, number]
      }
    case 'guard':
      return {
        color: '#f59e0b',
        height: 0.4,
        geometryArgs: [0.3, 0.4, 24] as [number, number, number]
      }
    case 'aim':
      return {
        color: '#ef4444',
        height: 0.55,
        geometryArgs: [0.22, 0.32, 12] as [number, number, number]
      }
    case 'dash':
      return {
        color: '#a78bfa',
        height: 0.35,
        geometryArgs: [0.35, 0.45, 28] as [number, number, number]
      }
    default:
      return {
        color: '#ffffff',
        height: 0.4,
        geometryArgs: [0.3, 0.4, 20] as [number, number, number]
      }
  }
}