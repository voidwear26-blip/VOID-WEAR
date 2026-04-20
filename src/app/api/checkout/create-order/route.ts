import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * PRODUCTION HARDENED: Razorpay Order Creation
 * Uses provided credentials to establish a secure transaction node.
 */
export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  
  try {
    const body = await request.json();
    const { amount, currency = 'INR', notes = {} } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'INVALID_AMOUNT' }, { status: 400 });
    }

    // Convert to smallest currency unit (Paise)
    const amountInPaise = Math.round(amount * 100);
    
    if (amountInPaise < 100) {
      return NextResponse.json({ error: 'MINIMUM_AMOUNT_NOT_MET' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error(`[${timestamp}] CONFIG_ERROR: Razorpay keys missing.`);
      return NextResponse.json({ error: 'SERVER_CONFIG_ERROR' }, { status: 500 });
    }

    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `void_transmission_${Date.now()}`,
      notes: {
        ...notes,
        system_version: 'VOID_WEAR_CORE_V12'
      }
    });
    
    console.log(`[${timestamp}] ORDER_CREATED: ${order.id}`);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error: any) {
    console.error(`[${timestamp}] CRITICAL_ERROR (create-order):`, error);
    return NextResponse.json({ 
      error: 'INTERNAL_SERVER_ERROR', 
      message: error.message || 'GATEWAY_CONNECTION_FAILED' 
    }, { status: 500 });
  }
}
