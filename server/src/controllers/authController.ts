import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/authMiddleware.js';

const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
};

export const registerValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const register = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, name, password } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ email: email.toLowerCase(), name, password });
    await newUser.save();

    const token = generateToken(newUser._id as string, newUser.role);
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        wishlist: newUser.wishlist,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id as string, user.role);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        wishlist: user.wishlist,
        addresses: user.addresses,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me — Get current user profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/auth/profile — Update user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      wishlist: user.wishlist,
      addresses: user.addresses,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/wishlist — Toggle wishlist item
export const toggleWishlist = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/address — Add address
export const addAddress = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = req.body;
    if (address.isDefault) {
      user.addresses.forEach((a: any) => (a.isDefault = false));
    }
    user.addresses.push(address);
    await user.save();

    res.status(201).json({ addresses: user.addresses });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
