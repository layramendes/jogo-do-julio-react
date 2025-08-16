// src/components/game/CatchTheBallGame.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { soundManager } from '../../data/gameData';

const CatchTheBallGame = ({ onFinish }) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [ballPosition, setBallPosition] = useState({ top: '50%', left: '50%' });
    const [gameState, setGameState] = useState('ready');

    useEffect(() => {
        if (gameState !== 'playing') return;
        if (timeLeft === 0) {
            setGameState('finished');
            return;
        }
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, gameState]);

    const moveBall = () => {
        setBallPosition({
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
        });
    };

    const handleBallClick = () => {
        if (gameState !== 'playing') return;
        soundManager.playSound('click');
        setScore(score + 1);
        moveBall();
    };

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setGameState('playing');
        moveBall();
    };

    if (gameState === 'finished') {
        return (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 text-white">
                <h2 className="text-3xl font-bold">Fim de Jogo!</h2>
                <p className="text-xl mt-2">A sua pontuação: {score}</p>
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
                <h2 className="text-3xl font-bold">Apanha a Bola!</h2>
                <p className="text-xl mt-2">Clique na bola o maior número de vezes que conseguir em 30 segundos.</p>
                <button onClick={startGame} className="mt-4 bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600">
                    Começar!
                </button>
                <button onClick={() => onFinish(0)} className="mt-2 bg-red-500 text-white font-bold py-1 px-4 rounded-lg hover:bg-red-600 text-sm">
                    Sair
                </button>
            </div>
        )
    }

    return (
        <div className="absolute inset-0 bg-black/20 z-50">
            <div className="p-4 text-white font-bold text-xl flex justify-between relative z-10" style={{textShadow: '1px 1px 2px black'}}>
                <span>Tempo: {timeLeft}</span>
                <button onClick={() => onFinish(0)} className="bg-red-500/80 text-white font-bold py-1 px-3 rounded-lg text-sm">Sair</button>
                <span>Pontos: {score}</span>
            </div>
            <motion.div
                className="absolute text-6xl cursor-pointer"
                style={{ top: ballPosition.top, left: ballPosition.left }}
                onClick={handleBallClick}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
            >
                ⚽
            </motion.div>
        </div>
    );
};

export default CatchTheBallGame;