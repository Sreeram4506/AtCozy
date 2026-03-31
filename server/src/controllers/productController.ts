import { Request, Response } from 'express';
import Product from '../models/Product.js';

// GET /api/products - Get all products with filtering, sorting, pagination
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      page = '1',
      limit = '50',
      featured,
      available,
    } = req.query;

    const filter: any = {};

    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(category as string, 'i') };
    }

    if (search) {
      filter.$text = { $search: search as string };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (featured === 'true') filter.featured = true;
    if (available === 'true') filter.available = true;

    let sortOption: any = { id: 1 };
    switch (sort) {
      case 'price-asc': sortOption = { price: 1 }; break;
      case 'price-desc': sortOption = { price: -1 }; break;
      case 'name-asc': sortOption = { name: 1 }; break;
      case 'name-desc': sortOption = { name: -1 }; break;
      case 'newest': sortOption = { createdAt: -1 }; break;
      default: sortOption = { id: 1 };
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
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
    res.status(500).json({ error: err.message });
  }
};
