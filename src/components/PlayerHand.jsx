import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Card from './Card';
import ColorPicker from './ColorPicker';
import { useGameStore } from '../store/gameStore';
import { isValidPlay } from '../utils/gameLogic';
import { playUnoSound, playWinSound } from '../lib/sounds';

const isWildCard = (card) => card.value === 'Wild' || card.value === 'Draw4';

function PlayGroupBar({ selectedCards, isSelectionValid, onPlay, onClear, t }) {
  return ReactDOM.createPortal(
    <div className="fixed bottom-[clamp(135px,20vw,220px)] left-1/2 z-[9998] -translate-x-1/2 flex max-w-[92vw] flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-white bg-gradient-to-br from-yellow-400 to-amber-500 px-4 py-2 shadow-[0_10px_30px_rgba(250,204,21,0.6),0_4px_16px_rgba(0,0,0,0.5)]">
      <span className="text-[clamp(11px,1.3vw,16px)] font-black tracking-wide text-black">
        {selectedCards.length} {t.selectedCards}
      </span>

      <button
        onClick={onPlay}
        disabled={!isSelectionValid}
        className={`rounded-full px-[clamp(12px,1.8vw,22px)] py-[clamp(5px,0.8vw,9px)] text-[clamp(11px,1.2vw,15px)] font-bold transition-transform ${
          isSelectionValid
            ? 'bg-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95'
            : 'cursor-not-allowed bg-black/35 text-white/35 opacity-60'
        }`}
      >
        {t.playCards}
      </button>

      <button
        onClick={onClear}
        className="rounded-full border border-black/25 bg-black/10 px-2 py-1 text-[clamp(11px,1.1vw,14px)] font-bold text-black/70 transition-colors hover:bg-black/15 hover:text-black"
      >
        {t.clearSelection}
      </button>
    </div>,
    document.body
  );
}

function DrawCardButton({ onClick, stackedCount, t }) {
  return ReactDOM.createPortal(
    <button
      onClick={onClick}
      className={`fixed bottom-[clamp(138px,20vw,220px)] right-[clamp(16px,3vw,32px)] z-[9997] flex min-w-[clamp(56px,8vw,80px)] touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl px-[clamp(12px,2.5vw,20px)] py-[clamp(10px,2vw,16px)] text-center text-[clamp(10px,1.2vw,13px)] font-black tracking-wider text-white transition-transform hover:scale-105 active:scale-95 ${
        stackedCount > 0
          ? 'border-2 border-red-300 bg-gradient-to-br from-red-500 to-rose-700 shadow-[0_0_20px_rgba(239,68,68,0.6),0_8px_20px_rgba(0,0,0,0.5)]'
          : 'border border-white/20 bg-gradient-to-br from-[#1a2e20] to-[#0f1f14] shadow-[0_8px_20px_rgba(0,0,0,0.5)]'
      }`}
    >
      {stackedCount > 0 && (
        <span className="text-[clamp(16px,3vw,22px)] font-black leading-none">
          +{stackedCount}
        </span>
      )}
      <span className={`${stackedCount > 0 ? 'text-[clamp(8px,1vw,11px)]' : 'text-[clamp(10px,1.2vw,13px)]'} opacity-90`}>
        {stackedCount > 0 ? t.draw : `🂠 ${t.draw}`}
      </span>
    </button>,
    document.body
  );
}

