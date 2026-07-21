// LibreTranslate integration
const LIBRETRANSLATE_URL = 'https://libretranslate.com/translate';

const langMap: Record<string, string> = {
  ar: 'ar',
  en: 'en',
  fr: 'fr',
  sw: 'sw',
  ha: 'ha',
  rw: 'rw', // Note: LibreTranslate may not support rw/ha; fallback to en
};

const fallbackLang: Record<string, string> = {
  ha: 'en',
  rw: 'en',
  sw: 'en',
};

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  if (!text || sourceLang === targetLang) return text;

  const source = langMap[sourceLang] || 'ar';
  let target = langMap[targetLang] || 'en';

  // Fallback for unsupported languages
  if (!['ar', 'en', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'].includes(target)) {
    target = fallbackLang[targetLang] || 'en';
  }

  try {
    const response = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source,
        target,
        format: 'text',
      }),
    });

    if (!response.ok) {
      console.error('Translation failed:', response.status);
      return text;
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

export async function translateProduct(
  nameAr: string,
  descriptionAr: string
): Promise<{
  nameEn: string; nameFr: string; nameSw: string; nameHa: string; nameRw: string;
  descriptionEn: string; descriptionFr: string; descriptionSw: string; descriptionHa: string; descriptionRw: string;
}> {
  const targets = ['en', 'fr', 'sw', 'ha', 'rw'];
  const results: Record<string, string> = {};
  const descResults: Record<string, string> = {};

  // Translate name
  for (const lang of targets) {
    results[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}`] = await translateText(nameAr, 'ar', lang);
  }

  // Translate description
  if (descriptionAr) {
    for (const lang of targets) {
      descResults[`description${lang.charAt(0).toUpperCase() + lang.slice(1)}`] = await translateText(descriptionAr, 'ar', lang);
    }
  }

  return {
    nameEn: results.nameEn || '',
    nameFr: results.nameFr || '',
    nameSw: results.nameSw || '',
    nameHa: results.nameHa || '',
    nameRw: results.nameRw || '',
    descriptionEn: descResults.descriptionEn || '',
    descriptionFr: descResults.descriptionFr || '',
    descriptionSw: descResults.descriptionSw || '',
    descriptionHa: descResults.descriptionHa || '',
    descriptionRw: descResults.descriptionRw || '',
  };
}
