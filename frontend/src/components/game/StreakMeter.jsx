import React from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const StreakMeter = ({ streak }) => {
  const maxStreak = 10;
  const percentage = Math.min((streak / maxStreak) * 100, 100);
  
  return (
    <div className="flex items-center space-x-3">
      <Zap className="text-purple-500" size={20} />
      
      <div className="flex-1">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Streak</span>
          <span>{streak}/{maxStreak}</span>
        </div>
        
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default StreakMeter;