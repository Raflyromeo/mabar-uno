import React from 'react';
import { useGameStore } from '../store/gameStore';
import Card from './Card';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameBoard() {
  const { discardPile, deck, activeColor, direction, stackedDrawCount, passTurn, players, currentPlayerIndex } = useGameStore();
  const topCard = discardPile[discardPile.length - 1];

  const handleDraw = () => {
     const myIndex = players.findIndex(p => !p.isAI);
     if (currentPlayerIndex === myIndex) {
         passTurn(players[myIndex].id);
     }
  };

  const bgColors = {
      'Red': 'from-red-900/30 to-slate-900',
      'Blue': 'from-blue-900/30 to-slate-900',
      'Green': 'from-green-900/30 to-slate-900',
      'Yellow': 'from-yellow-900/30 to-slate-900',
      'None': 'from-slate-800 to-slate-900'
  };

  const currentGradient = activeColor ? bgColors[activeColor] : bgColors['None'];

  return (
    <div className={`absolute inset-0 transition-colors duration-1000 ease-in-out bg-gradient-to-br ${currentGradient} flex items-center justify-center p-8`}>
        
        <div className="absolute top-10 left-0 right-0 flex justify-center gap-16 pointer-events-none">
            {players.filter(p => p.isAI).map(bot => (
               <div key={bot.id} className="flex flex-col items-center">
                   <div className="glass px-4 py-2 rounded-full mb-2 flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{bot.name}</span>
                      <span className="w-6 h-6 rounded-full bg-slate-700 text-xs flex justify-center items-center font-bold">{bot.hand.length}</span>
                      {bot.isUno && <span className="bg-red-500 text-[10px] font-black px-2 rounded -ml-1 animate-pulse">UNO!</span>}
                   </div>
                   <div className="flex -space-x-8">
                       {bot.hand.slice(0, 5).map((c, i) => (
                           <Card key={c.id} card={{}} className="w-12 pointer-events-none opacity-80" style={{ transform: `scale(0.8) rotate(${(i - 2) * 8}deg)` }}/>
                       ))}
                       {bot.hand.length > 5 && <div className="z-10 text-xs font-bold bg-black/50 rounded-full w-8 h-8 flex items-center justify-center self-center text-white ml-2">+{bot.hand.length - 5}</div>}
                   </div>
               </div>
            ))}
        </div>

        <div className="relative flex items-center gap-12 sm:gap-24">
            
            <div className="relative flex flex-col items-center">
                <motion.div 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleDraw}
                   className="cursor-pointer relative mt-4 shadow-2xl rounded-xl"
                >
                    {deck.length > 0 ? (
                        <>
                           {[...Array(Math.min(5, Math.ceil(deck.length / 10)))].map((_, i) => (
                               <Card key={i} card={{}} className="absolute will-change-transform drop-shadow-2xl" style={{ top: -i*2, left: -i*2 }} />
                           ))}
                           <Card card={{}} className="relative z-10" />
                        </>
                    ) : (
                        <div className="w-[100px] aspect-[2/3] border-4 border-dashed border-white/20 rounded-xl flex items-center justify-center text-white/50 text-xs font-bold text-center p-4">
                            Empty
                        </div>
                    )}
                </motion.div>
                
                {stackedDrawCount > 0 && (
                   <div className="absolute -bottom-10 glass px-4 py-1 rounded-full text-red-500 font-black animate-bounce whitespace-nowrap drop-shadow-xl z-20 shadow-red-500/50">
                       Stack: +{stackedDrawCount}
                   </div>
                )}
            </div>

            <motion.div 
               animate={{ rotate: direction === 1 ? 360 : -360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute left-1/2 top-1/2 -ml-[90px] -mt-[90px] w-[180px] h-[180px] rounded-full border-[10px] border-dashed border-white/10 pointer-events-none"
            />

            <div className="relative z-20">
               <AnimatePresence>
                   <Card key={topCard?.id || 'empty'} card={topCard || null} className="shadow-2xl z-20" />
               </AnimatePresence>
            </div>
            
        </div>
    </div>
  );
}
