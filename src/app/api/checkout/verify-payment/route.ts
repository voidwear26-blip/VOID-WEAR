
import { NextResponse } from 'next/server';

/**
 * Mock Razorpay Payment Verification API.
 * In production, you would verify the signature using the secret.
 */
export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // In real scenario: crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)...
    const isValid = !!razorpay_payment_id;

    if (isValid) {
      return NextResponse.json({ status: 'success' });
    } else {
      return NextResponse.json({ status: 'failure' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
