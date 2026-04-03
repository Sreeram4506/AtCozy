import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  id: number;
  shopifyId: number;
  name: string;
  handle: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  category: string;
  productType: string;
  vendor: string;
  description: string;
  tags: string[];
  colors: string[];
  sizes: string[];
  variants: Array<{
    title: string;
    price: number;
    available: boolean;
    sku: string;
  }>;
  stock: number;
  available: boolean;
  featured: boolean;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true, index: true },
  shopifyId: { type: Number },
  name: { type: String, required: true, index: true },
  handle: { type: String, required: true },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number },
  image: { type: String, required: true },
  images: [{ type: String }],
  category: { type: String, required: true, index: true },
  productType: { type: String, default: '' },
  vendor: { type: String, default: 'AtCozy' },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  colors: [{ type: String }],
  sizes: [{ type: String }],
  variants: [{
    title: { type: String },
    price: { type: Number },
    available: { type: Boolean, default: true },
    sku: { type: String },
  }],
  stock: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  source: { type: String, default: 'atcozy.com' }
}, {
  timestamps: true,
});

// Text search index - Required for $text queries
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Safer model export for ESM/Hot-reloading
const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
