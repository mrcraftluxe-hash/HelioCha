// ========== ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ И ЧАТ ==========
const currentUser = checkAuth();
if (!currentUser) {
    window.location.href = 'index.html';
}

const activeChatId = localStorage.getItem('activeChat');
if (!activeChatId) {
    window.location.href = 'chat.html';
}

// ========== ДАННЫЕ ==========
let messages = [];
let users = [];
let otherUser = null;

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

// ========== ПОИСК СОБЕСЕДНИКА ==========
function findOtherUser() {
    loadData();
    otherUser = users.find(u => u && u.id == activeChatId);
    
    if (!otherUser && activeChatId !== 'ai_assistant') {
        console.log('Пользователь не найден');
        return false;
    }
    return true;
}

// ========== ЗАГРУЗКА ИНФЫ О ЧАТЕ ==========
function loadChatInfo() {
    const avatar = document.getElementById('chatUserAvatar');
    const name = document.getElementById('chatUserName');
    const status = document.getElementById('chatUserStatus');
    
    if (activeChatId === 'ai_assistant') {
        if (avatar) avatar.textContent = '🤖';
        if (name) name.textContent = 'AI Помощник';
        if (status) status.innerHTML = 'всегда онлайн';
        return;
    }
    
    if (!otherUser && !findOtherUser()) return;
    
    if (avatar) {
        const savedAvatar = localStorage.getItem('avatar_' + otherUser.id);
        if (savedAvatar && savedAvatar.startsWith('data:image')) {
            avatar.innerHTML = '';
            avatar.style.backgroundImage = 'url(' + savedAvatar + ')';
            avatar.style.backgroundSize = 'cover';
            avatar.style.backgroundPosition = 'center';
        } else {
            avatar.innerHTML = otherUser.avatar || '👤';
            avatar.style.backgroundImage = 'none';
        }
    }
    
    if (name) name.textContent = otherUser.displayName || otherUser.name || otherUser.username || 'Пользователь';
    if (status) status.innerHTML = 'онлайн';
}

if (true) {
    
}

