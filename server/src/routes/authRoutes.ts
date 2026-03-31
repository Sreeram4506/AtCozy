import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  register,
  registerValidation,
  login,
  loginValidation,
  getProfile,
  updateProfile,
  toggleWishlist,
  addAddress,
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/wishlist', authMiddleware, toggleWishlist);
router.post('/address', authMiddleware, addAddress);

export default router;
