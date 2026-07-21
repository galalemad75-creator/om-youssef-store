import { getCategories, getProducts, getSettings } from '@/lib/db';
import { calculateSellingPrice, formatPrice } from '@/lib/pricing';
import { getMessages, getNestedValue } from '@/i18n/getMessages';
import { type Locale } from '@/i18n/config';
import CategoryCarousel from '@/components/CategoryCarousel';
import ProductCarousel from '@/components/ProductCarousel';
import HeroBanner from '@/components/HeroBanner';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = (['ar', 'en', 'fr', 'sw', 'ha', 'rw'].includes(locale) ? locale : 'ar') as Locale;
  const messages = getMessages(validLocale);
  const t = (key: string) => getNestedValue(messages, key);
  const isArabic = validLocale === 'ar';

  const categories = await getCategories();
  const products = await getProducts(undefined, true, 12);
  const settings = await getSettings();
  const heroImage = settings.hero_image_url || '';
  const surcharge = parseFloat(settings.non_arabic_surcharge || '500');

  const getNameField = (row: Record<string, unknown>, prefix: string) => {
    const key = `${prefix}_${validLocale}`;
    return (row[key] as string) || (row[`${prefix}_ar`] as string) || '';
  };

  const categoriesWithNames = categories.map((cat: Record<string, unknown>) => ({
    id: cat.id as number,
    name: getNameField(cat, 'name'),
    slug: cat.slug as string,
    bannerUrl: cat.banner_url as string | undefined,
    productCount: 0,
  }));

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
    <div>
      <HeroBanner imageUrl={heroImage} locale={validLocale} />

      <section id="categories" className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-primary)' }}>
          {t('home.shopByCategory')}
        </h2>
        <CategoryCarousel categories={categoriesWithNames} locale={validLocale} />
      </section>

      {productsWithPrice.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 bg-white rounded-2xl mx-4 md:mx-auto" style={{ maxWidth: 'calc(100% - 2rem)' }}>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-primary)' }}>
            {t('home.newArrivals')}
          </h2>
          <ProductCarousel products={productsWithPrice} locale={validLocale} />
        </section>
      )}
    </div>
  );
}
