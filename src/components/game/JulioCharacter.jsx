// src/components/game/JulioCharacter.jsx
import React from 'react';
import { motion } from 'framer-motion';
import julioImage from '../../assets/julio.png';
import { gameItems } from '../../data/gameData'; // Importar gameItems

// Componente para renderizar os acessórios
const Accessory = ({ itemId, category }) => {
    if (!itemId) return null;

    const accessory = gameItems[itemId];
    let style = {};

    // Estilos para posicionar cada tipo de acessório
    switch (category) {
        case 'hat':
            style = { top: '-5%', left: '50%', transform: 'translateX(-50%)', fontSize: '3rem' };
            break;
        case 'glasses':
            style = { top: '15%', left: '50%', transform: 'translateX(-50%)', fontSize: '2.5rem' };
            break;
        default:
            break;
    }

    return (
        <div className="absolute z-10 pointer-events-none" style={style}>
            {accessory.icon}
        </div>
    );
};


const JulioCharacter = ({ isSleeping, status, isPetting, onPetStart, onPetMove, customization }) => {
    const julioVariants = {
        awake: { scale: [1, 1.02, 1], rotate: [0, -1, 1, 0], transition: { scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" } } },
        sleeping: { scale: [1, 1.01, 1], rotate: 2, opacity: 0.7, transition: { scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }, duration: 2 } },
        sad: { rotate: [0, 1, -1, 0], opacity: 0.8, transition: { duration: 1, repeat: Infinity, ease: "easeInOut" } },
        petting: { scale: 1.05, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 10 } }
    };

    let animationState = 'awake';
    if (isPetting) { animationState = 'petting'; }
    else if (isSleeping) { animationState = 'sleeping'; }
    else if (status?.hunger < 30 || status?.fun < 30 || status?.hygiene < 30) { animationState = 'sad'; }

    return (
        <div className="relative w-48 h-48">
            <motion.img
                src={julioImage}
                alt="Julio"
                className="w-full h-full object-contain cursor-grab"
                variants={julioVariants}
                animate={animationState}
                onMouseDown={onPetStart}
                onMouseMove={onPetMove}
            />
            {/* Renderiza os acessórios */}
            <Accessory itemId={customization?.hat} category="hat" />
            <Accessory itemId={customization?.glasses} category="glasses" />
        </div>
    );
};

export default JulioCharacter;