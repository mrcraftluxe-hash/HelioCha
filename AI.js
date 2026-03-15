// ========== ИИ ПОМОЩНИК ==========
const AI_ASSISTANT = {
    id: 'ai_assistant',
    name: '🤖 AI Помощник',
    avatar: '🤖',
    username: 'aihelper'
};

// ========== БАЗА ЗНАНИЙ ИИ ==========
const AI_KNOWLEDGE = {
    // приветствия
    'привет': ['Привет! 👋', 'Здравствуй!', 'Хай! Чем помочь?'],
    'здравствуй': ['Привет!', 'Добрый день!', 'Рад тебя видеть!'],
    'хай': ['Хеллоу!', 'Приветики!', 'Здарова!'],
    
    // как дела
    'как дела': ['Отлично! А у тебя?', 'Норм, работаю', 'Хорошо, спасибо!'],
    'что делаешь': ['Помогаю людям', 'Отвечаю на вопросы', 'Тут, болтаю с тобой'],
    
    // функции мессенджера
    'кристаллы': ['💎 Кристаллы можно купить в магазине или получить за активность', 'Хочешь узнать сколько у тебя кристаллов?'],
    'подарки': ['🎁 Подарки дарят друзьям! Зайди в раздел Подарки в меню', 'Можешь подарить цветы, мишку или даже остров!'],
    'vip': ['⭐ VIP статус дает крутые фишки: цветной ник, невидимку и многое другое'],
    'чат': ['💬 Чтобы начать чат, нажми плюсик и выбери пользователя'],
    'канал': ['📢 В каналах можно читать новости и посты', 'Хочешь создать свой канал?'],
    
    // помощь
    'помощь': ['Чем помочь?', 'Задай вопрос, я постараюсь ответить'],
    'спасибо': ['Пожалуйста! 😊', 'Рад помочь!', 'Обращайся!'],
    'пока': ['Пока! 👋', 'До встречи!', 'Заходи еще!'],
    
    // шутки
    'шутка': ['Почему программисты путают Хэллоуин и Рождество? Потому что Oct 31 == Dec 25!', 
              'Что сказал один байт другому? "Ты выглядишь bit-о уставшим!"',
              'Зачем гусю очки? Чтобы видеть, куда гоготать!'],
    
    // информация о боте
    'кто ты': ['Я ИИ помощник в этом мессенджере 🤖', 'Меня создали чтобы помогать пользователям'],
    'твое имя': ['Меня зовут AI Helper', 'Просто называй меня ИИ'],
    
    // погода (заглушка)
    'погода': ['Солнечно, настроение отличное!', 'Не знаю, я же в телефоне сижу'],
    
    // время
    'время': ['Сейчас ' + new Date().toLocaleTimeString(), 'Посмотри в углу экрана :)'],
    'дата': ['Сегодня ' + new Date().toLocaleDateString()]
};

// ========== ОБЩИЕ ФРАЗЫ ==========
const AI_FALLBACK = [
    'Я не совсем понял... Можешь перефразировать?',
    'Интересный вопрос! Но я пока не знаю ответа',
    'Хм, давай поговорим о чем-то другом?',
    'Я учусь, спроси что-то попроще',
    'Не нашел информацию по этому вопросу',
    'Может спросишь про подарки или кристаллы?'
];

// ========== ФУНКЦИЯ ПОИСКА ОТВЕТА ==========
function getAIResponse(message) {
    const text = message.toLowerCase().trim();
    
    // ищем точное совпадение
    for (let key in AI_KNOWLEDGE) {
        if (text.includes(key)) {
            const answers = AI_KNOWLEDGE[key];
            return answers[Math.floor(Math.random() * answers.length)];
        }
    }
    
    // ищем по ключевым словам
    if (text.includes('как') && text.includes('кристалл')) {
        return AI_KNOWLEDGE['кристаллы'][0];
    }
    if (text.includes('как') && text.includes('подарок')) {
        return AI_KNOWLEDGE['подарки'][0];
    }
    if (text.includes('что') && text.includes('vip')) {
        return AI_KNOWLEDGE['vip'][0];
    }
    if (text.includes('создать') && text.includes('чат')) {
        return AI_KNOWLEDGE['чат'][0];
    }
    if (text.includes('создать') && text.includes('канал')) {
        return AI_KNOWLEDGE['канал'][1];
    }
    
    // если ничего не нашли - случайный ответ
    return AI_FALLBACK[Math.floor(Math.random() * AI_FALLBACK.length)];
}

