import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info, X, Github, Linkedin, Instagram,
  MousePointer2, Layers, SkipForward, RefreshCw, Zap, Star, Shield
} from 'lucide-react';

const rules = [
  {
    icon: <MousePointer2 className="w-4 h-4 text-emerald-400" />,
    bg: "bg-emerald-500/15 border-emerald-500/20",
    title: "Play a Card",
    desc: "Click a card that matches the top discard pile's color or number.",
  },
  {
    icon: <Layers className="w-4 h-4 text-indigo-400" />,
    bg: "bg-indigo-500/15 border-indigo-500/20",
    title: "Draw a Card",
    desc: "If you can't play, click the Draw Pile. The drawn card can be played immediately.",
  },
  {
    icon: <SkipForward className="w-4 h-4 text-yellow-400" />,
    bg: "bg-yellow-500/15 border-yellow-500/20",
    title: "Skip & Reverse",
    desc: "Skip jumps the next player. Reverse flips the turn order around the table.",
  },
  {
    icon: <Shield className="w-4 h-4 text-red-400" />,
    bg: "bg-red-500/15 border-red-500/20",
    title: "Draw +2 / +4",
    desc: "Draw +2 forces the next player to draw 2. Wild +4 forces 4 cards AND lets you pick the new color.",
  },
  {
    icon: <Star className="w-4 h-4 text-purple-400" />,
    bg: "bg-purple-500/15 border-purple-500/20",
    title: "Wild Card",
    desc: "Play a Wild anytime to change the active color to anything you choose.",
  },
  {
    icon: <Zap className="w-4 h-4 text-orange-400" />,
    bg: "bg-orange-500/15 border-orange-500/20",
    title: "Stack Rule (Tongkrongan)",
    desc: "In Tongkrongan mode, you can stack +2 on top of +2 to transfer the penalty chain!",
  },
  {
    icon: <RefreshCw className="w-4 h-4 text-cyan-400" />,
    bg: "bg-cyan-500/15 border-cyan-500/20",
    title: "Win Condition",
    desc: 'Play all your cards to win. Shout "UNO!" when you have only 1 card left!',
  },
];

export default function InfoModal({ glass = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const panelStyle = glass
    ? { background: 'rgba(10, 20, 15, 0.55)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }
    : { background: '#0a1a0f' };

  const panelClass = `pointer-events-auto relative w-full max-w-lg max-h-[90dvh] flex flex-col rounded-3xl border shadow-[0_32px_80px_rgba(0,0,0,0.95)] ${
    glass ? 'border-white/15' : 'border-white/10'
  }`;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md shadow-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
        aria-label="Game Info"
      >
        <Info className="w-5 h-5 text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 pointer-events-auto"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className={panelClass}
              style={panelStyle}
            >
              <div className="flex items-center justify-between px-5 sm:px-7 pt-5 sm:pt-7 pb-4 shrink-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 font-montserrat">
                    About Game
                  </h2>
                  <p className="text-white/40 text-xs sm:text-sm mt-0.5">UNO — Web Edition by Rafly Romeo</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors border border-white/10 shrink-0 ml-4"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="mx-5 sm:mx-7 mb-4 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 shrink-0">
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                  Created by{' '}
                  <span className="font-bold text-yellow-400">Muhammad Rafly Romeo Nasution</span>
                  {' '}— 6th semester Information Systems student at Universitas Gunadarma.
                </p>
              </div>

              <div className="px-5 sm:px-7 mb-2 shrink-0">
                <p className="text-[10px] sm:text-xs font-bold text-white/35 uppercase tracking-[0.2em]">How to Play</p>
              </div>

              <div className="overflow-y-auto flex-1 px-5 sm:px-7 pb-4 space-y-2 scrollbar-thin">
                {rules.map((rule, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${rule.bg}`}
                  >
                    <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-white/5">
                      {rule.icon}
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs sm:text-sm">{rule.title}</p>
                      <p className="text-white/50 text-[11px] sm:text-xs mt-0.5 leading-relaxed">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 sm:px-7 pb-5 sm:pb-7 pt-3 border-t border-white/10 shrink-0">
                <p className="text-[10px] sm:text-xs font-bold text-white/35 uppercase tracking-[0.2em] mb-3">Connect</p>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href="https://github.com/Raflyromeo/raflyromeo"
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                  >
                    <Github className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    <span className="text-white font-bold text-[10px] sm:text-xs">GitHub</span>
                  </a>
                  <a
                    href="https://linkedin.com/in/muhammadraflyromeonasution"
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all group"
                  >
                    <Linkedin className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-blue-300 font-bold text-[10px] sm:text-xs">LinkedIn</span>
                  </a>
                  <a
                    href="https://instagram.com/rfly.romeo_"
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 transition-all group"
                  >
                    <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                    <span className="text-pink-300 font-bold text-[10px] sm:text-xs">Instagram</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
