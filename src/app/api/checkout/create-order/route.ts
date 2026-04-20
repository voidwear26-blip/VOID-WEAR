
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * SECURE BACKEND PROTOCOL: Razorpay Order Creation
 * This route is the sole authority for transaction initialization.
 * It uses the Key Secret exclusively on the server side.
 */
export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  
  try {
    const body = await request.json();
    const { amount, notes = {} } = body;

    // 1. Validation Audit
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ 
        error: 'INVALID_DATA_NODE', 
        message: 'Transaction amount must be a positive integer.' 
      }, { status: 400 });
    }

    // 2. Currency Calibration (Strict Integer Paise)
    // Razorpay fails if amount has decimals. We multiply by 100 and round.
    const amountInPaise = Math.round(amount * 100);
    
    if (amountInPaise < 100) {
      return NextResponse.json({ 
        error: 'MINIMUM_VALUATION_FAILURE', 
        message: 'Acquisition value too low for uplink (min ₹1).' 
      }, { status: 400 });
    }

    // 3. Credentials Retrieval
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error(`[${timestamp}] CRITICAL_SYSTEM_ERROR: Razorpay credentials missing from .env`);
      return NextResponse.json({ 
        error: 'GATEWAY_ID_UNSET', 
        message: 'The transaction gateway is currently offline.' 
      }, { status: 500 });
    }

    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // 4. Initialize Razorpay Order Transmission
    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `void_tx_${Date.now()}`,
      notes: {
        ...notes,
        protocol_version: 'VOID_WEAR_SECURE_V12'
      }
    });
    
    console.log(`[${timestamp}] UPLINK_SUCCESS: ORDER_UID ${order.id}`);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error: any) {
    console.error(`[${timestamp}] GATEWAY_HANDSHAKE_CRASH:`, error);
    return NextResponse.json({ 
      error: 'SERVER_UPLINK_FAILURE', 
      message: error.message || 'Could not establish connection with the payment gateway.' 
    }, { status: 500 });
  }
}
