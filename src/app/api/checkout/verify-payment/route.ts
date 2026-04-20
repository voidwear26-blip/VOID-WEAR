
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * SECURE BACKEND PROTOCOL: Integrity Audit
 * Implements HMAC-SHA256 verification to ensure transaction authenticity.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'INCOMPLETE_PACKET' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'SECURE_NODE_OFFLINE' }, { status: 500 });
    }

    /**
     * VERIFICATION SEQUENCE:
     * signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
     */
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature === razorpay_signature) {
      return NextResponse.json({ success: true, status: 'VERIFIED' });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'INTEGRITY_MISMATCH',
        message: 'Signature verification failed.' 
      }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'AUDIT_CRASH' }, { status: 500 });
  }
}
