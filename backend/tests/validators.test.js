const { validateSlug, validateNonNegativeInteger, validateProductCreate, validateSkuCreate } = require('../src/validators/catalog');

test('accepts valid slugs', () => expect(() => validateSlug('mobile-phones')).not.toThrow());
test('rejects invalid slugs', () => expect(() => validateSlug('Mobile Phones')).toThrow('slug must contain'));
test('rejects negative stock', () => expect(() => validateNonNegativeInteger(-1)).toThrow('non-negative integer'));
test('requires product fields', () => expect(() => validateProductCreate({ name: 'Phone', slug: 'phone' })).toThrow('categoryId'));
test('accepts a valid SKU payload', () => expect(() => validateSkuCreate({ skuCode: 'PHONE-BLK', price: 10, stockQuantity: 3 })).not.toThrow());
