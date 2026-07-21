import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { translateProduct } from '@/lib/translate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const published = searchParams.get('published');
    const latest = searchParams.get('latest');
    const admin = searchParams.get('admin');

    const products = await getProducts(
      categoryId ? parseInt(categoryId) : undefined,
      admin !== 'true',
      latest ? parseInt(latest) : undefined
    );

    return NextResponse.json(products);
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const translations = await translateProduct(body.nameAr, body.descriptionAr || '');

    const result = await createProduct({
      ...body,
      ...translations,
    });

    return NextResponse.json({ id: result.id, success: true });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
