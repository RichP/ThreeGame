'use client'

import React, { Suspense } from "react";
import { Grid } from "./Grid";
import UnitMesh from "./UnitMesh";
import FloatingDamageText from "./FloatingDamageText";
import { CoverVisualizer } from "../UI/CoverVisualizer";
import { StatusVisualizer } from "../UI/StatusVisualizer";
import { AnimationManager } from "./AnimationManager";
import { PathVisualizer, PathArrowsVisualizer } from "./PathVisualizer";
import { SimplePathArrowsVisualizer } from "./SimplePathVisualizer";
import { MovePathVisualizer } from "./MovePathVisualizer";
import { ProjectileAnimation, ImpactEffect } from "./ProjectileAnimation";
import { StatusEffects } from "./StatusEffects";
import type { AttackOutcome, GameState, Position } from "../../game/gamestate";
import { getUnitById, Phase } from "../../game/gamestate";

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
    isPreviewMode?: boolean;
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
    isPreviewMode = false,
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
                onTileClick={isPreviewMode ? undefined : onTileClick}
                onTileHoverStart={() => {
                    if (!isPreviewMode) {
                        // Handle tile hover start
                    }
                }}
                onTileHoverEnd={() => {
                    if (!isPreviewMode) {
                        // Handle tile hover end
                    }
                }}
                isPreviewMode={isPreviewMode}
            />
            {gameState.units.map((unit) => {
                const actionState = unit.playerId !== gameState.currentPlayer
                    ? null
                    : !unit.hasMoved
                        ? 'can_move'
                        : !unit.hasAttacked
                            ? 'can_attack'
                            : 'exhausted';

                // Debug logging
                if (process.env.NODE_ENV === 'development') {
                    console.log(`Unit ${unit.id}:`, {
                        playerId: unit.playerId,
                        currentPlayer: gameState.currentPlayer,
                        hasMoved: unit.hasMoved,
                        hasAttacked: unit.hasAttacked,
                        actionState
                    });
                }

                return (
                    <UnitMesh
                        key={unit.id}
                        unit={unit}
                        actionState={actionState}
                        isSelected={unit.id === gameState.selectedUnitId}
                        isPreviewTarget={unit.id === previewTargetUnitId}
                        onHoverStart={onUnitHoverStart}
                        onHoverEnd={onUnitHoverEnd}
                        hitEffectKey={unit.id === hitTargetUnitId ? (hitEffectKey ?? undefined) : undefined}
                        hitOutcome={unit.id === hitTargetUnitId ? floatingDamage?.outcome : undefined}
                        isPreviewMode={isPreviewMode}
                    />
                );
            })}

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

            {/* Animation Manager */}
            <AnimationManager
                gameState={gameState}
                onMovementComplete={() => {
                    // Handle movement completion
                }}
                onAttackComplete={() => {
                    // Handle attack completion
                }}
            />

            {/* Path Visualization - Line from unit to hovered tile */}
            {gameState.phase === Phase.MOVE_UNIT && gameState.selectedUnitId && (
                <MovePathVisualizer
                    selectedUnitPosition={selectedUnit!.position}
                    reachableTiles={Array.from(reachableTiles)}
                    color={gameState.currentPlayer === 'p1' ? '#3b82f6' : '#ef4444'}
                    visible={true}
                />
            )}

            {/* Status Effects */}
            {gameState.units.map((unit) => (
                <StatusEffects
                    key={`status-${unit.id}`}
                    unit={unit}
                    visible={true}
                />
            ))}

            {/* Attack Animations */}
            {gameState.lastAction?.type === 'attack' && (
                <ProjectileAnimation
                    fromUnit={getUnitById(gameState, gameState.lastAction.attackerId)!}
                    toUnit={getUnitById(gameState, gameState.lastAction.targetId)!}
                    type="ranged"
                    onComplete={() => {
                        // Handle attack animation completion
                    }}
                    color={gameState.currentPlayer === 'p1' ? '#3b82f6' : '#ef4444'}
                />
            )}

            {/* Impact Effects */}
            {gameState.lastAction?.type === 'attack' && (
                <ImpactEffect
                    position={[
                        gameState.lastAction.damage > 0 ? gameState.lastAction.targetId : gameState.lastAction.attackerId,
                        0.2,
                        gameState.lastAction.damage > 0 ? gameState.lastAction.targetId : gameState.lastAction.attackerId
                    ].map(Number) as [number, number, number]}
                    type={gameState.lastAction.outcome === 'crit' ? 'explosion' : 'spark'}
                    onComplete={() => {
                        // Handle impact effect completion
                    }}
                />
            )}
        </>
    );
};