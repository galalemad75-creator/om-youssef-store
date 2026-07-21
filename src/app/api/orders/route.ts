import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const orders = db.prepare(`
      SELECT o.*, GROUP_CONCAT(
        json_object(
          'id', oi.id,
          'productId', oi.productId,
          'quantity', oi.quantity,
          'price', oi.price,
          'productName', p.nameAr
        )
      ) as itemsJson
      FROM "Order" o
      LEFT JOIN OrderItem oi ON oi.orderId = o.id
      LEFT JOIN Product p ON p.id = oi.productId
      GROUP BY o.id
      ORDER BY o.createdAt DESC
    `).all();

    const result = (orders as Array<Record<string, unknown>>).map(order => ({
      ...order,
      items: order.itemsJson ? JSON.parse(`[${order.itemsJson}]`) : [],
      itemsJson: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();

    const { customerName, phone, governorate, address, items } = body;

    if (!customerName || !phone || !governorate || !address || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate total
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }

    // Create order
    const orderResult = db.prepare(
      'INSERT INTO "Order" (customerName, phone, governorate, address, total) VALUES (?, ?, ?, ?, ?)'
    ).run(customerName, phone, governorate, address, total);

    const orderId = orderResult.lastInsertRowid;

    // Create order items
    const insertItem = db.prepare(
      'INSERT INTO OrderItem (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)'
    );

    for (const item of items) {
      insertItem.run(orderId, item.productId, item.quantity, item.price);
    }

    // Get settings for WhatsApp number
    const settings = db.prepare('SELECT key, value FROM Setting').all() as { key: string; value: string }[];
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    const whatsappNumber = settingsMap.whatsapp_number || '+201154705008';

    // Build WhatsApp message
    let waMessage = `🛒 *طلب جديد*\n\n`;
    waMessage += `👤 *الاسم:* ${customerName}\n`;
    waMessage += `📱 *الموبايل:* ${phone}\n`;
    waMessage += `📍 *المحافظة:* ${governorate}\n`;
    waMessage += `🏠 *العنوان:* ${address}\n\n`;
    waMessage += `📦 *المنتجات:*\n`;

    for (const item of items) {
      const product = db.prepare('SELECT nameAr FROM Product WHERE id = ?').get(item.productId) as { nameAr: string } | undefined;
      waMessage += `- ${product?.nameAr || 'منتج'} × ${item.quantity} = ${item.price * item.quantity} ج.م\n`;
    }

    waMessage += `\n💰 *الإجمالي:* ${total} ج.م\n`;
    waMessage += `💳 *الدفع عند الاستلام*`;

    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(waMessage)}`;

    return NextResponse.json({
      orderId,
      total,
      whatsappUrl,
      success: true,
    });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
