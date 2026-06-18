import { exec } from 'child_process';
import util from 'util';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = util.promisify(exec);

const isWindows = process.platform === 'win32';
const ytdlpExecutable = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
const ytdlpPath = path.join(__dirname, '..', ytdlpExecutable);

export const getMetaInfo = async (url) => {
  try {
    // using yt-dlp to get JSON dump
    const { stdout } = await execPromise(`"${ytdlpPath}" -j "${url}"`);
    const info = JSON.parse(stdout);
    
    const targetResolutions = [144, 240, 360, 480, 720, 1080];
    const uniqueFormats = [];
    const seenResolutions = new Set();

    // Process and normalize video formats
    const videoFormats = info.formats
      .filter(f => f.vcodec !== 'none' && f.ext === 'mp4') // strictly mp4 videos
      .map(f => {
        // Calculate standard 'p' value (smaller dimension)
        const resValue = Math.min(f.width || 9999, f.height || 9999);
        return { ...f, resValue };
      })
      .sort((a, b) => (b.tbr || 0) - (a.tbr || 0)); // Sort by bitrate descending to get best quality per resolution

    targetResolutions.forEach(target => {
       // Find the format that closely matches this target
       const match = videoFormats.find(f => f.resValue === target || (f.format_note && f.format_note.includes(`${target}p`)));
       if (match && !seenResolutions.has(target)) {
          uniqueFormats.push({
            format_id: match.format_id,
            ext: 'mp4',
            resolution: `${target}p`,
            filesize: match.filesize || match.filesize_approx,
          });
          seenResolutions.add(target);
       }
    });

    return {
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      uploader: info.uploader,
      extractor_key: info.extractor_key,
      formats: uniqueFormats
    };
  } catch (error) {
    console.error('yt-dlp error:', error);
    throw new Error('Failed to extract video information.');
  }
};
