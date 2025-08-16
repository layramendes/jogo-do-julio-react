// src/components/screens/Bedroom.jsx
import React from 'react';

const Bedroom = ({ playerState, updatePlayerState, onSleep, onToggleLight }) => {
    const { backgroundsOwned = [], customization, isLightOn, isSleeping } = playerState || {};
    
    const handleSetBackground = (bgClass) => {
        updatePlayerState({ 'customization.background': bgClass });
    };

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                    onClick={onToggleLight} 
                    className={`w-full font-bold py-3 px-4 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 ${isLightOn ? 'bg-yellow-400 hover:bg-yellow-500 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
                >
                    <span className="text-2xl">{isLightOn ? '💡' : '💡'}</span>
                    {isLightOn ? 'Apagar Luz' : 'Acender Luz'}
                </button>
                <button 
                    onClick={onSleep} 
                    className="w-full bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                     <span className="text-2xl">{isSleeping ? '☀️' : '🌙'}</span>
                    {isSleeping ? 'Acordar Julio' : 'Pôr a Dormir'}
                </button>
            </div>

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