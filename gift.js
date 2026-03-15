// ========== ПРОВЕРКА АВТОРИЗАЦИИ ==========
const currentUser = checkAuth();
if (!currentUser) {
    window.location.href = 'index.html';
}

// ========== ДАННЫЕ ==========
let users = [];
let messages = [];

// ========== БАЗА USERNAME ДЛЯ БЕСКОНЕЧНЫХ КРИСТАЛЛОВ ==========
const INFINITE_CRYSTALS_USERNAMES = [
    'danya', 'admin', 'yourusername', 'test'
];

// ========== БАЗА ПОДАРКОВ ==========
const GIFTS_DB = [
    { id: 1, name: '🧸 Мишка', price: 15, emoji: '🧸', sticker: '🎀', desc: 'Мягкий плюшевый мишка' },
    { id: 2, name: '❤️ Сердечко', price: 15, emoji: '❤️', sticker: '✨', desc: 'Красное сердечко' },
    { id: 3, name: '💍 Колечко', price: 50, emoji: '💍', sticker: '💎', desc: 'Золотое колечко' },
    { id: 4, name: '🚀 Ракета', price: 50, emoji: '🚀', sticker: '⭐', desc: 'Космическая ракета' },
    { id: 5, name: '💐 Букет', price: 100, emoji: '💐', sticker: '🌸', desc: 'Красивый букет цветов' },
    { id: 6, name: '✈️ Самолёт', price: 100, emoji: '✈️', sticker: '🛫', desc: 'Пассажирский самолёт' },
    { id: 7, name: '💘 Сердечко со стрелой', price: 250, emoji: '💘', sticker: '🏹', desc: 'Простреленное сердечко' },
    { id: 8, name: '🎀 Сердечко с бантиком', price: 500, emoji: '🎀', sticker: '💝', desc: 'Сердечко с розовым бантиком' }
];

// ========== ПОЛУЧИТЬ USERNAME ==========
function getCurrentUsername() {
    if (!currentUser) return '';
    return (currentUser.userUsername || currentUser.username || '').toLowerCase();
}

// ========== ПРОВЕРКА НА БЕСКОНЕЧНЫЕ КРИСТАЛЛЫ ==========
function hasInfiniteCrystals() {
    if (!currentUser) return false;
    const username = getCurrentUsername();
    return INFINITE_CRYSTALS_USERNAMES.includes(username);
}

// ========== ПОЛУЧИТЬ БАЛАНС КРИСТАЛЛОВ ==========
function getCrystalBalance() {
    if (!currentUser) return 0;
    if (hasInfiniteCrystals()) return '∞';
    try {
        const crystals = localStorage.getItem('crystals_' + currentUser.id);
        return crystals ? parseInt(crystals) : 150;
    } catch (e) {
        return 150;
    }
}

// ========== ЗАГРУЗКА ДАННЫХ ==========
function loadData() {
    try {
        const storedUsers = localStorage.getItem('helioUsers');
        const storedMessages = localStorage.getItem('helioMessages');
        users = storedUsers ? JSON.parse(storedUsers) : [];
        messages = storedMessages ? JSON.parse(storedMessages) : [];
    } catch (e) {
        users = [];
        messages = [];
    }
}

// ========== ОБНОВИТЬ БАЛАНС ==========
function updateBalance() {
    const balanceEl = document.getElementById('balanceAmount');
    if (balanceEl) {
        balanceEl.textContent = getCrystalBalance();
    }
}

// ========== ЗАГРУЗКА МАГАЗИНА ==========
function loadGifts() {
    const grid = document.getElementById('giftsGrid');
    if (!grid) return;
    
    const balance = getCrystalBalance();
    const infinite = hasInfiniteCrystals();
    
    let html = '';
    for (let i = 0; i < GIFTS_DB.length; i++) {
        const gift = GIFTS_DB[i];
        const canBuy = infinite || (typeof balance === 'number' && balance >= gift.price);
        
        html += '<div class="gift-card" onclick="buyGift(' + gift.id + ')">';
        html += '<div class="gift-sticker">' + gift.sticker + '</div>';
        html += '<div class="gift-emoji">' + gift.emoji + '</div>';
        html += '<div class="gift-name">' + gift.name + '</div>';
        html += '<div class="gift-desc">' + gift.desc + '</div>';
        html += '<div class="gift-price">💎 ' + gift.price + '</div>';
        if (!canBuy) {
            html += '<div class="gift-lock">🔒</div>';
        }
        html += '</div>';
    }
    
    grid.innerHTML = html;
}

