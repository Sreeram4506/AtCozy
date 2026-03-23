import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: string;
  items: Array<{ productId: number; quantity: number; price: number }>;
  totalPrice: number;
  status: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  userId: { type: String, required: true },
  items: [{
    productId: { type: Number, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrder>('Order', OrderSchema);
