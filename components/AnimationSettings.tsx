import React, { useState, useEffect } from 'react';

interface AnimationSettings {
  enabled: boolean;
  speed: number;
  quality: 'high' | 'medium' | 'low';
  intensity: number;
  cameraShake: boolean;
  particleEffects: boolean;
  statusEffects: boolean;
}

interface AnimationSettingsProps {
  settings: AnimationSettings;
  onChange: (settings: AnimationSettings) => void;
}

export const AnimationSettings: React.FC<AnimationSettingsProps> = ({
  settings,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
    });
  };

  return (
    <div className="animation-settings">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="settings-toggle"
        style={{
          background: '#334155',
          color: '#e2e8f0',
          border: '1px solid #475569',
          padding: '8px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '600'
        }}
      >
        Animation Settings
      </button>

      {isOpen && (
        <div
          className="settings-panel"
          style={{
            position: 'fixed',
            top: '60px',
            right: '20px',
            width: '280px',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            color: '#e2e8f0'
          }}
        >
          <div style={{ marginBottom: '12px', fontWeight: '700', fontSize: '14px' }}>
            Animation Settings
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
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('threegame:animation-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
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