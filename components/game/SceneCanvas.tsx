'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Board } from './Board'
import { GameStatus } from '../UI/GameStatus'
import { UnitInfo } from '../UI/UnitInfo'
import { Controls } from '../UI/Controls'
import { ActionLog } from '../UI/ActionLog'
import { MapPanel } from '../UI/MapPanel'
import { CameraEffects } from './CameraController'
import { DebugAnimations } from './DebugAnimations'
import { MatchSummaryModal } from '../UI/MatchSummaryModal'
import GameLayout from '../GameLayout'
import {
    type AttackOutcome,
    calculateAttackableTilesInState,
    calculateReachableTilesInState,
    createInitialGameState,
    deselectUnit,
    endTurn,
    finishAttackSequence,
    getAttackableEnemies,
    getTargetingPreview,
    getUnitById,
    getWinner,
    hasAvailableActionsForCurrentPlayer,
    hasUnitFinishedTurn,
    isBlockedTile,
    getUnitAt,
    isCurrentPlayersUnit,
    MAP_PRESET_LABELS,
    moveSelectedUnit,
    type InitialGameOptions,
    type MapPresetId,
    Phase,
    fromPersistedGameState,
    type PlayerId,
    resolveAttack,
    selectUnit,
    skipAttackForSelectedUnit,
    toPersistedGameState,
    useActiveAbilityForSelectedUnit,
    undoSelectedUnitMove,
    type GameState,
    type PersistedGameState,
    type Position,
    type TargetingPreview,
} from '../../game/gamestate';
import { getShortestPathToPosition } from '../../game/pathfinding'
import { getEffectiveMovement } from '../../game/rules/movement'
import { installSfxBusListener, emitSfx } from './sfxBus'
import { getSfxSettings, setSfxSettings } from './sfx'
import { ANIMATION_TIMINGS } from './animationTimings'

const TILE_SIZE = 1
const GRID_SIZE = 8
const CANVAS_DPR_MAX = 2
const SCENE_CAMERA_FOV = 50
const SCENE_LIGHT_POSITION: [number, number, number] = [10, 15, 10]
const SCENE_LIGHT_INTENSITY = 1.2
const SHADOW_MAP_SIZE = 1024
const SHADOW_CAMERA_BOUNDS = {
  left: -10,
  right: 10,
  top: 10,
  bottom: -10,
}

type CanvasProps = any

interface SceneCanvasProps {
  canvasProps?: CanvasProps
  mode?: 'game' | 'preview'
  onGameStateChange?: (gameState: GameState) => void
  /** Override localStorage save key. Useful for tutorial/sandbox sessions. */
  saveKey?: string
  /** Whether debug mode is enabled */
  isDebugMode?: boolean
  /** Whether map panel is open */
  isMapPanelOpen?: boolean
}

interface ActiveHitVfx {
  key: string
  targetUnitId: string
  damage: number
  outcome: AttackOutcome
  position: Position
}

interface UndoMoveSnapshot {
  unitId: string
  from: Position
  to: Position
}

// Reserved for future: coordinating VFX cleanup windows.
// const ATTACK_VFX_DURATION_MS = ANIMATION_TIMINGS.attackVfxDurationMs
const TURN_BANNER_DURATION_MS = ANIMATION_TIMINGS.turnBannerDurationMs
const MOVEMENT_DURATION_MS = ANIMATION_TIMINGS.movementDurationMs
const MAP_PRESET_IDS = Object.keys(MAP_PRESET_LABELS) as MapPresetId[]
const DEFAULT_SAVE_KEY = 'threegame:save:v1'
const TURN_BANNER_OVERLAY_STYLE = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 35,
} as const
// Winner overlay styles were moved into MatchSummaryModal.

interface SeriesState {
  bestOf: 3 | 5
  wins: Record<PlayerId, number>
}

