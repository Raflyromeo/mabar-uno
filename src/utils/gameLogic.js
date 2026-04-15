export const COLORS = ['Red', 'Yellow', 'Green', 'Blue'];
export const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw2'];
export const SPECIALS = ['Wild', 'Draw4'];

export const generateDeck = () => {
  const deck = [];
  let id = 1;
  
  COLORS.forEach((color) => {
    deck.push({ id: id++, color, value: '0' });
    VALUES.slice(1).forEach((value) => {
      deck.push({ id: id++, color, value });
      deck.push({ id: id++, color, value });
    });
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: id++, color: 'None', value: 'Wild' });
    deck.push({ id: id++, color: 'None', value: 'Draw4' });
  }

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
  if (!topCard) return false;

  const isMulti = playedCards.length > 1;

  if (ruleset === 'tongkrongan') {
    if (isMulti) {
      const groupValue = playedCards[0].value;
      const allSameValue = playedCards.every(c => c.value === groupValue);
      if (!allSameValue) return false;

      if (groupValue === 'Wild' || groupValue === 'Draw4') return true;

      if (stackedDrawCount > 0) {
        if (topCard.value === 'Draw2' && groupValue === 'Draw2') return true;
        if (topCard.value === 'Draw4' && groupValue === 'Draw4') return true;
        return false;
      }

      const matchesColor = playedCards.some(c => c.color === activeColor);
      const matchesValue = groupValue === topCard.value;
      return matchesColor || matchesValue;
    }

    const single = playedCards[0];

    if (single.value === 'Wild' || single.value === 'Draw4') return true;

    if (stackedDrawCount > 0) {
      if (topCard.value === 'Draw2' && single.value === 'Draw2') return true;
      if (topCard.value === 'Draw4' && single.value === 'Draw4') return true;
      return false;
    }

    return single.color === activeColor || single.value === topCard.value;

  } else {
    if (isMulti) return false;
    if (stackedDrawCount > 0) return false;

    const single = playedCards[0];
    if (single.value === 'Wild' || single.value === 'Draw4') return true;
    return single.color === activeColor || single.value === topCard.value;
  }
};
