import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { formatINR } from '../services/calculations';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatFn?: (n: number) => string;
  className?: string;
  glow?: boolean;
  glowColor?: 'blue' | 'cyan' | 'emerald' | 'rose' | 'amber' | 'white';
}

/**
 * AnimatedCounter:
 * Counts up from 0 to target value on mount/view change with smooth easeOutCubic curve,
 * and renders a continuous vibrant glowing aura/text-shadow pulse.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1200,
  formatFn = formatINR,
  className = '',
  glow = false,
  glowColor = 'white',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const prevValueRef = useRef<number>(0);
  const isInitialMount = useRef<boolean>(true);

  useEffect(() => {
    const target = typeof value === 'number' && !isNaN(value) ? value : 0;
    const start = isInitialMount.current ? 0 : prevValueRef.current;
    isInitialMount.current = false;

    if (start === target && target === 0) {
      setDisplayValue(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic curve: fast acceleration from 0, smooth deceleration at target
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * ease);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
        prevValueRef.current = target;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  const glowClassMap = {
    white: 'drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] text-white',
    blue: 'drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] text-blue-600',
    cyan: 'drop-shadow-[0_0_10px_rgba(34,211,238,0.65)] text-cyan-500',
    emerald: 'drop-shadow-[0_0_10px_rgba(16,185,129,0.65)] text-emerald-600',
    rose: 'drop-shadow-[0_0_10px_rgba(244,63,94,0.65)] text-rose-600',
    amber: 'drop-shadow-[0_0_10px_rgba(245,158,11,0.65)] text-amber-600',
  };

  if (glow) {
    return (
      <span
        className={`inline-block tracking-tight font-black transition-all ${glowClassMap[glowColor] || glowClassMap.white} ${className}`}
      >
        {formatFn(displayValue)}
      </span>
    );
  }

  return <span className={`inline-block ${className}`}>{formatFn(displayValue)}</span>;
};
