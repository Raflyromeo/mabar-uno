import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { isValidPlay } from '../utils/gameLogic';

export const useAI = () => {
    const { players, currentPlayerIndex, activeColor, discardPile, stackedDrawCount, playCards, passTurn, gameStarted, winner, direction, ruleset, botDifficulty } = useGameStore();

    const topCard = discardPile[discardPile.length - 1];

    useEffect(() => {
        if (!gameStarted || winner) return;

        const p = players[currentPlayerIndex];
        if (!p || !p.isAI) return;

        const timer = setTimeout(() => {
            
            const groups = {};
            p.hand.forEach(card => {
                if (!groups[card.value]) groups[card.value] = [];
                groups[card.value].push(card);
            });

            let validPlays = [];

            Object.values(groups).forEach(group => {
                if (group.length > 1 && isValidPlay(group, topCard, activeColor, stackedDrawCount, ruleset)) {
                    let groupWeight = group.length * 15;
                    if (group[0].value === 'Draw2' && stackedDrawCount > 0) groupWeight = group.length * 50; 
                    validPlays.push({ cards: group, weight: groupWeight }); 
                }
            });

            p.hand.forEach(card => {
                if (isValidPlay([card], topCard, activeColor, stackedDrawCount, ruleset)) {
                    let weight = 5;
                    if (card.value === 'Wild' || card.value === 'Draw4') weight = 1;
                    if (card.value === 'Draw2' && stackedDrawCount > 0) weight = 30;

                    validPlays.push({ cards: [card], weight });
                }
            });

            if (validPlays.length > 0) {
                validPlays.sort((a, b) => b.weight - a.weight);
                let chosenPlay;
                if (botDifficulty === 'easy') {
                    chosenPlay = validPlays[Math.floor(Math.random() * validPlays.length)]?.cards || validPlays[validPlays.length - 1].cards;
                } else if (botDifficulty === 'hard') {
                    chosenPlay = validPlays[0].cards;
                } else {
                    chosenPlay = validPlays.slice(0, Math.min(3, validPlays.length))[Math.floor(Math.random() * Math.min(3, validPlays.length))].cards;
                }
                const bestPlay = chosenPlay;
                
                let chosenColor = null;
                if (bestPlay[0].value === 'Wild' || bestPlay[0].value === 'Draw4') {
                    const colorCounts = { Red: 0, Blue: 0, Green: 0, Yellow: 0 };
                    p.hand.forEach(c => { if(c.color !== 'None') colorCounts[c.color]++ });
                    chosenColor = Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b);
                }

                playCards(p.id, bestPlay, chosenColor);
            } else {
                passTurn(p.id);
            }
            
        }, 1500); 

        return () => clearTimeout(timer);

    }, [currentPlayerIndex, gameStarted, topCard?.id, activeColor, stackedDrawCount, direction, botDifficulty]); 
}
