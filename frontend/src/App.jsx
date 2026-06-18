import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import HistoryModal from './components/HistoryModal';
import AuthModal from './components/AuthModal';

function App() {
  const [showHistory, setShowHistory] = useState(false);
  const { user, logout, showAuthModal, setShowAuthModal } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen bg-background text-textPrimary selection:bg-primary/30">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <nav className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight">MediaMint</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="#" className="text-sm text-textSecondary hover:text-white transition-colors">Home</a>
            {user && (
              <button onClick={() => setShowHistory(true)} className="text-sm text-textSecondary hover:text-white transition-colors">History</button>
            )}
            
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm font-medium text-white/80">Hi, {user.name}</span>
                <button 
                  onClick={logout}
                  className="bg-white/5 hover:bg-red-500/20 text-textSecondary hover:text-red-400 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all backdrop-blur-md border border-white/5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg text-sm font-bold transition-all backdrop-blur-md border border-primary/20"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>

        <main className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        
        {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    </Router>
  );
}

export default App;
