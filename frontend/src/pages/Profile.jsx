import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ArrowLeft, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AuthService from '../services/AuthService';
import { logout as logoutAction } from '../store/authSlice';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await AuthService.logout();
    if (result.success) {
      dispatch(logoutAction());
      navigate('/login'); // send to login page after logout
    } else {
      console.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 backdrop-blur-md bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30" id="btn-back">
              <ArrowLeft className="text-white" size={16} />
              <span className="text-white">Back</span>
            </Button>
          </Link>
          <h1 className="text-6xl font-bold text-yellow-600 mb-4">🍌</h1>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Your Profile
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            View your stats and achievements!
          </p>
        </motion.div>

        {/* User Information */}
        <Card className="p-6 mb-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-blue-500">
                <User size={48} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              {user?.username || 'User'}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {user?.email || 'No email provided'}
            </p>

            {/* Logout Button */}
            <Button
              variant="destructive"
              size="md"
              onClick={handleLogout}
              className="mt-4 flex items-center justify-center mx-auto"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>

            <div className="flex justify-center space-x-6 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{user?.level || 1}</p>
                <p className="text-sm text-gray-600">Level</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{user?.totalScore?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-600">Total Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{user?.stats?.bestStreak || 0}</p>
                <p className="text-sm text-gray-600">Best Streak</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Game Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Game Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{user?.gamesPlayed || 0}</p>
              <p className="text-sm text-gray-600">Games Played</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{user?.winRate?.toFixed(1) || 0}%</p>
              <p className="text-sm text-gray-600">Win Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{user?.stats?.averageSolveTime || 0}s</p>
              <p className="text-sm text-gray-600">Avg. Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{user?.achievements?.length || 0}</p>
              <p className="text-sm text-gray-600">Achievements</p>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        {user?.achievements?.length > 0 && (
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {achievement.name || 'Achievement'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {achievement.description || 'Earned achievement'}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
