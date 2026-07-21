'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  code: string;
  nameAr: string;
  categoryId: number;
  categoryNameAr: string;
  dozenPrice: number;
  profitMargin: number;
  published: boolean;
  imageUrl: string;
  createdAt: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?admin=true');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('متأكد إنك عايز تمسح المنتج ده؟')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const togglePublish = async (product: Product) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !product.published }),
      });
      setProducts(products.map(p =>
        p.id === product.id ? { ...p, published: !p.published } : p
      ));
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const calcPrice = (dozenPrice: number, margin: number) => {
    const perPiece = dozenPrice / 12;
    return Math.ceil(perPiece + (perPiece * margin / 100));
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">المنتجات ({products.length})</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + إضافة منتج جديد
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الصورة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الاسم</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الكود</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">القسم</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">سعر الدستة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">هامش الربح</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">سعر البيع</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.nameAr} className="w-12 h-12 object-contain rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">👕</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{product.nameAr}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{product.code || '—'}</td>
                  <td className="px-4 py-3 text-sm">{product.categoryNameAr}</td>
                  <td className="px-4 py-3 text-sm">{product.dozenPrice} ج.م</td>
                  <td className="px-4 py-3 text-sm">{product.profitMargin}%</td>
                  <td className="px-4 py-3 font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                    {calcPrice(product.dozenPrice, product.profitMargin)} ج.م
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(product)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.published ? 'منشور' : 'مخفي'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        تعديل
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
