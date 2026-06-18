import { getMetaInfo } from '../services/downloader.js';

export const analyzeUrl = async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const info = await getMetaInfo(url);
    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      uploader: info.uploader,
      platform: info.extractor_key,
      formats: info.formats // Need to filter these on the frontend or here
    });
  } catch (error) {
    console.error('Error analyzing URL:', error);
    res.status(500).json({ error: 'Failed to analyze URL', details: error.message });
  }
};
