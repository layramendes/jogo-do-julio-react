import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../../data/gameData';

const ICONS = ['⚽', '🍎', '🧼', '🎮', '🍗', '💊', '💰', '❤️'];

const MemoryGame = ({ onFinish }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('ready');
    const timeoutRef = useRef(null);

    const initializeGame = () => {
        const gameCards = [...ICONS, ...ICONS]
            .sort(() => Math.random() - 0.5)
            .map((icon, index) => ({ id: index, icon, isFlipped: false }));
        setCards(gameCards);
        setFlipped([]);
        setMatched([]);
        setScore(0);
        setGameState('playing');
    };

    useEffect(() => {
        if (flipped.length === 2) {
            timeoutRef.current = setTimeout(checkMatch, 1000);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [flipped]);

    const handleCardClick = (cardId) => {
        if (flipped.length === 2 || matched.includes(cards[cardId].icon) || flipped.includes(cardId)) return;
        
        const newFlipped = [...flipped, cardId];
        setFlipped(newFlipped);
        soundManager.playSound('click');
    };

    const checkMatch = () => {
        const [first, second] = flipped;
        if (cards[first].icon === cards[second].icon) {
            setMatched([...matched, cards[first].icon]);
            setScore(score + 10);
            if (matched.length + 1 === ICONS.length) {
                setTimeout(() => setGameState('finished'), 500);
            }
        }
        setFlipped([]);
    };

    if (gameState === 'finished') {
        return (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 text-white p-4 text-center">
                <h2 className="text-3xl font-bold">Parabéns!</h2>
                <p className="text-xl mt-2">Você encontrou todos os pares!</p>
                <p className="text-lg mt-1">Você ganhou 💰 {score * 2} moedas!</p>
                <button onClick={() => onFinish(score)} className="mt-4 bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-600">
                    Voltar
                </button>
            </div>
        );
    }
    
    if (gameState === 'ready') {
        return (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 text-white p-4 text-center">
                <h2 className="text-3xl font-bold">Jogo da Memória</h2>
                <p className="text-xl mt-2">Encontre todos os pares de ícones para ganhar moedas!</p>
                <button onClick={initializeGame} className="mt-4 bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600">
                    Começar!
                </button>
                <button onClick={() => onFinish(0)} className="mt-2 bg-red-500 text-white font-bold py-1 px-4 rounded-lg hover:bg-red-600 text-sm">
                    Sair
                </button>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 p-4 flex flex-col">
            <div className="text-white font-bold text-xl flex justify-between items-center mb-4" style={{textShadow: '1px 1px 2px black'}}>
                <span>Pontos: {score}</span>
                <button onClick={() => onFinish(score)} className="bg-red-500/80 text-white font-bold py-1 px-3 rounded-lg text-sm">Sair</button>
            </div>
            <div className="grid grid-cols-4 gap-2 flex-grow">
                {cards.map((card, index) => (
                    <motion.div
                        key={index}
                        className="w-full h-full bg-amber-300 rounded-lg flex items-center justify-center text-4xl cursor-pointer"
                        onClick={() => handleCardClick(index)}
                        animate={{ rotateY: flipped.includes(index) || matched.includes(card.icon) ? 180 : 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <div style={{ transform: 'rotateY(180deg)', display: flipped.includes(index) || matched.includes(card.icon) ? 'block' : 'none' }}>
                            {card.icon}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MemoryGame;