import Download from '../models/Download.js';
import { downloadQueue } from '../workers/queue.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const queueDownload = async (req, res) => {
  const { url, title, thumbnail, platform, type, format_id, quality } = req.body;

  if (!url || !format_id) {
    return res.status(400).json({ error: 'URL and format_id are required' });
  }

  try {
    const download = await Download.create({
      user: req.user ? req.user._id : null,
      url,
      title,
      thumbnail,
      platform,
      type: type || 'video',
      quality: type === 'audio' ? `${quality || '192K'} (${format_id})` : format_id,
      status: 'pending'
    });

    await downloadQueue.add('processDownload', {
      downloadId: download._id,
      url,
      format_id,
      type,
      quality
    });

    res.json({ message: 'Download queued', downloadId: download._id });
  } catch (error) {
    console.error('Error queueing download:', error);
    res.status(500).json({ error: 'Failed to queue download', details: error.message });
  }
};

export const serveFile = async (req, res) => {
  const { id } = req.params;
  try {
    const download = await Download.findById(id);
    if (!download) return res.status(404).json({ error: 'Download not found' });
    
    if (download.status !== 'completed') {
      return res.status(400).json({ error: 'File is not ready yet' });
    }

    const downloadsDir = path.join(__dirname, '..', 'downloads');
    
    // Find the file that matches the ID since yt-dlp might have added an extension
    const files = fs.readdirSync(downloadsDir);
    const file = files.find(f => f.startsWith(id.toString()));

    if (!file) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    const filePath = path.join(downloadsDir, file);
    
    // Set appropriate headers to force download instead of inline view
    res.download(filePath, `${download.title}.${file.split('.').pop()}`);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await Download.find({ user: req.user._id, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
