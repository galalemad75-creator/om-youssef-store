import { locales, isRtl, type Locale } from '@/i18n/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/contexts/CartContext';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'ar';
  const dir = isRtl(validLocale) ? 'rtl' : 'ltr';

  return (
    <html lang={validLocale} dir={dir}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Cairo', 'Segoe UI', sans-serif" }}>
        <CartProvider locale={validLocale}>
          <Header locale={validLocale} />
          <main className="min-h-screen">{children}</main>
          <Footer locale={validLocale} />
        </CartProvider>
      </body>
    </html>
  );
}
