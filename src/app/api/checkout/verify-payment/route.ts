import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * PRODUCTION HARDENED: Razorpay Payment Verification
 * Implements HMAC-SHA256 signature verification for live transaction integrity.
 */
export async function POST(request: Request) {
  const timestamp = new Date().toISOString();

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'MISSING_PARAMETERS', message: 'Incomplete verification packet.' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error(`[${timestamp}] CRITICAL_CONFIG_ERROR: Verification secret missing.`);
      return NextResponse.json({ error: 'SERVER_CONFIG_ERROR', message: 'VERIFICATION_SECRET_MISSING' }, { status: 500 });
    }

    // Verify signature: HMAC-SHA256(order_id + "|" + payment_id, secret)
    // This ensures the transmission was signed by Razorpay's live private key.
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      console.log(`[${timestamp}] PAYMENT_VERIFIED_SUCCESS: ${razorpay_order_id}`);
      return NextResponse.json({ status: 'success' });
    } else {
      console.warn(`[${timestamp}] SECURITY_ALERT: Signature mismatch for order ${razorpay_order_id}. Possible spoof attempt.`);
      return NextResponse.json({ status: 'failure', message: 'INVALID_SIGNATURE_MATCH' }, { status: 400 });
    }
  } catch (error: any) {
    console.error(`[${timestamp}] VERIFICATION_CRITICAL_FAILURE:`, error);
    return NextResponse.json({ 
      error: 'VERIFICATION_FAILED', 
      message: error.message || 'SYSTEM_INTEGRITY_MISMATCH' 
    }, { status: 500 });
  }
}
