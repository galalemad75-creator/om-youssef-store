import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { translateProduct } from '@/lib/translate';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const product = db.prepare(`
      SELECT p.*, c.nameAr as categoryNameAr, c.nameEn as categoryNameEn, c.slug as categorySlug
      FROM Product p LEFT JOIN Category c ON p.categoryId = c.id
      WHERE p.id = ?
    `).get(parseInt(id));

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const body = await request.json();

    // Auto-translate if name changed
    let translations = {};
    if (body.nameAr) {
      translations = await translateProduct(body.nameAr, body.descriptionAr || '');
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    const updateableFields = [
      'code', 'categoryId', 'nameAr', 'descriptionAr', 'material',
      'minWeight', 'maxWeight', 'sizes', 'colors', 'dozenPrice',
      'profitMargin', 'imageUrl', 'published'
    ];

    for (const field of updateableFields) {
      if (body[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(field === 'published' ? (body[field] ? 1 : 0) : body[field]);
      }
    }

    // Add translations
    const trans = translations as Record<string, string>;
    for (const [key, value] of Object.entries(trans)) {
      if (value) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    fields.push("updatedAt = datetime('now')");
    values.push(parseInt(id));

    db.prepare(`UPDATE Product SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    db.prepare('DELETE FROM Product WHERE id = ?').run(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
