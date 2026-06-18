import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, X, Download } from 'lucide-react';
import axios from 'axios';

const HistoryModal = ({ onClose }) => {
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/download/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistoryItems(res.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0B0F19] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold flex items-center gap-2"><Clock size={20} className="text-primary"/> Recent Downloads</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-left">
          {historyItems.length === 0 ? (
            <p className="text-center text-textSecondary py-8">No download history found.</p>
          ) : (
            historyItems.map((item) => (
              <div key={item._id} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <img src={item.thumbnail} alt="thumbnail" className="w-20 h-14 object-cover rounded-md" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate text-white/90">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-textSecondary uppercase">{item.type} • {item.quality}</span>
                    <span className="text-xs text-textSecondary">• {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <a 
                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/download/file/${item._id}`}
                  download
                  className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-[#0B0F19] rounded-lg transition-all"
                  title="Download File"
                >
                  <Download size={18} />
                </a>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HistoryModal;
