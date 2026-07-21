import { sql } from '@vercel/postgres';

let initialized = false;

async function initializeDatabase() {
  if (initialized) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name_ar TEXT NOT NULL,
        name_en TEXT,
        name_fr TEXT,
        name_sw TEXT,
        name_ha TEXT,
        name_rw TEXT,
        slug TEXT NOT NULL UNIQUE,
        banner_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE,
        category_id INTEGER REFERENCES categories(id),
        name_ar TEXT NOT NULL,
        name_en TEXT,
        name_fr TEXT,
        name_sw TEXT,
        name_ha TEXT,
        name_rw TEXT,
        description_ar TEXT,
        description_en TEXT,
        description_fr TEXT,
        description_sw TEXT,
        description_ha TEXT,
        description_rw TEXT,
        material TEXT,
        min_weight REAL,
        max_weight REAL,
        sizes TEXT,
        colors TEXT,
        dozen_price REAL NOT NULL,
        profit_margin REAL DEFAULT 20,
        image_url TEXT,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        governorate TEXT NOT NULL,
        address TEXT NOT NULL,
        total REAL NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price REAL NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL
      );
    `;

    // Insert default settings
    const defaultSettings = [
      ['whatsapp_number', '+201154705008'],
      ['default_profit_margin', '20'],
      ['non_arabic_surcharge', '500'],
      ['admin_password', 'omYoussef2024'],
      ['store_name_ar', 'أم يوسف'],
      ['store_name_en', 'Om Youssef'],
      ['hero_image_url', ''],
    ];

    for (const [key, value] of defaultSettings) {
      await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO NOTHING`;
    }

    // Insert default categories
    const categories = [
      { nameAr: 'عبايات', nameEn: 'Abayas', slug: 'abayas', banner: '/uploads/categories/abayas.png' },
      { nameAr: 'ملابس أطفال', nameEn: 'Kids Clothing', slug: 'kids', banner: '/uploads/categories/kids.png' },
      { nameAr: 'ملابس رجالي', nameEn: "Men's Clothing", slug: 'men', banner: '/uploads/categories/men.png' },
      { nameAr: 'مايوهات حريمي', nameEn: "Women's Swimwear", slug: 'swimwear-women', banner: '/uploads/categories/swimwear-women.png' },
      { nameAr: 'مايوهات رجالي', nameEn: "Men's Swimwear", slug: 'swimwear-men', banner: '/uploads/categories/swimwear-men.png' },
      { nameAr: 'مفروشات', nameEn: 'Home Textiles', slug: 'home-textiles', banner: '/uploads/categories/home-textiles.png' },
      { nameAr: 'بديل السجاد', nameEn: 'Rug Alternative', slug: 'rug-alternative', banner: '/uploads/categories/rug-alternative.png' },
      { nameAr: 'كاشات', nameEn: 'Kashat', slug: 'kashat', banner: '/uploads/categories/kashat.png' },
      { nameAr: 'ملابس داخلية حريمي', nameEn: "Women's Underwear", slug: 'underwear-women', banner: '/uploads/categories/underwear-women.png' },
      { nameAr: 'لانجيري', nameEn: 'Lingerie', slug: 'lingerie', banner: '/uploads/categories/lingerie.png' },
      { nameAr: 'شنط مدرسية', nameEn: 'School Bags', slug: 'school-bags', banner: '/uploads/categories/school-bags.png' },
      { nameAr: 'لبس مدرسي', nameEn: 'School Uniform', slug: 'school-uniform', banner: '/uploads/categories/school-uniform.png' },
      { nameAr: 'شنط سفر', nameEn: 'Travel Bags', slug: 'travel-bags', banner: '/uploads/categories/travel-bags.png' },
      { nameAr: 'بيجامات', nameEn: 'Pajamas', slug: 'pajamas', banner: '/uploads/categories/pajamas.png' },
      { nameAr: 'أسدالات صلاة', nameEn: 'Prayer Garment', slug: 'isdal', banner: '/uploads/categories/isdal.png' },
    ];

    for (const cat of categories) {
      await sql`INSERT INTO categories (name_ar, name_en, slug, banner_url) VALUES (${cat.nameAr}, ${cat.nameEn}, ${cat.slug}, ${cat.banner}) ON CONFLICT (slug) DO UPDATE SET banner_url = ${cat.banner}`;
    }

    initialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Helper functions
export async function getCategories() {
  await initializeDatabase();
  const result = await sql`SELECT * FROM categories ORDER BY id`;
  return result.rows;
}

export async function getCategoryBySlug(slug: string) {
  await initializeDatabase();
  const result = await sql`SELECT * FROM categories WHERE slug = ${slug}`;
  return result.rows[0] || null;
}

export async function getProducts(categoryId?: number, published = true, latest?: number) {
  await initializeDatabase();
  let query = `SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id`;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (published) conditions.push('p.published = true');
  if (categoryId) {
    conditions.push(`p.category_id = $${params.length + 1}`);
    params.push(categoryId);
  }

  if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY p.created_at DESC';
  if (latest) query += ` LIMIT ${latest}`;

  const result = await sql.query(query, params);
  return result.rows;
}

