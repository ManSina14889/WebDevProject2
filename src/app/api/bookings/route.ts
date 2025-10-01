import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

// GET /api/bookings - Get all bookings
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const roomId = searchParams.get('roomId');
    
    let query: any = {};
    
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      
      query.date = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    }
    
    if (roomId) {
      query.roomId = roomId;
    }
    
    const bookings = await Booking.find(query)
      .populate('roomId', 'roomNumber capacity')
      .populate('customerId', 'name phone email')
      .sort({ date: 1, startTime: 1 });
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      roomId: body.roomId,
      date: new Date(body.date),
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lt: body.endTime },
          endTime: { $gt: body.startTime }
        }
      ]
    });
    
    if (overlappingBooking) {
      return NextResponse.json(
        { error: 'Room is already booked for this time slot' },
        { status: 400 }
      );
    }
    
    const booking = new Booking(body);
    await booking.save();
    
    // Populate the booking with room and customer details
    await booking.populate('roomId', 'roomNumber capacity');
    await booking.populate('customerId', 'name phone email');
    
    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 400 }
    );
  }
}

