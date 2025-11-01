import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchGlobalLeaderboard, fetchWeeklyLeaderboard } from '../store/leaderboardSlice';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Leaderboards = () => {
  const dispatch = useDispatch();
  const { global, weekly, loading } = useSelector(state => state.leaderboard);
  const [activeTab, setActiveTab] = useState('global');

  useEffect(() => {
    dispatch(fetchGlobalLeaderboard());
    dispatch(fetchWeeklyLeaderboard());
  }, [dispatch]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="text-yellow-500" size={24} />;
      case 2: return <Medal className="text-gray-400" size={24} />;
      case 3: return <Award className="text-orange-500" size={24} />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const renderLeaderboard = (data) => (
    <div className="space-y-3">
      {data.map((entry, index) => (
        <motion.div
          key={`${entry.userId}_${index}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 flex justify-center">
                {getRankIcon(index + 1)}
              </div>
              
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-white">
                  Player {entry.userId.substring(0, 8)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {entry.score.toLocaleString()} points
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(entry.timestamp?.seconds * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
      
      {data.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">No scores yet. Be the first!</p>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 backdrop-blur-md bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30" id="btn-back">
              <ArrowLeft className="text-white" size={16} />
              <span className="text-white">Back</span>
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Leaderboards</h1>
          
          <div className="w-16"></div>
        </div>

        {/* Tabs */}
        <Card className="p-1 mb-6">
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant={activeTab === 'global' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('global')}
              className="rounded-lg"
            >
              Global
            </Button>
            <Button
              variant={activeTab === 'weekly' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('weekly')}
              className="rounded-lg"
            >
              This Week
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Leaderboard Content */}
        {!loading && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {activeTab === 'global' && renderLeaderboard(global)}
            {activeTab === 'weekly' && renderLeaderboard(weekly)}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Leaderboards;