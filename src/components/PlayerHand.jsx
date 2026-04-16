import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Card from './Card';
import ColorPicker from './ColorPicker';
import { useGameStore } from '../store/gameStore';
import { isValidPlay } from '../utils/gameLogic';
import { playUnoSound, playWinSound } from '../lib/sounds';

const isWildCard = (card) => card.value === 'Wild' || card.value === 'Draw4';

function PlayGroupBar({ selectedCards, isSelectionValid, onPlay, onClear }) {
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: 'clamp(130px, 20vw, 220px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(10px,1.5vw,20px)',
        background: 'linear-gradient(135deg, #facc15, #f59e0b)',
        padding: 'clamp(6px,0.8vw,10px) clamp(16px,2.5vw,30px)',
        borderRadius: '999px',
        border: '3px solid white',
        boxShadow: '0 10px 30px rgba(250,204,21,0.6), 0 4px 16px rgba(0,0,0,0.5)',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        fontWeight: 900,
        color: 'black',
        fontSize: 'clamp(11px,1.3vw,16px)',
        letterSpacing: '0.03em',
      }}>
        {selectedCards.length} Kartu Dipilih
      </span>

      <button
        onClick={onPlay}
        disabled={!isSelectionValid}
        style={{
          fontWeight: 700,
          padding: 'clamp(5px,0.8vw,9px) clamp(12px,1.8vw,22px)',
          borderRadius: '999px',
          fontSize: 'clamp(11px,1.2vw,15px)',
          border: 'none',
          cursor: isSelectionValid ? 'pointer' : 'not-allowed',
          background: isSelectionValid ? 'black' : 'rgba(0,0,0,0.35)',
          color: isSelectionValid ? 'white' : 'rgba(255,255,255,0.35)',
          opacity: isSelectionValid ? 1 : 0.6,
          transition: 'transform 0.15s, background 0.15s',
          boxShadow: isSelectionValid ? '0 4px 12px rgba(0,0,0,0.4)' : 'none',
        }}
        onMouseEnter={e => { if (isSelectionValid) e.currentTarget.style.transform = 'scale(1.07)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        onMouseDown={e => { if (isSelectionValid) e.currentTarget.style.transform = 'scale(0.95)'; }}
        onMouseUp={e => { if (isSelectionValid) e.currentTarget.style.transform = 'scale(1.07)'; }}
      >
        Play Group
      </button>

      <button
        onClick={onClear}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 700,
          color: 'rgba(0,0,0,0.55)',
          fontSize: 'clamp(12px,1.3vw,16px)',
          padding: '0 4px',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'black'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,0,0,0.55)'; }}
      >
        ✕
      </button>
    </div>,
    document.body
  );
}