// ========== ЗАГРУЗКА СООБЩЕНИЙ ==========
function loadMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    loadData();
    
    if (activeChatId !== 'ai_assistant' && !otherUser && !findOtherUser()) return;
    
    const chatMessages = messages.filter(m => 
        m && ((m.from === currentUser.id && m.to === activeChatId) ||
              (m.from === activeChatId && m.to === currentUser.id))
    ).sort((a, b) => (a.time || 0) - (b.time || 0));
    
    if (chatMessages.length === 0) {
        container.innerHTML = '<div class="no-messages">💬 Нет сообщений</div>';
        return;
    }
    
    let html = '';
    let lastDate = '';
    
    for (let i = 0; i < chatMessages.length; i++) {
        const msg = chatMessages[i];
        const msgDate = new Date(msg.time).toLocaleDateString();
        
        if (msgDate !== lastDate) {
            html += '<div class="date-separator">' + msgDate + '</div>';
            lastDate = msgDate;
        }
        
        const isMine = msg.from === currentUser.id;
        const isAI = msg.from === 'ai_assistant';
        
        html += '<div class="message-row ' + (isMine ? 'mine' : '') + '">';
        
        if (!isMine) {
            if (isAI) {
                html += '<div class="message-avatar">🤖</div>';
            } else if (otherUser) {
                const userAvatar = localStorage.getItem('avatar_' + otherUser.id);
                if (userAvatar && userAvatar.startsWith('data:image')) {
                    html += '<div class="message-avatar" style="background-image:url(' + userAvatar + '); background-size:cover; background-position:center;"></div>';
                } else {
                    html += '<div class="message-avatar">' + (otherUser.avatar || '👤') + '</div>';
                }
            }
        }
        
        html += '<div class="message-bubble">';
        
        // ЕСЛИ ЭТО ПОДАРОК
        if (msg.isGift && msg.giftData) {
            html += '<div class="message-gift-content">';
            html += '<div class="gift-emoji-large">' + (msg.giftData.emoji || '🎁') + '</div>';
            html += '<div class="gift-name-large">' + (msg.giftData.name || 'Подарок') + '</div>';
            if (msg.giftData.message) {
                html += '<div class="gift-message-small">"' + msg.giftData.message + '"</div>';
            }
            if (msg.giftData.uniqueId) {
                html += '<div class="gift-id-small">' + msg.giftData.uniqueId + '</div>';
            }
            if (!isMine) {
                html += '<div class="gift-from-small">От: ' + (msg.giftData.fromName || '') + '</div>';
            }
            html += '</div>';
        }
        
        // ЕСЛИ ЭТО ФОТО
        if (msg.image) {
            html += '<div class="message-image"><img src="' + msg.image + '" style="max-width:200px; max-height:200px; border-radius:12px;" onclick="viewImage(\'' + msg.image + '\')"></div>';
        }
        
        // ЕСЛИ ЭТО ТЕКСТ
        if (msg.text && !msg.isGift) {
            html += '<div class="message-text">' + msg.text + '</div>';
        }
        
        html += '<div class="message-time">';
        html += new Date(msg.time).toLocaleTimeString().slice(0,5);
        if (isMine) {
            html += msg.read ? ' ✓✓' : ' ✓';
        }
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

// ========== ОТПРАВКА СООБЩЕНИЯ ==========
function sendMessage() {
    console.log('sendMessage вызвана');
    
    const input = document.getElementById('messageInput');
    if (!input) {
        console.log('поле ввода не найдено');
        return;
    }
    
    const text = input.value.trim();
    if (!text) {
        console.log('пустое сообщение');
        return;
    }
    
    console.log('отправляем:', text);
    
    if (activeChatId !== 'ai_assistant' && !otherUser && !findOtherUser()) {
        console.log('нет собеседника');
        return;
    }
    
    // создаем сообщение
    const newMessage = {
        id: Date.now(),
        from: currentUser.id,
        to: activeChatId,
        text: text,
        time: Date.now(),
        read: false
    };
    
    // добавляем в массив
    messages.push(newMessage);
    
    // сохраняем
    localStorage.setItem('helioMessages', JSON.stringify(messages));
    console.log('сообщение сохранено, всего сообщений:', messages.length);
    
    // очищаем поле
    input.value = '';
    
    // обновляем
    loadMessages();
}

// ========== ОТПРАВКА ПО ENTER ==========
function checkEnter(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
}

// ========== ПОСМОТРЕТЬ ФОТО ==========
function viewImage(imageData) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.background = 'rgba(0,0,0,0.9)';
    modal.innerHTML = `
        <div style="position:relative; max-width:90%; max-height:90%;">
            <img src="${imageData}" style="max-width:100%; max-height:90vh; border-radius:12px;">
            <button onclick="this.closest('.modal').remove()" style="position:absolute; top:10px; right:10px; background:#2b5278; border:none; color:white; width:40px; height:40px; border-radius:50%; cursor:pointer;">✕</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// ========== НАЗАД ==========
function goBack() {
    window.location.href = 'chat.html';
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
if (activeChatId !== 'ai_assistant') {
    findOtherUser();
}
loadChatInfo();
loadMessages();

// ========== АВТООБНОВЛЕНИЕ ==========
setInterval(function() {
    loadData();
    if (activeChatId) {
        loadMessages();
    }
}, 2000);

messages.push(chatMessage);
localStorage.setItem('helioMessages', JSON.stringify(messages));

// в функцию loadMessages() добавь проверку на подарок

if (msg.isGift) {
    html += '<div class="message-gift">';
    html += '<div class="gift-bubble">';
    html += '<div class="gift-bubble-emoji">' + (msg.giftData?.emoji || '🎁') + '</div>';
    html += '<div class="gift-bubble-name">' + (msg.giftData?.name || 'Подарок') + '</div>';
    if (msg.giftData?.message) {
        html += '<div class="gift-bubble-message">"' + msg.giftData.message + '"</div>';
    }
    html += '<div class="gift-bubble-id">' + (msg.giftData?.uniqueId || '') + '</div>';
    html += '</div>';
    html += '</div>';
}