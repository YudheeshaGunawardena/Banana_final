# 🍌 Banana Puzzle Game

A production-ready mathematical puzzle game built with React and Firebase. Players solve puzzles hidden in banana-themed images with solo and multiplayer modes.

## 🚀 Features

- **Solo Mode**: Offline-first gameplay with cached puzzles
- **Multiplayer**: Real-time rooms for 2-4 players  
- **Progressive Web App**: Installable with offline support
- **Authentication**: Email/password and Google OAuth via Firebase
- **Leaderboards**: Global and weekly rankings
- **Adaptive Difficulty**: 5 tiers based on performance
- **Achievements**: Unlock badges and track progress

## 🛠 Tech Stack

- **Frontend**: React 18, Redux Toolkit, React Router
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Auth, Firestore, Functions)
- **PWA**: Vite PWA Plugin, Workbox
- **Testing**: Vitest, React Testing Library

## 🔧 Setup

### Prerequisites

1. **Firebase Project Setup**:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Enable Firebase Functions
   - Enable Firebase Hosting

2. **API Proxy Setup** (for CORS handling):
   - Deploy the Firebase Function to proxy the puzzle API
   - The function should fetch from `http://marcconrad.com/uob/banana/api.php?out=json&base64=no`

### Installation

1. **Configure Firebase**:
   ```bash
   # Update src/config/firebase.js with your Firebase config
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🎮 Game Rules

1. **Puzzle Solving**: Look at the banana image and find the hidden number (1-9)
2. **Scoring**: Base points + time bonus + streak bonus - hint penalties
3. **Lives**: Start with 3 lives, lose one for each wrong answer
4. **Hints**: Up to 3 hints per game
5. **Difficulty**: Automatically adjusts based on your average solve time

## 🏗 Architecture

```
src/
├── components/
│   ├── ui/          # Reusable UI components
│   └── game/        # Game-specific components
├── pages/           # Route components
├── services/        # API and Firebase services
├── store/           # Redux store and slices
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── models/          # Data models
└── config/          # Configuration files
```

## 🔐 Security Features

- Solutions encrypted in cache
- Server-side validation for multiplayer
- Row Level Security (RLS) in Firestore
- Secure authentication flows

## 📱 PWA Features

- Offline puzzle caching
- Installable on mobile/desktop
- Background sync when online
- Push notifications (optional)

## 🧪 Testing

```bash
npm run test        # Run tests
npm run test:ui     # Run tests with UI
npm run coverage    # Generate coverage report
```

## 🚀 Deployment

The app is configured for Firebase Hosting. Deploy with:

```bash
npm run build
firebase deploy
```

## 📄 License

MIT License - feel free to use this project as a template for your own games!