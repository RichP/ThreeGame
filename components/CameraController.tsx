import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Camera } from 'three';
import { Vector3 } from 'three';

interface CameraControllerProps {
  gameState: any;
  focusOnUnitId?: string;
  focusOnPosition?: { x: number; y: number };
  shakeIntensity?: number;
  shakeDuration?: number;
  zoomIntensity?: number;
  zoomDuration?: number;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  gameState,
  focusOnUnitId,
  focusOnPosition,
  shakeIntensity = 0,
  shakeDuration = 0,
  zoomIntensity = 0,
  zoomDuration = 0
}) => {
  const { camera, gl } = useThree();
  const originalPosition = useRef<Vector3>(camera.position.clone());
  const targetPosition = useRef<Vector3>(camera.position.clone());
  const shakeTimerRef = useRef<number>(0);
  const zoomTimerRef = useRef<number>(0);
  const isShakingRef = useRef<boolean>(false);
  const isZoomingRef = useRef<boolean>(false);

  useEffect(() => {
    originalPosition.current = camera.position.clone();
    targetPosition.current = camera.position.clone();
  }, [camera.position]);

  useFrame((_, delta) => {
    // Handle camera shake
    if (isShakingRef.current && shakeTimerRef.current > 0) {
      const shakeOffset = (Math.random() - 0.5) * shakeIntensity;
      camera.position.x += shakeOffset;
      camera.position.z += shakeOffset;
      camera.position.y += shakeOffset * 0.5;
      
      shakeTimerRef.current -= delta;
      if (shakeTimerRef.current <= 0) {
        isShakingRef.current = false;
        camera.position.copy(originalPosition.current);
      }
    }

    // Handle camera zoom
    if (isZoomingRef.current && zoomTimerRef.current > 0) {
      const zoomFactor = 1 + (zoomIntensity * (zoomTimerRef.current / zoomDuration));
      camera.position.lerpVectors(originalPosition.current, targetPosition.current, 1 - zoomFactor);
      
      zoomTimerRef.current -= delta;
      if (zoomTimerRef.current <= 0) {
        isZoomingRef.current = false;
        camera.position.copy(originalPosition.current);
      }
    }

    // Handle focus transitions
    if (focusOnUnitId) {
      const unit = gameState.units.find((u: any) => u.id === focusOnUnitId);
      if (unit) {
        const targetX = unit.position.x;
        const targetZ = unit.position.y;
        const targetY = camera.position.y;
        
        camera.position.lerp(new Vector3(targetX, targetY, targetZ), 0.1);
      }
    } else if (focusOnPosition) {
      const targetX = focusOnPosition.x;
      const targetZ = focusOnPosition.y;
      const targetY = camera.position.y;
      
      camera.position.lerp(new Vector3(targetX, targetY, targetZ), 0.1);
    }
  });

  const triggerShake = (intensity: number, duration: number) => {
    shakeIntensity = intensity;
    shakeDuration = duration;
    shakeTimerRef.current = duration;
    isShakingRef.current = true;
  };

  const triggerZoom = (intensity: number, duration: number) => {
    zoomIntensity = intensity;
    zoomDuration = duration;
    zoomTimerRef.current = duration;
    isZoomingRef.current = true;
  };

  return null;
};

interface CameraEffectsProps {
  gameState: any;
  onCameraShake?: (intensity: number, duration: number) => void;
  onCameraZoom?: (intensity: number, duration: number) => void;
}

export const CameraEffects: React.FC<CameraEffectsProps> = ({
  gameState,
  onCameraShake,
  onCameraZoom
}) => {
  const lastActionRef = useRef<any>(null);

  useEffect(() => {
    const currentAction = gameState.lastAction;
    if (!currentAction || currentAction === lastActionRef.current) return;

    lastActionRef.current = currentAction;

    if (currentAction.type === 'attack') {
      // Trigger camera shake on attack
      onCameraShake?.(0.2, 0.3);
      
      // Trigger camera zoom on critical hits
      if (currentAction.outcome === 'crit') {
        onCameraZoom?.(0.3, 0.5);
      }
    }
  }, [gameState.lastAction, onCameraShake, onCameraZoom]);

  return null;
};

export default CameraController;