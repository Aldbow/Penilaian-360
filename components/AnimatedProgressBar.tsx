'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type AnimatedProgressBarProps = {
  value: number;
  max?: number;
  className?: string;
  label?: string;
};

export default function AnimatedProgressBar({ 
  value, 
  max = 100, 
  className = '',
  label 
}: AnimatedProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full bg-slate-200 rounded-full h-4 overflow-hidden', className)}>
      <div className="relative h-full">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 1, 
            ease: "easeOut",
            delay: 0.1
          }}
        />
        {/* Animated gradient for shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            repeatType: 'loop',
            ease: 'easeInOut'
          }}
        />
      </div>
      {label && (
        <div className="mt-2 text-right text-sm text-slate-600">
          {label}
        </div>
      )}
    </div>
  );
}