export async function getProductById(id: number) {
  await initializeDatabase();
  const result = await sql`SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ${id}`;
  return result.rows[0] || null;
}

export async function createProduct(data: Record<string, unknown>) {
  await initializeDatabase();
  const result = await sql`
    INSERT INTO products (code, category_id, name_ar, name_en, name_fr, name_sw, name_ha, name_rw,
      description_ar, description_en, description_fr, description_sw, description_ha, description_rw,
      material, min_weight, max_weight, sizes, colors, dozen_price, profit_margin, image_url, published)
    VALUES (${data.code as string}, ${data.categoryId as number}, ${data.nameAr as string},
      ${data.nameEn as string}, ${data.nameFr as string}, ${data.nameSw as string}, ${data.nameHa as string}, ${data.nameRw as string},
      ${data.descriptionAr as string}, ${data.descriptionEn as string}, ${data.descriptionFr as string}, ${data.descriptionSw as string}, ${data.descriptionHa as string}, ${data.descriptionRw as string},
      ${data.material as string}, ${data.minWeight as number}, ${data.maxWeight as number}, ${data.sizes as string}, ${data.colors as string},
      ${data.dozenPrice as number}, ${data.profitMargin as number}, ${data.imageUrl as string}, ${data.published as boolean})
    RETURNING id
  `;
  return result.rows[0];
}

export async function updateProduct(id: number, data: Record<string, unknown>) {
  await initializeDatabase();
  const fields: string[] = [];
  const values: unknown[] = [];

  const fieldMap: Record<string, string> = {
    code: 'code', categoryId: 'category_id', nameAr: 'name_ar', nameEn: 'name_en',
    nameFr: 'name_fr', nameSw: 'name_sw', nameHa: 'name_ha', nameRw: 'name_rw',
    descriptionAr: 'description_ar', descriptionEn: 'description_en', descriptionFr: 'description_fr',
    descriptionSw: 'description_sw', descriptionHa: 'description_ha', descriptionRw: 'description_rw',
    material: 'material', minWeight: 'min_weight', maxWeight: 'max_weight',
    sizes: 'sizes', colors: 'colors', dozenPrice: 'dozen_price', profitMargin: 'profit_margin',
    imageUrl: 'image_url', published: 'published',
  };

  for (const [key, value] of Object.entries(data)) {
    if (fieldMap[key] && value !== undefined) {
      fields.push(`${fieldMap[key]} = $${values.length + 1}`);
      values.push(value);
    }
  }

  if (fields.length === 0) return;
  values.push(id);

  await sql.query(`UPDATE products SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
}

export async function deleteProduct(id: number) {
  await initializeDatabase();
  await sql`DELETE FROM products WHERE id = ${id}`;
}

export async function createCategory(data: Record<string, unknown>) {
  await initializeDatabase();
  const slug = (data.slug as string) || (data.nameAr as string).replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]/g, '') || `cat-${Date.now()}`;
  const result = await sql`
    INSERT INTO categories (name_ar, name_en, name_fr, name_sw, name_ha, name_rw, slug, banner_url)
    VALUES (${data.nameAr as string}, ${data.nameEn as string}, ${data.nameFr as string}, ${data.nameSw as string}, ${data.nameHa as string}, ${data.nameRw as string}, ${slug}, ${data.bannerUrl as string})
    RETURNING id, slug
  `;
  return result.rows[0];
}

export async function getOrders() {
  await initializeDatabase();
  const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
  const result = [];

  for (const order of orders.rows) {
    const items = await sql`
      SELECT oi.*, p.name_ar as product_name
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ${order.id}
    `;
    result.push({ ...order, items: items.rows });
  }

  return result;
}

export async function createOrder(data: Record<string, unknown>) {
  await initializeDatabase();
  const items = data.items as Array<{ productId: number; quantity: number; price: number }>;
  let total = 0;
  for (const item of items) total += item.price * item.quantity;

  const orderResult = await sql`
    INSERT INTO orders (customer_name, phone, governorate, address, total)
    VALUES (${data.customerName as string}, ${data.phone as string}, ${data.governorate as string}, ${data.address as string}, ${total})
    RETURNING id
  `;
  const orderId = orderResult.rows[0].id;

  for (const item of items) {
    await sql`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (${orderId}, ${item.productId}, ${item.quantity}, ${item.price})`;
  }

  return { orderId, total };
}

export async function getSettings() {
  await initializeDatabase();
  const result = await sql`SELECT key, value FROM settings`;
  const settings: Record<string, string> = {};
  for (const row of result.rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function updateSettings(data: Record<string, string>) {
  await initializeDatabase();
  for (const [key, value] of Object.entries(data)) {
    await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = ${value}`;
  }
}

export default sql;
