import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { login, me, logout } from '../controllers/authController.js';
import * as products from '../controllers/productController.js';
import * as orders from '../controllers/orderController.js';
import * as content from '../controllers/contentController.js';
import * as misc from '../controllers/miscController.js';
import { uploadImage, uploadStatus } from '../controllers/uploadController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

/* ---------------- Auth ---------------- */
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', protect, me);

/* ---------------- Public ---------------- */
router.get('/products', products.listPublic);
router.get('/products/:slug', products.getBySlug);
router.get('/content', content.getContent);
router.post('/subscribers', misc.subscribe);

router.get('/payment/status', orders.razorpayStatus);
router.post('/orders', orders.createOrder);
router.post('/orders/verify', orders.verifyOrder);
router.get('/orders/track/:orderNumber', orders.trackOrder);

/* ---------------- Admin (protected) ---------------- */
router.get('/admin/stats', protect, misc.stats);
router.get('/admin/subscribers', protect, misc.listSubscribers);

router.get('/admin/upload/status', protect, uploadStatus);
router.post('/admin/upload', protect, upload.single('file'), uploadImage);

router.get('/admin/products', protect, products.listAdmin);
router.get('/admin/products/:id', protect, products.getById);
router.post('/admin/products', protect, products.create);
router.put('/admin/products/:id', protect, products.update);
router.delete('/admin/products/:id', protect, products.remove);

router.get('/admin/orders', protect, orders.listOrders);
router.get('/admin/orders/:id', protect, orders.getOrder);
router.put('/admin/orders/:id', protect, orders.updateOrder);

router.get('/admin/content', content.getContent); // supports ?full=1
router.post('/admin/content', protect, content.createContent);
router.put('/admin/content', protect, content.updateContent);

export default router;
