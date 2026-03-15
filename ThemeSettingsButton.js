// ThemeSettingsButton.js
import React, { useState } from 'react';
import SettingsThemes from './SettingsThemes';

const ThemeSettingsButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="button secondary"
        onClick={() => setIsOpen(true)}
      >
        🎨 Сменить тему
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
            <SettingsThemes />
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeSettingsButton;