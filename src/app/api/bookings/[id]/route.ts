import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET /api/bookings/[id] - Get a specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const booking = await Booking.findById(params.id)
      .populate('roomId', 'roomNumber capacity')
      .populate('customerId', 'name phone email');
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update a specific booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    // If updating time or room, check for overlapping bookings
    if (body.startTime || body.endTime || body.roomId || body.date) {
      const currentBooking = await Booking.findById(params.id);
      if (!currentBooking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      
      const roomId = body.roomId || currentBooking.roomId;
      const date = body.date ? new Date(body.date) : currentBooking.date;
      const startTime = body.startTime || currentBooking.startTime;
      const endTime = body.endTime || currentBooking.endTime;
      
      const overlappingBooking = await Booking.findOne({
        _id: { $ne: params.id },
        roomId: roomId,
        date: date,
        status: { $ne: 'cancelled' },
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });
      
      if (overlappingBooking) {
        return NextResponse.json(
          { error: 'Room is already booked for this time slot' },
          { status: 400 }
        );
      }
    }
    
    const booking = await Booking.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('roomId', 'roomNumber capacity')
     .populate('customerId', 'name phone email');
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 400 }
    );
  }
}

// DELETE /api/bookings/[id] - Delete a specific booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const booking = await Booking.findByIdAndDelete(params.id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}

