import React, { useEffect } from 'react';
import GameBoard from './components/GameBoard';
import PlayerHand from './components/PlayerHand';
import Sidebar from './components/Sidebar';
import { useGameStore } from './store/gameStore';
import { useAI } from './hooks/useAI';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const { gameStarted, startGame, players, winner, toastMessage, clearToast } = useGameStore();

  useAI(); 

  const myPlayer = players.find(p => !p.isAI);

  useEffect(() => {
     if (toastMessage) {
         const t = setTimeout(clearToast, 2000);
         return () => clearTimeout(t);
     }
  }, [toastMessage]);

  if (!gameStarted) {
      return (
          <div className="w-screen h-screen flex flex-col items-center justify-center bg-dark-bg text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-dark-bg to-indigo-900/40 z-0 animate-pulse" />
              <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="z-10 glass p-16 rounded-[40px] text-center space-y-8 max-w-lg mb-10 border-t border-white/20"
              >
                  <h1 className="text-8xl font-black font-montserrat tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                      UNO
                  </h1>
                  <p className="text-lg font-inter text-gray-300 tracking-wider">TONGKRONGAN RULES</p>
                  
                  <div className="pt-8">
                      <button 
                         onClick={() => startGame(4)} // 1 Human + 3 AI
                         className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xl py-4 px-8 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                      >
                         Play Solo vs AI
                      </button>
                  </div>
              </motion.div>
          </div>
      );
  }

  return (
    <div className="w-screen h-screen relative bg-dark-bg text-white overflow-hidden font-inter select-none">
       <GameBoard />
       <Sidebar />
       
       {myPlayer && <PlayerHand playerId={myPlayer.id} />}

       <AnimatePresence>
           {toastMessage && (
               <motion.div 
                  initial={{ opacity: 0, y: -50, scale: 0.5 }}
                  animate={{ opacity: 1, y: 50, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                  className="absolute top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
               >
                   <div className="bg-red-600 text-yellow-300 font-montserrat font-black text-6xl tracking-tighter px-8 py-4 rounded-xl border-4 border-yellow-300 shadow-[0_0_50px_rgba(220,38,38,0.8)] uppercase !skew-x-[-10deg]">
                       {toastMessage}
                   </div>
               </motion.div>
           )}
       </AnimatePresence>

       <AnimatePresence>
           {winner && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
               >
                  <div className="glass p-16 rounded-3xl text-center space-y-6">
                      <h2 className="text-6xl font-black font-montserrat text-white drop-shadow-xl">
                          {winner === myPlayer?.id ? 'YOU WIN!' : 'GAME OVER'}
                      </h2>
                      <p className="text-xl text-gray-300">
                          {players.find(p => p.id === winner)?.name} won the match!
                      </p>
                      <button 
                         onClick={() => startGame(4)}
                         className="mt-8 bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors"
                      >
                         Play Again
                      </button>
                  </div>
               </motion.div>
           )}
       </AnimatePresence>

    </div>
  )
}
