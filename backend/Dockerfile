FROM node:22-bullseye

# Install ffmpeg and python (required for yt-dlp)
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip wget

# Create app directory
WORKDIR /usr/src/app

# Download yt-dlp binary for Linux
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/src/app/yt-dlp
RUN chmod a+rx /usr/src/app/yt-dlp

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
