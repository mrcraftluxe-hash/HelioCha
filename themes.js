// themes.js
export const themes = {
  // Светлые темы (3 варианта)
  light: {
    id: 'light-default',
    name: 'Светлая (По умолчанию)',
    type: 'light',
    colors: {
      primary: '#0084ff',
      background: '#ffffff',
      surface: '#f0f2f5',
      text: '#050505',
      textSecondary: '#65676b',
      border: '#ced0d4',
      messageOut: '#0084ff',
      messageIn: '#e4e6eb',
      messageOutText: '#ffffff',
      messageInText: '#050505',
      icon: '#050505',
      hover: '#f0f2f5',
    }
  },
  lightWarm: {
    id: 'light-warm',
    name: 'Тёплая светлая',
    type: 'light',
    colors: {
      primary: '#d86b2c',
      background: '#fef6f0',
      surface: '#fae9dd',
      text: '#442b18',
      textSecondary: '#7a5a3e',
      border: '#e6c9b5',
      messageOut: '#d86b2c',
      messageIn: '#fae2d4',
      messageOutText: '#ffffff',
      messageInText: '#442b18',
      icon: '#442b18',
      hover: '#fae9dd',
    }
  },
  lightCool: {
    id: 'light-cool',
    name: 'Прохладная светлая',
    type: 'light',
    colors: {
      primary: '#2e7d8c',
      background: '#f0f7fa',
      surface: '#e1f0f5',
      text: '#1a3b44',
      textSecondary: '#3e6b78',
      border: '#b8d4de',
      messageOut: '#2e7d8c',
      messageIn: '#d9ecf2',
      messageOutText: '#ffffff',
      messageInText: '#1a3b44',
      icon: '#1a3b44',
      hover: '#e1f0f5',
    }
  },

  // Тёмные темы (3 варианта)
  dark: {
    id: 'dark-default',
    name: 'Тёмная (По умолчанию)',
    type: 'dark',
    colors: {
      primary: '#2b89ff',
      background: '#1a1d21',
      surface: '#2f3337',
      text: '#e4e6eb',
      textSecondary: '#b0b3b8',
      border: '#3e4042',
      messageOut: '#2b89ff',
      messageIn: '#3a3b3d',
      messageOutText: '#ffffff',
      messageInText: '#e4e6eb',
      icon: '#e4e6eb',
      hover: '#3a3b3d',
    }
  },
  darkPurple: {
    id: 'dark-purple',
    name: 'Тёмно-фиолетовая',
    type: 'dark',
    colors: {
      primary: '#bb86fc',
      background: '#1a1625',
      surface: '#2a2438',
      text: '#e6d9fa',
      textSecondary: '#c2b0e6',
      border: '#3d3550',
      messageOut: '#bb86fc',
      messageIn: '#352f44',
      messageOutText: '#1a1625',
      messageInText: '#e6d9fa',
      icon: '#e6d9fa',
      hover: '#352f44',
    }
  },
  darkGreen: {
    id: 'dark-green',
    name: 'Тёмно-зелёная',
    type: 'dark',
    colors: {
      primary: '#4caf7a',
      background: '#132218',
      surface: '#1e3325',
      text: '#c8e6d9',
      textSecondary: '#9fccb5',
      border: '#2a4833',
      messageOut: '#4caf7a',
      messageIn: '#264d33',
      messageOutText: '#ffffff',
      messageInText: '#c8e6d9',
      icon: '#c8e6d9',
      hover: '#264d33',
    }
  }
};

// Получить тему по ID
export const getThemeById = (id) => {
  return Object.values(themes).find(theme => theme.id === id) || themes.light;
};

// Начальная тема (можно брать из localStorage позже)
export const defaultTheme = themes.light;