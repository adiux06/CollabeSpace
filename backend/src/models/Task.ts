import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  workspaceId: Types.ObjectId;
  assignee?: Types.ObjectId;
  createdBy: Types.ObjectId;
  dueDate?: Date;
  tags: string[];
  subtasks: { title: string; completed: boolean }[];
  order: number;
  attachments: string[]; // URLs or base64
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, required: true, default: 'To Do' },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'urgent'], 
      default: 'medium' 
    },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
    tags: [{ type: String }],
    subtasks: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }
      }
    ],
    order: { type: Number, required: true, default: 0 },
    attachments: [{ type: String }]
  },
  { timestamps: true }
);

// Critical indexes for Kanban queries
taskSchema.index({ workspaceId: 1, status: 1, order: 1 });
taskSchema.index({ assignee: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
