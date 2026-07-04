import asyncHandler from 'express-async-handler';
import Subscriber from '../models/Subscriber.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// POST /api/subscribers  (public)
export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email');
  }
  await Subscriber.updateOne(
    { email: email.toLowerCase().trim() },
    { $setOnInsert: { email: email.toLowerCase().trim() } },
    { upsert: true }
  );
  res.status(201).json({ message: 'Subscribed' });
});

// GET /api/admin/subscribers
export const listSubscribers = asyncHandler(async (req, res) => {
  const subs = await Subscriber.find().sort({ createdAt: -1 });
  res.json(subs);
});

// GET /api/admin/stats  — dashboard summary
export const stats = asyncHandler(async (req, res) => {
  const [productCount, subscriberCount, orders] = await Promise.all([
    Product.countDocuments(),
    Subscriber.countDocuments(),
    Order.find().select('total status createdAt currency'),
  ]);

  const paid = orders.filter((o) => ['paid', 'fulfilled'].includes(o.status));
  const revenue = paid.reduce((s, o) => s + o.total, 0);

  const byStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const recent = await Order.find().sort({ createdAt: -1 }).limit(6);

  res.json({
    productCount,
    subscriberCount,
    orderCount: orders.length,
    paidCount: paid.length,
    revenue,
    currency: process.env.CURRENCY || 'INR',
    byStatus,
    recent,
  });
});
