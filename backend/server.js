import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import connectDB from './config/db.js';
import analyzeRoutes from './routes/analyze.js';
import downloadRoutes from './routes/download.js';
import authRoutes from './routes/auth.js';
import { initSocket } from './utils/socket.js';
import './workers/downloadWorker.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);

// Init Socket.io
initSocket(httpServer);

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('MediaMint API is running...');
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
