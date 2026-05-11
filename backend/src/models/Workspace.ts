import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWorkspaceMember {
  userId: Types.ObjectId;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  createdBy: Types.ObjectId;
  members: IWorkspaceMember[];
  settings: {
    taskStatuses: string[];
    defaultView: 'kanban' | 'list';
  };
  createdAt: Date;
  updatedAt: Date;
}

const workspaceMemberSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const workspaceSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [workspaceMemberSchema],
    settings: {
      taskStatuses: {
        type: [String],
        default: ['To Do', 'In Progress', 'Done']
      },
      defaultView: {
        type: String,
        enum: ['kanban', 'list'],
        default: 'kanban'
      }
    }
  },
  { timestamps: true }
);

export const Workspace = mongoose.model<IWorkspace>('Workspace', workspaceSchema);
