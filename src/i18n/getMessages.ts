import { Locale } from './config';
import ar from './messages/ar.json';
import en from './messages/en.json';
import fr from './messages/fr.json';
import sw from './messages/sw.json';
import ha from './messages/ha.json';
import rw from './messages/rw.json';

const messages: Record<Locale, Record<string, unknown>> = { ar, en, fr, sw, ha, rw };

export function getMessages(locale: Locale): Record<string, unknown> {
  return messages[locale] || messages.ar;
}

export function getNestedValue(obj: unknown, path: string): string {
  return path.split('.').reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return path;
  }, obj) as string;
}
