'use client';

import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface Props {
  product: {
    id: number;
    nameAr: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
  t: (key: string) => string;
}

export default function AddToCartButton({ product, t }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      nameLocalized: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
      style={{ backgroundColor: added ? 'var(--color-success)' : 'var(--color-primary)' }}
    >
      {added ? (
        <>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          ✓
        </>
      ) : (
        <>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          {t('product.addToCart')}
        </>
      )}
    </button>
  );
}
