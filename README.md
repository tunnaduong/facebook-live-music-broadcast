# Facebook Live Music Broadcast

A simple React app that helps you run a **24/7 music livestream** with a song request queue from Facebook Live comments.

## What this project does

This app:

- Plays YouTube videos in a queue
- Reads comments from a Facebook Live comments API
- Accepts music requests with a command format
- Lets viewers skip the current song with a command
- Shows now playing, next songs, and recent comments on screen

## How viewers control music

Viewers can comment:

- `/yt song name` → request a song (example: `/yt shape of you`)
- `/next` → skip the current song

## Tech stack

- React (Create React App)
- Axios
- react-youtube
- react-fast-marquee
- react-toastify

## Before you start

Make sure you have:

- **Node.js 16 or newer** (recommended: Node.js 18 LTS or newer)
- **npm**
- A **YouTube Data API key**

If you do not have a YouTube API key yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable **YouTube Data API v3**
4. Create an API key in **APIs & Services → Credentials**

## Quick start (for beginners)

### 1) Clone and open the project

```bash
git clone <your-repo-url>
cd facebook-live-music-broadcast
```

### 2) Install dependencies

```bash
npm install
```

### 3) Create environment file

Create a file named `.env` in the root folder and add:

```env
REACT_APP_TOKEN=YOUR_YOUTUBE_API_KEY
```

You can copy from the example file:

```bash
cp .env.example .env
```

Then replace `YOUR_YOUTUBE_API_KEY` with your real key.

### 4) Start the app

```bash
npm start
```

Open: [http://localhost:3000](http://localhost:3000)

## Available commands

```bash
npm start       # run in development mode
npm test        # run test suite
npm run build   # create production build
```

## Important project notes

- The app currently reads comments from:  
  `https://tunnaduong.com/test_api/fb_live_chat.php`
- To use your own comment source, edit the URL inside `getComments()` in `src/App.js`.
- Social handles in the UI are placeholders (`/username`, `@username`).
- Some UI text is in Vietnamese.

## Basic customization

If you are new, these are the easiest first edits:

1. Change social usernames in `src/App.js`
2. Update on-screen text to your language
3. Style the interface in `src/App.css`

## Troubleshooting

### App does not load songs

- Check that `.env` exists
- Check `REACT_APP_TOKEN` is valid
- Restart the app after editing `.env`

### Song request is not added

- Use correct format: `/yt song name`
- Some YouTube videos cannot be embedded
- API quota limits can block requests

### Comments are not updating

- Confirm your comment API endpoint is reachable
- Check browser console logs for request errors

## Project structure

```text
.
├── public/
├── src/
│   ├── App.js
│   ├── App.css
│   ├── utils.js
│   └── ...
├── .env.example
├── package.json
└── README.md
```
