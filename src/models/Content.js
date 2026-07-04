import mongoose from 'mongoose';

// Flexible key/value CMS blocks that drive editable copy + images on the public site.
const contentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    group: { type: String, default: 'general' }, // section grouping in admin (hero, story, ...)
    label: { type: String, default: '' }, // human label shown in admin
    type: { type: String, enum: ['text', 'textarea', 'image', 'number', 'url'], default: 'text' },
    value: { type: mongoose.Schema.Types.Mixed, default: '' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Content', contentSchema);
