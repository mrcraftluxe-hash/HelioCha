// ========== ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ ==========
const currentUser = checkAuth();
if (!currentUser) {
    window.location.href = 'index.html';
}

// ========== НАЗВАНИЯ ТЕМ ==========
const THEME_NAMES = {
    'light-1': '☀️ Светлая 1',
    'light-2': '🌤️ Светлая 2',
    'light-3': '✨ Светлая 3',
    'dark-1': '🌑 Темная 1',
    'dark-2': '⚫ Темная 2',
    'dark-3': '🌃 Темная 3'
};

// ========== ЗАГРУЗКА ДАННЫХ ПРОФИЛЯ ==========
function loadProfile() {
    const avatar = document.getElementById('profileBigAvatar');
    const name = document.getElementById('profileDisplayName');
    const username = document.getElementById('profileDisplayUsername');
    const email = document.getElementById('profileDisplayEmail');
    const date = document.getElementById('profileDisplayDate');
    const userId = document.getElementById('profileDisplayId');
    
    if (avatar) {
        const savedAvatar = localStorage.getItem('avatar_' + currentUser.id);
        if (savedAvatar && savedAvatar.startsWith('data:image')) {
            avatar.innerHTML = '';
            avatar.style.backgroundImage = 'url(' + savedAvatar + ')';
            avatar.style.backgroundSize = 'cover';
            avatar.style.backgroundPosition = 'center';
            avatar.textContent = '';
        } else {
            avatar.innerHTML = currentUser.avatar || '😊';
            avatar.style.backgroundImage = 'none';
        }
    }
    
    if (name) name.textContent = currentUser.displayName || currentUser.username || 'Пользователь';
    
    if (username) {
        const userUsername = currentUser.userUsername || currentUser.username || '';
        username.textContent = userUsername ? '@' + userUsername : 'Не установлен';
    }
    
    if (email) email.textContent = currentUser.email || 'email@test.com';
    if (userId) userId.textContent = currentUser.id || 'ID не найден';
    
    if (date) {
        if (currentUser.createdAt) {
            date.textContent = new Date(currentUser.createdAt).toLocaleString();
        } else {
            date.textContent = new Date().toLocaleDateString();
        }
    }
    
    // загружаем название текущей темы
    updateCurrentThemeName();
    
    loadUserStats();
}

// ========== ОБНОВИТЬ НАЗВАНИЕ ТЕМЫ ==========
function updateCurrentThemeName() {
    const themeElement = document.getElementById('currentThemeName');
    if (!themeElement) return;
    
    const savedTheme = localStorage.getItem('helioTheme') || 'light-1';
    themeElement.textContent = THEME_NAMES[savedTheme] || 'Светлая';
}

// ========== ЗАГРУЗКА СТАТИСТИКИ ==========
function loadUserStats() {
    const messagesCount = document.getElementById('userMessagesCount');
    const channelsCount = document.getElementById('userChannelsCount');
    const giftsCount = document.getElementById('userGiftsCount');
    const friendsCount = document.getElementById('userFriendsCount');
    
    if (messagesCount) {
        try {
            const messages = JSON.parse(localStorage.getItem('helioMessages')) || [];
            const userMessages = messages.filter(m => m && (m.from === currentUser.id || m.to === currentUser.id));
            messagesCount.textContent = userMessages.length;
        } catch (e) {
            messagesCount.textContent = '0';
        }
    }
    
    if (channelsCount) {
        try {
            const channels = JSON.parse(localStorage.getItem('channels')) || [];
            const userChannels = channels.filter(ch => ch && ch.createdBy === currentUser.id);
            channelsCount.textContent = userChannels.length;
        } catch (e) {
            channelsCount.textContent = '0';
        }
    }
    
    if (giftsCount) {
        try {
            const gifts = JSON.parse(localStorage.getItem('receivedGifts_' + currentUser.id)) || [];
            giftsCount.textContent = gifts.length;
        } catch (e) {
            giftsCount.textContent = '0';
        }
    }
    
    if (friendsCount) {
        try {
            const chats = JSON.parse(localStorage.getItem('userChats_' + currentUser.id)) || [];
            const friends = chats.filter(ch => ch && ch.type === 'private');
            friendsCount.textContent = friends.length;
        } catch (e) {
            friendsCount.textContent = '0';
        }
    }
}

