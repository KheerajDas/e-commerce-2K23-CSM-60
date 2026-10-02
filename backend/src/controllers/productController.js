const db = require('../config/db');
const { AppError } = require('../utils/errors');
const { validateProductCreate, validateProductPatch, validateVariantCreate, validateSkuCreate, validateSkuPatch } = require('../validators/catalog');

async function ensureCategory(categoryId) {
  const [rows] = await db.execute('SELECT id, active_status FROM categories WHERE id = ?', [categoryId]);
  if (!rows.length) throw new AppError(404, 'NOT_FOUND', 'Category not found');
  if (!rows[0].active_status) throw new AppError(400, 'INACTIVE_CATEGORY', 'Product must use an active category');
}

async function createProduct(req, res) {
  validateProductCreate(req.body || {});
  const { name, slug, description = null, status = 'draft', categoryId } = req.body;
  await ensureCategory(categoryId);
  const [result] = await db.execute('INSERT INTO products (category_id, name, slug, description, status) VALUES (?, ?, ?, ?, ?)', [categoryId, name.trim(), slug, description, status]);
  const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [result.insertId]);
  res.status(201).json({ data: rows[0] });
}

async function listProducts(_req, res) {
  const [rows] = await db.execute(`SELECT p.id, p.category_id AS categoryId, c.name AS categoryName, p.name, p.slug, p.description, p.status,
    p.created_at AS createdAt, p.updated_at AS updatedAt,
    (SELECT COUNT(*) FROM variants v WHERE v.product_id = p.id) AS variantCount,
    (SELECT COUNT(*) FROM skus s JOIN variants v2 ON v2.id = s.variant_id WHERE v2.product_id = p.id AND s.active_status = 1) AS activeSkuCount
    FROM products p JOIN categories c ON c.id = p.category_id ORDER BY p.id`);
  res.json({ data: rows });
}

async function patchProduct(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid product id');
  validateProductPatch(req.body || {});
  const [existing] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
  if (!existing.length) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  const current = existing[0];
  const next = {
    name: req.body.name === undefined ? current.name : req.body.name.trim(),
    slug: req.body.slug === undefined ? current.slug : req.body.slug,
    description: req.body.description === undefined ? current.description : req.body.description,
    status: req.body.status === undefined ? current.status : req.body.status,
    categoryId: req.body.categoryId === undefined ? current.category_id : Number(req.body.categoryId)
  };
  await ensureCategory(next.categoryId);
  await db.execute('UPDATE products SET name = ?, slug = ?, description = ?, status = ?, category_id = ? WHERE id = ?', [next.name, next.slug, next.description, next.status, next.categoryId, id]);
  const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
  res.json({ data: rows[0] });
}

async function createVariant(req, res) {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId) || productId < 1) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid product id');
  validateVariantCreate(req.body || {});
  const [product] = await db.execute('SELECT id FROM products WHERE id = ?', [productId]);
  if (!product.length) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  const { name, optionValues = {} } = req.body;
  const [result] = await db.execute('INSERT INTO variants (product_id, name, option_values) VALUES (?, ?, ?)', [productId, name.trim(), JSON.stringify(optionValues)]);
  const [rows] = await db.execute('SELECT * FROM variants WHERE id = ?', [result.insertId]);
  rows[0].option_values = JSON.parse(rows[0].option_values || '{}');
  res.status(201).json({ data: rows[0] });
}

async function createSku(req, res) {
  const productId = Number(req.params.id);
  validateSkuCreate(req.body || {});
  const [product] = await db.execute('SELECT id FROM products WHERE id = ?', [productId]);
  if (!product.length) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  const { skuCode, price, stockQuantity, variantId = null } = req.body;
  if (variantId !== null) {
    const [variant] = await db.execute('SELECT id FROM variants WHERE id = ? AND product_id = ?', [variantId, productId]);
    if (!variant.length) throw new AppError(400, 'INVALID_VARIANT', 'variantId does not belong to this product');
  }
  const [result] = await db.execute('INSERT INTO skus (variant_id, sku_code, price, stock_quantity, active_status) VALUES (?, ?, ?, ?, 1)', [variantId, skuCode.trim(), Number(price).toFixed(2), Number(stockQuantity)]);
  const [rows] = await db.execute('SELECT * FROM skus WHERE id = ?', [result.insertId]);
  res.status(201).json({ data: rows[0] });
}

async function patchSku(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid SKU id');
  validateSkuPatch(req.body || {});
  const [existing] = await db.execute('SELECT * FROM skus WHERE id = ?', [id]);
  if (!existing.length) throw new AppError(404, 'NOT_FOUND', 'SKU not found');
  const s = existing[0];
  const price = req.body.price === undefined ? s.price : Number(req.body.price).toFixed(2);
  const stock = req.body.stockQuantity === undefined ? s.stock_quantity : Number(req.body.stockQuantity);
  const active = req.body.activeStatus === undefined ? s.active_status : (req.body.activeStatus ? 1 : 0);
  await db.execute('UPDATE skus SET price = ?, stock_quantity = ?, active_status = ? WHERE id = ?', [price, stock, active, id]);
  const [rows] = await db.execute('SELECT * FROM skus WHERE id = ?', [id]);
  res.json({ data: rows[0] });
}

module.exports = { createProduct, listProducts, patchProduct, createVariant, createSku, patchSku };
