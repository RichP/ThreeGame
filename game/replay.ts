/**
 * Match Replay System
 * 
 * Provides deterministic replay functionality by persisting random seeds
 * and core event sequences to enable match playback.
 */

import type { GameState, GameEvent, AttackResolution } from './gamestate'
import type { MapPresetId } from './config'

export interface ReplayMetadata {
  readonly matchId: string;
  readonly timestamp: number;
  readonly mapPresetId: MapPresetId;
  readonly initialSeed: number;
  readonly playerNames: {
    readonly p1: string;
    readonly p2: string;
  };
  readonly totalTurns: number;
  readonly winner: 'p1' | 'p2' | 'draw' | null;
}

export interface ReplayEvent {
  readonly type: 'move' | 'attack' | 'undo_move' | 'skip_attack' | 'end_turn' | 'use_ability';
  readonly timestamp: number;
  readonly playerId: 'p1' | 'p2';
  readonly turn: number;
  readonly details: MoveReplayDetails | AttackReplayDetails | UndoMoveReplayDetails | SkipAttackReplayDetails | EndTurnReplayDetails | UseAbilityReplayDetails;
}

export interface MoveReplayDetails {
  readonly unitId: string;
  readonly from: { x: number; y: number };
  readonly to: { x: number; y: number };
}

export interface AttackReplayDetails {
  readonly attackerId: string;
  readonly targetId: string;
  readonly damage: number;
  readonly outcome: 'miss' | 'hit' | 'crit';
  readonly roll: number; // The random number that determined the outcome
  readonly statusesApplied?: string[];
}

export interface UndoMoveReplayDetails {
  readonly unitId: string;
  readonly from: { x: number; y: number };
  readonly to: { x: number; y: number };
}

export interface SkipAttackReplayDetails {
  readonly unitId: string;
}

export interface EndTurnReplayDetails {
  readonly nextPlayer: 'p1' | 'p2';
}

export interface UseAbilityReplayDetails {
  readonly unitId: string;
  readonly abilityType: 'dash' | 'guard' | 'aim';
}

export interface ReplayState {
  readonly metadata: ReplayMetadata;
  readonly events: ReplayEvent[];
  currentIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // 1.0 = normal speed
}

class ReplayManager {
  private currentReplay: ReplayState | null = null;
  private playbackTimer: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY_PREFIX = 'threegame_replay_';
  private readonly MAX_REPLAYS = 50;

  /**
   * Create a new replay from a game state
   */
  createReplay(gameState: GameState, playerNames: { p1: string; p2: string }): ReplayMetadata {
    const metadata: ReplayMetadata = {
      matchId: this.generateMatchId(),
      timestamp: Date.now(),
      mapPresetId: gameState.config.mapPresetId,
      initialSeed: gameState.config.mapSeed || Date.now(),
      playerNames,
      totalTurns: gameState.turn,
      winner: this.determineWinner(gameState)
    };

    // Store metadata
    this.saveReplayMetadata(metadata);
    
    return metadata;
  }

  /**
   * Add an event to the current replay
   */
  addEvent(event: ReplayEvent): void {
    if (!this.currentReplay) return;

    this.currentReplay.events.push(event);
    this.saveReplayState(this.currentReplay);
  }

  /**
   * Start recording a new replay
   */
  startRecording(metadata: ReplayMetadata): void {
    this.currentReplay = {
      metadata,
      events: [],
      currentIndex: -1,
      isPlaying: false,
      playbackSpeed: 1.0
    };
  }

  /**
   * Stop recording the current replay
   */
  stopRecording(): ReplayState | null {
    if (!this.currentReplay) return null;

    const replay = { ...this.currentReplay };
    this.currentReplay = null;
    this.saveReplayState(replay);
    return replay;
  }

