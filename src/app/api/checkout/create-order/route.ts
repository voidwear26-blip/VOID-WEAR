
import { NextResponse } from 'next/server';

/**
 * Mock Razorpay Order Creation API.
 * In production, you would use the 'razorpay' npm package.
 */
export async function POST(request: Request) {
  try {
    const { amount, currency = 'INR' } = await request.json();

    // Simulating Razorpay order creation
    const orderId = `order_${Math.random().toString(36).slice(2, 11)}`;

    return NextResponse.json({
      id: orderId,
      amount: amount * 100, // Razorpay expects paise
      currency: currency
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
