import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';
import colorsRouter from './routes/colors.js';
import playgroundRouter from './routes/playground.js';
import artifactsRouter from './routes/artifacts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/colors', colorsRouter);
app.use('/api/playground', playgroundRouter);
app.use('/api/artifacts', artifactsRouter);

app.listen(PORT, () => {
  logger.info(`NatureColor server running on http://localhost:${PORT}`);
});
