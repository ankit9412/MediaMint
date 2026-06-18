import express from 'express';
import { analyzeUrl } from '../controllers/analyzeController.js';

const router = express.Router();

router.post('/', analyzeUrl);

export default router;
