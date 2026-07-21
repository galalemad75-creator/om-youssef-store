'use client';

import Link from 'next/link';
import { type Locale } from '@/i18n/config';
import ProductCard from './ProductCard';

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

export default function ProductCarousel({ products, locale, t }: { products: Product[]; locale: Locale; t: (key: string) => string }) {
  return (
    <>
      {/* Desktop: Horizontal Carousel */}
      <div className="hidden md:block overflow-hidden">
        <div className="flex gap-6 carousel-scroll" style={{ width: 'max-content' }}>
          {[...products, ...products].map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="flex-shrink-0 w-64">
              <ProductCard product={product} locale={locale} t={t} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Vertical Grid */}
      <div className="md:hidden grid grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} t={t} />
        ))}
      </div>
    </>
  );
}
