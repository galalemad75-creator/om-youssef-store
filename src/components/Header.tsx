'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { locales, localeNames, type Locale } from '@/i18n/config';

export default function Header({ locale, t }: { locale: Locale; t: (key: string) => string }) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    return segments.join('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {t('store.name')}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${locale}`} className="text-gray-700 hover:text-[var(--color-primary)] font-medium">
              {t('nav.home')}
            </Link>
            <Link href={`/${locale}#categories`} className="text-gray-700 hover:text-[var(--color-primary)] font-medium">
              {t('nav.categories')}
            </Link>
            <Link href={`/${locale}/cart`} className="relative text-gray-700 hover:text-[var(--color-primary)] font-medium">
              {t('nav.cart')}
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Language Selector + Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:border-[var(--color-primary)] text-sm"
              >
                🌐 {localeNames[locale]}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langMenuOpen && (
                <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[150px] z-50">
                  {locales.map((loc) => (
                    <Link
                      key={loc}
                      href={switchLocale(loc)}
                      onClick={() => setLangMenuOpen(false)}
                      className={`block px-4 py-2 text-sm hover:bg-gray-50 ${loc === locale ? 'font-bold text-[var(--color-primary)]' : 'text-gray-700'}`}
                    >
                      {localeNames[loc]}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100">
            <Link href={`/${locale}`} className="block py-2 text-gray-700 hover:text-[var(--color-primary)]">
              {t('nav.home')}
            </Link>
            <Link href={`/${locale}#categories`} className="block py-2 text-gray-700 hover:text-[var(--color-primary)]">
              {t('nav.categories')}
            </Link>
            <Link href={`/${locale}/cart`} className="block py-2 text-gray-700 hover:text-[var(--color-primary)]">
              {t('nav.cart')} {itemCount > 0 && `(${itemCount})`}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
