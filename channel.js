// Текущий пользователь
const currentUser = checkAuth();
if (!currentUser) {
    window.location.href = 'index.html';
}

// ID канала
const channelId = localStorage.getItem('activeChannel');
if (!channelId) {
    window.location.href = 'chat.html';
}

// Данные
let channelData = null;
let allChannels = [];
let users = [];

// Загрузка данных
function loadData() {
    const storedChannels = localStorage.getItem('channels');
    const storedUsers = localStorage.getItem('helioUsers');
    
    allChannels = storedChannels ? JSON.parse(storedChannels) : [];
    users = storedUsers ? JSON.parse(storedUsers) : [];
    
    channelData = allChannels.find(ch => ch && ch.id === channelId);
    
    if (!channelData) {
        alert('Канал не найден');
        window.location.href = 'chat.html';
        return false;
    }
    
    return true;
}

// Загрузка информации о канале
function loadChannelInfo() {
    if (!loadData()) return;
    
    document.getElementById('channelName').textContent = channelData.name || 'Без названия';
    document.getElementById('channelAvatar').textContent = channelData.avatar || '📢';
    document.getElementById('channelDescription').textContent = channelData.description || 'Нет описания';
    document.getElementById('channelSubscribers').textContent = channelData.subscribers ? channelData.subscribers.length : 0;
    
    const typeElement = document.getElementById('channelType');
    if (channelData.type === 'private') {
        typeElement.textContent = '🔒 Приватный';
        typeElement.style.color = '#ffd700';
    } else {
        typeElement.textContent = '🌐 Публичный';
        typeElement.style.color = '#2b5278';
    }
    
    // Кнопка подписки
    const subscribeBtn = document.getElementById('subscribeBtn');
    const isSubscribed = channelData.subscribers && channelData.subscribers.includes(currentUser.id);
    
    if (isSubscribed) {
        subscribeBtn.textContent = '✅ Подписан';
        subscribeBtn.classList.add('subscribed');
    } else {
        subscribeBtn.textContent = '📢 Подписаться';
        subscribeBtn.classList.remove('subscribed');
    }
    
    // Панель администратора
    const adminPanel = document.getElementById('adminPanel');
    if (channelData.createdBy === currentUser.id) {
        adminPanel.style.display = 'flex';
    } else {
        adminPanel.style.display = 'none';
    }
}

// Загрузка постов
function loadPosts() {
    const postsContainer = document.getElementById('channelPosts');
    if (!postsContainer) return;
    
    if (!channelData.posts || channelData.posts.length === 0) {
        postsContainer.innerHTML = '<div class="no-posts">📝 Нет постов</div>';
        return;
    }
    
    // Сортируем посты по дате (новые сверху)
    const posts = [...channelData.posts].sort((a, b) => (b.time || 0) - (a.time || 0));
    
    let html = '';
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const date = new Date(post.time).toLocaleString();
        
        html += '<div class="post-item" id="post_' + post.id + '">';
        
        // Шапка поста
        html += '<div class="post-header">';
        html += '<div class="post-author">';
        html += '<span class="post-author-avatar">' + (post.authorAvatar || '👤') + '</span>';
        html += '<span class="post-author-name">' + (post.authorName || 'Админ') + '</span>';
        html += '</div>';
        html += '<span class="post-date">' + date + '</span>';
        html += '</div>';
        
        // Контент поста
        html += '<div class="post-content">' + post.text + '</div>';
        
        // Если есть изображение
        if (post.image) {
            html += '<div class="post-image">';
            html += '<img src="' + post.image + '" alt="post image" style="max-width:100%; border-radius:8px;">';
            html += '</div>';
        }
        
        // Статистика поста
        html += '<div class="post-stats">';
        html += '<span>👁️ ' + (post.views || 0) + '</span>';
        html += '<span>❤️ ' + (post.likes || 0) + '</span>';
        html += '<span>💬 ' + (post.comments || 0) + '</span>';
        html += '</div>';
        
        // Действия с постом
        html += '<div class="post-actions">';
        html += '<button class="post-action-btn" onclick="likePost(' + post.id + ')">❤️</button>';
        html += '<button class="post-action-btn" onclick="commentPost(' + post.id + ')">💬</button>';
        
        // Если админ - кнопки управления
        if (channelData.createdBy === currentUser.id) {
            html += '<button class="post-action-btn" onclick="editPost(' + post.id + ')">✏️</button>';
            html += '<button class="post-action-btn delete" onclick="deletePost(' + post.id + ')">🗑️</button>';
        }
        
        html += '</div>';
        
        // Комментарии (если есть)
        if (post.commentsList && post.commentsList.length > 0) {
            html += '<div class="post-comments">';
            for (let j = 0; j < post.commentsList.length; j++) {
                const comment = post.commentsList[j];
                html += '<div class="comment-item">';
                html += '<span class="comment-author">' + comment.author + ':</span>';
                html += '<span class="comment-text">' + comment.text + '</span>';
                html += '</div>';
            }
            html += '</div>';
        }
        
        html += '</div>';
    }
    
    postsContainer.innerHTML = html;
}

