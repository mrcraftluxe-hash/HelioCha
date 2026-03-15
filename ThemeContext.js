// ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { themes, defaultTheme, getThemeById } from './themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Загружаем сохранённую тему из localStorage или берём по умолчанию
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedThemeId = localStorage.getItem('messenger-theme');
    return savedThemeId ? getThemeById(savedThemeId) : defaultTheme;
  });

  // Сохраняем тему в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('messenger-theme', currentTheme.id);
    
    // Применяем CSS-переменные к корневому элементу
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Добавляем класс темы для глобальных стилей
    document.body.className = `theme-${currentTheme.type}`;
  }, [currentTheme]);

  const changeTheme = (themeId) => {
    const newTheme = getThemeById(themeId);
    if (newTheme) {
      setCurrentTheme(newTheme);
    }
  };

  // Разделяем темы по типам для удобства
  const lightThemes = Object.values(themes).filter(t => t.type === 'light');
  const darkThemes = Object.values(themes).filter(t => t.type === 'dark');

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      changeTheme,
      lightThemes,
      darkThemes,
      themes: Object.values(themes)
    }}>
      {children}
    </ThemeContext.Provider>
  );
};