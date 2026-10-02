const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const category = require('../controllers/categoryController');
const product = require('../controllers/productController');

const router = express.Router();
router.use(authenticate, requireAdmin);

router.post('/categories', asyncHandler(category.create));
router.get('/categories', asyncHandler(category.list));
router.patch('/categories/:id', asyncHandler(category.update));

router.post('/products', asyncHandler(product.createProduct));
router.get('/products', asyncHandler(product.listProducts));
router.patch('/products/:id', asyncHandler(product.patchProduct));
router.post('/products/:id/variants', asyncHandler(product.createVariant));
router.post('/products/:id/skus', asyncHandler(product.createSku));
router.patch('/skus/:id', asyncHandler(product.patchSku));

module.exports = router;
