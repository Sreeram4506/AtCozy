import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  isSubscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  isSubscribed: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.model<INewsletter>('Newsletter', NewsletterSchema);
