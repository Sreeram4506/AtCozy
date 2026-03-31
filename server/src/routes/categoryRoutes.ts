import express from 'express';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware.js';
import { getCategories, getFeaturedCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';

const router = express.Router();

// GET all categories
router.get('/', getCategories);

// GET featured categories
router.get('/featured', getFeaturedCategories);

// GET category by slug
router.get('/:slug', getCategoryBySlug);

// ADMIN: Create category
router.post('/', authMiddleware, adminMiddleware, createCategory);

// ADMIN: Update category
router.put('/:id', authMiddleware, adminMiddleware, updateCategory);

// ADMIN: Delete category
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

export default router;
