'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: number;
  readonly?: boolean;
};

export default function StarRating({ 
  value = 0, 
  onChange, 
  max = 5, 
  size = 24,
  readonly = false 
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (index: number) => {
    if (!readonly) {
      onChange(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (!readonly) {
      setHoverValue(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  return (
    <div className="flex space-x-1">
      {Array.from({ length: max }).map((_, index) => {
        const starIndex = index + 1;
        const isFilled = starIndex <= (hoverValue || value);
        
        return (
          <motion.button
            key={index}
            type="button"
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            whileHover={!readonly ? { scale: 1.2 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            disabled={readonly}
          >
            <Star
              size={size}
              fill={isFilled ? '#fbbf24' : 'none'}
              stroke={isFilled ? '#fbbf24' : '#d1d5db'}
              strokeWidth={1.5}
              className={`${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          </motion.button>
        );
      })}
    </div>
  );
}