import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    qty: { type: Number, default: 1, min: 1 },
    image: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    items: { type: [orderItemSchema], default: [] },
    customer: {
      name: { type: String, required: true },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: {
        line1: { type: String, default: '' },
        line2: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        country: { type: String, default: 'India' },
      },
    },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'fulfilled', 'cancelled'],
      default: 'created',
      index: true,
    },
    payment: {
      provider: { type: String, default: 'razorpay' },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      method: String,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.pre('validate', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').estimatedDocumentCount();
    this.orderNumber = 'BRU-' + String(10000 + count + 1);
  }
  next();
});

export default mongoose.model('Order', orderSchema);
