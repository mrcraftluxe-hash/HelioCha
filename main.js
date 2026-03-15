// ========== ПРОВЕРКА АВТОРИЗАЦИИ ==========
const currentUser = checkAuth();
if (!currentUser) {
    window.location.href = 'index.html';
}

// ========== БАЗА USERNAME ДЛЯ БЕСКОНЕЧНЫХ КРИСТАЛЛОВ ==========
const INFINITE_CRYSTALS_USERNAMES = [
    'mrcraftluxeyt', 'admin', 'yourusername', 'test'
];

// ========== БАЗА USERNAME ДЛЯ VIP СТАТУСА ==========
const VIP_USERNAMES = [
    'mrcraftluxeyt', 'premium', 'danya', 'yourusername'
];

// ========== ФУНКЦИИ ДЛЯ USERNAME ==========
function getCurrentUsername() {
    if (!currentUser) return '';
    return (currentUser.userUsername || currentUser.username || '').toLowerCase();
}

function hasInfiniteCrystals() {
    if (!currentUser) return false;
    const username = getCurrentUsername();
    return INFINITE_CRYSTALS_USERNAMES.includes(username);
}

function hasVipStatus() {
    if (!currentUser) return false;
    const username = getCurrentUsername();
    return VIP_USERNAMES.includes(username);
}

function getCrystalBalance() {
    if (!currentUser) return 0;
    if (hasInfiniteCrystals()) return '∞';
    try {
        const crystals = localStorage.getItem('crystals_' + currentUser.id);
        return crystals ? parseInt(crystals) : 0;
    } catch (e) {
        return 0;
    }
}

// ========== ДАННЫЕ ==========
let messages = [];
let users = [];

// ========== ЗАГРУЗКА ДАННЫХ ==========
function loadData() {
    try {
        const storedMessages = localStorage.getItem('helioMessages');
        const storedUsers = localStorage.getItem('helioUsers');
        
        messages = storedMessages ? JSON.parse(storedMessages) : [];
        users = storedUsers ? JSON.parse(storedUsers) : [];
    } catch (e) {
        messages = [];
        users = [];
    }
}

// ========== ЗАГРУЗКА СПИСКА ВСЕХ ПОЛЬЗОВАТЕЛЕЙ ==========
function loadAllUsers() {
    console.log('loadAllUsers запущена');
    
    const chatsList = document.getElementById('chatsList');
    if (!chatsList) {
        console.log('chatsList не найден');
        return;
    }
    
    loadData();
    
    if (!currentUser) {
        console.log('нет currentUser');
        return;
    }
    
    console.log('users:', users);
    
    const otherUsers = [];
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (user && user.id !== currentUser.id && user.id !== 'ai_assistant') {
            otherUsers.push(user);
        }
    }
    
    console.log('otherUsers:', otherUsers);
    
    if (otherUsers.length === 0) {
        chatsList.innerHTML = '<div style="text-align:center; padding:40px; color:#8899aa;">👥 нет других пользователей</div>';
        return;
    }
    
    let html = '';
    
    for (let i = 0; i < otherUsers.length; i++) {
        const user = otherUsers[i];
        if (!user) continue;
        
        const displayName = user.displayName || user.name || user.username || 'Пользователь';
        const avatar = user.avatar || '😊';
        const usernameText = user.userUsername ? '@' + user.userUsername : '';
        
        html += '<div class="chat-item" onclick="openChat(' + user.id + ')">';
        html += '<div class="chat-avatar">' + avatar + '</div>';
        html += '<div class="chat-info">';
        html += '<div class="chat-title">' + displayName + '</div>';
        if (usernameText) {
            html += '<div class="chat-username">' + usernameText + '</div>';
        }
        html += '<div class="chat-preview">Нажми чтобы начать чат</div>';
        html += '</div>';
        html += '<div class="chat-meta">';
        html += '<div class="chat-time"></div>';
        html += '</div>';
        html += '</div>';
    }
    
    chatsList.innerHTML = html;
    console.log('чаты загружены');
}

