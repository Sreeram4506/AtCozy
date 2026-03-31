import express from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  searchProducts,
  getFeaturedProducts,
} from '../controllers/productController.js';

const router = express.Router();

// Public product routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

export default router;
