import { type Locale } from '@/i18n/config';

export default function Footer({ locale, t }: { locale: Locale; t: (key: string) => string }) {
  return (
    <footer className="text-white py-8 mt-12" style={{ backgroundColor: 'var(--color-primary-dark)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Store Info */}
          <div>
            <h3 className="text-xl font-bold mb-3">{t('store.name')}</h3>
            <p className="text-gray-300 text-sm">{t('store.tagline')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">{t('nav.categories')}</h4>
            <div className="flex flex-wrap gap-2">
              <a href={`/${locale}`} className="text-gray-300 hover:text-white text-sm">
                {t('nav.home')}
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">{t('footer.contact')}</h4>
            <p className="text-gray-300 text-sm">📱 +20 11 54705008</p>
            <p className="text-gray-300 text-sm mt-1">💬 WhatsApp</p>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} {t('store.name')} — {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