// ========== ПОИСК ПОЛЬЗОВАТЕЛЕЙ ==========
function searchUsers() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    
    const query = input.value.trim().toLowerCase();
    
    if (!query) {
        loadAllUsers();
        return;
    }
    
    loadData();
    
    if (!currentUser) return;
    
    const foundUsers = [];
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (!user || user.id === currentUser.id || user.id === 'ai_assistant') continue;
        
        const name = (user.displayName || user.name || user.username || '').toLowerCase();
        const username = (user.userUsername || '').toLowerCase();
        const phone = (user.phone || '').toLowerCase();
        
        if (name.includes(query) || username.includes(query) || phone.includes(query)) {
            foundUsers.push(user);
        }
    }
    
    const chatsList = document.getElementById('chatsList');
    if (!chatsList) return;
    
    if (foundUsers.length === 0) {
        chatsList.innerHTML = '<div style="text-align:center; padding:40px; color:#8899aa;">🔍 ничего не найдено</div>';
        return;
    }
    
    let html = '<div style="padding:8px 12px; color:#2b5278; font-size:13px;">🔍 Найдено: ' + foundUsers.length + '</div>';
    
    for (let i = 0; i < foundUsers.length; i++) {
        const user = foundUsers[i];
        
        let hasMessages = false;
        for (let j = 0; j < messages.length; j++) {
            const m = messages[j];
            if (m && ((m.from === currentUser.id && m.to === user.id) || 
                      (m.from === user.id && m.to === currentUser.id))) {
                hasMessages = true;
                break;
            }
        }
        
        const usernameText = user.userUsername ? '@' + user.userUsername : '';
        const phoneText = user.phone ? '📞 ' + user.phone : '';
        const displayName = user.displayName || user.name || user.username || 'Пользователь';
        
        // ВАЖНО: используем onclick с правильным id
        html += '<div class="search-result-item" onclick="openChat(' + user.id + ')">';
        html += '<div class="search-avatar">' + (user.avatar || '👤') + '</div>';
        html += '<div class="search-info">';
        html += '<div class="search-name">' + displayName + '</div>';
        if (usernameText) {
            html += '<div class="search-username">' + usernameText + '</div>';
        }
        if (phoneText && !usernameText) {
            html += '<div class="search-phone">' + phoneText + '</div>';
        }
        html += '</div>';
        if (hasMessages) {
            html += '<div class="search-badge">чат есть</div>';
        } else {
            html += '<div class="search-badge new">+ начать</div>';
        }
        html += '</div>';
    }
    
    chatsList.innerHTML = html;
}

// ========== ОТКРЫТЬ ЧАТ ==========
function openChat(userId) {
    console.log('openChat вызван с userId:', userId);
    
    if (userId) {
        localStorage.setItem('activeChat', userId);
        window.location.href = 'messages.html';
    } else {
        console.log('userId не передан');
    }
}

// ========== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ==========
function switchTab(tab) {
    const chatsTab = document.querySelector('.tab-btn-chat');
    const channelsTab = document.querySelector('.tab-btn-channel');
    const chatsList = document.getElementById('chatsList');
    const channelsList = document.getElementById('channelsList');
    const searchInput = document.getElementById('searchInput');
    
    if (!chatsTab || !channelsTab || !chatsList || !channelsList) return;
    
    if (tab === 'chats') {
        chatsTab.classList.add('active');
        channelsTab.classList.remove('active');
        chatsList.style.display = 'block';
        channelsList.style.display = 'none';
        
        if (searchInput) {
            searchInput.placeholder = '🔍 Поиск пользователей...';
            searchInput.value = '';
        }
        
        loadAllUsers();
    } else {
        channelsTab.classList.add('active');
        chatsTab.classList.remove('active');
        channelsList.style.display = 'block';
        chatsList.style.display = 'none';
        
        if (searchInput) {
            searchInput.placeholder = '🔍 Поиск каналов...';
            searchInput.value = '';
        }
        
        loadChannels();
    }
}

