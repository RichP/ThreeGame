import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type { Position } from '../../game/gamestate';

interface PathVisualizerProps {
  path: Position[];
  color?: string;
  width?: number;
  visible?: boolean;
  animationProgress?: number;
}

export const PathVisualizer: React.FC<PathVisualizerProps> = ({
  path,
  color = '#3b82f6',
  width = 0.08,
  visible = true,
  animationProgress = 1
}) => {
  const linePoints = useMemo(() => {
    if (path.length < 2) return [];
    
    // Convert path positions to 3D coordinates
    return path.map(pos => [pos.x, 0.1, pos.y] as [number, number, number]);
  }, [path]);

  const visiblePoints = useMemo(() => {
    if (animationProgress >= 1) return linePoints;
    
    const endIndex = Math.floor(linePoints.length * animationProgress);
    return linePoints.slice(0, endIndex + 1);
  }, [linePoints, animationProgress]);

  if (!visible || path.length < 2) return null;

  return (
    <Line
      points={visiblePoints}
      color={color}
      lineWidth={width}
      transparent
      opacity={0.8}
      dashed={false}
    />
  );
};

interface ArrowVisualizerProps {
  from: Position;
  to: Position;
  color?: string;
  visible?: boolean;
  animationProgress?: number;
}

export const ArrowVisualizer: React.FC<ArrowVisualizerProps> = ({
  from,
  to,
  color = '#f59e0b',
  visible = true,
  animationProgress = 1
}) => {
  if (!visible) return null;

  const startX = from.x;
  const startY = 0.1;
  const startZ = from.y;
  const endX = to.x;
  const endZ = to.y;

  // Calculate arrow direction and length
  const dx = endX - startX;
  const dz = endZ - startZ;
  const length = Math.sqrt(dx * dx + dz * dz);
  
  if (length === 0) return null;

  // Calculate rotation for arrow
  const rotationY = Math.atan2(dx, dz);

  // Calculate current position based on animation progress
  const currentX = startX + dx * animationProgress;
  const currentZ = startZ + dz * animationProgress;

  return (
    <group position={[currentX, 0.1, currentZ]} rotation={[0, rotationY, 0]}>
      {/* Arrow shaft */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, length * animationProgress, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      
      {/* Arrow head */}
      {animationProgress > 0.1 && (
        <mesh position={[0, 0, (length * animationProgress) / 2]}>
          <coneGeometry args={[0.06, 0.12, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
};

interface PathArrowsVisualizerProps {
  path: Position[];
  color?: string;
  visible?: boolean;
  animationProgress?: number;
}

export const PathArrowsVisualizer: React.FC<PathArrowsVisualizerProps> = ({
  path,
  color = '#f59e0b',
  visible = true,
  animationProgress = 1
}) => {
  if (!visible || path.length < 2) return null;

  return (
    <group>
      {/* Draw the main path line */}
      <PathVisualizer
        path={path}
        color={color}
        width={0.08}
        visible={true}
        animationProgress={1}
      />
      
      {/* Draw a single arrow at the end of the path */}
      {path.length >= 2 && (
        <ArrowVisualizer
          key="final-arrow"
          from={path[path.length - 2]}
          to={path[path.length - 1]}
          color={color}
          visible={true}
          animationProgress={1}
        />
      )}
    </group>
  );
};

export default PathVisualizer;