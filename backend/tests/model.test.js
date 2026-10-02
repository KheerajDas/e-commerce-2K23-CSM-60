const fs = require('fs');
const path = require('path');

const schema = fs.readFileSync(path.join(__dirname, '../migrations/002_create_catalog.sql'), 'utf8').toLowerCase();

test('catalog schema defines the required entities', () => {
  for (const table of ['categories', 'products', 'variants', 'skus']) {
    expect(schema).toContain(`create table if not exists ${table}`);
  }
});

test('catalog schema protects unique identifiers and money/stock integrity', () => {
  expect(schema).toMatch(/slug\s+varchar\([^)]*\)\s+not null unique/);
  expect(schema).toMatch(/sku_code\s+varchar\([^)]*\)\s+not null unique/);
  expect(schema).toContain('price decimal(12,2)');
  expect(schema).toContain('stock_quantity int unsigned');
  expect(schema).toContain('chk_skus_price_nonnegative');
  expect(schema).toContain('chk_skus_stock_nonnegative');
});

test('catalog schema declares foreign-key delete/update policies', () => {
  expect(schema).toContain('on delete restrict on update cascade');
  expect(schema).toContain('fk_categories_parent');
  expect(schema).toContain('fk_products_category');
  expect(schema).toContain('fk_variants_product');
  expect(schema).toContain('fk_skus_variant');
});
