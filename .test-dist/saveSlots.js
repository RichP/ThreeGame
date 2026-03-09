"use strict";
/**
 * Manual Save Slots System
 *
 * Provides multiple named save slots for manual saving and loading,
 * with overwrite confirmation and delete functionality.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSlotManager = void 0;
class SaveSlotManager {
    constructor() {
        this.STORAGE_KEY_PREFIX = 'threegame_save_slot_';
        this.MAX_SLOTS = 10;
        this.DEFAULT_SLOT_NAMES = [
            'Quick Save 1', 'Quick Save 2', 'Quick Save 3',
            'Quick Save 4', 'Quick Save 5', 'Quick Save 6',
            'Quick Save 7', 'Quick Save 8', 'Quick Save 9', 'Quick Save 10'
        ];
        if (typeof localStorage !== 'undefined') {
            this.initializeDefaultSlots();
        }
    }
    /**
     * Save game state to a specific slot
     */
    saveToSlot(slotId, gameState, customName) {
        try {
            const existingSlot = this.getSlot(slotId);
            const name = customName || (existingSlot?.name) || this.getDefaultSlotName(slotId);
            const saveSlot = {
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
        }
        catch (error) {
            console.error('Failed to save to slot:', error);
            return false;
        }
    }
    /**
     * Load game state from a specific slot
     */
    loadFromSlot(slotId) {
        try {
            const stored = localStorage.getItem(this.getStorageKey(slotId));
            if (!stored)
                return null;
            const saveSlot = JSON.parse(stored);
            return saveSlot.gameState;
        }
        catch (error) {
            console.error('Failed to load from slot:', error);
            return null;
        }
    }
    /**
     * Get all save slot summaries
     */
    getAllSlotSummaries() {
        const summaries = [];
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
    getSlot(slotId) {
        try {
            const stored = localStorage.getItem(this.getStorageKey(slotId));
            if (!stored)
                return null;
            return JSON.parse(stored);
        }
        catch (error) {
            console.error('Failed to get slot:', error);
            return null;
        }
    }
    /**
     * Delete a save slot
     */
    deleteSlot(slotId) {
        try {
            localStorage.removeItem(this.getStorageKey(slotId));
            return true;
        }
        catch (error) {
            console.error('Failed to delete slot:', error);
            return false;
        }
    }
    /**
     * Rename a save slot
     */
    renameSlot(slotId, newName) {
        try {
            const slot = this.getSlot(slotId);
            if (!slot)
                return false;
            const updatedSlot = {
                ...slot,
                name: newName,
                timestamp: Date.now()
            };
            localStorage.setItem(this.getStorageKey(slotId), JSON.stringify(updatedSlot));
            return true;
        }
        catch (error) {
            console.error('Failed to rename slot:', error);
            return false;
        }
    }
    /**
     * Check if a slot exists
     */
    slotExists(slotId) {
        return localStorage.getItem(this.getStorageKey(slotId)) !== null;
    }
    /**
     * Get the number of used slots
     */
    getUsedSlotCount() {
        return this.getAllSlotSummaries().length;
    }
    /**
     * Get available slot IDs (empty slots)
     */
    getAvailableSlotIds() {
        const usedSlots = new Set(this.getAllSlotSummaries().map(s => s.slotId));
        const available = [];
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
    clearAllSlots() {
        try {
            for (let i = 1; i <= this.MAX_SLOTS; i++) {
                localStorage.removeItem(this.getStorageKey(`slot_${i}`));
            }
            return true;
        }
        catch (error) {
            console.error('Failed to clear all slots:', error);
            return false;
        }
    }
    /**
     * Export all save slots for backup
     */
    exportAllSlots() {
        const allSlots = {};
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
    importSlots(jsonString) {
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
        }
        catch (error) {
            console.error('Failed to import slots:', error);
            return false;
        }
    }
    /**
     * Get the next available slot ID for quick save
     */
    getNextAvailableSlotId() {
        const available = this.getAvailableSlotIds();
        return available.length > 0 ? available[0] : null;
    }
    /**
     * Quick save to the first available slot
     */
    quickSave(gameState) {
        const slotId = this.getNextAvailableSlotId();
        if (!slotId)
            return null;
        const success = this.saveToSlot(slotId, gameState);
        return success ? slotId : null;
    }
    initializeDefaultSlots() {
        // Ensure default slot names are set for empty slots
        for (let i = 1; i <= this.MAX_SLOTS; i++) {
            const slotId = `slot_${i}`;
            const key = this.getStorageKey(slotId);
            if (!localStorage.getItem(key)) {
                const defaultSlot = {
                    slotId,
                    name: this.getDefaultSlotName(slotId),
                    gameState: {}, // Empty placeholder
                    timestamp: 0,
                    mapPresetId: 'crossroads',
                    turn: 0,
                    currentPlayer: 'p1'
                };
                // Don't save empty slots, just ensure names are available
            }
        }
    }
    getStorageKey(slotId) {
        return `${this.STORAGE_KEY_PREFIX}${slotId}`;
    }
    getDefaultSlotName(slotId) {
        const match = slotId.match(/slot_(\d+)/);
        const index = match ? parseInt(match[1], 10) - 1 : 0;
        return this.DEFAULT_SLOT_NAMES[index] || `Save Slot ${index + 1}`;
    }
    isValidSaveSlot(obj) {
        return (obj &&
            typeof obj.slotId === 'string' &&
            typeof obj.name === 'string' &&
            typeof obj.timestamp === 'number' &&
            obj.gameState &&
            typeof obj.gameState === 'object');
    }
}
// Export singleton instance
exports.saveSlotManager = new SaveSlotManager();