  /**
   * Get all available replays
   */
  getAvailableReplays(): ReplayMetadata[] {
    const replays: ReplayMetadata[] = [];
    
    for (let i = 0; i < this.MAX_REPLAYS; i++) {
      const key = `${this.STORAGE_KEY_PREFIX}${i}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const metadata: ReplayMetadata = JSON.parse(stored);
          replays.push(metadata);
        } catch (error) {
          console.warn('Failed to parse replay metadata:', error);
        }
      }
    }

    return replays.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Load a replay for playback
   */
  loadReplay(matchId: string): ReplayState | null {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}_state_${matchId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const replayState: ReplayState = JSON.parse(stored);
      return replayState;
    } catch (error) {
      console.error('Failed to load replay:', error);
      return null;
    }
  }

  /**
   * Start playback of a replay
   */
  startPlayback(replayState: ReplayState, onEvent: (event: ReplayEvent) => void): void {
    this.currentReplay = { ...replayState, isPlaying: true };
    
    const playNextEvent = () => {
      if (!this.currentReplay || !this.currentReplay.isPlaying) return;

      this.currentReplay.currentIndex++;
      
      if (this.currentReplay.currentIndex < this.currentReplay.events.length) {
        const event = this.currentReplay.events[this.currentReplay.currentIndex];
        onEvent(event);
        
        const delay = Math.max(500 / this.currentReplay.playbackSpeed, 100); // Minimum 100ms delay
        this.playbackTimer = setTimeout(playNextEvent, delay);
      } else {
        this.stopPlayback();
      }
    };

    playNextEvent();
  }

  /**
   * Stop current playback
   */
  stopPlayback(): void {
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
    
    if (this.currentReplay) {
      this.currentReplay.isPlaying = false;
    }
  }

  /**
   * Set playback speed
   */
  setPlaybackSpeed(speed: number): void {
    if (this.currentReplay) {
      this.currentReplay.playbackSpeed = Math.max(0.1, Math.min(5.0, speed));
    }
  }

  /**
   * Get current replay state
   */
  getCurrentReplay(): ReplayState | null {
    return this.currentReplay;
  }

  /**
   * Export replay for sharing
   */
  exportReplay(matchId: string): string {
    const replayState = this.loadReplay(matchId);
    if (!replayState) return '';

    return JSON.stringify({
      exportVersion: '1.0',
      timestamp: Date.now(),
      replay: replayState
    }, null, 2);
  }

  /**
   * Import replay from shared data
   */
  importReplay(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data.replay || !data.replay.metadata) {
        return false;
      }

      const replayState: ReplayState = data.replay;
      this.saveReplayState(replayState);
      return true;
    } catch (error) {
      console.error('Failed to import replay:', error);
      return false;
    }
  }

  /**
   * Delete a replay
   */
  deleteReplay(matchId: string): boolean {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}_state_${matchId}`;
      localStorage.removeItem(key);
      
      // Also remove metadata
      const metadataKey = this.findMetadataKey(matchId);
      if (metadataKey) {
        localStorage.removeItem(metadataKey);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete replay:', error);
      return false;
    }
  }

  /**
   * Clear all replays
   */
  clearAllReplays(): boolean {
    try {
      // Clear all replay states
      for (let i = 0; i < this.MAX_REPLAYS; i++) {
        localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}_state_${i}`);
      }
      
      // Clear all metadata
      for (let i = 0; i < this.MAX_REPLAYS; i++) {
        localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${i}`);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear replays:', error);
      return false;
    }
  }

  private generateMatchId(): string {
    return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineWinner(gameState: GameState): 'p1' | 'p2' | 'draw' | null {
    const p1Alive = gameState.units.some(u => u.playerId === 'p1' && u.health > 0);
    const p2Alive = gameState.units.some(u => u.playerId === 'p2' && u.health > 0);
    
    if (p1Alive && !p2Alive) return 'p1';
    if (p2Alive && !p1Alive) return 'p2';
    return 'draw';
  }

  private saveReplayMetadata(metadata: ReplayMetadata): void {
    try {
      // Find first available slot
      for (let i = 0; i < this.MAX_REPLAYS; i++) {
        const key = `${this.STORAGE_KEY_PREFIX}${i}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(metadata));
          break;
        }
      }
    } catch (error) {
      console.error('Failed to save replay metadata:', error);
    }
  }

  private saveReplayState(replayState: ReplayState): void {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}_state_${replayState.metadata.matchId}`;
      localStorage.setItem(key, JSON.stringify(replayState));
    } catch (error) {
      console.error('Failed to save replay state:', error);
    }
  }

  private findMetadataKey(matchId: string): string | null {
    for (let i = 0; i < this.MAX_REPLAYS; i++) {
      const key = `${this.STORAGE_KEY_PREFIX}${i}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const metadata: ReplayMetadata = JSON.parse(stored);
          if (metadata.matchId === matchId) {
            return key;
          }
        } catch (error) {
          // Continue searching
        }
      }
    }
    return null;
  }
}

// Export singleton instance
export const replayManager = new ReplayManager();
