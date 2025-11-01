import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

const Keypad = ({ onNumberClick, onSubmit, disabled = false, selectedNumber = null }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {numbers.map((number) => (
        <motion.div
          key={number}
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
          <Button
            variant={selectedNumber === number ? 'primary' : 'outline'}
            size="lg"
            disabled={disabled}
            onClick={() => onNumberClick(number)}
            className="w-full h-16 text-2xl font-bold"
          >
            {number}
          </Button>
        </motion.div>
      ))}
      
      <div className="col-span-3 mt-4">
        <Button
          variant="secondary"
          size="lg"
          disabled={disabled || selectedNumber === null}
          onClick={() => onSubmit(selectedNumber)}
          className="w-full"
        >
          Submit Answer
        </Button>
      </div>
    </div>
  );
};

export default Keypad;