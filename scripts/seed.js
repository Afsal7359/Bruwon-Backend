import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Admin from '../src/models/Admin.js';
import Product from '../src/models/Product.js';
import Content from '../src/models/Content.js';

const CUR = process.env.CURRENCY || 'INR';
// gallery shared across all boxes (banner, cross-section, pistachio bowl)
const GALLERY = ['/assets/products/p2.jpg', '/assets/products/p3.jpg', '/assets/products/p6.jpg'];

const products = [
  {
    name: '6-Piece Chocolate Box',
    slug: '6-piece-chocolate-box',
    tagline: 'Pistachio Kunafa Chocolate',
    price: 180,
    shipping: 60,
    pieces: 6,
    currency: CUR,
    image: '/assets/products/p4.jpg',
    gallery: GALLERY,
    tag: '',
    notes: ['6 pieces', 'Pistachio · Kunafa', 'Ships fresh'],
    description:
      'Six handcrafted Bruwon chocolates — pistachio, toasted kunafa and single-origin chocolate — carefully packed to keep them fresh. Perfect for a little treat or a thoughtful small gift.',
    stock: 200,
    featured: false,
    active: true,
    sortOrder: 1,
  },
  {
    name: '10-Piece Chocolate Box',
    slug: '10-piece-chocolate-box',
    tagline: 'Pistachio Kunafa Chocolate',
    price: 300,
    shipping: 40,
    pieces: 10,
    currency: CUR,
    image: '/assets/products/p5.jpg',
    gallery: GALLERY,
    tag: 'Popular',
    notes: ['10 pieces', 'Pistachio · Kunafa', 'Ships fresh'],
    description:
      'Ten Bruwon chocolates in our signature pistachio-kunafa blend — a generous box to share with family and friends (or keep all to yourself).',
    stock: 200,
    featured: false,
    active: true,
    sortOrder: 2,
  },
  {
    name: '15-Piece Chocolate Box',
    slug: '15-piece-chocolate-box',
    tagline: 'Pistachio Kunafa Chocolate',
    price: 480,
    shipping: 0,
    pieces: 15,
    currency: CUR,
    image: '/assets/products/p1.jpg',
    gallery: GALLERY,
    tag: 'Best Value',
    notes: ['15 pieces', 'Free shipping', 'Best value'],
    description:
      'Our best-value box — fifteen pieces of pistachio, toasted kunafa and single-origin chocolate, with free shipping included. The sweetest way to stock up or gift big.',
    stock: 200,
    featured: true,
    active: true,
    sortOrder: 3,
  },
];

