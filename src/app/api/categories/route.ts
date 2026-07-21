import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as productCount
      FROM Category c
      LEFT JOIN Product p ON p.categoryId = c.id AND p.published = 1
      GROUP BY c.id
      ORDER BY c.id
    `).all();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories GET error:', error);
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

    // Auto-generate slug from Arabic name
    const slug = body.slug || body.nameAr
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FF\w-]/g, '')
      .toLowerCase() || `cat-${Date.now()}`;

    const stmt = db.prepare(
      'INSERT INTO Category (nameAr, nameEn, nameFr, nameSw, nameHa, nameRw, slug, bannerUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const result = stmt.run(
      body.nameAr,
      body.nameEn || null,
      body.nameFr || null,
      body.nameSw || null,
      body.nameHa || null,
      body.nameRw || null,
      slug,
      body.bannerUrl || null
    );

    return NextResponse.json({ id: result.lastInsertRowid, slug, success: true });
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
