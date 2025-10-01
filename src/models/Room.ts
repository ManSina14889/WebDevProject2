import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  capacity: number;
  status: 'available' | 'occupied';
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [20, 'Capacity cannot exceed 20'],
  },
  status: {
    type: String,
    enum: ['available', 'occupied'],
    default: 'available',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

