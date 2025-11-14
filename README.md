# Jukebox

Jukebox is an app that lets you connect your Spotify account and organize music into “Vibes” — simple collections of albums and playlists. It’s meant to be an easy place to organzie and curate your favourite music, quickly find albums that fit a particular mood, or revisit things you might have otherwise forgotten about.

---

## Features

- Connect your Spotify account, which will carry out search and playback requests.
- Create and edit Vibes using Spotify artist and playlist search.
- Browse and rediscover music from your collection.
- In the Vibes view, press the 💿 to select a vibe at random
- In the Vibe view, press the 💿 to select an album at random

---

## Project Structure

- **backend/** — Node.js + Express server for Spotify auth, database access, and API routes.
- **frontend/** — Expo + React Native app for iOS.

---

## Setup

### Backend

```
cd backend
npm install
npm run build
npm start
```

### Frontend

In another terminal:

```
cd frontend
npm install
npx expo start
```

Press `i` to open the iOS simulator.

### Environment Variables

Create a `.env` file in `/backend` with:

```
PORT = 3000
DB_HOST = "mongodb+srv"
DB_USER = xxxx
DB_PASSWORD = xxxx
DB_NAME = "library"

SPOTIFY_CLIENT_ID = xxxx
SPOTIFY_SECRET = xxxx

API_KEY = xxxx
```

### Notes

You’ll need to set up your own MongoDB database and get the credentials.

You’ll also need a Spotify Developer account and a new app set up to get the client ID and secret.

`API_KEY` is meant as a basic safeguard on the backend server to prevent processing of unwanted requests. It does not stand in for actual, safe authentication, but serves the purpose of handling requests only from a TestFlight build. Generate this key yourself and store it here.

Similarly, create a `.env` file in `/frontend` with:

```
EXPO_PUBLIC_API_KEY=xxxx // this should be the same as API_KEY stored in the backend

```

### Development Notes

Any backend changes require rebuilding and restarting the server before they take effect locally. This will change in the future, but this is where the project is at in its prototype stage.

## Deployment

### Backend

Deployed manually using Render.com and managed by the project owner.

### Frontend

Built with EAS and deployed to TestFlight.

### Build steps:

```
eas build --platform ios --profile production
eas submit --platform ios
```
