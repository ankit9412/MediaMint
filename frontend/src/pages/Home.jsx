import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Search, Download, ExternalLink, Lock } from 'lucide-react';
import { FaYoutube, FaInstagram, FaTwitter } from 'react-icons/fa';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

const Home = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [activeDownloads, setActiveDownloads] = useState({});
  const { user, setShowAuthModal } = useContext(AuthContext);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analyze`, { url });
      setVideoData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to analyze URL');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format, type = 'video', quality = null) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/download`, {
        url,
        title: videoData.title,
        thumbnail: videoData.thumbnail,
        platform: videoData.platform,
        type,
        format_id: format.format_id,
        quality
      }, { headers });
      
      const { downloadId } = response.data;
      
      setActiveDownloads(prev => ({ ...prev, [downloadId]: { progress: 0, status: 'pending' } }));
      
      socket.emit('join_download', downloadId);
      
      socket.on('progress', (data) => {
        setActiveDownloads(prev => ({
          ...prev,
          [downloadId]: { ...prev[downloadId], progress: data.progress, status: 'processing' }
        }));
      });

      socket.on('status', (data) => {
        setActiveDownloads(prev => ({
          ...prev,
          [downloadId]: { ...prev[downloadId], ...data }
        }));
        if (data.status === 'completed') {
           // Trigger file download in browser
           const downloadUrl = `http://localhost:5000/api/download/file/${downloadId}`;
           const a = document.createElement('a');
           a.href = downloadUrl;
           a.download = '';
           document.body.appendChild(a);
           a.click();
           document.body.removeChild(a);
        }
      });
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to queue download');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-4xl mx-auto relative w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-textSecondary mb-4">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          Universal Downloader v1.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Download <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Anything.</span><br/>
          Anywhere.
        </h1>
        
        <p className="text-lg md:text-xl text-textSecondary max-w-2xl mx-auto">
          The ultimate platform to download videos and audio from YouTube, Instagram, Twitter, and 1000+ other sites in pristine quality.
        </p>

        <form onSubmit={handleAnalyze} className="w-full max-w-2xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-md shadow-2xl focus-within:border-primary/50 transition-colors gap-2">
            <div className="flex items-center flex-1 pl-2 sm:pl-4 py-2 sm:py-0">
              <Search className="text-textSecondary hidden sm:block" size={20} />
              <input
                type="url"
                placeholder="Paste video link here..."
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white px-2 sm:px-4 placeholder:text-textSecondary/60 text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-[#0B0F19] font-bold px-6 sm:px-8 py-3 rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,208,132,0.3)] whitespace-nowrap w-full sm:w-auto text-sm sm:text-base"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-8 pt-12 text-textSecondary/50">
          <div className="flex flex-col items-center gap-2 hover:text-white transition-colors">
            <FaYoutube className="w-8 h-8" />
            <span className="text-xs font-medium uppercase tracking-wider">YouTube</span>
          </div>
          <div className="flex flex-col items-center gap-2 hover:text-white transition-colors">
            <FaInstagram className="w-8 h-8" />
            <span className="text-xs font-medium uppercase tracking-wider">Instagram</span>
          </div>
          <div className="flex flex-col items-center gap-2 hover:text-white transition-colors">
            <FaTwitter className="w-8 h-8" />
            <span className="text-xs font-medium uppercase tracking-wider">Twitter/X</span>
          </div>
        </div>

        {error && (
          <div className="mt-8 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-4">
            {error}
          </div>
        )}

        {videoData && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 glass-card text-left flex flex-col md:flex-row gap-6 items-start"
          >
            <img 
              src={videoData.thumbnail} 
              alt={videoData.title} 
              className="w-full md:w-64 h-auto rounded-xl object-cover shadow-lg"
            />
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-bold">{videoData.title}</h3>
              <p className="text-textSecondary">Uploader: {videoData.uploader}</p>
              
              <div className="pt-6 border-t border-white/10 mt-4">
                {/* Segmented Control Tabs */}
                <div className="flex bg-white/5 p-1 rounded-xl mb-6 w-full sm:w-fit mx-auto sm:mx-0">
                  <button 
                    onClick={() => setActiveTab('video')}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'video' ? 'bg-primary text-[#0B0F19] shadow-lg' : 'text-textSecondary hover:text-white hover:bg-white/5'}`}
                  >
                    Video
                  </button>
                  <button 
                    onClick={() => setActiveTab('audio')}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'audio' ? 'bg-secondary text-white shadow-lg' : 'text-textSecondary hover:text-white hover:bg-white/5'}`}
                  >
                    Audio
                  </button>
                </div>

                {activeTab === 'video' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {videoData.formats && videoData.formats.filter(f => f.resolution !== 'audio only' && f.ext !== 'webm').slice(0, 10).map((f, i) => {
                      const isRestricted = !user && parseInt(f.resolution) > 240;
                      return (
                        <motion.div 
                          whileHover={{ scale: 1.02, y: -2 }}
                          key={i} 
                          className={`flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent border ${isRestricted ? 'border-white/5 opacity-70' : 'border-white/10 hover:border-primary/40'} rounded-xl p-3 transition-all group`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="bg-white/10 text-white/90 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                              {f.ext}
                            </span>
                            <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                              {f.resolution} {isRestricted && <span className="text-xs text-secondary ml-1">(HD)</span>}
                            </span>
                          </div>
                          
                          {isRestricted ? (
                            <button 
                              onClick={() => setShowAuthModal(true)}
                              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-textSecondary hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                              title="Sign in to unlock HD quality"
                            >
                              <Lock size={14} className="text-secondary" />
                              Unlock
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleDownload(f, 'video')}
                              className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-[#0B0F19] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-none hover:shadow-[0_0_15px_rgba(0,208,132,0.4)]"
                            >
                              <Download size={14} />
                              Save
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <motion.div 
                      whileHover={{ scale: 1.01, x: 2 }}
                      className={`flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent border ${!user ? 'border-white/5 opacity-70' : 'border-white/10 hover:border-secondary/40'} rounded-xl p-4 transition-all group`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-secondary/20 text-secondary px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                          MP3
                        </span>
                        <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">High Quality (320kbps)</span>
                      </div>
                      {!user ? (
                        <button 
                          onClick={() => setShowAuthModal(true)}
                          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-textSecondary hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                        >
                          <Lock size={16} className="text-secondary" />
                          Unlock HD Audio
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleDownload({ format_id: 'mp3' }, 'audio', '320K')}
                          className="flex items-center gap-1.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-none hover:shadow-[0_0_15px_rgba(255,42,95,0.4)]"
                        >
                          <Download size={16} />
                          Extract Audio
                        </button>
                      )}
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.01, x: 2 }}
                      className="flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent border border-white/10 hover:border-secondary/40 rounded-xl p-4 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-white/10 text-white/80 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                          MP3
                        </span>
                        <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">Standard Quality (192kbps)</span>
                      </div>
                      <button 
                        onClick={() => handleDownload({ format_id: 'mp3' }, 'audio', '192K')}
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Download size={16} />
                        Extract Audio
                      </button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Downloads View */}
        {Object.entries(activeDownloads).length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold text-left">Active Downloads</h3>
            {Object.entries(activeDownloads).map(([id, download]) => (
              <div key={id} className="glass-card flex flex-col p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Download ID: {id.slice(-6)}</span>
                  <span className="text-sm text-textSecondary capitalize">{download.status} ({download.progress}%)</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${download.status === 'failed' ? 'bg-red-500' : download.status === 'completed' ? 'bg-secondary' : 'bg-primary'}`}
                    style={{ width: `${download.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
