/**
 * Manual Save Slots System
 * 
 * Provides multiple named save slots for manual saving and loading,
 * with overwrite confirmation and delete functionality.
 */

import type { PersistedGameState } from './persistence'
import type { MapPresetId } from './config'

export interface SaveSlot {
  readonly slotId: string;
  readonly name: string;
  readonly gameState: PersistedGameState;
  readonly timestamp: number;
  readonly mapPresetId: MapPresetId;
  readonly turn: number;
  readonly currentPlayer: 'p1' | 'p2';
}

export interface SaveSlotSummary {
  readonly slotId: string;
  readonly name: string;
  readonly timestamp: number;
  readonly mapPresetId: MapPresetId;
  readonly turn: number;
  readonly currentPlayer: 'p1' | 'p2';
}

class SaveSlotManager {
  private readonly STORAGE_KEY_PREFIX = 'threegame_save_slot_';
  private readonly MAX_SLOTS = 10;
  private readonly DEFAULT_SLOT_NAMES = [
    'Quick Save 1', 'Quick Save 2', 'Quick Save 3',
    'Quick Save 4', 'Quick Save 5', 'Quick Save 6',
    'Quick Save 7', 'Quick Save 8', 'Quick Save 9', 'Quick Save 10'
  ];

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this.initializeDefaultSlots();
    }
  }

  /**
   * Save game state to a specific slot
   */
  saveToSlot(slotId: string, gameState: PersistedGameState, customName?: string): boolean {
    try {
      const existingSlot = this.getSlot(slotId);
      const name = customName || (existingSlot?.name) || this.getDefaultSlotName(slotId);
      
      const saveSlot: SaveSlot = {
        slotId,
        name,
        gameState,
        timestamp: Date.now(),
        mapPresetId: gameState.config.mapPresetId,
        turn: gameState.turn,
        currentPlayer: gameState.currentPlayer
      };

      localStorage.setItem(this.getStorageKey(slotId), JSON.stringify(saveSlot));
      return true;
    } catch (error) {
      console.error('Failed to save to slot:', error);
      return false;
    }
  }

  /**
   * Load game state from a specific slot
   */
  loadFromSlot(slotId: string): PersistedGameState | null {
    try {
      const stored = localStorage.getItem(this.getStorageKey(slotId));
      if (!stored) return null;

      const saveSlot: SaveSlot = JSON.parse(stored);
      return saveSlot.gameState;
    } catch (error) {
      console.error('Failed to load from slot:', error);
      return null;
    }
  }

  /**
   * Get all save slot summaries
   */
  getAllSlotSummaries(): SaveSlotSummary[] {
    const summaries: SaveSlotSummary[] = [];
    
    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      const slotId = `slot_${i}`;
      const slot = this.getSlot(slotId);
      if (slot) {
        summaries.push({
          slotId: slot.slotId,
          name: slot.name,
          timestamp: slot.timestamp,
          mapPresetId: slot.mapPresetId,
          turn: slot.turn,
          currentPlayer: slot.currentPlayer
        });
      }
    }

    return summaries.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get a specific save slot
   */
  getSlot(slotId: string): SaveSlot | null {
    try {
      const stored = localStorage.getItem(this.getStorageKey(slotId));
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to get slot:', error);
      return null;
    }
  }

  /**
   * Delete a save slot
   */
  deleteSlot(slotId: string): boolean {
    try {
      localStorage.removeItem(this.getStorageKey(slotId));
      return true;
    } catch (error) {
      console.error('Failed to delete slot:', error);
      return false;
    }
  }

  /**
   * Rename a save slot
   */
  renameSlot(slotId: string, newName: string): boolean {
    try {
      const slot = this.getSlot(slotId);
      if (!slot) return false;

      const updatedSlot: SaveSlot = {
        ...slot,
        name: newName,
        timestamp: Date.now()
      };

      localStorage.setItem(this.getStorageKey(slotId), JSON.stringify(updatedSlot));
      return true;
    } catch (error) {
      console.error('Failed to rename slot:', error);
      return false;
    }
  }

  /**
   * Check if a slot exists
   */
  slotExists(slotId: string): boolean {
    return localStorage.getItem(this.getStorageKey(slotId)) !== null;
  }

  /**
   * Get the number of used slots
   */
  getUsedSlotCount(): number {
    return this.getAllSlotSummaries().length;
  }

  /**
   * Get available slot IDs (empty slots)
   */
  getAvailableSlotIds(): string[] {
    const usedSlots = new Set(this.getAllSlotSummaries().map(s => s.slotId));
    const available: string[] = [];
    
    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      const slotId = `slot_${i}`;
      if (!usedSlots.has(slotId)) {
        available.push(slotId);
      }
    }
    
    return available;
  }

  /**
   * Clear all save slots
   */
  clearAllSlots(): boolean {
    try {
      for (let i = 1; i <= this.MAX_SLOTS; i++) {
        localStorage.removeItem(this.getStorageKey(`slot_${i}`));
      }
      return true;
    } catch (error) {
      console.error('Failed to clear all slots:', error);
      return false;
    }
  }

  /**
   * Export all save slots for backup
   */
  exportAllSlots(): string {
    const allSlots: Record<string, SaveSlot> = {};
    
    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      const slotId = `slot_${i}`;
      const slot = this.getSlot(slotId);
      if (slot) {
        allSlots[slotId] = slot;
      }
    }

    return JSON.stringify({
      exportVersion: '1.0',
      timestamp: Date.now(),
      slots: allSlots
    }, null, 2);
  }

  /**
   * Import save slots from backup
   */
  importSlots(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data.slots || typeof data.slots !== 'object') {
        return false;
      }

      // Clear existing slots first
      this.clearAllSlots();

      // Import new slots
      for (const [slotId, slot] of Object.entries(data.slots)) {
        if (this.isValidSaveSlot(slot)) {
          localStorage.setItem(this.getStorageKey(slotId), JSON.stringify(slot));
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to import slots:', error);
      return false;
    }
  }

  /**
   * Get the next available slot ID for quick save
   */
  getNextAvailableSlotId(): string | null {
    const available = this.getAvailableSlotIds();
    return available.length > 0 ? available[0] : null;
  }

  /**
   * Quick save to the first available slot
   */
  quickSave(gameState: PersistedGameState): string | null {
    const slotId = this.getNextAvailableSlotId();
    if (!slotId) return null;

    const success = this.saveToSlot(slotId, gameState);
    return success ? slotId : null;
  }

  private initializeDefaultSlots(): void {
    // Ensure default slot names are set for empty slots
    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      const slotId = `slot_${i}`;
      const key = this.getStorageKey(slotId);
      if (!localStorage.getItem(key)) {
        const defaultSlot: SaveSlot = {
          slotId,
          name: this.getDefaultSlotName(slotId),
          gameState: {} as PersistedGameState, // Empty placeholder
          timestamp: 0,
          mapPresetId: 'crossroads',
          turn: 0,
          currentPlayer: 'p1'
        };
        // Don't save empty slots, just ensure names are available
      }
    }
  }

  private getStorageKey(slotId: string): string {
    return `${this.STORAGE_KEY_PREFIX}${slotId}`;
  }

  private getDefaultSlotName(slotId: string): string {
    const match = slotId.match(/slot_(\d+)/);
    const index = match ? parseInt(match[1], 10) - 1 : 0;
    return this.DEFAULT_SLOT_NAMES[index] || `Save Slot ${index + 1}`;
  }

  private isValidSaveSlot(obj: any): obj is SaveSlot {
    return (
      obj &&
      typeof obj.slotId === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.timestamp === 'number' &&
      obj.gameState &&
      typeof obj.gameState === 'object'
    );
  }
}

// Export singleton instance
export const saveSlotManager = new SaveSlotManager();
