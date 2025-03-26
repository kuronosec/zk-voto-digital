// src/i18n.tsx
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import resources
const resources = {
  en: {
    translation: require('./locales/en/translation.json')
  },
  es: {
    translation: require('./locales/es/translation.json')
  }
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'en', // Usa localStorage directamente
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already handles escaping
    }
  });

export default i18n;
