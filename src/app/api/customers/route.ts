import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/customers - Get all customers (users with role 'user')
export async function GET() {
  try {
    await connectDB();
    const customers = await User.find({ role: 'user' })
      .select('name email phone createdAt')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const customer = new User({
      ...body,
      role: 'user'
    });
    await customer.save();
    
    return NextResponse.json(customer, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 400 }
    );
  }
}

