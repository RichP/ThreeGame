"use strict";
/**
 * Series Management System
 *
 * Handles Best of 3 series tracking, match history, and quick rematch functionality.
 * Provides in-memory and localStorage persistence for series data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seriesManager = void 0;
class SeriesManager {
    constructor() {
        this.seriesHistory = [];
        this.currentSeries = null;
        this.STORAGE_KEY = 'threegame_series_history';
        this.MAX_HISTORY_SIZE = 20;
        this.loadFromStorage();
    }
    /**
     * Start a new Best of 3 series
     */
    startSeries(mapPresetId, playerNames) {
        this.endCurrentSeries();
        const series = {
            seriesId: this.generateSeriesId(),
            mode: 'BO3',
            mapPresetId,
            startTime: Date.now(),
            winner: null,
            matches: [],
            playerNames
        };
        this.currentSeries = series;
        this.saveToStorage();
        return series;
    }
    /**
     * Record the end of a match in the current series
     */
    recordMatchEnd(gameState, matchNumber) {
        if (!this.currentSeries)
            return null;
        const winner = this.determineMatchWinner(gameState);
        const matchSummary = {
            matchNumber,
            winner,
            turnsPlayed: gameState.matchStats.turnsPlayed,
            mapPresetId: gameState.config.mapPresetId,
            timestamp: Date.now(),
            matchStats: { ...gameState.matchStats }
        };
        const updatedSeries = {
            ...this.currentSeries,
            matches: [...this.currentSeries.matches, matchSummary],
            winner: this.determineSeriesWinner([...this.currentSeries.matches, matchSummary])
        };
        this.currentSeries = updatedSeries;
        this.saveToStorage();
        return updatedSeries;
    }
    /**
     * Get the current series if it exists
     */
    getCurrentSeries() {
        return this.currentSeries;
    }
    /**
     * Get recent series history
     */
    getSeriesHistory(limit = 10) {
        return this.seriesHistory
            .sort((a, b) => b.startTime - a.startTime)
            .slice(0, limit);
    }
    /**
     * Get quick rematch options based on recent series
     */
    getQuickRematchOptions() {
        const recentSeries = this.getSeriesHistory(1)[0];
        if (!recentSeries)
            return null;
        return {
            mapPresetId: recentSeries.mapPresetId,
            playerNames: recentSeries.playerNames
        };
    }
    /**
     * End the current series and move it to history
     */
    endCurrentSeries() {
        if (this.currentSeries) {
            const endedSeries = {
                ...this.currentSeries,
                endTime: Date.now()
            };
            this.seriesHistory = [endedSeries, ...this.seriesHistory]
                .slice(0, this.MAX_HISTORY_SIZE);
            this.currentSeries = null;
            this.saveToStorage();
        }
    }
    /**
     * Clear all series history
     */
    clearHistory() {
        this.seriesHistory = [];
        this.endCurrentSeries();
        localStorage.removeItem(this.STORAGE_KEY);
    }
    /**
     * Export series history for backup or analysis
     */
    exportHistory() {
        return JSON.stringify({
            exportVersion: '1.0',
            timestamp: Date.now(),
            seriesHistory: this.seriesHistory
        }, null, 2);
    }
    /**
     * Import series history from backup
     */
    importHistory(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.seriesHistory && Array.isArray(data.seriesHistory)) {
                this.seriesHistory = data.seriesHistory;
                this.saveToStorage();
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Failed to import series history:', error);
            return false;
        }
    }
    determineMatchWinner(gameState) {
        const p1Alive = gameState.units.some(u => u.playerId === 'p1' && u.health > 0);
        const p2Alive = gameState.units.some(u => u.playerId === 'p2' && u.health > 0);
        if (p1Alive && !p2Alive)
            return 'p1';
        if (p2Alive && !p1Alive)
            return 'p2';
        return 'draw';
    }
    determineSeriesWinner(matches) {
        const p1Wins = matches.filter(m => m.winner === 'p1').length;
        const p2Wins = matches.filter(m => m.winner === 'p2').length;
        if (p1Wins >= 2)
            return 'p1';
        if (p2Wins >= 2)
            return 'p2';
        return null;
    }
    generateSeriesId() {
        return `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                this.seriesHistory = data.seriesHistory || [];
            }
        }
        catch (error) {
            console.warn('Failed to load series history from localStorage:', error);
            this.seriesHistory = [];
        }
    }
    saveToStorage() {
        try {
            const data = {
                seriesHistory: this.seriesHistory
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        }
        catch (error) {
            console.warn('Failed to save series history to localStorage:', error);
        }
    }
}
// Export singleton instance
exports.seriesManager = new SeriesManager();
