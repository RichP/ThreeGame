'use client'

import React, { Suspense } from "react";
import { Grid } from "./Grid";
import UnitMesh from "./UnitMesh";
import FloatingDamageText from "./FloatingDamageText";
import { CoverVisualizer } from "./UI/CoverVisualizer";
import { StatusVisualizer } from "./UI/StatusVisualizer";
import type { AttackOutcome, GameState, Position } from "../game/gamestate";
import { getUnitById, Phase } from "../game/gamestate";

interface BoardProps {
    gameState: GameState;
    reachableTiles: ReadonlyArray<Position>;
    attackableTiles?: ReadonlyArray<Position>;
    onTileClick: (pos: Position) => void;
    onUnitHoverStart?: (unitId: string) => void;
    onUnitHoverEnd?: () => void;
    previewTargetUnitId?: string | null;
    hitTargetUnitId?: string | null;
    hitEffectKey?: string | null;
    floatingDamage?: {
        key: string;
        damage: number;
        outcome: AttackOutcome;
        position: Position;
    } | null;
}

export const Board: React.FC<BoardProps> = ({
    gameState,
    reachableTiles,
    attackableTiles = [],
    onTileClick,
    onUnitHoverStart,
    onUnitHoverEnd,
    previewTargetUnitId = null,
    hitTargetUnitId = null,
    hitEffectKey = null,
    floatingDamage = null,
}) => {
    const selectedUnit = getUnitById(gameState, gameState.selectedUnitId ?? null);
    const tilesToShow = gameState.phase === Phase.ATTACK ? attackableTiles : reachableTiles;
    const highlightMode: 'move' | 'attack' = gameState.phase === Phase.ATTACK ? 'attack' : 'move';
    
    return (
        <>
            <Grid
                size={gameState.config.gridSize}
                selected={selectedUnit?.position ?? null}
                reachable={tilesToShow}
                highlightMode={highlightMode}
                blockedTiles={gameState.config.blockedTiles}
                onTileClick={onTileClick}
            />
            {gameState.units.map((unit) => (
                <UnitMesh
                    key={unit.id}
                    unit={unit}
                    actionState={
                        unit.playerId !== gameState.currentPlayer
                            ? null
                            : !unit.hasMoved
                                ? 'can_move'
                                : !unit.hasAttacked
                                    ? 'can_attack'
                                    : 'exhausted'
                    }
                    isSelected={unit.id === gameState.selectedUnitId}
                    isPreviewTarget={unit.id === previewTargetUnitId}
                    onHoverStart={onUnitHoverStart}
                    onHoverEnd={onUnitHoverEnd}
                    hitEffectKey={unit.id === hitTargetUnitId ? (hitEffectKey ?? undefined) : undefined}
                    hitOutcome={unit.id === hitTargetUnitId ? floatingDamage?.outcome : undefined}
                />
            ))}

            {floatingDamage && (
                <Suspense fallback={null}>
                    <FloatingDamageText
                        key={floatingDamage.key}
                        damage={floatingDamage.damage}
                        outcome={floatingDamage.outcome}
                        position={[floatingDamage.position.x, 0.65, floatingDamage.position.y]}
                    />
                </Suspense>
            )}

            {/* Cover and Status Visualizers */}
            <CoverVisualizer
                gameState={gameState}
                selectedUnitId={gameState.selectedUnitId}
                hoveredUnitId={previewTargetUnitId}
                isVisible={gameState.phase === Phase.ATTACK && !!gameState.selectedUnitId}
            />
            
            <StatusVisualizer
                gameState={gameState}
                isVisible={true}
            />
        </>
    );
};