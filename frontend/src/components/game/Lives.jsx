import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Lives = ({ current, max = 3 }) => {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: max }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ scale: 1 }}
          animate={{ 
            scale: index < current ? 1 : 0.8,
            opacity: index < current ? 1 : 0.3
          }}
          transition={{ duration: 0.2 }}
        >
          <Heart
            size={24}
            className={`${
              index < current 
                ? 'text-red-500 fill-current' 
                : 'text-gray-300'
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default Lives;