export default function PlayerHand({ playerId }) {
  const { players, currentPlayerIndex, activeColor, discardPile, stackedDrawCount, playCards, passTurn, ruleset, winner, callUno, language, translations, drawCards, soundEnabled, isChatOpen } = useGameStore();
  const t = translations?.[language] || translations?.id;

  const player = players.find(p => p.id === playerId);
  const isMyTurn = players[currentPlayerIndex]?.id === playerId;
  const topCard = discardPile[discardPile.length - 1];

  const [selectedCards, setSelectedCards] = useState([]);
  const [selectionOrder, setSelectionOrder] = useState([]);
  const [unoCalled, setUnoCalled] = useState(false);
  const [pendingWild, setPendingWild] = useState(null);
  const winSoundFired = useRef(false);
  const unoPenaltyTimeoutRef = useRef(null);

  useEffect(() => {
    if (winner && !winSoundFired.current) {
      winSoundFired.current = true;
      if (soundEnabled) playWinSound();
    }
    if (!winner) winSoundFired.current = false;
  }, [winner, soundEnabled]);

  useEffect(() => {
    if (player?.hand?.length !== 1) setUnoCalled(false);
  }, [player?.hand?.length]);

  useEffect(() => {
    if (!player) return;
    if (winner) {
      if (unoPenaltyTimeoutRef.current) clearTimeout(unoPenaltyTimeoutRef.current);
      unoPenaltyTimeoutRef.current = null;
      return;
    }
    if (player.hand.length === 1 && !unoCalled) {
      if (unoPenaltyTimeoutRef.current) clearTimeout(unoPenaltyTimeoutRef.current);
      unoPenaltyTimeoutRef.current = setTimeout(() => {
        drawCards(playerId, 2);
        useGameStore.setState({ toastMessage: `UNO +2` });
      }, 5000);
    } else if (unoPenaltyTimeoutRef.current) {
      clearTimeout(unoPenaltyTimeoutRef.current);
      unoPenaltyTimeoutRef.current = null;
    }

    return () => {
      if (unoPenaltyTimeoutRef.current) {
        clearTimeout(unoPenaltyTimeoutRef.current);
      }
    };
  }, [player?.hand?.length, unoCalled, winner, playerId, drawCards, player]);

  useEffect(() => {
    if (selectedCards.length === 0) {
      setSelectionOrder([]);
    }
  }, [selectedCards.length]);

  if (!player) return null;

  const toggleSelectCard = (card) => {
      if (!isMyTurn) return;
      const isSelected = selectedCards.find(c => c.id === card.id);
      if (isSelected) {
          setSelectedCards(selectedCards.filter(c => c.id !== card.id));
          setSelectionOrder((prev) => prev.filter((id) => id !== card.id));
          return;
      }
      if (selectedCards.length > 0 && selectedCards[0].value !== card.value) {
          setSelectedCards([card]);
          setSelectionOrder([card.id]);
      } else {
          setSelectedCards([...selectedCards, card]);
          setSelectionOrder((prev) => [...prev, card.id]);
      }
  };

  const commitPlay = (cards, color = null) => {
      playCards(playerId, cards, color);
      setSelectedCards([]);
      setSelectionOrder([]);
      setPendingWild(null);
  };

  const handleCardPlay = (cards) => {
      if (!isValidPlay(cards, topCard, activeColor, stackedDrawCount, ruleset)) {
          setSelectedCards([]);
          setSelectionOrder([]);
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
          setSelectedCards([card]);
          setSelectionOrder([card.id]);
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
      if (unoPenaltyTimeoutRef.current) {
        clearTimeout(unoPenaltyTimeoutRef.current);
        unoPenaltyTimeoutRef.current = null;
      }
      callUno(playerId);
      if (soundEnabled) playUnoSound();
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
          t={t}
          onPlay={() => handleCardPlay(selectedCards)}
          onClear={() => {
            setSelectedCards([]);
            setSelectionOrder([]);
          }}
        />
      )}

      <div className={`p-[clamp(10px,1vw,16px)] rounded-[clamp(12px,1.5vw,20px)] flex items-center justify-center gap-[clamp(6px,1vw,12px)] bg-black/50 border-[0.5px] backdrop-blur-[16px] ${isMyTurn ? 'border-yellow-400 shadow-[0_0_20px_#facc15]' : 'border-white/10'} pointer-events-auto mb-2`}>
          <span className="font-bold text-white text-[clamp(10px,1.2vw,14px)] uppercase tracking-widest">{player.name}</span>
          <div className="w-[clamp(20px,2.5vw,28px)] h-[clamp(20px,2.5vw,28px)] rounded-full bg-white text-black font-black flex items-center justify-center text-[clamp(10px,1.2vw,14px)] shadow-inner">{player.hand.length}</div>
      </div>

      {isMyTurn && selectedCards.length === 0 && !isChatOpen && (
        <DrawCardButton
          onClick={() => passTurn(playerId)}
          stackedCount={stackedDrawCount}
          t={t}
        />
      )}

      {showUnoButton && (
        <button
          onClick={handleUnoCall}
          className="mb-3 pointer-events-auto animate-bounce bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-black text-[clamp(14px,2vw,22px)] px-[clamp(20px,3vw,36px)] py-[clamp(8px,1vw,12px)] rounded-full border-[3px] border-yellow-300 shadow-[0_0_30px_rgba(239,68,68,0.8),0_0_60px_rgba(239,68,68,0.4)] tracking-widest transition-all hover:scale-110 active:scale-95"
        >
          {t.uno}
        </button>
      )}

      <div className="flex justify-center items-end px-4 pointer-events-auto w-full max-w-[85vw] mx-auto overflow-visible h-[clamp(100px,15vw,180px)] shrink-0">
        {player.hand.map((card, index) => {
            const isSelected = selectedCards.find(c => c.id === card.id) !== undefined;
            const total = player.hand.length;
            const selectedOrderIndex = selectionOrder.indexOf(card.id);
            
            const overlapCSS = index === 0 ? 'ml-0' : (total > 15 ? '-ml-[clamp(30px,6vh,50px)]' : (total > 8 ? '-ml-[clamp(25px,5vh,40px)]' : '-ml-[clamp(20px,4vh,30px)]'));

            return (
              <Card
                  key={card.id}
                  card={card}
                  index={index}
                  total={total}
                  isPlayable={isMyTurn}
                  isSelected={isSelected}
                  onClick={() => handleCardClick(card)}
                  className={`w-[clamp(55px,20vh,96px)] aspect-[20/29] flex-shrink-0 ${overlapCSS}`}
                  style={{ zIndex: isSelected ? (100 + selectedOrderIndex) : undefined }}
              />
            );
        })}
      </div>
    </div>
  );
}
