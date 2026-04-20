
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * SECURE BACKEND PROTOCOL: Order Creation Authority
 * This route is the sole node for transaction initialization.
 * Enforces strict integer conversion for Paise to prevent gateway crashes.
 */
export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  
  try {
    const body = await request.json();
    const { amount, notes = {} } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'INVALID_VALUATION' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error(`[${timestamp}] CRITICAL: RAZORPAY_CREDENTIALS_MISSING`);
      return NextResponse.json({ error: 'GATEWAY_OFFLINE' }, { status: 500 });
    }

    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Calibration: Convert INR to strict integer Paise
    const amountInPaise = Math.round(amount * 100);

    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `void_tx_${Date.now()}`,
      notes: {
        ...notes,
        system_version: 'VOID_WEAR_V12_LIVE'
      }
    });
    
    return NextResponse.json(order);
  } catch (error: any) {
    console.error(`[${timestamp}] UPLINK_CRASH:`, error);
    return NextResponse.json({ 
      error: 'UPLINK_FAILURE', 
      message: error.message || 'GATEWAY_HANDSHAKE_FAILED' 
    }, { status: 500 });
  }
}