const content = [
  // hero
  { key: 'hero.eyebrow', group: 'hero', label: 'Hero eyebrow', type: 'text', value: 'Handcrafted Chocolate' },
  { key: 'hero.title', group: 'hero', label: 'Hero title', type: 'text', value: 'Made to make every moment sweeter.' },
  { key: 'hero.subtitle', group: 'hero', label: 'Hero subtitle', type: 'textarea', value: 'Handcrafted chocolates in small batches — rich, premium and packed fresh. Choose the perfect box for yourself or as a thoughtful gift.' },
  { key: 'hero.image', group: 'hero', label: 'Hero background image', type: 'image', value: 'https://images.pexels.com/photos/6261691/pexels-photo-6261691.jpeg?auto=compress&cs=tinysrgb&w=1600' },
  { key: 'hero.rotateImage', group: 'hero', label: 'Hero rotating-circle image', type: 'image', value: '/assets/products/p3.jpg' },
  // shop
  { key: 'shop.eyebrow', group: 'shop', label: 'Shop eyebrow', type: 'text', value: 'The collection' },
  { key: 'shop.title', group: 'shop', label: 'Shop title', type: 'text', value: 'Bruwon Chocolate Collection' },
  { key: 'shop.subtitle', group: 'shop', label: 'Shop subtitle', type: 'textarea', value: 'Handcrafted chocolates made to make every moment sweeter. Choose the perfect pack for yourself or as a thoughtful gift.' },
  // story
  { key: 'story.eyebrow', group: 'story', label: 'Story eyebrow', type: 'text', value: 'Our obsession' },
  { key: 'story.title', group: 'story', label: 'Story title', type: 'text', value: 'We chase the perfect crack.' },
  { key: 'story.lead', group: 'story', label: 'Story lead', type: 'textarea', value: 'It starts with a sound — the dry snap of chocolate giving way to a soft, green centre.' },
  { key: 'story.body1', group: 'story', label: 'Story paragraph 1', type: 'textarea', value: 'Bruwon began in a small kitchen with one stubborn question: could a chocolate bar hold the warmth of fresh kunafa and the richness of pistachio without losing its snap? We toast every strand by hand, fold it through a pistachio cream we make from scratch, and seal it inside a thin shell of single-origin chocolate.' },
  { key: 'story.body2', group: 'story', label: 'Story paragraph 2', type: 'textarea', value: 'No shortcuts, no fillers, no pretending. Just the most honest version of a flavour the world fell in love with — made slowly, in batches small enough to taste every one.' },
  { key: 'story.image', group: 'story', label: 'Story image', type: 'image', value: '/assets/image.jpg' },
  // process
  { key: 'process.eyebrow', group: 'process', label: 'Process eyebrow', type: 'text', value: 'From tray to bar' },
  { key: 'process.title', group: 'process', label: 'Process title', type: 'text', value: "How it's made." },
  { key: 'process.subtitle', group: 'process', label: 'Process subtitle', type: 'textarea', value: 'Four steps, no rushing. This is the order it actually happens in the kitchen — slow toasting, hand-folding, and a final temper that gives every bar its clean snap.' },
  { key: 'process.image', group: 'process', label: 'Process image', type: 'image', value: 'https://images.pexels.com/photos/6036005/pexels-photo-6036005.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  // quote
  { key: 'quote.text', group: 'quote', label: 'Quote text', type: 'textarea', value: 'I cracked it open and actually gasped. The kunafa still crunches and the pistachio is the real thing — this is the one to beat.' },
  { key: 'quote.author', group: 'quote', label: 'Quote author', type: 'text', value: 'Reema A.' },
  { key: 'quote.role', group: 'quote', label: 'Quote author role', type: 'text', value: 'verified Bruwon regular' },
  // cta / newsletter
  { key: 'cta.eyebrow', group: 'cta', label: 'Newsletter eyebrow', type: 'text', value: 'Join the inner crowd' },
  { key: 'cta.title', group: 'cta', label: 'Newsletter title', type: 'text', value: 'First crack at every drop.' },
  { key: 'cta.subtitle', group: 'cta', label: 'Newsletter subtitle', type: 'textarea', value: 'New flavours sell out fast. Get early access, restock alerts and the occasional pistachio secret.' },
  // footer
  { key: 'footer.tagline', group: 'footer', label: 'Footer tagline', type: 'textarea', value: 'A bar built to be broken. Pistachio, kunafa and single-origin chocolate, handcrafted in small batches.' },
];

async function run() {
  await connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bruwon');

  // Admin
  const email = (process.env.ADMIN_EMAIL || 'admin@bruwon.com').toLowerCase();
  let admin = await Admin.findOne({ email });
  if (!admin) {
    admin = new Admin({ name: process.env.ADMIN_NAME || 'Bruwon Admin', email });
    await admin.setPassword(process.env.ADMIN_PASSWORD || 'admin12345');
    await admin.save();
    console.log(`✔ Admin created: ${email}`);
  } else {
    console.log(`• Admin already exists: ${email}`);
  }

  // Products (upsert by slug)
  for (const p of products) {
    await Product.findOneAndUpdate({ slug: p.slug }, { $set: p }, { upsert: true, setDefaultsOnInsert: true });
  }
  console.log(`✔ Seeded ${products.length} products`);

  // Content (upsert by key)
  for (const c of content) {
    await Content.findOneAndUpdate({ key: c.key }, { $set: c }, { upsert: true, setDefaultsOnInsert: true });
  }
  console.log(`✔ Seeded ${content.length} content blocks`);

  await mongoose.connection.close();
  console.log('✔ Seed complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('✖ Seed failed:', err);
  process.exit(1);
});
