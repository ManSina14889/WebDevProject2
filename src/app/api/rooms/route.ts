import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';

// GET /api/rooms - Get all rooms
export async function GET() {
  try {
    await connectDB();
    const rooms = await Room.find().sort({ roomNumber: 1 });
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const room = new Room(body);
    await room.save();
    
    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    console.error('Error creating room:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Room number already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create room' },
      { status: 400 }
    );
  }
}

