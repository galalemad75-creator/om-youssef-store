export const locales = ['ar', 'en', 'fr', 'sw', 'ha', 'rw'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ar';

export const localeNames: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français',
  sw: 'Kiswahili',
  ha: 'Hausa',
  rw: 'Kinyarwanda',
};

export const rtlLocales: Locale[] = ['ar'];
export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
