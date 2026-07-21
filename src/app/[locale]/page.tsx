import getDb from '@/lib/db';
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

  const db = getDb();

  // Get categories
  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as productCount
    FROM Category c
    LEFT JOIN Product p ON p.categoryId = c.id AND p.published = 1
    GROUP BY c.id
    ORDER BY c.id
  `).all() as Array<Record<string, unknown>>;

  // Get latest products
  const products = db.prepare(`
    SELECT p.*, c.nameAr as categoryNameAr, c.slug as categorySlug
    FROM Product p
    LEFT JOIN Category c ON p.categoryId = c.id
    WHERE p.published = 1
    ORDER BY p.createdAt DESC
    LIMIT 12
  `).all() as Array<Record<string, unknown>>;

  // Get hero image
  const heroSetting = db.prepare("SELECT value FROM Setting WHERE key = 'hero_image_url'").get() as { value: string } | undefined;
  const heroImage = heroSetting?.value || '';

  // Get product name based on locale
  const getProductName = (product: Record<string, unknown>) => {
    const nameKey = `name${validLocale.charAt(0).toUpperCase() + validLocale.slice(1)}`;
    return (product[nameKey] as string) || (product.nameAr as string);
  };

  // Calculate prices
  const productsWithPrice = products.map(product => {
    const p = product as Record<string, unknown>;
    return {
      id: p.id as number,
      nameAr: p.nameAr as string,
      name: getProductName(p),
      price: calculateSellingPrice(p.dozenPrice as number, p.profitMargin as number, isArabic),
      formattedPrice: formatPrice(
        calculateSellingPrice(p.dozenPrice as number, p.profitMargin as number, isArabic),
        validLocale
      ),
      imageUrl: p.imageUrl as string | undefined,
      material: p.material as string | undefined,
      categorySlug: p.categorySlug as string | undefined,
    };
  });

  const categoriesWithNames = categories.map(cat => {
    const c = cat as Record<string, unknown>;
    return {
      id: c.id as number,
      name: (c[`name${validLocale.charAt(0).toUpperCase() + validLocale.slice(1)}`] as string) || (c.nameAr as string),
      slug: c.slug as string,
      bannerUrl: c.bannerUrl as string | undefined,
      productCount: c.productCount as number,
    };
  });

  return (
    <div>
      {/* Hero Banner */}
      <HeroBanner imageUrl={heroImage} locale={validLocale} />

      {/* Shop by Category */}
      <section id="categories" className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-primary)' }}>
          {t('home.shopByCategory')}
        </h2>
        <CategoryCarousel categories={categoriesWithNames} locale={validLocale} />
      </section>

      {/* New Arrivals */}
      {productsWithPrice.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 bg-white rounded-2xl mx-4 md:mx-auto" style={{ maxWidth: 'calc(100% - 2rem)' }}>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-primary)' }}>
            {t('home.newArrivals')}
          </h2>
          <ProductCarousel products={productsWithPrice} locale={validLocale} t={t} />
        </section>
      )}
    </div>
  );
}
