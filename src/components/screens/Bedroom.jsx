// src/components/screens/Bedroom.jsx
import React from 'react';

const Bedroom = ({ playerState, updatePlayerState, onSleep }) => {
    const { backgroundsOwned = [], customization } = playerState || {};
    
    const handleSetBackground = (bgClass) => {
        updatePlayerState({ 'customization.background': bgClass });
    };

    return (
        <div>
            <button onClick={onSleep} className="w-full bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl mb-6 hover:bg-indigo-600 transition-colors shadow-lg">
                {playerState?.isSleeping ? 'Acordar Julio 🌙' : 'Pôr Julio a Dormir ☀️'}
            </button>
            <h3 className="text-lg font-semibold text-gray-600 mb-3">Mudar Fundo</h3>
            <div className="grid grid-cols-2 gap-3">
                {backgroundsOwned?.map(bg => (
                    <div
                        key={bg}
                        onClick={() => handleSetBackground(bg)}
                        className={`h-24 rounded-lg cursor-pointer border-4 ${customization?.background === bg ? 'border-amber-400' : 'border-transparent'} ${bg}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default Bedroom;