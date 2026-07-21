'use client';

import { useCart } from '@/contexts/CartContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getMessages, getNestedValue } from '@/i18n/getMessages';
import { type Locale } from '@/i18n/config';

export default function CartPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'ar';
  const validLocale = (['ar', 'en', 'fr', 'sw', 'ha', 'rw'].includes(locale) ? locale : 'ar') as Locale;
  const messages = getMessages(validLocale);
  const t = (key: string) => getNestedValue(messages, key) as string;

  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
          {t('cart.empty')}
        </h1>
        <Link href={`/${validLocale}`} className="btn-primary inline-block">
          {t('cart.continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: 'var(--color-primary)' }}>
        {t('cart.title')}
      </h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
            {/* Image */}
            <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.nameLocalized} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl">👕</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">{item.nameLocalized}</h3>
              <p className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                {item.price.toLocaleString(validLocale === 'ar' ? 'ar-EG' : validLocale)} {t('common.egp')}
              </p>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  −
                </button>
                <span className="font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.productId, item.size)}
                  className="text-red-500 text-sm hover:text-red-700 ms-auto"
                >
                  {t('cart.remove')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total & Checkout */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">{t('cart.total')}:</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {total.toLocaleString(validLocale === 'ar' ? 'ar-EG' : validLocale)} {t('common.egp')}
          </span>
        </div>

        <div className="flex gap-3">
          <Link href={`/${validLocale}/checkout`} className="btn-primary flex-1 text-center">
            {t('cart.checkout')}
          </Link>
          <button onClick={clearCart} className="btn-outline">
            {t('cart.remove')}
          </button>
        </div>
      </div>
    </div>
  );
}
