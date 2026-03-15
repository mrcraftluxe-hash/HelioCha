// SettingsThemes.js
import React from 'react';
import { useTheme } from './ThemeContext';
import './SettingsThemes.css';

const SettingsThemes = () => {
  const { currentTheme, changeTheme, lightThemes, darkThemes } = useTheme();

  const ThemeCard = ({ theme }) => (
    <div 
      className={`theme-card ${currentTheme.id === theme.id ? 'active' : ''}`}
      onClick={() => changeTheme(theme.id)}
      style={{
        '--preview-primary': theme.colors.primary,
        '--preview-background': theme.colors.background,
        '--preview-surface': theme.colors.surface,
        '--preview-text': theme.colors.text,
        '--preview-message-out': theme.colors.messageOut,
        '--preview-message-in': theme.colors.messageIn,
      }}
    >
      <div className="theme-preview">
        <div className="preview-header" style={{ backgroundColor: theme.colors.surface }}>
          <span style={{ color: theme.colors.text }}>{theme.name}</span>
        </div>
        <div className="preview-chat">
          <div className="preview-message outgoing" style={{ backgroundColor: theme.colors.messageOut }}>
            <span style={{ color: theme.colors.messageOutText }}>Привет!</span>
          </div>
          <div className="preview-message incoming" style={{ backgroundColor: theme.colors.messageIn }}>
            <span style={{ color: theme.colors.messageInText }}>Как дела?</span>
          </div>
        </div>
      </div>
      <div className="theme-name">{theme.name}</div>
      {currentTheme.id === theme.id && (
        <div className="theme-check">✓</div>
      )}
    </div>
  );

  const ThemeSection = ({ title, themes }) => (
    <div className="theme-section">
      <h3>{title}</h3>
      <div className="themes-grid">
        {themes.map(theme => (
          <ThemeCard key={theme.id} theme={theme} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="settings-themes">
      <h2>Настройки темы</h2>
      <p className="theme-description">
        Выберите один из 6 вариантов оформления: 3 светлых и 3 тёмных темы
      </p>
      
      <ThemeSection title="Светлые темы" themes={lightThemes} />
      <ThemeSection title="Тёмные темы" themes={darkThemes} />
    </div>
  );
};

export default SettingsThemes;