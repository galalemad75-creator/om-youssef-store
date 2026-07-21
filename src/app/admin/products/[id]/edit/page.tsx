'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Category {
  id: number;
  nameAr: string;
}

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

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

  useEffect(() => {
    // Load categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);

    // Load product
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          code: data.code || '',
          categoryId: String(data.categoryId),
          nameAr: data.nameAr || '',
          descriptionAr: data.descriptionAr || '',
          material: data.material || '',
          minWeight: data.minWeight ? String(data.minWeight) : '',
          maxWeight: data.maxWeight ? String(data.maxWeight) : '',
          sizes: data.sizes || '',
          colors: data.colors || '',
          dozenPrice: String(data.dozenPrice),
          profitMargin: data.profitMargin || 20,
          imageUrl: data.imageUrl || '',
          published: Boolean(data.published),
        });
      })
      .catch(console.error);
  }, [productId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
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
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">تعديل المنتج</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Same form as new product */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">الكود (SKU)</label>
            <input type="text" className="input-field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">القسم</label>
            <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">اختر القسم</option>
              {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.nameAr}</option>))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">اسم المنتج (بالعربي)</label>
          <input type="text" className="input-field" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">الوصف (بالعربي)</label>
          <textarea className="input-field" rows={3} value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">الخامة</label>
            <input type="text" className="input-field" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">أقل وزن (كجم)</label>
            <input type="number" className="input-field" value={form.minWeight} onChange={(e) => setForm({ ...form, minWeight: e.target.value })} step="0.1" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">أعلى وزن (كجم)</label>
            <input type="number" className="input-field" value={form.maxWeight} onChange={(e) => setForm({ ...form, maxWeight: e.target.value })} step="0.1" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">المقاسات</label>
            <input type="text" className="input-field" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">الألوان</label>
            <input type="text" className="input-field" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="أحمر, أزرق" />
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-semibold mb-2">صورة المنتج</label>
          <div className="flex items-center gap-4">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
            {uploading && <span className="text-sm text-gray-500">جاري الرفع...</span>}
            {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="w-16 h-16 object-contain rounded" />}
          </div>
          <input type="text" className="input-field mt-2" placeholder="أو أدخل رابط الصورة" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        </div>

        {/* Pricing */}
        <div className="border-2 border-[var(--color-accent)] rounded-xl p-6 bg-amber-50">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>💰 التسعير وهامش الربح</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold text-sm text-gray-600 mb-2">📦 بوكس أ — سعر التكلفة</h3>
              <label className="block text-xs text-gray-500 mb-1">سعر الدستة</label>
              <input type="number" className="input-field text-lg font-bold" value={form.dozenPrice} onChange={(e) => setForm({ ...form, dozenPrice: e.target.value })} required />
              <div className="mt-2 text-sm text-gray-600">تكلفة القطعة = {perPieceCost.toFixed(2)} ج.م</div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold text-sm text-gray-600 mb-2">🏪 بوكس ب — سعر البيع</h3>
              <div className="flex justify-between"><span className="text-gray-500">بالعربي:</span><span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>{arabicPrice.toFixed(0)} ج.م</span></div>
              <div className="flex justify-between mt-2"><span className="text-gray-500">بالتاني:</span><span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>{nonArabicPrice.toFixed(0)} ج.م</span></div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">هامش الربح: {form.profitMargin}%</label>
            <div className="flex items-center gap-4">
              <input type="range" min="0" max="300" value={form.profitMargin} onChange={(e) => setForm({ ...form, profitMargin: parseInt(e.target.value) })} className="flex-1" />
              <input type="number" className="input-field w-24" value={form.profitMargin} onChange={(e) => setForm({ ...form, profitMargin: parseInt(e.target.value) || 0 })} min="0" max="300" />
              <span>%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
          <span className="font-semibold">{form.published ? 'منشور' : 'مخفي'}</span>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
          <button type="button" onClick={() => router.push('/admin')} className="btn-outline">إلغاء</button>
        </div>
      </form>
    </div>
  );
}
