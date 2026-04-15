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
  ruleset: 'tongkrongan',
  isOnline: false,
  isHost: false,
  mySocketId: null,
  roomCode: null,
  waitingPlayers: [],
  maxPlayers: 10,

  createRoom: (settings, hostName) => set((state) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      return {
          roomCode: code,
          ruleset: settings.ruleset,
          maxPlayers: settings.players,
          isOnline: true,
          waitingPlayers: [ { id: 'p0', name: hostName, isHost: true } ]
      };
  }),

  joinRoom: (code, playerName) => set((state) => {
      return { 
          roomCode: code,
          waitingPlayers: [
             ...state.waitingPlayers, 
             { id: `p${state.waitingPlayers.length}`, name: playerName, isHost: false }
          ] 
      };
  }),

  addBotToRoom: () => set((state) => {
      if (state.waitingPlayers.length >= state.maxPlayers) return {};
      return {
          waitingPlayers: [
             ...state.waitingPlayers,
             { id: `p${state.waitingPlayers.length}`, name: `Bot ${state.waitingPlayers.length}`, isHost: false, isAI: true }
          ]
      }
  }),

  startGameFromRoom: () => set((state) => {
    const freshDeck = generateDeck();
    const playerCount = state.waitingPlayers.length;
    const players = state.waitingPlayers.map((p, i) => ({
        id: p.id,
        name: p.name,
        isAI: p.isAI || false,
        hand: freshDeck.splice(0, 7),
        isUno: false
    }));

    return {
        deck: freshDeck,
        discardPile: [freshDeck.pop()],
        players,
        currentPlayerIndex: 0,
        direction: 1,
        activeColor: null,
        stackedDrawCount: 0,
        gameStarted: true,
        winner: null,
        toastMessage: "MATCH START!"
    };
  }),

  startGame: ({ playerCount = 2, ruleset = 'tongkrongan', isOnline = false, playerName = 'You' } = {}) => {
    const freshDeck = generateDeck();
    const players = [];

    for (let i = 0; i < playerCount; i++) {
        players.push({
            id: `p${i}`,
            name: i === 0 ? playerName : (isOnline ? `Player ${i+1}` : `Bot ${i}`),
            isAI: !isOnline && i > 0,
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
          let effectToast = null;

          cardsToPlay.forEach(card => {
             if (card.value === 'Draw2') drawAdded += 2;
             if (card.value === 'Draw4') drawAdded += 4;
             if (card.value === 'Reverse') {
                 direction *= -1;
                 effectToast = "REVERSED!";
             }
             if (card.value === 'Skip') {
                 skipNext = true;
                 effectToast = "SKIPPED!";
             }
          });

          if (drawAdded > 0) {
              effectToast = `+${drawAdded} COMBO!`;
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
              currentPlayerIndex: nextIndex,
              toastMessage: players[playerIndex].hand.length === 1 ? "UNO!" : effectToast
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

  clearToast: () => set({ toastMessage: null }),

  setMySocketId: (id) => set({ mySocketId: id }),
  setIsHost: (v) => set({ isHost: v }),
  setWaitingPlayers: (players, maxPlayers) => set({ waitingPlayers: players, ...(maxPlayers ? { maxPlayers } : {}) }),

  syncGameState: (state) => set({
    deck: state.deck,
    discardPile: state.discardPile,
    players: state.players,
    currentPlayerIndex: state.currentPlayerIndex,
    direction: state.direction,
    activeColor: state.activeColor,
    stackedDrawCount: state.stackedDrawCount,
    winner: state.winner,
    toastMessage: state.toastMessage ?? null,
    gameStarted: true,
  }),

  resetGame: () => set({
      gameStarted: false,
      waitingPlayers: [],
      players: [],
      roomCode: null,
      winner: null,
      deck: [],
      discardPile: [],
      toastMessage: null,
      isOnline: false,
      isHost: false,
      mySocketId: null,
  })
}));
