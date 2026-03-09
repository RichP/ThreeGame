'use client'

import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, MeshStandardMaterial } from 'three';
import type { AttackOutcome, UnitData } from '../game/gamestate';

interface UnitMeshProps {
    unit: UnitData;
    actionState?: 'can_move' | 'can_attack' | 'exhausted' | null;
    isSelected?: boolean;
    isPreviewTarget?: boolean;
    hitEffectKey?: string;
    hitOutcome?: AttackOutcome;
    onHoverStart?: (unitId: string) => void;
    onHoverEnd?: () => void;
}

const HIT_DURATION_SECONDS = 0.6;

export const UnitMesh: React.FC<UnitMeshProps> = ({ unit, actionState = null, isSelected, isPreviewTarget, hitEffectKey, hitOutcome, onHoverStart, onHoverEnd }) => {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<MeshStandardMaterial>(null);
    const hitStartedAtRef = useRef<number | null>(null);

    const baseColor = unit.playerId === 'p1' ? '#3b82f6' : '#ef4444';
    
    // Change color based on health
    let healthColor = baseColor;
    if (unit.health <= 25) {
        healthColor = unit.playerId === 'p1' ? '#dc2626' : '#991b1b';
    } else if (unit.health <= 50) {
        healthColor = unit.playerId === 'p1' ? '#f59e0b' : '#d97706';
    }
    
    const finalColor = isSelected ? '#fbbf24' : healthColor;
    const actionIndicatorColor =
        actionState === 'can_move'
            ? '#22d3ee'
            : actionState === 'can_attack'
                ? '#f97316'
                : actionState === 'exhausted'
                    ? '#94a3b8'
                    : null;

    useEffect(() => {
        if (hitEffectKey && hitOutcome !== 'miss') {
            hitStartedAtRef.current = performance.now();
        }
    }, [hitEffectKey, hitOutcome]);

    useFrame(() => {
        const mesh = meshRef.current;
        const material = materialRef.current;

        if (!mesh || !material) return;

        const baseX = unit.position.x;
        const baseY = 0.2;
        const baseZ = unit.position.y;

        const hitStartedAt = hitStartedAtRef.current;
        if (!hitStartedAt) {
            mesh.position.set(baseX, baseY, baseZ);
            material.emissiveIntensity = 0;
            return;
        }

        const elapsed = (performance.now() - hitStartedAt) / 1000;
        if (elapsed >= HIT_DURATION_SECONDS) {
            hitStartedAtRef.current = null;
            mesh.position.set(baseX, baseY, baseZ);
            material.emissiveIntensity = 0;
            return;
        }

        const progress = elapsed / HIT_DURATION_SECONDS;
        const intensity = 1 - progress;
        const shakeAmount = (1 - progress) * 0.08;

        material.emissive.set('#ffffff');
        material.emissiveIntensity = 1.1 * intensity;

        const jitterX = (Math.random() - 0.5) * shakeAmount;
        const jitterZ = (Math.random() - 0.5) * shakeAmount;
        mesh.position.set(baseX + jitterX, baseY, baseZ + jitterZ);
    });

    return (
        <>
            <mesh
                ref={meshRef}
                position={[unit.position.x, 0.2, unit.position.y]}
                castShadow
                receiveShadow={false}
                onPointerOver={() => onHoverStart?.(unit.id)}
                onPointerOut={() => onHoverEnd?.()}
            >
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial ref={materialRef} color={finalColor} />
            </mesh>

            {(isSelected || isPreviewTarget) && (
                <mesh position={[unit.position.x, 0.06, unit.position.y]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.22, 0.31, 28]} />
                    <meshBasicMaterial
                        color={isPreviewTarget ? '#fda4af' : '#fde68a'}
                        transparent
                        opacity={0.95}
                    />
                </mesh>
            )}

            {actionIndicatorColor && (
                <mesh position={[unit.position.x, 0.42, unit.position.y]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.18, 0.21, 28]} />
                    <meshBasicMaterial color={actionIndicatorColor} transparent opacity={0.95} />
                </mesh>
            )}
        </>
    );
};

export default UnitMesh;