interface PersistedSession {
  initialOptions: InitialGameOptions
  gameState: PersistedGameState
  seriesState: SeriesState
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function getNextMapPresetId(current: MapPresetId): MapPresetId {
  const index = MAP_PRESET_IDS.indexOf(current)
  if (index < 0) return MAP_PRESET_IDS[0]
  return MAP_PRESET_IDS[(index + 1) % MAP_PRESET_IDS.length]
}

const SceneCanvas: React.FC<SceneCanvasProps> = ({
  canvasProps,
  mode = 'game',
  onGameStateChange,
  saveKey,
  isDebugMode = false,
  isMapPanelOpen = false,
}) => {
    const [initialOptions, setInitialOptions] = useState<InitialGameOptions>({
      mapPresetId: 'crossroads',
      firstPlayer: 'p1',
      autoSkipNoTargetAttack: false,
    })
    const [gameState, setGameState] = useState<GameState>(createInitialGameState());
    const effectiveSaveKey = saveKey ?? DEFAULT_SAVE_KEY
    useEffect(() => {
      onGameStateChange?.(gameState)
    }, [gameState, onGameStateChange])
    const [activeHitVfx, setActiveHitVfx] = useState<ActiveHitVfx | null>(null);
    const [isResolvingAttack, setIsResolvingAttack] = useState(false);
    const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
    const [undoMoveSnapshot, setUndoMoveSnapshot] = useState<UndoMoveSnapshot | null>(null)
    const [isAnimatingMove, setIsAnimatingMove] = useState(false)
    const [moveHighlightTiles, setMoveHighlightTiles] = useState<Position[] | null>(null)
    const [hoveredTilePos, setHoveredTilePos] = useState<Position | null>(null)
  const orbitControlsRef = useRef<any>(null)
    const [turnBannerText, setTurnBannerText] = useState<string | null>('Player 1 Turn')
    const [seriesState, setSeriesState] = useState<SeriesState>({
      bestOf: 3,
      wins: { p1: 0, p2: 0 },
    })
    const [saveState, setSaveState] = useState<SaveState>('idle')
    const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
    
    const [sfxMuted, setSfxMuted] = useState<boolean>(getSfxSettings().muted)
    const [sfxVolume, setSfxVolume] = useState<number>(getSfxSettings().volume)
    const attackTimeoutRef = useRef<number | null>(null);
    const turnBannerTimeoutRef = useRef<number | null>(null)
    const hasShownInitialTurnBannerRef = useRef(false)
    const hasHydratedSaveRef = useRef(false)
    const recordedMatchWinnerRef = useRef<string | null>(null)
    const winner = useMemo(() => getWinner(gameState), [gameState]);
    const isPlayerOneTurn = gameState.currentPlayer === 'p1'
    const turnBannerTheme = isPlayerOneTurn
      ? {
          background: 'rgba(30, 58, 138, 0.72)',
          border: '1px solid rgba(96, 165, 250, 0.65)',
          color: '#dbeafe',
          shadow: '0 10px 24px rgba(30, 64, 175, 0.45)',
        }
      : {
          background: 'rgba(127, 29, 29, 0.72)',
          border: '1px solid rgba(248, 113, 113, 0.65)',
          color: '#fee2e2',
          shadow: '0 10px 24px rgba(185, 28, 28, 0.45)',
        }
    const neededWins = Math.ceil(seriesState.bestOf / 2)
    const seriesChampion: PlayerId | null =
      seriesState.wins.p1 >= neededWins ? 'p1' : seriesState.wins.p2 >= neededWins ? 'p2' : null
    const selectedUnit = useMemo(
      () => getUnitById(gameState, gameState.selectedUnitId),
      [gameState, gameState.selectedUnitId]
    )

    const targetingPreview = useMemo<TargetingPreview | null>(() => {
      if (gameState.phase !== Phase.ATTACK) return null
      if (!selectedUnit || !hoveredUnitId) return null

      const hoveredUnit = getUnitById(gameState, hoveredUnitId)
      return getTargetingPreview(gameState, selectedUnit, hoveredUnit)
    }, [gameState, selectedUnit, hoveredUnitId])

    const reachableTiles = useMemo(() => calculateReachableTilesInState(
        gameState,
        gameState.units.find(u => u.id === gameState.selectedUnitId),
    ),
    [gameState, gameState.selectedUnitId, gameState.units, gameState.config.gridSize, gameState.config.blockedTiles]);

    // While the move animation plays, optionally keep movement highlights visible.
    const effectiveReachableTiles = useMemo(() => {
      if (!isAnimatingMove) return reachableTiles
      return moveHighlightTiles ?? reachableTiles
    }, [isAnimatingMove, moveHighlightTiles, reachableTiles])

    const attackableTiles = useMemo(() => calculateAttackableTilesInState(
        gameState,
        gameState.units.find(u => u.id === gameState.selectedUnitId)
    ),
    [gameState, gameState.selectedUnitId, gameState.units, gameState.config.gridSize, gameState.config.blockedTiles]);

    const attackableEnemies = useMemo(() => getAttackableEnemies(gameState, 
        gameState.units.find(u => u.id === gameState.selectedUnitId)
    ),
    [gameState.selectedUnitId, gameState.units, gameState.currentPlayer]);

    const movePreview = useMemo(() => {
      if (gameState.phase !== Phase.MOVE_UNIT) return null
      if (!selectedUnit) return null
      if (!hoveredTilePos) return null

      // Only show preview for reachable tiles.
      const isHoverReachable = reachableTiles.some(
        (pos) => pos.x === hoveredTilePos.x && pos.y === hoveredTilePos.y
      )
      if (!isHoverReachable) return null

      const budget = getEffectiveMovement(selectedUnit)
      const path = getShortestPathToPosition(gameState, selectedUnit.position, hoveredTilePos, budget)
      const steps = path.length

      return {
        from: { ...selectedUnit.position },
        to: { ...hoveredTilePos },
        steps,
        budget,
        remaining: Math.max(0, budget - steps),
      }
    }, [gameState, hoveredTilePos, reachableTiles, selectedUnit])
        

    const handleTileClick = (tilePos: Position) => {
    if (winner) return;
    if (isResolvingAttack) return;
    if (isAnimatingMove) return;

    setHoveredUnitId(null)
    setHoveredTilePos(null)

    switch (gameState.phase) {
      case Phase.SELECT_UNIT:
        if (isBlockedTile(gameState, tilePos)) return;
        const unit = getUnitAt(gameState, tilePos);
        if (unit && isCurrentPlayersUnit(gameState, unit) && !hasUnitFinishedTurn(unit)) {
          emitSfx('select')
          setGameState(prev => selectUnit(prev, unit.id));
        }
        break;
      case Phase.MOVE_UNIT:
        const canMove = reachableTiles.some(pos => pos.x === tilePos.x && pos.y === tilePos.y);
        if (!canMove) {
          return;
        }
        if (selectedUnit) {
          // Cache tiles we want to keep highlighting while animating.
          setMoveHighlightTiles([...reachableTiles])

          setUndoMoveSnapshot({
            unitId: selectedUnit.id,
            from: { ...selectedUnit.position },
            to: { ...tilePos },
          })

          emitSfx('move')
          
          // For animation, we need to trigger the pathfinding before updating state
          // The UnitMesh component will handle the animation based on the path
          setGameState(prev => moveSelectedUnit(prev, tilePos));

          // Keep UI in MOVE state until the movement animation finishes.
          setIsAnimatingMove(true)
          window.setTimeout(() => {
            setIsAnimatingMove(false)
            setMoveHighlightTiles(null)
          }, MOVEMENT_DURATION_MS)
        }
        break;
      case Phase.ATTACK:
        const targetUnit = getUnitAt(gameState, tilePos);
        if (targetUnit && targetUnit.id !== gameState.selectedUnitId && attackableEnemies.some(e => e.id === targetUnit.id)) {
          emitSfx('attack')
          const resolution = resolveAttack(gameState, targetUnit.id);
          if (!resolution) return;

          const vfxKey = `${resolution.targetId}-${Date.now()}`;

          // Set up projectile animation first
          setGameState(resolution.nextState);
          setUndoMoveSnapshot(null)
          
          // Start projectile animation
          setActiveHitVfx({
            key: vfxKey,
            targetUnitId: resolution.targetId,
            damage: resolution.damage,
            outcome: resolution.outcome,
            position: resolution.targetPosition,
          });
          setIsResolvingAttack(true);

          if (attackTimeoutRef.current) {
            window.clearTimeout(attackTimeoutRef.current);
          }

          // Attack sequence: Projectile → Impact → Cleanup
          attackTimeoutRef.current = window.setTimeout(() => {
            if (resolution.outcome === 'crit') emitSfx('crit')
            else if (resolution.outcome === 'miss') emitSfx('miss')
            else emitSfx('hit')

            const targetAfter = getUnitById(resolution.nextState, resolution.targetId)
            if (!targetAfter || targetAfter.health <= 0) {
              emitSfx('death')
            }

            // First: Show projectile impact (hit effect) - this triggers FloatingDamageText
            setActiveHitVfx({
              key: vfxKey,
              targetUnitId: resolution.targetId,
              damage: resolution.damage,
              outcome: resolution.outcome,
              position: resolution.targetPosition,
            });
            
            // Then: Finish attack sequence after a short delay
            setTimeout(() => {
              setGameState((prev) => {
                const postAttack = finishAttackSequence(prev)
                return hasAvailableActionsForCurrentPlayer(postAttack)
                  ? postAttack
                  : endTurn(postAttack)
              });
              setActiveHitVfx(null);
              setIsResolvingAttack(false);
              setUndoMoveSnapshot(null)
              attackTimeoutRef.current = null;
            }, 400); // 400ms for hit effect to play
          }, 600); // 600ms for projectile flight
        }
        break;
        default:
            break;
    }
  };

  // Custom rotation logic for preview mode - orbit around board center
  useEffect(() => {
    let animationId: number;
    let angle = 0;
    
    const animate = () => {
      if (mode === 'preview' && orbitControlsRef.current) {
        const controls = orbitControlsRef.current;
        if (controls.object) {
          // Calculate orbital position around board center
          const radius = GRID_SIZE * 1.2; // Distance from center
          const height = GRID_SIZE * 0.8; // Camera height
          const center = ((GRID_SIZE - 1) * TILE_SIZE) / 2;
          
          angle += 0.002; // Rotation speed
          
          const x = center + Math.cos(angle) * radius;
          const z = center + Math.sin(angle) * radius;
          
          controls.object.position.set(x, height, z);
          controls.target.set(center, 0, center);
          controls.update();
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    if (mode === 'preview') {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [mode]);

  // Ensure consistent camera position for both modes
  useEffect(() => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      if (controls.object) {
        // Set consistent camera position for both preview and game modes
        const CENTER = ((GRID_SIZE - 1) * TILE_SIZE) / 2;
        const consistentPosition: [number, number, number] = [CENTER, GRID_SIZE * 1.0 + 2, CENTER + GRID_SIZE];
        
        controls.object.position.set(...consistentPosition);
        controls.target.set(CENTER, 0, CENTER);
        controls.update();
      }
    }
  }, [mode]); // Re-run when mode changes to ensure consistency



  const CENTER = ((GRID_SIZE - 1) * TILE_SIZE) / 2
  const cameraPosition: [number, number, number] = [CENTER, GRID_SIZE * 1.0 + 2, CENTER + GRID_SIZE]

  useEffect(() => {
    // Re-hydrate when save key changes (e.g. tutorial sessions use a separate key).
    hasHydratedSaveRef.current = false

    // Install SFX listener once per scene.
    const uninstall = installSfxBusListener()

    // Restore persisted SFX settings.
    try {
      const raw = window.localStorage.getItem('threegame:sfx-settings')
      if (raw) {
        const parsed = JSON.parse(raw) as { muted?: boolean; volume?: number }
        if (typeof parsed.muted === 'boolean') {
          setSfxMuted(parsed.muted)
          setSfxSettings({ muted: parsed.muted })
        }
        if (typeof parsed.volume === 'number') {
          const v = Math.max(0, Math.min(1, parsed.volume))
          setSfxVolume(v)
          setSfxSettings({ volume: v })
        }
      }
    } catch {
      // ignore
    }

    try {
      const raw = window.localStorage.getItem(effectiveSaveKey)
      if (!raw) {
        hasHydratedSaveRef.current = true
        return
      }

      const parsed = JSON.parse(raw) as PersistedSession
      if (!parsed?.gameState || !parsed?.initialOptions || !parsed?.seriesState) {
        hasHydratedSaveRef.current = true
        return
      }

      setInitialOptions(parsed.initialOptions)
      setGameState(fromPersistedGameState(parsed.gameState))
      setSeriesState(parsed.seriesState)
    } catch {
      // ignore malformed local save
    } finally {
      hasHydratedSaveRef.current = true
    }

    return () => {
      uninstall()
    }
  }, [effectiveSaveKey])

  useEffect(() => {
    setSfxSettings({ muted: sfxMuted, volume: sfxVolume })
    try {
      window.localStorage.setItem('threegame:sfx-settings', JSON.stringify({ muted: sfxMuted, volume: sfxVolume }))
    } catch {
      // ignore
    }
  }, [sfxMuted, sfxVolume])

  useEffect(() => {
    if (!hasHydratedSaveRef.current) return

    setSaveState('saving')

    const payload: PersistedSession = {
      initialOptions,
      gameState: toPersistedGameState(gameState),
      seriesState,
    }

    try {
      window.localStorage.setItem(effectiveSaveKey, JSON.stringify(payload))
      const now = Date.now()
      setLastSavedAt(now)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [effectiveSaveKey, gameState, initialOptions, seriesState])

  useEffect(() => {
    if (saveState !== 'saved') return

    const timeout = window.setTimeout(() => {
      setSaveState('idle')
    }, 1000)

    return () => window.clearTimeout(timeout)
  }, [saveState])

  useEffect(() => {
    if (!winner) return

    const signature = `${winner}-${gameState.turn}-${gameState.matchStats.turnsPlayed}`
    if (recordedMatchWinnerRef.current === signature) return
    recordedMatchWinnerRef.current = signature

    setSeriesState((prev) => ({
      ...prev,
      wins: {
        ...prev.wins,
        [winner]: prev.wins[winner] + 1,
      },
    }))
  }, [winner, gameState.turn, gameState.matchStats.turnsPlayed])

  useEffect(() => {
    const playerLabel = gameState.currentPlayer === 'p1' ? 'Player 1' : 'Player 2'

    if (!hasShownInitialTurnBannerRef.current) {
      hasShownInitialTurnBannerRef.current = true
      setTurnBannerText(`${playerLabel} Turn`)
    } else {
      setTurnBannerText(`${playerLabel} Turn`)
    }

    if (turnBannerTimeoutRef.current) {
      window.clearTimeout(turnBannerTimeoutRef.current)
    }

    turnBannerTimeoutRef.current = window.setTimeout(() => {
      setTurnBannerText(null)
      turnBannerTimeoutRef.current = null
    }, TURN_BANNER_DURATION_MS)
  }, [gameState.currentPlayer, gameState.turn])

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'

      if (attackTimeoutRef.current) {
        window.clearTimeout(attackTimeoutRef.current)
      }

      if (turnBannerTimeoutRef.current) {
        window.clearTimeout(turnBannerTimeoutRef.current)
      }
    }
  }, [])


  const restartWith = (options: InitialGameOptions, resetSeries = false) => {
    setInitialOptions(options)
    setActiveHitVfx(null)
    setHoveredUnitId(null)
    setIsResolvingAttack(false)
    setUndoMoveSnapshot(null)
    recordedMatchWinnerRef.current = null
    if (resetSeries) {
      setSeriesState((prev) => ({
        ...prev,
        wins: { p1: 0, p2: 0 },
      }))
    }
    setGameState(createInitialGameState(options))
  }

  const canUndoMove =
    !isResolvingAttack &&
    !winner &&
    !!undoMoveSnapshot &&
    gameState.phase === Phase.ATTACK &&
    gameState.selectedUnitId === undoMoveSnapshot.unitId

  const handleUndoMove = () => {
    if (!undoMoveSnapshot) return
    if (!canUndoMove) return

    setGameState((prev) => undoSelectedUnitMove(prev, undoMoveSnapshot.from))
    setUndoMoveSnapshot(null)
  }

  return (
    <GameLayout
      isDebugMode={isDebugMode}
      onDebugModeChange={(enabled) => {
        // Handle debug mode change if needed
      }}
      isMapPanelOpen={isMapPanelOpen}
      onMapPanelOpenChange={(open) => {
        // Handle map panel change if needed
      }}
      bestOf={seriesState.bestOf}
      wins={seriesState.wins}
      saveState={saveState}
      lastSavedAt={lastSavedAt}
    >
      <div className="canvasWrap">
        <Canvas
          shadows
          dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, CANVAS_DPR_MAX) : 1}
          style={{ width: '100%', height: '100%' }}
          camera={{ position: cameraPosition, fov: SCENE_CAMERA_FOV }}
          {...canvasProps}
        >
        <ambientLight intensity={0.35} />
        <directionalLight
          castShadow
          position={SCENE_LIGHT_POSITION}
          intensity={SCENE_LIGHT_INTENSITY}
          shadow-mapSize-width={SHADOW_MAP_SIZE}
          shadow-mapSize-height={SHADOW_MAP_SIZE}
          shadow-camera-left={SHADOW_CAMERA_BOUNDS.left}
          shadow-camera-right={SHADOW_CAMERA_BOUNDS.right}
          shadow-camera-top={SHADOW_CAMERA_BOUNDS.top}
          shadow-camera-bottom={SHADOW_CAMERA_BOUNDS.bottom}
        />

        <OrbitControls 
          ref={orbitControlsRef}
          target={[CENTER, 0, CENTER]} 
          enablePan={false} 
          enableDamping={true}
          dampingFactor={0.05}
          enabled={mode === 'game'}
          enableZoom={mode === 'game'}
          enableRotate={mode === 'game'}
          autoRotate={mode === 'preview'}
          autoRotateSpeed={mode === 'preview' ? 0.5 : 0}
        />

        {/* Camera Effects */}
        <CameraEffects
          gameState={gameState}
          onCameraShake={(intensity, duration) => {
            // Camera shake handled by CameraController
          }}
          onCameraZoom={(intensity, duration) => {
            // Camera zoom handled by CameraController
          }}
        />

        <Board
          gameState={gameState}
          reachableTiles={effectiveReachableTiles}
          attackableTiles={attackableTiles}
          // While animating a move, keep the “selected tile” highlight on the
          // origin square so it doesn’t snap to the destination immediately.
          selectedPositionOverride={isAnimatingMove ? (undoMoveSnapshot?.from ?? null) : undefined}
          onTileClick={handleTileClick}
          onTileHoverStart={(pos) => {
            if (isAnimatingMove) return
            setHoveredTilePos(pos)
          }}
          onTileHoverEnd={() => {
            setHoveredTilePos(null)
          }}
          onUnitHoverStart={(unitId) => setHoveredUnitId(unitId)}
          onUnitHoverEnd={() => setHoveredUnitId(null)}
          previewTargetUnitId={targetingPreview?.targetId ?? null}
          hitTargetUnitId={activeHitVfx?.targetUnitId ?? null}
          hitEffectKey={activeHitVfx?.key ?? null}
          floatingDamage={activeHitVfx ? {
            key: activeHitVfx.key,
            damage: activeHitVfx.damage,
            outcome: activeHitVfx.outcome,
            position: activeHitVfx.position,
          } : null}
          isPreviewMode={mode === 'preview'}
          // While the unit is animating, keep the board in MOVE_UNIT visuals so
          // we don't show ATTACK highlights until the move finishes.
          // Whether move highlights are shown during the animation is controlled
          // by `effectiveReachableTiles` (and the AnimationSettings flags).
          phaseOverride={isAnimatingMove ? Phase.MOVE_UNIT : undefined}
        />
      </Canvas>

      {/* Only show UI elements in game mode */}
      {mode === 'game' && (
        <>
          <GameStatus gameState={gameState} targetingPreview={targetingPreview} movePreview={movePreview} />
          <UnitInfo gameState={gameState} />
          <ActionLog gameState={gameState} />
          <Controls 
            gameState={gameState}
            isBusy={isResolvingAttack || !!winner}
            onEndTurn={() => {
              if (isResolvingAttack || winner) return;
              // Clear any pending attack animations
              if (attackTimeoutRef.current) {
                window.clearTimeout(attackTimeoutRef.current);
                attackTimeoutRef.current = null;
              }
              setActiveHitVfx(null);
              setIsResolvingAttack(false);
              setUndoMoveSnapshot(null);
              
              setGameState(prev => {
                if (prev.phase === Phase.MOVE_UNIT) {
                  const selectedUnit = getUnitById(prev, prev.selectedUnitId)
                  if (selectedUnit && !selectedUnit.hasMoved) {
                    return prev
                  }
                }

                if (prev.phase === Phase.ATTACK) {
                  const selectedUnit = getUnitById(prev, prev.selectedUnitId)
                  if (selectedUnit && !selectedUnit.hasAttacked) {
                    const postSkip = skipAttackForSelectedUnit(prev)
                    return hasAvailableActionsForCurrentPlayer(postSkip)
                      ? postSkip
                      : endTurn(postSkip)
                  }
                }

                return endTurn(prev)
              });
            }}
            onCancelSelection={() => {
              if (isResolvingAttack || winner) return;
              // Clear any pending attack animations
              if (attackTimeoutRef.current) {
                window.clearTimeout(attackTimeoutRef.current);
                attackTimeoutRef.current = null;
              }
              setActiveHitVfx(null);
              setIsResolvingAttack(false);
              setUndoMoveSnapshot(null);
              
              setGameState(prev => {
                if (prev.phase === Phase.ATTACK) {
                  const selected = getUnitById(prev, prev.selectedUnitId)
                  if (selected && selected.hasMoved && !selected.hasAttacked) {
                    return skipAttackForSelectedUnit(prev)
                  }
                }
                return deselectUnit(prev)
              });
            }}
            onSetAutoSkipNoTargetAttack={(enabled: boolean) => {
              setInitialOptions((prev) => ({
                ...prev,
                autoSkipNoTargetAttack: enabled,
              }))

              setGameState((prev) => {
                const nextState = {
                  ...prev,
                  autoSkipNoTargetAttack: enabled,
                }

                if (!enabled) return nextState
                if (nextState.phase !== Phase.ATTACK) return nextState

                const selected = getUnitById(nextState, nextState.selectedUnitId)
                if (!selected || selected.hasAttacked) return nextState

                const attackable = getAttackableEnemies(nextState, selected)
                if (attackable.length > 0) return nextState

                const postSkip = skipAttackForSelectedUnit(nextState)
                return hasAvailableActionsForCurrentPlayer(postSkip)
                  ? postSkip
                  : endTurn(postSkip)
              })
            }}
            canUndoMove={canUndoMove}
            onUndoMove={handleUndoMove}
            onUseAbility={() => {
              if (isResolvingAttack || winner) return
              setGameState((prev) => useActiveAbilityForSelectedUnit(prev))
            }}
          />

          {/* Map Panel - positioned in the top left corner, conditionally rendered */}
          {isMapPanelOpen && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 20,
            }}>
              <MapPanel
                gameState={gameState}
                isBusy={isResolvingAttack || !!winner}
                onApplyMapConfig={(mapPresetId: MapPresetId, mapSeed?: number) => {
                  if (isResolvingAttack) return
                  restartWith({
                    ...initialOptions,
                    mapPresetId,
                    mapSeed,
                  })
                }}
                onSetAutoSkipNoTargetAttack={(enabled: boolean) => {
                  setInitialOptions((prev) => ({
                    ...prev,
                    autoSkipNoTargetAttack: enabled,
                  }))

                  setGameState((prev) => {
                    const nextState = {
                      ...prev,
                      autoSkipNoTargetAttack: enabled,
                    }

                    if (!enabled) return nextState
                    if (nextState.phase !== Phase.ATTACK) return nextState

                    const selected = getUnitById(nextState, nextState.selectedUnitId)
                    if (!selected || selected.hasAttacked) return nextState

                    const attackable = getAttackableEnemies(nextState, selected)
                    if (attackable.length > 0) return nextState

                    const postSkip = skipAttackForSelectedUnit(nextState)
                    return hasAvailableActionsForCurrentPlayer(postSkip)
                      ? postSkip
                      : endTurn(postSkip)
                  })
                }}
              />
            </div>
          )}


          {/* Debug Info */}
          {isDebugMode && <DebugAnimations gameState={gameState} />}
        </>
      )}

      {turnBannerText && !winner && (
        <div style={TURN_BANNER_OVERLAY_STYLE}>
          <div
            style={{
              background: turnBannerTheme.background,
              border: turnBannerTheme.border,
              borderRadius: 12,
              padding: '12px 18px',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: turnBannerTheme.color,
              textTransform: 'uppercase',
              boxShadow: turnBannerTheme.shadow,
            }}
          >
            {turnBannerText}
          </div>
        </div>
      )}

      {winner && (
        <MatchSummaryModal
          isOpen={true}
          winner={winner}
          gameState={gameState}
          seriesBestOf={seriesState.bestOf}
          seriesWins={seriesState.wins}
          mapPresetId={gameState.config.mapPresetId}
          mapSeed={gameState.config.mapSeed}
          onRematch={() => {
            restartWith(initialOptions, !!seriesChampion)
          }}
          onSwapFirstPlayer={() => {
            const swapped: PlayerId = initialOptions.firstPlayer === 'p2' ? 'p1' : 'p2'
            restartWith({
              ...initialOptions,
              firstPlayer: swapped,
            })
          }}
          onNewMap={() => {
            const nextPreset = getNextMapPresetId(gameState.config.mapPresetId)
            const nextSeed = nextPreset === 'random-seeded'
              ? (gameState.config.mapSeed ?? 1337) + 1
              : undefined
            restartWith({
              ...initialOptions,
              mapPresetId: nextPreset,
              mapSeed: nextSeed,
            }, false)
          }}
          onToggleBestOf={() => {
            const nextBestOf: 3 | 5 = seriesState.bestOf === 3 ? 5 : 3
            setSeriesState({
              bestOf: nextBestOf,
              wins: { p1: 0, p2: 0 },
            })
            restartWith(initialOptions, false)
          }}
        />
      )}
    </div>
    </GameLayout>
  )
}

export default SceneCanvas