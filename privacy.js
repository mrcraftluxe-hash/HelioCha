// Текущий пользователь
const currentUser = checkAuth();
if (!currentUser) {
    window.location.href = 'index.html';
}

// Загрузка настроек конфиденциальности
function loadPrivacySettings() {
    // Загружаем сохраненные настройки или используем значения по умолчанию
    const privacy = JSON.parse(localStorage.getItem('privacy_' + currentUser.id)) || {
        lastSeen: 'everyone', // everyone, contacts, nobody
        profilePhoto: 'everyone',
        bio: 'everyone',
        messages: 'everyone',
        gifts: 'everyone',
        calls: 'everyone',
        groups: 'everyone',
        channels: 'everyone',
        forwarding: 'everyone',
        blockedUsers: [],
        hiddenUsers: []
    };
    
    // Устанавливаем значения в интерфейсе
    document.getElementById('lastSeen').value = privacy.lastSeen || 'everyone';
    document.getElementById('profilePhoto').value = privacy.profilePhoto || 'everyone';
    document.getElementById('bio').value = privacy.bio || 'everyone';
    document.getElementById('messages').value = privacy.messages || 'everyone';
    document.getElementById('gifts').value = privacy.gifts || 'everyone';
    document.getElementById('calls').value = privacy.calls || 'everyone';
    document.getElementById('groups').value = privacy.groups || 'everyone';
    document.getElementById('channels').value = privacy.channels || 'everyone';
    document.getElementById('forwarding').value = privacy.forwarding || 'everyone';
    
    // Загружаем черный список
    loadBlockedUsers(privacy.blockedUsers || []);
    loadHiddenUsers(privacy.hiddenUsers || []);
}

// Сохранение настроек конфиденциальности
function savePrivacySettings() {
    const privacy = {
        lastSeen: document.getElementById('lastSeen').value,
        profilePhoto: document.getElementById('profilePhoto').value,
        bio: document.getElementById('bio').value,
        messages: document.getElementById('messages').value,
        gifts: document.getElementById('gifts').value,
        calls: document.getElementById('calls').value,
        groups: document.getElementById('groups').value,
        channels: document.getElementById('channels').value,
        forwarding: document.getElementById('forwarding').value,
        blockedUsers: getBlockedUsersList(),
        hiddenUsers: getHiddenUsersList()
    };
    
    localStorage.setItem('privacy_' + currentUser.id, JSON.stringify(privacy));
    alert('✅ Настройки конфиденциальности сохранены');
}

// Загрузка заблокированных пользователей
function loadBlockedUsers(blockedList) {
    const container = document.getElementById('blockedUsersList');
    if (!container) return;
    
    if (!blockedList || blockedList.length === 0) {
        container.innerHTML = '<div class="no-users">🚫 Нет заблокированных пользователей</div>';
        return;
    }
    
    try {
        const users = JSON.parse(localStorage.getItem('helioUsers')) || [];
        let html = '';
        
        for (let i = 0; i < blockedList.length; i++) {
            const userId = blockedList[i];
            const user = users.find(u => u && u.id === userId);
            
            if (user) {
                html += '<div class="blocked-user-item" id="blocked_' + user.id + '">';
                html += '<div class="user-avatar">' + (user.avatar || '👤') + '</div>';
                html += '<div class="user-info">';
                html += '<div class="user-name">' + (user.displayName || user.username || 'Пользователь') + '</div>';
                html += '<div class="user-username">@' + (user.userUsername || user.username || 'user') + '</div>';
                html += '</div>';
                html += '<button class="unblock-btn" onclick="unblockUser(' + user.id + ')">🔓 Разблокировать</button>';
                html += '</div>';
            }
        }
        
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = '<div class="no-users">🚫 Ошибка загрузки</div>';
    }
}

// Загрузка скрытых пользователей
function loadHiddenUsers(hiddenList) {
    const container = document.getElementById('hiddenUsersList');
    if (!container) return;
    
    if (!hiddenList || hiddenList.length === 0) {
        container.innerHTML = '<div class="no-users">👤 Нет скрытых пользователей</div>';
        return;
    }
    
    try {
        const users = JSON.parse(localStorage.getItem('helioUsers')) || [];
        let html = '';
        
        for (let i = 0; i < hiddenList.length; i++) {
            const userId = hiddenList[i];
            const user = users.find(u => u && u.id === userId);
            
            if (user) {
                html += '<div class="hidden-user-item" id="hidden_' + user.id + '">';
                html += '<div class="user-avatar">' + (user.avatar || '👤') + '</div>';
                html += '<div class="user-info">';
                html += '<div class="user-name">' + (user.displayName || user.username || 'Пользователь') + '</div>';
                html += '<div class="user-username">@' + (user.userUsername || user.username || 'user') + '</div>';
                html += '</div>';
                html += '<button class="unhide-btn" onclick="unhideUser(' + user.id + ')">👁️ Показать</button>';
                html += '</div>';
            }
        }
        
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = '<div class="no-users">👤 Ошибка загрузки</div>';
    }
}