// Загрузка информации о канале (вкладка "О канале")
function loadAboutInfo() {
    document.getElementById('aboutDescription').textContent = channelData.description || 'Нет описания';
    
    const owner = users.find(u => u && u.id === channelData.createdBy);
    document.getElementById('aboutOwner').innerHTML = owner ? 
        '<span class="owner-badge">👑 ' + owner.username + '</span>' : 
        '<span>Неизвестно</span>';
    
    const date = new Date(channelData.createdAt).toLocaleString();
    document.getElementById('aboutDate').textContent = date;
    
    const inviteLink = document.getElementById('inviteLink');
    if (channelData.link) {
        inviteLink.textContent = 'https://helio.chat/join/' + channelData.link;
    } else if (channelData.type === 'public') {
        inviteLink.textContent = 'Канал публичный, можно подписаться';
    } else {
        inviteLink.textContent = 'Ссылка не создана';
    }
}

// Загрузка подписчиков
function loadMembers() {
    const membersContainer = document.getElementById('channelMembers');
    if (!membersContainer) return;
    
    if (!channelData.subscribers || channelData.subscribers.length === 0) {
        membersContainer.innerHTML = '<div class="no-members">👥 Нет подписчиков</div>';
        return;
    }
    
    let html = '<div class="members-list">';
    
    for (let i = 0; i < channelData.subscribers.length; i++) {
        const subscriberId = channelData.subscribers[i];
        const user = users.find(u => u && u.id === subscriberId);
        
        if (user) {
            const isOwner = channelData.createdBy === user.id;
            
            html += '<div class="member-item">';
            html += '<div class="member-avatar">' + (user.avatar || '👤') + '</div>';
            html += '<div class="member-info">';
            html += '<div class="member-name">' + user.username + (isOwner ? ' 👑' : '') + '</div>';
            html += '<div class="member-role">' + (isOwner ? 'Владелец' : 'Подписчик') + '</div>';
            html += '</div>';
            html += '</div>';
        }
    }
    
    html += '</div>';
    membersContainer.innerHTML = html;
}

// Переключение вкладок
function switchChannelTab(tab) {
    const tabs = document.querySelectorAll('.channel-tab');
    const posts = document.getElementById('channelPosts');
    const about = document.getElementById('channelAbout');
    const members = document.getElementById('channelMembers');
    
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    if (tab === 'posts') {
        tabs[0].classList.add('active');
        posts.style.display = 'block';
        about.style.display = 'none';
        members.style.display = 'none';
        loadPosts();
    } else if (tab === 'about') {
        tabs[1].classList.add('active');
        posts.style.display = 'none';
        about.style.display = 'block';
        members.style.display = 'none';
        loadAboutInfo();
    } else {
        tabs[2].classList.add('active');
        posts.style.display = 'none';
        about.style.display = 'none';
        members.style.display = 'block';
        loadMembers();
    }
}

// Подписаться/Отписаться
function toggleSubscribe() {
    if (!loadData()) return;
    
    const isSubscribed = channelData.subscribers && channelData.subscribers.includes(currentUser.id);
    
    if (isSubscribed) {
        // Отписаться
        channelData.subscribers = channelData.subscribers.filter(id => id !== currentUser.id);
        
        // Удаляем из пользовательских каналов
        const userChannels = JSON.parse(localStorage.getItem('userChannels_' + currentUser.id)) || [];
        const updatedUserChannels = userChannels.filter(uc => uc && uc.id !== channelId);
        localStorage.setItem('userChannels_' + currentUser.id, JSON.stringify(updatedUserChannels));
        
        alert('❌ Вы отписались от канала');
    } else {
        // Подписаться
        if (!channelData.subscribers) {
            channelData.subscribers = [];
        }
        channelData.subscribers.push(currentUser.id);
        
        // Добавляем в пользовательские каналы
        const userChannels = JSON.parse(localStorage.getItem('userChannels_' + currentUser.id)) || [];
        userChannels.push({
            id: channelId,
            name: channelData.name,
            avatar: channelData.avatar,
            role: 'subscriber',
            createdAt: Date.now()
        });
        localStorage.setItem('userChannels_' + currentUser.id, JSON.stringify(userChannels));
        
        alert('✅ Вы подписались на канал');
    }
    
    // Сохраняем изменения
    const channelIndex = allChannels.findIndex(ch => ch && ch.id === channelId);
    allChannels[channelIndex] = channelData;
    localStorage.setItem('channels', JSON.stringify(allChannels));
    
    // Обновляем интерфейс
    loadChannelInfo();
}