// ========== ОТПРАВИТЬ СООБЩЕНИЕ ОТ ИИ ==========
function sendAIMessage(userId, text) {
    try {
        // получаем все сообщения
        let messages = JSON.parse(localStorage.getItem('helioMessages')) || [];
        
        // создаем сообщение от ИИ
        const aiMessage = {
            id: Date.now(),
            from: 'ai_assistant',
            to: userId,
            text: text,
            time: Date.now(),
            read: false
        };
        
        messages.push(aiMessage);
        localStorage.setItem('helioMessages', JSON.stringify(messages));
        
        console.log('AI ответил:', text);
    } catch (e) {
        console.log('ошибка отправки AI:', e);
    }
}

// ========== СОЗДАТЬ ЧАТ С ИИ ==========
function createAIChat() {
    if (!currentUser) return;
    
    try {
        // проверяем есть ли уже чат с AI
        let userChats = JSON.parse(localStorage.getItem('userChats_' + currentUser.id)) || [];
        const existingChat = userChats.find(chat => chat && chat.id === 'ai_assistant');
        
        if (!existingChat) {
            // создаем новый чат с AI
            userChats.push({
                id: 'ai_assistant',
                type: 'private',
                withUser: 'ai_assistant',
                userName: AI_ASSISTANT.name,
                userAvatar: AI_ASSISTANT.avatar,
                createdAt: Date.now()
            });
            localStorage.setItem('userChats_' + currentUser.id, JSON.stringify(userChats));
        }
        
        // открываем чат
        localStorage.setItem('activeChat', 'ai_assistant');
        window.location.href = 'messages.html';
        
    } catch (e) {
        console.log('ошибка создания AI чата:', e);
    }
}

// ========== ОБРАБОТКА СООБЩЕНИЯ ДЛЯ AI ==========
function handleAIMessage(message) {
    if (!message || message.from === 'ai_assistant') return;
    
    // получаем ответ
    const response = getAIResponse(message.text);
    
    // отправляем через 1-2 секунды (имитация печатания)
    setTimeout(() => {
        sendAIMessage(message.from, response);
    }, 1000 + Math.random() * 1000);
}

// ========== ПРОВЕРКА НОВЫХ СООБЩЕНИЙ ДЛЯ AI ==========
function checkAIMessages() {
    try {
        let messages = JSON.parse(localStorage.getItem('helioMessages')) || [];
        
        // ищем сообщения адресованные AI
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            if (msg && msg.to === 'ai_assistant' && !msg.aiProcessed) {
                // помечаем как обработанное
                msg.aiProcessed = true;
                localStorage.setItem('helioMessages', JSON.stringify(messages));
                
                // отвечаем
                handleAIMessage(msg);
            }
        }
    } catch (e) {
        console.log('ошибка проверки AI:', e);
    }
}

// ========== ДОБАВИТЬ AI В СПИСОК ПОЛЬЗОВАТЕЛЕЙ ==========
function addAIUser() {
    try {
        let users = JSON.parse(localStorage.getItem('helioUsers')) || [];
        
        // проверяем есть ли уже AI
        const existingAI = users.find(u => u.id === 'ai_assistant');
        
        if (!existingAI) {
            users.push({
                id: 'ai_assistant',
                username: 'AI Помощник',
                userUsername: 'aihelper',
                displayName: '🤖 AI Помощник',
                avatar: '🤖',
                email: 'ai@helio.chat',
                password: 'ai123',
                createdAt: Date.now()
            });
            localStorage.setItem('helioUsers', JSON.stringify(users));
            console.log('✅ AI помощник добавлен');
        }
    } catch (e) {
        console.log('ошибка добавления AI:', e);
    }
}

// ========== ЗАПУСК AI ==========
addAIUser();
setInterval(checkAIMessages, 3000); // проверяем каждые 3 секунды