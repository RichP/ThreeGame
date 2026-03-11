import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { UnitData } from '../../game/gamestate';

interface StatusEffectsProps {
  unit: UnitData;
  visible?: boolean;
}

interface ParticleSystemProps {
  position: [number, number, number];
  type: 'poison' | 'armor' | 'guard' | 'aim';
  active: boolean;
}

export const StatusEffects: React.FC<StatusEffectsProps> = ({ unit, visible = true }) => {
  if (!visible) return null;

  const activeEffects: Array<{ type: 'poison' | 'armor' | 'guard' | 'aim'; duration: number }> = [];
  
  if (unit.statusEffects.poisonTurns > 0) {
    activeEffects.push({ type: 'poison', duration: unit.statusEffects.poisonTurns });
  }
  if (unit.statusEffects.armorUpTurns > 0) {
    activeEffects.push({ type: 'armor', duration: unit.statusEffects.armorUpTurns });
  }
  if (unit.statusEffects.guardTurns > 0) {
    activeEffects.push({ type: 'guard', duration: unit.statusEffects.guardTurns });
  }
  if (unit.statusEffects.aimTurns > 0) {
    activeEffects.push({ type: 'aim', duration: unit.statusEffects.aimTurns });
  }

  if (activeEffects.length === 0) return null;

  return (
    <group position={[unit.position.x, 0.3, unit.position.y]}>
      {activeEffects.map((effect, index) => (
        <StatusEffectVisual
          key={`${unit.id}-${effect.type}-${index}`}
          type={effect.type}
          duration={effect.duration}
          position={[0, 0, 0]}
        />
      ))}
    </group>
  );
};

interface StatusEffectVisualProps {
  type: 'poison' | 'armor' | 'guard' | 'aim';
  duration: number;
  position: [number, number, number];
}

const StatusEffectVisual: React.FC<StatusEffectVisualProps> = ({ type, duration, position }) => {
  const meshRef = useRef<Mesh>(null);
  const startTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(true);

  useEffect(() => {
    startTimeRef.current = performance.now();
    isAnimatingRef.current = true;
  }, [type, duration]);

  useFrame(() => {
    if (!isAnimatingRef.current || !meshRef.current) return;

    const now = performance.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    
    if (elapsed >= duration) {
      isAnimatingRef.current = false;
      return;
    }

    // Pulse animation
    const progress = elapsed / duration;
    const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
    
    meshRef.current.scale.set(pulse, pulse, pulse);
    
    // Color animation for some effects
    if (meshRef.current.material) {
      const material = meshRef.current.material as any;
      if (type === 'poison') {
        material.opacity = 0.6 + Math.sin(progress * Math.PI * 6) * 0.2;
      } else if (type === 'armor') {
        material.opacity = 0.8;
      }
    }
  });

  const getEffectConfig = () => {
    switch (type) {
      case 'poison':
        return {
          color: '#ff00e6',
          geometry: <torusGeometry args={[0.35, 0.05, 8, 16]} />,
          rotationSpeed: 0.5
        };
      case 'armor':
        return {
          color: '#94a3b8',
          geometry: <sphereGeometry args={[0.4, 16, 16]} />,
          rotationSpeed: 0
        };
      case 'guard':
        return {
          color: '#22c55e',
          geometry: <ringGeometry args={[0.3, 0.35, 32]} />,
          rotationSpeed: 1
        };
      case 'aim':
        return {
          color: '#3b82f6',
          geometry: <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />,
          rotationSpeed: 0
        };
      default:
        return {
          color: '#ffffff',
          geometry: <boxGeometry args={[0.2, 0.2, 0.2]} />,
          rotationSpeed: 0
        };
    }
  };

  const config = getEffectConfig();

  return (
    <mesh
      ref={meshRef}
      visible={isAnimatingRef.current}
      position={position}
      rotation={[0, 0, 0]}
    >
      {config.geometry}
      <meshBasicMaterial 
        color={config.color}
        transparent
        opacity={type === 'poison' ? 0.6 : 0.8}
        wireframe={type === 'guard'}
      />
    </mesh>
  );
};

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ position, type, active }) => {
  const particlesRef = useRef<Mesh[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (active) {
      startTimeRef.current = performance.now();
    }
  }, [active, type]);

  useFrame(() => {
    if (!active || particlesRef.current.length === 0) return;

    const now = performance.now();
    const elapsed = (now - startTimeRef.current) / 1000;

    particlesRef.current.forEach((particle, index) => {
      const life = elapsed - (index * 0.1);
      if (life < 0) return;

      const riseSpeed = 0.5;
      const driftSpeed = 0.2;
      
      const y = life * riseSpeed;
      const x = Math.sin(life * driftSpeed) * 0.2;
      const z = Math.cos(life * driftSpeed) * 0.2;

      particle.position.set(x, y, z);
      particle.scale.setScalar(1 - (life * 0.5));
      
      if (particle.material) {
        const material = particle.material as any;
        material.opacity = Math.max(0, 1 - life);
      }
    });
  });

  if (!active) return null;

  const particleCount = 8;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push(
      <mesh
        key={i}
        ref={(mesh) => {
          if (mesh) particlesRef.current[i] = mesh;
        }}
        position={position}
      >
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshBasicMaterial 
          color={type === 'poison' ? '#22c55e' : '#f59e0b'}
          transparent
          opacity={1}
        />
      </mesh>
    );
  }

  return <group>{particles}</group>;
};

export default StatusEffects;