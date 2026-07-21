import getDb from './db';

export function getSettings() {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM Setting').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return {
    whatsappNumber: settings.whatsapp_number || '+201154705008',
    defaultProfitMargin: parseFloat(settings.default_profit_margin || '20'),
    nonArabicSurcharge: parseFloat(settings.non_arabic_surcharge || '500'),
    adminPassword: settings.admin_password || 'omYoussef2024',
    storeNameAr: settings.store_name_ar || 'أم يوسف',
    storeNameEn: settings.store_name_en || 'Om Youssef',
    heroImageUrl: settings.hero_image_url || '',
  };
}

export function calculateSellingPrice(
  dozenPrice: number,
  profitMargin: number,
  isArabic: boolean
): number {
  const perPieceCost = dozenPrice / 12;
  const arabicPrice = perPieceCost + (perPieceCost * profitMargin / 100);
  
  if (isArabic) {
    return Math.ceil(arabicPrice);
  }
  
  const settings = getSettings();
  return Math.ceil(arabicPrice + settings.nonArabicSurcharge);
}

export function formatPrice(price: number, locale: string): string {
  const formatted = price.toLocaleString(locale === 'ar' ? 'ar-EG' : locale);
  return `${formatted} ${locale === 'ar' ? 'ج.م' : 'EGP'}`;
}
