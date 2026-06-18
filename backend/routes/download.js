import express from 'express';
import { queueDownload, serveFile, getHistory } from '../controllers/downloadController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/history', protect, getHistory);
router.post('/', optionalProtect, queueDownload);
router.get('/file/:id', serveFile);

export default router;
