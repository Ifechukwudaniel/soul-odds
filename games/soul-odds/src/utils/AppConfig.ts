import type { LocalePrefixMode } from 'next-intl/routing';

const localePrefix: LocalePrefixMode = 'as-needed';

// FIXME: Customize this configuration for your product
export const AppConfig = {
  name: 'Mortal Odds',
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    localePrefix,
  },
};
