import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    await updateSettings(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
