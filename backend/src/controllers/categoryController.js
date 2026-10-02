const db = require('../config/db');
const { AppError } = require('../utils/errors');
const { validateCategoryCreate } = require('../validators/catalog');

async function ensureNoCycle(categoryId, parentId) {
  let current = parentId;
  while (current !== null && current !== undefined) {
    if (Number(current) === Number(categoryId)) throw new AppError(400, 'CATEGORY_CYCLE', 'A category cannot become its own ancestor');
    const [rows] = await db.execute('SELECT parent_id FROM categories WHERE id = ?', [current]);
    if (!rows.length) throw new AppError(404, 'NOT_FOUND', 'Parent category not found');
    current = rows[0].parent_id;
  }
}

async function create(req, res) {
  validateCategoryCreate(req.body || {});
  const { name, slug, parentId = null } = req.body;
  if (parentId !== null) {
    const [parent] = await db.execute('SELECT id, active_status FROM categories WHERE id = ?', [parentId]);
    if (!parent.length) throw new AppError(404, 'NOT_FOUND', 'Parent category not found');
    if (!parent[0].active_status) throw new AppError(400, 'INACTIVE_PARENT', 'An inactive category cannot be used as a parent');
  }
  const [result] = await db.execute('INSERT INTO categories (parent_id, name, slug, active_status) VALUES (?, ?, ?, 1)', [parentId, name.trim(), slug,]);
  const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [result.insertId]);
  res.status(201).json({ data: rows[0] });
}

async function list(_req, res) {
  const [rows] = await db.execute('SELECT id, parent_id AS parentId, name, slug, active_status AS activeStatus, created_at AS createdAt, updated_at AS updatedAt FROM categories ORDER BY parent_id IS NOT NULL, parent_id, name');
  res.json({ data: rows });
}

async function update(req, res) {
  const id = Number(req.params.id);
  const { name, slug, parentId, activeStatus } = req.body || {};
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid category id');
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) throw new AppError(400, 'VALIDATION_ERROR', 'name must be a non-empty string');
  if (slug !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid slug');
  if (parentId !== undefined) {
    if (parentId !== null && (!Number.isInteger(Number(parentId)) || Number(parentId) < 1)) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid parentId');
    await ensureNoCycle(id, parentId);
  }
  if (activeStatus !== undefined && typeof activeStatus !== 'boolean') throw new AppError(400, 'VALIDATION_ERROR', 'activeStatus must be boolean');
  const [existing] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
  if (!existing.length) throw new AppError(404, 'NOT_FOUND', 'Category not found');
  const next = {
    name: name === undefined ? existing[0].name : name.trim(),
    slug: slug === undefined ? existing[0].slug : slug,
    parentId: parentId === undefined ? existing[0].parent_id : parentId,
    activeStatus: activeStatus === undefined ? existing[0].active_status : activeStatus
  };
  if (next.parentId !== null) {
    const [p] = await db.execute('SELECT id, active_status FROM categories WHERE id = ?', [next.parentId]);
    if (!p.length) throw new AppError(404, 'NOT_FOUND', 'Parent category not found');
    if (!p[0].active_status && next.activeStatus) throw new AppError(400, 'INACTIVE_PARENT', 'An active category cannot have an inactive parent');
  }
  await db.execute('UPDATE categories SET name = ?, slug = ?, parent_id = ?, active_status = ? WHERE id = ?', [next.name, next.slug, next.parentId, next.activeStatus ? 1 : 0, id]);
  const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
  res.json({ data: rows[0] });
}

module.exports = { create, list, update };
