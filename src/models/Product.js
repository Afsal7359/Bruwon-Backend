import mongoose from 'mongoose';

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
    image: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    tag: { type: String, default: '' }, // e.g. "Best Value", "Popular"
    notes: { type: [String], default: [] }, // e.g. ["6 pieces", "Pistachio · Kunafa"]
    stock: { type: Number, default: 100 },
    weight: { type: String, default: '' },
    pieces: { type: Number, default: 0 }, // pieces per box
    shipping: { type: Number, default: 0 }, // per-box shipping fee (0 = free)
    cocoa: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.pre('validate', function (next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

export default mongoose.model('Product', productSchema);
