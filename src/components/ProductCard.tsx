'use client';

import Link from 'next/link';
import { type Locale } from '@/i18n/config';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: number;
  name: string;
  nameAr: string;
  price: number;
  formattedPrice: string;
  imageUrl?: string;
  material?: string;
  categorySlug?: string;
}

export default function ProductCard({ product, locale, t }: { product: Product; locale: Locale; t: (key: string) => string }) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      nameLocalized: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <Link href={`/${locale}/product/${product.id}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm card-hover">
        {/* Image */}
        <div className="relative h-56 bg-gray-50 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-5xl">👕</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]" style={{ color: 'var(--color-text)' }}>
            {product.name}
          </h3>
          {product.material && (
            <p className="text-xs text-gray-500 mb-2">{product.material}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
              {product.formattedPrice}
            </span>
            <button
              onClick={handleAddToCart}
              className="p-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors"
              title={t('product.addToCart')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
