import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { UnitData } from '../../game/gamestate';

interface ProjectileAnimationProps {
  fromUnit: UnitData;
  toUnit: UnitData;
  type: 'ranged' | 'melee' | 'ability';
  onComplete?: () => void;
  color?: string;
  speed?: number;
}

interface ProjectileState {
  position: [number, number, number];
  scale: number;
  opacity: number;
}

export const ProjectileAnimation: React.FC<ProjectileAnimationProps> = ({
  fromUnit,
  toUnit,
  type,
  onComplete,
  color = '#f59e0b',
  speed = 1.5
}) => {
  const meshRef = useRef<Mesh>(null);
  const startTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(true);

  // Calculate projectile properties based on type
  const projectileConfig = {
    'ranged': { shape: 'sphere', trail: true, impactEffect: 'explosion' },
    'melee': { shape: 'cone', trail: false, impactEffect: 'spark' },
    'ability': { shape: 'cube', trail: true, impactEffect: 'magic' }
  };

  const config = projectileConfig[type];

  useEffect(() => {
    startTimeRef.current = performance.now();
    isAnimatingRef.current = true;
  }, [fromUnit, toUnit, type]);

  // Cleanup when component unmounts or props change
  useEffect(() => {
    return () => {
      isAnimatingRef.current = false;
    };
  }, []);

  useFrame(() => {
    if (!isAnimatingRef.current || !meshRef.current) return;

    const now = performance.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    
    // Calculate distance and time to target
    const distance = Math.sqrt(
      Math.pow(toUnit.position.x - fromUnit.position.x, 2) +
      Math.pow(toUnit.position.y - fromUnit.position.y, 2)
    );
    
    const totalTime = distance / speed;
    
    if (elapsed >= totalTime) {
      // Animation complete
      isAnimatingRef.current = false;
      onComplete?.();
      return;
    }

    // Calculate position along path
    const progress = elapsed / totalTime;
    const currentX = fromUnit.position.x + (toUnit.position.x - fromUnit.position.x) * progress;
    const currentZ = fromUnit.position.y + (toUnit.position.y - fromUnit.position.y) * progress;
    
    // Add arc to projectile path
    const arcHeight = 0.5 + (distance * 0.2);
    const arcProgress = Math.sin(progress * Math.PI) * arcHeight;
    const currentY = 0.2 + arcProgress;

    // Update mesh position
    meshRef.current.position.set(currentX, currentY, currentZ);

    // Rotate projectile to face direction of travel
    const dx = toUnit.position.x - fromUnit.position.x;
    const dz = toUnit.position.y - fromUnit.position.y;
    const rotationY = Math.atan2(dx, dz);
    meshRef.current.rotation.set(0, rotationY, 0);
  });

  const [scale, setScale] = useState(0.1);
  const [opacity, setOpacity] = useState(1);

  // Simple animation for scale and opacity
  useEffect(() => {
    const start = performance.now();
    const animate = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / 200, 1); // 200ms to reach target
      
      setScale(0.1 + (0.3 - 0.1) * progress);
      setOpacity(1 - (0.2 * progress));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, []);

  const geometryProps = config.shape === 'sphere' 
    ? { args: [0.15, 16, 16] }
    : config.shape === 'cone'
      ? { args: [0.1, 0.3, 16] }
      : { args: [0.2, 0.2, 0.2] };

  return (
    <mesh
      ref={meshRef}
      visible={isAnimatingRef.current}
      scale={[scale, scale, scale]}
      position={[fromUnit.position.x, 0.2, fromUnit.position.y]}
    >
      {config.shape === 'sphere' && (
        <sphereGeometry args={[0.15, 16, 16]} />
      )}
      {config.shape === 'cone' && (
        <coneGeometry args={[0.1, 0.3, 16]} />
      )}
      {config.shape === 'cube' && (
        <boxGeometry args={[0.2, 0.2, 0.2]} />
      )}
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={opacity}
      />
    </mesh>
  );
};

interface ImpactEffectProps {
  position: [number, number, number];
  type: 'explosion' | 'spark' | 'magic';
  color?: string;
  onComplete?: () => void;
}

export const ImpactEffect: React.FC<ImpactEffectProps> = ({
  position,
  type,
  color = '#f59e0b',
  onComplete
}) => {
  const meshRef = useRef<Mesh>(null);
  const startTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(true);

  useEffect(() => {
    startTimeRef.current = performance.now();
    isAnimatingRef.current = true;
  }, [position, type]);

  useFrame(() => {
    if (!isAnimatingRef.current || !meshRef.current) return;

    const now = performance.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    
    // Effect duration
    const duration = 0.5;
    
    if (elapsed >= duration) {
      isAnimatingRef.current = false;
      onComplete?.();
      return;
    }

    // Scale effect over time
    const progress = elapsed / duration;
    const currentScale = 1 + (progress * 2);
    const currentOpacity = 1 - progress;

    meshRef.current.scale.set(currentScale, currentScale, currentScale);
    if (meshRef.current.material) {
      (meshRef.current.material as any).opacity = currentOpacity;
    }
  });

  const geometryProps = type === 'explosion' 
    ? { args: [0.5, 16, 16] }
    : type === 'spark'
      ? { args: [0.2, 8, 8] }
      : { args: [0.3, 12, 12] };

  return (
    <mesh
      ref={meshRef}
      visible={isAnimatingRef.current}
      position={position}
      rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
    >
      {type === 'explosion' && <sphereGeometry args={[0.5, 16, 16]} />}
      {type === 'spark' && <boxGeometry args={[0.2, 0.2, 0.2]} />}
      {type === 'magic' && <dodecahedronGeometry args={[0.3, 0]} />}
      
      <meshBasicMaterial 
        color={color}
        transparent
        opacity={1}
        wireframe={type === 'magic'}
      />
    </mesh>
  );
};

export default ProjectileAnimation;