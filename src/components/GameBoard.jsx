import React from 'react';
import { useGameStore } from '../store/gameStore';
import Card from './Card';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameBoard() {
  const { discardPile, deck, activeColor, direction, stackedDrawCount, passTurn, players, currentPlayerIndex } = useGameStore();

  const handleDraw = () => {
     const myIndex = players.findIndex(p => !p.isAI);
     if (currentPlayerIndex === myIndex) {
         passTurn(players[myIndex].id);
     }
  };

  const humanIndex = players.findIndex(p => !p.isAI);
  const opponents = [];
  if (humanIndex !== -1) {
      for (let i = 1; i < players.length; i++) {
          opponents.push(players[(humanIndex + i) % players.length]);
      }
  } else {
      opponents.push(...players);
  }

  // Clean layout schema for flexible opponent positioning
  const getOpponentLayout = (opponentIndex, totalOpponents) => {
      const topScale = { containerFlex: "flex-col", pos: "top-[clamp(10px,2vw,30px)] left-1/2 -translate-x-1/2", cardRot: 0, handFlex: "flex-row", isVertical: false };
      const leftScale = { containerFlex: "flex-row", pos: "top-1/2 left-[clamp(10px,2vw,30px)] -translate-y-1/2", cardRot: 90, handFlex: "flex-col", isVertical: true };
      const rightScale = { containerFlex: "flex-row-reverse", pos: "top-1/2 right-[clamp(10px,2vw,30px)] -translate-y-1/2", cardRot: -90, handFlex: "flex-col", isVertical: true };

      if (totalOpponents === 1) {
          return topScale;
      } else if (totalOpponents === 2) {
          if (opponentIndex === 0) return leftScale;
          if (opponentIndex === 1) return topScale;
      } else if (totalOpponents === 3) {
          if (opponentIndex === 0) return leftScale;
          if (opponentIndex === 1) return topScale;
          if (opponentIndex === 2) return rightScale;
      }
      
      const spread = (opponentIndex + 1) * (100 / (totalOpponents + 1));
      return { containerFlex: "flex-col", pos: `top-4`, left: `${spread}%`, cardRot: 0, handFlex: "flex-row", isVertical: false };
  };

  return (
    <div className="absolute inset-0 bg-[#0f1f14] flex items-center justify-center p-2 sm:p-8 overflow-hidden">
        
        {/* Animated Mesh Gradient Background */}
        <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} 
            className="absolute box-border -inset-[50%] opacity-60 pointer-events-none mix-blend-screen"
        >
            <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-emerald-700/50 rounded-full filter blur-[clamp(80px,5vw,180px)]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[60vw] h-[60vw] bg-teal-800/40 rounded-full filter blur-[clamp(100px,6vw,200px)]"></div>
            <div className="absolute top-1/2 left-1/2 w-[40vw] h-[40vw] bg-green-500/20 rounded-full filter blur-[clamp(80px,5vw,150px)]"></div>
        </motion.div>

        {/* Analog Noise Texture Loop */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

        {/* Dynamic Inner Glow Based on Current Color */}
        <div className={`absolute w-[60vw] h-[60vw] blur-[clamp(100px,8vw,200px)] rounded-[100%] pointer-events-none transition-colors duration-1000 ${
            activeColor === 'Red' ? 'bg-red-500/25' :
            activeColor === 'Blue' ? 'bg-blue-500/25' :
            activeColor === 'Green' ? 'bg-green-400/25' :
            activeColor === 'Yellow' ? 'bg-yellow-400/25' : 'bg-transparent'
        }`} />

        {/* Players Context Layer - Glassmorphism 2.0 applied */}
        <div className="absolute inset-0 pointer-events-none z-20 font-bold drop-shadow-lg">
            {opponents.map((bot, idx) => {
               const layout = getOpponentLayout(idx, opponents.length);
               const isActive = players[currentPlayerIndex]?.id === bot.id;
               
               return (
                   <div key={bot.id} className={`absolute ${layout.pos} flex ${layout.containerFlex} items-center justify-center gap-[clamp(5px,1vw,15px)]`} style={{ left: layout.left, transform: layout.left ? 'translateX(-50%)' : '' }}>
                       
                       <div className="flex flex-col items-center justify-center z-20">
                           {/* Avatar Box Glassmorphism 2.0 */}
                           <div className={`glass px-[clamp(8px,1vw,16px)] py-[clamp(4px,0.5vw,8px)] rounded-[clamp(8px,1vw,16px)] flex items-center justify-center bg-black/40 border-[0.5px] ${isActive ? 'border-yellow-400/80 shadow-[0_0_20px_#facc15]' : 'border-white/10'}`}>
                              <span className="text-white text-[clamp(8px,1vw,12px)] tracking-wider uppercase mb-1 mr-2">{bot.name}</span>
                              <div className="flex items-center gap-[clamp(4px,0.5vw,8px)]">
                                  <span className="w-[clamp(16px,2vw,24px)] h-[clamp(16px,2vw,24px)] rounded-full bg-white text-black text-[clamp(8px,1vw,12px)] flex justify-center items-center shadow-inner font-bold">{bot.hand.length}</span>
                                  {bot.isUno && <span className="bg-red-500 text-[8px] px-1 py-0.5 rounded animate-pulse text-yellow-300 ml-1">UNO</span>}
                              </div>
                           </div>
                       </div>
                       
                       {/* Safe and Constrained Hand Container */}
                       <div className={`flex ${layout.handFlex} items-center justify-center relative overflow-visible ${layout.isVertical ? 'max-h-[30vh]' : 'max-w-[40vw]'}`}>
                           {bot.hand.slice(0, 5).map((c, i) => {
                               // Overlap Calculation - valid CSS negative clamps
                               // Horizontal: overlap negative left margin
                               // Vertical: overlap negative top margin
                               const marginStyle = layout.isVertical
                                   ? { marginTop: i === 0 ? '0px' : 'clamp(-50px, -6vw, -30px)' }
                                   : { marginLeft: i === 0 ? '0px' : 'clamp(-40px, -4vw, -20px)' };
                                   
                               return (
                                   <div 
                                       key={c.id} 
                                       className="relative z-0 group" 
                                       style={{ ...marginStyle }}
                                   >
                                       <Card 
                                           card={{ ...c, value: null }} 
                                           className="w-[clamp(40px,6vw,70px)] pointer-events-none shadow-xl transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105" 
                                           style={{ transform: `scale(0.8) rotate(${layout.cardRot + ((i - 2) * 5)}deg)`, flexShrink: 0 }} 
                                       />
                                   </div>
                               )
                           })}
                           {bot.hand.length > 5 && (
                               <div className="absolute -right-3 -bottom-3 z-50 text-[clamp(8px,1vw,12px)] bg-black/90 rounded-full px-2 py-1 text-white shadow-[0_4px_10px_rgba(0,0,0,0.8)] border border-white/20">
                                   +{bot.hand.length - 5}
                               </div>
                           )}
                       </div>
                   </div>
               )
            })}
        </div>


        {/* Center Canvas - z-10 for Desk Center */}
        <div className="relative flex items-center justify-center gap-[clamp(20px,5vw,80px)] z-10 w-full max-w-2xl px-4 py-[clamp(20px,4vw,60px)]">
            
            <div className="relative flex flex-col items-center justify-center">
                <motion.div 
                   whileHover={{ scale: 1.05, y: -5, rotateX: 10, rotateY: 5 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleDraw}
                   className="cursor-pointer relative rounded-[clamp(12px,1.5vw,18px)] w-[clamp(55px,10vw,110px)] aspect-[20/29] rotate-[-5deg]"
                   style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                >
                    {deck.length > 0 ? (
                        <>
                           {deck.slice(-7).map((card, i) => { // Render 7 kartu untuk nuansa deck tebal
                               const isTopCard = i === Math.min(deck.length, 7) - 1;
                               const pseudoZDepth = i * 2; 
                               return (
                                   <Card 
                                       key={card.id} 
                                       card={{ ...card, value: null }} 
                                       className={`absolute inset-0 will-change-transform border border-white/10 ${isTopCard ? 'z-10 shadow-[0_20px_40px_rgba(0,0,0,0.8)]' : 'shadow-[1px_2px_4px_rgba(0,0,0,0.5)]'}`} 
                                       style={{ 
                                           transform: `translateZ(${pseudoZDepth}px)`, // 3D Translate-z effect
                                           top: `-${i * 1.5}px`, 
                                           left: `-${i * 1.5}px`,
                                           borderBottom: isTopCard ? undefined : '2px solid rgba(255,255,255,0.1)'
                                       }} 
                                       layoutId={`card-${card.id}`} 
                                   />
                               );
                           })}
                        </>
                    ) : (
                        <div className="w-full h-full border-[3px] border-dashed border-white/20 rounded-[clamp(12px,1.5vw,18px)] flex items-center justify-center text-white/50 text-[clamp(8px,1vw,12px)] font-bold shadow-inner backdrop-blur-sm">Empty</div>
                    )}
                </motion.div>
                
                {stackedDrawCount > 0 && (
                   <div className="absolute -bottom-[clamp(30px,5vw,60px)] px-[clamp(10px,2vw,20px)] py-[clamp(4px,1vw,8px)] rounded-full text-white font-black text-[clamp(14px,2vw,24px)] animate-bounce z-40 bg-gradient-to-br from-red-500 to-rose-700 border-[3px] border-white drop-shadow-[0_8px_16px_rgba(239,68,68,0.6)]">
                       +{stackedDrawCount}
                   </div>
                )}
            </div>

            {/* Glowing Direction Ring */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.85]">
                <motion.div 
                   animate={{ rotate: direction === 1 ? 360 : -360 }}
                   transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                   className="w-[clamp(150px,25vw,300px)] h-[clamp(150px,25vw,300px)] rounded-full"
                   style={{
                       background: `conic-gradient(from 0deg, transparent 0%, transparent 60%, ${
                          activeColor === 'Red' ? 'rgba(239,68,68,0.8)' :
                          activeColor === 'Blue' ? 'rgba(59,130,246,0.8)' :
                          activeColor === 'Green' ? 'rgba(34,197,94,0.8)' :
                          activeColor === 'Yellow' ? 'rgba(234,179,8,0.8)' : 'rgba(255,255,255,0.3)'
                       } 100%)`,
                       WebkitMaskImage: 'radial-gradient(transparent 50%, black 55%)'
                   }}
                />
            </div>

            {/* Discard Pile - mode="popLayout" for 100% stable integrity */}
            <div className="relative z-10 w-[clamp(55px,10vw,110px)] aspect-[20/29]">
               <AnimatePresence mode="popLayout">
                   {discardPile.length > 0 && [discardPile[discardPile.length - 1]].map((topCard) => {
                       // Gunakan ID unik + discardPile.length sebagai key agar tidak ada bentrok (ghosting)
                       const uniqueKey = `${topCard.id}-${discardPile.length}`;
                       
                       const randomRot = ((topCard.id * 83) % 30) - 15;
                       const randomX = ((topCard.id * 17) % 15) - 7.5;
                       const randomY = ((topCard.id * 31) % 15) - 7.5;

                       return (
                           <motion.div
                               key={uniqueKey}
                               initial={{ opacity: 0, scale: 1.5, y: -200, rotate: randomRot * 0.5 }}
                               animate={{ opacity: 1, scale: 1, rotate: randomRot, x: randomX, y: randomY }}
                               exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)", transition: { duration: 0.15 } }}
                               className="absolute inset-0 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                               style={{ zIndex: discardPile.length }} 
                           >
                               <Card card={topCard} />
                           </motion.div>
                       )
                   })}
               </AnimatePresence>
            </div>
            
        </div>
    </div>
  );
}
