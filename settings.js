// ========== ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ ==========
const currentUser = checkAuth();
if (!currentUser) {
    window.location.href = 'index.html';
}

// ========== ЗАГРУЗКА НАСТРОЕК ==========
function loadSettings() {
    // загружаем сохраненные настройки
    const settings = JSON.parse(localStorage.getItem('settings_' + currentUser.id)) || {
        notifications: true,
        sounds: true,
        vibration: true,
        preview: true,
        autoSave: true,
        language: 'ru',
        theme: 'dark',
        fontSize: 'medium',
        enterSend: true
    };
    
    // устанавливаем значения
    document.getElementById('notifications').checked = settings.notifications;
    document.getElementById('sounds').checked = settings.sounds;
    document.getElementById('vibration').checked = settings.vibration;
    document.getElementById('preview').checked = settings.preview;
    document.getElementById('autoSave').checked = settings.autoSave;
    document.getElementById('language').value = settings.language;
    document.getElementById('theme').value = settings.theme;
    document.getElementById('fontSize').value = settings.fontSize;
    document.getElementById('enterSend').checked = settings.enterSend;
}

// ========== СОХРАНЕНИЕ НАСТРОЕК ==========
function saveSettings() {
    const settings = {
        notifications: document.getElementById('notifications').checked,
        sounds: document.getElementById('sounds').checked,
        vibration: document.getElementById('vibration').checked,
        preview: document.getElementById('preview').checked,
        autoSave: document.getElementById('autoSave').checked,
        language: document.getElementById('language').value,
        theme: document.getElementById('theme').value,
        fontSize: document.getElementById('fontSize').value,
        enterSend: document.getElementById('enterSend').checked
    };
    
    localStorage.setItem('settings_' + currentUser.id, JSON.stringify(settings));
    
    // применяем настройки
    applySettings(settings);
    
    alert('✅ Настройки сохранены');
}

// ========== ПРИМЕНЕНИЕ НАСТРОЕК ==========
function applySettings(settings) {
    // тема
    if (settings.theme === 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }
    
    // размер шрифта
    const root = document.documentElement;
    if (settings.fontSize === 'small') {
        root.style.fontSize = '14px';
    } else if (settings.fontSize === 'medium') {
        root.style.fontSize = '16px';
    } else if (settings.fontSize === 'large') {
        root.style.fontSize = '18px';
    }
    
    // язык (заглушка)
    console.log('Язык:', settings.language);
}

// ========== СБРОС НАСТРОЕК ==========
function resetSettings() {
    if (confirm('Сбросить все настройки?')) {
        localStorage.removeItem('settings_' + currentUser.id);
        loadSettings();
        alert('✅ Настройки сброшены');
    }
}

// ========== ОЧИСТКА ДАННЫХ ==========
function clearAllData() {
    if (confirm('⚠️ Это удалит все чаты и сообщения! Продолжить?')) {
        // удаляем сообщения
        localStorage.removeItem('helioMessages');
        
        // удаляем чаты пользователя
        localStorage.removeItem('userChats_' + currentUser.id);
        
        // удаляем подарки
        localStorage.removeItem('receivedGifts_' + currentUser.id);
        localStorage.removeItem('sentGifts_' + currentUser.id);
        
        alert('✅ Все данные очищены');
        window.location.href = 'chat.html';
    }
}

// ========== УДАЛЕНИЕ АККАУНТА ==========
function deleteAccount() {
    if (confirm('⚠️⚠️⚠️ ЭТО УДАЛИТ ТВОЙ АККАУНТ НАВСЕГДА!\n\nТы уверен?')) {
        
        if (confirm('Последнее предупреждение! Все данные будут потеряны.')) {
            
            let users = JSON.parse(localStorage.getItem('helioUsers')) || [];
            users = users.filter(u => u.id !== currentUser.id);
            localStorage.setItem('helioUsers', JSON.stringify(users));
            
            // удаляем все данные пользователя
            localStorage.removeItem('helioCurrentUser');
            localStorage.removeItem('crystals_' + currentUser.id);
            localStorage.removeItem('avatar_' + currentUser.id);
            localStorage.removeItem('settings_' + currentUser.id);
            localStorage.removeItem('userChats_' + currentUser.id);
            localStorage.removeItem('receivedGifts_' + currentUser.id);
            localStorage.removeItem('sentGifts_' + currentUser.id);
            
            alert('😢 Аккаунт удален');
            window.location.href = 'index.html';
        }
    }
}

// ========== НАЗАД ==========
function goBack() {
    window.location.href = 'profile.html';
}

// ========== ЗАГРУЗКА ==========
loadSettings();
