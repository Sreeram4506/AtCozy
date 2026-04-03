import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
  category: string;
  size?: string;
  color?: string;
}

export interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface IOrder extends Document {
  orderNumber: string;
  userId: string;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  orderNumber: { type: String, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  items: [{
    productId: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    category: { type: String, required: true, default: 'Product' },
    size: { type: String },
    color: { type: String },
  }],
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'US' },
  },
  paymentMethod: { type: String, default: 'card' },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending' 
  },
  trackingNumber: { type: String },
  notes: { type: String },
}, {
  timestamps: true,
});

// Auto-generate order number
OrderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `AC-${String(count + 1001).padStart(6, '0')}`;
  }
});

export default mongoose.model<IOrder>('Order', OrderSchema);
