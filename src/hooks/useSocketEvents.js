import { useEffect } from 'react';
import { socket } from '../lib/socket';
import { useGameStore } from '../store/gameStore';
import { generateDeck } from '../utils/gameLogic';

export function useSocketEvents({ setMenuView, playerName }) {
  const {
    setMySocketId, setIsHost, setWaitingPlayers,
    syncGameState, startGameFromRoom,
    playCards, drawCards, setNextPlayer, passTurn,
    players, currentPlayerIndex, deck, discardPile,
    activeColor, direction, stackedDrawCount, winner,
    isHost, mySocketId, ruleset
  } = useGameStore();

  useEffect(() => {
    socket.on('connect', () => {
      setMySocketId(socket.id);
    });

    socket.on('room-created', ({ code, room }) => {
      setIsHost(true);
      setWaitingPlayers(room.players, room.maxPlayers);
      useGameStore.setState({ roomCode: code, ruleset: room.ruleset, isOnline: true });
      setMenuView('HOST_WAITING');
    });

    socket.on('room-joined', ({ code, room }) => {
      setIsHost(false);
      setWaitingPlayers(room.players, room.maxPlayers);
      useGameStore.setState({ roomCode: code, ruleset: room.ruleset, isOnline: true });
      setMenuView('HOST_WAITING');
    });

    socket.on('join-error', ({ message }) => {
      alert(message);
    });

    socket.on('lobby-updated', ({ players, maxPlayers }) => {
      setWaitingPlayers(players, maxPlayers);
    });

    socket.on('game-starting', ({ players: lobbyPlayers, ruleset }) => {
      const freshDeck = generateDeck();
      const gamePlayers = lobbyPlayers.map((p) => ({
        id: p.id,
        name: p.name,
        isAI: p.isAI || false,
        hand: freshDeck.splice(0, 7),
        isUno: false,
      }));

      let firstCardIndex = freshDeck.findIndex(c => c.value !== 'Wild' && c.value !== 'Draw4');
      if (firstCardIndex === -1) firstCardIndex = 0;
      const firstCard = freshDeck.splice(firstCardIndex, 1)[0];

      const state = {
        deck: freshDeck,
        discardPile: [firstCard],
        players: gamePlayers,
        currentPlayerIndex: 0,
        direction: 1,
        activeColor: firstCard.color !== 'None' ? firstCard.color : 'Red',
        stackedDrawCount: 0,
        winner: null,
        toastMessage: 'MATCH START!',
      };

      syncGameState(state);
      useGameStore.setState({ ruleset });

      if (useGameStore.getState().isHost) {
        socket.emit('state-update', {
          code: useGameStore.getState().roomCode,
          state,
        });
      }
    });

    socket.on('state-synced', ({ state }) => {
      syncGameState(state);
    });

    socket.on('action-received', ({ from, action }) => {
      if (!useGameStore.getState().isHost) return;
      const store = useGameStore.getState();

      if (action.type === 'play-cards') {
        store.playCards(action.playerId, action.cards, action.chosenColor);
      } else if (action.type === 'pass-turn') {
        store.passTurn(action.playerId);
      }
    });

    socket.on('host-changed', ({ newHostId }) => {
      if (socket.id === newHostId) {
        setIsHost(true);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('join-error');
      socket.off('lobby-updated');
      socket.off('game-starting');
      socket.off('state-synced');
      socket.off('action-received');
      socket.off('host-changed');
    };
  }, []);

  useEffect(() => {
    if (!useGameStore.getState().isOnline) return;
    if (!useGameStore.getState().isHost) return;
    if (!useGameStore.getState().gameStarted) return;

    const code = useGameStore.getState().roomCode;
    const store = useGameStore.getState();
    const state = {
      deck: store.deck,
      discardPile: store.discardPile,
      players: store.players,
      currentPlayerIndex: store.currentPlayerIndex,
      direction: store.direction,
      activeColor: store.activeColor,
      stackedDrawCount: store.stackedDrawCount,
      winner: store.winner,
      toastMessage: store.toastMessage,
    };
    socket.emit('state-update', { code, state });
  }, [players, currentPlayerIndex, discardPile?.length, activeColor, direction, stackedDrawCount, winner]);
}
