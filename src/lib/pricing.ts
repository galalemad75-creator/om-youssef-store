export function calculateSellingPrice(
  dozenPrice: number,
  profitMargin: number,
  isArabic: boolean,
  nonArabicSurcharge = 500
): number {
  const perPieceCost = dozenPrice / 12;
  const arabicPrice = perPieceCost + (perPieceCost * profitMargin / 100);

  if (isArabic) {
    return Math.ceil(arabicPrice);
  }

  return Math.ceil(arabicPrice + nonArabicSurcharge);
}

export function formatPrice(price: number, locale: string): string {
  const formatted = price.toLocaleString(locale === 'ar' ? 'ar-EG' : locale);
  return `${formatted} ${locale === 'ar' ? 'ج.م' : 'EGP'}`;
}
