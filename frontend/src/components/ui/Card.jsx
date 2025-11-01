import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, ...props }) => {
  const baseClasses = 'bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-gray-700/20';
  const hoverClasses = hover
    ? 'hover:shadow-xl hover:bg-white/20 dark:hover:bg-black/30 hover:scale-105 transition-all duration-300'
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;