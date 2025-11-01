import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Users, Plus, Search, ArrowLeft } from 'lucide-react';
import { joinMultiplayerGame } from '../store/gameSlice';
import GameService from '../services/GameService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const MultiplayerLobby = () => {
  const { user, loading, isAuthenticated, guestMode } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [timeLimit, setTimeLimit] = useState(60);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    console.log('MultiplayerLobby: Auth state, loading:', loading, 'isAuthenticated:', isAuthenticated, 'guestMode:', guestMode, 'user:', user);
    if (!loading && !isAuthenticated && !guestMode) {
      console.log('MultiplayerLobby: Redirecting to /login, no auth or guest mode');
      toast.error('Please log in or enter guest mode to access multiplayer');
      navigate('/login');
    }
  }, [loading, isAuthenticated, guestMode, navigate]);

  const handleCreateRoom = async () => {
    if (loading) {
      console.log('MultiplayerLobby: Waiting for auth state to resolve');
      toast.error('Please wait, authenticating...');
      return;
    }

    if (!user || (!isAuthenticated && !guestMode)) {
      console.log('MultiplayerLobby: Redirecting to /login, user:', user, 'isAuthenticated:', isAuthenticated, 'guestMode:', guestMode);
      toast.error('Please log in or enter guest mode to create a room');
      navigate('/login');
      return;
    }

    setCreating(true);
    try {
      console.log('MultiplayerLobby: Creating room for user:', user.id);
      const result = await GameService.createMultiplayerRoom(user.id, {
        maxPlayers: 2,
        timeLimit,
        lives: 3
      });

      if (result.success) {
        dispatch(joinMultiplayerGame({
          roomId: result.roomId,
          players: [{ id: user.id, score: 0, lives: 3, streak: 0 }],
          playerStats: {},
          state: 'WAITING',
          currentPuzzle: null
        }));
        toast.success('Room created successfully!');
        console.log('MultiplayerLobby: Room created, navigating to:', `/play/multiplayer/${result.roomId}`);
        navigate(`/play/multiplayer/${result.roomId}`);
      } else {
        console.error('MultiplayerLobby: Failed to create room:', result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error('MultiplayerLobby: Error creating room:', error);
      toast.error('Failed to create room: ' + error.message);
    } finally {
      setCreating(false);
      setShowCreateModal(false);
    }
  };

  const handleJoinRoom = async () => {
    if (loading) {
      console.log('MultiplayerLobby: Waiting for auth state to resolve');
      toast.error('Please wait, authenticating...');
      return;
    }

    if (!user || (!isAuthenticated && !guestMode)) {
      console.log('MultiplayerLobby: Redirecting to /login, user:', user, 'isAuthenticated:', isAuthenticated, 'guestMode:', guestMode);
      toast.error('Please log in or enter guest mode to join a room');
      navigate('/login');
      return;
    }

    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    setCreating(true);
    try {
      console.log('MultiplayerLobby: Joining room:', roomCode, 'for user:', user.id);
      const result = await GameService.joinRoom(roomCode, user.id);

      if (result.success) {
        dispatch(joinMultiplayerGame({
          roomId: roomCode,
          players: result.players || [{ id: user.id, score: 0, lives: 3, streak: 0 }],
          playerStats: result.playerStats || {},
          state: result.state || 'WAITING',
          currentPuzzle: result.currentPuzzle || null
        }));
        toast.success('Joined room successfully!');
        console.log('MultiplayerLobby: Room joined, navigating to:', `/play/multiplayer/${roomCode}`);
        navigate(`/play/multiplayer/${roomCode}`);
      } else {
        console.error('MultiplayerLobby: Failed to join room:', result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error('MultiplayerLobby: Error joining room:', error);
      toast.error('Failed to join room: ' + error.message);
    } finally {
      setCreating(false);
      setShowJoinModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 backdrop-blur-md bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30" id="btn-back">
              <ArrowLeft className="text-white" size={16} />
              <span className="text-white">Back</span>
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Multiplayer</h1>
          
          <div className="w-16"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-8 text-center h-full">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-green-500 rounded-full">
                  <Plus size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Create Room
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Start a new two-player game and invite a friend
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => setShowCreateModal(true)}
                  disabled={loading || creating}
                  className="w-full"
                >
                  Create Room
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 text-center h-full">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-blue-500 rounded-full">
                  <Search size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Join Room
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Enter a room code to join a friend's game
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowJoinModal(true)}
                  disabled={loading || creating}
                  className="w-full"
                >
                  Join Room
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

 

       <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            How Multiplayer Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl mb-2">🏠</div>
              <h4 className="font-medium text-white/70">Create or Join</h4>
              <p className="text-sm text-gray-600">Start a room or join a friend's two-player game</p>
            </div>
            <div>
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-medium text-white/70">Real-time Racing</h4>
              <p className="text-sm text-gray-600">Both solve the same puzzle; first correct answer wins the round</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🏆</div>
              <h4 className="font-medium text-white/70">Win & Earn</h4>
              <p className="text-sm text-gray-600">Highest score wins, earn XP</p>
            </div>
          </div>
        </Card>

        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Two-Player Room"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Limit (seconds)
              </label>
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                disabled={loading || creating}
              >
                <option value={30}>30 seconds</option>
                <option value={45}>45 seconds</option>
                <option value={60}>60 seconds</option>
                <option value={90}>90 seconds</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
                disabled={loading || creating}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleCreateRoom}
                loading={creating}
                className="flex-1"
              >
                Create Room
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          title="Join Two-Player Room"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-center font-mono text-lg"
                disabled={loading || creating}
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowJoinModal(false)}
                className="flex-1"
                disabled={loading || creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinRoom}
                loading={creating}
                className="flex-1"
              >
                Join Room
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default MultiplayerLobby;