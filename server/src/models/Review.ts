import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  productId: { type: Number, required: true, index: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isVerifiedPurchase: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Ensure a user can only leave one review per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
