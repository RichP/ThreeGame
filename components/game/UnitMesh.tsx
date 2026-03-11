'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, MeshStandardMaterial } from 'three';
import type { AttackOutcome, UnitData } from '../../game/gamestate';

interface UnitMeshProps {
    unit: UnitData;
    actionState?: 'can_move' | 'can_attack' | 'exhausted' | null;
    isSelected?: boolean;
    isPreviewTarget?: boolean;
    hitEffectKey?: string;
    hitOutcome?: AttackOutcome;
    onHoverStart?: (unitId: string) => void;
    onHoverEnd?: () => void;
    isPreviewMode?: boolean;
}

const HIT_DURATION_SECONDS = 0.6;
const MOVEMENT_DURATION_MS = 600;

export const UnitMesh: React.FC<UnitMeshProps> = ({ unit, actionState = null, isSelected, isPreviewTarget, hitEffectKey, hitOutcome, onHoverStart, onHoverEnd, isPreviewMode = false }) => {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<MeshStandardMaterial>(null);
    const hitStartedAtRef = useRef<number | null>(null);
    const moveStartedAtRef = useRef<number | null>(null);
    const moveFromRef = useRef({ x: unit.position.x, y: unit.position.y });
    const [animatedPosition, setAnimatedPosition] = useState({ x: unit.position.x, y: 0.2, z: unit.position.y });

    const baseColor = unit.playerId === 'p1' ? '#3b82f6' : '#ef4444';
    
    // Change color based on health percentage, not absolute values
    const maxHealth = unit.maxHealth;
    const healthPercentage = (unit.health / maxHealth) * 100;
    
    let healthColor = baseColor;
    if (healthPercentage <= 25) {
        healthColor = unit.playerId === 'p1' ? '#dc2626' : '#991b1b'; // Critical: Dark Red
    } else if (healthPercentage <= 50) {
        healthColor = unit.playerId === 'p1' ? '#f59e0b' : '#d97706'; // Low: Orange
    }
    
    const finalColor = isSelected ? '#fbbf24' : healthColor;

    // Debug logging for color issues
    if (process.env.NODE_ENV === 'development') {
        console.log(`Unit ${unit.id} (${unit.archetype}):`, {
            playerId: unit.playerId,
            health: unit.health,
            baseColor,
            healthColor,
            finalColor,
            isSelected
        });
    }
    const actionIndicatorColor =
        actionState === 'can_move'
            ? '#22d3ee'
            : actionState === 'can_attack'
                ? '#f97316'
                : actionState === 'exhausted'
                    ? '#94a3b8'
                    : null;

    // Handle hit animation
    useEffect(() => {
        if (hitEffectKey && hitOutcome !== 'miss') {
            hitStartedAtRef.current = performance.now();
        }
    }, [hitEffectKey, hitOutcome]);

    // Handle movement animation
    useEffect(() => {
        // Check if unit has moved
        const hasMoved = moveFromRef.current.x !== unit.position.x || moveFromRef.current.y !== unit.position.y;
        
        if (hasMoved) {
            // Start movement animation
            moveStartedAtRef.current = performance.now();
            moveFromRef.current = { x: moveFromRef.current.x, y: moveFromRef.current.y };
        }
        
        // Update target position
        setAnimatedPosition({ x: unit.position.x, y: 0.2, z: unit.position.y });
    }, [unit.position.x, unit.position.y]);

    useFrame(() => {
        const mesh = meshRef.current;
        const material = materialRef.current;

        if (!mesh || !material) return;

        const now = performance.now();

        // Handle movement animation
        const moveStartedAt = moveStartedAtRef.current;
        if (moveStartedAt) {
            const elapsed = now - moveStartedAt;
            const progress = Math.min(elapsed / MOVEMENT_DURATION_MS, 1);
            
            if (progress >= 1) {
                // Movement complete
                moveStartedAtRef.current = null;
                moveFromRef.current = { x: unit.position.x, y: unit.position.y };
            } else {
                // Animate movement
                const startX = moveFromRef.current.x;
                const startY = moveFromRef.current.y;
                const endX = unit.position.x;
                const endY = unit.position.y;
                
                // Ease function
                const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
                
                const currentX = startX + (endX - startX) * ease;
                const currentZ = startY + (endY - startY) * ease;
                
                mesh.position.set(currentX, 0.2, currentZ);
                return; // Skip other animations during movement
            }
        }

        // Apply hit animation
        const hitStartedAt = hitStartedAtRef.current;
        if (hitStartedAt) {
            const elapsed = (now - hitStartedAt) / 1000;
            if (elapsed >= HIT_DURATION_SECONDS) {
                hitStartedAtRef.current = null;
                material.emissiveIntensity = 0;
            } else {
                const progress = elapsed / HIT_DURATION_SECONDS;
                const intensity = 1 - progress;
                const shakeAmount = (1 - progress) * 0.08;

                material.emissive.set('#ffffff');
                material.emissiveIntensity = 1.1 * intensity;

                const jitterX = (Math.random() - 0.5) * shakeAmount;
                const jitterZ = (Math.random() - 0.5) * shakeAmount;
                mesh.position.set(animatedPosition.x + jitterX, animatedPosition.y, animatedPosition.z + jitterZ);
                return;
            }
        } else {
            material.emissiveIntensity = 0;
        }

        // Apply current position (no animation)
        mesh.position.set(animatedPosition.x, animatedPosition.y, animatedPosition.z);
    });

    return (
        <>
            <mesh
                ref={meshRef}
                castShadow
                receiveShadow={false}
                onPointerOver={isPreviewMode ? undefined : () => onHoverStart?.(unit.id)}
                onPointerOut={isPreviewMode ? undefined : () => onHoverEnd?.()}
            >
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial ref={materialRef} color={finalColor} />
            </mesh>

            {(isSelected || isPreviewTarget) && (
                <mesh position={[animatedPosition.x, animatedPosition.y - 0.14, animatedPosition.z]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.22, 0.31, 28]} />
                    <meshBasicMaterial
                        color={isPreviewTarget ? '#fda4af' : '#fde68a'}
                        transparent
                        opacity={0.95}
                    />
                </mesh>
            )}

            {actionIndicatorColor && (
                <mesh position={[animatedPosition.x, animatedPosition.y + 0.22, animatedPosition.z]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.18, 0.21, 28]} />
                    <meshBasicMaterial color={actionIndicatorColor} transparent opacity={0.95} />
                </mesh>
            )}
        </>
    );
};

export default UnitMesh;
