import getDb from '@/lib/db';
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

  const db = getDb();

  const category = db.prepare('SELECT * FROM Category WHERE slug = ?').get(slug) as Record<string, unknown> | undefined;

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('common.error')}</h1>
        <Link href={`/${validLocale}`} className="btn-primary">{t('common.back')}</Link>
      </div>
    );
  }

  const catName = (category[`name${validLocale.charAt(0).toUpperCase() + validLocale.slice(1)}`] as string) || (category.nameAr as string);
  const bannerUrl = category.bannerUrl as string | null;

  const products = db.prepare(`
    SELECT p.*, c.nameAr as categoryNameAr, c.slug as categorySlug
    FROM Product p
    LEFT JOIN Category c ON p.categoryId = c.id
    WHERE p.categoryId = ? AND p.published = 1
    ORDER BY p.createdAt DESC
  `).all(category.id) as Array<Record<string, unknown>>;

  const getProductName = (product: Record<string, unknown>) => {
    const nameKey = `name${validLocale.charAt(0).toUpperCase() + validLocale.slice(1)}`;
    return (product[nameKey] as string) || (product.nameAr as string);
  };

  const productsWithPrice = products.map(product => ({
    ...product,
    name: getProductName(product),
    price: calculateSellingPrice(product.dozenPrice as number, product.profitMargin as number, isArabic),
    formattedPrice: formatPrice(
      calculateSellingPrice(product.dozenPrice as number, product.profitMargin as number, isArabic),
      validLocale
    ),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href={`/${validLocale}`} className="hover:text-[var(--color-primary)]">{t('nav.home')}</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-primary)]">{catName}</span>
      </nav>

      {/* Category Header */}
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

      {/* Products Grid */}
      {productsWithPrice.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {productsWithPrice.map((product) => (
            <ProductCard key={product.id as number} product={product as unknown as Parameters<typeof ProductCard>[0]['product']} locale={validLocale} t={t} />
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
