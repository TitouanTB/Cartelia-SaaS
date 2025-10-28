import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config';
import routes from './routes';

const app = express();

app.use(helmet());

app.use(cors({
  origin: env.CORS_ORIGINS,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(routes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = env.PORT;

app.listen(port, () => {
  console.log(`🚀 Cartelia backend running on port ${port}`);
  console.log(`📚 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 Public URL: ${env.PUBLIC_BASE_URL}`);
});

export default app;
