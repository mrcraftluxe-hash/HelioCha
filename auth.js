// ========== ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ ==========
function showStart() {
    document.getElementById('startScreen').style.display = 'block';
    document.getElementById('phoneScreen').style.display = 'none';
    document.getElementById('codeScreen').style.display = 'none';
}

function showPhoneInput() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('phoneScreen').style.display = 'block';
    document.getElementById('codeScreen').style.display = 'none';
}

function showPhone() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('phoneScreen').style.display = 'block';
    document.getElementById('codeScreen').style.display = 'none';
}

function showCode() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('phoneScreen').style.display = 'none';
    document.getElementById('codeScreen').style.display = 'block';
    
    // фокус на первый символ
    setTimeout(() => {
        document.getElementById('code1').focus();
    }, 100);
}

// ========== ГЕНЕРАЦИЯ КОДА ==========
function generateCode() {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

// ========== ОТПРАВКА КОДА НА НОМЕР ==========
function sendPhoneCode() {
    const countryCode = document.getElementById('countryCode').value;
    const phoneNumber = document.getElementById('phoneNumber').value.replace(/\D/g, '');
    
    if (!phoneNumber || phoneNumber.length < 10) {
        alert('❌ Введите правильный номер');
        return;
    }
    
    const fullPhone = countryCode + phoneNumber;
    const code = generateCode();
    
    // сохраняем
    localStorage.setItem('verificationPhone', fullPhone);
    localStorage.setItem('verificationCode', code);
    
    // показываем номер
    document.getElementById('displayPhone').textContent = fullPhone;
    
    // показываем код на экране (для теста)
    document.getElementById('codeHint').innerHTML = `📱 Тестовый код: <strong>${code}</strong>`;
    
    // очищаем поля кода
    for (let i = 1; i <= 6; i++) {
        document.getElementById('code' + i).value = '';
    }
    
    showCode();
}

// ========== ПЕРЕМЕЩЕНИЕ МЕЖДУ ЦИФРАМИ ==========
function moveToNext(current, nextId) {
    if (current.value.length === 1) {
        if (nextId === 'done') {
            // если последний символ, проверяем код
            verifyPhoneCode();
        } else {
            document.getElementById(nextId).focus();
        }
    }
}

// ========== ПРОВЕРКА КОДА ==========
function verifyPhoneCode() {
    // собираем код из полей
    let code = '';
    for (let i = 1; i <= 6; i++) {
        code += document.getElementById('code' + i).value;
    }
    
    const savedCode = localStorage.getItem('verificationCode');
    const phone = localStorage.getItem('verificationPhone');
    
    if (code.length !== 6) {
        alert('❌ Введите код полностью');
        return;
    }
    
    if (code !== savedCode) {
        alert('❌ Неверный код');
        return;
    }
    
    // ищем пользователя
    let users = JSON.parse(localStorage.getItem('helioUsers')) || [];
    let user = users.find(u => u && u.phone === phone);
    
    if (!user) {
        // если нет - создаем нового
        const name = 'User_' + Math.floor(Math.random() * 1000);
        user = {
            id: Date.now(),
            phone: phone,
            name: name,
            username: 'user_' + Date.now().toString().slice(-6),
            avatar: '😊',
            createdAt: new Date().toLocaleString()
        };
        users.push(user);
        localStorage.setItem('helioUsers', JSON.stringify(users));
    }
    
    // входим
    localStorage.setItem('helioCurrentUser', JSON.stringify(user));
    window.location.href = 'chat.html';
}

// ========== ПЕРЕОТПРАВКА КОДА ==========
function resendCode() {
    const phone = localStorage.getItem('verificationPhone');
    const newCode = generateCode();
    
    localStorage.setItem('verificationCode', newCode);
    document.getElementById('codeHint').innerHTML = `📱 Новый код: <strong>${newCode}</strong>`;
    
    alert('✅ Код отправлен заново');
}

// ========== ПРОВЕРКА АВТОРИЗАЦИИ ==========
function checkAuth() {
    const user = localStorage.getItem('helioCurrentUser');
    return user ? JSON.parse(user) : null;
}

// ========== ВЫХОД ==========
function logout() {
    localStorage.removeItem('helioCurrentUser');
    window.location.href = 'index.html';
}

// ========== СОЗДАЕМ ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ ==========
(function initTestUser() {
    let users = JSON.parse(localStorage.getItem('helioUsers')) || [];
    
    const testExists = users.some(u => u && u.phone === '+79991234567');
    
    if (!testExists) {
        users.push({
            id: 999,
            phone: '+79991234567',
            name: 'Тест',
            username: 'test',
            avatar: '😊',
            createdAt: new Date().toLocaleString()
        });
        localStorage.setItem('helioUsers', JSON.stringify(users));
    }
})();

// ========== ЗАПРОС КОДА ==========
function requestCode() {
    const phone = document.getElementById('regPhone').value.trim();
    
    if (!phone) {
        alert('❌ Введите номер');
        return;
    }
    
    const code = Math.floor(100000 + Math.random() * 900000); // 6-значный код
    
    localStorage.setItem('verificationCode', code.toString());
    localStorage.setItem('verificationPhone', phone);
    
    alert('✅ Код: ' + code); // код приходит сюда
    
    document.getElementById('codeGroup').style.display = 'block';
    document.getElementById('requestCodeBtn').style.display = 'none';
    document.getElementById('verifyCodeBtn').style.display = 'block';
}

// ========== ПРОВЕРКА КОДА ==========
function verifyCode() {
    const code = document.getElementById('regCode').value.trim();
    const savedCode = localStorage.getItem('verificationCode');
    
    if (code === savedCode) {
        alert('✅ Код верный!');
        // тут регистрация
    } else {
        alert('❌ Неверный код');
    }
}