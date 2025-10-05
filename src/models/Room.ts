import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  _id: string;
  roomNumber: string;
  capacity: number;
  status: 'available' | 'occupied';
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['available', 'occupied'],
    default: 'available'
  }
}, {
  timestamps: true
});

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
