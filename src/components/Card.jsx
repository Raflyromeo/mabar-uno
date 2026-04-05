import React from 'react';
import { motion } from 'framer-motion';
import { getCardImage } from '../utils/gameLogic';
import clsx from 'clsx';
import { useGameStore } from '../store/gameStore';

export default function Card({ card, onClick, isPlayable, className, style, layoutId, index, total }) {
  if (!card) return null;
  const imageSrc = getCardImage(card.color, card.value);

  const isFaceDown = !card.value;

  const isHand = index !== undefined && total !== undefined;
  const middle = (total - 1) / 2;
  const rotateOffset = isHand ? (index - middle) * 4 : 0;
  const yOffset = isHand ? Math.abs(index - middle) * 4 : 0;

  return (
    <motion.div
      layoutId={layoutId || `card-${card.id}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
          opacity: 1, 
          scale: 1, 
          rotate: rotateOffset, 
          y: yOffset 
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 25, 
          mass: 0.5 
      }}
      whileHover={isPlayable && !isFaceDown ? { y: yOffset - 25, rotate: 0, scale: 1.1, zIndex: 50 } : {}}
      whileTap={isPlayable && !isFaceDown ? { scale: 0.95 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={clsx(
        "relative rounded-xl overflow-hidden shadow-xl will-change-transform",
        isPlayable ? "cursor-pointer hover:shadow-2xl z-10" : "cursor-not-allowed z-0",
        className
      )}
      style={{
        width: '100px',
        maxWidth: '15vw',
        aspectRatio: '2/3',
        transformOrigin: 'bottom center',
        marginLeft: isHand && index !== 0 ? '-40px' : '0px',
        ...style
      }}
    >
      {isFaceDown ? (
         <div className="w-full h-full bg-red-900 border-2 border-white rounded-xl flex items-center justify-center">
             <div className="w-4/5 h-4/5 rounded-full bg-red-600 border-4 border-yellow-300 flex items-center justify-center rotate-45 transform">
                 <span className="font-montserrat font-black text-yellow-300 tracking-tighter -rotate-45 block transform">UNO</span>
             </div>
         </div>
      ) : (
         <img src={imageSrc} alt={`${card.color} ${card.value}`} className="w-full h-full object-fill pointer-events-none drop-shadow-md" />
      )}
    </motion.div>
  );
}
