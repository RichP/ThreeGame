import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { UnitData, GameEvent } from '../../game/gamestate';

interface AnimationManagerProps {
  gameState: any;
  onMovementComplete?: () => void;
  onAttackComplete?: () => void;
}

interface MovementAnimation {
  unitId: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  startTime: number;
  duration: number;
  easing: (t: number) => number;
}

interface AttackAnimation {
  unitId: string;
  targetId: string;
  startTime: number;
  duration: number;
  type: 'projectile' | 'melee';
}

export const AnimationManager: React.FC<AnimationManagerProps> = ({
  gameState,
  onMovementComplete,
  onAttackComplete
}) => {
  const [movementAnimations, setMovementAnimations] = useState<MovementAnimation[]>([]);
  const [attackAnimations, setAttackAnimations] = useState<AttackAnimation[]>([]);
  const lastGameStateRef = useRef(gameState);
  const lastEventLogLengthRef = useRef(gameState.eventLog.length);
  const meshRefs = useRef<Map<string, Mesh>>(new Map());

  // Add unit mesh reference
  const addMeshRef = (unitId: string, mesh: Mesh) => {
    meshRefs.current.set(unitId, mesh);
  };

  // Remove unit mesh reference
  const removeMeshRef = (unitId: string) => {
    meshRefs.current.delete(unitId);
  };

  // Create smooth easing function
  const easeInOutQuad = (t: number) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  // Handle movement animations based on game events
  useEffect(() => {
    const currentEventLogLength = gameState.eventLog.length;
    const lastEventLogLength = lastEventLogLengthRef.current;
    
    // Check for new move events
    if (currentEventLogLength > lastEventLogLength) {
      const newEvents = gameState.eventLog.slice(lastEventLogLength);
      
      newEvents.forEach((event: GameEvent) => {
        if (event.type === 'move') {
          // Create movement animation
          const animation: MovementAnimation = {
            unitId: event.unitId,
            from: { x: event.from.x, y: event.from.y },
            to: { x: event.to.x, y: event.to.y },
            startTime: performance.now(),
            duration: 600, // 600ms movement duration
            easing: easeInOutQuad
          };
          
          setMovementAnimations(prev => [...prev, animation]);
        } else if (event.type === 'attack') {
          // Create attack animation
          const animation: AttackAnimation = {
            unitId: event.attackerId,
            targetId: event.targetId,
            startTime: performance.now(),
            duration: 400, // 400ms attack duration
            type: 'projectile'
          };
          
          setAttackAnimations(prev => [...prev, animation]);
        }
      });
    }

    lastEventLogLengthRef.current = currentEventLogLength;
    lastGameStateRef.current = gameState;
  }, [gameState.eventLog]);

  useFrame(() => {
    const now = performance.now();
    
    // Update movement animations
    setMovementAnimations(prev => {
      const updated = prev.map(anim => {
        const elapsed = now - anim.startTime;
        const progress = Math.min(elapsed / anim.duration, 1);
        
        if (progress >= 1) {
          // Animation complete
          onMovementComplete?.();
          return null;
        }
        
        // Update position for any meshes that might be tracking this unit
        const mesh = meshRefs.current.get(anim.unitId);
        if (mesh) {
          const easedProgress = anim.easing(progress);
          const currentX = anim.from.x + (anim.to.x - anim.from.x) * easedProgress;
          const currentZ = anim.from.y + (anim.to.y - anim.from.y) * easedProgress;
          mesh.position.set(currentX, 0.2, currentZ);
        }
        
        return { ...anim, currentProgress: progress };
      }).filter(anim => anim !== null) as MovementAnimation[];
      
      return updated;
    });

    // Update attack animations
    setAttackAnimations(prev => {
      const updated = prev.map(anim => {
        const elapsed = now - anim.startTime;
        const progress = Math.min(elapsed / anim.duration, 1);
        
        if (progress >= 1) {
          // Animation complete
          onAttackComplete?.();
          return null;
        }
        
        return { ...anim, currentProgress: progress };
      }).filter(anim => anim !== null) as AttackAnimation[];
      
      return updated;
    });
  });

  return (
    <group>
      {/* This component manages animations but doesn't render anything directly */}
      {gameState.units.map((unit: UnitData) => (
        <mesh
          key={unit.id}
          ref={(mesh) => mesh && addMeshRef(unit.id, mesh)}
          visible={false} // We don't render this mesh, it's just for reference
        >
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial />
        </mesh>
      ))}
    </group>
  );
};

export default AnimationManager;
