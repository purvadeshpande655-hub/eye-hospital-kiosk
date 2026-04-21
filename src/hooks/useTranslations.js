import { useState, useEffect } from 'react';
import translations from '../translations/translations';

export const useTranslations = (language) => {
  const [t, setT] = useState(translations[language] || translations.English);

  useEffect(() => {
    setT(translations[language] || translations.English);
  }, [language]);

  return t;
};
