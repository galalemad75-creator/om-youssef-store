import getDb from '@/lib/db';
import { calculateSellingPrice, formatPrice } from '@/lib/pricing';
import { getMessages, getNestedValue } from '@/i18n/getMessages';
import { type Locale } from '@/i18n/config';
import AddToCartButton from '@/components/AddToCartButton';
import Link from 'next/link';

export default async function ProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const validLocale = (['ar', 'en', 'fr', 'sw', 'ha', 'rw'].includes(locale) ? locale : 'ar') as Locale;
  const messages = getMessages(validLocale);
  const t = (key: string) => getNestedValue(messages, key);
  const isArabic = validLocale === 'ar';

  const db = getDb();

  const product = db.prepare(`
    SELECT p.*, c.nameAr as categoryNameAr, c.nameEn as categoryNameEn, c.slug as categorySlug
    FROM Product p
    LEFT JOIN Category c ON p.categoryId = c.id
    WHERE p.id = ?
  `).get(parseInt(id)) as Record<string, unknown> | undefined;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('common.error')}</h1>
        <Link href={`/${validLocale}`} className="btn-primary">{t('common.back')}</Link>
      </div>
    );
  }

  const nameKey = `name${validLocale.charAt(0).toUpperCase() + validLocale.slice(1)}`;
  const descKey = `description${validLocale.charAt(0).toUpperCase() + validLocale.slice(1)}`;
  const productName = (product[nameKey] as string) || (product.nameAr as string);
  const productDesc = (product[descKey] as string) || (product.descriptionAr as string) || '';
  const catName = (product[`categoryName${validLocale.charAt(0).toUpperCase() + validLocale.slice(1)}`] as string) || (product.categoryNameAr as string);

  const price = calculateSellingPrice(product.dozenPrice as number, product.profitMargin as number, isArabic);
  const formattedPrice = formatPrice(price, validLocale);

  const sizes = product.sizes ? (product.sizes as string).split(',').map(s => s.trim()) : [];
  const colors = product.colors ? (product.colors as string).split(',').map(c => c.trim()) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href={`/${validLocale}`} className="hover:text-[var(--color-primary)]">{t('nav.home')}</Link>
        <span className="mx-2">/</span>
        <Link href={`/${validLocale}/category/${product.categorySlug}`} className="hover:text-[var(--color-primary)]">{catName}</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-primary)]">{productName}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-xl overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl as string}
              alt={productName}
              className="w-full h-auto max-h-[500px] object-contain"
            />
          ) : (
            <div className="w-full h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-8xl">👕</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            {productName}
          </h1>

          <div className="text-3xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
            {formattedPrice}
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            {product.material && (
              <div className="flex gap-2">
                <span className="font-semibold text-gray-600">{t('product.material')}:</span>
                <span>{product.material as string}</span>
              </div>
            )}

            {(product.minWeight || product.maxWeight) && (
              <div className="flex gap-2">
                <span className="font-semibold text-gray-600">{t('product.weight')}:</span>
                <span>
                  {product.minWeight ? `${product.minWeight} ${t('product.kg')}` : ''}
                  {product.minWeight && product.maxWeight ? ' - ' : ''}
                  {product.maxWeight ? `${product.maxWeight} ${t('product.kg')}` : ''}
                </span>
              </div>
            )}

            {sizes.length > 0 && (
              <div>
                <span className="font-semibold text-gray-600 block mb-2">{t('product.size')}:</span>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <span key={size} className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div>
                <span className="font-semibold text-gray-600 block mb-2">{t('product.colors')}:</span>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <span key={color} className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {productDesc && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-600 mb-2">{t('product.description')}:</h3>
              <p className="text-gray-700 leading-relaxed">{productDesc}</p>
            </div>
          )}

          {/* Add to Cart */}
          <AddToCartButton
            product={{
              id: product.id as number,
              nameAr: product.nameAr as string,
              name: productName,
              price,
              imageUrl: product.imageUrl as string | undefined,
            }}
            locale={validLocale}
          />
        </div>
      </div>
    </div>
  );
}
