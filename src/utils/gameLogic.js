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

// Evaluate if played cards are valid according to standard + Tongkrongan rules
export const isValidPlay = (playedCards, topCard, activeColor, stackedDrawCount) => {
  if (!playedCards || playedCards.length === 0) return false;

  const firstPlay = playedCards[0];

  // Tongkrongan: Multi-Number Play
  // Must verify that ALL played cards have the exact same value.
  const value = firstPlay.value;
  const isMulti = playedCards.length > 1;
  
  if (isMulti) {
    const allSameValue = playedCards.every(c => c.value === value);
    if (!allSameValue) return false; // In Multi-play, all cards must match in value.
  }

  // Tongkrongan: Instant Wild 
  // You can play a Wild or Draw4 anytime immediately, ignoring color rules
  if (firstPlay.value === 'Wild' || firstPlay.value === 'Draw4') {
    return true; // You can stack multiple Wilds/Draw4s? Typically it's just 1, but we allow it if code permits.
  }

  // If there's an active Draw stack (stackedDrawCount > 0)
  // Tongkrongan: Stackable +2
  if (stackedDrawCount > 0) {
    // Must respond with another Draw2 or Draw4
    // Wait, Draw2 can stack on Draw2 regardless of color!
    if (topCard.value === 'Draw2' && firstPlay.value === 'Draw2') return true;
    if (topCard.value === 'Draw4' && firstPlay.value === 'Draw4') return true;
    
    // Some logic allows +4 over +2 or +2 over +4, let's keep it exact match stackable
    return false;
  }

  // Standard Rules
  if (firstPlay.color === activeColor || firstPlay.value === topCard.value) {
    return true;
  }

  return false;
};
