import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { getRazorpay, verifyPaymentSignature, isRazorpayConfigured } from '../utils/razorpay.js';
import { calcShipping } from '../utils/shipping.js';
import { sendOrderEmails } from '../utils/mailer.js';

const CURRENCY = () => process.env.CURRENCY || 'INR';

// POST /api/orders  — create order + Razorpay order
// body: { items:[{productId, qty}], customer:{name,email,phone,address:{...}} }
export const createOrder = asyncHandler(async (req, res) => {
  const { items = [], customer = {} } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }
  if (!customer.name || !customer.email) {
    res.status(400);
    throw new Error('Customer name and email are required');
  }

  // Resolve products from DB — trust server prices, not the client.
  const ids = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: ids }, active: true });
  const map = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = [];
  let subtotal = 0;
  for (const line of items) {
    const p = map.get(String(line.productId));
    if (!p) {
      res.status(400);
      throw new Error(`Product unavailable: ${line.productId}`);
    }
    const qty = Math.max(1, parseInt(line.qty, 10) || 1);
    subtotal += p.price * qty;
    orderItems.push({ product: p._id, name: p.name, price: p.price, qty, image: p.image });
  }

  // Order-value based shipping (only the reached tier applies, never summed).
  const shipping = calcShipping(subtotal);
  const total = subtotal + shipping;

  const order = await Order.create({
    items: orderItems,
    customer,
    subtotal,
    shipping,
    total,
    currency: CURRENCY(),
    status: 'created',
  });

  const rzp = getRazorpay();
  if (!rzp) {
    // Razorpay not configured — return order so the client can show a helpful message.
    return res.status(201).json({
      configured: false,
      order,
      message: 'Razorpay keys not configured on the server.',
    });
  }

  const rzpOrder = await rzp.orders.create({
    amount: Math.round(total * 100), // paise
    currency: CURRENCY(),
    receipt: order.orderNumber,
    notes: { orderId: String(order._id), email: customer.email },
  });

  order.payment.razorpayOrderId = rzpOrder.id;
  await order.save();

  res.status(201).json({
    configured: true,
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order._id,
    orderNumber: order.orderNumber,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    customer,
  });
});

// POST /api/orders/verify — verify Razorpay signature and mark paid
export const verifyOrder = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const order = await Order.findOne({ 'payment.razorpayOrderId': razorpay_order_id });
  if (!order) {
    res.status(404);
    throw new Error('Order not found for this payment');
  }

  const valid = verifyPaymentSignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  if (!valid) {
    order.status = 'failed';
    await order.save();
    res.status(400);
    throw new Error('Payment signature verification failed');
  }

  order.status = 'paid';
  order.payment.razorpayPaymentId = razorpay_payment_id;
  order.payment.razorpaySignature = razorpay_signature;
  await order.save();

  // Send confirmation emails (owner + customer). Never let email break the flow.
  try {
    await sendOrderEmails(order);
  } catch (e) {
    console.error('✖ Order emails failed:', e.message);
  }

  res.json({ success: true, order });
});

// GET /api/orders/track/:orderNumber — public lightweight tracking
export const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).select(
    'orderNumber status total currency createdAt items customer.name'
  );
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json(order);
});

// ---------- Admin ----------

// GET /api/admin/orders
// Only orders that reached payment are shown. Unpaid/abandoned 'created' orders
// are hidden by default (they only exist to drive the Razorpay flow).
export const listOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : { status: { $ne: 'created' } };
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json(orders);
});

// GET /api/admin/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name slug');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json(order);
});

// PUT /api/admin/orders/:id — update status/notes
export const updateOrder = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (status) order.status = status;
  if (notes !== undefined) order.notes = notes;
  await order.save();
  res.json(order);
});

export const razorpayStatus = asyncHandler(async (req, res) => {
  res.json({ configured: isRazorpayConfigured(), keyId: process.env.RAZORPAY_KEY_ID || null });
});
