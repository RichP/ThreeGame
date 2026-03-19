'use client'

import React from 'react'
import type { Position } from '../../game/gamestate'
import Tile from './Tile'

interface GridProps {
    size: number;
    selected?: Position | null;
    reachable?: ReadonlyArray<Position>;
    highlightMode?: 'move' | 'attack';
    blockedTiles?: ReadonlyArray<Position>;
    terrain?: Readonly<Record<string, string>>;
    onTileClick?: (pos: Position) => void;
    onTileHoverStart?: (pos: Position) => void;
    onTileHoverEnd?: () => void;
    isPreviewMode?: boolean;
}

export const Grid: React.FC<GridProps> = ({ size, selected, reachable, highlightMode = 'move', blockedTiles, terrain, onTileClick, onTileHoverStart, onTileHoverEnd, isPreviewMode = false }) => {
    const isReachable = (x: number, y: number) => reachable?.some(pos => pos.x === x && pos.y === y);
    const isBlocked = (x: number, y: number) => blockedTiles?.some(pos => pos.x === x && pos.y === y);

    const isSelected = (x: number, y: number) => selected?.x === x && selected?.y === y;

    const tiles: React.ReactNode[] = [];

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const terrainKey = `${x},${y}`;
            const terrainType = terrain?.[terrainKey] as any;

            tiles.push(
                <Tile
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    onClick={isPreviewMode ? undefined : () => onTileClick && onTileClick({ x, y })}
                    onHoverStart={isPreviewMode ? undefined : () => {
                      onTileHoverStart && onTileHoverStart({ x, y });
                      // Emit custom event for MovePathVisualizer
                      window.dispatchEvent(new CustomEvent('tile-hover-start', {
                        detail: { position: { x, y } }
                      }));
                    }}
                    onHoverEnd={isPreviewMode ? undefined : () => {
                      onTileHoverEnd && onTileHoverEnd();
                      // Emit custom event for MovePathVisualizer
                      window.dispatchEvent(new CustomEvent('tile-hover-end'));
                    }}
                    isSelected={isSelected(x, y)}
                    isReachable={isReachable(x, y)}
                    highlightMode={highlightMode}
                    isBlocked={isBlocked(x, y)}
                    terrain={terrainType}
                />
            );
        }
    }

    return <>{tiles}</>;
}