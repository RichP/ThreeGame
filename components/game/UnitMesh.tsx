'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh, MeshStandardMaterial } from 'three';
import type { AttackOutcome, UnitData, Position, GameState } from '../../game/gamestate';
import { getShortestPathToPosition } from '../../game/pathfinding';
import { ANIMATION_TIMINGS } from './animationTimings';

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
    gameState?: GameState;
}

const HIT_DURATION_SECONDS = ANIMATION_TIMINGS.hitFlashDurationSeconds;
const MOVEMENT_DURATION_MS = ANIMATION_TIMINGS.movementDurationMs;

export const UnitMesh: React.FC<UnitMeshProps> = ({ unit, actionState = null, isSelected, isPreviewTarget, hitEffectKey, hitOutcome, onHoverStart, onHoverEnd, isPreviewMode = false, gameState }) => {
    // We animate a parent group so *all* sub-meshes (cube + rings) move together.
    const groupRef = useRef<Group>(null);
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<MeshStandardMaterial>(null);
    const hitStartedAtRef = useRef<number | null>(null);
    const moveStartedAtRef = useRef<number | null>(null);
    const moveFromRef = useRef({ x: unit.position.x, y: unit.position.y });
    // This is the *current rendered* position; during movement it interpolates.
    const [animatedPosition, setAnimatedPosition] = useState({ x: unit.position.x, y: 0.2, z: unit.position.y });
    const [currentPath, setCurrentPath] = useState<Position[]>([]);
    const [currentPathIndex, setCurrentPathIndex] = useState(0);
    const [isMovingAlongPath, setIsMovingAlongPath] = useState(false);

    // Create a temporary state where THIS unit is still at moveFromRef.
    // This prevents pathfinding from rejecting the destination as "occupied" by itself
    // (because gameState already updated the unit to its destination tile).
    const pathfindingState = useMemo(() => {
        if (!gameState) return undefined;
        const from = moveFromRef.current;
        const needsOverride =
            (from.x !== unit.position.x || from.y !== unit.position.y);
        if (!needsOverride) return gameState;

        return {
            ...gameState,
            units: gameState.units.map((u) =>
                u.id === unit.id
                    ? { ...u, position: { x: from.x, y: from.y } }
                    : u
            ),
        } as GameState;
    }, [gameState, unit.id, unit.position.x, unit.position.y]);

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

    // (tech-debt) Removed per-frame dev logging; it spammed console and hurt perf.
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

    // Handle movement animation - calculate path when unit moves.
    // IMPORTANT: We *must not* update animatedPosition to the destination immediately,
    // otherwise the unit will snap on the same render as the move.
    useEffect(() => {
        // Check if unit has moved
        const hasMoved = moveFromRef.current.x !== unit.position.x || moveFromRef.current.y !== unit.position.y;
        
        if (hasMoved && pathfindingState) {
            // Calculate the path from old position to new position
            const path = getShortestPathToPosition(
                pathfindingState,
                moveFromRef.current,
                { x: unit.position.x, y: unit.position.y },
                unit.movement
            );
            
            // Set up path animation
            // Ensure the path always includes a start point for segment interpolation.
            // getShortestPathToPosition returns positions AFTER the start, so we prepend.
            const pathWithStart: Position[] = [
                { ...moveFromRef.current },
                ...path,
            ];

            setCurrentPath(pathWithStart);
            setCurrentPathIndex(0);
            setIsMovingAlongPath(pathWithStart.length > 1);
            moveStartedAtRef.current = performance.now();

            // IMPORTANT: don't update moveFromRef yet; we still need it while animating.
            // Also keep the rendered position at the start of the move.
            setAnimatedPosition({ x: moveFromRef.current.x, y: 0.2, z: moveFromRef.current.y });
            return;
        }
        
        // Not moving: snap rendered position to logical position.
        setAnimatedPosition({ x: unit.position.x, y: 0.2, z: unit.position.y });
    }, [unit.position.x, unit.position.y, pathfindingState, unit.movement]);

    useFrame(() => {
        const group = groupRef.current;
        const mesh = meshRef.current;
        const material = materialRef.current;

        if (!group || !mesh || !material) return;

        const now = performance.now();

        // Handle step-by-step movement animation along path
        if (isMovingAlongPath && currentPath.length > 0) {
            const moveStartedAt = moveStartedAtRef.current;
            
            if (moveStartedAt) {
                const totalMovementTime = MOVEMENT_DURATION_MS;
                // We animate between consecutive points, so number of segments is (n - 1)
                const segmentCount = Math.max(1, currentPath.length - 1);
                const timePerStep = totalMovementTime / segmentCount;
                const elapsed = now - moveStartedAt;
                
                // Calculate which step we should be on and the progress within that step
                const currentStepFloat = elapsed / timePerStep;
                const currentStepIndex = Math.floor(currentStepFloat);
                const stepProgress = currentStepFloat - currentStepIndex;
                
                if (currentStepIndex >= currentPath.length - 1) {
                    // Movement complete - ensure we're at the final position
                    setIsMovingAlongPath(false);
                    moveStartedAtRef.current = null;
                    moveFromRef.current = { x: unit.position.x, y: unit.position.y };
                    setAnimatedPosition({ x: unit.position.x, y: 0.2, z: unit.position.y });
                    group.position.set(unit.position.x, 0.2, unit.position.y);
                    return;
                } else {
                    // Get current and next positions for smooth interpolation
                    const currentStep = currentPath[currentStepIndex];
                    const nextStep = currentPath[currentStepIndex + 1];
                    
                    // Ease function for smooth movement between squares
                    const ease = stepProgress < 0.5 
                        ? 2 * stepProgress * stepProgress 
                        : -1 + (4 - 2 * stepProgress) * stepProgress;
                    
                    // Interpolate between current and next step
                    const currentX = currentStep.x + (nextStep.x - currentStep.x) * ease;
                    const currentZ = currentStep.y + (nextStep.y - currentStep.y) * ease;
                    
                    // Update rendered position and the group transform.
                    // Note: we avoid setState every frame except for final snap; but keeping
                    // animatedPosition in sync helps other effects (rings) that use it.
                    group.position.set(currentX, 0.2, currentZ);
                    return; // Skip other animations during movement
                }
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
                group.position.set(animatedPosition.x + jitterX, animatedPosition.y, animatedPosition.z + jitterZ);
                return;
            }
        } else {
            material.emissiveIntensity = 0;
        }

        // Apply current position (no animation)
        group.position.set(animatedPosition.x, animatedPosition.y, animatedPosition.z);
    });

    return (
        <>
            <group ref={groupRef} position={[animatedPosition.x, animatedPosition.y, animatedPosition.z]}>
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
                    <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.22, 0.31, 28]} />
                        <meshBasicMaterial
                            color={isPreviewTarget ? '#fda4af' : '#fde68a'}
                            transparent
                            opacity={0.95}
                        />
                    </mesh>
                )}

                {actionIndicatorColor && (
                    <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.18, 0.21, 28]} />
                        <meshBasicMaterial color={actionIndicatorColor} transparent opacity={0.95} />
                    </mesh>
                )}
            </group>
        </>
    );
};

export default UnitMesh;
