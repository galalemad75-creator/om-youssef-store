import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder, getSettings, getProductById } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, phone, governorate, address, items } = body;

    if (!customerName || !phone || !governorate || !address || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await createOrder({ customerName, phone, governorate, address, items });
    const settings = await getSettings();
    const whatsappNumber = settings.whatsapp_number || '+201154705008';

    // Build WhatsApp message
    let waMessage = `🛒 *طلب جديد*\n\n`;
    waMessage += `👤 *الاسم:* ${customerName}\n`;
    waMessage += `📱 *الموبايل:* ${phone}\n`;
    waMessage += `📍 *المحافظة:* ${governorate}\n`;
    waMessage += `🏠 *العنوان:* ${address}\n\n`;
    waMessage += `📦 *المنتجات:*\n`;

    for (const item of items) {
      const product = await getProductById(item.productId);
      waMessage += `- ${product?.name_ar || 'منتج'} × ${item.quantity} = ${item.price * item.quantity} ج.م\n`;
    }

    waMessage += `\n💰 *الإجمالي:* ${result.total} ج.م\n`;
    waMessage += `💳 *الدفع عند الاستلام*`;

    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(waMessage)}`;

    return NextResponse.json({
      orderId: result.orderId,
      total: result.total,
      whatsappUrl,
      success: true,
    });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
