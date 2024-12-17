import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import resources
const resources = {
  en: {
    translation: require('./public/locales/en/translation.json')
  },
  es: {
    translation: require('./public/locales/es/translation.json')
  }
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'es', // Fallback language if translation is missing
    interpolation: {
      escapeValue: false // React already handles escaping
    }
  });

export default i18n;
