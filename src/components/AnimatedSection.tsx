import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface AnimatedSectionProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  staggerChildren?: boolean;
}

export const AnimatedSection = ({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  staggerChildren = false,
  ...props
}: AnimatedSectionProps) => {
  const directions = {
    up: { y: 40, opacity: 0 },
    down: { y: -40, opacity: 0 },
    left: { x: 40, opacity: 0 },
    right: { x: -40, opacity: 0 },
    none: { opacity: 0 },
  };

  const hiddenState = directions[direction];

  return (
    <motion.div
      initial={hiddenState}
      whileInView={{
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          bounce: 0.3,
          duration: 0.8,
          delay: delay,
          when: staggerChildren ? "beforeChildren" : undefined,
          staggerChildren: staggerChildren ? 0.1 : undefined,
        }
      }}
      viewport={{ once: true, margin: "-10%" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
