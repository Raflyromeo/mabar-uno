import { useEffect } from 'react';
import { socket } from '../lib/socket';
import { useGameStore } from '../store/gameStore';
export function useSocketEvents({ setMenuView, playerName }) {
  const {
    setMySocketId, setIsHost, setWaitingPlayers,
    syncGameState, addChatMessage, clearChatMessages,
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
      setWaitingPlayers(room.players, room.maxPlayers, room.minPlayersToStart);
      useGameStore.setState({ roomCode: code, ruleset: room.ruleset, isOnline: true });
      clearChatMessages();
      setMenuView('HOST_WAITING');
    });

    socket.on('room-joined', ({ code, room }) => {
      setIsHost(false);
      setWaitingPlayers(room.players, room.maxPlayers, room.minPlayersToStart);
      useGameStore.setState({ roomCode: code, ruleset: room.ruleset, isOnline: true });
      clearChatMessages();
      setMenuView('HOST_WAITING');
    });

    socket.on('join-error', ({ message }) => {
      alert(message);
    });

    socket.on('lobby-updated', ({ players, maxPlayers, minPlayersToStart }) => {
      setWaitingPlayers(players, maxPlayers, minPlayersToStart);
    });

    socket.on('game-starting', ({ players: lobbyPlayers, ruleset }) => {
      const state = useGameStore.getState().createMatchStateFromParticipants(lobbyPlayers);

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

    socket.on('chat-message', (message) => {
      addChatMessage(message);
    });

    socket.on('play-again-started', ({ players: lobbyPlayers, ruleset }) => {
      const state = useGameStore.getState().createMatchStateFromParticipants(lobbyPlayers);
      syncGameState(state);
      useGameStore.setState({ ruleset });
      if (useGameStore.getState().isHost) {
        socket.emit('state-update', {
          code: useGameStore.getState().roomCode,
          state,
        });
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
      socket.off('chat-message');
      socket.off('play-again-started');
    };
  }, []);

  useEffect(() => {
    const store = useGameStore.getState();
    if (!store.isOnline || !store.isHost || !store.gameStarted) return;

    const code = store.roomCode;
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