// Получить список заблокированных
function getBlockedUsersList() {
    const privacy = JSON.parse(localStorage.getItem('privacy_' + currentUser.id)) || {};
    return privacy.blockedUsers || [];
}

// Получить список скрытых
function getHiddenUsersList() {
    const privacy = JSON.parse(localStorage.getItem('privacy_' + currentUser.id)) || {};
    return privacy.hiddenUsers || [];
}

// Блокировка пользователя
function blockUser() {
    showUserSearchModal('block');
}

// Разблокировка пользователя
function unblockUser(userId) {
    if (!confirm('Разблокировать этого пользователя?')) return;
    
    try {
        const privacy = JSON.parse(localStorage.getItem('privacy_' + currentUser.id)) || {
            lastSeen: 'everyone',
            profilePhoto: 'everyone',
            bio: 'everyone',
            messages: 'everyone',
            gifts: 'everyone',
            calls: 'everyone',
            groups: 'everyone',
            channels: 'everyone',
            forwarding: 'everyone',
            blockedUsers: [],
            hiddenUsers: []
        };
        
        privacy.blockedUsers = (privacy.blockedUsers || []).filter(id => id !== userId);
        localStorage.setItem('privacy_' + currentUser.id, JSON.stringify(privacy));
        
        // Удаляем из отображения
        const element = document.getElementById('blocked_' + userId);
        if (element) element.remove();
        
        // Если список пуст, показываем сообщение
        const container = document.getElementById('blockedUsersList');
        if (container && container.children.length === 0) {
            container.innerHTML = '<div class="no-users">🚫 Нет заблокированных пользователей</div>';
        }
        
        alert('✅ Пользователь разблокирован');
    } catch (e) {
        alert('Ошибка при разблокировке');
    }
}

// Скрыть пользователя
function hideUser() {
    showUserSearchModal('hide');
}

// Показать скрытого пользователя
function unhideUser(userId) {
    try {
        const privacy = JSON.parse(localStorage.getItem('privacy_' + currentUser.id)) || {
            lastSeen: 'everyone',
            profilePhoto: 'everyone',
            bio: 'everyone',
            messages: 'everyone',
            gifts: 'everyone',
            calls: 'everyone',
            groups: 'everyone',
            channels: 'everyone',
            forwarding: 'everyone',
            blockedUsers: [],
            hiddenUsers: []
        };
        
        privacy.hiddenUsers = (privacy.hiddenUsers || []).filter(id => id !== userId);
        localStorage.setItem('privacy_' + currentUser.id, JSON.stringify(privacy));
        
        // Удаляем из отображения
        const element = document.getElementById('hidden_' + userId);
        if (element) element.remove();
        
        // Если список пуст, показываем сообщение
        const container = document.getElementById('hiddenUsersList');
        if (container && container.children.length === 0) {
            container.innerHTML = '<div class="no-users">👤 Нет скрытых пользователей</div>';
        }
        
        alert('✅ Пользователь снова виден');
    } catch (e) {
        alert('Ошибка');
    }
}

