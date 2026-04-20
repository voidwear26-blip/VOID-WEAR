import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * PRODUCTION HARDENED: Razorpay Payment Verification
 * Implements HMAC-SHA256 signature verification for transaction integrity.
 */
export async function POST(request: Request) {
  const timestamp = new Date().toISOString();

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'MISSING_PARAMETERS' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error(`[${timestamp}] CONFIG_ERROR: Secret key missing.`);
      return NextResponse.json({ error: 'SERVER_CONFIG_ERROR' }, { status: 500 });
    }

    // Verify signature: HMAC-SHA256(order_id + "|" + payment_id, secret)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      console.log(`[${timestamp}] PAYMENT_VERIFIED: ${razorpay_order_id}`);
      return NextResponse.json({ status: 'success' });
    } else {
      console.warn(`[${timestamp}] SECURITY_ALERT: Signature mismatch for order ${razorpay_order_id}`);
      return NextResponse.json({ status: 'failure', message: 'INVALID_SIGNATURE' }, { status: 400 });
    }
  } catch (error: any) {
    console.error(`[${timestamp}] CRITICAL_ERROR (verify-payment):`, error);
    return NextResponse.json({ 
      error: 'VERIFICATION_FAILED', 
      message: error.message 
    }, { status: 500 });
  }
}
