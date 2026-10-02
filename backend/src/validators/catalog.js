const { AppError } = require('../utils/errors');

function requiredString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, 'VALIDATION_ERROR', `${field} is required and must be a non-empty string`);
  }
  return value.trim();
}

function optionalString(value, field) {
  if (value === undefined || value === null) return value === null ? null : undefined;
  if (typeof value !== 'string') {
    throw new AppError(400, 'VALIDATION_ERROR', `${field} must be a string`);
  }
  return value.trim();
}

function validateSlug(slug) {
  requiredString(slug, 'slug');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'slug must contain lowercase letters, numbers and single hyphens only');
  }
}

function validateStatus(status) {
  if (status !== undefined && !['draft', 'published', 'archived'].includes(status)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'status must be draft, published, or archived');
  }
}

function validatePositiveMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'price must be a non-negative number');
  }
  return n.toFixed(2);
}

function validateNonNegativeInteger(value, field = 'stockQuantity') {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new AppError(400, 'VALIDATION_ERROR', `${field} must be a non-negative integer`);
  }
  return n;
}

function validateCategoryCreate(body) {
  requiredString(body.name, 'name');
  validateSlug(body.slug);
  if (body.parentId !== undefined && body.parentId !== null && (!Number.isInteger(Number(body.parentId)) || Number(body.parentId) < 1)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'parentId must be a positive integer or null');
  }
}

function validateProductCreate(body) {
  requiredString(body.name, 'name');
  validateSlug(body.slug);
  optionalString(body.description, 'description');
  validateStatus(body.status);
  if (!Number.isInteger(Number(body.categoryId)) || Number(body.categoryId) < 1) {
    throw new AppError(400, 'VALIDATION_ERROR', 'categoryId must be a positive integer');
  }
}

function validateProductPatch(body) {
  if (!body || Object.keys(body).length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'At least one field is required');
  }
  if (body.name !== undefined) requiredString(body.name, 'name');
  if (body.slug !== undefined) validateSlug(body.slug);
  if (body.description !== undefined) optionalString(body.description, 'description');
  validateStatus(body.status);
  if (body.categoryId !== undefined && (!Number.isInteger(Number(body.categoryId)) || Number(body.categoryId) < 1)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'categoryId must be a positive integer');
  }
}

function validateSkuCreate(body) {
  requiredString(body.skuCode, 'skuCode');
  validatePositiveMoney(body.price);
  validateNonNegativeInteger(body.stockQuantity);
  if (body.variantId !== undefined && body.variantId !== null && (!Number.isInteger(Number(body.variantId)) || Number(body.variantId) < 1)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'variantId must be a positive integer or null');
  }
}

function validateSkuPatch(body) {
  if (!body || Object.keys(body).length === 0) throw new AppError(400, 'VALIDATION_ERROR', 'At least one field is required');
  if (body.price !== undefined) validatePositiveMoney(body.price);
  if (body.stockQuantity !== undefined) validateNonNegativeInteger(body.stockQuantity);
  if (body.activeStatus !== undefined && typeof body.activeStatus !== 'boolean') throw new AppError(400, 'VALIDATION_ERROR', 'activeStatus must be boolean');
}

function validateVariantCreate(body) {
  requiredString(body.name, 'name');
  if (body.optionValues !== undefined && (typeof body.optionValues !== 'object' || body.optionValues === null || Array.isArray(body.optionValues))) {
    throw new AppError(400, 'VALIDATION_ERROR', 'optionValues must be a JSON object');
  }
}

module.exports = {
  validateCategoryCreate,
  validateProductCreate,
  validateProductPatch,
  validateSkuCreate,
  validateSkuPatch,
  validateVariantCreate,
  validateNonNegativeInteger,
  validateSlug
};
