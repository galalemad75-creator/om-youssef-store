'use client';

import { useCart } from '@/contexts/CartContext';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { getMessages, getNestedValue } from '@/i18n/getMessages';
import { type Locale } from '@/i18n/config';

const governorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'شمال سيناء', 'كفر الشيخ', 'مطروح',
  'الأقصر', 'قنا', 'سوهاج',
];

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'ar';
  const validLocale = (['ar', 'en', 'fr', 'sw', 'ha', 'rw'].includes(locale) ? locale : 'ar') as Locale;
  const messages = getMessages(validLocale);
  const t = (key: string) => getNestedValue(messages, key) as string;

  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    governorate: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderId: number; whatsappUrl: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.phone || !form.governorate || !form.address) return;

    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOrderResult({ orderId: data.orderId, whatsappUrl: data.whatsappUrl });
        clearCart();
      }
    } catch (error) {
      console.error('Order error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (orderResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-success)' }}>
          {t('checkout.success')}
        </h1>
        <p className="text-gray-600 mb-2">#{orderResult.orderId}</p>
        <p className="text-gray-600 mb-8">{t('checkout.cod')}</p>

        <a
          href={orderResult.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 text-lg py-4 px-8"
          style={{ backgroundColor: '#25D366' }}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {t('checkout.whatsappMessage')}
        </a>

        <div className="mt-6">
          <Link href={`/${validLocale}`} className="text-[var(--color-primary)] hover:underline">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('cart.empty')}</h1>
        <Link href={`/${validLocale}`} className="btn-primary">{t('cart.continueShopping')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: 'var(--color-primary)' }}>
        {t('checkout.title')}
      </h1>

      {/* Order Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-lg mb-4">{t('checkout.orderSummary')}</h2>
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
              <span>{item.nameLocalized} × {item.quantity}</span>
              <span className="font-semibold">
                {(item.price * item.quantity).toLocaleString(validLocale === 'ar' ? 'ar-EG' : validLocale)} {t('common.egp')}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 flex justify-between font-bold text-lg">
          <span>{t('cart.total')}:</span>
          <span style={{ color: 'var(--color-primary)' }}>
            {total.toLocaleString(validLocale === 'ar' ? 'ar-EG' : validLocale)} {t('common.egp')}
          </span>
        </div>
      </div>

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">{t('checkout.name')}</label>
          <input
            type="text"
            className="input-field"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">{t('checkout.phone')}</label>
          <input
            type="tel"
            className="input-field"
            placeholder="01xxxxxxxxx"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">{t('checkout.governorate')}</label>
          <select
            className="input-field"
            value={form.governorate}
            onChange={(e) => setForm({ ...form, governorate: e.target.value })}
            required
          >
            <option value="">{t('checkout.governorate')}</option>
            {governorates.map((gov) => (
              <option key={gov} value={gov}>{gov}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">{t('checkout.address')}</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full text-lg py-4"
          disabled={loading}
        >
          {loading ? t('common.loading') : t('checkout.submit')}
        </button>

        <p className="text-center text-sm text-gray-500">💳 {t('checkout.cod')}</p>
      </form>
    </div>
  );
}
