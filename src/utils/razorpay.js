import Razorpay from 'razorpay';
import crypto from 'crypto';

let instance = null;

export function getRazorpay() {
  if (instance) return instance;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret || key_id.includes('xxxx')) {
    return null; // not configured — handled gracefully by callers
  }
  instance = new Razorpay({ key_id, key_secret });
  return instance;
}

export function isRazorpayConfigured() {
  return !!getRazorpay();
}

// Verify the signature returned by Razorpay Checkout on success.
export function verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === razorpay_signature;
}
