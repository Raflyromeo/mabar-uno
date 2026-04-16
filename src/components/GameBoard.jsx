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

  const getOpponentLayout = (opponentIndex, totalOpponents) => {
      const top    = { transClass: '-translate-y-[42vh] sm:-translate-y-[45vh] rotate-180', badgeRot: 'rotate-180' };
      const left   = { transClass: '-translate-x-[42vw] sm:-translate-x-[45vw] rotate-90',  badgeRot: '-rotate-90' };
      const right  = { transClass: 'translate-x-[42vw] sm:translate-x-[45vw] -rotate-90', badgeRot: 'rotate-90' };

      if (totalOpponents === 1) return top;
      if (totalOpponents === 2) return opponentIndex === 0 ? left : top;
      if (totalOpponents === 3) return [left, top, right][opponentIndex] ?? top;

      return top;
  };

  const colorGlow = {
    Red: 'rgba(239,68,68,0.8)',
    Blue: 'rgba(59,130,246,0.8)',
    Green: 'rgba(34,197,94,0.8)',
    Yellow: 'rgba(234,179,8,0.8)',
  };

  return (
    <div className="absolute inset-0 bg-[#0f1f14] flex items-center justify-center overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-emerald-700/40 rounded-full filter blur-[clamp(80px,5vw,180px)]" />
        <div className="absolute bottom-1/4 right-1/4 w-[60vw] h-[60vw] bg-teal-800/30 rounded-full filter blur-[clamp(100px,6vw,200px)]" />
      </div>

      <div className={`absolute inset-[clamp(-20%,-10vw,-5%)] border-[clamp(20px,5vw,60px)] rounded-full transition-colors duration-1000 blur-[clamp(20px,4vw,40px)] mix-blend-screen opacity-35 pointer-events-none ${
          activeColor === 'Red'    ? 'border-red-500 bg-red-900/20' :
          activeColor === 'Blue'   ? 'border-blue-500 bg-blue-900/20' :
          activeColor === 'Green'  ? 'border-emerald-500 bg-emerald-900/20' :
          activeColor === 'Yellow' ? 'border-yellow-400 bg-yellow-900/20' :
          'border-white/20 bg-gray-900/20'
      }`} />

      <div className="absolute inset-0 pointer-events-none z-10 font-bold drop-shadow-lg">
          {opponents.map((bot, idx) => {
             const layout = getOpponentLayout(idx, opponents.length);
             const isActive = players[currentPlayerIndex]?.id === bot.id;
             const visibleCards = bot.hand.slice(0, 7);
             const totalVisible = visibleCards.length;
             const spreadAngle = Math.min(14, 100 / Math.max(totalVisible, 1));
             const totalSpread = spreadAngle * (totalVisible - 1);

             return (
                 <div
                     key={bot.id}
                     className={`absolute top-1/2 left-1/2 w-[80vw] sm:w-[60vw] max-w-[600px] flex flex-col items-center justify-start gap-2 transition-transform origin-center ${layout.transClass}`}
                     style={{ marginLeft: '-40vw', marginTop: '-50px' }}
                 >
                     <div className={`flex flex-col items-center justify-center z-20 shrink-0 ${layout.badgeRot}`}>
                         <div className={`glass px-3 py-1.5 rounded-xl flex items-center justify-center bg-black/50 border-[0.5px] ${isActive ? 'border-yellow-400/80 shadow-[0_0_16px_#facc15]' : 'border-white/10'}`}>
                             <span className="text-white text-xs tracking-wider uppercase mr-1.5">{bot.name}</span>
                             <span className="w-5 h-5 rounded-full bg-white text-black text-xs flex justify-center items-center shadow-inner font-black">{bot.hand.length}</span>
                             {bot.isUno && <span className="bg-red-500 text-[7px] px-1 py-0.5 rounded animate-pulse text-yellow-300 ml-1">UNO</span>}
                         </div>
                     </div>

                     <div className="relative flex items-start justify-center w-full h-[clamp(60px,10vw,90px)]">
                         {visibleCards.map((c, i) => {
                             const angle = -totalSpread / 2 + i * spreadAngle;
                             const midOffset = i - (totalVisible - 1) / 2;
                             const yLift = -(midOffset * midOffset) * 2;
                             const xShift = midOffset * 15;

                             return (
                                 <div
                                     key={c.id}
                                     className="absolute top-0 origin-top"
                                     style={{
                                         left: '50%',
                                         height: 'clamp(50px,14vh,90px)',
                                         transform: `translateX(-50%) translateX(${xShift}px) translateY(${-yLift}px) rotate(${angle}deg)`,
                                         zIndex: totalVisible - i,
                                     }}
                                 >
                                     <Card
                                         card={{ ...c, value: null }}
                                         index={i}
                                         total={totalVisible}
                                         className="w-full h-full aspect-[20/29] pointer-events-none shadow-[0_6px_20px_rgba(0,0,0,0.7)] rotate-180"
                                     />
                                 </div>
                             );
                         })}
                         {bot.hand.length > 7 && (
                             <div className={`absolute right-1/4 top-0 z-50 text-[10px] bg-black/90 rounded-full px-2 py-0.5 text-white shadow border border-white/20 ${layout.badgeRot}`}>
                                 +{bot.hand.length - 7}
                             </div>
                         )}
                     </div>
                 </div>
             );
          })}
      </div>

      <div className="relative flex items-center justify-center gap-[clamp(20px,10vw,100px)] z-40 w-full px-4 shrink-0 transition-transform">

          <div className="relative flex flex-col items-center justify-center">
              <motion.div
                 whileHover={{ scale: 1.05, y: -5 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={handleDraw}
                 className="cursor-pointer relative rounded-[clamp(12px,1.5vw,18px)] h-[clamp(90px,28vh,160px)] w-auto aspect-[20/29] rotate-[-5deg]"
              >
                  {deck.length > 0 ? (
                     <Card
                         key={deck[deck.length - 1].id}
                         card={{ ...deck[deck.length - 1], value: null }}
                         className="absolute inset-0 w-full h-full aspect-[20/29] shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05),_4px_4px_0px_0px_rgba(0,0,0,0.8),_6px_6px_0px_0px_rgba(255,255,255,0.05),_8px_8px_0px_0px_rgba(0,0,0,0.9),_20px_20px_40px_rgba(0,0,0,0.9)] border border-white/20"
                         layoutId={`card-${deck[deck.length - 1].id}`}
                     />
                  ) : (
                      <div className="w-full h-full border-[3px] border-dashed border-white/20 rounded-[clamp(12px,1.5vw,18px)] flex items-center justify-center text-white/50 text-[clamp(8px,1vw,12px)] font-bold shadow-inner backdrop-blur-sm">Empty</div>
                  )}
              </motion.div>

              {stackedDrawCount > 0 && (
                 <div className="absolute -bottom-[clamp(30px,5vw,60px)] px-[clamp(10px,2vw,20px)] py-[clamp(4px,1vw,8px)] rounded-full text-white font-black text-[clamp(14px,2vw,24px)] animate-bounce z-50 bg-gradient-to-br from-red-500 to-rose-700 border-[3px] border-white drop-shadow-[0_8px_16px_rgba(239,68,68,0.6)]">
                     +{stackedDrawCount}
                 </div>
              )}
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-70">
              <div
                  className="w-[clamp(150px,25vw,300px)] h-[clamp(150px,25vw,300px)] rounded-full transition-colors duration-1000"
                  style={{
                      background: `radial-gradient(circle, ${colorGlow[activeColor] ?? 'rgba(255,255,255,0.15)'} 0%, transparent 70%)`,
                  }}
              />
          </div>

          <div className="relative z-10 h-[clamp(90px,28vh,160px)] w-auto aspect-[20/29]">
             <AnimatePresence mode="popLayout">
                 {discardPile.length > 0 && [discardPile[discardPile.length - 1]].map((topCard) => {
                     const uniqueKey = `${topCard.id}-${discardPile.length}`;
                     const idStr = String(topCard.id);
                     const randomRot = (idStr.charCodeAt(0) % 30) - 15;
                     const randomX = (idStr.charCodeAt(idStr.length > 1 ? 1 : 0) % 10) - 5;
                     const randomY = (idStr.charCodeAt(idStr.length > 2 ? 2 : 0) % 10) - 5;

                     return (
                         <motion.div
                             key={uniqueKey}
                             initial={{ opacity: 0, scale: 1.5, y: -200, rotate: randomRot * 0.5 }}
                             animate={{ opacity: 1, scale: 1, rotate: randomRot, x: randomX, y: randomY }}
                             exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)', transition: { duration: 0.15 } }}
                             className="absolute inset-0 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                             style={{ zIndex: discardPile.length }}
                         >
                             <Card card={topCard} className="w-full h-full aspect-[20/29]" />
                         </motion.div>
                     );
                 })}
             </AnimatePresence>
          </div>
      </div>
    </div>
  );
}
