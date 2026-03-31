import { Request, Response } from 'express';
import Category from '../models/Category.js';

// GET /api/categories - Get all categories
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/categories/featured - Get featured categories
export const getFeaturedCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isFeatured: true }).sort({ name: 1 });
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/categories/:slug - Get category by slug
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN ONLY: Create category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, isFeatured } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-');
    const newCategory = new Category({ name, slug, description, image, isFeatured });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN ONLY: Update category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    if (updates.name) {
      updates.slug = updates.name.toLowerCase().replace(/ /g, '-');
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN ONLY: Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
