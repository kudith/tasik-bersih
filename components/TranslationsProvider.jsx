'use client';

import { I18nextProvider } from 'react-i18next';
import { useEffect, useState } from 'react';
import initTranslations from '@/app/i18n';
import { createInstance } from 'i18next';

export default function TranslationsProvider({ children, locale, namespaces, resources }) {
  const [i18n, setI18n] = useState(null);

  useEffect(() => {
    const i18nInstance = createInstance();
    initTranslations(locale, namespaces, i18nInstance, resources).then(() => {
      setI18n(i18nInstance);
    });
  }, [locale, namespaces, resources]);

  if (!i18n) {
    return null; // or a loading spinner
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}