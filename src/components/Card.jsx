import React from 'react';
import { motion } from 'framer-motion';
import { getCardImage } from '../utils/gameLogic';
import clsx from 'clsx';

export default function Card({ card, onClick, isPlayable, className, style, layoutId, index, total, isSelected }) {
  if (!card) return null;
  const imageSrc = getCardImage(card.color, card.value);

  const isFaceDown = !card.value;

  // Dynamic Trigonometric Arc Calculation
  const isHand = index !== undefined && total !== undefined;
  const middle = (total - 1) / 2;
  const offset = isHand ? (index - middle) : 0;
  
  // Parabolic y-offset for true Arc, rotation for fan pattern
  const rotateOffset = isHand ? offset * 4.5 : 0;
  const arcYOffset = isHand ? Math.pow(offset, 2) * 5 : 0;
  
  // Z-Index must scale linearly so right cards fall cleanly over left cards
  const baseZIndex = isHand ? index : 0;
  const activeZIndex = isSelected ? baseZIndex + 40 : baseZIndex;

  return (
    <motion.div
      layoutId={layoutId || `card-${card.id}`}
      initial={isHand ? { opacity: 0, scale: 0.5, y: 150 } : { opacity: 0, scale: 0.8 }}
      animate={{ 
          opacity: 1, 
          scale: 1, 
          rotate: rotateOffset, 
          y: isSelected ? arcYOffset - 40 : arcYOffset // Elevated if selected
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ 
          type: 'spring', 
          stiffness: 400, 
          damping: 30, 
          mass: 0.8 
      }}
      whileHover={isPlayable && !isFaceDown ? { y: arcYOffset - 30, rotate: rotateOffset * 0.5, scale: 1.15, zIndex: 50, transition: { duration: 0.2 } } : {}}
      whileTap={isPlayable && !isFaceDown ? { scale: 0.95 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={clsx(
        "relative rounded-[min(12px,4vw)] sm:rounded-[clamp(12px,1.5vw,18px)] overflow-hidden will-change-transform shadow-[0_8px_20px_rgba(0,0,0,0.5)] border border-white/20 transition-all",
        isPlayable ? "cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.7)]" : "cursor-not-allowed",
        isSelected ? "ring-4 ring-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.6)]" : "",
        className
      )}
      style={{
        width: 'clamp(55px, 10vw, 110px)',
        aspectRatio: '20/29', // True standard UNO card aspect ratio
        transformOrigin: 'bottom center',
        marginLeft: isHand && index !== 0 ? 'clamp(-40px, -5vw, -35px)' : '0px',
        zIndex: activeZIndex,
        ...style
      }}
    >
      {isFaceDown ? (
         <div className="w-full h-full bg-[#E02626] border-[clamp(3px,0.8vw,8px)] border-white rounded-[min(12px,4vw)] sm:rounded-[clamp(12px,1.5vw,18px)] flex items-center justify-center shadow-inner relative overflow-hidden">
             {/* Diagonal inner shadow / gradients */}
             <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30"></div>
             
             {/* Black Oval Background */}
             <div className="w-[85%] h-[55%] rounded-[100%] bg-[#1a1a1a] flex items-center justify-center -rotate-[22deg] transform shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-[clamp(2px,0.5vw,5px)] border-[#FFE918] relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                 {/* UNO Text with Drop Shadow to simulate 3D */}
                 <span className="font-montserrat font-black text-[#FFE918] tracking-tighter text-[length:clamp(16px,2.5vw,28px)] relative z-10" 
                       style={{ textShadow: 'max(1px, 0.2vw) max(2px, 0.3vw) 0px #A15501, 1px 1px 0px #FFF' }}>
                     UNO
                 </span>
             </div>
         </div>
      ) : (
         <div className="w-full h-full bg-white relative">
             <img loading="eager" src={imageSrc} alt={`${card.color} ${card.value}`} className="w-full h-full object-fill pointer-events-none select-none" />
             <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-black/20 mix-blend-overlay pointer-events-none" />
         </div>
      )}
    </motion.div>
  );
}
