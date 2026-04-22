import React, { useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { socket } from '../lib/socket';
import { MessageCircle, X } from 'lucide-react';

export default function Sidebar() {
    const { players, currentPlayerIndex, roomCode, chatMessages, language, translations, isOnline, isChatOpen, setIsChatOpen } = useGameStore();
    const t = translations?.[language] || translations?.id;
    const [message, setMessage] = useState('');

    const orderedMessages = useMemo(
      () => [...chatMessages].sort((a, b) => a.timestamp - b.timestamp).slice(-60),
      [chatMessages]
    );
    const realPlayersCount = useMemo(
      () => players.filter((p) => !p.isAI).length,
      [players]
    );
    const showChat = isOnline && realPlayersCount > 1;

    const sendMessage = () => {
      const trimmed = message.trim();
      if (!trimmed || !roomCode) return;
      socket.emit('send-chat', { code: roomCode, message: trimmed });
      setMessage('');
    };

    return (
      <>
        {showChat && (
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="absolute right-5 bottom-5 z-[120] flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md hover:bg-black/35"
          >
            {isChatOpen ? <X className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
            {t.chat}
          </button>
        )}

        <div className="absolute left-4 top-[76px] rounded-2xl border border-white/10 bg-black/20 p-4 w-64 hidden sm:block pointer-events-none backdrop-blur-md">
            <h2 className="text-xl font-black font-montserrat tracking-tight mb-4 flex items-center gap-2 drop-shadow-md">
                {t.roomBadge}
                <span className="bg-white text-dark-bg px-2 rounded text-sm tracking-widest">{roomCode || '------'}</span>
            </h2>
            <div className="space-y-3">
              {players.map((p, index) => {
                const isTurn = index === currentPlayerIndex;
                return (
                  <div key={p.id} className={`flex items-center gap-3 p-2 rounded-xl transition-colors duration-300 ${isTurn ? 'bg-white/20 shadow-inner border border-white/10' : 'opacity-60'}`}>
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs ring-2 ring-white/50">
                        {p.name.charAt(0)}
                      </div>
                      {isTurn && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm tracking-wide text-white drop-shadow-md">{p.name}</p>
                      <p className="text-xs text-white/70 font-semibold">{p.hand.length} {t.cards}</p>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>

        {showChat && isChatOpen && (
          <div className="absolute right-5 bottom-20 z-[130] w-[min(92vw,340px)] rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur-md">
            <h3 className="mb-2 text-sm font-black text-white">{t.chat}</h3>
            <div className="mb-3 h-56 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-2 space-y-2">
              {orderedMessages.length === 0 ? (
                <p className="text-xs text-white/50">{t.chatEmpty}</p>
              ) : orderedMessages.map((item) => (
                <div key={item.id} className="rounded-lg bg-white/5 px-2 py-1">
                  <p className="text-[10px] font-bold text-emerald-300">{item.playerName}</p>
                  <p className="text-xs text-white break-words">{item.message}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                maxLength={220}
                placeholder={t.chatPlaceholder}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              />
              <button
                onClick={sendMessage}
                className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-400"
              >
                {t.send}
              </button>
            </div>
          </div>
        )}
      </>
    );
}
