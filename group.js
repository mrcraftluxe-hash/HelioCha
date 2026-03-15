// Текущий пользователь
const currentUser = checkAuth();
if (!currentUser) {
    window.location.href = 'index.html';
}

// ID группы
const groupId = localStorage.getItem('activeGroup');
if (!groupId) {
    window.location.href = 'chat.html';
}

// Данные
let groupData = null;
let allGroups = [];
let users = [];
let groupMessages = [];

// Загрузка данных
function loadData() {
    const storedGroups = localStorage.getItem('groups');
    const storedUsers = localStorage.getItem('helioUsers');
    const storedMessages = localStorage.getItem('groupMessages_' + groupId);
    
    allGroups = storedGroups ? JSON.parse(storedGroups) : [];
    users = storedUsers ? JSON.parse(storedUsers) : [];
    groupMessages = storedMessages ? JSON.parse(storedMessages) : [];
    
    groupData = allGroups.find(g => g && g.id === groupId);
    
    if (!groupData) {
        alert('Группа не найдена');
        window.location.href = 'chat.html';
        return false;
    }
    
    return true;
}

// Загрузка информации о группе
function loadGroupInfo() {
    if (!loadData()) return;
    
    document.getElementById('groupName').textContent = groupData.name || 'Без названия';
    document.getElementById('groupAvatar').textContent = groupData.avatar || '👥';
    document.getElementById('groupDescription').textContent = groupData.description || 'Нет описания';
    document.getElementById('groupMembers').textContent = groupData.members ? groupData.members.length : 0;
    
    const isAdmin = groupData.admins && groupData.admins.includes(currentUser.id);
    
    // Панель администратора
    const adminPanel = document.getElementById('groupAdminPanel');
    if (isAdmin) {
        adminPanel.style.display = 'flex';
    } else {
        adminPanel.style.display = 'none';
    }
}

// Загрузка сообщений
function loadGroupMessages() {
    const messagesContainer = document.getElementById('groupMessages');
    if (!messagesContainer) return;
    
    if (groupMessages.length === 0) {
        messagesContainer.innerHTML = '<div class="no-messages">💬 Нет сообщений. Напишите первым!</div>';
        return;
    }
    
    groupMessages.sort((a, b) => (a.time || 0) - (b.time || 0));
    
    let html = '';
    let lastDate = '';
    
    for (let i = 0; i < groupMessages.length; i++) {
        const msg = groupMessages[i];
        const msgDate = new Date(msg.time).toLocaleDateString();
        
        if (msgDate !== lastDate) {
            html += '<div class="date-separator">' + msgDate + '</div>';
            lastDate = msgDate;
        }
        
        const isMine = msg.from === currentUser.id;
        const user = users.find(u => u && u.id === msg.from);
        const isAdmin = groupData.admins && groupData.admins.includes(msg.from);
        
        html += '<div class="message-row ' + (isMine ? 'mine' : '') + '">';
        
        if (!isMine) {
            html += '<div class="message-avatar">' + (user ? user.avatar : '👤') + '</div>';
        }
        
        html += '<div class="message-bubble">';
        
        if (!isMine) {
            html += '<div class="message-author">' + (user ? user.username : 'Пользователь');
            if (isAdmin) {
                html += ' <span class="admin-badge">👑</span>';
            }
            html += '</div>';
        }
        
        html += '<div class="message-text">' + msg.text + '</div>';
        html += '<div class="message-time">';
        html += new Date(msg.time).toLocaleTimeString().slice(0,5);
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }
    
    messagesContainer.innerHTML = html;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Отправка сообщения в группу
function sendGroupMessage() {
    const input = document.getElementById('groupMessageInput');
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    if (!loadData()) return;
    
    const newMessage = {
        id: Date.now(),
        from: currentUser.id,
        text: text,
        time: Date.now()
    };
    
    groupMessages.push(newMessage);
    localStorage.setItem('groupMessages_' + groupId, JSON.stringify(groupMessages));
    
    input.value = '';
    loadGroupMessages();
}

// Отправка по Enter
function checkGroupEnter(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendGroupMessage();
    }
}

// Загрузка участников
function loadGroupMembers() {
    const membersContainer = document.getElementById('groupMembersList');
    if (!membersContainer) return;
    
    if (!groupData.members || groupData.members.length === 0) {
        membersContainer.innerHTML = '<div class="no-members">👥 Нет участников</div>';
        return;
    }
    
    let html = '<div class="members-list">';
    
    for (let i = 0; i < groupData.members.length; i++) {
        const memberId = groupData.members[i];
        const user = users.find(u => u && u.id === memberId);
        const isAdmin = groupData.admins && groupData.admins.includes(memberId);
        const isOwner = groupData.createdBy === memberId;
        
        if (user) {
            html += '<div class="member-item" id="member_' + user.id + '">';
            html += '<div class="member-avatar">' + (user.avatar || '👤') + '</div>';
            html += '<div class="member-info">';
            html += '<div class="member-name">' + user.username;
            if (isOwner) html += ' 👑';
            else if (isAdmin) html += ' ⭐';
            html += '</div>';
            html += '<div class="member-role">';
            if (isOwner) html += 'Создатель';
            else if (isAdmin) html += 'Админ';
            else html += 'Участник';
            html += '</div>';
            html += '</div>';
            
            // Кнопки для админов
            const isCurrentUserAdmin = groupData.admins && groupData.admins.includes(currentUser.id);
            if (isCurrentUserAdmin && memberId !== currentUser.id && !isOwner) {
                html += '<div class="member-actions">';
                if (!isAdmin) {
                    html += '<button class="member-action-btn" onclick="makeAdmin(' + user.id + ')">⭐</button>';
                } else {
                    html += '<button class="member-action-btn" onclick="removeAdmin(' + user.id + ')">❌</button>';
                }
                html += '<button class="member-action-btn delete" onclick="kickMember(' + user.id + ')">🚫</button>';
                html += '</div>';
            }
            
            html += '</div>';
        }
    }
    
    html += '</div>';
    membersContainer.innerHTML = html;
}

