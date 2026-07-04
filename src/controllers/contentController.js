import asyncHandler from 'express-async-handler';
import Content from '../models/Content.js';

// GET /api/content  — public; returns { key: value } map (+ grouped list for admin via ?full=1)
export const getContent = asyncHandler(async (req, res) => {
  const docs = await Content.find().sort({ group: 1, sortOrder: 1 });
  if (req.query.full) return res.json(docs);
  const map = {};
  for (const d of docs) map[d.key] = d.value;
  res.json(map);
});

// PUT /api/admin/content — bulk upsert: body { updates: [{key, value}] } or { key, value }
export const updateContent = asyncHandler(async (req, res) => {
  const updates = Array.isArray(req.body.updates)
    ? req.body.updates
    : [{ key: req.body.key, value: req.body.value }];

  const results = [];
  for (const u of updates) {
    if (!u.key) continue;
    const doc = await Content.findOneAndUpdate(
      { key: u.key },
      { $set: { value: u.value } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    results.push(doc);
  }
  res.json(results);
});

// POST /api/admin/content — create a new content block (with metadata)
export const createContent = asyncHandler(async (req, res) => {
  const doc = await Content.findOneAndUpdate(
    { key: req.body.key },
    { $set: req.body },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(doc);
});
