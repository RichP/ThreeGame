import React, { useState, useEffect } from 'react';

interface AnimationSettings {
  enabled: boolean;
  speed: number;
  quality: 'high' | 'medium' | 'low';
  intensity: number;
  cameraShake: boolean;
  particleEffects: boolean;
  statusEffects: boolean;
  /** When a unit is moving, keep showing movement highlights until the animation finishes. */
  keepMoveHighlightsDuringMove: boolean;
  /** If true, show only the path tiles during move animation; otherwise show all reachable move tiles. */
  showMovePathOnlyDuringMove: boolean;
}

interface AnimationSettingsProps {
  settings: AnimationSettings;
  onChange: (settings: AnimationSettings) => void;
  sfxMuted: boolean
  sfxVolume: number
  onSfxMutedChange: (muted: boolean) => void
  onSfxVolumeChange: (volume: number) => void
  isOpen: boolean
  onToggle: () => void
}

export const AnimationSettings: React.FC<AnimationSettingsProps> = ({
  settings,
  onChange,
  sfxMuted,
  sfxVolume,
  onSfxMutedChange,
  onSfxVolumeChange,
  isOpen,
  onToggle,
}) => {
  const handleToggle = (key: keyof AnimationSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const resetToDefaults = () => {
    onChange({
      enabled: true,
      speed: 1.0,
      quality: 'high',
      intensity: 1.0,
      cameraShake: true,
      particleEffects: true,
      statusEffects: true,
      keepMoveHighlightsDuringMove: true,
      showMovePathOnlyDuringMove: false,
    });
  };

  return (
    <div
      className="animation-settings"
      style={{
        // Keep all animation-settings UI above the WebGL canvas.
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        pointerEvents: 'none',
      }}
    >
      {isOpen && (
        <div
          className="settings-panel"
          style={{
            position: 'fixed',
            top: '80px', /* 60px + 80px navbar height */
            left: '20px',
            width: '280px',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            zIndex: 1100,
            color: '#e2e8f0',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700' }}>
              Animation Settings
            </div>
            <button
              onClick={onToggle}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '0',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              ×
            </button>
          </div>

          {/* Toggle animations */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleToggle('enabled', e.target.checked)}
              />
              Enable Animations
            </label>
          </div>

          {/* Animation speed */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>Animation Speed: {settings.speed.toFixed(1)}x</div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.speed}
              onChange={(e) => handleToggle('speed', parseFloat(e.target.value))}
              disabled={!settings.enabled}
              style={{ width: '100%' }}
            />
          </div>

          {/* Animation quality */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>Animation Quality</div>
            <select
              value={settings.quality}
              onChange={(e) => handleToggle('quality', e.target.value)}
              disabled={!settings.enabled}
              style={{
                width: '100%',
                background: '#0f172a',
                color: '#e2e8f0',
                border: '1px solid #334155',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px'
              }}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Visual intensity */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>Visual Intensity: {Math.round(settings.intensity * 100)}%</div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.intensity}
              onChange={(e) => handleToggle('intensity', parseFloat(e.target.value))}
              disabled={!settings.enabled}
              style={{ width: '100%' }}
            />
          </div>

          {/* Camera shake */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={settings.cameraShake}
                onChange={(e) => handleToggle('cameraShake', e.target.checked)}
                disabled={!settings.enabled}
              />
              Camera Shake
            </label>
          </div>

          {/* Particle effects */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={settings.particleEffects}
                onChange={(e) => handleToggle('particleEffects', e.target.checked)}
                disabled={!settings.enabled}
              />
              Particle Effects
            </label>
          </div>

          {/* Status effects */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={settings.statusEffects}
                onChange={(e) => handleToggle('statusEffects', e.target.checked)}
                disabled={!settings.enabled}
              />
              Status Effect Visuals
            </label>
          </div>

          {/* Move highlight behavior */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
              Move Highlights
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={settings.keepMoveHighlightsDuringMove}
                onChange={(e) => handleToggle('keepMoveHighlightsDuringMove', e.target.checked)}
                disabled={!settings.enabled}
              />
              Keep move highlights during move animation
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={settings.showMovePathOnlyDuringMove}
                onChange={(e) => handleToggle('showMovePathOnlyDuringMove', e.target.checked)}
                disabled={!settings.enabled || !settings.keepMoveHighlightsDuringMove}
              />
              Show path only (instead of all reachable squares)
            </label>
          </div>

          {/* SFX settings */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
              Sound Effects
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={!sfxMuted}
                onChange={(e) => onSfxMutedChange(!e.target.checked ? true : false)}
              />
              Enable SFX
            </label>

            <div style={{ fontSize: '12px', marginBottom: '4px', opacity: sfxMuted ? 0.6 : 1 }}>
              SFX Volume: {Math.round(sfxVolume * 100)}%
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVolume}
              onChange={(e) => onSfxVolumeChange(parseFloat(e.target.value))}
              disabled={sfxMuted}
              style={{ width: '100%' }}
            />
          </div>

          {/* Reset button */}
          <button
            onClick={resetToDefaults}
            style={{
              width: '100%',
              background: '#475569',
              color: '#e2e8f0',
              border: '1px solid #64748b',
              borderRadius: '4px',
              padding: '6px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
};

// Hook for managing animation settings
export const useAnimationSettings = () => {
  const [settings, setSettings] = useState<AnimationSettings>({
    enabled: true,
    speed: 1.0,
    quality: 'high',
    intensity: 1.0,
    cameraShake: true,
    particleEffects: true,
    statusEffects: true,
    keepMoveHighlightsDuringMove: true,
    showMovePathOnlyDuringMove: false,
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('threegame:animation-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch {
        // Use defaults if parsing fails
      }
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('threegame:animation-settings', JSON.stringify(settings));
  }, [settings]);

  return { settings, setSettings };
};

export default AnimationSettings;