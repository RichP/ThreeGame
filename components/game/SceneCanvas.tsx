'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Board } from './Board'
import { GameStatus } from '../UI/GameStatus'
import { UnitInfo } from '../UI/UnitInfo'
import { Controls } from '../UI/Controls'
import { ActionLog } from '../UI/ActionLog'
import { SessionHud } from '../UI/SessionHud'
import { AnimationSettings, useAnimationSettings } from './AnimationSettings'
import { CameraController, CameraEffects } from './CameraController'
import { DebugAnimations } from './DebugAnimations'
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

const ATTACK_VFX_DURATION_MS = 850
const TURN_BANNER_DURATION_MS = 700
const MOVEMENT_DURATION_MS = 600
const MAP_PRESET_IDS = Object.keys(MAP_PRESET_LABELS) as MapPresetId[]
const SAVE_KEY = 'threegame:save:v1'
const TURN_BANNER_OVERLAY_STYLE = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 35,
} as const
const WINNER_OVERLAY_STYLE = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(2, 6, 23, 0.78)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 40,
} as const
const WINNER_PANEL_STYLE = {
  background: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  borderRadius: 12,
  padding: '24px 28px',
  textAlign: 'center',
  minWidth: 280,
} as const

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

const SceneCanvas: React.FC<SceneCanvasProps> = ({ canvasProps, mode = 'game' }) => {
    const [initialOptions, setInitialOptions] = useState<InitialGameOptions>({
      mapPresetId: 'crossroads',
      firstPlayer: 'p1',
      autoSkipNoTargetAttack: false,
    })
    const [gameState, setGameState] = useState<GameState>(createInitialGameState());
    const [activeHitVfx, setActiveHitVfx] = useState<ActiveHitVfx | null>(null);
    const [isResolvingAttack, setIsResolvingAttack] = useState(false);
    const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
    const [undoMoveSnapshot, setUndoMoveSnapshot] = useState<UndoMoveSnapshot | null>(null)
  const orbitControlsRef = useRef<any>(null)
    const [turnBannerText, setTurnBannerText] = useState<string | null>('Player 1 Turn')
    const [seriesState, setSeriesState] = useState<SeriesState>({
      bestOf: 3,
      wins: { p1: 0, p2: 0 },
    })
    const [saveState, setSaveState] = useState<SaveState>('idle')
    const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
    
    // Animation settings
    const { settings, setSettings } = useAnimationSettings();
    const attackTimeoutRef = useRef<number | null>(null);
    const turnBannerTimeoutRef = useRef<number | null>(null)
    const hasShownInitialTurnBannerRef = useRef(false)
    const hasHydratedSaveRef = useRef(false)
    const recordedMatchWinnerRef = useRef<string | null>(null)
    const winner = useMemo(() => getWinner(gameState), [gameState]);
    const winnerLabel = winner === 'p1' ? 'Player 1' : winner === 'p2' ? 'Player 2' : null
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

    const attackableTiles = useMemo(() => calculateAttackableTilesInState(
        gameState,
        gameState.units.find(u => u.id === gameState.selectedUnitId)
    ),
    [gameState, gameState.selectedUnitId, gameState.units, gameState.config.gridSize, gameState.config.blockedTiles]);

    const attackableEnemies = useMemo(() => getAttackableEnemies(gameState, 
        gameState.units.find(u => u.id === gameState.selectedUnitId)
    ),
    [gameState.selectedUnitId, gameState.units, gameState.currentPlayer]);
        

    const handleTileClick = (tilePos: Position) => {
    if (winner) return;
    if (isResolvingAttack) return;

    setHoveredUnitId(null)

    switch (gameState.phase) {
      case Phase.SELECT_UNIT:
        if (isBlockedTile(gameState, tilePos)) return;
        const unit = getUnitAt(gameState, tilePos);
        if (unit && isCurrentPlayersUnit(gameState, unit) && !hasUnitFinishedTurn(unit)) {
          setGameState(prev => selectUnit(prev, unit.id));
        }
        break;
      case Phase.MOVE_UNIT:
        const canMove = reachableTiles.some(pos => pos.x === tilePos.x && pos.y === tilePos.y);
        if (!canMove) {
          return;
        }
        if (selectedUnit) {
          setUndoMoveSnapshot({
            unitId: selectedUnit.id,
            from: { ...selectedUnit.position },
            to: { ...tilePos },
          })
        }
        setGameState(prev => moveSelectedUnit(prev, tilePos));
        break;
      case Phase.ATTACK:
        const targetUnit = getUnitAt(gameState, tilePos);
        if (targetUnit && targetUnit.id !== gameState.selectedUnitId && attackableEnemies.some(e => e.id === targetUnit.id)) {
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
    try {
      const raw = window.localStorage.getItem(SAVE_KEY)
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
  }, [])

  useEffect(() => {
    if (!hasHydratedSaveRef.current) return

    setSaveState('saving')

    const payload: PersistedSession = {
      initialOptions,
      gameState: toPersistedGameState(gameState),
      seriesState,
    }

    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
      const now = Date.now()
      setLastSavedAt(now)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [gameState, initialOptions, seriesState])

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
            if (settings.enabled && settings.cameraShake) {
              // Camera shake handled by CameraController
            }
          }}
          onCameraZoom={(intensity, duration) => {
            if (settings.enabled) {
              // Camera zoom handled by CameraController
            }
          }}
        />

        <Board
          gameState={gameState}
          reachableTiles={reachableTiles}
          attackableTiles={attackableTiles}
          onTileClick={handleTileClick}
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
        />
      </Canvas>

      {/* Only show UI elements in game mode */}
      {mode === 'game' && (
        <>
          <GameStatus gameState={gameState} targetingPreview={targetingPreview} />
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
            canUndoMove={canUndoMove}
            onUndoMove={handleUndoMove}
            onUseAbility={() => {
              if (isResolvingAttack || winner) return
              setGameState((prev) => useActiveAbilityForSelectedUnit(prev))
            }}
          />

          <SessionHud
            bestOf={seriesState.bestOf}
            wins={seriesState.wins}
            saveState={saveState}
            lastSavedAt={lastSavedAt}
          />

          {/* Animation Settings */}
          <AnimationSettings
            settings={settings}
            onChange={setSettings}
          />

          {/* Debug Info */}
          <DebugAnimations gameState={gameState} />
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
        <div style={WINNER_OVERLAY_STYLE}>
          <div style={WINNER_PANEL_STYLE}>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Game Over</h2>
            <p style={{ marginTop: 0, marginBottom: 16 }}>
              {winnerLabel} wins!
            </p>
            <div style={{ marginBottom: 12, fontSize: 12, color: '#cbd5e1' }}>
              Series (BO{seriesState.bestOf}): P1 {seriesState.wins.p1} - P2 {seriesState.wins.p2}
              {seriesChampion && (
                <div style={{ marginTop: 4, fontWeight: 700, color: '#fef08a' }}>
                  {seriesChampion === 'p1' ? 'Player 1' : 'Player 2'} wins the series
                </div>
              )}
            </div>
            <div
              style={{
                textAlign: 'left',
                marginBottom: 16,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(148, 163, 184, 0.35)',
                background: 'rgba(2, 6, 23, 0.45)',
                display: 'grid',
                gap: 6,
                fontSize: 12,
              }}
            >
              <div>Turns played: {gameState.matchStats.turnsPlayed}</div>
              <div>Total hits: {gameState.matchStats.hits}</div>
              <div>Total misses: {gameState.matchStats.misses}</div>
              <div>Total crits: {gameState.matchStats.crits}</div>
              <div>Damage by Player 1: {gameState.matchStats.damageByPlayer.p1}</div>
              <div>Damage by Player 2: {gameState.matchStats.damageByPlayer.p2}</div>
              <div style={{ marginTop: 6, fontWeight: 700 }}>Per-unit:</div>
              {Object.entries(gameState.matchStats.perUnit).map(([unitId, stats]) => (
                <div key={unitId} style={{ opacity: 0.95 }}>
                  {unitId}: K {stats.kills} · DT {stats.damageTaken} · AL {stats.attacksLanded} · TS {stats.turnsSurvived}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <button
                onClick={() => {
                  restartWith(initialOptions, !!seriesChampion)
                }}
                style={{
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  background: '#22c55e',
                  color: '#052e16',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {seriesChampion ? 'Start New Series' : 'Rematch'}
              </button>

              <button
                onClick={() => {
                  const swapped: PlayerId = initialOptions.firstPlayer === 'p2' ? 'p1' : 'p2'
                  restartWith({
                    ...initialOptions,
                    firstPlayer: swapped,
                  })
                }}
                style={{
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  background: '#38bdf8',
                  color: '#082f49',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Swap First Player
              </button>

              <button
                onClick={() => {
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
                style={{
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  background: '#f59e0b',
                  color: '#451a03',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                New Map
              </button>

              <button
                onClick={() => {
                  const nextBestOf: 3 | 5 = seriesState.bestOf === 3 ? 5 : 3
                  setSeriesState({
                    bestOf: nextBestOf,
                    wins: { p1: 0, p2: 0 },
                  })
                  restartWith(initialOptions, false)
                }}
                style={{
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  background: '#a78bfa',
                  color: '#2e1065',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Toggle BO{seriesState.bestOf === 3 ? '5' : '3'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SceneCanvas