// Создать пост
function createPost() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="create-post-modal">
            <h3>📝 Создать пост</h3>
            
            <div class="form-group">
                <label>Текст поста</label>
                <textarea id="postText" rows="5" placeholder="Введите текст поста..."></textarea>
            </div>
            
            <div class="form-group">
                <label>Ссылка на изображение (необязательно)</label>
                <input type="text" id="postImage" placeholder="https://...">
            </div>
            
            <button class="create-btn" onclick="publishPost()">Опубликовать</button>
            <button class="close-modal-btn" onclick="closeModal()">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Публикация поста
function publishPost() {
    const postText = document.getElementById('postText');
    const postImage = document.getElementById('postImage');
    
    if (!postText || !postText.value.trim()) {
        alert('Введите текст поста');
        return;
    }
    
    if (!loadData()) return;
    
    const newPost = {
        id: Date.now(),
        authorId: currentUser.id,
        authorName: currentUser.username,
        authorAvatar: currentUser.avatar,
        text: postText.value.trim(),
        image: postImage ? postImage.value : null,
        time: Date.now(),
        views: 0,
        likes: 0,
        comments: 0,
        commentsList: []
    };
    
    if (!channelData.posts) {
        channelData.posts = [];
    }
    
    channelData.posts.push(newPost);
    
    const channelIndex = allChannels.findIndex(ch => ch && ch.id === channelId);
    allChannels[channelIndex] = channelData;
    localStorage.setItem('channels', JSON.stringify(allChannels));
    
    closeModal();
    loadPosts();
    alert('✅ Пост опубликован');
}

// Лайк поста
function likePost(postId) {
    if (!loadData()) return;
    
    const post = channelData.posts.find(p => p && p.id === postId);
    if (post) {
        post.likes = (post.likes || 0) + 1;
        
        const channelIndex = allChannels.findIndex(ch => ch && ch.id === channelId);
        allChannels[channelIndex] = channelData;
        localStorage.setItem('channels', JSON.stringify(allChannels));
        
        loadPosts();
    }
}