// ========== ЗАГРУЗКА КАНАЛОВ ==========
function loadChannels() {
    const channelsList = document.getElementById('channelsList');
    if (!channelsList) return;
    
    try {
        const channels = JSON.parse(localStorage.getItem('channels')) || [];
        
        if (channels.length === 0) {
            channelsList.innerHTML = '<div style="text-align:center; padding:40px; color:#8899aa;">📢 нет каналов</div>';
            return;
        }
        
        let html = '';
        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];
            if (!channel) continue;
            
            html += '<div class="channel-item" onclick="openChannel(\'' + channel.id + '\')">';
            html += '<div class="channel-avatar">' + (channel.avatar || '📢') + '</div>';
            html += '<div class="channel-info">';
            html += '<div class="channel-name">' + (channel.name || 'Канал') + '</div>';
            if (channel.username) {
                html += '<div class="channel-username">@' + channel.username + '</div>';
            }
            html += '<div class="channel-desc">' + (channel.description || 'Без описания') + '</div>';
            html += '</div>';
            html += '<div class="channel-meta">📢</div>';
            html += '</div>';
        }
        
        channelsList.innerHTML = html;
    } catch (e) {
        channelsList.innerHTML = '<div style="text-align:center; padding:40px; color:#8899aa;">ошибка загрузки</div>';
    }
}

// ========== ОТКРЫТЬ КАНАЛ ==========
function openChannel(channelId) {
    if (channelId) {
        localStorage.setItem('activeChannel', channelId);
        window.location.href = 'channel.html';
    }
}

// ========== ОСТАЛЬНЫЕ ФУНКЦИИ ==========
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    
    if (menu) {
        menu.classList.toggle('open');
    }
    if (overlay) {
        overlay.classList.toggle('show');
    }
}

function closeMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    
    if (menu) {
        menu.classList.remove('open');
    }
    if (overlay) {
        overlay.classList.remove('show');
    }
}

function openCrystals() {
    closeMenu();
    alert('💎 Кристаллы (скоро)');
}

function openVIP() {
    closeMenu();
    alert('⭐ VIP (скоро)');
}

function openSettings() {
    closeMenu();
    alert('⚙️ Настройки (скоро)');
}

function openHelp() {
    closeMenu();
    alert('❓ Помощь (скоро)');
}

function showCreateOptions() {
    closeMenu();
    alert('➕ Создать (скоро)');
}

function logout() {
    localStorage.removeItem('helioCurrentUser');
    window.location.href = 'index.html';
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    for (let i = 0; i < modals.length; i++) {
        modals[i].remove();
    }
}

function updateCrystalDisplay() {
    const badge = document.getElementById('crystalBalance');
    if (badge) {
        badge.textContent = getCrystalBalance();
    }
    
    const vipBadge = document.getElementById('vipStatus');
    if (vipBadge) {
        if (hasInfiniteCrystals()) {
            vipBadge.textContent = 'Есть';
        } else if (hasVipStatus()) {
            vipBadge.textContent = '⭐';
        } else {
            vipBadge.textContent = 'Нет';
        }
    }
}

// ========== ЗАПУСК ==========
loadData();
loadAllUsers();
loadChannels();

const chatsList = document.getElementById('chatsList');
const channelsList = document.getElementById('channelsList');
if (chatsList && channelsList) {
    chatsList.style.display = 'block';
    channelsList.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchUsers);
        searchInput.placeholder = '🔍 Поиск пользователей...';
    }
});

setInterval(() => {
    loadData();
    const activeTab = document.querySelector('.tab-btn-chat.active');
    const searchInput = document.getElementById('searchInput');
    
    if (activeTab && activeTab.textContent.includes('Чаты')) {
        if (searchInput && searchInput.value.trim()) {
            searchUsers();
        } else {
            loadAllUsers();
        }
    } else {
        loadChannels();
    }
}, 3000);

setInterval(updateCrystalDisplay, 1000);

// ========== ОТКРЫТЬ ПОДАРКИ ==========
function openGifts() {
    closeMenu();
    window.location.href = 'gift.html';
}