// ========== ВЫБОР АВАТАРКИ ==========
function changeAvatar() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'avatarModal';
    
    modal.innerHTML = `
        <div style="background:var(--bg-card); padding:24px; border-radius:16px; width:320px;">
            <h3 style="color:var(--text-primary); text-align:center; margin-bottom:20px;">🖼️ Выбери аватарку</h3>
            
            <div style="display:flex; gap:10px; margin-bottom:20px;">
                <button onclick="showEmojiPicker()" style="flex:1; padding:14px; background:var(--accent); border:none; color:white; border-radius:8px; cursor:pointer;">😊 Эмодзи</button>
                <button onclick="uploadFromGallery()" style="flex:1; padding:14px; background:var(--bg-element); border:none; color:var(--text-primary); border-radius:8px; cursor:pointer;">📷 Загрузить фото</button>
            </div>
            
            <div id="emojiGrid" style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px; max-height:300px; overflow-y:auto;"></div>
            
            <div id="uploadArea" style="display:none; margin-bottom:20px;">
                <input type="file" id="avatarUpload" accept="image/*" style="display:none;" onchange="handleImageUpload(this)">
                <div onclick="document.getElementById('avatarUpload').click()" style="background:var(--bg-element); padding:30px; border-radius:8px; text-align:center; border:2px dashed var(--accent); cursor:pointer;">
                    <div style="font-size:40px; margin-bottom:10px;">📸</div>
                    <div style="color:var(--text-secondary);">Нажми чтобы выбрать фото</div>
                </div>
            </div>
            
            <button onclick="closeModal()" style="width:100%; padding:14px; background:var(--bg-element); border:none; color:var(--text-primary); border-radius:8px; cursor:pointer;">Закрыть</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    showEmojiPicker();
}

// ========== ПОКАЗАТЬ ЭМОДЗИ ==========
function showEmojiPicker() {
    const grid = document.getElementById('emojiGrid');
    const upload = document.getElementById('uploadArea');
    if (!grid || !upload) return;
    
    grid.style.display = 'grid';
    upload.style.display = 'none';
    
    const emojis = ['😊', '😎', '🤓', '😺', '🐶', '🦊', '🐼', '🐧', '🐨', '🦁', '🐸', '🐙', '🦄', '🐲', '👽', '🤖'];
    
    let html = '';
    for (let i = 0; i < emojis.length; i++) {
        html += '<div onclick="selectAvatar(\'' + emojis[i] + '\')" style="width:60px; height:60px; background:var(--bg-element); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:32px; cursor:pointer; margin:5px;">' + emojis[i] + '</div>';
    }
    
    grid.innerHTML = html;
}

// ========== ПОКАЗАТЬ ЗАГРУЗКУ ФОТО ==========
function uploadFromGallery() {
    const grid = document.getElementById('emojiGrid');
    const upload = document.getElementById('uploadArea');
    if (!grid || !upload) return;
    
    grid.style.display = 'none';
    upload.style.display = 'block';
}

// ========== ОБРАБОТКА ЗАГРУЗКИ ФОТО ==========
function handleImageUpload(input) {
    if (!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
        alert('❌ Файл слишком большой! Максимум 5MB');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('❌ Можно загружать только изображения');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageData = e.target.result;
        saveAvatar(imageData);
    };
    
    reader.readAsDataURL(file);
}

// ========== СОХРАНИТЬ АВАТАРКУ ==========
function saveAvatar(imageData) {
    try {
        localStorage.setItem('avatar_' + currentUser.id, imageData);
        
        let users = JSON.parse(localStorage.getItem('helioUsers')) || [];
        
        for (let i = 0; i < users.length; i++) {
            if (users[i] && users[i].id === currentUser.id) {
                users[i].avatar = '📷';
                break;
            }
        }
        
        localStorage.setItem('helioUsers', JSON.stringify(users));
        currentUser.avatar = '📷';
        localStorage.setItem('helioCurrentUser', JSON.stringify(currentUser));
        
        const avatarDiv = document.getElementById('profileBigAvatar');
        avatarDiv.innerHTML = '';
        avatarDiv.style.backgroundImage = 'url(' + imageData + ')';
        avatarDiv.style.backgroundSize = 'cover';
        avatarDiv.style.backgroundPosition = 'center';
        
        closeModal();
        alert('✅ Аватарка обновлена!');
        
    } catch (e) {
        alert('Ошибка при сохранении');
    }
}

// ========== ВЫБОР АВАТАРА ЭМОДЗИ ==========
function selectAvatar(emoji) {
    try {
        localStorage.removeItem('avatar_' + currentUser.id);
        
        let users = JSON.parse(localStorage.getItem('helioUsers')) || [];
        
        for (let i = 0; i < users.length; i++) {
            if (users[i] && users[i].id === currentUser.id) {
                users[i].avatar = emoji;
                currentUser.avatar = emoji;
                break;
            }
        }
        
        localStorage.setItem('helioUsers', JSON.stringify(users));
        localStorage.setItem('helioCurrentUser', JSON.stringify(currentUser));
        
        const avatarDiv = document.getElementById('profileBigAvatar');
        avatarDiv.innerHTML = emoji;
        avatarDiv.style.backgroundImage = 'none';
        
        closeModal();
        
    } catch (e) {
        alert('Ошибка при выборе эмодзи');
    }
}

// ========== РЕДАКТИРОВАНИЕ ПРОФИЛЯ ==========
function editProfile() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'editModal';
    
    const currentUsername = currentUser.userUsername || currentUser.username || '';
    
    modal.innerHTML = `
        <div class="edit-profile-form" style="background:var(--bg-card); padding:24px; border-radius:16px; width:300px;">
            <h3 style="color:var(--text-primary); text-align:center; margin-bottom:20px;">✏️ Редактировать</h3>
            
            <div style="margin-bottom:15px;">
                <label style="display:block; color:var(--text-secondary); margin-bottom:5px;">Имя</label>
                <input type="text" id="editDisplayName" value="${currentUser.displayName || currentUser.username || ''}" style="width:100%; padding:14px; background:var(--bg-element); border:1px solid var(--border); border-radius:8px; color:var(--text-primary);">
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="display:block; color:var(--text-secondary); margin-bottom:5px;">Username</label>
                <div style="display:flex; background:var(--bg-element); border:1px solid var(--border); border-radius:8px; overflow:hidden;">
                    <span style="padding:14px; background:var(--accent); color:white;">@</span>
                    <input type="text" id="editUsername" value="${currentUsername}" style="flex:1; padding:14px; background:var(--bg-element); border:none; color:var(--text-primary);">
                </div>
            </div>
            
            <div style="margin-bottom:20px;">
                <label style="display:block; color:var(--text-secondary); margin-bottom:5px;">Email</label>
                <input type="email" id="editEmail" value="${currentUser.email || ''}" style="width:100%; padding:14px; background:var(--bg-element); border:1px solid var(--border); border-radius:8px; color:var(--text-primary);">
            </div>
            
            <div style="display:flex; gap:10px;">
                <button onclick="saveProfileChanges()" style="flex:1; padding:14px; background:var(--accent); border:none; color:white; border-radius:8px; cursor:pointer;">Сохранить</button>
                <button onclick="closeModal()" style="flex:1; padding:14px; background:var(--bg-element); border:none; color:var(--text-primary); border-radius:8px; cursor:pointer;">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ========== СОХРАНЕНИЕ ИЗМЕНЕНИЙ ==========
