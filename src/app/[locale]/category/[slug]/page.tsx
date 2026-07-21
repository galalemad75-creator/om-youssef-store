import { getCategoryBySlug, getProducts, getSettings } from '@/lib/db';
import { calculateSellingPrice, formatPrice } from '@/lib/pricing';
import { getMessages, getNestedValue } from '@/i18n/getMessages';
import { type Locale } from '@/i18n/config';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const validLocale = (['ar', 'en', 'fr', 'sw', 'ha', 'rw'].includes(locale) ? locale : 'ar') as Locale;
  const messages = getMessages(validLocale);
  const t = (key: string) => getNestedValue(messages, key);
  const isArabic = validLocale === 'ar';

  const category = await getCategoryBySlug(slug);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('common.error')}</h1>
        <Link href={`/${validLocale}`} className="btn-primary">{t('common.back')}</Link>
      </div>
    );
  }

  const catName = (category[`name_${validLocale}`] as string) || (category.name_ar as string);
  const bannerUrl = category.banner_url as string | null;

  const products = await getProducts(category.id as number);
  const settings = await getSettings();
  const surcharge = parseFloat(settings.non_arabic_surcharge || '500');

  const getNameField = (row: Record<string, unknown>, prefix: string) => {
    const key = `${prefix}_${validLocale}`;
    return (row[key] as string) || (row[`${prefix}_ar`] as string) || '';
  };

  const productsWithPrice = products.map((product: Record<string, unknown>) => ({
    id: product.id as number,
    nameAr: product.name_ar as string,
    name: getNameField(product, 'name'),
    price: calculateSellingPrice(product.dozen_price as number, product.profit_margin as number, isArabic, surcharge),
    formattedPrice: formatPrice(
      calculateSellingPrice(product.dozen_price as number, product.profit_margin as number, isArabic, surcharge),
      validLocale
    ),
    imageUrl: product.image_url as string | undefined,
    material: product.material as string | undefined,
    categorySlug: product.category_slug as string | undefined,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href={`/${validLocale}`} className="hover:text-[var(--color-primary)]">{t('nav.home')}</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-primary)]">{catName}</span>
      </nav>

      <div className="mb-8">
        {bannerUrl && (
          <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-6">
            <img src={bannerUrl} alt={catName} className="w-full h-full object-contain bg-gray-50" />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{catName}</h1>
            </div>
          </div>
        )}
        {!bannerUrl && (
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>{catName}</h1>
        )}
        <p className="text-gray-500">{productsWithPrice.length} {t('categories.products')}</p>
      </div>

      {productsWithPrice.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {productsWithPrice.map((product) => (
            <ProductCard key={product.id} product={product} locale={validLocale} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">{t('categories.noProducts')}</p>
        </div>
      )}
    </div>
  );
}
