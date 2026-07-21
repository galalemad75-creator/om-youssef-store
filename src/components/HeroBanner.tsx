'use client';

import { type Locale } from '@/i18n/config';

export default function HeroBanner({ imageUrl, locale }: { imageUrl: string; locale: Locale }) {
  if (!imageUrl) {
    return (
      <div className="relative w-full h-[300px] md:h-[450px] flex items-center justify-center" 
           style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
        <div className="text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {locale === 'ar' ? 'أم يوسف' : 'Om Youssef'}
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            {locale === 'ar' ? 'أفضل الملابس والمفروشات بأسعار الجملة' : 'Best clothing & home goods at wholesale prices'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[300px] md:h-[450px]">
      <img
        src={imageUrl}
        alt={locale === 'ar' ? 'أم يوسف' : 'Om Youssef'}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white text-center drop-shadow-lg">
          {locale === 'ar' ? 'أم يوسف' : 'Om Youssef'}
        </h1>
      </div>
    </div>
  );
}
