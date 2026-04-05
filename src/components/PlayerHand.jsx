import React, { useState } from 'react';
import Card from './Card';
import { useGameStore } from '../store/gameStore';
import { isValidPlay } from '../utils/gameLogic';

export default function PlayerHand({ playerId }) {
  const { players, currentPlayerIndex, activeColor, discardPile, stackedDrawCount, playCards } = useGameStore();

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
     if (isValidPlay(selectedCards, topCard, activeColor, stackedDrawCount)) {
         playCards(playerId, selectedCards);
         setSelectedCards([]);
     } else {
         setSelectedCards([]);
     }
  };

  const isCardPlayable = (card) => {
      if (!isMyTurn) return false;
      return isValidPlay([card], topCard, activeColor, stackedDrawCount);
  };

  return (
    <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center pointer-events-none">
       {selectedCards.length > 0 && (
           <div className="mb-6 pointer-events-auto flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-2xl">
               <span className="font-bold text-white tracking-wide">
                   {selectedCards.length} Cards Selected
               </span>
               <button 
                  onClick={handlePlaySelected}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-full transition-colors drop-shadow-md"
               >
                   Play Group
               </button>
           </div>
       )}

      <div className="flex justify-center items-end px-4 pointer-events-auto max-w-full overflow-visible h-[155px]">
        {player.hand.map((card, index) => {
            const isSelected = selectedCards.find(c => c.id === card.id) !== undefined;
            
            return (
              <Card 
                  key={card.id} 
                  card={card} 
                  index={index} 
                  total={player.hand.length} 
                  isPlayable={isMyTurn}
                  onClick={() => {
                     if (!selectedCards.length && isCardPlayable(card)) {
                         playCards(playerId, [card]);
                     } else {
                         toggleSelectCard(card);
                     }
                  }}
                  style={{
                      transform: isSelected ? 'translateY(-30px)' : 'none',
                      border: isSelected ? '2px solid #60A5FA' : 'none',
                      boxShadow: isSelected ? '0 0 20px rgba(96, 165, 250, 0.6)' : undefined,
                      zIndex: isSelected ? 40 : undefined
                  }}
              />
            )
        })}
      </div>
    </div>
  );
}