function saveProfileChanges() {
    const displayName = document.getElementById('editDisplayName');
    const username = document.getElementById('editUsername');
    const email = document.getElementById('editEmail');
    
    if (!displayName || !displayName.value.trim()) {
        alert('Введите имя');
        return;
    }
    
    try {
        let users = JSON.parse(localStorage.getItem('helioUsers')) || [];
        
        for (let i = 0; i < users.length; i++) {
            if (users[i] && users[i].id === currentUser.id) {
                users[i].displayName = displayName.value.trim();
                users[i].userUsername = username.value.trim().toLowerCase();
                users[i].email = email ? email.value : users[i].email;
                break;
            }
        }
        
        currentUser.displayName = displayName.value.trim();
        currentUser.userUsername = username.value.trim().toLowerCase();
        if (email) currentUser.email = email.value;
        
        localStorage.setItem('helioUsers', JSON.stringify(users));
        localStorage.setItem('helioCurrentUser', JSON.stringify(currentUser));
        
        document.getElementById('profileDisplayName').textContent = currentUser.displayName;
        document.getElementById('profileDisplayUsername').textContent = '@' + currentUser.userUsername;
        if (email) document.getElementById('profileDisplayEmail').textContent = currentUser.email;
        
        closeModal();
        alert('✅ Профиль обновлен');
        
    } catch (e) {
        alert('Ошибка при сохранении');
    }
}

// ========== КОПИРОВАТЬ ID ==========
function copyUserId() {
    const userId = document.getElementById('profileDisplayId').textContent;
    navigator.clipboard.writeText(userId);
    alert('✅ ID скопирован');
}

// ========== ОТКРЫТЬ КОНФИДЕНЦИАЛЬНОСТЬ ==========
function openPrivacy() {
    window.location.href = 'privacy.html';
}

// ========== ОТКРЫТЬ ТЕМЫ ==========
function openThemeMenu() {
    // проверяем что функция существует
    if (typeof window.openThemeMenu === 'function') {
        window.openThemeMenu();
    } else if (typeof openThemeMenuGlobal === 'function') {
        openThemeMenuGlobal();
    } else {
        // если функция не найдена, подключаем themes.js
        const script = document.createElement('script');
        script.src = 'themes.js';
        script.onload = function() {
            // после загрузки вызываем функцию
            setTimeout(() => {
                if (typeof window.openThemeMenu === 'function') {
                    window.openThemeMenu();
                } else {
                    alert('Ошибка загрузки темы');
                }
            }, 100);
        };
        document.body.appendChild(script);
    }
}

// ========== ПОКАЗАТЬ QR ==========
function showQRCode() {
    alert('📱 QR код будет позже');
}

// ========== НАЗАД ==========
function goBack() {
    window.location.href = 'chat.html';
}

// ========== ЗАКРЫТЬ МОДАЛКУ ==========
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    for (let i = 0; i < modals.length; i++) {
        modals[i].remove();
    }
}

// ========== ЗАГРУЗКА ==========
loadProfile();