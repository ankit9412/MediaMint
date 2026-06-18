import { Worker } from 'bullmq';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Download from '../models/Download.js';
import { getIO } from '../utils/socket.js';
import dotenv from 'dotenv';
import ffmpegPath from 'ffmpeg-static';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';
const ytdlpExecutable = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
const ytdlpPath = path.join(__dirname, '..', ytdlpExecutable);
const downloadsDir = path.join(__dirname, '..', 'downloads');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

import IORedis from 'ioredis';

const connection = process.env.REDIS_URL 
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    };

export const downloadWorker = new Worker('downloadQueue', async job => {
  const { downloadId, url, format_id, type } = job.data;
  
  const download = await Download.findById(downloadId);
  if (!download) throw new Error('Download record not found');
  
  download.status = 'processing';
  await download.save();

  const io = getIO();
  io.to(downloadId).emit('status', { status: 'processing', progress: 0 });

  return new Promise((resolve, reject) => {
    // Basic yt-dlp command to download specific format and report progress
    const outputFile = path.join(downloadsDir, `${downloadId}.%(ext)s`);
    
    let args = [];

    if (type === 'audio') {
      // Audio conversion using format_id as extension (e.g., 'mp3')
      args = [
        '--js-runtimes', 'node',
        '-4',
        '--extractor-args', 'youtube:player_client=web_embedded,ios,android,tv',
        '-f', 'bestaudio',
        '--extract-audio',
        '--audio-format', format_id, // usually 'mp3'
        '--audio-quality', job.data.quality || '192K',
        '--ffmpeg-location', ffmpegPath,
        '--newline',
        '-o', outputFile,
        url
      ];
    } else {
      // Video download
      const formatString = `${format_id}+bestaudio/best`;
      args = [
        '--js-runtimes', 'node',
        '-4',
        '--extractor-args', 'youtube:player_client=web_embedded,ios,android,tv',
        '-f', formatString, 
        '--ffmpeg-location', ffmpegPath,
        '--newline', 
        '-o', outputFile, 
        url
      ];
    }
    const cookiesPath = path.join(__dirname, '..', 'cookies.txt');
    if (fs.existsSync(cookiesPath)) {
      args.unshift('--cookies', cookiesPath);
    }
    
    const child = execFile(ytdlpPath, args);

    child.stdout.on('data', (data) => {
      const output = data.toString();
      // Simple regex to extract percentage like " 45.5% "
      const match = output.match(/(\d+\.\d+)%/);
      if (match) {
        const progress = parseFloat(match[1]);
        io.to(downloadId).emit('progress', { progress });
        download.progress = progress;
        // Don't await save on every tick to avoid overwhelming DB, but update instance
        download.save().catch(console.error);
      }
    });

    child.stderr.on('data', (data) => {
      console.error(`yt-dlp stderr: ${data}`);
    });

    child.on('close', async (code) => {
      if (code === 0) {
        download.status = 'completed';
        download.progress = 100;
        await download.save();
        io.to(downloadId).emit('status', { status: 'completed', progress: 100 });
        resolve();
      } else {
        download.status = 'failed';
        download.error = `yt-dlp exited with code ${code}`;
        await download.save();
        io.to(downloadId).emit('status', { status: 'failed', error: 'Download failed' });
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });
  });
}, { connection });
