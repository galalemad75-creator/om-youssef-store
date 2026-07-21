import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { translateProduct } from '@/lib/translate';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const published = searchParams.get('published');
    const latest = searchParams.get('latest');
    const admin = searchParams.get('admin');

    let query = 'SELECT p.*, c.nameAr as categoryNameAr, c.nameEn as categoryNameEn, c.slug as categorySlug FROM Product p LEFT JOIN Category c ON p.categoryId = c.id';
    const conditions: string[] = [];
    const params: unknown[] = [];

    // If not admin request, only show published
    if (admin !== 'true') {
      conditions.push('p.published = 1');
    } else if (published) {
      conditions.push('p.published = ?');
      params.push(published === 'true' ? 1 : 0);
    }

    if (categoryId) {
      conditions.push('p.categoryId = ?');
      params.push(parseInt(categoryId));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    if (latest) {
      query += ' ORDER BY p.createdAt DESC LIMIT ?';
      params.push(parseInt(latest));
    } else {
      query += ' ORDER BY p.createdAt DESC';
    }

    const products = db.prepare(query).all(...params);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const body = await request.json();

    // Auto-translate
    const translations = await translateProduct(body.nameAr, body.descriptionAr || '');

    const stmt = db.prepare(`
      INSERT INTO Product (code, categoryId, nameAr, nameEn, nameFr, nameSw, nameHa, nameRw,
        descriptionAr, descriptionEn, descriptionFr, descriptionSw, descriptionHa, descriptionRw,
        material, minWeight, maxWeight, sizes, colors, dozenPrice, profitMargin, imageUrl, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.code || null,
      body.categoryId,
      body.nameAr,
      translations.nameEn,
      translations.nameFr,
      translations.nameSw,
      translations.nameHa,
      translations.nameRw,
      body.descriptionAr || null,
      translations.descriptionEn,
      translations.descriptionFr,
      translations.descriptionSw,
      translations.descriptionHa,
      translations.descriptionRw,
      body.material || null,
      body.minWeight || null,
      body.maxWeight || null,
      body.sizes || null,
      body.colors || null,
      body.dozenPrice,
      body.profitMargin || 20,
      body.imageUrl || null,
      body.published !== false ? 1 : 0
    );

    return NextResponse.json({ id: result.lastInsertRowid, success: true });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
