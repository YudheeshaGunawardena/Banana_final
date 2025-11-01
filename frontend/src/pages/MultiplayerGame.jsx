import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Users, Copy, ArrowLeft } from 'lucide-react';
import { listenToRoomUpdates, updateGameState, fetchPuzzle, joinMultiplayerGame, updateRoomState } from '../store/gameSlice';
import { GAME_STATES } from '../models/Game';
import GameService from '../services/GameService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import PlayBoard from '../components/game/PlayBoard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const MultiplayerGame = () => {
  const { roomId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, guestMode, loading: authLoading } = useSelector((state) => state.auth);
  const { state, players, currentPuzzle, loading: gameLoading, roomId: storedRoomId } = useSelector((state) => state.game);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log('MultiplayerGame: Auth state, authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'guestMode:', guestMode, 'user:', user);
    if (authLoading) {
      console.log('MultiplayerGame: Waiting for auth state to resolve');
      return;
    }

    if (!isAuthenticated && !guestMode) {
      console.log('MultiplayerGame: Redirecting to /login, no auth or guest mode');
      toast.error('Please log in or enter guest mode to join a multiplayer room');
      navigate('/login');
      return;
    }

    if (!user) {
      console.log('MultiplayerGame: No user, redirecting to /login');
      toast.error('User data not found');
      navigate('/login');
      return;
    }

    // Initialize room data
    const initializeRoom = async () => {
      try {
        console.log('MultiplayerGame: Initializing room:', roomId);
        const roomRef = doc(db, 'rooms', roomId);
        const roomDoc = await getDoc(roomRef);

        if (!roomDoc.exists()) {
          console.log('MultiplayerGame: Room not found:', roomId);
          toast.error('Room not found');
          navigate('/play/multiplayer');
          return;
        }

        const roomData = roomDoc.data();
        console.log('MultiplayerGame: Room data fetched:', roomData);

        // Check if user is already in the room or if Redux state is outdated
        if (roomData.playerIds.includes(user.id) || storedRoomId !== roomId) {
          console.log('MultiplayerGame: User in room or state outdated, updating Redux');
          dispatch(joinMultiplayerGame({
            roomId,
            players: roomData.players || [{ id: user.id, score: 0, lives: roomData.settings?.lives || 3, streak: 0 }],
            playerStats: roomData.playerStats || {},
            state: roomData.state || GAME_STATES.WAITING,
            currentPuzzle: roomData.currentPuzzle || null
          }));
        }

        // If user is not in the room, attempt to join
        if (!roomData.playerIds.includes(user.id)) {
          console.log('MultiplayerGame: User not in room, attempting to join:', user.id);
          const result = await GameService.joinRoom(roomId, user.id);
          if (!result.success) {
            console.log('MultiplayerGame: Failed to join room:', result.error);
            toast.error(result.error);
            navigate('/play/multiplayer');
            return;
          }
          dispatch(joinMultiplayerGame({
            roomId,
            players: [...roomData.players, { id: user.id, score: 0, lives: roomData.settings?.lives || 3, streak: 0 }],
            playerStats: roomData.playerStats || {},
            state: roomData.state || GAME_STATES.WAITING,
            currentPuzzle: roomData.currentPuzzle || null
          }));
          console.log('MultiplayerGame: Successfully joined room:', roomId);
        }

        // Start listening to room updates
        const unsubscribe = GameService.listenToRoomUpdates(roomId, (roomData) => {
          console.log('MultiplayerGame: Room update received:', roomData);
          dispatch(updateRoomState(roomData));
        });

        return () => {
          console.log('MultiplayerGame: Cleaning up room listener for:', roomId);
          GameService.stopListeningToRoom(roomId);
          unsubscribe();
        };
      } catch (error) {
        console.error('MultiplayerGame: Error initializing room:', error);
        toast.error('Failed to initialize room: ' + error.message);
        navigate('/play/multiplayer');
      }
    };

    initializeRoom();
  }, [dispatch, roomId, user, isAuthenticated, guestMode, authLoading, navigate, storedRoomId]);

  useEffect(() => {
    if (state === GAME_STATES.WAITING && players.length >= 2) {
      console.log('MultiplayerGame: Starting game, players:', players.length);
      dispatch(updateGameState(GAME_STATES.PLAYING));
      dispatch(fetchPuzzle());
    }
  }, [dispatch, state, players]);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      toast.success('Room ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLeaveRoom = () => {
    console.log('MultiplayerGame: Leaving room:', roomId);
    GameService.stopListeningToRoom(roomId);
    navigate('/play/multiplayer');
  };

  if (authLoading || gameLoading) {
    return (
      <div className="min-h-screen bg-transparent p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (state === GAME_STATES.PLAYING && currentPuzzle) {
    return <PlayBoard />;
  }

  return (
    <div className="min-h-screen bg-transparent p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveRoom}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Leave Room</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Multiplayer Room</h1>
          <div className="w-16"></div>
        </div>

        <Card className="p-6">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Waiting for Players
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Share this room ID with your friend to join the game:
            </p>
            <div className="flex justify-center items-center space-x-4">
              <motion.span
                className="font-mono text-lg bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
                initial={{ scale: 1 }}
                animate={{ scale: copied ? 1.1 : 1 }}
              >
                {roomId}
              </motion.span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyRoomId}
                className="flex items-center space-x-2"
              >
                <Copy size={16} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
            <div className="flex justify-center items-center space-x-4">
              <Users size={24} className="text-gray-600 dark:text-gray-300" />
              <p className="text-gray-600 dark:text-gray-300">
                Players in room: {players.length} / 2
              </p>
            </div>
            {players.length < 2 && (
              <p className="text-yellow-600 dark:text-yellow-400">
                Waiting for another player to join...
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MultiplayerGame;