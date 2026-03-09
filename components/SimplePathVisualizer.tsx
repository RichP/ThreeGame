import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type { Position } from '../game/gamestate';

interface SimplePathVisualizerProps {
  path: Position[];
  color?: string;
  visible?: boolean;
}

export const SimplePathVisualizer: React.FC<SimplePathVisualizerProps> = ({
  path,
  color = '#3b82f6',
  visible = true
}) => {
  const linePoints = useMemo(() => {
    if (path.length < 2) return [];
    
    // Convert path positions to 3D coordinates - raise above tiles
    return path.map(pos => [pos.x, 0.35, pos.y] as [number, number, number]);
  }, [path]);

  if (!visible || path.length < 2) return null;

  return (
    <Line
      points={linePoints}
      color="#ff00ff"
      lineWidth={0.35}
      transparent
      opacity={1.0}
      dashed={false}
    />
  );
};

interface SimpleArrowVisualizerProps {
  from: Position;
  to: Position;
  color?: string;
  visible?: boolean;
}

export const SimpleArrowVisualizer: React.FC<SimpleArrowVisualizerProps> = ({
  from,
  to,
  color = '#f59e0b',
  visible = true
}) => {
  if (!visible) return null;

  const startX = from.x;
  const startZ = from.y;
  const endX = to.x;
  const endZ = to.y;

  // Calculate arrow direction
  const dx = endX - startX;
  const dz = endZ - startZ;
  const length = Math.sqrt(dx * dx + dz * dz);
  
  if (length === 0) return null;

  // Calculate rotation for arrow
  const rotationY = Math.atan2(dx, dz);

  return (
    <group position={[endX, 0.35, endZ]} rotation={[0, rotationY, 0]}>
      {/* Arrow head only */}
      <mesh>
        <coneGeometry args={[0.12, 0.24, 16]} />
        <meshBasicMaterial color={color} transparent opacity={1} />
      </mesh>
    </group>
  );
};

interface SimplePathArrowsVisualizerProps {
  from: Position;
  to: Position;
  color?: string;
  visible?: boolean;
}

export const SimplePathArrowsVisualizer: React.FC<SimplePathArrowsVisualizerProps> = ({
  from,
  to,
  color = '#f59e0b',
  visible = true
}) => {
  if (!visible) return null;

  // Create a path from unit position to target tile
  const path = [from, to];

  return (
    <group>
      {/* Draw the main path line from unit to target */}
      <SimplePathVisualizer
        path={path}
        color={color}
        visible={true}
      />
      
      {/* Draw a single arrow at the target tile */}
      <SimpleArrowVisualizer
        from={from}
        to={to}
        color={color}
        visible={true}
      />
    </group>
  );
};

export default SimplePathVisualizer;