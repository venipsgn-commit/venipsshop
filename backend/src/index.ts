import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes    from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes   from './routes/order.routes';
import userRoutes    from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import promoRoutes   from './routes/promo.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 4000;

// ── Sécurité ──────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { error: 'Trop de requêtes, réessayez dans 15 minutes.' },
}));

// ── Middleware ────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Health check ──────────────────────────
app.get('/health', (_, res) => {
  res.json({ status: 'OK', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ── Routes API v1 ─────────────────────────
app.use('/api/v1/auth',       authRoutes);
app.use('/api/v1/products',   productRoutes);
app.use('/api/v1/orders',     orderRoutes);
app.use('/api/v1/users',      userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/promo',      promoRoutes);

// ── 404 ───────────────────────────────────
app.use((_, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// ── Gestion erreurs globale ───────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Venips API démarrée sur http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});

export default app;
