import { Schema, model, Document } from 'mongoose';

export interface IInvitation extends Document {
  senderId: Schema.Types.ObjectId;
  senderEmail: string;
  recipientEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
    },
    recipientEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default model<IInvitation>('Invitation', invitationSchema); 