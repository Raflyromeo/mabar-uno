import React, { useState } from 'react';
import Card from './Card';
import { useGameStore } from '../store/gameStore';
import { isValidPlay } from '../utils/gameLogic';

export default function PlayerHand({ playerId }) {
  const { players, currentPlayerIndex, activeColor, discardPile, stackedDrawCount, playCards, ruleset } = useGameStore();

  const player = players.find(p => p.id === playerId);
  const isMyTurn = players[currentPlayerIndex]?.id === playerId;
  
  const topCard = discardPile[discardPile.length - 1];

  const [selectedCards, setSelectedCards] = useState([]);

  if (!player) return null;

  const toggleSelectCard = (card) => {
      if (!isMyTurn) return;
      
      const isSelected = selectedCards.find(c => c.id === card.id);
      if (isSelected) {
          setSelectedCards(selectedCards.filter(c => c.id !== card.id));
      } else {
          if (selectedCards.length > 0 && selectedCards[0].value !== card.value) {
              setSelectedCards([card]);
          } else {
              setSelectedCards([...selectedCards, card]);
          }
      }
  };

  const handlePlaySelected = () => {
     if (selectedCards.length === 0) return;
     if (isValidPlay(selectedCards, topCard, activeColor, stackedDrawCount, ruleset)) {
         playCards(playerId, selectedCards);
         setSelectedCards([]);
     } else {
         setSelectedCards([]);
     }
  };

  const isCardPlayable = (card) => {
      if (!isMyTurn) return false;
      return isValidPlay([card], topCard, activeColor, stackedDrawCount, ruleset);
  };

  return (
    <div className="absolute bottom-[clamp(10px,2vw,24px)] left-0 right-0 flex flex-col items-center pointer-events-none z-20">
       
       <div className={`p-[clamp(10px,1vw,16px)] rounded-[clamp(12px,1.5vw,20px)] flex items-center justify-center gap-[clamp(6px,1vw,12px)] bg-black/50 border-[0.5px] backdrop-blur-[16px] ${isMyTurn ? 'border-yellow-400 shadow-[0_0_20px_#facc15]' : 'border-white/10'} pointer-events-auto mb-2`}>
            <span className="font-bold text-white text-[clamp(10px,1.2vw,14px)] uppercase tracking-widest">{player.name}</span>
            <div className="w-[clamp(20px,2.5vw,28px)] h-[clamp(20px,2.5vw,28px)] rounded-full bg-white text-black font-black flex items-center justify-center text-[clamp(10px,1.2vw,14px)] shadow-inner">{player.hand.length}</div>
       </div>

       {selectedCards.length > 0 && (
           <div className="mb-[clamp(10px,2vw,20px)] pointer-events-auto flex items-center gap-[clamp(12px,2vw,24px)] bg-gradient-to-br from-yellow-400 to-amber-500 px-[clamp(20px,3vw,35px)] py-[clamp(8px,1vw,12px)] rounded-full border-[3px] border-white shadow-[0_10px_30px_rgba(250,204,21,0.5)]">
               <span className="font-black text-black tracking-wide text-[clamp(12px,1.5vw,18px)]">
                   {selectedCards.length} Selected
               </span>
               <button 
                  onClick={handlePlaySelected}
                  className="bg-black hover:bg-neutral-800 text-white font-bold py-[clamp(6px,1vw,10px)] px-[clamp(15px,2vw,25px)] rounded-full transition-all drop-shadow-md hover:scale-105 active:scale-95 text-[clamp(12px,1.2vw,16px)]"
               >
                   Play Group
               </button>
           </div>
       )}

      <div className="flex justify-center items-end px-4 pointer-events-auto w-full max-w-[85vw] mx-auto overflow-visible h-[clamp(100px,15vw,180px)] shrink-0">
        {player.hand.map((card, index) => {
            const isSelected = selectedCards.find(c => c.id === card.id) !== undefined;
            const total = player.hand.length;
            
            const pxOverlap = Math.min(75, 25 + (total * 2.5));
            const vwOverlap = Math.min(12, 4 + (total * 0.4));
            const dynamicMargin = `clamp(-${pxOverlap}px, -${vwOverlap}vw, -15px)`;

            return (
              <Card 
                  key={card.id} 
                  card={card} 
                  index={index} 
                  total={total} 
                  isPlayable={isMyTurn}
                  isSelected={isSelected}
                  onClick={() => {
                     if (!selectedCards.length && isCardPlayable(card)) {
                         playCards(playerId, [card]);
                     } else {
                         toggleSelectCard(card);
                     }
                  }}
                  style={{ 
                      marginLeft: index === 0 ? '0px' : dynamicMargin,
                      zIndex: isSelected ? 50 : undefined,
                      flexShrink: 0
                  }}
              />
            )
        })}
      </div>
    </div>
  );
}
