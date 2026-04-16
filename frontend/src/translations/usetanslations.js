import translations from '../translations'; // adjust path if needed

export const useTranslations = (lang) => {
  return translations[lang] || translations['English'];
};