// Переключение вкладок
function switchGroupTab(tab) {
    const tabs = document.querySelectorAll('.group-tab');
    const chat = document.getElementById('groupChat');
    const members = document.getElementById('groupMembersList');
    const media = document.getElementById('groupMedia');
    const files = document.getElementById('groupFiles');
    
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    if (tab === 'chat') {
        tabs[0].classList.add('active');
        chat.style.display = 'flex';
        members.style.display = 'none';
        media.style.display = 'none';
        files.style.display = 'none';
        loadGroupMessages();
    } else if (tab === 'members') {
        tabs[1].classList.add('active');
        chat.style.display = 'none';
        members.style.display = 'block';
        media.style.display = 'none';
        files.style.display = 'none';
        loadGroupMembers();
    } else if (tab === 'media') {
        tabs[2].classList.add('active');
        chat.style.display = 'none';
        members.style.display = 'none';
        media.style.display = 'block';
        files.style.display = 'none';
    } else {
        tabs[3].classList.add('active');
        chat.style.display = 'none';
        members.style.display = 'none';
        media.style.display = 'none';
        files.style.display = 'block';
    }
}

// Добавить участника
function addMember() {
    if (!loadData()) return;
    
    const otherUsers = users.filter(u => 
        u && u.id !== currentUser.id && 
        !groupData.members.includes(u.id)
    );
    
    if (otherUsers.length === 0) {
        alert('Нет пользователей для добавления');
        return;
    }
    
    let usersHtml = '';
    for (let i = 0; i < otherUsers.length; i++) {
        const user = otherUsers[i];
        usersHtml += '<div class="user-select-item" onclick="addMemberToGroup(' + user.id + ')">';
        usersHtml += '<div class="user-avatar">' + (user.avatar || '👤') + '</div>';
        usersHtml += '<div class="user-info">';
        usersHtml += '<div class="user-name">' + user.username + '</div>';
        usersHtml += '<div class="user-email">' + user.email + '</div>';
        usersHtml += '</div>';
        usersHtml += '</div>';
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="select-user-modal">
            <h3>➕ Добавить участника</h3>
            <div class="users-list-scroll">
                ${usersHtml}
            </div>
            <button class="close-modal-btn" onclick="closeModal()">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Добавить пользователя в группу
function addMemberToGroup(userId) {
    if (!loadData()) return;
    
    if (!groupData.members.includes(userId)) {
        groupData.members.push(userId);
        
        const groupIndex = allGroups.findIndex(g => g && g.id === groupId);
        allGroups[groupIndex] = groupData;
        localStorage.setItem('groups', JSON.stringify(allGroups));
        
        // Добавляем группу пользователю
        const userChats = JSON.parse(localStorage.getItem('userChats_' + userId)) || [];
        userChats.push({
            id: groupId,
            type: 'group',
            name: groupData.name,
            avatar: groupData.avatar,
            createdAt: Date.now()
        });
        localStorage.setItem('userChats_' + userId, JSON.stringify(userChats));
    }
    
    closeModal();
    loadGroupMembers();
    alert('✅ Участник добавлен');
}

// Назначить админом
function makeAdmin(userId) {
    if (!loadData()) return;
    
    if (!groupData.admins) {
        groupData.admins = [];
    }
    
    if (!groupData.admins.includes(userId)) {
        groupData.admins.push(userId);
        
        const groupIndex = allGroups.findIndex(g => g && g.id === groupId);
        allGroups[groupIndex] = groupData;
        localStorage.setItem('groups', JSON.stringify(allGroups));
        
        loadGroupMembers();
        alert('✅ Пользователь назначен админом');
    }
}

// Убрать админа
function removeAdmin(userId) {
    if (!loadData()) return;
    
    if (groupData.admins) {
        groupData.admins = groupData.admins.filter(id => id !== userId);
        
        const groupIndex = allGroups.findIndex(g => g && g.id === groupId);
        allGroups[groupIndex] = groupData;
        localStorage.setItem('groups', JSON.stringify(allGroups));
        
        loadGroupMembers();
        alert('✅ Админ права убраны');
    }
}

// Кикнуть участника
function kickMember(userId) {
    if (!confirm('Удалить участника из группы?')) return;
    
    if (!loadData()) return;
    
    groupData.members = groupData.members.filter(id => id !== userId);
    
    if (groupData.admins) {
        groupData.admins = groupData.admins.filter(id => id !== userId);
    }
    
    const groupIndex = allGroups.findIndex(g => g && g.id === groupId);
    allGroups[groupIndex] = groupData;
    localStorage.setItem('groups', JSON.stringify(allGroups));
    
    // Удаляем группу у пользователя
    const userChats = JSON.parse(localStorage.getItem('userChats_' + userId)) || [];
    const updated = userChats.filter(chat => chat && chat.id !== groupId);
    localStorage.setItem('userChats_' + userId, JSON.stringify(updated));
    
    loadGroupMembers();
    alert('✅ Участник удален');
}

// Редактировать группу
function editGroup() {
    if (!loadData()) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="edit-group-modal">
            <h3>✏️ Редактировать группу</h3>
            
            <div class="form-group">
                <label>Название группы</label>
                <input type="text" id="editGroupName" value="${groupData.name || ''}">
            </div>
            
            <div class="form-group">
                <label>Описание</label>
                <textarea id="editGroupDesc" rows="3">${groupData.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>Аватар</label>
                <select id="editGroupAvatar">
                    <option value="👥" ${groupData.avatar === '👥' ? 'selected' : ''}>👥 Группа</option>
                    <option value="👨‍👩‍👧" ${groupData.avatar === '👨‍👩‍👧' ? 'selected' : ''}>👨‍👩‍👧 Семья</option>
                    <option value="👾" ${groupData.avatar === '👾' ? 'selected' : ''}>👾 Игры</option>
                    <option value="🎮" ${groupData.avatar === '🎮' ? 'selected' : ''}>🎮 Геймеры</option>
                    <option value="💻" ${groupData.avatar === '💻' ? 'selected' : ''}>💻 Работа</option>
                    <option value="📚" ${groupData.avatar === '📚' ? 'selected' : ''}>📚 Учеба</option>
                </select>
            </div>
            
            <button class="create-btn" onclick="saveGroupChanges()">Сохранить</button>
            <button class="close-modal-btn" onclick="closeModal()">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Сохранить изменения группы
function saveGroupChanges() {
    const newName = document.getElementById('editGroupName');
    const newDesc = document.getElementById('editGroupDesc');
    const newAvatar = document.getElementById('editGroupAvatar');
    
    if (!newName || !newName.value) {
        alert('Введите название группы');
        return;
    }
    
    if (!loadData()) return;
    
    groupData.name = newName.value;
    groupData.description = newDesc ? newDesc.value : '';
    groupData.avatar = newAvatar ? newAvatar.value : '👥';
    
    const groupIndex = allGroups.findIndex(g => g && g.id === groupId);
    allGroups[groupIndex] = groupData;
    localStorage.setItem('groups', JSON.stringify(allGroups));
    
    // Обновляем название у всех участников
    if (groupData.members) {
        for (let i = 0; i < groupData.members.length; i++) {
            const userId = groupData.members[i];
            const userChats = JSON.parse(localStorage.getItem('userChats_' + userId)) || [];
            const updated = userChats.map(chat => {
                if (chat && chat.id === groupId) {
                    chat.name = groupData.name;
                    chat.avatar = groupData.avatar;
                }
                return chat;
            });
            localStorage.setItem('userChats_' + userId, JSON.stringify(updated));
        }
    }
    
    closeModal();
    loadGroupInfo();
    alert('✅ Группа обновлена');
}

// Покинуть группу
function leaveGroup() {
    if (!confirm('Покинуть группу?')) return;
    
    if (!loadData()) return;
    
    groupData.members = groupData.members.filter(id => id !== currentUser.id);
    
    if (groupData.admins) {
        groupData.admins = groupData.admins.filter(id => id !== currentUser.id);
    }
    
    const groupIndex = allGroups.findIndex(g => g && g.id === groupId);
    allGroups[groupIndex] = groupData;
    localStorage.setItem('groups', JSON.stringify(allGroups));
    
    const userChats = JSON.parse(localStorage.getItem('userChats_' + currentUser.id)) || [];
    const updated = userChats.filter(chat => chat && chat.id !== groupId);
    localStorage.setItem('userChats_' + currentUser.id, JSON.stringify(updated));
    
    alert('✅ Вы покинули группу');
    window.location.href = 'chat.html';
}

// Назад
function goBack() {
    window.location.href = 'chat.html';
}

// Закрыть модальное окно
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    for (let i = 0; i < modals.length; i++) {
        modals[i].remove();
    }
}

// Инициализация
loadGroupInfo();
loadGroupMessages();

// Автообновление
setInterval(() => {
    loadData();
    loadGroupInfo();
    
    const activeTab = document.querySelector('.group-tab.active');
    if (activeTab && activeTab.textContent.includes('Чат')) {
        loadGroupMessages();
    } else if (activeTab && activeTab.textContent.includes('Участники')) {
        loadGroupMembers();
    }
}, 3000);