import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  text: string;
  taskId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Index for fast comment lookup by task
commentSchema.index({ taskId: 1, createdAt: 1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