// Показать модалку поиска пользователей
function showUserSearchModal(action) {
    try {
        const users = JSON.parse(localStorage.getItem('helioUsers')) || [];
        const privacy = JSON.parse(localStorage.getItem('privacy_' + currentUser.id)) || {
            blockedUsers: [],
            hiddenUsers: []
        };
        
        // Исключаем текущего пользователя и уже заблокированных/скрытых
        let availableUsers = users.filter(u => 
            u && u.id !== currentUser.id
        );
        
        if (action === 'block') {
            availableUsers = availableUsers.filter(u => !(privacy.blockedUsers || []).includes(u.id));
        } else {
            availableUsers = availableUsers.filter(u => !(privacy.hiddenUsers || []).includes(u.id));
        }
        
        if (availableUsers.length === 0) {
            alert('Нет доступных пользователей');
            return;
        }
        
        let usersHtml = '';
        for (let i = 0; i < availableUsers.length; i++) {
            const user = availableUsers[i];
            usersHtml += '<div class="user-select-item" onclick="' + (action === 'block' ? 'confirmBlockUser' : 'confirmHideUser') + '(' + user.id + ')">';
            usersHtml += '<div class="user-avatar">' + (user.avatar || '👤') + '</div>';
            usersHtml += '<div class="user-info">';
            usersHtml += '<div class="user-name">' + (user.displayName || user.username || 'Пользователь') + '</div>';
            usersHtml += '<div class="user-username">@' + (user.userUsername || user.username || 'user') + '</div>';
            usersHtml += '</div>';
            usersHtml += '</div>';
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="select-user-modal">
                <h3>${action === 'block' ? '🚫 Заблокировать пользователя' : '👤 Скрыть пользователя'}</h3>
                <div class="users-list-scroll">
                    ${usersHtml}
                </div>
                <button class="close-modal-btn" onclick="closeModal()">Отмена</button>
            </div>
        `;
        document.body.appendChild(modal);
    } catch (e) {
        alert('Ошибка загрузки пользователей');
    }
}

// Подтверждение блокировки
function confirmBlockUser(userId) {
    closeModal();
    
    try {
        const user = users.find(u => u && u.id === userId);
        if (!user) return;
        
        if (!confirm('Заблокировать пользователя ' + (user.displayName || user.username) + '? Он не сможет писать вам и видеть ваш профиль')) return;
        
        let privacy = JSON.parse(localStorage.getItem('privacy_' + currentUser.id)) || {
            lastSeen: 'everyone',
            profilePhoto: 'everyone',
            bio: 'everyone',
            messages: 'everyone',
            gifts: 'everyone',
            calls: 'everyone',
            groups: 'everyone',
            channels: 'everyone',
            forwarding: 'everyone',
            blockedUsers: [],
            hiddenUsers: []
        };
        
        if (!privacy.blockedUsers) privacy.blockedUsers = [];
        privacy.blockedUsers.push(userId);
        
        // Удаляем из скрытых если был там
        if (privacy.hiddenUsers) {
            privacy.hiddenUsers = privacy.hiddenUsers.filter(id => id !== userId);
        }
        
        localStorage.setItem('privacy_' + currentUser.id, JSON.stringify(privacy));
        
        alert('✅ Пользователь заблокирован');
        loadPrivacySettings();
    } catch (e) {
        alert('Ошибка при блокировке');
    }
}

// Подтверждение скрытия
function confirmHideUser(userId) {
    closeModal();
    
    try {
        const user = users.find(u => u && u.id === userId);
        if (!user) return;
        
        let privacy = JSON.parse(localStorage.getItem('privacy_' + currentUser.id)) || {
            lastSeen: 'everyone',
            profilePhoto: 'everyone',
            bio: 'everyone',
            messages: 'everyone',
            gifts: 'everyone',
            calls: 'everyone',
            groups: 'everyone',
            channels: 'everyone',
            forwarding: 'everyone',
            blockedUsers: [],
            hiddenUsers: []
        };
        
        if (!privacy.hiddenUsers) privacy.hiddenUsers = [];
        privacy.hiddenUsers.push(userId);
        
        localStorage.setItem('privacy_' + currentUser.id, JSON.stringify(privacy));
        
        alert('✅ Пользователь скрыт из поиска');
        loadPrivacySettings();
    } catch (e) {
        alert('Ошибка');
    }
}

// Очистить все настройки
function resetPrivacySettings() {
    if (!confirm('Сбросить все настройки конфиденциальности?')) return;
    
    const defaultPrivacy = {
        lastSeen: 'everyone',
        profilePhoto: 'everyone',
        bio: 'everyone',
        messages: 'everyone',
        gifts: 'everyone',
        calls: 'everyone',
        groups: 'everyone',
        channels: 'everyone',
        forwarding: 'everyone',
        blockedUsers: [],
        hiddenUsers: []
    };
    
    localStorage.setItem('privacy_' + currentUser.id, JSON.stringify(defaultPrivacy));
    alert('✅ Настройки сброшены');
    loadPrivacySettings();
}

// Назад
function goBack() {
    window.location.href = 'profile.html';
}

// Закрыть модальное окно
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    for (let i = 0; i < modals.length; i++) {
        modals[i].remove();
    }
}

// Загружаем при старте
loadPrivacySettings();