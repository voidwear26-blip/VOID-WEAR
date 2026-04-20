import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * PRODUCTION HARDENED: Razorpay Order Creation
 * Establishes a secure transaction node using live credentials.
 */
export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  
  try {
    const body = await request.json();
    const { amount, currency = 'INR', notes = {} } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'INVALID_AMOUNT', message: 'Amount node must be a positive integer.' }, { status: 400 });
    }

    // Convert to smallest currency unit (Paise) - STRICT INTEGER REQUIREMENT
    const amountInPaise = Math.round(amount * 100);
    
    if (amountInPaise < 100) {
      return NextResponse.json({ error: 'MINIMUM_AMOUNT_NOT_MET', message: 'Transaction value too low for uplink.' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes('YOUR_')) {
      console.error(`[${timestamp}] CRITICAL_CONFIG_ERROR: Razorpay credentials missing or invalid.`);
      return NextResponse.json({ error: 'SERVER_CONFIG_ERROR', message: 'GATEWAY_IDENTIFIER_UNSET' }, { status: 500 });
    }

    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Initialize transmission packet
    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `void_transmission_${Date.now()}`,
      notes: {
        ...notes,
        system_version: 'VOID_WEAR_CORE_V12_LIVE'
      }
    });
    
    console.log(`[${timestamp}] ORDER_CREATED_SUCCESS: ${order.id}`);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error: any) {
    console.error(`[${timestamp}] GATEWAY_CONNECTION_FAILURE:`, error);
    
    const diagnosticMessage = error.error?.description || error.message || 'CONNECTION_TO_LIVE_GATEWAY_FAILED';
    
    return NextResponse.json({ 
      error: 'INTERNAL_SERVER_ERROR', 
      message: diagnosticMessage.toUpperCase() 
    }, { status: 500 });
  }
}
