import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

const clientUrls = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser clients (curl, mobile apps) with no Origin header
      if (!origin) return cb(null, true);
      if (clientUrls.includes(origin)) return cb(null, true);
      // in development, allow any localhost / 127.0.0.1 port (3000, 3001, …)
      if (
        process.env.NODE_ENV !== 'production' &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return cb(null, true);
      }
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'bruwon-api' }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bruwon')
  .then(() => {
    app.listen(PORT, () => console.log(`✔ API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('✖ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
