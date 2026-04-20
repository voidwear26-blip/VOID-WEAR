import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * PRODUCTION HARDENED: Razorpay Order Creation
 * Replaces mock logic with real SDK integration.
 */
export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  
  try {
    const body = await request.json();
    const { amount, currency = 'INR' } = body;

    // 1. Input Validation (Amount must be at least 1 INR / 100 Paise)
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.error(`[${timestamp}] VALIDATION FAILURE: Invalid amount provided.`);
      return NextResponse.json({ error: 'INVALID_AMOUNT' }, { status: 400 });
    }

    const amountInPaise = Math.round(amount * 100);
    if (amountInPaise < 100) {
      return NextResponse.json({ error: 'MINIMUM_AMOUNT_NOT_MET' }, { status: 400 });
    }

    // 2. Initialize Razorpay Client
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // 3. Create Razorpay Order
    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `void_transmission_${Date.now()}`,
    });
    
    console.log(`[${timestamp}] ORDER_CREATED: ID=${order.id}, Amount=${amountInPaise}`);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error: any) {
    console.error(`[${timestamp}] CRITICAL_ERROR (create-order):`, error);
    return NextResponse.json({ 
      error: 'INTERNAL_SERVER_ERROR', 
      message: error.message || 'COULD NOT ESTABLISH ORDER WITH RAZORPAY' 
    }, { status: 500 });
  }
}