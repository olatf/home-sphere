'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type AnimationType =
  | 'fadeIn'
  | 'fadeUp'
  | 'slideInLeft'
  | 'slideInRight'
  | 'zoomIn'
  | 'slideInUp'
  | 'slideInDown'
  | 'bounceIn'
  | 'scaleUp'
  | 'scrollTrigger';

interface Props {
  children: ReactNode;
  type?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
}

type Variants = {
  [key in AnimationType]: {
    hidden: {
      opacity: number;
      x?: number;
      y?: number;
      scale?: number;
    };
    visible: (delay: number) => {
      opacity: number;
      x?: number;
      y?: number;
      transition?: {
        delay: number;
        duration: number;
      };
    };
  };
};

const variants: Variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: (delay: number) => ({
      opacity: 1,
      transition: { delay, duration: 0.8 },
    }),
  },
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.7 },
    }),
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: (delay: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay, duration: 0.7 },
    }),
  },
  slideInRight: {
    hidden: { opacity: 0, x: 60 },
    visible: (delay: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay, duration: 0.7 },
    }),
  },
  zoomIn: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: (delay: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay, duration: 0.6 },
    }),
  },
  slideInUp: {
    hidden: { opacity: 0, y: 50 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.7, ease: 'easeOut' },
    }),
  },
  slideInDown: {
    hidden: { opacity: 0, y: -50 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.7, ease: 'easeOut' },
    }),
  },

  bounceIn: {
    hidden: { scale: 0.3, opacity: 0 },
    visible: (delay: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay,
        duration: 0.7,
        type: 'spring',
        stiffness: 180,
      },
    }),
  },

  scaleUp: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (delay: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay, duration: 0.6, ease: 'easeOut' },
    }),
  },

  scrollTrigger: {
    hidden: { opacity: 0, y: 30 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.15,
      },
    }),
  },
};

export default function AnimatedWrapper({
  children,
  type = 'fadeIn',
  delay = 0,
  className,
}: Props) {
  return (
    <motion.div
      className={className}
      custom={delay}
      variants={variants[type]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
