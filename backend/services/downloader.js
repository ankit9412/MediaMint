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
    const { stdout } = await execPromise(`"${ytdlpPath}" --js-runtimes node -4 --extractor-args "youtube:player_client=web_embedded,ios,android,tv" -j "${url}"`);
    const info = JSON.parse(stdout);
    
    const uniqueFormats = [];
    const seenResolutions = new Set();

    // Process and normalize video formats
    const videoFormats = info.formats
      .filter(f => f.vcodec !== 'none' && f.ext === 'mp4') // strictly mp4 videos
      .map(f => {
        // Calculate standard 'p' value (smaller dimension)
        const resValue = Math.min(f.width || 9999, f.height || 9999);
        let resLabel = `${resValue}p`;
        if (f.format_note && f.format_note.match(/^\d+p$/)) {
          resLabel = f.format_note;
        }
        return { ...f, resValue, resLabel };
      })
      .sort((a, b) => {
        if (b.resValue !== a.resValue) return b.resValue - a.resValue;
        return (b.tbr || 0) - (a.tbr || 0); // Sort by bitrate descending to get best quality per resolution
      });

    videoFormats.forEach(match => {
       if (!seenResolutions.has(match.resLabel) && match.resValue !== 9999) {
          uniqueFormats.push({
            format_id: match.format_id,
            ext: 'mp4',
            resolution: match.resLabel,
            filesize: match.filesize || match.filesize_approx,
          });
          seenResolutions.add(match.resLabel);
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
