import React from 'react';
import { useTheme, themes } from './ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, themeNames } = useTheme();

  return (
    <div className="theme-switcher">
      <label htmlFor="theme-select" className="theme-label">
        Theme
      </label>
      <select
        id="theme-select"
        value={theme.name}
        onChange={(e) => setTheme(e.target.value)}
        className="theme-select"
      >
        {themeNames.map((name) => (
          <option key={name} value={name}>
            {themes[name].name}
          </option>
        ))}
      </select>
      <style jsx>{`
        .theme-switcher {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .theme-label {
          font-size: 12px;
          font-weight: 600;
          color: #8aa0ff;
          text-transform: uppercase;
        }

        .theme-select {
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          font-size: 14px;
          border-radius: 8px;
          cursor: pointer;
          outline: none;
        }

        .theme-select:focus {
          border-color: #8aa0ff;
          box-shadow: 0 0 0 3px rgba(138, 166, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ThemeSwitcher;