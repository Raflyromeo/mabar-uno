import { create } from 'zustand';
import { generateDeck } from '../utils/gameLogic';

export const useGameStore = create((set, get) => ({
  deck: [],
  discardPile: [],
  players: [], 
  currentPlayerIndex: 0,
  direction: 1, 
  activeColor: null,
  stackedDrawCount: 0,
  gameStarted: false,
  winner: null,
  toastMessage: null,

  startGame: (playerCount = 2) => {
    const freshDeck = generateDeck();
    const players = [];

    for (let i = 0; i < playerCount; i++) {
        players.push({
            id: `p${i}`,
            name: i === 0 ? 'You' : `Bot ${i}`,
            isAI: i > 0,
            hand: freshDeck.splice(0, 7), 
            isUno: false
        });
    }

    let firstCardIndex = freshDeck.findIndex(c => c.value !== 'Wild' && c.value !== 'Draw4');
    if (firstCardIndex === -1) firstCardIndex = 0;
    
    const firstCard = freshDeck.splice(firstCardIndex, 1)[0];
    
    set({
      deck: freshDeck,
      discardPile: [firstCard],
      players,
      currentPlayerIndex: 0,
      direction: 1,
      activeColor: firstCard.color !== 'None' ? firstCard.color : 'Red',
      stackedDrawCount: 0,
      gameStarted: true,
      winner: null
    });
  },

  drawCards: (playerId, amount = 1) => {
      set((state) => {
          const deck = [...state.deck];
          const discard = [...state.discardPile];
          const drawn = [];

          for(let i=0; i<amount; i++) {
              if (deck.length === 0) {
                  const top = discard.pop();
                  deck.push(...discard.sort(() => Math.random() - 0.5));
                  discard.length = 0;
                  discard.push(top);
              }
              if (deck.length > 0) {
                  drawn.push(deck.pop());
              }
          }

          const players = state.players.map(p => {
              if (p.id === playerId) {
                  return { ...p, hand: [...p.hand, ...drawn], isUno: false };
              }
              return p;
          });

          return { deck, players, discardPile: discard };
      });
  },

  setNextPlayer: () => {
     set(state => {
         let nextIndex = state.currentPlayerIndex + state.direction;
         if (nextIndex < 0) nextIndex = state.players.length - 1;
         if (nextIndex >= state.players.length) nextIndex = 0;
         return { currentPlayerIndex: nextIndex };
     })
  },

  playCards: (playerId, cardsToPlay, chosenColor = null) => {
      set(state => {
          let players = [...state.players];
          let playerIndex = players.findIndex(p => p.id === playerId);
          let hand = [...players[playerIndex].hand];

          cardsToPlay.forEach(c => {
             hand = hand.filter(hCard => hCard.id !== c.id);
          });
          
          players[playerIndex] = { ...players[playerIndex], hand };

          const firstPlayed = cardsToPlay[0];
          let direction = state.direction;
          let activeColor = chosenColor || firstPlayed.color;
          let stackedCount = state.stackedDrawCount;
          let skipNext = false;
          let drawAdded = 0;

          cardsToPlay.forEach(card => {
             if (card.value === 'Draw2') drawAdded += 2;
             if (card.value === 'Draw4') drawAdded += 4;
             if (card.value === 'Reverse') {
                 if (state.players.length === 2 && !drawAdded) {
                     skipNext = !skipNext;
                 } else {
                     direction = direction * -1;
                 }
             }
             if (card.value === 'Skip') {
                 skipNext = !skipNext; 
             }
          });

          if (drawAdded > 0) {
              stackedCount += drawAdded;
          }

          let nextIndex = state.currentPlayerIndex + direction;
          if (nextIndex < 0) nextIndex = players.length - 1;
          if (nextIndex >= players.length) nextIndex = 0;

          if (skipNext) {
             nextIndex = nextIndex + direction;
             if (nextIndex < 0) nextIndex = players.length - 1;
             if (nextIndex >= players.length) nextIndex = 0;
          }

          if (hand.length === 0) {
              return { 
                  players, 
                  discardPile: [...state.discardPile, ...cardsToPlay], 
                  activeColor,
                  winner: playerId 
              };
          }

          return {
              players,
              discardPile: [...state.discardPile, ...cardsToPlay],
              activeColor,
              direction,
              stackedDrawCount: stackedCount,
              currentPlayerIndex: nextIndex
          };
      });
  },
  
  passTurn: (playerId) => {
      const state = get();
      if (state.stackedDrawCount > 0) {
         state.drawCards(playerId, state.stackedDrawCount);
         set({ stackedDrawCount: 0 });
      } else {
         state.drawCards(playerId, 1);
      }
      state.setNextPlayer();
  },

  callUno: (playerId) => {
      set(state => {
          const players = state.players.map(p => {
              if (p.id === playerId) {
                  return { ...p, isUno: true };
              }
              return p;
          });
          return { players, toastMessage: "UNO!" };
      });
  },

  clearToast: () => set({ toastMessage: null })
}));
