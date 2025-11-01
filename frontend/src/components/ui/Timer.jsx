import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ timeLimit, onTimeUp, isActive = true, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  const percentage = (timeLeft / timeLimit) * 100;
  const isUrgent = percentage < 20;
  const isWarning = percentage < 50;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Clock size={20} className={`${isUrgent ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-500'}`} />
      
      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isUrgent ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <span className={`font-mono text-lg font-bold ${isUrgent ? 'text-red-500' : 'text-gray-700'}`}>
        {timeLeft}s
      </span>
    </div>
  );
};

export default Timer;