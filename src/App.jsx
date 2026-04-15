import React, { useEffect, useState } from 'react';
import GameBoard from './components/GameBoard';
import PlayerHand from './components/PlayerHand';
import Sidebar from './components/Sidebar';
import InfoModal from './components/InfoModal';
import { useGameStore } from './store/gameStore';
import { useAI } from './hooks/useAI';
import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, ArrowLeft, ArrowRight } from 'lucide-react';

export default function App() {
  const { gameStarted, startGame, players, winner, toastMessage, clearToast, ruleset, roomCode, createRoom, waitingPlayers, joinRoom, addBotToRoom, startGameFromRoom, resetGame } = useGameStore();

  const [menuView, setMenuView] = useState(() => sessionStorage.getItem('menuView') || 'MAIN');
  const [hostSettings, setHostSettings] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('hostSettings')) || { players: 4, ruleset: 'tongkrongan' }; } 
    catch { return { players: 4, ruleset: 'tongkrongan' }; }
  });
  const [inputCode, setInputCode] = useState('');
  const [playerName, setPlayerName] = useState(() => sessionStorage.getItem('playerName') || 'Player');

  useEffect(() => { sessionStorage.setItem('menuView', gameStarted ? 'GAME' : menuView); }, [menuView, gameStarted]);
  useEffect(() => { sessionStorage.setItem('hostSettings', JSON.stringify(hostSettings)); }, [hostSettings]);
  useEffect(() => { sessionStorage.setItem('playerName', playerName); }, [playerName]);

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
          <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0c130f] text-white relative overflow-hidden">
              <motion.div 
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} 
                  className="absolute -inset-[50%] opacity-40 pointer-events-none mix-blend-screen"
              >
                  <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-emerald-700/40 rounded-full filter blur-[150px]"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-[60vw] h-[60vw] bg-teal-800/40 rounded-full filter blur-[150px]"></div>
              </motion.div>
              
              <div className="absolute top-[clamp(15px,3vw,30px)] right-[clamp(15px,3vw,30px)] z-[100]">
                  <InfoModal />
              </div>

              <AnimatePresence mode="wait">
                  {menuView === 'MAIN' && (
                      <motion.div 
                         key="main"
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.8 }}
                         className="z-10 glass p-12 sm:p-16 rounded-[40px] text-center space-y-8 w-full max-w-md border-t border-white/20"
                      >
                          <h1 className="text-[clamp(4rem,12vw,6rem)] leading-none mb-2 font-black font-montserrat tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                              UNO
                          </h1>
                          <p className="text-sm font-inter text-gray-300 font-bold tracking-[0.3em]">by rafly romeo</p>
                          
                          <div className="pt-2">
                              <input 
                                 type="text" 
                                 placeholder="Enter Your Name"
                                 value={playerName}
                                 onChange={(e) => setPlayerName(e.target.value.substring(0,12))}
                                 className="w-full glass bg-black/50 border border-white/20 rounded-2xl px-6 py-4 text-center text-xl font-bold text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all uppercase tracking-widest shadow-inner"
                              />
                          </div>

                          <div className="pt-4 space-y-4">
                              <button 
                                 onClick={() => setMenuView('HOST_OPTIONS')}
                                 className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg py-4 px-8 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                              >
                                 Create Room (Host)
                              </button>
                              <button 
                                 onClick={() => setMenuView('JOIN')}
                                 className="w-full glass hover:bg-white/10 border border-white/20 text-white font-bold text-lg py-4 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
                              >
                                 Join Room
                              </button>
                              <button 
                                 onClick={() => startGame({ playerCount: 4, ruleset: 'tongkrongan', isOnline: false, playerName: playerName || 'Guest' })}
                                 className="w-full bg-transparent hover:bg-white/5 border border-transparent text-gray-400 hover:text-white font-bold text-sm py-4 px-8 rounded-full transition-colors"
                              >
                                 Play Solo (Vs Bots)
                              </button>
                          </div>
                      </motion.div>
                  )}

                  {menuView === 'HOST_OPTIONS' && (
                      <motion.div 
                         key="host_opts"
                         initial={{ opacity: 0, x: 100 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -100 }}
                         className="z-10 glass p-10 sm:p-14 rounded-[40px] text-left space-y-6 w-full max-w-lg border-t border-white/20 relative"
                      >
                          <button onClick={() => setMenuView('MAIN')} className="absolute top-6 right-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"><ArrowLeft className="w-4 h-4"/> Back</button>
                          <h2 className="text-3xl font-black font-montserrat tracking-tight mb-2">Host Options</h2>
                          
                          <div className="space-y-6 pt-4">
                              <div>
                                  <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Max Players ({hostSettings.players})</label>
                                  <input 
                                     type="range" min="2" max="10" 
                                     value={hostSettings.players}
                                     onChange={(e) => setHostSettings({ ...hostSettings, players: parseInt(e.target.value) })}
                                     className="w-full accent-emerald-500"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 px-2 mt-1 font-bold"><span>2</span><span>10</span></div>
                              </div>
                              
                              <div>
                                  <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Rule Set</label>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div 
                                         onClick={() => setHostSettings({ ...hostSettings, ruleset: 'tongkrongan' })}
                                         className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${hostSettings.ruleset === 'tongkrongan' ? 'border-purple-500 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'border-white/10 glass hover:bg-white/10'}`}
                                      >
                                          <h3 className="font-bold text-md text-white">Tongkrongan</h3>
                                          <p className="text-xs text-gray-400 mt-2">Instant Wild, Stack +2, Multi-Card Play.</p>
                                      </div>
                                      <div 
                                         onClick={() => setHostSettings({ ...hostSettings, ruleset: 'official' })}
                                         className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${hostSettings.ruleset === 'official' ? 'border-indigo-500 bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'border-white/10 glass hover:bg-white/10'}`}
                                      >
                                          <h3 className="font-bold text-md text-white">Official</h3>
                                          <p className="text-xs text-gray-400 mt-2">Standard UNO rules.</p>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="pt-8">
                              <button 
                                 onClick={() => {
                                     createRoom(hostSettings, playerName || 'Host');
                                     setMenuView('HOST_WAITING');
                                 }} 
                                 className="w-full glass bg-white hover:bg-gray-200 text-black font-black text-xl py-4 px-8 rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 active:scale-95"
                              >
                                 <span className="flex items-center justify-center gap-2">NEXT <ArrowRight className="w-5 h-5"/></span>
                              </button>
                          </div>
                      </motion.div>
                  )}

                  {menuView === 'HOST_WAITING' && (
                      <motion.div 
                         key="host_wait"
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0 }}
                         className="z-10 glass rounded-[40px] text-center w-full max-w-lg border-t border-white/20 relative flex flex-col"
                         style={{ maxHeight: 'min(90dvh, 680px)' }}
                      >
                          <div className="px-8 sm:px-12 pt-10 shrink-0">
                              <button onClick={() => { setMenuView('MAIN'); resetGame(); }} className="absolute top-6 right-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"><ArrowLeft className="w-4 h-4"/> Back</button>
                              <h2 className="text-xl font-bold text-gray-300 tracking-widest uppercase mb-4">Room Code</h2>
                              <div className="flex items-center justify-center gap-4 mb-6">
                                  <div className="bg-black/60 border-2 border-dashed border-emerald-500/50 rounded-2xl px-[clamp(1rem,3vw,2rem)] py-3 text-[clamp(2rem,6vw,3rem)] font-mono font-black text-emerald-400 tracking-[0.2em] shadow-inner">
                                      {roomCode}
                                  </div>
                                  <button 
                                     onClick={() => navigator.clipboard.writeText(roomCode)} 
                                     className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white" title="Copy Code"
                                  >
                                      <Clipboard className="w-5 h-5" />
                                  </button>
                              </div>
                          </div>

                          <div className="px-8 sm:px-12 flex-1 overflow-hidden flex flex-col min-h-0">
                             <h3 className="text-sm font-bold text-gray-400 mb-3 flex justify-between shrink-0">
                                 <span>PLAYERS ({waitingPlayers.length}/{hostSettings.players})</span>
                                 {waitingPlayers.length < hostSettings.players 
                                   ? <span className="cursor-pointer text-emerald-400 hover:text-emerald-300" onClick={addBotToRoom}>+ Add Bot</span>
                                   : <span className="text-gray-600 cursor-not-allowed">Room Full</span>
                                 }
                             </h3>
                             <div className="overflow-y-auto flex-1 space-y-2 pr-1 pb-2">
                                 {waitingPlayers.map((p, i) => (
                                     <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm shrink-0">{p.name.charAt(0)}</div>
                                         <span className="font-bold flex-1 text-left truncate">{p.name}</span>
                                         {p.isHost && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded shrink-0">HOST</span>}
                                         {p.isAI && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded shrink-0">BOT</span>}
                                     </div>
                                 ))}
                             </div>
                          </div>

                          <div className="px-8 sm:px-12 pb-10 pt-4 shrink-0">
                              <button 
                                 disabled={waitingPlayers.length < 2}
                                 onClick={() => startGameFromRoom()} 
                                 className={`w-full font-black text-xl py-4 px-8 rounded-full transition-all transform ${waitingPlayers.length >= 2 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                              >
                                 {waitingPlayers.length < 2 ? 'WAITING FOR PLAYERS...' : 'START GAME'}
                              </button>
                          </div>
                      </motion.div>
                  )}

                  {menuView === 'JOIN' && (
                      <motion.div 
                         key="join"
                         initial={{ opacity: 0, x: 100 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -100 }}
                         className="z-10 glass p-10 sm:p-14 rounded-[40px] text-center space-y-6 w-full max-w-md border-t border-white/20 relative"
                      >
                          <button onClick={() => setMenuView('MAIN')} className="absolute top-6 right-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"><ArrowLeft className="w-4 h-4"/> Back</button>
                          <h2 className="text-3xl font-black font-montserrat tracking-tight mb-2">Join Room</h2>
                          
                          <div className="pt-4">
                              <input 
                                 type="text" 
                                 placeholder="6-DIGIT CODE"
                                 value={inputCode}
                                 onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                 maxLength={6}
                                 className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-4 text-center text-3xl font-bold tracking-[0.5em] text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-mono"
                              />
                          </div>

                          <div className="pt-6">
                              <button 
                                 onClick={() => {
                                     if(inputCode.length === 6) {
                                         joinRoom(inputCode, playerName || 'Guest');
                                         setMenuView('HOST_WAITING'); 
                                     } else {
                                         alert('Enter a valid 6 digit code!');
                                     }
                                 }}
                                 className="w-full glass bg-white hover:bg-gray-200 text-black font-black text-xl py-4 px-8 rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 active:scale-95"
                              >
                                 <span className="flex items-center justify-center gap-2">CONNECT <ArrowRight className="w-5 h-5"/></span>
                              </button>
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>
      );
  }

  return (
    <div className="w-screen h-screen relative bg-black text-white overflow-hidden font-inter select-none">
       <div className="absolute top-[clamp(15px,3vw,30px)] left-[clamp(15px,3vw,30px)] z-[100] pointer-events-auto">
          <button onClick={() => { setMenuView('MAIN'); resetGame(); }} className="glass px-[clamp(12px,2vw,20px)] py-[clamp(6px,1vw,10px)] rounded-full text-white hover:bg-neutral-800/80 transition-colors flex items-center gap-2 text-[clamp(10px,1vw,14px)] border border-white/20 shadow-md transform hover:scale-105 active:scale-95">
             <ArrowLeft className="w-4 h-4" /> LEAVE
          </button>
       </div>

       <div className="absolute top-[clamp(15px,3vw,30px)] right-[clamp(15px,3vw,30px)] z-[100] flex items-center gap-[clamp(8px,1vw,16px)] opacity-90 pointer-events-none">
          <span className="glass px-[clamp(8px,1vw,16px)] py-[clamp(4px,0.5vw,8px)] rounded-full text-[clamp(8px,0.6vw,12px)] font-bold tracking-widest text-emerald-300 flex items-center shadow-md">
             ROOM: {roomCode || 'SOLO'}
          </span>
          <span className="glass px-[clamp(8px,1vw,16px)] py-[clamp(4px,0.5vw,8px)] rounded-full text-[clamp(8px,0.6vw,12px)] font-bold tracking-widest text-indigo-300 flex items-center shadow-md">
             RULES: {ruleset?.toUpperCase()}
          </span>
          <div className="pointer-events-auto">
             <InfoModal />
          </div>
       </div>

       <GameBoard />
       
       {myPlayer && <PlayerHand playerId={myPlayer.id} />}

       <AnimatePresence>
           {toastMessage && (
               <motion.div 
                  initial={{ opacity: 0, scale: 0.1, y: 100 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 2, filter: 'blur(20px)' }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
               >
                   <div className="relative">
                       <span className="absolute inset-0 blur-2xl bg-red-600 opacity-60 rounded-full"></span>
                       <div className="bg-gradient-to-br from-red-600 to-rose-900 text-transparent bg-clip-text font-montserrat font-black text-[8vw] tracking-tighter px-12 py-6 uppercase !skew-x-[-15deg] !rotate-[-5deg] drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] filter drop-shadow-[0_0_10px_#fde047]">
                           <span className="text-yellow-300 drop-shadow-[0_5px_0_#b91c1c] stroke-black">{toastMessage}</span>
                       </div>
                   </div>
               </motion.div>
           )}
       </AnimatePresence>

       {/* Game Over Screen */}
       <AnimatePresence>
           {winner && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
               >
                  <div className="glass p-10 sm:p-16 rounded-[40px] text-center space-y-8 w-full max-w-lg">
                      <h2 className="text-5xl sm:text-7xl font-black font-montserrat text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] tracking-tighter">
                          {winner === myPlayer?.id ? 'VICTORY!' : 'GAME OVER'}
                      </h2>
                      <div className="py-4">
                          <div className="inline-block px-6 py-3 rounded-full bg-white/10 border border-white/20 text-xl font-bold">
                              WINNER: <span className={winner === myPlayer?.id ? 'text-yellow-400' : 'text-emerald-400'}>{players.find(p => p.id === winner)?.name}</span>
                          </div>
                      </div>
                      <button 
                         onClick={() => window.location.reload()}
                         className="w-full glass bg-white hover:bg-gray-200 text-black font-black text-xl py-4 px-8 rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 active:scale-95 mt-4"
                      >
                         RETURN TO LOBBY
                      </button>
                  </div>
               </motion.div>
           )}
       </AnimatePresence>

    </div>
  )
}
