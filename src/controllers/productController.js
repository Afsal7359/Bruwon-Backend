import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

// GET /api/products  (public — active only)
export const listPublic = asyncHandler(async (req, res) => {
  const products = await Product.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 });
  res.json(products);
});

// GET /api/products/:slug  (public)
export const getBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, active: true });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// GET /api/admin/products  (admin — all)
export const listAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ sortOrder: 1, createdAt: 1 });
  res.json(products);
});

// GET /api/admin/products/:id
export const getById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// POST /api/admin/products
export const create = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// PUT /api/admin/products/:id
export const update = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// DELETE /api/admin/products/:id
export const remove = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ message: 'Product deleted' });
});
