import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  colors?: string[];
  sizes?: string[];
}

const ProductSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  colors: [{ type: String }],
  sizes: [{ type: String }]
});

export default mongoose.model<IProduct>('Product', ProductSchema);
