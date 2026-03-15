// Открыть/закрыть меню
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

// Закрыть меню
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

// Открыть настройки
function openSettings() {
    closeMenu();
    // Здесь будет открытие настроек
    alert('Настройки (в разработке)');
}

// Открыть кристаллы
function openCrystals() {
    closeMenu();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="crystals-modal">
            <h3>💎 Кристаллы</h3>
            <div class="crystals-balance">
                <span class="crystal-icon">💎</span>
                <span class="crystal-amount">150</span>
            </div>
            
            <div class="crystals-shop">
                <div class="crystal-pack" onclick="buyCrystals(100)">
                    <span class="pack-amount">100 💎</span>
                    <span class="pack-price">99₽</span>
                </div>
                <div class="crystal-pack" onclick="buyCrystals(500)">
                    <span class="pack-amount">500 💎</span>
                    <span class="pack-price">399₽</span>
                </div>
                <div class="crystal-pack" onclick="buyCrystals(1000)">
                    <span class="pack-amount">1000 💎</span>
                    <span class="pack-price">699₽</span>
                </div>
                <div class="crystal-pack vip" onclick="buyCrystals(5000)">
                    <span class="pack-amount">5000 💎</span>
                    <span class="pack-price">2999₽</span>
                    <span class="vip-badge">VIP</span>
                </div>
            </div>
            
            <button class="close-modal-btn" onclick="closeModal()">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Купить кристаллы
function buyCrystals(amount) {
    alert(`Покупка ${amount} кристаллов (тестовая функция)`);
}

// Открыть VIP
function openVIP() {
    closeMenu();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="vip-modal">
            <h3>⭐ VIP Статус</h3>
            
            <div class="vip-card current">
                <div class="vip-title">Текущий статус</div>
                <div class="vip-status">Нет VIP</div>
            </div>
            
            <div class="vip-plans">
                <div class="vip-plan" onclick="buyVIP('month')">
                    <span class="plan-name">VIP на месяц</span>
                    <span class="plan-price">199₽</span>
                    <span class="plan-features">✅ Без рекламы</span>
                    <span class="plan-features">✅ Стикеры</span>
                </div>
                
                <div class="vip-plan" onclick="buyVIP('year')">
                    <span class="plan-name">VIP на год</span>
                    <span class="plan-price">999₽</span>
                    <span class="plan-features">✅ Все функции</span>
                    <span class="plan-features">✅ Эксклюзив</span>
                    <span class="plan-features">✅ Приоритет</span>
                </div>
            </div>
            
            <button class="close-modal-btn" onclick="closeModal()">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Купить VIP
function buyVIP(period) {
    alert(`Покупка VIP на ${period} (тестовая функция)`);
}

// Открыть избранное
function openFavorites() {
    closeMenu();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="favorites-modal">
            <h3>❤️ Избранное</h3>
            <div class="favorites-list">
                <div class="favorite-empty">Нет избранных чатов</div>
            </div>
            <button class="close-modal-btn" onclick="closeModal()">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Открыть настройки VIP
function openVIPSettings() {
    closeMenu();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="vip-settings-modal">
            <h3>⚡ Настройки VIP</h3>
            
            <div class="vip-setting">
                <label>Невидимка</label>
                <input type="checkbox" id="vipInvisible">
            </div>
            
            <div class="vip-setting">
                <label>Свой статус</label>
                <input type="text" placeholder="Введите статус">
            </div>
            
            <div class="vip-setting">
                <label>Цвет ника</label>
                <select>
                    <option>Золотой</option>
                    <option>Красный</option>
                    <option>Синий</option>
                </select>
            </div>
            
            <div class="vip-note">Доступно только с VIP статусом</div>
            
            <button class="close-modal-btn" onclick="closeModal()">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Открыть помощь
function openHelp() {
    closeMenu();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="help-modal">
            <h3>❓ Помощь</h3>
            
            <div class="help-item" onclick="showHelp('chats')">
                <span>Как создать чат?</span>
                <span>→</span>
            </div>
            
            <div class="help-item" onclick="showHelp('messages')">
                <span>Как удалить сообщение?</span>
                <span>→</span>
            </div>
            
            <div class="help-item" onclick="showHelp('vip')">
                <span>Что дает VIP?</span>
                <span>→</span>
            </div>
            
            <div class="help-item" onclick="showHelp('crystals')">
                <span>Как получить кристаллы?</span>
                <span>→</span>
            </div>
            
            <button class="close-modal-btn" onclick="closeModal()">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Показать справку
function showHelp(topic) {
    alert('Помощь по разделу (тестовая функция)');
}

// Закрыть модальное окно
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.remove());
}

// Закрыть меню при клике вне
document.addEventListener('click', function(e) {
    const menu = document.getElementById('sideMenu');
    const menuBtn = document.querySelector('.menu-btn');
    
    if (menu && menu.classList.contains('open')) {
        if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
            toggleMenu();
        }
    }
});