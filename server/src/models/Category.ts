import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  image: { type: String },
  isFeatured: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export default mongoose.model<ICategory>('Category', CategorySchema);
