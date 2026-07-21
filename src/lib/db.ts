import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db');

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nameAr TEXT NOT NULL,
      nameEn TEXT,
      nameFr TEXT,
      nameSw TEXT,
      nameHa TEXT,
      nameRw TEXT,
      slug TEXT NOT NULL UNIQUE,
      bannerUrl TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Product (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      categoryId INTEGER NOT NULL,
      nameAr TEXT NOT NULL,
      nameEn TEXT,
      nameFr TEXT,
      nameSw TEXT,
      nameHa TEXT,
      nameRw TEXT,
      descriptionAr TEXT,
      descriptionEn TEXT,
      descriptionFr TEXT,
      descriptionSw TEXT,
      descriptionHa TEXT,
      descriptionRw TEXT,
      material TEXT,
      minWeight REAL,
      maxWeight REAL,
      sizes TEXT,
      colors TEXT,
      dozenPrice REAL NOT NULL,
      profitMargin REAL DEFAULT 20,
      imageUrl TEXT,
      published INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (categoryId) REFERENCES Category(id)
    );

    CREATE TABLE IF NOT EXISTS "Order" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      phone TEXT NOT NULL,
      governorate TEXT NOT NULL,
      address TEXT NOT NULL,
      total REAL NOT NULL,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS OrderItem (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES "Order"(id),
      FOREIGN KEY (productId) REFERENCES Product(id)
    );

    CREATE TABLE IF NOT EXISTS Setting (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    );
  `);

  // Insert default settings if not exist
  const settings = [
    ['whatsapp_number', '+201154705008'],
    ['default_profit_margin', '20'],
    ['non_arabic_surcharge', '500'],
    ['admin_password', 'omYoussef2024'],
    ['store_name_ar', 'أم يوسف'],
    ['store_name_en', 'Om Youssef'],
    ['hero_image_url', ''],
  ];

  const insertSetting = db.prepare('INSERT OR IGNORE INTO Setting (key, value) VALUES (?, ?)');
  for (const [key, value] of settings) {
    insertSetting.run(key, value);
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
    { nameAr: 'كاشات', nameEn: 'Kashat (Matching Sets)', slug: 'kashat', banner: '/uploads/categories/kashat.png' },
    { nameAr: 'ملابس داخلية حريمي', nameEn: "Women's Underwear", slug: 'underwear-women', banner: '/uploads/categories/underwear-women.png' },
    { nameAr: 'لانجيري', nameEn: 'Lingerie', slug: 'lingerie', banner: '/uploads/categories/lingerie.png' },
    { nameAr: 'شنط مدرسية', nameEn: 'School Bags', slug: 'school-bags', banner: '/uploads/categories/school-bags.png' },
    { nameAr: 'لبس مدرسي', nameEn: 'School Uniform', slug: 'school-uniform', banner: '/uploads/categories/school-uniform.png' },
    { nameAr: 'شنط سفر', nameEn: 'Travel Bags', slug: 'travel-bags', banner: '/uploads/categories/travel-bags.png' },
    { nameAr: 'بيجامات', nameEn: 'Pajamas', slug: 'pajamas', banner: '/uploads/categories/pajamas.png' },
    { nameAr: 'أسدالات صلاة', nameEn: 'Prayer Garment', slug: 'isdal', banner: '/uploads/categories/isdal.png' },
  ];

  const insertCat = db.prepare(
    'INSERT OR IGNORE INTO Category (nameAr, nameEn, slug, bannerUrl) VALUES (?, ?, ?, ?)'
  );
  for (const cat of categories) {
    insertCat.run(cat.nameAr, cat.nameEn, cat.slug, cat.banner);
  }
}

export default getDb;
