# MediaMint (DownloadHub AI)

MediaMint is a premium, high-performance web application designed to download videos and extract audio from over 1,000+ platforms including YouTube, Instagram, Facebook, Twitter, and TikTok. It features a stunning glassmorphism UI, real-time download progress, background job processing, and user authentication with personalized download histories.

## 🚀 Features

- **Universal Downloader**: Extract media from almost any URL using the `yt-dlp` engine.
- **Dynamic Format Selection**: Cleanly filters and standardizes resolutions (144p to 1080p).
- **Audio Extraction**: Automatically merges high-quality audio with HD video, or extracts pure MP3s natively.
- **Real-Time Progress**: Powered by WebSocket (Socket.io) to show live download progression and processing states.
- **Premium UI/UX**: Built with React, Tailwind CSS, and Framer Motion for smooth, dynamic animations, and responsive mobile-first design.
- **User Authentication**: Secure JWT-based authentication allows users to track their personal download history.
- **Freemium Business Logic**: Anonymous users can download standard resolutions, but must sign in to unlock HD 1080p video and 320kbps audio.
- **Background Processing**: BullMQ and Redis ensure scalable, non-blocking background queue management for simultaneous downloads.

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite)**
- **Tailwind CSS** (Styling & Glassmorphism)
- **Framer Motion** (Micro-animations)
- **Lucide React** (Icons)
- **Socket.io-client** (Real-time updates)

### Backend
- **Node.js & Express**
- **MongoDB & Mongoose** (Database & Models)
- **Redis & BullMQ** (Job Queues)
- **yt-dlp & FFmpeg** (Core extraction engines)
- **JWT & bcryptjs** (Authentication)
- **Socket.io**

---

## 💻 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (for local MongoDB & Redis)
- Git

### 1. Clone & Install
```bash
git clone https://github.com/your-username/mediamint.git
cd mediamint

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Setup Environment Variables
**Backend** (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/downloadhub
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_secure_random_string_here
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### 3. Start Database (Docker)
In the root directory, start MongoDB and Redis:
```bash
docker-compose up -d
```

### 4. Download Core Engine (`yt-dlp`)
For Windows development, download `yt-dlp.exe` and place it in the `backend/` folder:
- [Download yt-dlp.exe](https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe)

*(Note: In production on Linux, the provided Dockerfile automatically installs the Linux binary).*

### 5. Run the Application
You will need two terminals.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser!

---

## 🌍 Deployment

### Deploying the Backend (Render.com)
1. Create a new **Web Service** on Render.
2. Select the `backend` folder as the Root Directory.
3. Choose **Docker** as the environment (Render will automatically detect the provided Dockerfile which installs FFmpeg and yt-dlp).
4. Add your `.env` variables to the Render dashboard.

### Deploying the Frontend (Vercel)
1. Import your repository to Vercel.
2. Set the Root Directory to `frontend`.
3. Add `VITE_API_URL` to the Environment Variables (pointing to your Render backend URL).
4. Deploy!
