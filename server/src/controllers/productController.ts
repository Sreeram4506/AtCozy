import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

// GET /api/products - Get all products with filtering, sorting, pagination
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      sort, 
      minPrice, 
      maxPrice, 
      search,
      onSale 
    } = req.query;

    const query: any = {};
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by onSale
    if (onSale === 'true') {
      query.discountPrice = { $exists: true, $ne: null };
    }

    // Search query
    if (search) {
      query.$text = { $search: search as string };
    }

    const sortOptions: any = {};
    if (sort === 'price-low') sortOptions.price = 1;
    else if (sort === 'price-high') sortOptions.price = -1;
    else if (sort === 'newest') sortOptions.createdAt = -1;
    else sortOptions.createdAt = -1;

    console.log('Fetching products with query:', JSON.stringify(query));
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`Database connection not ready. State: ${mongoose.connection.readyState}`);
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    console.error('CRITICAL ERROR in getProducts:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/:id - Get single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ id: parseInt(req.params.id) });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    console.error('Error in getProductById:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/categories - Get all unique categories
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Product.distinct('category');
    const categoryCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ categories, categoryCounts });
  } catch (err: any) {
    console.error('Error in getCategories:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/search - Full-text search
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query is required' });

    const products = await Product.find({
      $or: [
        { name: { $regex: q as string, $options: 'i' } },
        { description: { $regex: q as string, $options: 'i' } },
        { category: { $regex: q as string, $options: 'i' } },
        { tags: { $regex: q as string, $options: 'i' } },
      ],
    }).limit(20);

    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/featured - Get featured products
export const getFeaturedProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({ featured: true, available: true }).limit(16);
    res.json(products);
  } catch (err: any) {
    console.error('Error in getFeaturedProducts:', err);
    res.status(500).json({ error: err.message });
  }
};
