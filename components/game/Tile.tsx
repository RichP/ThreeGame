'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { CONSTANTS } from '../../constants'
import { emitSfx } from './sfxBus'

const TILE_SIZE = CONSTANTS.MECHANICS.TILE_SIZE

type TileHighlightMode = 'move' | 'attack'

const Tile: React.FC<{
  x: number;
  y: number;
  onClick?: (x: number, y: number) => void;
  onHoverStart?: (x: number, y: number) => void;
  onHoverEnd?: () => void;
  isSelected?: boolean;
  isReachable?: boolean;
  isBlocked?: boolean;
  highlightMode?: TileHighlightMode;
  isPreviewMode?: boolean;
}> = ({ x, y, onClick, onHoverStart, onHoverEnd, isSelected, isReachable, isBlocked, highlightMode = 'move', isPreviewMode = false }) => {
  const [hovered, setHovered] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [invalidFlash, setInvalidFlash] = useState(0)

  // Animate the click pulse / invalid flash without extra timers.
  useFrame((_, delta) => {
    // delta is seconds; tune decay to ~250ms pulse and ~350ms invalid flash.
    setPulse((prev) => Math.max(0, prev - delta * 4))
    setInvalidFlash((prev) => Math.max(0, prev - delta * 3))
  })

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  const baseColor = CONSTANTS.COLORS.TILE_BASE
  const moveReachableColor = CONSTANTS.COLORS.TILE_MOVE_REACHABLE
  const attackReachableColor = CONSTANTS.COLORS.TILE_ATTACK_REACHABLE
  const selectedColor = CONSTANTS.COLORS.TILE_SELECTED
  const hoverColor = CONSTANTS.COLORS.TILE_HOVER
  const blockedColor = CONSTANTS.COLORS.TILE_BLOCKED
  const buildingColor = CONSTANTS.COLORS.TILE_BUILDING

  const reachableColor = highlightMode === 'attack' ? attackReachableColor : moveReachableColor

  const pulseIntensity = useMemo(() => {
    if (pulse <= 0) return 0
    // Simple ease-out.
    return pulse * (2 - pulse)
  }, [pulse])

  const invalidIntensity = useMemo(() => {
    if (invalidFlash <= 0) return 0
    return invalidFlash * (2 - invalidFlash)
  }, [invalidFlash])

  const color = isBlocked
    ? blockedColor
    : invalidIntensity > 0
      ? '#ef4444'
      : isSelected
        ? selectedColor
        : isReachable
          ? reachableColor
          : hovered
            ? hoverColor
            : baseColor

  return (
    <group
      position={[x * TILE_SIZE, 0.0, y * TILE_SIZE]}
      onClick={isPreviewMode ? undefined : () => {
        if (isBlocked) {
          setInvalidFlash(1)
          emitSfx('invalid')
          return
        }

        // Pulse any click, but visually emphasise reachable clicks.
        setPulse(1)

        emitSfx('ui_click')

        if (!isReachable) {
          setInvalidFlash(1)
          emitSfx('invalid')
        }

        onClick && onClick(x, y)
      }}
      onPointerOver={isPreviewMode ? undefined : () => {
        if (isBlocked) return
        setHovered(true)
        document.body.style.cursor = 'pointer'
        onHoverStart && onHoverStart(x, y)
      }}
      onPointerOut={isPreviewMode ? undefined : () => {
        setHovered(false)
        document.body.style.cursor = 'auto'
        onHoverEnd && onHoverEnd()
      }}
    >
      <mesh receiveShadow={true}>
        <boxGeometry args={[TILE_SIZE, 0.1, TILE_SIZE]} />
        <meshStandardMaterial
          color={color}
          emissive={
            invalidIntensity > 0
              ? '#7f1d1d'
              : isReachable
                ? (highlightMode === 'attack' ? '#7f1d1d' : '#1e3a8a')
                : '#000000'
          }
          emissiveIntensity={
            invalidIntensity > 0
              ? 0.75 * invalidIntensity
              : isReachable
                ? (highlightMode === 'attack' ? 0.35 : 0.22)
                : 0
          }
          metalness={isBlocked ? 0.45 : 0.05}
          roughness={isBlocked ? 0.45 : 0.8}
        />
      </mesh>

      {/* Click pulse ring (juice) */}
      {pulseIntensity > 0 && (
        <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18 + 0.2 * pulseIntensity, 0.22 + 0.28 * pulseIntensity, 28]} />
          <meshBasicMaterial
            color={isReachable ? (highlightMode === 'attack' ? '#fb7185' : '#60a5fa') : '#94a3b8'}
            transparent
            opacity={0.55 * (1 - pulseIntensity)}
          />
        </mesh>
      )}

      {isReachable && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.24, 0.34, 24]} />
          <meshBasicMaterial
            color={highlightMode === 'attack' ? '#fca5a5' : '#93c5fd'}
            transparent
            opacity={0.92}
          />
        </mesh>
      )}

      {isBlocked && (
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.0, 0.9]} />
          <meshStandardMaterial color={buildingColor} metalness={0.3} roughness={0.6} />
        </mesh>
      )}
    </group>
  )
}

export default React.memo(Tile)
