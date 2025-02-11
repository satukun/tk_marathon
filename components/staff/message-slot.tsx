"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface MessageSlotProps {
  message: string;
  delay?: number;
}

const chars = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん".split("");

export function MessageSlot({ message, delay = 0 }: MessageSlotProps) {
  const [displayedChars, setDisplayedChars] = useState<string[]>([]);

  useEffect(() => {
    const messageChars = message.split("");
    let currentIndex = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < messageChars.length) {
          setDisplayedChars(prev => [...prev, messageChars[currentIndex]]);
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 100); // 1文字あたり0.1秒間のアニメーション

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [message, delay]);

  return (
    <div className="flex justify-center flex-wrap gap-1">
      {message.split("").map((char, index) => (
        <div key={index} className="relative overflow-hidden w-[1em] h-[1.5em]">
          <AnimatePresence mode="wait">
            {index < displayedChars.length ? (
              <motion.span
                key={char}
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: -100 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  mass: 0.5,
                  duration: 0.01
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {char}
              </motion.span>
            ) : (
              <motion.div
                key="placeholder"
                animate={{
                  y: [-100, 100],
                  transition: {
                    duration: 0.3,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
                className="absolute inset-0 flex flex-col items-center"
              >
                {chars.map((c, i) => (
                  <span key={i} className="flex-shrink-0">{c}</span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}