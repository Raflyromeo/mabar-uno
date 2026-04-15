export const COLORS = ['Red', 'Yellow', 'Green', 'Blue'];
export const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw2'];
export const SPECIALS = ['Wild', 'Draw4'];

export const generateDeck = () => {
  const deck = [];
  let id = 1;
  
  COLORS.forEach((color) => {
    // One 0
    deck.push({ id: id++, color, value: '0' });
    // Two of 1-9, Skip, Reverse, Draw2
    VALUES.slice(1).forEach((value) => {
      deck.push({ id: id++, color, value });
      deck.push({ id: id++, color, value });
    });
  });

  // Four of each special
  for (let i = 0; i < 4; i++) {
    deck.push({ id: id++, color: 'None', value: 'Wild' });
    deck.push({ id: id++, color: 'None', value: 'Draw4' });
  }

  // Shuffle
  return deck.sort(() => Math.random() - 0.5);
};

export const getCardImage = (color, value) => {
  if (value === 'Wild') return '/card/Wild-1.svg';
  if (value === 'Draw4') return '/card/Draw4- 1.svg';

  if (color === 'Blue' && value === '2') return '/card/Blue- 12.svg';
  if (color === 'Blue' && value === '3') return '/card/Blue- 13.svg';

  if (['Skip', 'Reverse', 'Draw2'].includes(value)) {
    return `/card/${color} ${value}- 1.svg`;
  }

  return `/card/${color}- ${value}.svg`;
};

export const isValidPlay = (playedCards, topCard, activeColor, stackedDrawCount, ruleset = 'tongkrongan') => {
  if (!playedCards || playedCards.length === 0) return false;

  const firstPlay = playedCards[0];
  const isMulti = playedCards.length > 1;

  if (ruleset === 'tongkrongan') {
      if (isMulti) {
        const value = firstPlay.value;
        const allSameValue = playedCards.every(c => c.value === value);
        if (!allSameValue) return false; // In Multi-play, all cards must match in value.
      }

      if (firstPlay.value === 'Wild' || firstPlay.value === 'Draw4') {
        return true; 
      }

      if (stackedDrawCount > 0) {
        if (topCard.value === 'Draw2' && firstPlay.value === 'Draw2') return true;
        if (topCard.value === 'Draw4' && firstPlay.value === 'Draw4') return true;
        return false;
      }

      if (firstPlay.color === activeColor || firstPlay.value === topCard.value) {
        return true;
      }

      return false;
  } else {
      // Official Rules
      if (isMulti) return false; // Only 1 card per round
      
      // If there's an active stack penalty, you CANNOT respond with +2/+4 according to standard official rules.
      // You must draw the cards and skip turn.
      if (stackedDrawCount > 0) return false;

      if (firstPlay.value === 'Wild' || firstPlay.value === 'Draw4') {
        return true;
      }

      if (firstPlay.color === activeColor || firstPlay.value === topCard.value) {
        return true;
      }

      return false;
  }
};
