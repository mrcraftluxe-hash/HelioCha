// App.js
import React from 'react';
import { ThemeProvider } from './ThemeContext';
import SettingsThemes from './SettingsThemes';
import './App.css';

const App = () => {
  return (
    <ThemeProvider>
      <div className="app">
        {/* Здесь твой основной интерфейс мессенджера */}
        <div className="chat-container">
          {/* Боковая панель с чатами */}
          <div className="sidebar">
            <div className="chat-list">
              {/* Список чатов будет использовать CSS-переменные */}
            </div>
          </div>
          
          {/* Основная область чата */}
          <div className="chat-area">
            <div className="chat-header">
              <h2>Название чата</h2>
              {/* Кнопка для открытия настроек */}
              <button className="button">Настройки</button>
            </div>
            
            {/* Область сообщений */}
            <div className="messages">
              <div className="message incoming">
                Привет! Как дела?
              </div>
              <div className="message outgoing">
                Отлично! А у тебя?
              </div>
            </div>
            
            {/* Поле ввода */}
            <div className="message-input">
              <input type="text" placeholder="Введите сообщение..." />
            </div>
          </div>
        </div>
        
        {/* Модальное окно с настройками тем */}
        <div className="settings-modal">
          <SettingsThemes />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;