// Комментарий к посту
function commentPost(postId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="comment-modal">
            <h3>💬 Добавить комментарий</h3>
            
            <div class="form-group">
                <textarea id="commentText" rows="3" placeholder="Введите комментарий..."></textarea>
            </div>
            
            <button class="create-btn" onclick="addComment(${postId})">Отправить</button>
            <button class="close-modal-btn" onclick="closeModal()">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Добавить комментарий
function addComment(postId) {
    const commentText = document.getElementById('commentText');
    if (!commentText || !commentText.value.trim()) return;
    
    if (!loadData()) return;
    
    const post = channelData.posts.find(p => p && p.id === postId);
    if (post) {
        if (!post.commentsList) {
            post.commentsList = [];
        }
        
        post.commentsList.push({
            author: currentUser.username,
            text: commentText.value.trim(),
            time: Date.now()
        });
        
        post.comments = (post.comments || 0) + 1;
        
        const channelIndex = allChannels.findIndex(ch => ch && ch.id === channelId);
        allChannels[channelIndex] = channelData;
        localStorage.setItem('channels', JSON.stringify(allChannels));
        
        closeModal();
        loadPosts();
    }
}

// Редактировать канал
function editChannel() {
    if (!loadData()) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="edit-channel-modal">
            <h3>✏️ Редактировать канал</h3>
            
            <div class="form-group">
                <label>Название канала</label>
                <input type="text" id="editChannelName" value="${channelData.name || ''}">
            </div>
            
            <div class="form-group">
                <label>Описание</label>
                <textarea id="editChannelDesc" rows="3">${channelData.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>Аватар</label>
                <select id="editChannelAvatar">
                    <option value="📢" ${channelData.avatar === '📢' ? 'selected' : ''}>📢 Новости</option>
                    <option value="🎵" ${channelData.avatar === '🎵' ? 'selected' : ''}>🎵 Музыка</option>
                    <option value="🎬" ${channelData.avatar === '🎬' ? 'selected' : ''}>🎬 Кино</option>
                    <option value="📰" ${channelData.avatar === '📰' ? 'selected' : ''}>📰 Блог</option>
                    <option value="💡" ${channelData.avatar === '💡' ? 'selected' : ''}>💡 Идеи</option>
                    <option value="🔥" ${channelData.avatar === '🔥' ? 'selected' : ''}>🔥 Тренды</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Тип канала</label>
                <select id="editChannelType">
                    <option value="public" ${channelData.type === 'public' ? 'selected' : ''}>Публичный</option>
                    <option value="private" ${channelData.type === 'private' ? 'selected' : ''}>Приватный</option>
                </select>
            </div>
            
            <button class="create-btn" onclick="saveChannelChanges()">Сохранить</button>
            <button class="close-modal-btn" onclick="closeModal()">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Сохранить изменения канала
function saveChannelChanges() {
    const newName = document.getElementById('editChannelName');
    const newDesc = document.getElementById('editChannelDesc');
    const newAvatar = document.getElementById('editChannelAvatar');
    const newType = document.getElementById('editChannelType');
    
    if (!newName || !newName.value) {
        alert('Введите название канала');
        return;
    }
    
    if (!loadData()) return;
    
    channelData.name = newName.value;
    channelData.description = newDesc ? newDesc.value : '';
    channelData.avatar = newAvatar ? newAvatar.value : '📢';
    channelData.type = newType ? newType.value : 'public';
    
    if (channelData.type === 'private' && !channelData.link) {
        channelData.link = generateInviteLink();
    }
    
    const channelIndex = allChannels.findIndex(ch => ch && ch.id === channelId);
    allChannels[channelIndex] = channelData;
    localStorage.setItem('channels', JSON.stringify(allChannels));
    
    closeModal();
    loadChannelInfo();
    alert('✅ Канал обновлен');
}

// Удалить канал
function deleteChannel() {
    if (!confirm('Точно удалить канал? Это действие нельзя отменить!')) return;
    
    if (!loadData()) return;
    
    // Удаляем из всех подписчиков
    if (channelData.subscribers) {
        for (let i = 0; i < channelData.subscribers.length; i++) {
            const userId = channelData.subscribers[i];
            const userChannels = JSON.parse(localStorage.getItem('userChannels_' + userId)) || [];
            const updated = userChannels.filter(uc => uc && uc.id !== channelId);
            localStorage.setItem('userChannels_' + userId, JSON.stringify(updated));
        }
    }
    
    // Удаляем канал
    const updatedChannels = allChannels.filter(ch => ch && ch.id !== channelId);
    localStorage.setItem('channels', JSON.stringify(updatedChannels));
    
    alert('🗑️ Канал удален');
    window.location.href = 'chat.html';
}

// Скопировать ссылку
function copyInviteLink() {
    const link = document.getElementById('inviteLink').textContent;
    navigator.clipboard.writeText(link);
    alert('✅ Ссылка скопирована');
}

// Показать меню канала
function showChannelMenu() {
    const menu = document.createElement('div');
    menu.className = 'channel-menu';
    menu.innerHTML = `
        <div class="channel-menu-item" onclick="shareChannel()">🔗 Поделиться</div>
        <div class="channel-menu-item" onclick="reportChannel()">⚠️ Пожаловаться</div>
        <div class="channel-menu-item" onclick="blockChannel()">🚫 Заблокировать</div>
    `;
    
    document.body.appendChild(menu);
    
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 100);
}

// Назад
function goBack() {
    window.location.href = 'chat.html';
}

// Генерация ссылки
function generateInviteLink() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let link = '';
    for (let i = 0; i < 10; i++) {
        link += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return link;
}

// Закрыть модальное окно
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    for (let i = 0; i < modals.length; i++) {
        modals[i].remove();
    }
}

// Инициализация
loadChannelInfo();
loadPosts();

// Автообновление
setInterval(() => {
    loadData();
    loadChannelInfo();
    
    const activeTab = document.querySelector('.channel-tab.active');
    if (activeTab) {
        if (activeTab.textContent.includes('Посты')) {
            loadPosts();
        } else if (activeTab.textContent.includes('Подписчики')) {
            loadMembers();
        }
    }
}, 5000);
// Добавить после загрузки названия
const channelUsername = document.createElement('div');
channelUsername.className = 'channel-username-header';
channelUsername.textContent = '@' + (channelData.username || 'channel');
document.querySelector('.channel-title-info').appendChild(channelUsername);