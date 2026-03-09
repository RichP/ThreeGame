'use client'

import React from 'react'
import type { Position } from '../game/gamestate'
import Tile from './Tile'

interface GridProps {
    size: number;
    selected?: Position | null;
    reachable?: ReadonlyArray<Position>;
    highlightMode?: 'move' | 'attack';
    blockedTiles?: ReadonlyArray<Position>;
    onTileClick?: (pos: Position) => void;
}

export const Grid: React.FC<GridProps> = ({ size, selected, reachable, highlightMode = 'move', blockedTiles, onTileClick }) => {
    const isReachable = (x: number, y: number) => reachable?.some(pos => pos.x === x && pos.y === y);
    const isBlocked = (x: number, y: number) => blockedTiles?.some(pos => pos.x === x && pos.y === y);

    const isSelected = (x: number, y: number) => selected?.x === x && selected?.y === y;

    const tiles: React.ReactNode[] = [];

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            tiles.push(
                <Tile
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    onClick={() => onTileClick && onTileClick({ x, y })}
                    isSelected={isSelected(x, y)}
                    isReachable={isReachable(x, y)}
                    highlightMode={highlightMode}
                    isBlocked={isBlocked(x, y)}
                />
            );
        }
    }

    return <>{tiles}</>;
}