'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: number;
  nameAr: string;
  slug: string;
}

export default function NewProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    code: '',
    categoryId: '',
    nameAr: '',
    descriptionAr: '',
    material: '',
    minWeight: '',
    maxWeight: '',
    sizes: '',
    colors: '',
    dozenPrice: '',
    profitMargin: 20,
    imageUrl: '',
    published: true,
  });

  // New category inline
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);

    // Load default profit margin
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.default_profit_margin) {
          setForm(f => ({ ...f, profitMargin: parseFloat(data.default_profit_margin) }));
        }
      })
      .catch(() => {});
  }, []);

  const perPieceCost = form.dozenPrice ? parseFloat(form.dozenPrice) / 12 : 0;
  const arabicPrice = perPieceCost + (perPieceCost * form.profitMargin / 100);
  const nonArabicPrice = arabicPrice + 500;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'products');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setForm(f => ({ ...f, imageUrl: data.url }));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameAr: newCatName }),
      });
      const data = await res.json();
      if (data.id) {
        setCategories([...categories, { id: data.id, nameAr: newCatName, slug: data.slug }]);
        setForm(f => ({ ...f, categoryId: String(data.id) }));
        setShowNewCat(false);
        setNewCatName('');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          categoryId: parseInt(form.categoryId),
          dozenPrice: parseFloat(form.dozenPrice),
          minWeight: form.minWeight ? parseFloat(form.minWeight) : null,
          maxWeight: form.maxWeight ? parseFloat(form.maxWeight) : null,
        }),
      });

      if (res.ok) {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">إضافة منتج جديد</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">الكود (SKU)</label>
            <input
              type="text"
              className="input-field"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="كود داخلي اختياري"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">القسم</label>
            <div className="flex gap-2">
              <select
                className="input-field flex-1"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="">اختر القسم</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCat(!showNewCat)}
                className="btn-outline text-sm px-3"
              >
                + جديد
              </button>
            </div>
            {showNewCat && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="اسم القسم الجديد"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <button type="button" onClick={handleAddCategory} className="btn-primary text-sm px-3">
                  إضافة
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">اسم المنتج (بالعربي)</label>
          <input
            type="text"
            className="input-field"
            value={form.nameAr}
            onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">الوصف (بالعربي)</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.descriptionAr}
            onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
          />
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">الخامة</label>
            <input
              type="text"
              className="input-field"
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">أقل وزن (كجم)</label>
            <input
              type="number"
              className="input-field"
              value={form.minWeight}
              onChange={(e) => setForm({ ...form, minWeight: e.target.value })}
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">أعلى وزن (كجم)</label>
            <input
              type="number"
              className="input-field"
              value={form.maxWeight}
              onChange={(e) => setForm({ ...form, maxWeight: e.target.value })}
              step="0.1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">المقاسات (مفصولة بفاصلة)</label>
            <input
              type="text"
              className="input-field"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              placeholder="S, M, L, XL"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">الألوان (مفصولة بفاصلة)</label>
            <input
              type="text"
              className="input-field"
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
              placeholder="أحمر, أزرق, أسود"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">صورة المنتج</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm"
            />
            {uploading && <span className="text-sm text-gray-500">جاري الرفع...</span>}
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Preview" className="w-16 h-16 object-contain rounded" />
            )}
          </div>
          <div className="mt-2">
            <input
              type="text"
              className="input-field"
              placeholder="أو أدخل رابط الصورة"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>
        </div>

        {/* Pricing - THE IMPORTANT PART */}
        <div className="border-2 border-[var(--color-accent)] rounded-xl p-6 bg-amber-50">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            💰 التسعير وهامش الربح
          </h2>

          {/* Box A: Real Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold text-sm text-gray-600 mb-2">📦 بوكس أ — سعر التكلفة الحقيقي</h3>
              <label className="block text-xs text-gray-500 mb-1">سعر الدستة (12 قطعة)</label>
              <input
                type="number"
                className="input-field text-lg font-bold"
                value={form.dozenPrice}
                onChange={(e) => setForm({ ...form, dozenPrice: e.target.value })}
                required
                placeholder="0"
              />
              <div className="mt-2 text-sm text-gray-600">
                تكلفة القطعة = {perPieceCost.toFixed(2)} ج.م
              </div>
            </div>

            {/* Box B: Customer Price */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold text-sm text-gray-600 mb-2">🏪 بوكس ب — السعر اللي هيشوفه العميل</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">بالعربي:</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                    {arabicPrice.toFixed(0)} ج.م
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">بالتاني (غير عربي):</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                    {nonArabicPrice.toFixed(0)} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profit Margin Slider */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              نسبة هامش الربح: {form.profitMargin}%
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="300"
                value={form.profitMargin}
                onChange={(e) => setForm({ ...form, profitMargin: parseInt(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                className="input-field w-24"
                value={form.profitMargin}
                onChange={(e) => setForm({ ...form, profitMargin: parseInt(e.target.value) || 0 })}
                min="0"
                max="300"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
            <p>📊 <strong>التفصيل:</strong></p>
            <p>سعر التكلفة ← {perPieceCost.toFixed(2)} ج.م (من دستة بـ {form.dozenPrice || 0} ج.م)</p>
            <p>نسبة الربح المطبقة ← {form.profitMargin}%</p>
            <p>السعر بالعربي ← {arabicPrice.toFixed(0)} ج.م</p>
            <p>السعر بالتاني ← {nonArabicPrice.toFixed(0)} ج.م ( + 500 ج.م)</p>
          </div>
        </div>

        {/* Published Toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
          <span className="font-semibold">{form.published ? 'منشور (ظاهر في المتجر)' : 'مخفي'}</span>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ المنتج'}
          </button>
          <button type="button" onClick={() => router.push('/admin')} className="btn-outline">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
