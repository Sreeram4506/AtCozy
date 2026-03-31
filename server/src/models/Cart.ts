import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
  updatedAt: Date;
}

const CartSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  items: [{
    productId: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    size: { type: String },
    color: { type: String },
  }],
}, {
  timestamps: true,
});

export default mongoose.model<ICart>('Cart', CartSchema);
