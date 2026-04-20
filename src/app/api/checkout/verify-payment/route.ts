
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * SECURE BACKEND PROTOCOL: Payment Verification
 * Implements HMAC-SHA256 signature verification for transaction integrity.
 */
export async function POST(request: Request) {
  const timestamp = new Date().toISOString();

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ 
        error: 'MISSING_DATA_NODES', 
        message: 'Incomplete verification packet.' 
      }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error(`[${timestamp}] SECURITY_FAILURE: Verification secret missing from server archive.`);
      return NextResponse.json({ 
        error: 'AUTH_NODE_OFFLINE', 
        message: 'Internal security audit failed.' 
      }, { status: 500 });
    }

    /**
     * VERIFICATION SEQUENCE:
     * signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
     */
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      console.log(`[${timestamp}] AUDIT_PASSED: TRANSACTION_SECURED ${razorpay_order_id}`);
      return NextResponse.json({ status: 'success' });
    } else {
      console.warn(`[${timestamp}] SECURITY_ALERT: Signature mismatch. Unauthorized access attempt detected.`);
      return NextResponse.json({ 
        status: 'failure', 
        message: 'TRANSACTION_INTEGRITY_MISMATCH' 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error(`[${timestamp}] AUDIT_CRASH:`, error);
    return NextResponse.json({ 
      error: 'VERIFICATION_ERROR', 
      message: 'System could not verify transaction authenticity.' 
    }, { status: 500 });
  }
}
