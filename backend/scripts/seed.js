const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

async function main() {
  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  await db.execute(`INSERT INTO admins (email, password_hash, role, active_status) VALUES (?, ?, 'admin', 1)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), active_status = 1`, ['admin@example.com', passwordHash]);

  const categories = [
    ['Electronics', 'electronics', null],
    ['Mobile Phones', 'mobile-phones', 1],
    ['Computers', 'computers', 1]
  ];
  for (const [name, slug, parentId] of categories) {
    await db.execute('INSERT INTO categories (name, slug, parent_id, active_status) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE name = VALUES(name), parent_id = VALUES(parent_id), active_status = 1', [name, slug, parentId]);
  }

  const [catRows] = await db.execute('SELECT id, slug FROM categories');
  const cat = Object.fromEntries(catRows.map(x => [x.slug, x.id]));
  const products = [
    ['Smartphone Pro', 'smartphone-pro', 'A sample smartphone product.', 'published', cat['mobile-phones']],
    ['Laptop Air', 'laptop-air', 'A sample laptop product.', 'published', cat['computers']],
    ['Wireless Headphones', 'wireless-headphones', 'A sample wireless headphone product.', 'draft', cat['electronics']]
  ];
  for (const [name, slug, description, status, categoryId] of products) {
    await db.execute('INSERT INTO products (name, slug, description, status, category_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), status = VALUES(status), category_id = VALUES(category_id)', [name, slug, description, status, categoryId]);
  }

  const [productRows] = await db.execute('SELECT id, slug FROM products');
  const product = Object.fromEntries(productRows.map(x => [x.slug, x.id]));
  const variants = [
    [product['smartphone-pro'], '128GB / Black', JSON.stringify({ storage: '128GB', color: 'Black' })],
    [product['smartphone-pro'], '256GB / Blue', JSON.stringify({ storage: '256GB', color: 'Blue' })],
    [product['laptop-air'], '16GB / 512GB', JSON.stringify({ ram: '16GB', storage: '512GB' })]
  ];
  for (const [productId, name, options] of variants) {
    const [existing] = await db.execute('SELECT id FROM variants WHERE product_id = ? AND name = ?', [productId, name]);
    if (!existing.length) await db.execute('INSERT INTO variants (product_id, name, option_values) VALUES (?, ?, ?)', [productId, name, options]);
  }
  const [variantRows] = await db.execute('SELECT id, product_id, name FROM variants');
  const v = Object.fromEntries(variantRows.map(x => [`${x.product_id}:${x.name}`, x.id]));
  const skuData = [
    ['SP-BLK-128', 699.99, 12, v[`${product['smartphone-pro']}:128GB / Black`], 1],
    ['SP-BLU-256', 799.99, 0, v[`${product['smartphone-pro']}:256GB / Blue`], 1],
    ['LA-16-512', 1099.99, 7, v[`${product['laptop-air']}:16GB / 512GB`], 1],
    ['WH-BLK', 149.99, 20, null, 1]
  ];
  for (const [sku, price, stock, variantId, active] of skuData) {
    await db.execute('INSERT INTO skus (sku_code, price, stock_quantity, variant_id, active_status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE price = VALUES(price), stock_quantity = VALUES(stock_quantity), variant_id = VALUES(variant_id), active_status = VALUES(active_status)', [sku, price, stock, variantId, active]);
  }

  console.log('Seed complete. Admin login: admin@example.com / Admin@12345');
  console.log('Unavailable combination demonstration: SP-BLU-256 has stock 0.');
  await db.end();
}

main().catch(err => { console.error(err); process.exit(1); });