// ========== ОТКРЫТЬ КРИСТАЛЛЫ (ОКНО) ==========
function openCrystals() {
    closeMenu();
    
    const balance = getCrystalBalance();
    const infinite = hasInfiniteCrystals();
    const username = getCurrentUsername();
    
    let html = `
        <div style="background: var(--bg-card); padding: 24px; border-radius: 24px; width: 300px; max-width: 90%;">
            <h3 style="color: var(--text-primary); text-align: center; margin-bottom: 20px; font-size: 22px;">💎 Кристаллы</h3>
            
            <div style="background: var(--bg-element); padding: 20px; border-radius: 20px; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px;">
                <span style="font-size: 32px;">💎</span>
                <span style="font-size: 36px; font-weight: bold; color: var(--accent);">${balance}</span>
            </div>
    `;
    
    if (infinite) {
        html += `
            <div style="background: linear-gradient(135deg, #2b5278, #1f3e5c); padding: 16px; border-radius: 16px; text-align: center; margin-bottom: 20px; color: white;">
                <span style="font-size: 20px;">✨ Бесконечные кристаллы</span><br>
                <span style="font-size: 13px; opacity: 0.9;">@${username}</span>
            </div>
        `;
    } else {
        html += `
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                <div onclick="buyCrystals(100)" style="background: var(--bg-element); padding: 16px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border: 1px solid var(--border);">
                    <span style="font-weight: bold;">100 💎</span>
                    <span style="color: var(--accent); font-weight: bold;">99₽</span>
                </div>
                <div onclick="buyCrystals(500)" style="background: var(--bg-element); padding: 16px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border: 1px solid var(--border);">
                    <span style="font-weight: bold;">500 💎</span>
                    <span style="color: var(--accent); font-weight: bold;">399₽</span>
                </div>
                <div onclick="buyCrystals(1000)" style="background: var(--bg-element); padding: 16px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border: 1px solid var(--border);">
                    <span style="font-weight: bold;">1000 💎</span>
                    <span style="color: var(--accent); font-weight: bold;">699₽</span>
                </div>
                <div onclick="buyCrystals(5000)" style="background: linear-gradient(135deg, #ffd700, #ffaa00); padding: 16px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border: 2px solid #ffd700;">
                    <span style="font-weight: bold;">5000 💎</span>
                    <span style="color: #000; font-weight: bold;">2999₽</span>
                    <span style="background: #000; color: #ffd700; padding: 4px 10px; border-radius: 20px; font-size: 11px;">VIP</span>
                </div>
            </div>
        `;
    }
    
    html += `
            <div style="display: flex; gap: 10px;">
                <button onclick="window.location.href='gift.html'" style="flex: 1; padding: 14px; background: var(--accent); border: none; color: white; border-radius: 16px; cursor: pointer; font-weight: 600;">🎁 Подарки</button>
                <button onclick="closeModal()" style="flex: 1; padding: 14px; background: var(--bg-element); border: 1px solid var(--border); color: var(--text-primary); border-radius: 16px; cursor: pointer;">Закрыть</button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

// ========== КУПИТЬ КРИСТАЛЛЫ ==========
function buyCrystals(amount) {
    if (hasInfiniteCrystals()) {
        alert('✨ У тебя уже бесконечные кристаллы!');
        return;
    }
    
    alert(`✅ Покупка ${amount} кристаллов`);
    
    const current = getCrystalBalance();
    if (typeof current === 'number') {
        localStorage.setItem('crystals_' + currentUser.id, current + amount);
        closeModal();
        openCrystals();
    }
}

// ========== ОТКРЫТЬ VIP (ОКНО) ==========
function openVIP() {
    closeMenu();
    
    const isVip = hasVipStatus();
    const infinite = hasInfiniteCrystals();
    const username = getCurrentUsername();
    
    let status = 'Нет VIP';
    let statusColor = '#f44336';
    let statusBg = 'rgba(244, 67, 54, 0.1)';
    
    if (infinite) {
        status = 'VIP активен 👑';
        statusColor = '#ffd700';
        statusBg = 'rgba(43, 82, 120, 0.2)';
    } else if (isVip) {
        status = 'VIP активен 👑';
        statusColor = '#ffd700';
        statusBg = 'rgba(255, 215, 0, 0.2)';
    }
    
    let html = `
        <div style="background: var(--bg-card); padding: 24px; border-radius: 24px; width: 300px; max-width: 90%;">
            <h3 style="color: var(--text-primary); text-align: center; margin-bottom: 20px; font-size: 22px;">⭐ VIP Статус</h3>
            
            <div style="background: ${statusBg}; padding: 20px; border-radius: 20px; text-align: center; margin-bottom: 20px; border-left: 4px solid ${statusColor};">
                <div style="color: var(--text-secondary); font-size: 13px; margin-bottom: 5px;">Текущий статус</div>
                <div style="font-size: 20px; font-weight: bold; color: ${statusColor};">${status}</div>
                ${username ? '<div style="font-size: 12px; color: var(--accent); margin-top: 8px;">@' + username + '</div>' : ''}
            </div>
    `;
    
    if (!isVip && !infinite) {
        html += `
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                <div onclick="buyVIP('month')" style="background: var(--bg-element); padding: 18px; border-radius: 16px; cursor: pointer; border: 1px solid var(--border);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-weight: bold;">VIP на месяц</span>
                        <span style="color: var(--accent); font-weight: bold;">199₽</span>
                    </div>
                    <div style="color: var(--text-secondary); font-size: 13px;">✅ Без рекламы</div>
                    <div style="color: var(--text-secondary); font-size: 13px;">✅ Стикеры</div>
                    <div style="color: var(--text-secondary); font-size: 13px;">✅ Синий ник</div>
                </div>
                
                <div onclick="buyVIP('year')" style="background: linear-gradient(135deg, #ffd70015, #ffaa0015); padding: 18px; border-radius: 16px; cursor: pointer; border: 2px solid #ffd700;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-weight: bold;">VIP на год</span>
                        <span style="color: #ffd700; font-weight: bold;">999₽</span>
                    </div>
                    <div style="color: var(--text-secondary); font-size: 13px;">✅ Всё из месяца</div>
                    <div style="color: var(--text-secondary); font-size: 13px;">✅ Золотой ник</div>
                    <div style="color: var(--text-secondary); font-size: 13px;">✅ 1000 кристаллов</div>
                </div>
            </div>
        `;
    } else {
        html += `
            <div style="background: var(--bg-element); padding: 18px; border-radius: 16px; margin-bottom: 20px;">
                <div style="color: var(--text-secondary); margin-bottom: 12px; font-size: 14px;">🔥 Доступно:</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: var(--accent);">✓</span> Без рекламы
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: var(--accent);">✓</span> Эксклюзивные стикеры
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: var(--accent);">✓</span> Цветной ник
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: var(--accent);">✓</span> 2x кристаллы
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `
            <button onclick="closeModal()" style="width: 100%; padding: 16px; background: var(--accent); border: none; color: white; border-radius: 16px; cursor: pointer; font-weight: 600;">Закрыть</button>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

// ========== КУПИТЬ VIP ==========
function buyVIP(period) {
    if (hasVipStatus() || hasInfiniteCrystals()) {
        alert('✨ У тебя уже есть VIP!');
        return;
    }
    
    if (period === 'month') {
        alert('✅ VIP на месяц куплен!');
    } else {
        alert('✅ VIP на год куплен!');
    }
    closeModal();
}

// ========== ПОКАЗАТЬ ОПЦИИ СОЗДАНИЯ ==========
function showCreateOptions() {
    closeMenu();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div style="background: var(--bg-card); padding: 24px; border-radius: 24px; width: 280px;">
            <h3 style="color: var(--text-primary); text-align: center; margin-bottom: 20px;">➕ Создать</h3>
            
            <div onclick="createPrivateChat()" style="background: var(--bg-element); padding: 16px; border-radius: 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; cursor: pointer; border: 1px solid var(--border);">
                <span style="font-size: 24px;">💬</span>
                <div>
                    <div style="font-weight: 600;">Личный чат</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Общение с другом</div>
                </div>
            </div>
            
            <div onclick="createGroupChat()" style="background: var(--bg-element); padding: 16px; border-radius: 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; cursor: pointer; border: 1px solid var(--border);">
                <span style="font-size: 24px;">👥</span>
                <div>
                    <div style="font-weight: 600;">Групповой чат</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">До 50 участников</div>
                </div>
            </div>
            
            <div onclick="createChannel()" style="background: var(--bg-element); padding: 16px; border-radius: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; border: 1px solid var(--border);">
                <span style="font-size: 24px;">📢</span>
                <div>
                    <div style="font-weight: 600;">Канал</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Для публикаций</div>
                </div>
            </div>
            
            <button onclick="closeModal()" style="width: 100%; padding: 14px; background: var(--bg-element); border: 1px solid var(--border); color: var(--text-primary); border-radius: 16px; cursor: pointer;">Отмена</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ========== СОЗДАТЬ ЛИЧНЫЙ ЧАТ ==========
function createPrivateChat() {
    closeModal();
    
    loadData();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    let usersHtml = '';
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (!user || user.id === currentUser.id || user.id === 'ai_assistant') continue;
        
        usersHtml += `
            <div onclick="startPrivateChat(${user.id})" style="padding: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-bottom: 1px solid var(--border);">
                <div style="width: 44px; height: 44px; background: var(--accent); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px;">${user.avatar || '😊'}</div>
                <div>
                    <div style="font-weight: 500;">${user.displayName || user.name || user.username}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${user.userUsername ? '@' + user.userUsername : ''}</div>
                </div>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div style="background: var(--bg-card); padding: 20px; border-radius: 24px; width: 300px; max-height: 80vh; overflow-y: auto;">
            <h3 style="margin-bottom: 15px; text-align: center;">💬 Выберите собеседника</h3>
            ${usersHtml || '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">Нет пользователей</p>'}
            <button onclick="closeModal()" style="width: 100%; padding: 14px; margin-top: 10px; background: var(--bg-element); border: none; border-radius: 16px; cursor: pointer;">Закрыть</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ========== НАЧАТЬ ЛИЧНЫЙ ЧАТ ==========
function startPrivateChat(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // проверяем есть ли уже сообщения
    let hasMessages = false;
    for (let i = 0; i < messages.length; i++) {
        const m = messages[i];
        if (m && ((m.from === currentUser.id && m.to === userId) || (m.from === userId && m.to === currentUser.id))) {
            hasMessages = true;
            break;
        }
    }
    
    if (!hasMessages) {
        // добавляем приветственное сообщение
        const welcomeMsg = {
            id: Date.now(),
            from: 'system',
            to: currentUser.id,
            text: '💬 Чат с ' + (user.displayName || user.name || user.username) + ' создан',
            time: Date.now(),
            read: true
        };
        messages.push(welcomeMsg);
        localStorage.setItem('helioMessages', JSON.stringify(messages));
    }
    
    closeModal();
    openChat(userId);
}

// ========== СОЗДАТЬ ГРУППУ ==========
function createGroupChat() {
    closeModal();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div style="background: var(--bg-card); padding: 24px; border-radius: 24px; width: 300px;">
            <h3 style="text-align: center; margin-bottom: 20px;">👥 Создать группу</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; color: var(--text-secondary); margin-bottom: 5px;">Название</label>
                <input type="text" id="groupName" placeholder="Введите название" style="width: 100%; padding: 14px; background: var(--bg-element); border: 1px solid var(--border); border-radius: 14px; color: var(--text-primary);">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: var(--text-secondary); margin-bottom: 5px;">Описание</label>
                <input type="text" id="groupDesc" placeholder="О чем группа?" style="width: 100%; padding: 14px; background: var(--bg-element); border: 1px solid var(--border); border-radius: 14px; color: var(--text-primary);">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: var(--text-secondary); margin-bottom: 5px;">Аватар</label>
                <select id="groupAvatar" style="width: 100%; padding: 14px; background: var(--bg-element); border: 1px solid var(--border); border-radius: 14px; color: var(--text-primary);">
                    <option value="👥">👥 Группа</option>
                    <option value="👨‍👩‍👧">👨‍👩‍👧 Семья</option>
                    <option value="👾">👾 Игры</option>
                    <option value="🎮">🎮 Геймеры</option>
                    <option value="💻">💻 Работа</option>
                </select>
            </div>
            
            <button onclick="createGroup()" style="width: 100%; padding: 16px; background: var(--accent); border: none; border-radius: 16px; color: white; font-weight: 600; cursor: pointer; margin-bottom: 10px;">Создать группу</button>
            <button onclick="closeModal()" style="width: 100%; padding: 14px; background: var(--bg-element); border: 1px solid var(--border); border-radius: 16px; color: var(--text-primary); cursor: pointer;">Отмена</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ========== СОЗДАТЬ ГРУППУ (СОХРАНЕНИЕ) ==========
function createGroup() {
    const name = document.getElementById('groupName').value.trim();
    const desc = document.getElementById('groupDesc').value.trim();
    const avatar = document.getElementById('groupAvatar').value;
    
    if (!name) {
        alert('Введите название группы');
        return;
    }
    
    const groupId = 'group_' + Date.now();
    const groupData = {
        id: groupId,
        name: name,
        description: desc,
        avatar: avatar,
        createdBy: currentUser.id,
        createdByUsername: currentUser.username,
        createdAt: Date.now(),
        members: [currentUser.id],
        admins: [currentUser.id]
    };
    
    let groups = JSON.parse(localStorage.getItem('groups')) || [];
    groups.push(groupData);
    localStorage.setItem('groups', JSON.stringify(groups));
    
    alert('✅ Группа "' + name + '" создана!');
    closeModal();
}

// ========== СОЗДАТЬ КАНАЛ ==========
function createChannel() {
    closeModal();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div style="background: var(--bg-card); padding: 24px; border-radius: 24px; width: 300px;">
            <h3 style="text-align: center; margin-bottom: 20px;">📢 Создать канал</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; color: var(--text-secondary); margin-bottom: 5px;">Название</label>
                <input type="text" id="channelName" placeholder="Введите название" style="width: 100%; padding: 14px; background: var(--bg-element); border: 1px solid var(--border); border-radius: 14px; color: var(--text-primary);">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; color: var(--text-secondary); margin-bottom: 5px;">Username</label>
                <div style="display: flex; background: var(--bg-element); border: 1px solid var(--border); border-radius: 14px; overflow: hidden;">
                    <span style="padding: 14px; background: var(--accent); color: white;">@</span>
                    <input type="text" id="channelUsername" placeholder="channel" style="flex: 1; padding: 14px; background: var(--bg-element); border: none; color: var(--text-primary);">
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; color: var(--text-secondary); margin-bottom: 5px;">Описание</label>
                <input type="text" id="channelDesc" placeholder="О чем канал?" style="width: 100%; padding: 14px; background: var(--bg-element); border: 1px solid var(--border); border-radius: 14px; color: var(--text-primary);">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: var(--text-secondary); margin-bottom: 5px;">Тип</label>
                <select id="channelType" style="width: 100%; padding: 14px; background: var(--bg-element); border: 1px solid var(--border); border-radius: 14px; color: var(--text-primary);">
                    <option value="public">🌐 Публичный</option>
                    <option value="private">🔒 Приватный</option>
                </select>
            </div>
            
            <button onclick="createChannelSubmit()" style="width: 100%; padding: 16px; background: var(--accent); border: none; border-radius: 16px; color: white; font-weight: 600; cursor: pointer; margin-bottom: 10px;">Создать канал</button>
            <button onclick="closeModal()" style="width: 100%; padding: 14px; background: var(--bg-element); border: 1px solid var(--border); border-radius: 16px; color: var(--text-primary); cursor: pointer;">Отмена</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ========== СОЗДАТЬ КАНАЛ (СОХРАНЕНИЕ) ==========
function createChannelSubmit() {
    const name = document.getElementById('channelName').value.trim();
    const username = document.getElementById('channelUsername').value.trim().toLowerCase();
    const desc = document.getElementById('channelDesc').value.trim();
    const type = document.getElementById('channelType').value;
    
    if (!name) {
        alert('Введите название канала');
        return;
    }
    
    if (!username) {
        alert('Введите username канала');
        return;
    }
    
    // проверка уникальности username
    let channels = JSON.parse(localStorage.getItem('channels')) || [];
    if (channels.some(ch => ch.username === username)) {
        alert('❌ Username уже занят');
        return;
    }
    
    const channelId = 'channel_' + Date.now();
    const channelData = {
        id: channelId,
        name: name,
        username: username,
        description: desc,
        type: type,
        createdBy: currentUser.id,
        createdByUsername: currentUser.username,
        createdAt: Date.now(),
        subscribers: [currentUser.id],
        posts: []
    };
    
    channels.push(channelData);
    localStorage.setItem('channels', JSON.stringify(channels));
    
    alert('✅ Канал @' + username + ' создан!');
    closeModal();
}
