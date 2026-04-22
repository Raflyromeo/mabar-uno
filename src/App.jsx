import React, { useEffect, useState } from 'react';
import GameBoard from './components/GameBoard';
import PlayerHand from './components/PlayerHand';
import Sidebar from './components/Sidebar';
import InfoModal from './components/InfoModal';
import { useGameStore } from './store/gameStore';
import { useAI } from './hooks/useAI';
import { useSocketEvents } from './hooks/useSocketEvents';
import { socket, connectSocket } from './lib/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, ArrowLeft, ArrowRight } from 'lucide-react';

export default function App() {
  const { gameStarted, startGame, players, winner, toastMessage, clearToast, ruleset, roomCode, waitingPlayers, resetGame, isOnline, isHost, mySocketId, menuView, setMenuView, setBotDifficulty, maxPlayers, minPlayersToStart, language, setLanguage, translations, soundEnabled, setSoundEnabled, playAgainLocal } = useGameStore();
  const t = translations?.[language] || translations?.id;
  const difficultyOptions = [
    {
      key: 'easy',
      label: t.easyLabel,
      idleClass: 'border-green-500/40 bg-green-500/10 text-green-200',
      hoverClass: 'hover:bg-green-500/35 hover:border-green-400',
      activeClass: 'border-green-400 bg-green-500/80 text-white shadow-[0_0_18px_rgba(34,197,94,0.45)]',
    },
    {
      key: 'medium',
      label: t.mediumLabel,
      idleClass: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
      hoverClass: 'hover:bg-amber-500/35 hover:border-amber-400',
      activeClass: 'border-amber-300 bg-amber-500/80 text-white shadow-[0_0_18px_rgba(245,158,11,0.45)]',
    },
    {
      key: 'hard',
      label: t.hardLabel,
      idleClass: 'border-red-500/40 bg-red-500/10 text-red-200',
      hoverClass: 'hover:bg-red-600/35 hover:border-red-400',
      activeClass: 'border-red-400 bg-red-600/80 text-white shadow-[0_0_18px_rgba(220,38,38,0.45)]',
    },
  ];

  const [hostSettings, setHostSettings] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('hostSettings')) || { players: 4, minPlayersToStart: 2, ruleset: 'tongkrongan' }; } 
    catch { return { players: 4, minPlayersToStart: 2, ruleset: 'tongkrongan' }; }
  });
  const [botSettings, setBotSettings] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('botSettings')) || { players: 4, difficulty: 'medium', ruleset: 'tongkrongan' }; }
    catch { return { players: 4, difficulty: 'medium', ruleset: 'tongkrongan' }; }
  });
  const [inputCode, setInputCode] = useState('');
  const [playerName, setPlayerName] = useState(() => sessionStorage.getItem('playerName') || 'Player');

  useEffect(() => { sessionStorage.setItem('hostSettings', JSON.stringify(hostSettings)); }, [hostSettings]);
  useEffect(() => { sessionStorage.setItem('botSettings', JSON.stringify(botSettings)); }, [botSettings]);
  useEffect(() => { sessionStorage.setItem('playerName', playerName); }, [playerName]);

  useSocketEvents({ setMenuView, playerName });
  useAI();

  const myPlayer = isOnline ? players.find(p => p.id === (socket.id || mySocketId)) : players.find(p => !p.isAI);

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
              
              <div className="absolute top-[clamp(15px,3vw,30px)] left-[clamp(15px,3vw,30px)] z-[100] pointer-events-auto">
                  <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-2 py-1 text-xs font-bold">
                    <span className="text-gray-300">{t.languageLabel}</span>
                    <button onClick={() => setLanguage('id')} className={`rounded-full px-2 py-1 transition-colors ${language === 'id' ? 'bg-emerald-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>ID</button>
                    <button onClick={() => setLanguage('en')} className={`rounded-full px-2 py-1 transition-colors ${language === 'en' ? 'bg-indigo-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>EN</button>
                  </div>
              </div>
              <div className="absolute top-[clamp(15px,3vw,30px)] right-[clamp(15px,3vw,30px)] z-[100]">
                  <InfoModal glass />
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
                          <div className="flex flex-col items-center mb-2">
                            <img 
                              src="/uno-logo.png" 
                              alt="UNO" 
                              className="w-[clamp(6rem,14vw,10rem)] drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)] select-none pointer-events-none"
                              draggable={false}
                            />
                            <p className="text-sm font-inter text-gray-300 font-bold tracking-[0.3em] mt-4">by rafly romeo</p>
                          </div>
                          
                          <div className="pt-2">
                              <input 
                                 type="text" 
                                 placeholder={t.enterName}
                                 value={playerName}
                                 onChange={(e) => setPlayerName(e.target.value.substring(0,12))}
                                 className="w-full glass bg-black/50 border border-white/20 rounded-2xl px-6 py-4 text-center text-xl font-bold text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all uppercase tracking-widest shadow-inner"
                              />
                          </div>

                          <div className="pt-4 space-y-4">
                               <button 
                                  onClick={() => {
                                      setMenuView('HOST_OPTIONS');
                                  }} 
                                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg py-4 px-8 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                               >
                                 {t.createRoom}
                               </button>
                              <button 
                                 onClick={() => setMenuView('JOIN')}
                                 className="w-full glass hover:bg-white/10 border border-white/20 text-white font-bold text-lg py-4 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
                              >
                                 {t.joinRoom}
                              </button>
                              <button 
                                 onClick={() => setMenuView('BOT_SETUP')}
                                 className="w-full bg-transparent hover:bg-white/5 border border-transparent text-gray-400 hover:text-white font-bold text-sm py-4 px-8 rounded-full transition-colors"
                              >
                                 {t.soloBots}
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
                          <button onClick={() => setMenuView('MAIN')} className="absolute top-6 right-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"><ArrowLeft className="w-4 h-4"/> {t.back}</button>
                          <h2 className="text-3xl font-black font-montserrat tracking-tight mb-2">{t.hostOptions}</h2>
                          
                          <div className="space-y-6 pt-4">
                              <div>
                                  <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">{t.maxPlayers} ({hostSettings.players})</label>
                                  <input 
                                     type="range" min="2" max="10" 
                                     value={hostSettings.players}
                                     onChange={(e) => {
                                      const players = parseInt(e.target.value);
                                      setHostSettings((prev) => ({
                                        ...prev,
                                        players,
                                        minPlayersToStart: Math.max(2, Math.min(players, prev.minPlayersToStart)),
                                      }));
                                     }}
                                     className="w-full accent-emerald-500"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 px-2 mt-1 font-bold"><span>2</span><span>10</span></div>
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">{t.minPlayersToStart} ({hostSettings.minPlayersToStart})</label>
                                  <input
                                     type="range" min="2" max={hostSettings.players}
                                     value={hostSettings.minPlayersToStart}
                                     onChange={(e) => setHostSettings({ ...hostSettings, minPlayersToStart: parseInt(e.target.value) })}
                                     className="w-full accent-yellow-400"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 px-2 mt-1 font-bold"><span>2</span><span>{hostSettings.players}</span></div>
                              </div>
                              
                              <div>
                                  <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">{t.ruleSet}</label>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div 
                                         onClick={() => setHostSettings({ ...hostSettings, ruleset: 'tongkrongan' })}
                                         className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${hostSettings.ruleset === 'tongkrongan' ? 'border-purple-500 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'border-white/10 glass hover:bg-white/10'}`}
                                      >
                                          <h3 className="font-bold text-md text-white">Tongkrongan</h3>
                                          <p className="text-xs text-gray-400 mt-2">{t.tongkronganDesc}</p>
                                      </div>
                                      <div 
                                         onClick={() => setHostSettings({ ...hostSettings, ruleset: 'official' })}
                                         className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${hostSettings.ruleset === 'official' ? 'border-indigo-500 bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'border-white/10 glass hover:bg-white/10'}`}
                                      >
                                          <h3 className="font-bold text-md text-white">Official</h3>
                                          <p className="text-xs text-gray-400 mt-2">{t.officialDesc}</p>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="pt-8">
                               <button 
                                  onClick={() => {
                                      connectSocket();
                                      socket.emit('create-room', {
                                          playerName: playerName || 'Host',
                                          maxPlayers: hostSettings.players,
                                          minPlayersToStart: hostSettings.minPlayersToStart,
                                          ruleset: hostSettings.ruleset,
                                      });
                                  }}
                                  className="w-full glass bg-white hover:bg-gray-200 text-black font-black text-xl py-4 px-8 rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 active:scale-95"
                               >
                                 <span className="flex items-center justify-center gap-2">{t.next.toUpperCase()} <ArrowRight className="w-5 h-5"/></span>
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
                              <button onClick={() => { setMenuView('MAIN'); resetGame(); }} className="absolute top-6 right-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"><ArrowLeft className="w-4 h-4"/> {t.back}</button>
                              <h2 className="text-xl font-bold text-gray-300 tracking-widest uppercase mb-4">{t.roomCode}</h2>
                              <div className="flex items-center justify-center gap-4 mb-6">
                                  <div className="bg-black/60 border-2 border-dashed border-emerald-500/50 rounded-2xl px-[clamp(1rem,3vw,2rem)] py-3 text-[clamp(2rem,6vw,3rem)] font-mono font-black text-emerald-400 tracking-[0.2em] shadow-inner">
                                      {roomCode}
                                  </div>
                                  <button 
                                     onClick={() => navigator.clipboard.writeText(roomCode)} 
                                     className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white" title={t.copyCode}
                                  >
                                      <Clipboard className="w-5 h-5" />
                                  </button>
                              </div>
                          </div>

                          <div className="px-8 sm:px-12 flex-1 overflow-hidden flex flex-col min-h-0">
                              <h3 className="text-sm font-bold text-gray-400 mb-3 flex justify-between shrink-0">
                                  <span>{t.players.toUpperCase()} ({waitingPlayers.length}/{maxPlayers})</span>
                                  {isHost && waitingPlayers.length < maxPlayers 
                                    ? <span className="cursor-pointer text-emerald-400 hover:text-emerald-300" onClick={() => socket.emit('add-bot', { code: roomCode })}>{t.addBot}</span>
                                    : waitingPlayers.length >= maxPlayers 
                                      ? <span className="text-gray-600 cursor-not-allowed">{t.roomFull}</span> 
                                      : null
                                  }
                              </h3>
                             <div className="overflow-y-auto flex-1 space-y-2 pr-1 pb-2">
                                 {waitingPlayers.map((p, i) => (
                                     <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm shrink-0">{p.name.charAt(0)}</div>
                                         <span className="font-bold flex-1 text-left truncate">{p.name}</span>
                                        {p.isHost && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded shrink-0">{t.host}</span>}
                                        {p.isAI && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded shrink-0">{t.bot}</span>}
                                     </div>
                                 ))}
                             </div>
                          </div>

                           <div className="px-8 sm:px-12 pb-10 pt-4 shrink-0">
                               <button 
                                  disabled={waitingPlayers.length < minPlayersToStart || !isHost}
                                  onClick={() => socket.emit('start-game', { code: roomCode })} 
                                  className={`w-full font-black text-xl py-4 px-8 rounded-full transition-all transform ${waitingPlayers.length >= minPlayersToStart && isHost ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                               >
                                  {!isHost ? t.waitingForHost : waitingPlayers.length < minPlayersToStart ? t.waitingForPlayers.replace('{count}', minPlayersToStart) : t.startGame}
                               </button>
                           </div>
                      </motion.div>
                  )}

                  {menuView === 'BOT_SETUP' && (
                      <motion.div
                        key="bot_setup"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="z-10 glass p-10 sm:p-14 rounded-[40px] text-left space-y-6 w-full max-w-lg border-t border-white/20 relative"
                      >
                        <button onClick={() => setMenuView('MAIN')} className="absolute top-6 right-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"><ArrowLeft className="w-4 h-4"/> {t.back}</button>
                        <h2 className="text-3xl font-black font-montserrat tracking-tight mb-2">{t.soloSetup}</h2>
                        <div className="space-y-6 pt-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">{t.totalPlayers} ({botSettings.players})</label>
                            <input
                              type="range"
                              min="2"
                              max="10"
                              value={botSettings.players}
                              onChange={(e) => setBotSettings({ ...botSettings, players: parseInt(e.target.value) })}
                              className="w-full accent-emerald-500"
                            />
                            <div className="flex justify-between text-xs text-gray-500 px-2 mt-1 font-bold"><span>2</span><span>10</span></div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">{t.botDifficulty}</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {difficultyOptions.map((level) => (
                                <button
                                  key={level.key}
                                  onClick={() => setBotSettings({ ...botSettings, difficulty: level.key })}
                                  className={`rounded-xl border px-4 py-3 text-sm font-bold tracking-wide transition-all ${
                                    botSettings.difficulty === level.key ? level.activeClass : `${level.idleClass} ${level.hoverClass}`
                                  }`}
                                >
                                  {level.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">{t.ruleSet}</label>
                            <div className="grid grid-cols-2 gap-4">
                              {['tongkrongan', 'official'].map((rule) => (
                                <button
                                  key={rule}
                                  onClick={() => setBotSettings({ ...botSettings, ruleset: rule })}
                                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                                    botSettings.ruleset === rule ? 'border-indigo-400 bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.35)]' : 'border-white/10 bg-white/5 hover:bg-white/10'
                                  }`}
                                >
                                  <h3 className="font-bold text-white capitalize">{rule}</h3>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="pt-4">
                          <button
                            onClick={() => {
                              setBotDifficulty(botSettings.difficulty);
                              startGame({ playerCount: botSettings.players, ruleset: botSettings.ruleset, isOnline: false, playerName: playerName || 'Guest' });
                            }}
                            className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-black text-xl py-4 px-8 rounded-full shadow-[0_10px_30px_rgba(99,102,241,0.35)] transition-all transform hover:scale-105 active:scale-95"
                          >
                            {t.startSolo}
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
                          <h2 className="text-3xl font-black font-montserrat tracking-tight mb-2">{t.joinTitle}</h2>
                          
                          <div className="pt-4 flex justify-center">
                              <input 
                                 type="text" 
                                 placeholder={t.joinPlaceholder}
                                 value={inputCode}
                                 onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                 maxLength={6}
                                 className="w-full max-w-[20rem] bg-black/40 border border-white/20 rounded-2xl px-4 sm:px-6 py-4 text-center text-2xl sm:text-3xl font-bold tracking-[0.35em] sm:tracking-[0.5em] text-white placeholder:text-sm sm:placeholder:text-base placeholder:tracking-normal focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-mono"
                              />
                          </div>

                          <div className="pt-6">
                               <button 
                                  onClick={() => {
                                      if(inputCode.length === 6) {
                                          connectSocket();
                                          socket.emit('join-room', { code: inputCode, playerName: playerName || 'Guest' });
                                      } else {
                          alert(t.invalidCode);
                                      }
                                  }}
                                 className="w-full glass bg-white hover:bg-gray-200 text-black font-black text-xl py-4 px-8 rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 active:scale-95"
                              >
                                 <span className="flex items-center justify-center gap-2">{t.connect} <ArrowRight className="w-5 h-5"/></span>
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
       <div id="orientation-overlay" className="fixed inset-0 z-[10000] bg-black flex-col items-center justify-center p-8 text-white text-center">
           <svg className="w-24 h-24 mb-6 text-yellow-500 animate-[pulse_2s_ease-in-out_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <rect x="4" y="7" width="16" height="10" rx="2" ry="2" strokeWidth="2" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7V3M12 21v-4" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12a7 7 0 1 1-14 0" strokeDasharray="4 4" />
           </svg>
           <h2 className="text-3xl font-black mb-4">{t.landscapeHint}</h2>
       </div>

       <div className="absolute top-3 left-3 right-3 z-50 pointer-events-auto">
         <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-2 py-2 backdrop-blur-md">
          <button onClick={() => { setMenuView('MAIN'); resetGame(); }} className="glass px-[clamp(12px,2vw,20px)] py-[clamp(6px,1vw,10px)] rounded-full text-white hover:bg-neutral-800/80 transition-colors flex items-center gap-2 text-[clamp(10px,1vw,14px)] border border-white/20 shadow-md transform hover:scale-105 active:scale-95">
             <ArrowLeft className="w-4 h-4" /> {t.leave}
          </button>
          <div className="glass flex items-center gap-1 rounded-full border border-white/20 px-2 py-1 text-xs pointer-events-auto">
            <button onClick={() => setLanguage('id')} className={`rounded-full px-2 py-1 ${language === 'id' ? 'bg-emerald-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>ID</button>
            <button onClick={() => setLanguage('en')} className={`rounded-full px-2 py-1 ${language === 'en' ? 'bg-indigo-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}>EN</button>
          </div>
          <div className="glass flex items-center gap-2 rounded-full border border-white/20 px-2 py-1 text-xs pointer-events-auto">
            <span className="text-gray-300">{t.soundLabel}</span>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className={`rounded-full px-2 py-1 ${soundEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-600 text-white'}`}>
              {soundEnabled ? t.on : t.off}
            </button>
          </div>
          </div>
          <div className="flex items-center gap-[clamp(8px,1vw,16px)] rounded-2xl border border-white/10 bg-black/20 px-2 py-2 backdrop-blur-md">
            <span className="glass px-[clamp(8px,1vw,16px)] py-[clamp(4px,0.5vw,8px)] rounded-full text-[clamp(8px,0.6vw,12px)] font-bold tracking-widest text-emerald-300 flex items-center shadow-md">
              {t.roomBadge}: {roomCode || t.soloBadge}
            </span>
            <span className="glass px-[clamp(8px,1vw,16px)] py-[clamp(4px,0.5vw,8px)] rounded-full text-[clamp(8px,0.6vw,12px)] font-bold tracking-widest text-indigo-300 flex items-center shadow-md">
              {t.rulesBadge}: {ruleset?.toUpperCase()}
            </span>
            {/* InfoModal hanya tersedia di main menu */}
          </div>
         </div>
       </div>

       <GameBoard />
       <Sidebar />
       
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
       <AnimatePresence>
           {winner && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
               >
                 <motion.div
                    initial={{ scale: 0.92, y: 18, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    className="glass p-8 sm:p-12 rounded-[36px] text-center space-y-6 w-full max-w-lg"
                 >
                      <h2 className="text-5xl sm:text-7xl font-black font-montserrat text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] tracking-tighter">
                          {winner === myPlayer?.id ? t.victory : t.gameOver}
                      </h2>
                      <div className="py-4">
                          <div className="inline-block px-6 py-3 rounded-full bg-white/10 border border-white/20 text-xl font-bold">
                              {t.winner}: <span className={winner === myPlayer?.id ? 'text-yellow-400' : 'text-emerald-400'}>{players.find(p => p.id === winner)?.name}</span>
                          </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {isOnline ? (
                          isHost ? (
                            <button
                              onClick={() => socket.emit('play-again', { code: roomCode })}
                              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg py-3 px-5 shadow-[0_10px_24px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.02] active:scale-95"
                            >
                              {t.playAgain}
                            </button>
                          ) : (
                            <div className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/75">
                              {t.waitingHostRematch}
                            </div>
                          )
                        ) : (
                          <button
                            onClick={() => playAgainLocal()}
                            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg py-3 px-5 shadow-[0_10px_24px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.02] active:scale-95"
                          >
                            {t.playAgain}
                          </button>
                        )}
                        <button 
                          onClick={() => resetGame()}
                          className="flex-1 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-lg py-3 px-5 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          {t.returnLobby}
                        </button>
                      </div>
                 </motion.div>
               </motion.div>
           )}
       </AnimatePresence>

    </div>
  )
}
