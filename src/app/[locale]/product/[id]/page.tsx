import { getProductById, getSettings } from '@/lib/db';
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

  const product = await getProductById(parseInt(id));
  const settings = await getSettings();
  const surcharge = parseFloat(settings.non_arabic_surcharge || '500');

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('common.error')}</h1>
        <Link href={`/${validLocale}`} className="btn-primary">{t('common.back')}</Link>
      </div>
    );
  }

  const productName = (product[`name_${validLocale}`] as string) || (product.name_ar as string);
  const productDesc = (product[`description_${validLocale}`] as string) || (product.description_ar as string) || '';
  const catName = (product[`category_name_${validLocale}`] as string) || (product.category_name_ar as string);

  const price = calculateSellingPrice(product.dozen_price as number, product.profit_margin as number, isArabic, surcharge);
  const formattedPrice = formatPrice(price, validLocale);

  const sizes = product.sizes ? (product.sizes as string).split(',').map((s: string) => s.trim()) : [];
  const colors = product.colors ? (product.colors as string).split(',').map((c: string) => c.trim()) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href={`/${validLocale}`} className="hover:text-[var(--color-primary)]">{t('nav.home')}</Link>
        <span className="mx-2">/</span>
        <Link href={`/${validLocale}/category/${product.category_slug}`} className="hover:text-[var(--color-primary)]">{catName}</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-primary)]">{productName}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url as string} alt={productName} className="w-full h-auto max-h-[500px] object-contain" />
          ) : (
            <div className="w-full h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-8xl">👕</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>{productName}</h1>
          <div className="text-3xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>{formattedPrice}</div>

          <div className="space-y-4 mb-6">
            {product.material && (
              <div className="flex gap-2">
                <span className="font-semibold text-gray-600">{t('product.material')}:</span>
                <span>{product.material as string}</span>
              </div>
            )}
            {(product.min_weight || product.max_weight) && (
              <div className="flex gap-2">
                <span className="font-semibold text-gray-600">{t('product.weight')}:</span>
                <span>
                  {product.min_weight ? `${product.min_weight} ${t('product.kg')}` : ''}
                  {product.min_weight && product.max_weight ? ' - ' : ''}
                  {product.max_weight ? `${product.max_weight} ${t('product.kg')}` : ''}
                </span>
              </div>
            )}
            {sizes.length > 0 && (
              <div>
                <span className="font-semibold text-gray-600 block mb-2">{t('product.size')}:</span>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: string) => (
                    <span key={size} className="px-3 py-1 border border-gray-300 rounded-lg text-sm">{size}</span>
                  ))}
                </div>
              </div>
            )}
            {colors.length > 0 && (
              <div>
                <span className="font-semibold text-gray-600 block mb-2">{t('product.colors')}:</span>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color: string) => (
                    <span key={color} className="px-3 py-1 border border-gray-300 rounded-lg text-sm">{color}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {productDesc && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-600 mb-2">{t('product.description')}:</h3>
              <p className="text-gray-700 leading-relaxed">{productDesc}</p>
            </div>
          )}

          <AddToCartButton
            product={{
              id: product.id as number,
              nameAr: product.name_ar as string,
              name: productName,
              price,
              imageUrl: product.image_url as string | undefined,
            }}
            locale={validLocale}
          />
        </div>
      </div>
    </div>
  );
}
