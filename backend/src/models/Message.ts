import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  text: string;
  sender: Types.ObjectId;
  workspaceId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema(
  {
    text: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true }
  },
  { timestamps: true }
);

// Index for fast message lookup by workspace
messageSchema.index({ workspaceId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
