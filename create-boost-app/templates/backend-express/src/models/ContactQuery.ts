import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactQueryDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const ContactQuerySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true, default: 'General Inquiry' },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new' },
  },
  { timestamps: true }
);

const ContactQuery: Model<IContactQueryDocument> =
  mongoose.models.ContactQuery || mongoose.model<IContactQueryDocument>('ContactQuery', ContactQuerySchema);

export default ContactQuery;
