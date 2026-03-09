'use client'

import React from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshStandardMaterial } from 'three'
import type { GameState, Position } from '../../game/gamestate'
import { isAdjacentToBlockedTile, hasLineOfSight } from '../../game/rules/combat'
import { getUnitById } from '../../game/gamestate'
import styles from './CoverVisualizer.module.css'

interface CoverVisualizerProps {
  gameState: GameState
  selectedUnitId: string | null
  hoveredUnitId: string | null
  isVisible: boolean
}

interface CoverIndicator {
  id: string
  position: Position
  type: 'cover' | 'los_blocker'
  opacity: number
}

export const CoverVisualizer: React.FC<CoverVisualizerProps> = ({
  gameState,
  selectedUnitId,
  hoveredUnitId,
  isVisible,
}) => {
  const coverIndicators = React.useMemo(() => {
    if (!isVisible || !selectedUnitId || !hoveredUnitId) return []

    const selectedUnit = getUnitById(gameState, selectedUnitId)
    const hoveredUnit = getUnitById(gameState, hoveredUnitId)
    
    if (!selectedUnit || !hoveredUnit) return []

    const indicators: CoverIndicator[] = []

    // Check if target has cover
    if (isAdjacentToBlockedTile(gameState, hoveredUnit.position)) {
      indicators.push({
        id: `cover-${hoveredUnitId}`,
        position: hoveredUnit.position,
        type: 'cover',
        opacity: 1,
      })
    }

    // Check for LoS blockers
    const lineTiles = getLineOfSightTiles(gameState, selectedUnit.position, hoveredUnit.position)
    lineTiles.forEach((tile, index) => {
      if (isAdjacentToBlockedTile(gameState, tile)) {
        indicators.push({
          id: `los-${tile.x}-${tile.y}-${index}`,
          position: tile,
          type: 'los_blocker',
          opacity: 0.8,
        })
      }
    })

    return indicators
  }, [gameState, selectedUnitId, hoveredUnitId, isVisible])

  if (!isVisible || coverIndicators.length === 0) {
    return null
  }

  return (
    <>
      {coverIndicators.map((indicator) => (
        <CoverIndicatorMesh
          key={indicator.id}
          position={indicator.position}
          type={indicator.type}
          opacity={indicator.opacity}
        />
      ))}
    </>
  )
}

interface CoverIndicatorMeshProps {
  position: Position
  type: 'cover' | 'los_blocker'
  opacity: number
}

const CoverIndicatorMesh: React.FC<CoverIndicatorMeshProps> = ({ position, type, opacity }) => {
  const meshRef = React.useRef<Mesh>(null)
  const materialRef = React.useRef<MeshStandardMaterial>(null)

  useFrame(() => {
    const mesh = meshRef.current
    const material = materialRef.current
    if (!mesh || !material) return

    // Pulse animation
    const time = Date.now() * 0.005
    const pulse = (Math.sin(time) + 1) * 0.5
    const currentOpacity = opacity * (0.6 + pulse * 0.4)

    material.opacity = currentOpacity
    material.transparent = true
    
    // Scale pulse
    const scale = 1 + (pulse * 0.2)
    mesh.scale.set(scale, scale, scale)
  })

  const color = type === 'cover' ? '#f59e0b' : '#ef4444'
  const height = type === 'cover' ? 0.15 : 0.1

  return (
    <mesh
      ref={meshRef}
      position={[position.x, height, position.y]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[0.35, 0.45, 24]} />
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={2} // AdditiveBlending
      />
    </mesh>
  )
}

// Helper function to get tiles between two positions for LoS visualization
function getLineOfSightTiles(state: GameState, from: Position, to: Position): Position[] {
  const tiles: Position[] = []
  const lineTiles = getLineTiles(from, to)

  if (lineTiles.length <= 2) return []

  // Skip first and last tiles (attacker and target positions)
  for (let i = 1; i < lineTiles.length - 1; i++) {
    if (!isAdjacentToBlockedTile(state, lineTiles[i])) {
      tiles.push(lineTiles[i])
    }
  }

  return tiles
}

// Extract getLineTiles function from combat rules for reuse
function getLineTiles(from: Position, to: Position): Position[] {
  const tiles: Position[] = []
  let x0 = from.x
  let y0 = from.y
  const x1 = to.x
  const y1 = to.y
  const dx = Math.abs(x1 - x0)
  const sx = x0 < x1 ? 1 : -1
  const dy = -Math.abs(y1 - y0)
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy

  while (true) {
    tiles.push({ x: x0, y: y0 })
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x0 += sx
    }
    if (e2 <= dx) {
      err += dx
      y0 += sy
    }
  }

  return tiles
}