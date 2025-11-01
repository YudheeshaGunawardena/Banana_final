import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Users, Trophy, User, Settings } from 'lucide-react';
import { useSelector } from 'react-redux';
import Card from '../components/ui/Card';

const Home = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [gifUrl, setGifUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const GIPHY_API_KEY = 'OKAv1gEdEtSNejDCqmbnuBnLQaDCOGK4';
  const GIPHY_API_URL = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=animals+eating+bananas&limit=10&rating=g`;

  // Function to get a random local GIF
  const getRandomLocalGif = () => {
    const maxGifs = 10;
    const randomIndex = Math.floor(Math.random() * maxGifs) + 1;
    return `/gif/animal-${randomIndex}.gif`;
  };

  // Fetch a random GIF from GIPHY with local fallback
  useEffect(() => {
    const fetchGif = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(GIPHY_API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch GIFs');
        }
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.data.length);
          setGifUrl(data.data[randomIndex].images.fixed_height.url);
        } else {
          setError('No GIFs found');
          setGifUrl(getRandomLocalGif());
        }
      } catch (err) {
        setError('Error fetching GIF: ' + err.message);
        setGifUrl(getRandomLocalGif());
      } finally {
        setIsLoading(false);
      }
    };

    fetchGif();
  }, []);

  const menuItems = [
    { icon: Play, label: 'Solo Play', path: '/play/solo', color: 'bg-yellow-500' },
    { icon: Users, label: 'Multiplayer', path: '/play/multiplayer', color: 'bg-green-500' },
    { icon: Trophy, label: 'Leaderboards', path: '/leaderboards', color: 'bg-purple-500' },
    { icon: User, label: 'Profile', path: '/profile', color: 'bg-blue-500' },
    { icon: Settings, label: 'Settings', path: '/settings', color: 'bg-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-transparent p-4">
      {/* Corner images for bottom-left and bottom-right */}
      <div className="corner-bl"></div>
      <div className="corner-br"></div>
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold text-yellow-600 mb-4">🍌</h1>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Banana Puzzle
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Solve mathematical puzzles hidden in banana images!
          </p>
        </motion.div>

        {/* Welcome Message */}
        {isAuthenticated && (
          <Card className="p-6 mb-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Welcome back, {user?.username}!
              </h3>
            </div>
          </Card>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={item.path}>
                <Card className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer">
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`p-4 rounded-full ${item.color}`}>
                      <item.icon size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {item.label}
                    </h3>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
          {/* GIF Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center items-center"
          >
            {isLoading ? (
              <p className="text-gray-600">Loading GIF...</p>
            ) : (
              <img
                src={gifUrl}
                alt="Animal eating banana"
                className="rounded-lg max-h-32 object-cover"
              />
            )}
          </motion.div>
        </div>

        {/* Quick Stats */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Game Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{user?.gamesPlayed || 0}</p>
              <p className="text-sm text-gray-600">Games Played</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{user?.level || 1}</p>
              <p className="text-sm text-gray-600">Level</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{user?.totalScore?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600">Total Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{user?.stats?.bestStreak || 0}</p>
              <p className="text-sm text-gray-600">Best Streak</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;