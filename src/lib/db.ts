import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'venipsshop.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
    seedProducts(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      nom        TEXT NOT NULL,
      prenom     TEXT NOT NULL,
      email      TEXT UNIQUE NOT NULL COLLATE NOCASE,
      telephone  TEXT NOT NULL,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'user',
      avatar     TEXT,
      addresses  TEXT NOT NULL DEFAULT '[]',
      wishlist   TEXT NOT NULL DEFAULT '[]',
      createdAt  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      brand         TEXT NOT NULL,
      category      TEXT NOT NULL,
      subcategory   TEXT NOT NULL,
      price         REAL NOT NULL,
      originalPrice REAL,
      description   TEXT NOT NULL,
      shortDesc     TEXT NOT NULL,
      features      TEXT NOT NULL DEFAULT '[]',
      specs         TEXT NOT NULL DEFAULT '{}',
      images        TEXT NOT NULL DEFAULT '[]',
      stock         INTEGER NOT NULL DEFAULT 0,
      rating        REAL NOT NULL DEFAULT 0,
      reviewCount   INTEGER NOT NULL DEFAULT 0,
      reviews       TEXT NOT NULL DEFAULT '[]',
      badge         TEXT,
      isNew         INTEGER NOT NULL DEFAULT 0,
      isFeatured    INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id               TEXT PRIMARY KEY,
      userId           TEXT NOT NULL,
      items            TEXT NOT NULL,
      subtotal         REAL NOT NULL,
      shippingCost     REAL NOT NULL,
      discount         REAL NOT NULL,
      total            REAL NOT NULL,
      status           TEXT NOT NULL DEFAULT 'en_attente',
      promoCode        TEXT,
      address          TEXT NOT NULL,
      paymentMethod    TEXT NOT NULL,
      transiteur       TEXT,
      estimatedDelivery TEXT NOT NULL,
      createdAt        TEXT NOT NULL,
      updatedAt        TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
}

function seedProducts(db: Database.Database) {
  const count = (db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number }).c;
  if (count > 0) return;

  // Dynamic import at runtime to seed products
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { products } = require('./data/products') as { products: import('./types').Product[] };

  const insert = db.prepare(`
    INSERT OR IGNORE INTO products
      (id, name, brand, category, subcategory, price, originalPrice,
       description, shortDesc, features, specs, images, stock,
       rating, reviewCount, reviews, badge, isNew, isFeatured)
    VALUES
      (@id, @name, @brand, @category, @subcategory, @price, @originalPrice,
       @description, @shortDesc, @features, @specs, @images, @stock,
       @rating, @reviewCount, @reviews, @badge, @isNew, @isFeatured)
  `);

  const seedAll = db.transaction(() => {
    for (const p of products) {
      insert.run({
        ...p,
        originalPrice: p.originalPrice ?? null,
        features: JSON.stringify(p.features),
        specs: JSON.stringify(p.specs),
        images: JSON.stringify(p.images),
        reviews: JSON.stringify(p.reviews),
        badge: p.badge ?? null,
        isNew: p.isNew ? 1 : 0,
        isFeatured: p.isFeatured ? 1 : 0,
      });
    }
  });
  seedAll();
}