export default function PlayerHand({ playerId }) {
  const { players, currentPlayerIndex, activeColor, discardPile, stackedDrawCount, playCards, ruleset, winner, callUno } = useGameStore();

  const player = players.find(p => p.id === playerId);
  const isMyTurn = players[currentPlayerIndex]?.id === playerId;
  const topCard = discardPile[discardPile.length - 1];

  const [selectedCards, setSelectedCards] = useState([]);
  const [unoCalled, setUnoCalled] = useState(false);
  const [pendingWild, setPendingWild] = useState(null);
  const winSoundFired = useRef(false);

  useEffect(() => {
    if (winner && !winSoundFired.current) {
      winSoundFired.current = true;
      playWinSound();
    }
    if (!winner) winSoundFired.current = false;
  }, [winner]);

  useEffect(() => {
    if (player?.hand?.length !== 1) setUnoCalled(false);
  }, [player?.hand?.length]);

  if (!player) return null;

  const toggleSelectCard = (card) => {
      if (!isMyTurn) return;
      const isSelected = selectedCards.find(c => c.id === card.id);
      if (isSelected) {
          setSelectedCards(selectedCards.filter(c => c.id !== card.id));
          return;
      }
      if (selectedCards.length > 0 && selectedCards[0].value !== card.value) {
          setSelectedCards([card]);
      } else {
          setSelectedCards([...selectedCards, card]);
      }
  };

  const commitPlay = (cards, color = null) => {
      playCards(playerId, cards, color);
      setSelectedCards([]);
      setPendingWild(null);
  };

  const handleCardPlay = (cards) => {
      if (!isValidPlay(cards, topCard, activeColor, stackedDrawCount, ruleset)) {
          setSelectedCards([]);
          return;
      }
      if (cards.some(isWildCard)) {
          setPendingWild(cards);
      } else {
          commitPlay(cards);
      }
  };

  const handleCardClick = (card) => {
      if (!isMyTurn) return;
      if (selectedCards.length === 0) {
          const canPlayImmediately = isValidPlay([card], topCard, activeColor, stackedDrawCount, ruleset);
          if (canPlayImmediately && !isWildCard(card)) {
              handleCardPlay([card]);
          } else {
              setSelectedCards([card]);
          }
      } else {
          toggleSelectCard(card);
      }
  };

  const isSelectionValid = selectedCards.length > 0
      ? isValidPlay(selectedCards, topCard, activeColor, stackedDrawCount, ruleset)
      : false;

  const showUnoButton = player.hand.length === 1 && !unoCalled;

  const handleUnoCall = () => {
    if (player.hand.length === 1 && !unoCalled) {
      setUnoCalled(true);
      callUno(playerId);
      playUnoSound();
    }
  };

  return (
    <div className="absolute bottom-[clamp(10px,2vw,24px)] left-0 right-0 flex flex-col items-center pointer-events-none z-20">

      <ColorPicker
        isOpen={!!pendingWild}
        onSelect={(color) => commitPlay(pendingWild, color)}
      />

      {selectedCards.length > 0 && (
        <PlayGroupBar
          selectedCards={selectedCards}
          isSelectionValid={isSelectionValid}
          onPlay={() => handleCardPlay(selectedCards)}
          onClear={() => setSelectedCards([])}
        />
      )}

      <div className={`p-[clamp(10px,1vw,16px)] rounded-[clamp(12px,1.5vw,20px)] flex items-center justify-center gap-[clamp(6px,1vw,12px)] bg-black/50 border-[0.5px] backdrop-blur-[16px] ${isMyTurn ? 'border-yellow-400 shadow-[0_0_20px_#facc15]' : 'border-white/10'} pointer-events-auto mb-2`}>
          <span className="font-bold text-white text-[clamp(10px,1.2vw,14px)] uppercase tracking-widest">{player.name}</span>
          <div className="w-[clamp(20px,2.5vw,28px)] h-[clamp(20px,2.5vw,28px)] rounded-full bg-white text-black font-black flex items-center justify-center text-[clamp(10px,1.2vw,14px)] shadow-inner">{player.hand.length}</div>
      </div>

      {showUnoButton && (
        <button
          onClick={handleUnoCall}
          className="mb-3 pointer-events-auto animate-bounce bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-black text-[clamp(14px,2vw,22px)] px-[clamp(20px,3vw,36px)] py-[clamp(8px,1vw,12px)] rounded-full border-[3px] border-yellow-300 shadow-[0_0_30px_rgba(239,68,68,0.8),0_0_60px_rgba(239,68,68,0.4)] tracking-widest transition-all hover:scale-110 active:scale-95"
        >
          UNO!
        </button>
      )}

      <div className="flex justify-center items-end px-4 pointer-events-auto w-full max-w-[85vw] mx-auto overflow-visible h-[clamp(100px,15vw,180px)] shrink-0">
        {player.hand.map((card, index) => {
            const isSelected = selectedCards.find(c => c.id === card.id) !== undefined;
            const total = player.hand.length;
            
            const overlapCSS = index === 0 ? 'ml-0' : (total > 15 ? '-ml-10 sm:-ml-14' : (total > 8 ? '-ml-8 sm:-ml-12' : '-ml-6 sm:-ml-10'));

            return (
              <Card
                  key={card.id}
                  card={card}
                  index={index}
                  total={total}
                  isPlayable={isMyTurn}
                  isSelected={isSelected}
                  onClick={() => handleCardClick(card)}
                  className={`w-16 h-24 sm:w-[96px] sm:h-[139px] flex-shrink-0 ${overlapCSS}`}
                  style={{ zIndex: isSelected ? 50 : undefined }}
              />
            );
        })}
      </div>
    </div>
  );
}
