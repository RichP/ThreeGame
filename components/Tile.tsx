'use client'

import React, { useState, useEffect } from 'react'

const TILE_SIZE = 1

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
}> = ({ x, y, onClick, onHoverStart, onHoverEnd, isSelected, isReachable, isBlocked, highlightMode = 'move' }) => {
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  const baseColor = '#3b82f6'
  const moveReachableColor = '#60a5fa'
  const attackReachableColor = '#f87171'
  const selectedColor = '#f59e0b'
  const hoverColor = '#f97316'
  const blockedColor = '#0b2f68'
  const buildingColor = '#0b2f68'

  const reachableColor = highlightMode === 'attack' ? attackReachableColor : moveReachableColor

  const color = isBlocked
    ? blockedColor
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
      onClick={() => {
        if (isBlocked) return
        onClick && onClick(x, y)
      }}
      onPointerOver={() => {
        if (isBlocked) return
        setHovered(true)
        document.body.style.cursor = 'pointer'
        onHoverStart && onHoverStart(x, y)
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
        onHoverEnd && onHoverEnd()
      }}
    >
      <mesh receiveShadow={true}>
        <boxGeometry args={[TILE_SIZE, 0.1, TILE_SIZE]} />
        <meshStandardMaterial
          color={color}
          emissive={isReachable ? (highlightMode === 'attack' ? '#7f1d1d' : '#1e3a8a') : '#000000'}
          emissiveIntensity={isReachable ? (highlightMode === 'attack' ? 0.35 : 0.22) : 0}
          metalness={isBlocked ? 0.45 : 0.05}
          roughness={isBlocked ? 0.45 : 0.8}
        />
      </mesh>

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