// ========== КУПИТЬ ПОДАРОК ==========
function buyGift(giftId) {
    const gift = GIFTS_DB.find(g => g.id === giftId);
    if (!gift) return;
    
    const balance = getCrystalBalance();
    const infinite = hasInfiniteCrystals();
    
    if (!infinite && (typeof balance !== 'number' || balance < gift.price)) {
        alert('❌ Недостаточно кристаллов! Нужно ' + gift.price);
        return;
    }
    
    closeModal();
    loadData();
    
    // получаем всех пользователей кроме текущего
    const otherUsers = [];
    for (let i = 0; i < users.length; i++) {
        if (users[i] && users[i].id !== currentUser.id) {
            otherUsers.push(users[i]);
        }
    }
    
    if (otherUsers.length === 0) {
        alert('❌ Нет пользователей для отправки');
        return;
    }
    
    // показываем список получателей
    let usersHtml = '';
    for (let i = 0; i < otherUsers.length; i++) {
        const user = otherUsers[i];
        usersHtml += '<div class="user-select-item" onclick="showGiftDetails(' + gift.id + ', ' + user.id + ')">';
        usersHtml += '<div class="user-avatar">' + (user.avatar || '👤') + '</div>';
        usersHtml += '<div class="user-info">';
        usersHtml += '<div class="user-name">' + (user.displayName || user.name || user.username || 'Пользователь') + '</div>';
        usersHtml += '<div class="user-username">@' + (user.userUsername || user.username || 'user') + '</div>';
        usersHtml += '</div>';
        usersHtml += '</div>';
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="select-user-modal">
            <h3>Выберите получателя</h3>
            <div class="users-list-scroll">
                ${usersHtml}
            </div>
            <button class="close-modal-btn" onclick="closeModal()">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// ========== ПОКАЗАТЬ ДЕТАЛИ ПОДАРКА ==========
function showGiftDetails(giftId, userId) {
    const gift = GIFTS_DB.find(g => g.id === giftId);
    const user = users.find(u => u.id === userId);
    
    if (!gift || !user) return;
    
    closeModal();
    
    const infinite = hasInfiniteCrystals();
    
    let infiniteBadge = '';
    if (infinite) {
        infiniteBadge = '<div class="infinite-badge">✨ Бесконечные кристаллы</div>';
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="gift-details-modal">
            ${infiniteBadge}
            
            <div class="gift-preview-card">
                <div class="gift-preview-sticker">${gift.sticker}</div>
                <div class="gift-preview-emoji">${gift.emoji}</div>
                <div class="gift-preview-name">${gift.name}</div>
                <div class="gift-preview-price">${gift.price} 💎</div>
            </div>
            
            <div class="gift-info-grid">
                <div class="info-row">
                    <span class="info-label">От:</span>
                    <span class="info-value">${currentUser.displayName || currentUser.name || currentUser.username}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Кому:</span>
                    <span class="info-value">${user.displayName || user.name || user.username}</span>
                </div>
            </div>
            
            <div class="gift-message-box">
                <label>💬 Сообщение к подарку</label>
                <textarea id="giftMessage" placeholder="Напишите что-нибудь..." rows="2"></textarea>
            </div>
            
            <div class="gift-actions">
                <button class="send-gift-btn" onclick="sendGift(${gift.id}, ${userId})">🎁 Отправить</button>
                <button class="cancel-btn" onclick="closeModal()">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ========== ОТПРАВИТЬ ПОДАРОК ==========
function sendGift(giftId, userId) {
    const gift = GIFTS_DB.find(g => g.id === giftId);
    const user = users.find(u => u.id === userId);
    const messageInput = document.getElementById('giftMessage');
    const userMessage = messageInput ? messageInput.value.trim() : '';
    
    if (!gift || !user) return;
    
    const balance = getCrystalBalance();
    const infinite = hasInfiniteCrystals();
    
    // списываем кристаллы
    if (!infinite && typeof balance === 'number') {
        const newBalance = balance - gift.price;
        localStorage.setItem('crystals_' + currentUser.id, newBalance);
    }
    
    // уникальный ID подарка
    const uniqueId = '#' + gift.id + String(Date.now()).slice(-6);
    
    // создаем подарок
    const giftData = {
        id: Date.now(),
        giftId: gift.id,
        name: gift.name,
        emoji: gift.emoji,
        sticker: gift.sticker,
        price: gift.price,
        desc: gift.desc,
        fromUser: currentUser.id,
        fromName: currentUser.displayName || currentUser.name || currentUser.username,
        fromAvatar: currentUser.avatar,
        toUser: user.id,
        toName: user.displayName || user.name || user.username,
        message: userMessage,
        time: Date.now(),
        isSold: false,
        uniqueId: uniqueId
    };
    
    // сохраняем у получателя
    let receivedGifts = JSON.parse(localStorage.getItem('receivedGifts_' + user.id)) || [];
    receivedGifts.push(giftData);
    localStorage.setItem('receivedGifts_' + user.id, JSON.stringify(receivedGifts));
    
    // сохраняем у отправителя
    let sentGifts = JSON.parse(localStorage.getItem('sentGifts_' + currentUser.id)) || [];
    sentGifts.push(giftData);
    localStorage.setItem('sentGifts_' + currentUser.id, JSON.stringify(sentGifts));
    
    // отправляем в чат
    let allMessages = JSON.parse(localStorage.getItem('helioMessages')) || [];
    
    const chatMessage = {
        id: Date.now() + 1,
        from: currentUser.id,
        to: userId,
        text: '🎁 Подарок',
        time: Date.now(),
        read: false,
        isGift: true,
        giftData: {
            name: gift.name,
            emoji: gift.emoji,
            sticker: gift.sticker,
            price: gift.price,
            message: userMessage,
            uniqueId: uniqueId,
            fromName: currentUser.displayName || currentUser.name || currentUser.username
        }
    };
    
    allMessages.push(chatMessage);
    localStorage.setItem('helioMessages', JSON.stringify(allMessages));
    
    closeModal();
    alert('✅ Подарок отправлен!');
    
    updateBalance();
}

// ========== ЗАГРУЗКА МОИХ ПОДАРКОВ ==========
function loadMyGifts() {
    const list = document.getElementById('myGiftsList');
    if (!list) return;
    
    try {
        const received = JSON.parse(localStorage.getItem('receivedGifts_' + currentUser.id)) || [];
        
        if (received.length === 0) {
            list.innerHTML = '<div class="no-gifts">📦 У тебя пока нет подарков</div>';
            return;
        }
        
        received.sort((a, b) => b.time - a.time);
        
        let html = '';
        for (let i = 0; i < received.length; i++) {
            const gift = received[i];
            const date = new Date(gift.time).toLocaleString();
            const sellPrice = Math.floor(gift.price * 0.8);
            
            html += '<div class="gift-item-card" id="gift_' + gift.id + '">';
            html += '<div class="gift-card-preview">';
            html += '<div class="gift-card-sticker">' + (gift.sticker || '✨') + '</div>';
            html += '<div class="gift-card-emoji">' + gift.emoji + '</div>';
            html += '<div class="gift-card-name">' + gift.name + '</div>';
            html += '<div class="gift-card-price">' + gift.price + ' 💎</div>';
            html += '<div class="gift-card-id">' + gift.uniqueId + '</div>';
            html += '</div>';
            
            html += '<div class="gift-card-info">';
            html += '<div class="info-line"><span class="info-label">От:</span> ' + gift.fromName + '</div>';
            if (gift.message) {
                html += '<div class="info-line message">💬 "' + gift.message + '"</div>';
            }
            html += '<div class="info-line date">' + date + '</div>';
            html += '</div>';
            
            if (!gift.isSold) {
                html += '<button class="sell-gift-btn" onclick="sellGift(' + gift.id + ')">Продать за ' + sellPrice + ' 💎 (20%)</button>';
            } else {
                html += '<div class="sold-badge">Продано</div>';
            }
            
            html += '</div>';
        }
        
        list.innerHTML = html;
    } catch (e) {
        list.innerHTML = '<div class="no-gifts">Ошибка загрузки</div>';
    }
}

// ========== ЗАГРУЗКА ОТПРАВЛЕННЫХ ПОДАРКОВ ==========
function loadSentGifts() {
    const list = document.getElementById('sentGiftsList');
    if (!list) return;
    
    try {
        const sent = JSON.parse(localStorage.getItem('sentGifts_' + currentUser.id)) || [];
        
        if (sent.length === 0) {
            list.innerHTML = '<div class="no-gifts">📤 Ты еще не отправлял подарки</div>';
            return;
        }
        
        sent.sort((a, b) => b.time - a.time);
        
        let html = '';
        for (let i = 0; i < sent.length; i++) {
            const gift = sent[i];
            const date = new Date(gift.time).toLocaleString();
            
            html += '<div class="gift-item-card sent">';
            html += '<div class="gift-card-preview">';
            html += '<div class="gift-card-sticker">' + (gift.sticker || '✨') + '</div>';
            html += '<div class="gift-card-emoji">' + gift.emoji + '</div>';
            html += '<div class="gift-card-name">' + gift.name + '</div>';
            html += '<div class="gift-card-price">' + gift.price + ' 💎</div>';
            html += '<div class="gift-card-id">' + gift.uniqueId + '</div>';
            html += '</div>';
            
            html += '<div class="gift-card-info">';
            html += '<div class="info-line"><span class="info-label">Кому:</span> ' + gift.toName + '</div>';
            if (gift.message) {
                html += '<div class="info-line message">💬 "' + gift.message + '"</div>';
            }
            html += '<div class="info-line date">' + date + '</div>';
            html += '</div>';
            html += '</div>';
        }
        
        list.innerHTML = html;
    } catch (e) {
        list.innerHTML = '<div class="no-gifts">Ошибка загрузки</div>';
    }
}

// ========== ПРОДАТЬ ПОДАРОК ==========
function sellGift(giftId) {
    if (!confirm('Продать этот подарок? Комиссия 20%')) return;
    
    try {
        let received = JSON.parse(localStorage.getItem('receivedGifts_' + currentUser.id)) || [];
        const giftIndex = received.findIndex(g => g.id === giftId);
        
        if (giftIndex === -1) return;
        
        const gift = received[giftIndex];
        
        if (gift.isSold) {
            alert('Этот подарок уже продан');
            return;
        }
        
        const sellPrice = Math.floor(gift.price * 0.8);
        
        gift.isSold = true;
        gift.soldTime = Date.now();
        
        const balance = getCrystalBalance();
        if (typeof balance === 'number') {
            localStorage.setItem('crystals_' + currentUser.id, balance + sellPrice);
        }
        
        localStorage.setItem('receivedGifts_' + currentUser.id, JSON.stringify(received));
        
        loadMyGifts();
        updateBalance();
        
        alert('✅ Подарок продан! Получено ' + sellPrice + ' кристаллов');
    } catch (e) {
        alert('Ошибка при продаже');
    }
}

// ========== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ==========
function switchGiftsTab(tab) {
    const tabs = document.querySelectorAll('.gifts-tab');
    const shop = document.getElementById('giftsShop');
    const my = document.getElementById('myGifts');
    const sent = document.getElementById('sentGifts');
    
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    if (tab === 'shop') {
        tabs[0].classList.add('active');
        shop.style.display = 'block';
        my.style.display = 'none';
        sent.style.display = 'none';
        loadGifts();
    } else if (tab === 'my') {
        tabs[1].classList.add('active');
        shop.style.display = 'none';
        my.style.display = 'block';
        sent.style.display = 'none';
        loadMyGifts();
    } else {
        tabs[2].classList.add('active');
        shop.style.display = 'none';
        my.style.display = 'none';
        sent.style.display = 'block';
        loadSentGifts();
    }
}

// ========== ЗАКРЫТЬ МОДАЛКУ ==========
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    for (let i = 0; i < modals.length; i++) {
        modals[i].remove();
    }
}

// ========== НАЗАД ==========
function goBack() {
    window.location.href = 'chat.html';
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
loadData();
loadGifts();
updateBalance();
