import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * PRODUCTION HARDENED: Razorpay Order Creation
 * Ensures amount is a strict integer (Paise) to prevent API rejection.
 */
export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  
  try {
    const body = await request.json();
    const { amount, currency = 'INR' } = body;

    // 1. Input Validation (Amount must be at least 1 INR / 100 Paise)
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.error(`[${timestamp}] VALIDATION FAILURE: Invalid amount provided: ${amount}`);
      return NextResponse.json({ error: 'INVALID_AMOUNT' }, { status: 400 });
    }

    // Razorpay requires amount in smallest currency unit (Paise for INR)
    const amountInPaise = Math.round(amount * 100);
    
    if (amountInPaise < 100) {
      return NextResponse.json({ error: 'MINIMUM_AMOUNT_NOT_MET' }, { status: 400 });
    }

    // 2. Initialize Razorpay Client with Safety Check
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === 'rzp_test_placeholder') {
      console.warn(`[${timestamp}] CONFIG_WARNING: Razorpay keys missing or using placeholders.`);
      // In development/test, we return a mock order to prevent 500 error
      return NextResponse.json({
        id: `order_mock_${Date.now()}`,
        amount: amountInPaise,
        currency: currency,
        isMock: true
      });
    }

    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // 3. Create Razorpay Order
    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `void_transmission_${Date.now()}`,
    });
    
    console.log(`[${timestamp}] ORDER_CREATED: ID=${order.id}, Amount=${amountInPaise} Paise`);

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
