'use client';

import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    default_profit_margin: '',
    non_arabic_surcharge: '',
    admin_password: '',
    store_name_ar: '',
    store_name_en: '',
    hero_image_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'heroes');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setSettings(s => ({ ...s, hero_image_url: data.url }));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">⚙️ الإعدادات</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Store Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>معلومات المتجر</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">اسم المتجر (عربي)</label>
              <input
                type="text"
                className="input-field"
                value={settings.store_name_ar}
                onChange={(e) => setSettings({ ...settings, store_name_ar: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">اسم المتجر (إنجليزي)</label>
              <input
                type="text"
                className="input-field"
                value={settings.store_name_en}
                onChange={(e) => setSettings({ ...settings, store_name_en: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>📱 واتساب</h2>
          <div>
            <label className="block text-sm font-semibold mb-2">رقم واتساب المتجر</label>
            <input
              type="text"
              className="input-field"
              value={settings.whatsapp_number}
              onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              placeholder="+201154705008"
            />
            <p className="text-xs text-gray-500 mt-1">الرقم اللي هيوصله إشعارات الطلبات</p>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>💰 التسعير</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">نسبة هامش الربح الافتراضية (%)</label>
              <input
                type="number"
                className="input-field"
                value={settings.default_profit_margin}
                onChange={(e) => setSettings({ ...settings, default_profit_margin: e.target.value })}
                min="0"
                max="300"
              />
              <p className="text-xs text-gray-500 mt-1">بتتعبى تلقائيًا مع كل منتج جديد</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">فرق السعر لغير العربي (ج.م)</label>
              <input
                type="number"
                className="input-field"
                value={settings.non_arabic_surcharge}
                onChange={(e) => setSettings({ ...settings, non_arabic_surcharge: e.target.value })}
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">المبلغ المضاف فوق السعر العربي للغات التانية</p>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>🖼️ صورة الهيدر</h2>
          <div className="flex items-center gap-4">
            <input type="file" accept="image/*" onChange={handleHeroUpload} className="text-sm" />
            {uploading && <span className="text-sm text-gray-500">جاري الرفع...</span>}
          </div>
          <input
            type="text"
            className="input-field mt-2"
            placeholder="أو أدخل رابط الصورة"
            value={settings.hero_image_url}
            onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
          />
          {settings.hero_image_url && (
            <img src={settings.hero_image_url} alt="Hero Preview" className="mt-4 w-full max-h-48 object-contain rounded" />
          )}
        </div>

        {/* Admin Password */}
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>🔒 الأمان</h2>
          <div>
            <label className="block text-sm font-semibold mb-2">كلمة مرور الأدمن</label>
            <input
              type="password"
              className="input-field"
              value={settings.admin_password}
              onChange={(e) => setSettings({ ...settings, admin_password: e.target.value })}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
          {saved && (
            <span className="text-green-600 font-semibold">✅ تم الحفظ بنجاح</span>
          )}
        </div>
      </div>
    </div>
  );
}
