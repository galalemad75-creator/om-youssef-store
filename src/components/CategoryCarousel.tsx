'use client';

import Link from 'next/link';
import { type Locale } from '@/i18n/config';

interface Category {
  id: number;
  name: string;
  slug: string;
  bannerUrl?: string;
  productCount: number;
}

export default function CategoryCarousel({ categories, locale }: { categories: Category[]; locale: Locale }) {
  const placeholderColors = [
    'from-pink-400 to-rose-500',
    'from-blue-400 to-indigo-500',
    'from-green-400 to-emerald-500',
    'from-purple-400 to-violet-500',
    'from-amber-400 to-orange-500',
    'from-teal-400 to-cyan-500',
    'from-red-400 to-pink-500',
    'from-yellow-400 to-amber-500',
    'from-indigo-400 to-blue-500',
    'from-emerald-400 to-green-500',
    'from-violet-400 to-purple-500',
    'from-orange-400 to-red-500',
    'from-cyan-400 to-teal-500',
    'from-rose-400 to-pink-500',
    'from-sky-400 to-blue-500',
  ];

  return (
    <>
      {/* Desktop: Horizontal Carousel */}
      <div className="hidden md:block overflow-hidden">
        <div className="flex gap-6 carousel-scroll" style={{ width: 'max-content' }}>
          {[...categories, ...categories].map((cat, idx) => (
            <Link
              key={`${cat.id}-${idx}`}
              href={`/${locale}/category/${cat.slug}`}
              className="flex-shrink-0 w-64 group"
            >
              <div className="relative h-48 rounded-xl overflow-hidden card-hover">
                {cat.bannerUrl ? (
                  <img
                    src={cat.bannerUrl}
                    alt={cat.name}
                    className="w-full h-full object-contain bg-gray-50"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${placeholderColors[cat.id % placeholderColors.length]} flex items-center justify-center`}>
                    <span className="text-white text-4xl">👗</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                  <div className="w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                    <p className="text-white/80 text-sm">{cat.productCount} {locale === 'ar' ? 'منتج' : 'products'}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile: Vertical Grid */}
      <div className="md:hidden grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/${locale}/category/${cat.slug}`}
            className="group"
          >
            <div className="relative h-40 rounded-xl overflow-hidden card-hover">
              {cat.bannerUrl ? (
                <img
                  src={cat.bannerUrl}
                  alt={cat.name}
                  className="w-full h-full object-contain bg-gray-50"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${placeholderColors[cat.id % placeholderColors.length]} flex items-center justify-center`}>
                  <span className="text-white text-3xl">👗</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                <div className="w-full p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-white font-bold text-sm">{cat.name}</h3>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
