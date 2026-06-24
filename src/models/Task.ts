import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  category: 'Urgent' | 'Important' | 'Work' | 'Personal' | 'Other';
  completed: boolean;
  user: Types.ObjectId;
  deleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: function (value: Date): boolean {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        },
        message: 'Due date cannot be in the past',
      },
    },
    category: {
      type: String,
      enum: {
        values: ['Urgent', 'Important', 'Work', 'Personal', 'Other'],
        message: '{VALUE} is not a supported category',
      },
      default: 'Personal',
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ user: 1, completed: 1, category: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ deleted: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
export default Task;