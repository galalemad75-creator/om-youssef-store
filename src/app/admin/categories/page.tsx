'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: number;
  nameAr: string;
  nameEn: string;
  slug: string;
  bannerUrl: string;
  productCount: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nameAr: '', nameEn: '', bannerUrl: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'categories');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setForm(f => ({ ...f, bannerUrl: data.url }));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.nameAr) return;
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ nameAr: '', nameEn: '', bannerUrl: '' });
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">الأقسام ({categories.length})</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + إضافة قسم جديد
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold mb-4">إضافة قسم جديد</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">الاسم بالعربي</label>
              <input
                type="text"
                className="input-field"
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">الاسم بالإنجليزي</label>
              <input
                type="text"
                className="input-field"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">صورة الباب</label>
            <div className="flex items-center gap-4">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
              {uploading && <span className="text-sm text-gray-500">جاري الرفع...</span>}
              {form.bannerUrl && <img src={form.bannerUrl} alt="Preview" className="w-16 h-16 object-contain rounded" />}
            </div>
            <input
              type="text"
              className="input-field mt-2"
              placeholder="أو أدخل رابط الصورة"
              value={form.bannerUrl}
              onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleAdd} className="btn-primary">إضافة</button>
            <button onClick={() => setShowForm(false)} className="btn-outline">إلغاء</button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الصورة</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الاسم (عربي)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الاسم (إنجليزي)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الـ Slug</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">عدد المنتجات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {cat.bannerUrl ? (
                    <img src={cat.bannerUrl} alt={cat.nameAr} className="w-12 h-12 object-contain rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">📁</div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{cat.nameAr}</td>
                <td className="px-4 py-3 text-gray-500">{cat.nameEn || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-400 font-mono">{cat.slug}</td>
                <td className="px-4 py-3">{cat.productCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
