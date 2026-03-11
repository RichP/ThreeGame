import React, { useState, useEffect } from 'react';
import { SimplePathArrowsVisualizer } from './SimplePathVisualizer';
import type { Position } from '../../game/gamestate';

interface MovePathVisualizerProps {
  selectedUnitPosition: Position | null;
  reachableTiles: Position[];
  onTileHoverStart?: (tile: Position) => void;
  onTileHoverEnd?: () => void;
  color?: string;
  visible?: boolean;
}

export const MovePathVisualizer: React.FC<MovePathVisualizerProps> = ({
  selectedUnitPosition,
  reachableTiles,
  onTileHoverStart,
  onTileHoverEnd,
  color = '#3b82f6',
  visible = true
}) => {
  const [hoveredTile, setHoveredTile] = useState<Position | null>(null);

  // Handle tile hover events from Grid
  useEffect(() => {
    const handleTileHoverStart = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { position } = customEvent.detail;
      // Check if this tile is reachable
      const isReachable = reachableTiles.some(tile => 
        tile.x === position.x && tile.y === position.y
      );
      
      if (isReachable) {
        setHoveredTile(position);
        onTileHoverStart?.(position);
      }
    };

    const handleTileHoverEnd = () => {
      setHoveredTile(null);
      onTileHoverEnd?.();
    };

    window.addEventListener('tile-hover-start' as any, handleTileHoverStart);
    window.addEventListener('tile-hover-end' as any, handleTileHoverEnd);

    return () => {
      window.removeEventListener('tile-hover-start' as any, handleTileHoverStart);
      window.removeEventListener('tile-hover-end' as any, handleTileHoverEnd);
    };
  }, [reachableTiles, onTileHoverStart, onTileHoverEnd]);

  // Only show path if we have a selected unit and a hovered tile
  const shouldShowPath = visible && selectedUnitPosition && hoveredTile;

  if (!shouldShowPath) {
    return null;
  }

  return (
    <SimplePathArrowsVisualizer
      from={selectedUnitPosition}
      to={hoveredTile}
      color={color}
      visible={true}
    />
  );
};

export default MovePathVisualizer;